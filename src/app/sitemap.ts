import { MetadataRoute } from 'next';
import dbConnect from '../lib/mongodb';
import Product from '../models/Product';
import Category from '../models/Category';
import BlogPost from '../models/BlogPost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const baseUrl = envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')
    ? envUrl
    : 'https://www.pakodrive.pk';

  // Static public indexed routes (Excluding transactional cart & checkout)
  const staticRoutes = [
    '',
    '/shop',
    '/auto',
    '/general',
    '/blog',
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
    priority: route === '' ? 1.0 : (route === '/auto' ? 0.9 : 0.8),
  }));

  // Dynamic product, category & blog routes
  let productRoutes: any[] = [];
  let categoryRoutes: any[] = [];
  let blogRoutes: any[] = [];

  try {
    await dbConnect();
    const [products, categories, posts] = await Promise.all([
      Product.find({}, '_id slug updatedAt').lean(),
      Category.find({}, 'slug updatedAt').lean(),
      BlogPost.find({ isPublished: true }, 'slug hub updatedAt').lean(),
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

    blogRoutes = posts.map((post: any) => {
      const hubPrefix = post.hub === 'general' ? 'general' : 'auto';
      return {
        url: `${baseUrl}/${hubPrefix}/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: post.hub === 'auto' ? 0.85 : 0.75,
      };
    });
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}

