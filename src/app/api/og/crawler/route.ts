import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import BlogPost from '@/models/BlogPost';
import { getCachedSiteInfo } from '@/lib/cache';

export const runtime = 'nodejs';

/**
 * GET /api/og/crawler
 * 
 * Specialized lightweight HTML responder for Social Media Crawlers:
 * - WhatsApp Scraper (WhatsApp/2.xx)
 * - Facebook External Hit (facebookexternalhit/1.1)
 * - Twitterbot / LinkedInBot / TelegramBot / Slackbot / Discordbot
 * 
 * Problem Solved:
 * Next.js production builds inline 532KB of CSS into <head>, exceeding WhatsApp's 300KB limit.
 * This route responds with pure ~1.8KB semantic HTML where <meta property="og:image"> is at byte ~200,
 * guaranteeing instantaneous, 100% reliable rich preview card generation on WhatsApp with the Pak-o-Drive Logo.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const targetPath = req.headers.get('x-og-target-path') || searchParams.get('path') || '/';
  const siteUrl = process.env.NEXT_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || origin || 'https://www.pakodrive.pk';

  let title = "Pak-o-Drive™ (PakDrive) | Pakistan's #1 Car Accessories Store";
  let description = "Shop viral car accessories, LED headlights, ambient lighting & detailing products online in Pakistan with fast Cash on Delivery nationwide.";
  let ogCardUrl = `${siteUrl}/api/og/card?type=home`;
  let canonicalUrl = `${siteUrl}${targetPath}`;

  try {
    const siteInfo = await getCachedSiteInfo();
    if (siteInfo?.seoTitle) {
      title = siteInfo.seoTitle;
    }
    if (siteInfo?.seoDescription) {
      description = siteInfo.seoDescription;
    }

    // 1. PRODUCT PATH: /product/[slug] or /product/[id]
    if (targetPath.startsWith('/product/')) {
      const slugOrId = targetPath.replace('/product/', '').split('?')[0].split('/')[0];
      if (slugOrId) {
        await dbConnect();
        const product = await Product.findOne({
          $or: [{ slug: slugOrId }, { _id: slugOrId.match(/^[0-9a-fA-F]{24}$/) ? slugOrId : null }],
        }).select('name price description slug image isBundle').lean();

        if (product) {
          title = `${product.name} — Rs. ${product.price.toLocaleString()} | Pak-o-Drive Pakistan`;
          description = product.description
            ? `${product.description.slice(0, 150).replace(/[*#]/g, '')}... Cash on Delivery Available Across 250+ Pakistani Cities.`
            : `Order ${product.name} online for Rs. ${product.price.toLocaleString()} with 100% Cash on Delivery across Pakistan.`;
          ogCardUrl = `${siteUrl}/api/og/card?type=product&slug=${encodeURIComponent(product.slug || slugOrId)}`;
          canonicalUrl = `${siteUrl}/product/${product.slug || slugOrId}`;
        }
      }
    }
    // 2. AUTO OR BLOG PATH: /auto/[slug] or /blog/[slug]
    else if (targetPath.startsWith('/auto/') || targetPath.startsWith('/blog/')) {
      const isAuto = targetPath.startsWith('/auto/');
      const slug = targetPath.replace(isAuto ? '/auto/' : '/blog/', '').split('?')[0].split('/')[0];
      if (slug) {
        await dbConnect();
        const article = await BlogPost.findOne({ slug }).select('title excerpt coverImage category').lean();
        if (article) {
          title = `${article.title} | Pak-o-Drive Auto Journal`;
          description = article.excerpt || `Read in-depth automotive research and real-world vehicle guides on Pak-o-Drive.`;
          ogCardUrl = `${siteUrl}/api/og/card?type=${isAuto ? 'auto' : 'blog'}&slug=${encodeURIComponent(slug)}`;
          canonicalUrl = `${siteUrl}${targetPath}`;
        }
      }
    }
    // 3. SHOP OR CATALOG PATH: /shop
    else if (targetPath.startsWith('/shop')) {
      title = "Shop Genuine Car Accessories & Auto Gadgets | Pak-o-Drive";
      description = "Browse all viral automotive accessories, LED headlights, ambient lighting, car perfumes & detailing essentials. 100% Cash on Delivery nationwide.";
      ogCardUrl = `${siteUrl}/api/og/card?type=home`;
    }
  } catch (err) {
    console.warn('Crawler meta resolution warning:', err);
  }

  // Sanitize HTML attributes and strip newlines to prevent broken meta tag attributes
  const cleanTitle = title.replace(/[\r\n]+/g, ' ').trim();
  const cleanDesc = description.replace(/[\r\n]+/g, ' ').trim();
  const safeTitle = cleanTitle.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeDesc = cleanDesc.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Critical OpenGraph Meta for WhatsApp, Facebook, LinkedIn & Social Bots (Byte < 400) -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Pak-o-Drive" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${ogCardUrl}" />
  <meta property="og:image:secure_url" content="${ogCardUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:locale" content="en_PK" />

  <!-- Twitter / X Meta -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@pakodrive" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${ogCardUrl}" />

  <!-- Unhashed Static Favicons for Googlebot-Image & Browsers -->
  <link rel="icon" type="image/x-icon" href="${siteUrl}/favicon.ico" />
  <link rel="icon" type="image/png" sizes="48x48" href="${siteUrl}/icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="96x96" href="${siteUrl}/icon-96x96.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="${siteUrl}/icon-192x192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="${siteUrl}/apple-icon.png" />
</head>
<body style="font-family:sans-serif;padding:30px;background:#0a0f1d;color:#ffffff;text-align:center;">
  <div style="max-width:600px;margin:0 auto;">
    <h1>${safeTitle}</h1>
    <p style="color:#94a3b8;line-height:1.5;">${safeDesc}</p>
    <div style="margin:20px 0;">
      <img src="${ogCardUrl}" alt="${safeTitle}" style="max-width:100%;border-radius:12px;border:1px solid #334155;" />
    </div>
    <p><a href="${canonicalUrl}" style="color:#ea580c;font-weight:bold;text-decoration:none;">View on Pak-o-Drive &rarr;</a></p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
      'X-Robots-Tag': 'all',
    },
  });
}
