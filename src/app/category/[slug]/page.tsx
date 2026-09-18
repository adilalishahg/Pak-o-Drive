import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { IProduct } from '@/types';
import { getStaticSiteUrl } from '@/lib/productSeo';
import { ScrollToTopOnMount } from '@/components/common/ScrollToTopOnMount';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Layers,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300; // 5-minute ISR cache for optimal fresh crawling

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();

  const category = await Category.findOne({ slug }).lean();
  const siteUrl = getStaticSiteUrl();

  const catName = category ? category.name : slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const title = `Buy ${catName} in Pakistan | Cash on Delivery | Pak-o-Drive`;
  const description = `Shop genuine ${catName}, trending gadgets, and auto accessories on Pak-o-Drive. Guaranteed best prices, 2-4 days fast dispatch across Lahore, Karachi, Islamabad, and nationwide Cash on Delivery.`;
  const canonicalUrl = `${siteUrl}/category/${slug}`;
  const ogImage = category?.image || `${siteUrl}/img/carousel-1.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Pak-o-Drive Pakistan',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: catName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryProgrammaticPage({ params }: PageProps) {
  const { slug } = await params;
  await dbConnect();

  // Find category document
  const category = await Category.findOne({ slug }).lean();
  const allCategories = await Category.find({}, 'name slug icon productCount').lean();

  const catName = category ? category.name : slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Resilient query matching slug, raw name, or direct category string
  const query = category
    ? {
        $or: [
          { category: category.slug },
          { category: category.name },
          { category: new RegExp(`^${category.name}$`, 'i') },
          { category: slug },
        ],
      }
    : {
        $or: [
          { category: slug },
          { category: new RegExp(slug.replace(/-/g, ' '), 'i') },
        ],
      };

  const products = await Product.find(query)
    .sort({ isTopSelling: -1, isFeatured: -1, createdAt: -1 })
    .lean<IProduct[]>();

  if (!category && products.length === 0) {
    return notFound();
  }

  const siteUrl = getStaticSiteUrl();

  // Schema.org CollectionPage & ItemList JSON-LD
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${catName} - Pak-o-Drive Pakistan`,
    description: `Browse trending ${catName}, smart gadgets, and auto accessories with Cash on Delivery in Pakistan.`,
    url: `${siteUrl}/category/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((prod, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/product/${prod.slug || prod._id}`,
        name: prod.name,
        image: prod.image || prod.images?.[0],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PKR',
          price: prod.price,
          availability: (prod.stock ?? 10) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      })),
    },
    breadcrumb: {
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
          name: 'Shop',
          item: `${siteUrl}/shop`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: catName,
          item: `${siteUrl}/category/${slug}`,
        },
      ],
    },
  };

  return (
    <>
      <ScrollToTopOnMount />
      {/* Schema.org CollectionPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
        {/* Breadcrumb Navigation Bar */}
        <nav
          aria-label="Breadcrumb"
          className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 py-3 px-4 sm:px-6"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 overflow-x-auto">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-orange-600 transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold truncate">
              {catName}
            </span>
          </div>
        </nav>

        {/* Hero Banner Section */}
        <header className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white py-10 px-4 sm:px-6 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-orange-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Pak-o-Drive Collection Hub
            </div>

            {/* Typography Clipping Prevention (Rule 4) */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-normal py-0.5">
              {catName} <span className="text-orange-500">in Pakistan</span>
            </h1>

            <p className="max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore authentic {catName.toLowerCase()}, premium auto accessories, and trending gadgets. All items inspected for quality with nationwide Cash on Delivery (COD) and 2-4 days tracked delivery.
            </p>

            {/* Value Propositions */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md border border-white/10">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Nationwide COD
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Verified Working Guarantee
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {products.length} Products Available
              </span>
            </div>
          </div>
        </header>

        {/* Sibling Categories Bar (Internal Crawl Equity) */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-3 px-4 sm:px-6 sticky top-0 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-400 uppercase flex-shrink-0 text-[11px] tracking-wider">
              Other Categories:
            </span>
            <Link
              href="/shop"
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold flex-shrink-0 transition-colors"
            >
              All Products
            </Link>
            {allCategories.map((c: any) => {
              const isCurrent = c.slug === slug;
              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Product Grid Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-normal py-0.5">
                {catName} Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Direct factory prices with zero middleman markup
              </p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-900">
              {products.length} Items Listed
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Items being restocked for {catName}
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Fresh inventory is arriving soon. Browse our full store in the meantime!
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((prod) => {
                const img = prod.image || prod.images?.[0] || '/img/carousel-1.jpg';
                const productUrl = prod.slug ? `/product/${prod.slug}` : `/product/${prod._id}`;
                const discount =
                  prod.originalPrice && prod.originalPrice > prod.price
                    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                    : 0;

                const whatsappMsg = encodeURIComponent(
                  `Assalam-o-Alaikum Pak-o-Drive, I want to order "${prod.name}" (PKR ${prod.price.toLocaleString()}). Please confirm COD delivery details.`
                );
                const whatsappUrl = `https://wa.me/923000000000?text=${whatsappMsg}`;

                return (
                  <div
                    key={String(prod._id)}
                    className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Media Area with Rule 3: Ambient Blur Backdrop + object-contain */}
                    <Link href={productUrl} className="relative w-full aspect-square bg-slate-950 overflow-hidden block">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-lg opacity-30 scale-110"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                      <div className="relative w-full h-full p-2 flex items-center justify-center">
                        <Image
                          src={img}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Discount / Best Seller Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {discount > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow-xs">
                            {discount}% OFF
                          </span>
                        )}
                        {prod.isTopSelling && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs">
                            🔥 Viral
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Title with Rule 4 Typography Clipping Protection */}
                        <Link href={productUrl}>
                          <h3
                            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-normal py-0.5"
                            title={prod.name}
                          >
                            {prod.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Pricing & Order CTA */}
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-500 leading-normal py-0.5">
                            PKR {prod.price.toLocaleString()}
                          </span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              PKR {prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* 1-Click WhatsApp Quick Order (Rule 2) */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <Link
                            href={productUrl}
                            className="inline-flex items-center justify-center py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-colors text-center"
                          >
                            Details
                          </Link>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors text-center shadow-xs"
                            title="Order on WhatsApp"
                          >
                            <i className="bi bi-whatsapp" />
                            <span>Order</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pakistan E-Commerce Buyer Guide & FAQ (Programmatic SEO Authority Block) */}
          <section className="mt-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              Frequently Asked Questions: Ordering {catName} on Pak-o-Drive
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Is Cash on Delivery (COD) available across Pakistan?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Yes! We deliver nationwide with Cash on Delivery through Leopard, Trax, and TCS across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and 200+ cities.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  How long does delivery take?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Orders dispatched within 24 hours. Delivery takes 2 to 4 business days depending on your city location. You receive live SMS and WhatsApp tracking upon parcel dispatch.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  What if the item arrives damaged or not working?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Every product is inspected before dispatch. If you receive a defective or damaged parcel, contact our WhatsApp customer support within 3 days for instant replacement or refund.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Are earphones, smart watches, and electronics compatible with all phones?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  All our wireless earbuds, chargers, smart watches, and Bluetooth accessories feature universal Bluetooth 5.0+ connectivity compatible with iPhone, Samsung, Xiaomi, Infinix, Oppo, and laptops.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
