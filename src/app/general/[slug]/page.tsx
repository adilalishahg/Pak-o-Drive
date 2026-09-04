import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { getBlogPostBySlug, getAllPublishedSlugs, getRelatedPosts } from '@/lib/blog';
import { getStaticSiteUrl } from '@/lib/productSeo';
import { AdSenseSlot } from '@/components/blog/AdSenseSlot';
import {
  Calendar,
  User,
  ArrowLeft,
  Tag,
  Clock,
  HelpCircle,
  List,
  Share2,
  Globe,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs('general');
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
      title: 'Insight Not Found | Pak-o-Drive',
      description: 'The requested technology article could not be located.',
    };
  }

  const metaTitle = post.seoTitle || `${post.title} | Pak-o-Drive Insights`;
  const metaDescription = post.seoDescription || post.excerpt;
  const canonicalUrl = `${siteUrl}/general/${post.slug}`;
  const ogImage = post.coverImage || `${siteUrl}/img/header-img.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords:
      post.seoKeywords && post.seoKeywords.length > 0
        ? post.seoKeywords
        : [post.category, 'Technology', 'Artificial Intelligence', 'Global Trends'],
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
      authors: [post.author || 'Pak-o-Drive Global Insights'],
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

export default async function GeneralTrendDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const siteUrl = getStaticSiteUrl();
  const canonicalUrl = `${siteUrl}/general/${post.slug}`;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently Published';

  const readTime = post.readTimeMinutes || Math.max(3, Math.round(post.content.split(/\s+/).length / 200));

  // Extract Table of Contents from H2 Headings
  const tocHeadings = (post.content.match(/^##\s+(.+)$/gm) || []).map((heading: string) => {
    const rawText = heading.replace(/^##\s+/, '').trim();
    const id = rawText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return { title: rawText, id };
  });

  // Fetch related general posts
  const relatedPosts = await getRelatedPosts(post.slug, post.category, 'general', 3);

  // Structured Data: Schema.org BlogPosting
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : [`${siteUrl}/img/header-img.jpg`],
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: post.author || 'Pak-o-Drive Global Trends',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pak-o-Drive',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.png`,
      },
    },
    keywords: post.tags?.join(', ') || post.category,
  };

  // Structured Data: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Insights & Trends',
        item: `${siteUrl}/general`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  // Structured Data: FAQPage
  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${post.title} - Read this insight on Pak-o-Drive: ${canonicalUrl}`
  )}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="min-h-screen bg-slate-50 text-slate-800 pb-20">
        {/* Top Header & Breadcrumb Container */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/general" className="hover:text-indigo-600 transition-colors font-medium">
                Insights & Trends
              </Link>
              <span>/</span>
              <span className="text-slate-800 truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
            </nav>

            {/* Category Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-4">
              <Globe className="w-3 h-3" />
              {post.category || 'Technology & AI'}
            </div>

            {/* Article H1 Title - Rule 4 Guard */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-normal py-0.5 mb-6">
              {post.title}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">{post.author || 'Pak-o-Drive Insights'}</span>
                    <span className="text-[11px] text-slate-400">Research & Technology Editor</span>
                  </div>
                </div>

                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>

                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{readTime} min read</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors border border-emerald-200"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </a>

                <Link
                  href="/general"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Trends
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Article Body Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Cover Image Presentation - Rule 3 Dual Layer */}
          {post.coverImage && (
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950 aspect-[16/9] mb-8">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                priority
                aria-hidden="true"
              />
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Top High-Impact AdSense Leaderboard */}
          <AdSenseSlot
            slotId="general-top-leaderboard"
            format="horizontal"
            slotLabel="Google AdSense Responsive Header Banner (High CPM)"
          />

          {/* Table of Contents */}
          {tocHeadings.length >= 2 && (
            <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                <List className="w-4 h-4 text-indigo-600" />
                <span>Table of Contents</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {tocHeadings.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-indigo-500 font-semibold">{i + 1}.</span>
                    <a
                      href={`#${h.id}`}
                      className="hover:text-indigo-600 hover:underline transition-colors"
                    >
                      {h.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Markdown Body */}
          <main className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
            <div className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-table:text-xs prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-2.5 prose-td:p-2.5 prose-img:rounded-xl prose-img:shadow-md max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags Footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </main>

          {/* Mid-Article In-Content AdSense Slot */}
          <AdSenseSlot
            slotId="general-in-article"
            format="fluid"
            slotLabel="Google AdSense In-Article Responsive Banner (High CTR)"
          />

          {/* Frequently Asked Questions */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="my-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Frequently Asked Questions
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Direct answers to common questions regarding this topic.
              </p>

              <div className="space-y-3">
                {post.faqs.map((faq: any, idx: number) => (
                  <details
                    key={idx}
                    className="group border border-slate-200 rounded-xl p-4 open:border-indigo-300 open:bg-indigo-50/20 transition-all"
                  >
                    <summary className="font-bold text-sm text-slate-800 cursor-pointer list-none flex items-center justify-between gap-2">
                      <span className="group-hover:text-indigo-600 transition-colors">
                        {faq.question}
                      </span>
                      <span className="text-indigo-500 font-bold group-open:rotate-180 transition-transform text-sm">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-3 text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Multiplex AdSense Slot */}
          <AdSenseSlot
            slotId="general-bottom-multiplex"
            format="rectangle"
            slotLabel="Google AdSense Bottom Multiplex Ad Unit"
          />

          {/* Related General Insights Section */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Related Insights & Trends
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Discover more articles from our modern technology editorial hub.
                  </p>
                </div>
                <Link
                  href="/general"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  All Trends <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/general/${rel.slug}`}
                    className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 mb-1.5 block">
                        {rel.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-normal py-0.5">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{rel.readTimeMinutes || 5} min read</span>
                      <span className="text-indigo-600 font-medium group-hover:underline">Read Insight →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
