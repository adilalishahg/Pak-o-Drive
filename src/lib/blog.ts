import { unstable_cache } from 'next/cache';
import dbConnect from './mongodb';
import BlogPost from '../models/BlogPost';
// Ensure Product model is registered in Mongoose for population
import '../models/Product';
import { IBlogPost, IBlogListResult } from '../types/blog';

/**
 * Fetch paginated published blog posts for the blog archive.
 * Supports filtering by hub ('auto' | 'general' | 'all').
 * Tagged for on-demand revalidation when blog articles are created or edited.
 */
export async function getPublishedPosts(
  limit: number = 10,
  page: number = 1,
  hub: 'auto' | 'general' | 'all' = 'all'
): Promise<IBlogListResult> {
  const fetcher = unstable_cache(
    async (lim: number, pg: number, h: string) => {
      try {
        await dbConnect();
        const skip = Math.max(0, (pg - 1) * lim);
        const query: any = { isPublished: true };
        if (h && h !== 'all') {
          query.hub = h;
        }

        const [postsDocs, total] = await Promise.all([
          BlogPost.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(lim)
            .select('-content') // Omit full markdown body in listings for speed
            .lean(),
          BlogPost.countDocuments(query),
        ]);

        const posts: IBlogPost[] = JSON.parse(JSON.stringify(postsDocs));
        const totalPages = Math.ceil(total / lim) || 1;

        return {
          posts,
          total,
          page: pg,
          totalPages,
          hub: h as any,
        };
      } catch (error) {
        console.error('Error in getPublishedPosts:', error);
        return {
          posts: [],
          total: 0,
          page: pg,
          totalPages: 1,
          hub: h as any,
        };
      }
    },
    [`blog-list-h${hub}-p${page}-l${limit}`],
    {
      revalidate: 600,
      tags: ['blog', hub !== 'all' ? hub : 'all'],
    }
  );

  return fetcher(limit, page, hub);
}

/**
 * Fetch a single published blog post by its unique URL slug.
 * Populates linked featured products for in-article monetization.
 */
export async function getBlogPostBySlug(slug: string): Promise<IBlogPost | null> {
  if (!slug) return null;

  const normalizedSlug = slug.toLowerCase().trim();

  const fetcher = unstable_cache(
    async (s: string) => {
      try {
        await dbConnect();
        const post = await BlogPost.findOne({ slug: s, isPublished: true })
          .populate({
            path: 'featuredProducts',
            select: 'name slug price originalPrice images image stock rating reviewsCount category',
          })
          .lean();

        if (!post) return null;
        return JSON.parse(JSON.stringify(post)) as IBlogPost;
      } catch (error) {
        console.error(`Error in getBlogPostBySlug for "${s}":`, error);
        return null;
      }
    },
    [`blog-post-${normalizedSlug}`],
    {
      revalidate: 600,
      tags: ['blog', `blog-${normalizedSlug}`],
    }
  );

  const cached = await fetcher(normalizedSlug);
  if (cached) return cached;

  // Direct DB lookup fallback (prevents stale null cache for newly generated articles)
  try {
    await dbConnect();
    const freshPost = await BlogPost.findOne({ slug: normalizedSlug, isPublished: true })
      .populate({
        path: 'featuredProducts',
        select: 'name slug price originalPrice images image stock rating reviewsCount category',
      })
      .lean();
    if (freshPost) return JSON.parse(JSON.stringify(freshPost)) as IBlogPost;
  } catch (err) {
    console.error(`Direct DB fallback error for "${normalizedSlug}":`, err);
  }

  return null;
}

/**
 * Fetch related blog posts by category or same hub to reduce bounce rate.
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  hub?: 'auto' | 'general',
  limit: number = 3
): Promise<IBlogPost[]> {
  const fetcher = unstable_cache(
    async (s: string, cat: string, h: string, lim: number) => {
      try {
        await dbConnect();
        const query: any = {
          slug: { $ne: s },
          isPublished: true,
        };

        if (h) {
          query.hub = h;
        }

        // Try to find in same category first
        let relatedDocs = await BlogPost.find({ ...query, category: cat })
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(lim)
          .select('title slug excerpt coverImage author category hub readTimeMinutes publishedAt')
          .lean();

        // If not enough, fill with other posts from same hub
        if (relatedDocs.length < lim) {
          const excludeSlugs = [s, ...relatedDocs.map((d: any) => d.slug)];
          const fillDocs = await BlogPost.find({
            ...query,
            slug: { $nin: excludeSlugs },
          })
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(lim - relatedDocs.length)
            .select('title slug excerpt coverImage author category hub readTimeMinutes publishedAt')
            .lean();

          relatedDocs = [...relatedDocs, ...fillDocs];
        }

        return JSON.parse(JSON.stringify(relatedDocs)) as IBlogPost[];
      } catch (error) {
        console.error('Error in getRelatedPosts:', error);
        return [];
      }
    },
    [`related-posts-${currentSlug}-${category}-${hub || 'all'}`],
    {
      revalidate: 600,
      tags: ['blog'],
    }
  );

  return fetcher(currentSlug, category, hub || '', limit);
}

/**
 * Fast slug retrieval for Next.js generateStaticParams SSG pre-rendering.
 */
export async function getAllPublishedSlugs(hub?: 'auto' | 'general'): Promise<{ slug: string; hub?: string }[]> {
  const fetcher = unstable_cache(
    async (h: string) => {
      try {
        await dbConnect();
        const query: any = { isPublished: true };
        if (h) query.hub = h;

        const slugs = await BlogPost.find(query, 'slug hub').lean();
        return slugs.map((item: any) => ({ slug: item.slug, hub: item.hub }));
      } catch (error) {
        console.error('Error fetching all published slugs:', error);
        return [];
      }
    },
    [`blog-published-slugs-${hub || 'all'}`],
    {
      revalidate: 600,
      tags: ['blog'],
    }
  );

  return fetcher(hub || '');
}
