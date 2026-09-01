import { MetadataRoute } from 'next';
import dbConnect from '../lib/mongodb';
import Product from '../models/Product';
import Category from '../models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://pakodrive.pk';

  // Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/cart',
    '/checkout',
    '/contact',
    '/about',
    '/track-order',
    '/privacy-policy',
    '/terms',
    '/shipping-policy',
    '/return-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic product & category routes
  let productRoutes: any[] = [];
  let categoryRoutes: any[] = [];

  try {
    await dbConnect();
    const [products, categories] = await Promise.all([
      Product.find({}, '_id slug updatedAt').lean(),
      Category.find({}, 'slug updatedAt').lean(),
    ]);

    productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug || product._id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    categoryRoutes = categories.map((cat: any) => ({
      url: `${baseUrl}/shop?category=${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

