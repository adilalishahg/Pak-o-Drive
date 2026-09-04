import dbConnect from './mongodb';
import BlogPost from '../models/BlogPost';
import Product from '../models/Product';
import { purgeCacheTags } from './cache';
import { generateMultiAiBlogDraft, generateSlug } from './multiAiBlogGenerator';
import {
  CURATED_AUTO_TOPICS,
  CURATED_GENERAL_TOPICS,
  generateFreshDynamicTopic,
  AutoTopic,
} from './autoBlogTopics';
import { resolveBlogCoverImage } from './blogImageResolver';
import { uploadBlogCoverToCloudinary } from './blogCloudinary';
import { sanitizeBlogMarkdown } from './blogMarkdownSanitizer';

export interface AutoBlogPublishResult {
  success: boolean;
  post?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    hub: 'auto' | 'general';
    wordCount: number;
    readTimeMinutes: number;
    providerUsed: string;
    linkedProductsCount: number;
  };
  error?: string;
}

const CATEGORY_DEFAULT_COVERS: Record<string, string> = {
  // Auto Hub Covers
  'Car Maintenance': '/img/header-img.jpg',
  'Seasonal Car Care': '/img/carousel-1.jpg',
  'Fuel Economy & Tuning': '/img/product-banner-2.jpg',
  'Smart Car Gadgets': '/img/product-banner.jpg',
  'Driving Safety & Rules': '/img/carousel-1.jpg',
  // General Hub Covers
  'Technology & AI': '/img/header-img.jpg',
  'Global & World': '/img/carousel-1.jpg',
  'Health & Wellness': '/img/product-banner-3.jpg',
  'Fashion & Lifestyle': '/img/product-banner.jpg',
  'Trending & Viral News': '/img/carousel-1.jpg',
};

/**
 * Autonomous AI Blog Publisher with Dual-Hub Alternating Logic
 * - Auto Hub: High-intent car maintenance, seasonal care & in-article COD store accessories.
 * - General Hub: High-CPC Technology, AI & global trends optimized for Google AdSense.
 */
export async function executeAutoBlogPost(
  forcedHub?: 'auto' | 'general'
): Promise<AutoBlogPublishResult> {
  await dbConnect();

  // 1. Fetch existing posts to track titles, slugs, and alternate hubs
  const existingPosts = await BlogPost.find({}, 'title slug category hub createdAt')
    .sort({ createdAt: -1 })
    .lean();
  const existingTitles = existingPosts.map((p: any) => p.title);
  const existingSlugs = new Set(existingPosts.map((p: any) => p.slug));

  // Determine active hub: use forcedHub if provided, otherwise alternate based on last post
  const lastHub = (existingPosts[0]?.hub as 'auto' | 'general') || 'general';
  const targetHub: 'auto' | 'general' = forcedHub || (lastHub === 'auto' ? 'general' : 'auto');

  // 2. Select next unique topic from the appropriate hub library
  let selectedTopic: AutoTopic | null = null;
  const pool = targetHub === 'auto' ? CURATED_AUTO_TOPICS : CURATED_GENERAL_TOPICS;

  const availableTopics = pool.filter((item) => {
    const candidateSlug = generateSlug(item.topic);
    return (
      !existingSlugs.has(candidateSlug) &&
      !existingTitles.some((t) => t.toLowerCase() === item.topic.toLowerCase())
    );
  });

  if (availableTopics.length > 0) {
    selectedTopic = availableTopics[0];
  }

  // If curated pool is exhausted, dynamically discover a fresh topic via AI
  if (!selectedTopic) {
    console.log(`[AutoBlog] Curated ${targetHub} topics exhausted. Generating fresh dynamic topic...`);
    selectedTopic = await generateFreshDynamicTopic(existingTitles, targetHub);
  }

  console.log(`[AutoBlog] Selected [${targetHub.toUpperCase()}] topic: "${selectedTopic.topic}" (${selectedTopic.category})`);

  // 3. Generate authoritative long-form guide via Multi-Model Waterfall
  const draft = await generateMultiAiBlogDraft(
    selectedTopic.topic,
    selectedTopic.keywords,
    selectedTopic.category
  );

  // Ensure unique slug
  let finalSlug = draft.slug ? generateSlug(draft.slug) : generateSlug(draft.title);
  if (existingSlugs.has(finalSlug)) {
    finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
  }

  // 4. Product matching: Auto Hub aggressively matches accessories, General Hub includes optional bestsellers
  let matchedProductIds: any[] = [];
  try {
    const searchTerms = [
      ...(draft.suggestedProductKeywords || []),
      ...(draft.tags || []),
      ...selectedTopic.keywords,
    ]
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 2)
      .slice(0, 8);

    if (searchTerms.length > 0) {
      const regexQueries = searchTerms.map((term) => ({
        name: { $regex: term, $options: 'i' },
      }));

      const products = await Product.find({ $or: regexQueries })
        .select('_id')
        .limit(6)
        .lean();

      matchedProductIds = products.map((p: any) => p._id);
    }

    // Fallback: match latest products if Auto Hub had zero regex matches
    if (matchedProductIds.length === 0 && targetHub === 'auto') {
      const fallbackProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .select('_id')
        .limit(3)
        .lean();
      matchedProductIds = fallbackProducts.map((p: any) => p._id);
    }
  } catch (err) {
    console.warn('[AutoBlog] Could not match store products:', err);
  }

  // 5. Create & Publish the Blog Post with Topic-Accurate High-Res Photography
  const wordCount = draft.content.split(/\s+/).length;
  const readTime = Math.max(3, Math.round(wordCount / 200));
  const categoryName = draft.category || selectedTopic.category || (targetHub === 'auto' ? 'Car Maintenance' : 'Technology & AI');
  const rawCoverImage = resolveBlogCoverImage(
    draft.title,
    categoryName,
    targetHub,
    [...(draft.tags || []), ...(draft.seoKeywords || []), ...selectedTopic.keywords]
  );

  // Upload to Cloudinary (WebP format, 16:9 crop, safe against Unsplash 404s)
  const coverImage = await uploadBlogCoverToCloudinary(rawCoverImage, finalSlug);
  const authorName = targetHub === 'auto' ? 'Pak-o-Drive Automotive Specialist' : 'Pak-o-Drive Global Trends';

  // Sanitize markdown to ensure 100% AdSense-compliant HTML table rendering
  const sanitizedContent = sanitizeBlogMarkdown(draft.content);

  const newPost = await BlogPost.create({
    title: draft.title.trim(),
    slug: finalSlug,
    excerpt: draft.excerpt?.trim() || draft.title.trim(),
    content: sanitizedContent,
    coverImage,
    author: authorName,
    category: categoryName,
    hub: targetHub,
    tags: Array.isArray(draft.tags) ? draft.tags : selectedTopic.keywords,
    isPublished: true,
    publishedAt: new Date(),
    seoTitle: draft.seoTitle || draft.title,
    seoDescription: draft.seoDescription || draft.excerpt,
    seoKeywords: Array.isArray(draft.seoKeywords) ? draft.seoKeywords : selectedTopic.keywords,
    faqs: Array.isArray(draft.faqs) ? draft.faqs : [],
    readTimeMinutes: readTime,
    featuredProducts: matchedProductIds,
  });

  // 6. Purge Next.js cache tags for instantaneous live visibility
  purgeCacheTags(['blog', 'auto', 'general', `blog-${finalSlug}`, `auto-${finalSlug}`, `general-${finalSlug}`]);

  console.log(
    `✅ [AutoBlog] Published [${targetHub.toUpperCase()}]: "${newPost.title}" (${wordCount} words) in "${categoryName}" via ${draft.providerUsed}`
  );

  return {
    success: true,
    post: {
      id: newPost._id.toString(),
      title: newPost.title,
      slug: newPost.slug,
      category: newPost.category,
      hub: targetHub,
      wordCount,
      readTimeMinutes: readTime,
      providerUsed: draft.providerUsed,
      linkedProductsCount: matchedProductIds.length,
    },
  };
}
