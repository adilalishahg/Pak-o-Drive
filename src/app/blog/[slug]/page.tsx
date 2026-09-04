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
import { ArticleShareBar } from '@/components/blog/ArticleShareBar';
import { sanitizeBlogMarkdown, extractKeyTakeaways } from '@/lib/blogMarkdownSanitizer';
import { BlogNewsletterBox } from '@/components/blog/BlogNewsletterBox';
import {
  Calendar,
  User,
  ShoppingBag,
  ShieldCheck,
  Tag,
  ExternalLink,
  Clock,
  HelpCircle,
  List,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Sparkles,
  Truck,
  Quote,
  MessageSquare,
  Send,
} from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon } from '@/components/blog/SocialIcons';

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
      description: 'The requested guide could not be located.',
    };
  }

  const metaTitle = post.seoTitle || `${post.title} | Pak-o-Drive Journal`;
  const metaDescription = post.seoDescription || post.excerpt;
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.coverImage || `${siteUrl}/img/carousel-1.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords:
      post.seoKeywords && post.seoKeywords.length > 0
        ? post.seoKeywords
        : [post.category, 'Pak-o-Drive', 'car accessories Pakistan', 'tech trends'],
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
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const readTime = post.readTimeMinutes || Math.max(3, Math.round(post.content.split(/\s+/).length / 200));

  // Sanitize markdown content
  const sanitizedContent = sanitizeBlogMarkdown(post.content);
  const takeaways = extractKeyTakeaways(sanitizedContent, 3);

  // Fetch related guides for sidebar and bottom
  const relatedPosts = await getRelatedPosts(post.slug, post.category, post.hub, 5);

  // Extract Table of Contents from H2 Headings
  const tocHeadings = (sanitizedContent.match(/^##\s+(.+)$/gm) || []).map((heading: string) => {
    const rawText = heading.replace(/^##\s+/, '').trim();
    const id = rawText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return { title: rawText, id };
  });

  const featuredProducts = (post.featuredProducts as any[]) || [];
  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanPhone = rawPhone.replace(/\D/g, '') || '923185205667';

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${post.title} - Read this guide on Pak-o-Drive: ${canonicalUrl}`
  )}`;

  return (
    <article className="min-h-screen bg-white text-slate-800 pb-20">
      {/* ── 1. Modern Trending Editorial Hero Section ────────── */}
      <header className="relative bg-gradient-to-b from-slate-50/90 via-rose-50/20 to-white border-b border-slate-200/80 pt-8 sm:pt-12 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs">
            <Link href="/" className="hover:text-rose-500 transition-colors text-decoration-none">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/blog" className="hover:text-rose-500 transition-colors text-decoration-none">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{post.category || 'Tech & AI'}</span>
          </nav>

          {/* Category Pill & Reading Time */}
          <div className="flex items-center justify-center flex-wrap gap-2.5 mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {post.category || 'Featured Article'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {readTime} min read
            </span>
          </div>

          {/* Primary Article H1 Title (Rule 4: Typography Clipping Prevention) */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-extrabold text-slate-900 tracking-tight leading-[1.22] py-0.5 mb-4 max-w-4xl mx-auto">
            {post.title}
          </h1>

          {/* Article Excerpt / Subtitle Deck */}
          {post.excerpt && (
            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto mb-6">
              {post.excerpt}
            </p>
          )}

          {/* Author Byline & Social Actions Bar */}
          <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-amber-500 shadow-xs shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {post.author ? post.author.slice(0, 2).toUpperCase() : 'PO'}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                  <span>{post.author || 'Pak-o-Drive Editorial'}</span>
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span>Pak-o-Drive Research Desk</span>
                </div>
              </div>
            </div>

            {/* Share Bar */}
            <ArticleShareBar
              title={post.title}
              url={canonicalUrl}
              whatsappShareUrl={whatsappShareUrl}
            />
          </div>
        </div>
      </header>

      {/* ── 2. Main 2-Column Editorial Grid ────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* ── Left / Main Content Column (~68%) ────────────────── */}
          <div className="lg:col-span-8 min-w-0 space-y-8">
            {/* Panoramic Full-Bleed Cover Image with Dual-Layer Presentation (Rule 3) */}
            {post.coverImage && (
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-950 group">
                {/* Layer 1: Ambient Blur Backdrop */}
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 800px"
                  className="object-cover object-center w-full h-full blur-2xl opacity-40 scale-110 pointer-events-none"
                  priority
                />
                {/* Layer 2: Main Image Unclipped */}
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 800px"
                  className="object-cover object-center w-full h-full relative z-10 transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            )}

            {/* Executive Briefing / Key Takeaways Callout */}
            {takeaways.length > 0 && (
              <div className="p-6 rounded-xl bg-[#fafafa] border-l-4 border-rose-500 border-y border-r border-slate-200/70 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Executive Briefing & Key Highlights</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed m-0 p-0 list-none">
                  {takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AdSense Top Slot */}
            <AdSenseSlot
              slotId="auto-top-header"
              format="horizontal"
              slotLabel="Google AdSense Top Header Banner"
            />

            {/* Main Markdown Body with Custom Components */}
            <div className="prose prose-slate prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-rose-500 hover:prose-a:text-rose-600 max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  table: ({ node, ...props }: any) => (
                    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse m-0" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }: any) => (
                    <thead className="bg-[#f8f9fa] text-slate-900 font-bold border-b border-slate-200" {...props} />
                  ),
                  th: ({ node, ...props }: any) => (
                    <th className="px-4 py-3 font-semibold text-slate-900 tracking-tight" {...props} />
                  ),
                  td: ({ node, ...props }: any) => (
                    <td className="px-4 py-3 border-t border-slate-100 text-slate-700" {...props} />
                  ),
                  blockquote: ({ node, ...props }: any) => (
                    <div className="my-8 p-6 rounded-xl bg-[#fff7f7] border-l-4 border-rose-500 relative">
                      <Quote className="w-8 h-8 text-rose-200 absolute top-4 right-4 pointer-events-none" />
                      <blockquote className="font-serif italic text-base sm:text-lg text-slate-800 m-0 not-italic border-none p-0" {...props} />
                    </div>
                  ),
                }}
              >
                {sanitizedContent}
              </ReactMarkdown>
            </div>

            {/* Article Tags Cloud (Matching Reference) */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-3 py-1 rounded-md bg-[#f8f9fa] hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 transition-colors text-decoration-none"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Profile Card (Modern Trending Editorial Design) */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 via-white to-rose-50/20 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-amber-500 shadow-sm shrink-0">
                <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                  {post.author ? post.author.slice(0, 2).toUpperCase() : 'PO'}
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900">{post.author || 'Pak-o-Drive Editorial'}</h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Specialist
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Senior automotive and technology analyst at Pak-o-Drive. Dedicated to rigorous real-world testing, independent maintenance teardowns, and authentic consumer hardware reviews.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3.5 text-slate-400">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-3 h-3" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
                    aria-label="Twitter"
                  >
                    <TwitterIcon className="w-3 h-3" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Mid-Article In-Content AdSense Slot */}
            <AdSenseSlot
              slotId="auto-in-article"
              format="fluid"
              slotLabel="Google AdSense Responsive In-Article Banner"
            />

            {/* Interactive FAQs Accordion */}
            {post.faqs && post.faqs.length > 0 && (
              <section className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-3 mt-4">
                  {post.faqs.map((faq: any, idx: number) => (
                    <details
                      key={idx}
                      className="group border border-slate-200 rounded-lg p-4 open:border-rose-300 open:bg-rose-50/20 transition-all"
                    >
                      <summary className="font-semibold text-xs sm:text-sm text-slate-800 cursor-pointer list-none flex items-center justify-between gap-3">
                        <span className="group-hover:text-rose-600 transition-colors">
                          {faq.question}
                        </span>
                        <span className="text-rose-500 font-bold group-open:rotate-180 transition-transform text-xs">
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

            {/* WhatsApp Consultation Banner */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">Have questions regarding this guide?</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Consult directly with our specialist on WhatsApp. 100% Cash on Delivery nationwide.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${cleanPhone}?text=Salam%20Pak-o-Drive,%20I%20have%20questions%20regarding%20guide:%20${encodeURIComponent(canonicalUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>

            {/* Write Your Comment Form (Matching Reference Mockup) */}
            <section className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-[#fbfbfb]">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <h4 className="font-serif font-bold text-lg text-slate-900">Leave a Reply</h4>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Your email address will not be published. Required fields are marked *
              </p>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email *"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your comment here..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Submit Comment
                </button>
              </form>
            </section>
          </div>

          {/* ── Right / Sticky Sidebar (~32%) (Matching Reference) ─ */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Sidebar Author Profile Card (Modern Trending Theme) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 relative">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
              </div>
              <div className="px-6 pb-6 text-center relative -mt-8">
                <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md mx-auto mb-2.5">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white text-base shadow-inner">
                    {post.author ? post.author.slice(0, 2).toUpperCase() : 'PO'}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 font-serif font-bold text-base text-slate-900">
                  <span>{post.author || 'Pak-o-Drive Specialist'}</span>
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mt-1 border border-slate-200/60">
                  Editorial Contributor
                </span>
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  Researching automotive engineering, electronic car accessories, and modern technology.
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-400 pt-3 mt-3 border-t border-slate-100">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-3 h-3" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Twitter"
                  >
                    <TwitterIcon className="w-3 h-3" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Table of Contents Sticky Box */}
            {tocHeadings.length >= 2 && (
              <div className="p-5 rounded-xl border border-slate-200 bg-[#fbfbfb]">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">
                  <List className="w-3.5 h-3.5 text-rose-500" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-2 text-xs text-slate-600 max-h-[280px] overflow-y-auto pr-1">
                  {tocHeadings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className="block hover:text-rose-500 hover:translate-x-0.5 transition-all text-decoration-none truncate"
                    >
                      <span className="text-rose-500 font-semibold mr-1.5">{i + 1}.</span>
                      {h.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Sidebar Newsletter Box (Matching Reference) */}
            <BlogNewsletterBox
              description="Signup and receive recent articles and deals in your inbox every week."
            />

            {/* Recent Posts Widget (Matching Reference) */}
            {relatedPosts.length > 0 && (
              <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
                <h5 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 mb-4">
                  Recent Posts
                </h5>
                <div className="space-y-3.5">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/blog/${rel.slug}`}
                      className="group block text-decoration-none"
                    >
                      <h6 className="text-xs font-semibold text-slate-800 group-hover:text-rose-500 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h6>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {rel.readTimeMinutes || 4} min read • {rel.category}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Cloud Widget (Matching Reference) */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <h5 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 mb-3">
                Tags
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {['Technology', 'AI', 'Car Care', 'Maintenance', 'Fuel', 'Gadgets', 'Safety', 'Summer Hacks'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#fff0f0] text-rose-700 hover:bg-rose-500 hover:text-white transition-colors text-decoration-none font-medium"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Cash on Delivery Store Card */}
            <div className="p-5 rounded-xl bg-slate-900 text-white shadow-sm">
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Truck className="w-3.5 h-3.5" />
                <span>Pak-o-Drive Store</span>
              </div>
              <h6 className="font-bold text-sm text-white leading-snug">
                Genuine Car Accessories
              </h6>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Order LED headlights, solar perfumes, high-power vacuums & accessories with 100% Cash On Delivery.
              </p>
              <Link
                href="/shop"
                className="mt-3.5 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors text-decoration-none"
              >
                <span>Browse Store Catalog</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* AdSense Sidebar Unit */}
            <AdSenseSlot
              slotId="auto-sidebar-rail"
              format="rectangle"
              slotLabel="Google AdSense Sidebar Banner"
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
