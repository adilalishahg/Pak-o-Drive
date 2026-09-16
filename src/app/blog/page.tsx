import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedPosts } from '@/lib/blog';
import { getStaticSiteUrl } from '@/lib/productSeo';
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Flame,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import { FacebookIcon, TwitterIcon, InstagramIcon } from '@/components/blog/SocialIcons';
import { BlogNewsletterBox } from '@/components/blog/BlogNewsletterBox';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getStaticSiteUrl();
  const title = 'Pak-o-Drive Journal | Automotive Guides & Tech Trends';
  const description =
    'Authoritative guides on car care, tech breakthroughs, automotive maintenance, and lifestyle. 100% Cash On Delivery nationwide on all verified accessories.';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/blog`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog`,
      siteName: 'Pak-o-Drive Journal',
      locale: 'en_PK',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/img/carousel-1.jpg`,
          width: 1200,
          height: 630,
          alt: 'Pak-o-Drive Journal',
        },
      ],
    },
  };
}

interface BlogPageProps {
  searchParams?: Promise<{ hub?: string; tag?: string; category?: string }>;
}

export default async function BlogArchivePage({ searchParams }: BlogPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const rawHub = resolvedParams?.hub;
  const rawCategory = resolvedParams?.category;
  const rawTag = resolvedParams?.tag;
  const currentHub = rawHub === 'auto' || rawHub === 'general' ? rawHub : 'all';

  const { posts } = await getPublishedPosts(30, 1, currentHub);

  const isFiltered = Boolean(rawCategory || rawTag);
  const filteredPosts = isFiltered
    ? posts.filter((post) => {
        if (rawCategory && post.category?.toLowerCase() !== rawCategory.toLowerCase()) {
          return false;
        }
        if (rawTag && !post.tags?.some((t: string) => t.toLowerCase() === rawTag.toLowerCase())) {
          return false;
        }
        return true;
      })
    : posts;

  // Split posts for editorial sections
  const heroPost = !isFiltered ? posts[0] || null : null;
  const trendingPosts = !isFiltered ? posts.slice(1, 4) : [];
  const popularPosts = isFiltered ? filteredPosts : (posts.slice(4, 10).length > 0 ? posts.slice(4, 10) : posts);
  const mostViewedPosts = !isFiltered ? posts.slice(10, 18) : [];

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-20">
      {/* ── Quick Horizontal Category Filter Pill Bar ── */}
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur-xs sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 text-xs font-medium">
          {[
            { label: 'All Stories', href: '/blog', active: !rawCategory && !rawTag && !rawHub },
            { label: '🚗 Auto Guides', href: '/auto', active: rawHub === 'auto' },
            { label: '⚡ Technology & AI', href: '/blog?category=Technology+%26+AI', active: rawCategory === 'Technology & AI' },
            { label: '🛠️ Car Maintenance', href: '/auto?category=Car+Maintenance', active: rawCategory === 'Car Maintenance' },
            { label: '📱 Smart Gadgets', href: '/auto?category=Smart+Car+Gadgets', active: rawCategory === 'Smart Car Gadgets' },
            { label: '⛽ Fuel Economy', href: '/auto?category=Fuel+Economy+%26+Tuning', active: rawCategory === 'Fuel Economy & Tuning' },
            { label: '❄️ Seasonal Care', href: '/auto?category=Seasonal+Car+Care', active: rawCategory === 'Seasonal Car Care' },
          ].map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className={`shrink-0 px-3.5 py-1.5 rounded-full transition-all text-decoration-none ${
                pill.active
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Active Filter Banner ── */}
      {isFiltered && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Filtered Articles
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 mt-0.5">
                {rawCategory || rawTag}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredPosts.length} story{filteredPosts.length === 1 ? '' : 's'}
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 hover:text-rose-600 border border-slate-200 shadow-xs text-decoration-none transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </Link>
          </div>
        </section>
      )}

      {/* ── 1. Top Featured Story Hero ── */}
      {heroPost && (
        <section className="border-b border-slate-100 bg-[#fafafa] py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {heroPost.category || 'Featured Story'}
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-snug sm:leading-[1.2]">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="hover:text-rose-500 transition-colors text-decoration-none text-slate-900"
                  >
                    {heroPost.title}
                  </Link>
                </h1>
                <p className="text-slate-600 text-xs sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {heroPost.excerpt}
                </p>
                <div className="flex items-center gap-4 pt-1 sm:pt-2">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-all text-decoration-none group"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{heroPost.author || 'Pak-o-Drive'}</span>
                    <span>•</span>
                    <span>{heroPost.readTimeMinutes || 4} min read</span>
                  </div>
                </div>
              </div>

              {heroPost.coverImage && (
                <div className="lg:col-span-5">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="relative block aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100 group"
                  >
                    <Image
                      src={heroPost.coverImage}
                      alt={heroPost.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 550px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Trending Post Section (Mobile Horizontal Snap Carousel) ── */}
      {trendingPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900 inline-block relative">
                Trending Posts
              </h2>
              <div className="w-12 sm:w-14 h-0.5 bg-rose-500 mt-1.5 sm:mt-2" />
            </div>
            <span className="sm:hidden text-[11px] text-slate-400 font-medium flex items-center gap-1">
              Swipe <span>→</span>
            </span>
          </div>

          <div className="flex sm:grid sm:grid-cols-12 gap-4 sm:gap-8 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 snap-x snap-mandatory sm:snap-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Left 2 Cards */}
            <div className="flex sm:flex-col lg:col-span-6 gap-4 sm:gap-6 shrink-0 sm:shrink">
              {trendingPosts.slice(0, 2).map((post) => (
                <article
                  key={post.slug}
                  className="w-[270px] sm:w-auto shrink-0 snap-start flex flex-col sm:flex-row gap-3 sm:gap-5 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all bg-white group"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/10] sm:w-44 shrink-0 rounded-lg overflow-hidden bg-slate-100"
                  >
                    <Image
                      src={post.coverImage || '/img/carousel-1.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 270px, 180px"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 uppercase tracking-wide">
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-xs sm:text-base text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-2 mt-1 leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 sm:mt-3">
                      <span className="truncate">{post.author || 'Pak-o-Drive'}</span>
                      <span>•</span>
                      <span>{post.readTimeMinutes || 4} min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Right Large Featured Card with Overlay */}
            {trendingPosts[2] && (
              <div className="w-[280px] sm:w-auto shrink-0 snap-start lg:col-span-6">
                <Link
                  href={`/blog/${trendingPosts[2].slug}`}
                  className="relative block w-full h-full min-h-[220px] sm:min-h-[320px] rounded-2xl overflow-hidden shadow-md group border border-slate-200"
                >
                  <Image
                    src={trendingPosts[2].coverImage || '/img/carousel-1.jpg'}
                    alt={trendingPosts[2].title}
                    fill
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 100vw, 600px"
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2 self-start">
                      {trendingPosts[2].category}
                    </span>
                    <h3 className="text-sm sm:text-2xl font-serif font-bold leading-tight group-hover:text-rose-300 transition-colors line-clamp-2 sm:line-clamp-none">
                      {trendingPosts[2].title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-300 mt-1.5 sm:mt-2">
                      <span>{trendingPosts[2].author || 'Pak-o-Drive'}</span>
                      <span>•</span>
                      <span>{trendingPosts[2].readTimeMinutes || 4} min read</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. Popular Posts Section + Sidebar (Matching Reference) ─ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* Main Popular Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 inline-block">
                Popular Posts
              </h2>
              <div className="w-14 h-0.5 bg-rose-500 mt-2" />
            </div>

            <div className="space-y-3.5 sm:space-y-5">
              {(popularPosts.length > 0 ? popularPosts : posts).map((post) => (
                <article
                  key={post.slug}
                  className="flex items-center gap-3.5 sm:gap-5 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-rose-500 uppercase tracking-wider">
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-xs sm:text-lg text-slate-900 group-hover:text-rose-500 transition-colors mt-1 leading-snug line-clamp-2">
                        <Link href={`/blog/${post.slug}`} className="text-slate-900 group-hover:text-rose-500">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 sm:mt-4 sm:pt-3 sm:border-t sm:border-slate-100 text-[10px] sm:text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="truncate max-w-[90px] sm:max-w-none">{post.author || 'Pak-o-Drive'}</span>
                        <span>•</span>
                        <span>{post.readTimeMinutes || 4} min read</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hidden sm:inline-flex text-xs font-semibold text-rose-500 hover:underline items-center gap-1"
                      >
                        Read More <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block w-20 h-20 sm:w-44 sm:h-auto sm:aspect-square shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group-hover:border-rose-200 transition-colors"
                  >
                    <Image
                      src={post.coverImage || '/img/carousel-1.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 80px, 180px"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Author Profile Card */}
            <div className="p-4 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-3 sm:flex-col sm:text-center">
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-slate-100 shrink-0 sm:mx-auto flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden">
                  <User className="w-6 h-6 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <div className="min-w-0 sm:mt-3">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 truncate sm:truncate-none">Pak-o-Drive Editorial</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-medium">Auto & Tech Research</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-2.5 sm:mt-3 mb-3 sm:mb-4 sm:text-center">
                Pakistan&apos;s leading automotive and tech journal, committed to rigorous real-world road tests, DIY care, and gadget reviews.
              </p>
              <div className="flex items-center sm:justify-center gap-3 text-slate-400 pt-2.5 sm:pt-3 border-t border-slate-100">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-500 transition-colors">
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-500 transition-colors">
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-500 transition-colors">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sidebar Newsletter Box */}
            <BlogNewsletterBox
              description="Signup and receive weekly guides, tech breakthroughs, and exclusive COD deals in your inbox."
            />

            {/* Categories List */}
            <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <h5 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 mb-3">
                Categories
              </h5>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Technology & AI', count: 8, href: '/blog?category=Technology+%26+AI' },
                  { name: 'Car Maintenance', count: 12, href: '/auto?category=Car+Maintenance' },
                  { name: 'Seasonal Car Care', count: 7, href: '/auto?category=Seasonal+Car+Care' },
                  { name: 'Fuel Economy & Tuning', count: 6, href: '/auto?category=Fuel+Economy+%26+Tuning' },
                  { name: 'Smart Gadgets', count: 9, href: '/auto?category=Smart+Car+Gadgets' },
                ].map((c) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    className="flex items-center justify-between py-1 text-slate-600 hover:text-rose-500 text-decoration-none transition-colors"
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({c.count})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tag Cloud */}
            <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
              <h5 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 mb-3">
                Tags
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {['Technology', 'AI', 'Car Care', 'Maintenance', 'Fuel', 'Gadgets', 'Safety', 'Summer Hacks', 'AC Cooling'].map((tag) => (
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
          </aside>
        </div>
      </section>

      {/* ── 4. Most Viewed Section ─── */}
      {mostViewedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-slate-900 inline-block">
              Most Viewed
            </h2>
            <div className="w-12 sm:w-14 h-0.5 bg-rose-500 mt-1.5 sm:mt-2" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {mostViewedPosts.slice(0, 4).map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 p-3 sm:p-4 hover:border-rose-300 hover:shadow-md transition-all bg-white"
              >
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100 mb-2 sm:mb-3"
                  >
                    <Image
                      src={post.coverImage || '/img/carousel-1.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 280px"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <span className="text-[9px] sm:text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-2 mt-1 leading-snug">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                </div>

                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 text-[9px] sm:text-[10px] text-slate-400">
                  <span>{post.readTimeMinutes || 4} min read</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
