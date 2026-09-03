'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IProductAdAnalytics } from '../../../types/productAds';

interface ProductAdsListCardProps {
  product: IProductAdAnalytics;
  rank: number;
}

export function ProductAdsListCard({ product, rank }: ProductAdsListCardProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackImg = '/img/product-placeholder.png';
  const displayImage = imgError || !product.image ? fallbackImg : product.image;

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 transition-all hover:shadow-md">
      <div className="card-body p-3 p-md-4">
        <div className="row g-3 align-items-center">
          {/* Left Column: Uncropped Image with Dual-Layer Presentation (Rule #3) */}
          <div className="col-12 col-sm-4 col-md-3 col-lg-2">
            <div
              className="position-relative rounded-3 overflow-hidden d-flex align-items-center justify-content-center bg-light border mx-auto"
              style={{ width: '100%', height: '140px' }}
            >
              {/* Rank Badge */}
              <div
                className="position-absolute top-0 start-0 m-1.5 px-2 py-0.5 rounded-pill text-white fw-bold z-2 shadow-sm"
                style={{
                  fontSize: '0.65rem',
                  background: rank <= 3 ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : '#334155',
                }}
              >
                #{rank} In Ads
              </div>

              {/* Layer 1: Ambient Blur Backdrop */}
              <div
                className="position-absolute w-100 h-100"
                style={{
                  backgroundImage: `url(${displayImage})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  filter: 'blur(16px)',
                  opacity: 0.35,
                  transform: 'scale(1.2)',
                }}
              />

              {/* Layer 2: 100% Uncropped Contain Image */}
              <div className="position-relative w-100 h-100 p-2 z-1 d-flex align-items-center justify-content-center">
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 140px, 160px"
                  style={{ objectFit: 'contain' }}
                  onError={() => setImgError(true)}
                />
              </div>
            </div>
          </div>

          {/* Middle Column: Product Details, Sales & Ad Analytics */}
          <div className="col-12 col-sm-8 col-md-6 col-lg-7">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
              <span className="badge bg-light text-muted border rounded-pill px-2.5 py-0.5" style={{ fontSize: '0.72rem' }}>
                {product.category}
              </span>

              {product.isStoreProduct ? (
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-0.5 fw-semibold" style={{ fontSize: '0.7rem' }}>
                  <i className="fas fa-check-circle me-1" /> Store Product
                </span>
              ) : (
                <span className="badge bg-purple bg-opacity-10 text-purple rounded-pill px-2 py-0.5 fw-semibold" style={{ fontSize: '0.7rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                  <i className="fas fa-fire me-1" /> Market Competitor
                </span>
              )}

              <span className="badge bg-warning bg-opacity-15 text-dark rounded-pill px-2 py-0.5 fw-bold" style={{ fontSize: '0.72rem' }}>
                ⚡ Demand: {product.demandScore}/100
              </span>
            </div>

            {/* Product Title (Rule #4 Typography clipping prevention) */}
            <h5 className="fw-bold text-dark mb-1 leading-normal py-0.5" style={{ fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              {product.name}
            </h5>

            {/* Price & Competitor Comparison */}
            <div className="d-flex align-items-baseline gap-2 mb-2.5 flex-wrap">
              <span className="fw-bold text-dark" style={{ fontSize: '1.15rem', color: '#c2410c' }}>
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.85rem' }}>
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.72rem' }}>
                PK Market Rate: ~Rs. {product.competitorPricePKR.toLocaleString()}
              </span>
            </div>

            {/* Sales & Ad Metrics Pills Bar */}
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {/* Active Ads in Pakistan Pill */}
              <div
                className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08))',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <i className="fas fa-bullhorn text-danger" style={{ fontSize: '0.8rem' }} />
                <span className="fw-bold text-danger" style={{ fontSize: '0.78rem' }}>
                  {product.activeAdsCountPK} Active Ads in PK
                </span>
              </div>

              {/* Total Store Sales Pill */}
              <div
                className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-light border"
              >
                <i className="fas fa-shopping-bag text-success" style={{ fontSize: '0.8rem' }} />
                <span className="text-dark fw-semibold" style={{ fontSize: '0.78rem' }}>
                  {product.totalSold} Units Sold (Rs. {product.totalRevenuePKR.toLocaleString()})
                </span>
              </div>

              {/* Estimated Daily Ad Spend Pill */}
              <div className="d-none d-md-flex align-items-center gap-1.5 px-2 py-1 rounded-pill bg-light border text-muted">
                <i className="fas fa-chart-line text-primary" style={{ fontSize: '0.75rem' }} />
                <span style={{ fontSize: '0.75rem' }}>
                  ~Rs. {product.estimatedDailySpendPKR.toLocaleString()}/day PK ad spend
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: View Ads Button & Quick Links */}
          <div className="col-12 col-md-3 col-lg-3 d-flex flex-column justify-content-center gap-2 border-top border-md-top-0 pt-2 pt-md-0">
            {/* Direct View Ads Navigation Button */}
            <Link
              href={`/admin/products/ads-analytics/${product.id}`}
              className="btn btn-sm rounded-pill text-white fw-bold py-2 px-3 d-flex align-items-center justify-content-center gap-2 shadow-sm text-decoration-none"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                fontSize: '0.85rem',
              }}
            >
              <i className="fas fa-eye" />
              <span>View Ads &amp; Creatives</span>
            </Link>

            {/* Quick External Ad Library Links */}
            <div className="d-flex gap-1.5">
              <a
                href={product.metaAdLibraryPkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm rounded-pill flex-fill py-1 px-1.5 text-center text-truncate"
                style={{ fontSize: '0.72rem' }}
                title="Open Meta Ad Library Pakistan for this product"
              >
                <i className="fab fa-facebook me-1" /> Meta PK
              </a>
              <a
                href={product.tiktokSearchPkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-dark btn-sm rounded-pill flex-fill py-1 px-1.5 text-center text-truncate"
                style={{ fontSize: '0.72rem' }}
                title="Search TikTok Pakistan Ads & Reviews"
              >
                <i className="fab fa-tiktok me-1" /> TikTok PK
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
