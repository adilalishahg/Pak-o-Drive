import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getStaticSiteUrl } from '@/lib/productSeo';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanDescription(desc?: string): string {
  if (!desc) return 'Quality auto accessories and smart gadgets with Cash on Delivery across Pakistan from Pak-o-Drive.';
  return desc
    .replace(/[*#_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);
}

export async function GET() {
  try {
    await dbConnect();
    const siteUrl = getStaticSiteUrl();

    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    const itemsXml = products
      .map((p: any) => {
        const id = p._id?.toString() || '';
        const title = escapeXml(p.name || 'Pak-o-Drive Product');
        const link = `${siteUrl}/product/${id}`;
        const description = escapeXml(cleanDescription(p.description));
        const imageLink = p.image || `${siteUrl}/icon.png`;
        const availability = p.stock === 0 ? 'out_of_stock' : 'in_stock';
        const price = `${Number(p.price || 0).toFixed(2)} PKR`;
        const brand = escapeXml((p.specifications && p.specifications['Brand']) || 'Pak-o-Drive');
        const category = escapeXml(p.category || 'car-accessories');

        return `    <item>
      <g:id>PAK-${id.slice(-8).toUpperCase()}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${brand}</g:brand>
      <g:google_product_category>Vehicles &amp; Parts &gt; Vehicle Parts &amp; Accessories</g:google_product_category>
      <g:product_type>${category}</g:product_type>
      <g:shipping>
        <g:country>PK</g:country>
        <g:service>Standard Courier Cash on Delivery</g:service>
        <g:price>200.00 PKR</g:price>
      </g:shipping>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Pak-o-Drive — Pakistan's Premier Auto Accessories &amp; Smart Gadgets</title>
    <link>${siteUrl}</link>
    <description>Shop premium car accessories, car care detailing, and viral smart tech with doorstep Cash on Delivery across Pakistan.</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error generating Google Merchant Feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
