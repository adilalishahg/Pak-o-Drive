import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getBlogPostBySlug,
  getAllPublishedSlugs,
  getRelatedPosts,
  getArticleFeaturedProducts,
  getViralTwinCitiesProducts,
} from '@/lib/blog';
import { getStaticSiteUrl } from '@/lib/productSeo';
import { sanitizeBlogMarkdown, extractKeyTakeaways } from '@/lib/blogMarkdownSanitizer';
import { BlogPostTemplate } from '@/components/blog/BlogPostTemplate';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs('auto');
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  const siteUrl = getStaticSiteUrl();

  if (!post) {
    return {
      title: 'Auto Guide Not Found | Pak-o-Drive',
      description: 'The requested automotive guide could not be located.',
    };
  }

  const metaTitle = post.seoTitle || `${post.title} | Pak-o-Drive Auto Guides`;
  const metaDescription = post.seoDescription || post.excerpt;
  const canonicalUrl = `${siteUrl}/auto/${post.slug}`;
  const ogImage = post.coverImage || `${siteUrl}/img/carousel-1.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords:
      post.seoKeywords && post.seoKeywords.length > 0
        ? post.seoKeywords
        : [post.category, 'Pak-o-Drive', 'car accessories Pakistan', 'car maintenance'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: [post.author || 'Pak-o-Drive Automotive Specialist'],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

export default async function AutoGuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const siteUrl = getStaticSiteUrl();
  const canonicalUrl = `${siteUrl}/auto/${post.slug}`;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const readTime = post.readTimeMinutes || Math.max(3, Math.round(post.content.split(/\s+/).length / 200));

  const sanitizedContent = sanitizeBlogMarkdown(post.content);
  const takeaways = extractKeyTakeaways(sanitizedContent, 3);
  const relatedPosts = await getRelatedPosts(post.slug, post.category, 'auto', 5);

  const tocHeadings = (sanitizedContent.match(/^##\s+(.+)$/gm) || []).map((heading: string) => {
    const rawText = heading.replace(/^##\s+/, '').trim();
    const id = rawText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return { title: rawText, id };
  });

  const articleProducts = await getArticleFeaturedProducts(post.featuredProducts as any[], 4);
  const viralProducts = await getViralTwinCitiesProducts(8);
  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanPhone = rawPhone.replace(/\D/g, '') || '923185205667';

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${post.title} - Read this automotive guide on Pak-o-Drive: ${canonicalUrl}`
  )}`;

  return (
    <BlogPostTemplate
      post={post}
      hub="auto"
      canonicalUrl={canonicalUrl}
      relatedPosts={relatedPosts}
      articleProducts={articleProducts}
      viralProducts={viralProducts}
      cleanPhone={cleanPhone}
      sanitizedContent={sanitizedContent}
      takeaways={takeaways}
      readTime={readTime}
      formattedDate={formattedDate}
      tocHeadings={tocHeadings}
      whatsappShareUrl={whatsappShareUrl}
    />
  );
}
