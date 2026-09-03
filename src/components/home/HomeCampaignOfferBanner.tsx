'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useActiveCampaignOffer } from '../../hooks/useActiveCampaignOffer';

const THEME_STYLES: Record<string, { bg: string; badgeBg: string; text: string; accent: string }> = {
  dark_slate: {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    badgeBg: 'linear-gradient(135deg, #ea580c, #c2410c)',
    text: '#ffffff',
    accent: '#f97316',
  },
  sunset_orange: {
    bg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #9a3412 100%)',
    badgeBg: 'linear-gradient(135deg, #fbbf24, #d97706)',
    text: '#ffffff',
    accent: '#fde047',
  },
  emerald_gold: {
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
    badgeBg: 'linear-gradient(135deg, #f59e0b, #b45309)',
    text: '#ffffff',
    accent: '#34d399',
  },
  midnight_blue: {
    bg: 'linear-gradient(135deg, #0c1836 0%, #1e3a8a 50%, #172554 100%)',
    badgeBg: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    text: '#ffffff',
    accent: '#60a5fa',
  },
};

interface HomeCampaignOfferBannerProps {
  placementFilter?: 'below_slider' | 'after_category' | 'middle_promotions' | 'before_why_us';
  categorySlug?: string;
  categoryIndex?: number;
}

export function HomeCampaignOfferBanner({
  placementFilter,
  categorySlug,
  categoryIndex,
}: HomeCampaignOfferBannerProps) {
  const {
    offer,
    loading,
    timeLeft,
    isExpired,
    bundleAdded,
    whatsappBundleUrl,
    handleAddBundleToCart,
  } = useActiveCampaignOffer();

  if (loading || !offer || !offer.isActive || isExpired || !offer.products || offer.products.length < 2) {
    return null;
  }

  const offerPlacement = offer.placement || 'below_slider';

  // Placement verification filter
  if (placementFilter) {
    if (placementFilter === 'below_slider' && offerPlacement !== 'below_slider') {
      return null;
    }
    if (placementFilter === 'middle_promotions' && offerPlacement !== 'middle_promotions') {
      return null;
    }
    if (placementFilter === 'before_why_us' && offerPlacement !== 'before_why_us') {
      return null;
    }
    if (placementFilter === 'after_category') {
      if (offerPlacement === 'after_first_category' && categoryIndex !== 0) {
        return null;
      }
      if (offerPlacement === 'after_specific_category') {
        if (!categorySlug || offer.targetCategorySlug?.toLowerCase() !== categorySlug.toLowerCase()) {
          return null;
        }
      }
      if (offerPlacement !== 'after_first_category' && offerPlacement !== 'after_specific_category') {
        return null;
      }
    }
  }

  const theme = THEME_STYLES[offer.bgTheme] || THEME_STYLES.dark_slate;
  const isBundle = offer.offerType === 'combo_bundle';

  // Visibility Toggles (Configured via Admin)
  const showTimer = offer.showCountdownTimer ?? true;
  const showSub = offer.showSubtitle ?? true;
  const showSavings = offer.showSavingsBadge ?? true;
  const showFloatingPrice = offer.showFloatingPrice ?? true;
  const showTitle = offer.showProductTitle ?? true;
  const showOriginal = offer.showOriginalPrice ?? true;

  // Overall saving calculation
  const totalOriginal = offer.bundleOriginalPrice || offer.products.reduce((a, b) => a + (b.originalPrice || 0), 0);
  const totalDeal = isBundle
    ? offer.bundlePrice
    : offer.products.reduce((a, b) => a + (b.offerPrice || 0), 0);
  const totalSavings = Math.max(0, totalOriginal - totalDeal);

  return (
    <section className="py-2.5 py-md-4 overflow-hidden position-relative">
      <div className="container-fluid px-2.5 px-md-4 px-lg-5">
        <div
          className="rounded-4 p-3 p-md-4 p-lg-5 position-relative overflow-hidden shadow-md"
          style={{
            background: theme.bg,
            color: theme.text,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="position-absolute top-0 end-0 rounded-circle pointer-events-none"
            style={{
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(234,88,12,0.18) 0%, rgba(0,0,0,0) 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />

          <div className="row align-items-center g-3 g-lg-4 position-relative z-1">
            {/* ── Left Column: Offer Headline, Price & Compact Action CTAs ──────── */}
            <div className="col-12 col-xl-5">
              {/* Badge Row */}
              <div className="d-flex align-items-center gap-1.5 mb-2 flex-wrap">
                <span
                  className="badge rounded-pill px-2.5 py-1 fw-bold text-white shadow-xs"
                  style={{
                    background: theme.badgeBg,
                    fontSize: '0.7rem',
                    letterSpacing: '0.4px',
                  }}
                >
                  <i className="fas fa-bolt me-1" />
                  {offer.badge}
                </span>

                <span
                  className="badge bg-white bg-opacity-10 text-white rounded-pill px-2 py-1 fw-semibold border border-white border-opacity-15"
                  style={{ fontSize: '0.68rem' }}
                >
                  {isBundle ? '📦 COMBO BUNDLE' : '🔥 FLASH SALE'}
                </span>
              </div>

              {/* Title */}
              <h3
                className="fw-bold text-white mb-1.5 leading-normal py-0.5"
                style={{ fontSize: 'clamp(1.2rem, 2.6vw, 1.85rem)', letterSpacing: '-0.3px' }}
              >
                {offer.title}
              </h3>

              {/* Subtitle (Admin Toggleable) */}
              {showSub && offer.subtitle && (
                <p
                  className="text-white text-opacity-80 mb-2.5 leading-normal py-0.5 small"
                  style={{ fontSize: 'clamp(0.78rem, 1.1vw, 0.88rem)', maxWidth: '440px' }}
                >
                  {offer.subtitle}
                </p>
              )}

              {/* Countdown Timer Block (Admin Toggleable) */}
              {showTimer && timeLeft && (
                <div className="d-flex align-items-center gap-2 mb-2.5">
                  <span
                    className="small text-white text-opacity-70 fw-semibold text-uppercase"
                    style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}
                  >
                    ⏳ Expires in:
                  </span>
                  <div className="d-flex align-items-center gap-1.5">
                    {[
                      { val: timeLeft.hours, lbl: 'h' },
                      { val: timeLeft.minutes, lbl: 'm' },
                      { val: timeLeft.seconds, lbl: 's' },
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        className="bg-black bg-opacity-40 border border-white border-opacity-15 rounded-2 px-2 py-0.5 text-center"
                        style={{ minWidth: '40px' }}
                      >
                        <span className="fw-bold font-monospace text-white" style={{ fontSize: '0.85rem' }}>
                          {String(t.val).padStart(2, '0')}
                        </span>
                        <span className="small text-white text-opacity-50 ms-0.5" style={{ fontSize: '0.62rem' }}>
                          {t.lbl}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Savings Card */}
              <div
                className="rounded-3 p-2.5 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="d-flex align-items-baseline gap-2">
                  <span className="fw-extrabold text-white font-monospace" style={{ fontSize: '1.25rem' }}>
                    Rs. {totalDeal.toLocaleString()}
                  </span>
                  {showOriginal && totalOriginal > totalDeal && (
                    <span className="text-white text-opacity-50 text-decoration-line-through small" style={{ fontSize: '0.82rem' }}>
                      Rs. {totalOriginal.toLocaleString()}
                    </span>
                  )}
                </div>

                {showSavings && totalSavings > 0 && (
                  <span
                    className="badge rounded-pill px-2 py-1 fw-bold text-white shadow-xs"
                    style={{ background: '#16a34a', fontSize: '0.7rem' }}
                  >
                    Save Rs. {totalSavings.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Action Buttons (Compact side-by-side or stacked on mobile) */}
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="btn btn-primary rounded-pill py-2 px-3 fw-bold d-flex align-items-center justify-content-center gap-1.5 flex-grow-1 shadow-sm"
                  style={{
                    background: theme.badgeBg,
                    border: 'none',
                    fontSize: '0.82rem',
                  }}
                >
                  <i className={`fas ${bundleAdded ? 'fa-check' : 'fa-shopping-bag'}`} />
                  <span>{bundleAdded ? 'Added to Cart!' : isBundle ? 'Add Bundle to Cart' : 'Claim Deal'}</span>
                </button>

                {whatsappBundleUrl && (
                  <a
                    href={whatsappBundleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success rounded-pill py-2 px-3 fw-bold d-flex align-items-center justify-content-center gap-1.5 shadow-sm text-decoration-none"
                    style={{
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      border: 'none',
                      fontSize: '0.82rem',
                    }}
                    title="Inquire on WhatsApp"
                  >
                    <i className="fab fa-whatsapp" />
                    <span className="d-none d-sm-inline">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* ── Right Column: Compact Product Cards (Zero wasted space, Entire Card Clickable) ── */}
            <div className="col-12 col-xl-7">
              <div className="row g-2 g-sm-2.5">
                {offer.products.map((prod, idx) => (
                  <div
                    key={prod.productId || idx}
                    className={`col-6 ${offer.products.length >= 3 ? 'col-md-4' : 'col-md-6'}`}
                  >
                    {/* Entire card is a clickable Link to the product */}
                    <Link
                      href={`/product/${prod.slug || prod.productId}`}
                      className="card h-100 border-0 rounded-3 overflow-hidden shadow-xs text-decoration-none transition-all p-2 position-relative d-flex flex-column"
                      style={{
                        background: '#ffffff',
                        color: '#1e293b',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      }}
                    >
                      {/* Discount Badge on Top Right */}
                      {prod.discountPercent && prod.discountPercent > 0 ? (
                        <div
                          className="position-absolute top-1.5 end-1.5 badge bg-danger text-white rounded-pill px-1.5 py-0.5 fw-bold"
                          style={{ fontSize: '0.62rem', zIndex: 3 }}
                        >
                          {prod.discountPercent}% OFF
                        </div>
                      ) : null}

                      {/* Product Thumbnail with Dual-Layer Blur and Floating Price */}
                      <div
                        className="position-relative rounded-2 overflow-hidden mb-1.5 bg-light flex-shrink-0"
                        style={{ height: '110px' }}
                      >
                        {/* Layer 1: Ambient Blur */}
                        <div
                          className="position-absolute inset-0 pointer-events-none opacity-40 blur-xl"
                          style={{
                            backgroundImage: `url(${prod.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        {/* Layer 2: Object Contain */}
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          sizes="180px"
                          style={{ objectFit: 'contain' }}
                          className="p-1.5"
                        />

                        {/* 🏷️ FLOATING PRICE BADGE OVER IMAGE (User Request: Saves maximum vertical space!) */}
                        {showFloatingPrice && (
                          <div
                            className="position-absolute bottom-1.5 start-1.5 badge text-white rounded-pill px-2 py-0.5 fw-bold shadow-sm"
                            style={{
                              background: 'rgba(15, 23, 42, 0.88)',
                              backdropFilter: 'blur(6px)',
                              fontSize: '0.72rem',
                              zIndex: 3,
                              border: '1px solid rgba(255,255,255,0.15)',
                            }}
                          >
                            Rs. {prod.offerPrice.toLocaleString()}
                            {showOriginal && prod.originalPrice > prod.offerPrice && (
                              <span
                                className="text-white text-opacity-60 text-decoration-line-through ms-1"
                                style={{ fontSize: '0.62rem' }}
                              >
                                Rs. {prod.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product Title (Rule #4 Typography Safe) */}
                      {showTitle && (
                        <h6
                          className="fw-bold text-dark text-truncate leading-normal py-0.5 mb-0"
                          style={{ fontSize: '0.78rem' }}
                          title={prod.name}
                        >
                          {prod.name}
                        </h6>
                      )}

                      {/* Fallback Price if Floating Price is toggled off */}
                      {!showFloatingPrice && (
                        <div className="d-flex align-items-baseline gap-1.5 mt-auto pt-1">
                          <span className="fw-bold text-dark font-monospace" style={{ fontSize: '0.82rem', color: '#c2410c' }}>
                            Rs. {prod.offerPrice.toLocaleString()}
                          </span>
                          {showOriginal && prod.originalPrice > prod.offerPrice && (
                            <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.68rem' }}>
                              Rs. {prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
