'use client';

import React from 'react';
import Link from 'next/link';
import { IProduct } from '@/types';
import { HeroSlide } from '@/types/common';
import { SiteTheme } from '@/types/theme';
import { HeroSlider } from '@/components/common/HeroSlider';
import { ProductCardAuto } from '@/components/product/ProductCardAuto';
import { HomeServicesSection } from './HomeServicesSection';
import { HomeOfferBanners } from './HomeOfferBanners';
import { HomeStatsSection } from './HomeStatsSection';
import { ThemeIcon } from '@/components/common/ThemeIcon';
import { ProductTabKey, CategorySection } from '@/hooks/useHomePage';
import { CategoryProductsBlock } from './CategoryProductsBlock';

export interface HomeModernLayoutProps {
  theme: SiteTheme;
  isModernGreen: boolean;
  isCleanWhite: boolean;
  hs: any;
  dynamicHeroSlides: HeroSlide[];
  dynamicOffers: any[];
  activeTab: ProductTabKey;
  setActiveTab: (tab: ProductTabKey) => void;
  filteredProducts: IProduct[];
  tabs: { key: ProductTabKey; label: string }[];
  sliderConfig?: {
    autoPlayMs: number;
    autoPlayEnabled: boolean;
    showArrows: boolean;
    showDots: boolean;
    sliderEngine: 'classic' | 'smooothy' | string;
  };
  categorySections?: CategorySection[];
}

export const HomeModernLayout: React.FC<HomeModernLayoutProps> = ({
  theme,
  isModernGreen,
  isCleanWhite,
  hs,
  dynamicHeroSlides,
  dynamicOffers,
  activeTab,
  setActiveTab,
  filteredProducts,
  tabs,
  sliderConfig,
  categorySections,
}) => {
  const autoPlayMs = sliderConfig?.autoPlayMs ?? 5000;
  const autoPlayEnabled = sliderConfig?.autoPlayEnabled ?? true;
  const showArrows = sliderConfig?.showArrows ?? true;
  const showDots = sliderConfig?.showDots ?? true;
  const sliderEngine = (sliderConfig?.sliderEngine as 'classic' | 'smooothy') || 'smooothy';

  return (
    <div className={isModernGreen ? '' : 'bg-white'}>
      {/* ── Announcement Bar ─────────────────────────────── */}
      {theme.announcementBarEnabled && (
        <div className="announcement-bar text-white text-center py-2 px-3 overflow-hidden">
          <span className="announcement-inner">
            {theme.announcementBarText}
          </span>
        </div>
      )}

      {/* ── Hero Slider ───────────────────────────────── */}
      <section aria-label="Featured Products Carousel">
        <div className="container-fluid px-0">
          <HeroSlider
            slides={dynamicHeroSlides}
            autoPlayMs={autoPlayMs}
            autoPlayEnabled={autoPlayEnabled}
            showArrows={showArrows}
            showDots={showDots}
            engine={sliderEngine}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATEGORY SECTIONS — PriceOye style with Pak-o-Drive Design
          Organized by Main Parent Categories
      ══════════════════════════════════════════════ */}
      {categorySections && categorySections.length > 0 ? (
        <section className={`${(isModernGreen || isCleanWhite) ? '' : 'bg-white'} py-3 py-lg-4`} aria-label="Products by Category">
          <div style={{ padding: '0 8px' }}>
            <CategoryProductsBlock
              sections={categorySections}
              theme={theme}
              isCleanWhite={isCleanWhite}
              isModernGreen={isModernGreen}
            />
          </div>
        </section>
      ) : (
        <section className={`${(isModernGreen || isCleanWhite) ? '' : 'bg-white'} py-3 py-lg-4`} aria-label="Our Products">
          <div style={{ padding: '0 8px' }}>
            {/* Section header */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <p className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.72rem', letterSpacing: '2px', color: isModernGreen ? '#0d231d' : (isCleanWhite ? '#2563eb' : 'var(--pd-primary-dark, #c2410c)') }}>
                    Handpicked For You
                  </p>
                  <h2 className="fw-bold text-dark mb-0" style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', letterSpacing: '-0.3px', color: isModernGreen ? '#0d231d !important' : (isCleanWhite ? '#1e293b !important' : 'inherit') }}>
                    Our Products
                  </h2>
                </div>
                <Link href="/shop" className="d-none d-md-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
                  style={{ fontSize: '0.85rem', color: isModernGreen ? '#d4af37' : (isCleanWhite ? '#2563eb' : 'var(--pd-primary)'), whiteSpace: 'nowrap' }}>
                  View All
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
              {/* Tabs ── */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                <div className="d-flex gap-2" style={{ flexWrap: 'nowrap', paddingBottom: '4px', minWidth: 'max-content' }}>
                  {tabs.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`tab-btn rounded-pill border-0 ${activeTab === t.key ? 'active' : ((isModernGreen || isCleanWhite) ? '' : 'bg-light text-dark')}`}
                      style={{ fontSize: '0.82rem', padding: '8px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
                      aria-pressed={activeTab === t.key}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4 my-3">
                <i className="fas fa-box-open fa-3x text-muted mb-3 d-block" />
                <p className="text-muted fw-semibold mb-3">No products found in &quot;{tabs.find(t => t.key === activeTab)?.label}&quot;.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5"
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
                className="products-grid">
                <style>{`
                  @media (min-width: 768px) { .products-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                  @media (min-width: 992px) { .products-grid { grid-template-columns: repeat(4, 1fr) !important; } }
                  @media (min-width: 1400px) { .products-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 14px !important; } }
                `}</style>
                {filteredProducts.map((prod, idx) => (
                  <div
                    key={prod._id}
                    className="product-card-anim"
                    style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                  >
                    <ProductCardAuto product={prod} priority={idx < 4} />
                  </div>
                ))}
              </div>
            )}

            {/* View all */}
            {filteredProducts.length > 0 && (
              <div className="text-center mt-4 py-2">
                <Link
                  href="/shop"
                  className="btn-gradient"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    padding: '11px 28px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  View All Products
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Services Strip ───────────────────────────────── */}
      <HomeServicesSection />

      {/* ── Offer Banners ────────────────────────────────── */}
      <HomeOfferBanners offers={dynamicOffers} />

      {/* ── Stats Counter Strip ──────────────────────────── */}
      <HomeStatsSection />

      {/* ── Why Choose Us ────────────────────────────────── */}
      <section
        className="container-fluid py-5"
        style={{
          background: isModernGreen
            ? 'linear-gradient(135deg, #f0ede4 0%, #f7f5ed 100%)'
            : (isCleanWhite ? '#f8fafc' : 'linear-gradient(135deg, color-mix(in srgb, var(--pd-primary) 8%, #fff) 0%, #fffbf5 100%)')
        }}
        aria-label="Why Choose PAKODRIVE"
      >
        <div className="container text-center">
          <p className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.78rem', letterSpacing: '2px', color: isModernGreen ? '#0d231d' : (isCleanWhite ? theme.primaryColor : '') }}>Why Us?</p>
          <h2 className="section-title fw-bold text-dark mb-5 d-inline-block" style={{ color: isModernGreen ? '#0d231d !important' : (isCleanWhite ? '#1e293b !important' : '') }}>Why Choose PAKODRIVE</h2>
          <div className="row g-4 mt-2">
            {[
              {
                icon: 'sync',
                title: '30-Day Easy Returns',
                desc: 'If you aren\'t completely satisfied, return your items within 30 days for a full refund—no questions asked.',
              },
              {
                icon: 'shipping',
                title: 'Free Shipping above PKR 5,000',
                desc: 'Enjoy free shipping on all orders over PKR 5,000 across Pakistan, delivered safely via trusted couriers.',
              },
              {
                icon: 'shield',
                title: '100% Secure Checkout & COD',
                desc: 'Shop confidently with Cash on Delivery (COD) or secure card payments. Inspect your package before you pay.',
              },
              {
                icon: 'star',
                title: '100% Genuine & Verified Products',
                desc: 'We inspect and verify every item in our inventory to ensure you receive 100% authentic, high-quality electronics.',
              },
            ].map((box, i) => (
              <div key={i} className="col-md-6 col-lg-3 animate-on-scroll">
                <div className="why-us-card p-4 h-100 text-center border rounded shadow-sm bg-white">
                  <div
                    className="why-us-icon-container rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: '64px',
                      height: '64px',
                      background: isModernGreen
                        ? 'rgba(212, 175, 55, 0.15)'
                        : (isCleanWhite ? 'rgba(37, 99, 235, 0.1)' : 'rgba(234, 88, 12, 0.1)'),
                      color: isModernGreen
                        ? '#d4af37'
                        : (isCleanWhite ? (theme.primaryColor || '#2563eb') : 'var(--pd-primary)'),
                      border: isModernGreen
                        ? '1px solid rgba(212, 175, 55, 0.3)'
                        : '1px solid rgba(234, 88, 12, 0.2)',
                    }}
                  >
                    <ThemeIcon name={box.icon} style={{ fontSize: '24px' }} />
                  </div>
                  <h5 className="fw-bold mb-2">{box.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{box.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
