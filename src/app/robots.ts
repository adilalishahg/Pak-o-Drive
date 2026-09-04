import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const baseUrl = envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')
    ? envUrl
    : 'https://www.pakodrive.pk';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api',
        '/api/*',
        '/checkout',
        '/checkout/*',
        '/cart',
        '/cart/*',
        '/order-confirmation',
        '/order-confirmation/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

