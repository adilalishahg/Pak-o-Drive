import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://pakodrive.pk';

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

