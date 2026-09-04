import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedPosts } from '@/lib/blog';
import { getStaticSiteUrl } from '@/lib/productSeo';
import { Calendar, Clock, User, ArrowRight, BookOpen, Wrench, ShieldCheck, Sparkles } from 'lucide-react';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getStaticSiteUrl();
  const title = 'Pak-o-Drive Auto Guides: Pakistani Car Care, Maintenance & Gadgets';
  const description =
    'Practical car care wisdom, summer AC hacks, M2 motorway smog safety, Mehran & Alto fuel economy, and viral car gadgets reviews. Cash On Delivery nationwide.';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/auto`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/auto`,
      siteName: 'Pak-o-Drive',
      locale: 'en_PK',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/img/carousel-1.jpg`,
          width: 1200,
          height: 630,
          alt: 'Pak-o-Drive Automotive Guides',
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

export default async function AutoGuidesArchivePage() {
  const { posts } = await getPublishedPosts(30, 1, 'auto');

  const categories = [
    'All Auto Guides',
    'Car Maintenance',
    'Seasonal Car Care',
    'Fuel Economy & Tuning',
    'Smart Car Gadgets',
    'Driving Safety & Rules',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Auto Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Wrench className="w-3.5 h-3.5 text-orange-400" />
            Pak-o-Drive Dedicated Automotive Media Hub
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-normal py-0.5">
            Auto Guides, DIY Maintenance & Car Care
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Essential car maintenance tutorials, summer heat survival hacks, motorway smog guidance, and reviews of genuine car accessories with nationwide Cash on Delivery.
          </p>

          {/* Quick Filter Navigation */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 backdrop-blur-sm transition-colors hover:border-orange-500 hover:text-orange-400 cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 leading-normal py-0.5">
              Automotive Guides Underway
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our automotive specialists are preparing in-depth tutorials tailored for driving conditions across Pakistan.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => {
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-PK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              return (
                <article
                  key={post.slug}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Article Thumbnail / Cover - Rule 3 Dual Layer */}
                  <Link
                    href={`/auto/${post.slug}`}
                    className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-950"
                    tabIndex={-1}
                  >
                    {post.coverImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover blur-lg opacity-30 scale-105"
                          aria-hidden="true"
                        />
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                        <Wrench className="w-10 h-10 text-orange-400/60" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-orange-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-sm">
                        {post.category || 'Car Maintenance'}
                      </span>
                    </div>
                  </Link>

                  {/* Card Content Body */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[120px]">{post.author || 'Pak-o-Drive Auto'}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Post Title - Rule 4 Typography Clipping Guard */}
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-normal py-0.5 mb-2">
                        <Link href={`/auto/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                      <span>Read Guide & Gear</span>
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
