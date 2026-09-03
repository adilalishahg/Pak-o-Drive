'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useActiveCampaignOffer } from '@/hooks/useActiveCampaignOffer';

const THEME_STYLES: Record<string, { bg: string; text: string; accent: string; badgeBg: string }> = {
  dark_slate: {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)',
    text: '#ffffff',
    accent: '#f97316',
    badgeBg: 'linear-gradient(135deg, #ea580c, #c2410c)',
  },
  sunset_orange: {
    bg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
    text: '#ffffff',
    accent: '#fef08a',
    badgeBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  emerald_gold: {
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
    text: '#ffffff',
    accent: '#fbbf24',
    badgeBg: 'linear-gradient(135deg, #d97706, #b45309)',
  },
  midnight_blue: {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #172554 100%)',
    text: '#ffffff',
    accent: '#38bdf8',
    badgeBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
  },
};

export interface HomeCampaignOfferBannerProps {
  placementFilter?: 'below_slider' | 'after_category' | 'middle_promotions' | 'before_why_us';
  categorySlug?: string;
  categoryIndex?: number;
}

export function HomeCampaignOfferBanner({
  placementFilter,
  categorySlug,
  categoryIndex,
}: HomeCampaignOfferBannerProps = {}) {
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

  // Overall saving calculation
  const totalOriginal = offer.bundleOriginalPrice || offer.products.reduce((a, b) => a + (b.originalPrice || 0), 0);
  const totalDeal = isBundle
    ? offer.bundlePrice
    : offer.products.reduce((a, b) => a + (b.offerPrice || 0), 0);
  const totalSavings = Math.max(0, totalOriginal - totalDeal);

  return (
    <section className="py-4 py-lg-5 overflow-hidden position-relative">
      <div className="container-fluid px-3 px-lg-5">
        <div
          className="rounded-4 p-4 p-md-5 position-relative overflow-hidden shadow-lg"
          style={{
            background: theme.bg,
            color: theme.text,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Subtle Ambient Radial Glows */}
          <div
            className="position-absolute top-0 end-0 rounded-circle pointer-events-none"
            style={{
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(234,88,12,0.2) 0%, rgba(0,0,0,0) 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />

          <div className="row align-items-center g-4 position-relative z-1">
            {/* ── Left Column: Offer Headline, Timer & CTA ──────── */}
            <div className="col-12 col-xl-5">
              {/* Badge */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-sm"
                  style={{
                    background: theme.badgeBg,
                    fontSize: '0.76rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  <i className="fas fa-bolt me-1.5" />
                  {offer.badge}
                </span>

                <span
                  className="badge bg-white bg-opacity-10 text-white rounded-pill px-2.5 py-1.5 fw-semibold border border-white border-opacity-15"
                  style={{ fontSize: '0.72rem' }}
                >
                  {isBundle ? '📦 COMBO PACKAGE DEAL' : '🔥 MULTI-PRODUCT FLASH SALE'}
                </span>
              </div>

              {/* Title */}
              <h2
                className="fw-extrabold text-white mb-2 leading-normal py-0.5"
                style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.3rem)', letterSpacing: '-0.5px' }}
              >
                {offer.title}
              </h2>

              {/* Subtitle */}
              {offer.subtitle && (
                <p
                  className="text-white text-opacity-80 mb-4 leading-normal py-0.5"
                  style={{ fontSize: 'clamp(0.85rem, 1.3vw, 0.98rem)', maxWidth: '480px' }}
                >
                  {offer.subtitle}
                </p>
              )}

              {/* Countdown Timer Block (if configured) */}
              {timeLeft && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="small text-white text-opacity-70 fw-semibold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.8px' }}>
                      ⏳ Offer Expires In:
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {[
                      { val: timeLeft.hours, lbl: 'Hours' },
                      { val: timeLeft.minutes, lbl: 'Mins' },
                      { val: timeLeft.seconds, lbl: 'Secs' },
                    ].map((t, idx) => (
                      <React.Fragment key={idx}>
                        <div
                          className="bg-black bg-opacity-40 border border-white border-opacity-15 rounded-3 p-2 px-3 text-center shadow-inner"
                          style={{ minWidth: '60px' }}
                        >
                          <div className="fw-bold fs-5 text-white font-monospace leading-normal">
                            {String(t.val).padStart(2, '0')}
                          </div>
                          <div className="text-white text-opacity-60" style={{ fontSize: '0.65rem' }}>
                            {t.lbl}
                          </div>
                        </div>
                        {idx < 2 && <span className="fs-5 fw-bold text-white text-opacity-50">:</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Summary (Bundle or Flash Sale) */}
              <div className="p-3 rounded-3 bg-white bg-opacity-10 border border-white border-opacity-15 mb-4" style={{ maxWidth: '420px' }}>
                <div className="d-flex align-items-baseline gap-2 mb-1">
                  <span className="fs-3 fw-bold text-white font-monospace">
                    Rs. {totalDeal.toLocaleString()}
                  </span>
                  {totalOriginal > totalDeal && (
                    <span className="text-white text-opacity-50 text-decoration-line-through small">
                      Rs. {totalOriginal.toLocaleString()}
                    </span>
                  )}
                </div>
                {totalSavings > 0 && (
                  <span className="badge bg-success rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '0.72rem' }}>
                    🎉 You Save Rs. {totalSavings.toLocaleString()} on this offer!
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2.5 flex-wrap">
                {/* 1-Click WhatsApp Order */}
                <a
                  href={whatsappBundleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 text-white text-decoration-none shadow"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    fontSize: '0.88rem',
                  }}
                >
                  <i className="fab fa-whatsapp fs-5" />
                  <span>Order on WhatsApp (COD)</span>
                </a>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                  style={{ fontSize: '0.88rem' }}
                >
                  <i className={`fas ${bundleAdded ? 'fa-check text-success' : 'fa-cart-plus'}`} />
                  <span>{bundleAdded ? 'Added to Cart!' : isBundle ? 'Add Bundle to Cart' : 'Add All to Cart'}</span>
                </button>
              </div>
            </div>

            {/* ── Right Column: Selected Products Showcase ──────── */}
            <div className="col-12 col-xl-7">
              <div className="row g-3">
                {offer.products.map((prod, idx) => (
                  <div
                    key={prod.productId || idx}
                    className={`col-6 ${offer.products.length >= 3 ? 'col-md-4' : 'col-md-6'}`}
                  >
                    <div
                      className="card h-100 border-0 rounded-4 overflow-hidden shadow transition-all p-3 text-start position-relative"
                      style={{
                        background: 'rgba(255, 255, 255, 0.96)',
                        color: '#1e293b',
                      }}
                    >
                      {/* Product Discount Badge */}
                      {prod.discountPercent && prod.discountPercent > 0 ? (
                        <div
                          className="position-absolute top-2 end-2 badge bg-danger text-white rounded-pill px-2 py-0.5 fw-bold"
                          style={{ fontSize: '0.65rem', zIndex: 2 }}
                        >
                          {prod.discountPercent}% OFF
                        </div>
                      ) : null}

                      {/* Uncropped Thumbnail with Dual-Layer Blur (Rule #3) */}
                      <Link
                        href={`/product/${prod.slug || prod.productId}`}
                        className="d-block position-relative rounded-3 overflow-hidden mb-2.5 bg-light"
                        style={{ height: '140px' }}
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
                          sizes="200px"
                          style={{ objectFit: 'contain' }}
                          className="p-2"
                        />
                      </Link>

                      {/* Product Title (Rule #4 Typography Safe) */}
                      <Link
                        href={`/product/${prod.slug || prod.productId}`}
                        className="text-decoration-none text-dark"
                      >
                        <h6
                          className="fw-bold text-truncate leading-normal py-0.5 mb-1"
                          style={{ fontSize: '0.84rem' }}
                          title={prod.name}
                        >
                          {prod.name}
                        </h6>
                      </Link>

                      {/* Prices */}
                      <div className="d-flex align-items-baseline gap-1.5 mt-auto">
                        <span className="fw-bold text-dark font-monospace" style={{ fontSize: '0.92rem', color: '#c2410c' }}>
                          Rs. {prod.offerPrice.toLocaleString()}
                        </span>
                        {prod.originalPrice > prod.offerPrice && (
                          <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.72rem' }}>
                            Rs. {prod.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Direct View Button */}
                      <Link
                        href={`/product/${prod.slug || prod.productId}`}
                        className="btn btn-sm btn-light border rounded-pill w-100 mt-2 fw-semibold text-center text-decoration-none"
                        style={{ fontSize: '0.75rem' }}
                      >
                        View Details <i className="fas fa-arrow-right ms-1 small" />
                      </Link>
                    </div>
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
