import { NextResponse } from 'next/server';
import { getCachedAllProducts, getCachedSiteInfo } from '../../../../lib/cache';

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://pakodrive.com';
    const [products, siteInfo] = await Promise.all([
      getCachedAllProducts(),
      getCachedSiteInfo(),
    ]);

    const storeName = siteInfo?.siteName || 'PAKODRIVE';
    const storeDesc = siteInfo?.seoDescription || "Pakistan's Trusted Electronics & Gadgets Store";

    const escapeXml = (unsafe: string) => {
      return (unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const itemsXml = (products || []).map((p: any) => {
      const productUrl = `${siteUrl}/product/${p._id}`;
      const imageUrl = p.image?.startsWith('http') ? p.image : `${siteUrl}${p.image}`;
      const availability = p.stock !== 0 ? 'in_stock' : 'out_of_stock';
      const brand = p.specifications?.Brand || storeName;

      return `
    <item>
      <g:id>${escapeXml(p._id)}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(p.description || p.name)}</description>
      <link>${escapeXml(productUrl)}</link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} PKR</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:product_type>${escapeXml(p.category)}</g:product_type>
      <g:shipping>
        <g:country>PK</g:country>
        <g:service>Standard Nationwide Delivery</g:service>
        <g:price>0 PKR</g:price>
      </g:shipping>
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(storeName)} - Google Merchant Center Product Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(storeDesc)}</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating Google Merchant XML feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
