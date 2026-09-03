'use client';

import React from 'react';
import Link from 'next/link';
import { IProduct } from '@/types';
import { SiteTheme } from '@/types/theme';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { ProductCard } from '@/components/product/ProductCard';
import { HomeTopCollections } from './HomeTopCollections';
import { HeroSlider } from '@/components/common/HeroSlider';
import { HeroSlide } from '@/types/common';
import { CategorySection } from '@/hooks/useHomePage';
import { CategoryProductsBlock } from './CategoryProductsBlock';
import { HomeCampaignOfferBanner } from './HomeCampaignOfferBanner';

export interface HomeCleanWhiteLayoutProps {
  theme: SiteTheme;
  products: IProduct[];
  cats: any[];
  heroBig: any;
  heroSmall: any;
  trending: any;
  cols: any;
  deal: any;
  moreDeals: any;
  featSec: any;
  valProps: any;
  dynamicHeroSlides?: HeroSlide[];
  sliderConfig?: any;
  categorySections?: CategorySection[];
}

export const HomeCleanWhiteLayout: React.FC<HomeCleanWhiteLayoutProps> = ({
  theme,
  products,
  cats,
  heroBig,
  heroSmall,
  trending,
  cols,
  deal,
  moreDeals,
  featSec,
  valProps,
  dynamicHeroSlides = [],
  sliderConfig = {},
  categorySections = [],
}) => {
  const hasCustomSlides =
    Array.isArray(theme.homepageSections?.heroSlides) &&
    theme.homepageSections.heroSlides.length > 0 &&
    dynamicHeroSlides.length > 0;

  return (
    <div className="bg-[#fafafa] text-slate-800 font-sans antialiased min-h-screen flex flex-col">
      {/* ── Announcement Bar ── */}
      {theme.announcementBarEnabled && (
        <div className="announcement-bar text-slate-800 text-center py-2 px-3 overflow-hidden text-xs sm:text-sm font-semibold border-b border-slate-200">
          <span className="announcement-inner">{theme.announcementBarText}</span>
        </div>
      )}

      {/* ── Dynamic Hero Slider (If custom slides active) ── */}
      {hasCustomSlides && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
          <div className="rounded-3xl overflow-hidden shadow-sm">
            <HeroSlider
              slides={dynamicHeroSlides}
              autoPlayMs={sliderConfig.autoPlayMs}
              autoPlayEnabled={sliderConfig.autoPlayEnabled}
              showArrows={sliderConfig.showArrows}
              showDots={sliderConfig.showDots}
              engine={sliderConfig.sliderEngine || 'classic'}
            />
          </div>
        </section>
      )}

      {/* ── Placement Hook: Below Hero Slider ─────────────── */}
      <HomeCampaignOfferBanner placementFilter="below_slider" />

      {/* ── Hero Grid Banners (Shown if no custom hero slides) ── */}
      {!hasCustomSlides && (heroBig.enabled || heroSmall.enabled) && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className={`grid grid-cols-1 gap-6 ${heroBig.enabled && heroSmall.enabled ? 'lg:grid-cols-3' : ''}`}>
            {/* Big Hero Card */}
            {heroBig.enabled && (
              <div className={`${heroBig.enabled && heroSmall.enabled ? 'lg:col-span-2' : ''} bg-[#f3f4f6] rounded-3xl overflow-hidden relative min-h-[380px] flex items-center p-8 sm:p-12 group`}>
                <div className="relative z-10 max-w-md">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white shadow-sm mb-4" style={{ color: theme.primaryColor }}>
                    {heroBig.badge}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                    {heroBig.title}
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base mb-8">{heroBig.subtitle}</p>
                  <Link
                    href={heroBig.buttonLink || '/shop'}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium text-sm transition-all hover:-translate-y-0.5 text-decoration-none"
                    style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px -5px ${theme.primaryColor}30` }}
                  >
                    {heroBig.buttonText}
                  </Link>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-center p-4">
                  <OptimizedImage
                    src={heroBig.imageUrl}
                    alt={heroBig.title || 'Featured Product'}
                    width={300}
                    height={300}
                    sizes="(max-width: 640px) 280px, 300px"
                    style={{ objectFit: 'contain', maxHeight: '300px', width: 'auto', height: 'auto' }}
                    className="drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Small Hero Card */}
            {heroSmall.enabled && (
              <div className="bg-violet-50 rounded-3xl overflow-hidden relative min-h-[380px] flex flex-col justify-between p-8 sm:p-10 group">
                <div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-violet-200/50 text-violet-700 mb-4">
                    {heroSmall.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                    {heroSmall.title} <br /><span className="text-violet-600">{heroSmall.highlight}</span>
                  </h2>
                  <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900 mt-4 text-decoration-none">
                    Shop Now
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
                <div className="w-full flex justify-end mt-4">
                  <OptimizedImage
                    src={heroSmall.imageUrl}
                    alt={heroSmall.title || 'Special Discount'}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain', maxHeight: '200px', width: 'auto', height: 'auto' }}
                    className="drop-shadow-lg transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Trending Products ── */}
      {trending.enabled && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{trending.title}</h2>
            <Link href="/shop" className="text-sm font-semibold inline-flex items-center gap-1 text-decoration-none" style={{ color: theme.primaryColor }}>
              See All
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, trending.limit || 4).map((prod, idx) => (
              <ProductCard key={prod._id} product={prod} priority={idx < 4} />
            ))}
          </div>
        </section>
      )}

      {/* ── Category Wise Sections (PriceOye Style with Pak-o-Drive Design) ── */}
      {categorySections && categorySections.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6" aria-label="Category Sections">
          <CategoryProductsBlock
            sections={categorySections}
            theme={theme}
            isCleanWhite={true}
          />
        </section>
      )}

      {/* ── Top Collections ── */}
      {cols.enabled && (
        <HomeTopCollections title={cols.title} categories={cats} />
      )}

      {/* ── Weekly Big Deal Banner ── */}
      {deal.enabled && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_40%)]" />
            <div className="relative z-10 max-w-lg mb-8 md:mb-0">
              <span className="text-blue-500 font-bold text-xs uppercase tracking-wider block mb-2">{deal.label}</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-4">{deal.title}</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md">{deal.description}</p>
              <Link
                href={deal.buttonLink || '/shop'}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all text-decoration-none"
                style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px -5px ${theme.primaryColor}30` }}
              >
                {deal.buttonText}
              </Link>
            </div>
            <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
              <OptimizedImage
                src={deal.imageUrl}
                alt={deal.title || 'Weekly Deal'}
                width={260}
                height={260}
                style={{ objectFit: 'contain', maxHeight: '260px', width: 'auto', height: 'auto' }}
                className="drop-shadow-[0_20px_50px_rgba(59,130,246,0.25)] transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── More Active Deals ── */}
      {moreDeals.enabled && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{moreDeals.title}</h2>
            <p className="text-slate-500 text-sm mt-1">Super savings and daily essentials</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(trending.enabled ? (trending.limit || 4) : 0, (trending.enabled ? (trending.limit || 4) : 0) + (moreDeals.limit || 4)).map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/shop" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-decoration-none">
              Load More
            </Link>
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featSec.enabled && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--pd-primary-dark, #c2410c)' }}>Handpicked For You</p>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{featSec.title}</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold inline-flex items-center gap-1 text-decoration-none" style={{ color: 'var(--pd-primary-dark, #c2410c)' }}>
              See All
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, featSec.limit || 8).map((prod, idx) => (
              <ProductCard key={prod._id} product={prod} priority={idx < 4} />
            ))}
          </div>
          {products.length > 0 && (
            <div className="flex justify-center mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all text-decoration-none"
                style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px -5px ${theme.primaryColor}30` }}
              >
                Show More
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── Multi-Product Hybrid Campaign (Middle Promotions Placement) ─ */}
      <HomeCampaignOfferBanner placementFilter="middle_promotions" />

      {/* ── Placement Hook: Before Why Choose Us / Value Props ── */}
      <HomeCampaignOfferBanner placementFilter="before_why_us" />

      {/* ── Value Propositions ── */}
      {valProps.enabled && (
        <section className="bg-white border-t border-slate-100 py-8">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 014.73 4.5H19.5a1.5 1.5 0 011.5 1.5v7m-9.75 4.5H18m0 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125a1.125 1.125 0 001.12-1.243l-.75-7.125M18 14.25H9m0 0v-4.5', color: 'bg-blue-50 text-blue-600', title: 'Free Delivery', desc: 'For all orders over Rs. 5,000' },
                { icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3', color: 'bg-green-50 text-green-600', title: '30 Days Return', desc: 'Hassle-free 100% money back' },
                { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', color: 'bg-purple-50 text-purple-600', title: 'Secure Payment', desc: '100% encrypted SSL checkout' },
                { icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z', color: 'bg-orange-50 text-orange-600', title: '24/7 Support', desc: 'Dedicated professional support' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${i === 0 ? '' : item.color}`}
                    style={i === 0 ? { backgroundColor: `color-mix(in srgb, ${theme.primaryColor} 10%, transparent)`, color: theme.primaryColor } : {}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
