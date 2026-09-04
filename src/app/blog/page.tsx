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
  searchParams: Promise<{ hub?: string; tag?: string }>;
}

export default async function BlogArchivePage({ searchParams }: BlogPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const rawHub = resolvedParams?.hub;
  const currentHub = rawHub === 'auto' || rawHub === 'general' ? rawHub : 'all';

  const { posts } = await getPublishedPosts(30, 1, currentHub);

  // Split posts for editorial sections matching user reference mockup
  const heroPost = posts[0] || null;
  const trendingPosts = posts.slice(1, 4);
  const popularPosts = posts.slice(4, 10);
  const mostViewedPosts = posts.slice(10, 18);

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-20">
      {/* ── 1. Top Featured Story Hero (Matching Reference Design) ── */}
      {heroPost && (
        <section className="border-b border-slate-100 bg-[#fafafa] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  {heroPost.category || 'Featured Story'}
                </span>
                <div className="w-10 h-0.5 bg-rose-500" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-[1.2]">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="hover:text-rose-500 transition-colors text-decoration-none text-slate-900"
                  >
                    {heroPost.title}
                  </Link>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {heroPost.excerpt}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-all text-decoration-none group"
                  >
                    <span>View More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {heroPost.coverImage && (
                <div className="lg:col-span-5">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="relative block aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-200 group"
                  >
                    <Image
                      src={heroPost.coverImage}
                      alt={heroPost.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 500px"
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

      {/* ── 2. Trending Post Section (Matching Reference Design) ── */}
      {trendingPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 inline-block relative">
              Trending Posts
            </h2>
            <div className="w-14 h-0.5 bg-rose-500 mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 2 Horizontal Cards */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              {trendingPosts.slice(0, 2).map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all bg-white group"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/10] sm:w-44 shrink-0 rounded-lg overflow-hidden bg-slate-100"
                  >
                    <Image
                      src={post.coverImage || '/img/carousel-1.jpg'}
                      alt={post.title}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <span className="text-[11px] font-bold text-rose-500 uppercase">
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-2 mt-1 leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
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
              <div className="lg:col-span-6">
                <Link
                  href={`/blog/${trendingPosts[2].slug}`}
                  className="relative block w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-md group border border-slate-200"
                >
                  <Image
                    src={trendingPosts[2].coverImage || '/img/carousel-1.jpg'}
                    alt={trendingPosts[2].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider mb-2 self-start">
                      {trendingPosts[2].category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold leading-tight group-hover:text-rose-300 transition-colors">
                      {trendingPosts[2].title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-2">
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

            <div className="space-y-6">
              {(popularPosts.length > 0 ? popularPosts : posts).map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col sm:flex-row gap-5 p-5 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <span className="text-xs font-bold text-rose-500 uppercase">
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 group-hover:text-rose-500 transition-colors mt-1 leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>{post.author || 'Pak-o-Drive'}</span>
                        <span>•</span>
                        <span>{post.readTimeMinutes || 4} min read</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                      >
                        Read More <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {post.coverImage && (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="relative block aspect-[16/10] sm:aspect-square sm:w-44 shrink-0 rounded-lg overflow-hidden bg-slate-100"
                    >
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="180px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar Column (4 cols) (Matching Reference Mockup) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Author Profile Card */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white text-center shadow-xs">
              <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <h4 className="font-serif font-bold text-base text-slate-900">Pak-o-Drive Editorial</h4>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-medium">Auto & Tech Research</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Pakistan&apos;s leading automotive and tech journal, committed to rigorous real-world road tests, DIY care, and gadget reviews.
              </p>
              <div className="flex items-center justify-center gap-3 text-slate-400 pt-3 border-t border-slate-100">
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
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
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
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
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

      {/* ── 4. Most Viewed Section (Matching Reference Mockup) ─── */}
      {mostViewedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 inline-block">
              Most Viewed
            </h2>
            <div className="w-14 h-0.5 bg-rose-500 mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mostViewedPosts.slice(0, 4).map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 p-4 hover:border-rose-300 hover:shadow-md transition-all bg-white"
              >
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100 mb-3"
                  >
                    <Image
                      src={post.coverImage || '/img/carousel-1.jpg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 280px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <span className="text-[10px] font-bold text-rose-500 uppercase">
                    {post.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-2 mt-1 leading-snug">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
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
