import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedPosts } from '@/lib/blog';
import { getStaticSiteUrl } from '@/lib/productSeo';
import { Calendar, Clock, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getStaticSiteUrl();
  const title = 'Auto Guides, Driving Tips & Maintenance | Pak-o-Drive';
  const description =
    'Expert car care advice, automotive maintenance guides, viral car gadget reviews, and driving tips in Pakistan. Cash On Delivery nationwide on all accessories.';

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
      siteName: 'Pak-o-Drive',
      locale: 'en_PK',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/img/carousel-1.jpg`,
          width: 1200,
          height: 630,
          alt: 'Pak-o-Drive Automotive Blog & Guides',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/img/carousel-1.jpg`],
    },
  };
}

interface BlogPageProps {
  searchParams: Promise<{ hub?: string }>;
}

export default async function BlogArchivePage({ searchParams }: BlogPageProps) {
  const { hub: rawHub } = await searchParams;
  const currentHub = rawHub === 'auto' || rawHub === 'general' ? rawHub : 'all';

  const { posts } = await getPublishedPosts(30, 1, currentHub);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Blog Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Pak-o-Drive Knowledge & Trends Hub
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-normal py-0.5">
            Auto Guides, Tech Breakthroughs & Trends
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Expert car care wisdom, monsoon/summer survival tips, viral gadget roundups, and authoritative tech insights.
          </p>

          {/* Dual-Hub Navigation Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-xl transition-all border ${
                currentHub === 'all'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-orange-500 hover:text-white'
              }`}
            >
              All Articles
            </Link>
            <Link
              href="/auto"
              className={`px-4 py-2 rounded-xl transition-all border flex items-center gap-1.5 ${
                currentHub === 'auto'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-orange-500 hover:text-white'
              }`}
            >
              <span>🚗</span>
              <span>Pak-o-Drive Auto Guides</span>
            </Link>
            <Link
              href="/general"
              className={`px-4 py-2 rounded-xl transition-all border flex items-center gap-1.5 ${
                currentHub === 'general'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-orange-500 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>Tech & Global Trends</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Articles Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {posts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 leading-normal py-0.5">
              Articles In Preparation
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our editorial team is preparing in-depth guides and tutorials. Check back soon!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              Explore Car Accessories & Gadgets
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => {
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-PK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              const postHref = post.hub === 'auto' ? `/auto/${post.slug}` : `/general/${post.slug}`;

              return (
                <article
                  key={post.slug}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Article Thumbnail / Cover */}
                  <Link
                    href={postHref}
                    className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-100"
                    tabIndex={-1}
                  >
                    {post.coverImage ? (
                      <div className="relative w-full h-full">
                        {/* Ambient Blur Backdrop per Rule 3 */}
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover blur-lg opacity-30 scale-105"
                          aria-hidden="true"
                        />
                        {/* Main Image Object-Contain */}
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                        <BookOpen className="w-10 h-10 text-orange-400/60" />
                      </div>
                    )}

                    {/* Category Tag Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium border border-white/10 shadow-sm">
                        {post.category || 'Maintenance'}
                      </span>
                    </div>
                  </Link>

                  {/* Card Content Body */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {/* Meta: Author & Date */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[100px]">{post.author || 'Pak-o-Drive'}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-normal py-0.5 mb-2">
                        <Link href={postHref} className="hover:underline">
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt - Rule 4 Guard */}
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Card Footer CTA */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                      <span>Read Guide</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
