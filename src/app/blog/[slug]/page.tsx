import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { getBlogPostBySlug, getAllPublishedSlugs } from '@/lib/blog';
import { getStaticSiteUrl } from '@/lib/productSeo';
import { AdSenseSlot } from '@/components/blog/AdSenseSlot';
import {
  Calendar,
  User,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Tag,
  ExternalLink,
  Clock,
  HelpCircle,
  List,
  MessageCircle,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
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
      title: 'Article Not Found | Pak-o-Drive',
      description: 'The requested automotive guide could not be located.',
    };
  }

  const metaTitle = post.seoTitle || `${post.title} | Pak-o-Drive Guides`;
  const metaDescription = post.seoDescription || post.excerpt;
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.coverImage || `${siteUrl}/img/carousel-1.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords:
      post.seoKeywords && post.seoKeywords.length > 0
        ? post.seoKeywords
        : [post.category, 'Pak-o-Drive', 'car accessories Pakistan', 'car care tips'],
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
      authors: [post.author || 'Pak-o-Drive Editorial'],
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

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const siteUrl = getStaticSiteUrl();
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
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
    // Match rehype-slug kebab conversion
    const id = rawText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return { title: rawText, id };
  });

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
    image: post.coverImage ? [post.coverImage] : [`${siteUrl}/img/carousel-1.jpg`],
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: post.author || 'Pak-o-Drive Automotive Specialist',
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
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  // Structured Data: FAQPage (Essential for Google Rich Snippets)
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

  const featuredProducts = (post.featuredProducts as any[]) || [];
  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanPhone = rawPhone.replace(/\D/g, '') || '923185205667';

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${post.title} - Read this automotive guide on Pak-o-Drive: ${canonicalUrl}`
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
              <Link href="/" className="hover:text-orange-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-orange-600 transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-slate-800 truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
            </nav>

            {/* Category Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-4">
              <Tag className="w-3 h-3" />
              {post.category || 'Automotive Advice'}
            </div>

            {/* Article H1 Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-normal py-0.5 mb-6">
              {post.title}
            </h1>

            {/* Metadata Bar (Author, Date, Read Time, Back Link) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">{post.author || 'Pak-o-Drive Editorial'}</span>
                    <span className="text-[11px] text-slate-400">Automotive Specialist</span>
                  </div>
                </div>

                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>

                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-orange-600 font-medium">
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
                  title="Share guide on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </a>

                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Articles
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Article Body Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Cover Image Presentation */}
          {post.coverImage && (
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 aspect-[16/9] mb-8">
              {/* Layer 1: Ambient Blur Backdrop */}
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                priority
                aria-hidden="true"
              />
              {/* Layer 2: Main Image */}
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Top AdSense Header Slot */}
          <AdSenseSlot
            slotId="auto-top-header"
            format="horizontal"
            slotLabel="Google AdSense Responsive Header Banner (Leaderboard)"
          />

          {/* Table of Contents (TOC) Component */}
          {tocHeadings.length >= 2 && (
            <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                <List className="w-4 h-4 text-orange-600" />
                <span>Table of Contents</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {tocHeadings.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-orange-500 font-semibold">{i + 1}.</span>
                    <a
                      href={`#${h.id}`}
                      className="hover:text-orange-600 hover:underline transition-colors"
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
            <div className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-table:text-xs prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-2.5 prose-td:p-2.5 prose-img:rounded-xl prose-img:shadow-md max-w-none">
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
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </main>

          {/* Mid-Article In-Content AdSense Slot */}
          <AdSenseSlot
            slotId="auto-in-article"
            format="fluid"
            slotLabel="Google AdSense In-Article Responsive Banner (High CTR)"
          />

          {/* Frequently Asked Questions (Interactive Accordions) */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="my-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Frequently Asked Questions
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Common questions Pakistani motorists ask regarding this guide.
              </p>

              <div className="space-y-3">
                {post.faqs.map((faq: any, idx: number) => (
                  <details
                    key={idx}
                    className="group border border-slate-200 rounded-xl p-4 open:border-orange-300 open:bg-orange-50/20 transition-all"
                  >
                    <summary className="font-bold text-sm text-slate-800 cursor-pointer list-none flex items-center justify-between gap-2">
                      <span className="group-hover:text-orange-600 transition-colors">
                        {faq.question}
                      </span>
                      <span className="text-orange-500 font-bold group-open:rotate-180 transition-transform text-sm">
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

          {/* WhatsApp Expert Inquiry Consultation Banner */}
          <div className="my-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white shadow-md border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold">Confused about your vehicle fitment?</h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Talk with our automotive accessories specialist directly on WhatsApp. 100% Cash on Delivery across Pakistan.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${cleanPhone}?text=Salam%20Pak-o-Drive,%20I%20need%20advice%20regarding%20car%20accessories`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition-all shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* In-Article Product Recommendations (Monetization Engine) */}
          {featuredProducts.length > 0 && (
            <section className="mt-10 bg-white rounded-2xl p-6 sm:p-8 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Recommended Car Gear
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-normal py-0.5">
                    Featured Products In This Guide
                  </h3>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  View All Shop <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredProducts.map((prod: any) => {
                  const prodImage =
                    prod.image ||
                    (prod.images && prod.images[0]) ||
                    '/img/placeholder-product.png';

                  return (
                    <div
                      key={prod._id || prod.slug}
                      className="group border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-orange-500 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div>
                        {/* Product Thumbnail */}
                        <Link
                          href={`/product/${prod.slug || prod._id}`}
                          className="relative block aspect-square w-full rounded-lg overflow-hidden bg-slate-100 mb-3"
                        >
                          <Image
                            src={prodImage}
                            alt={prod.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Title */}
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-normal py-0.5 group-hover:text-orange-600 transition-colors">
                          <Link href={`/product/${prod.slug || prod._id}`}>
                            {prod.name}
                          </Link>
                        </h4>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-slate-400 block font-medium">Cash On Delivery</span>
                          <span className="text-base font-extrabold text-orange-600">
                            Rs. {Number(prod.price || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                              `Salam Pak-o-Drive, I want to order "${prod.name}" (Rs. ${Number(prod.price || 0).toLocaleString()}) via Cash On Delivery from this guide: ${canonicalUrl}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all text-center"
                            title="1-Click WhatsApp Order"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                          <Link
                            href={`/product/${prod.slug || prod._id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all text-center"
                          >
                            Order COD
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Genuine Automotive Accessories • 100% Checking Warranty • Free Delivery on 2+ items</span>
              </div>
            </section>
          )}

          {/* Bottom High-Impact AdSense Slot */}
          <AdSenseSlot
            slotId="auto-bottom-banner"
            format="rectangle"
            slotLabel="Google AdSense High-Impact Rectangle / Multiplex Banner"
          />
        </div>
      </article>
    </>
  );
}
