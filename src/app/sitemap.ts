import { MetadataRoute } from 'next';
import dbConnect from '../lib/mongodb';
import Product from '../models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pakodrive.com';

  // Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/cart',
    '/checkout',
    '/contact',
    '/about',
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

  // Dynamic product routes
  let productRoutes: any[] = [];
  try {
    await dbConnect();
    const products = await Product.find({}, '_id updatedAt').lean();
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product._id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating dynamic sitemap product routes:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
