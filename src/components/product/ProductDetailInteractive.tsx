'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductActions } from './ProductActions';
import { ProductViewLogger } from '../common/ProductViewLogger';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ProductDetailInteractiveProps } from '@/types/product';
import { useProductDetail } from '@/hooks/useProductDetail';
import { CategoryIcon } from '../common/ThemeIcon';
import { getBestCategoryIcon } from '@/lib/categoryIconService';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';
import { ProductReviewsSection } from './ProductReviewsSection';

export const ProductDetailInteractive: React.FC<ProductDetailInteractiveProps> = ({ product }) => {
  const {
    selectedVariant,
    handleSelectVariant,
    currentPrice,
    currentOriginalPrice,
    currentImage,
    currentDescription,
    cleanedDescription,
    overviewDescription,
    featuresDescription,
    currentStock,
    discountPercent,
    specs,
  } = useProductDetail({ product });

  return (
    <>
      <ProductViewLogger
        id={product._id || ''}
        name={product.name}
        category={product.category}
        price={currentPrice}
      />

      <div className="row g-0">
        {/* Image & Overview Hook col */}
        <div className="col-12 col-md-6 border-bottom border-end-md d-flex flex-column" style={{ background: '#ffffff' }}>
          <ProductImageGallery
            image={currentImage}
            images={product.images || []}
            name={selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
            video={product.video}
            showVideoOnFront={product.showVideoOnFront}
          />

          {/* Upper Overview Hook — Perfectly levels the left gallery with the right buy card */}
          {overviewDescription && (
            <div className="d-none d-md-block px-3 px-lg-4 pt-3 pb-3 border-top flex-grow-1" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge rounded-pill border d-inline-flex align-items-center gap-1.5"
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--pd-primary, #ea580c)',
                    background: '#fff7ed',
                    borderColor: '#ffedd5',
                    fontWeight: 700,
                    padding: '4px 10px',
                  }}
                >
                  <i className="fas fa-sparkles" style={{ fontSize: '10px' }} />
                  <span>Product Overview</span>
                </span>
              </div>
              <MarkdownRenderer
                content={overviewDescription}
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}
              />
            </div>
          )}
        </div>

        {/* Info col */}
        <div className="col-12 col-md-6">
          <div className="pd-detail-right" style={{ padding: '20px 20px 24px' }}>
            {/* Category Badge with Dynamic Icon */}
            {product.category && (
              <Link
                href={`/shop?category=${product.category}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  background: 'rgba(var(--pd-primary-rgb,234,88,12),0.08)',
                  color: 'var(--pd-primary-dark, #c2410c)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <CategoryIcon
                  icon={getBestCategoryIcon(product.category)}
                  style={{ fontSize: '11px', color: 'var(--pd-primary, #ea580c)' }}
                />
                <span>{product.category.replace(/-/g, ' ')}</span>
              </Link>
            )}

            {/* Name */}
            <h1
              className="pd-detail-title"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#111',
                lineHeight: 1.3,
                margin: '0 0 10px',
              }}
            >
              {product.name}
              {selectedVariant && (
                <span className="text-secondary ms-2 fw-semibold" style={{ fontSize: '1.1rem' }}>
                  ({selectedVariant.name})
                </span>
              )}
            </h1>

            {/* Stars + review count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className="fas fa-star"
                    style={{
                      fontSize: '13px',
                      color: i < Math.floor(product.rating) ? '#f59e0b' : '#d1d5db',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {product.rating?.toFixed(1)} · {product.reviewsCount} reviews
              </span>
            </div>

            {/* Variant Selector badge/list */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <label className="d-block text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '0.5px' }}>
                  Available Options / Colors
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id || selectedVariant?.name === v.name;
                    return (
                      <button
                        key={v._id || v.name}
                        onClick={() => handleSelectVariant(v)}
                        type="button"
                        className="btn btn-sm d-flex align-items-center gap-1.5 px-3 py-2 border rounded-pill transition-all"
                        style={{
                          background: isSelected ? 'rgba(var(--pd-primary-rgb,234,88,12),0.06)' : '#fff',
                          borderColor: isSelected ? 'var(--pd-primary)' : '#ddd',
                          color: isSelected ? 'var(--pd-primary)' : '#444',
                          fontWeight: isSelected ? 700 : 500,
                          boxShadow: isSelected ? '0 2px 8px rgba(234,88,12,0.1)' : 'none',
                        }}
                      >
                        {v.image && (
                          <div className="rounded-circle overflow-hidden border" style={{ width: '18px', height: '18px', position: 'relative', flexShrink: 0 }}>
                            <OptimizedImage
                              src={v.image}
                              alt={v.name}
                              fill
                              sizes="18px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        {v.name}
                        <span className="small text-muted ms-1">({v.price.toLocaleString()} PKR)</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price box */}
            <div
              style={{
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '14px',
              }}
            >
              {currentOriginalPrice > currentPrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <del style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    PKR {currentOriginalPrice.toLocaleString()}
                  </del>
                  <span
                    style={{
                      background: '#dc2626',
                      color: '#fff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '3px',
                    }}
                  >
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>PKR</span>
                <span
                  className="pd-detail-price-num"
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: 'var(--pd-primary)',
                    lineHeight: 1,
                  }}
                >
                  {currentPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div style={{ fontSize: '0.78rem', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Availability: </span>
                <span style={{ fontWeight: 700, color: currentStock !== 0 ? '#15803d' : '#dc2626' }}>
                  {currentStock < 0 ? 'In Stock (Unlimited)' : currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>SKU: </span>
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  PAK-{product._id?.substring(18).toUpperCase()}-{selectedVariant ? selectedVariant.name.substring(0, 3).toUpperCase() : 'MAIN'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Shipping: </span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>Free on 2 or more products</span>
              </div>
            </div>

            {/* Actions (Immediately visible next to image & price) */}
            <ProductActions product={product} selectedVariant={selectedVariant} />

            {/* Mobile-Only Description (Shown below buy buttons on small screens) */}
            {currentDescription && (
              <div className="d-block d-md-none mt-3 pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="badge rounded-pill border d-inline-flex align-items-center gap-1.5"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--pd-primary, #ea580c)',
                      background: '#fff7ed',
                      borderColor: '#ffedd5',
                      fontWeight: 700,
                      padding: '4px 10px',
                    }}
                  >
                    <i className="fas fa-sparkles" style={{ fontSize: '10px' }} />
                    <span>Product Highlights</span>
                  </span>
                </div>
                <MarkdownRenderer
                  content={cleanedDescription}
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                  }}
                />
              </div>
            )}

            {/* Localized Pakistan Trust & Assurance Box */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                marginTop: '18px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                {[
                  { icon: 'fas fa-truck-moving', title: 'Cash on Delivery', desc: 'Pay upon parcel arrival' },
                  { icon: 'fas fa-truck', title: 'Free Delivery', desc: 'On 2+ products' },
                  { icon: 'fas fa-shield-check', title: '100% Original', desc: 'Quality checked product' },
                  { icon: 'fas fa-headset', title: 'WhatsApp Help', desc: '24/7 active customer support' },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <i
                      className={b.icon}
                      style={{ color: 'var(--pd-primary, #ea580c)', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}
                    />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                        {b.title}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                        {b.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Timeline info */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                color: '#166534',
              }}>
                <i className="fas fa-shipping-fast" style={{ fontSize: '13px', color: '#16a34a' }} />
                <span>
                  <strong>Estimated Delivery:</strong> Rawalpindi / Islamabad: 24 Hours (1 Day) | Lahore, Karachi & Nationwide: 2–3 Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Balanced Lower Section: Why You Need This (Left 50%) & Technical Specifications (Right 50%) ── */}
      {(featuresDescription || specs.length > 0) && (
        <div className="row g-3 mt-2">
          {/* Left Half: Features & Why You Need This (Circled Area in User's Screenshot) */}
          <div className="col-12 col-md-6">
            <div
              className="pd-card h-100 p-3 p-lg-4"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(234, 88, 12, 0.1)',
                    color: 'var(--pd-primary, #ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-check-circle" />
                </span>
                <div>
                  <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1rem', lineHeight: 1.2 }}>
                    Why You Need This & Key Features
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Highlights & Benefits of this product
                  </span>
                </div>
              </div>
              <MarkdownRenderer
                content={featuresDescription || cleanedDescription}
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                }}
              />
            </div>
          </div>

          {/* Right Half: Technical Specifications & Fitment */}
          <div className="col-12 col-md-6">
            <div
              className="pd-card h-100 p-3 p-lg-4"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-sliders-h" />
                </span>
                <div>
                  <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1rem', lineHeight: 1.2 }}>
                    Technical Specifications
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Compatibility, Dimensions & Quality Details
                  </span>
                </div>
              </div>

              {specs.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <tbody>
                      {specs.map(([key, val], i) => (
                        <tr key={key} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                          <td
                            style={{
                              padding: '10px 12px',
                              fontWeight: 700,
                              color: '#334155',
                              width: '45%',
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            {key}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              color: '#64748b',
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            {String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-light rounded-3 text-secondary" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                  <div className="fw-bold text-dark mb-2">
                    <i className="fas fa-shield-alt text-primary me-1.5" /> Package & Quality Guarantee:
                  </div>
                  <div className="mb-1">• 100% Brand New & Quality Verified</div>
                  <div className="mb-1">• Secure Bubble Wrap Fragile Packaging</div>
                  <div className="mb-1">• Easy Direct Fitment & Installation</div>
                  <div>• 7-Day Easy Return & Cash on Delivery Across Pakistan</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Frequently Bought Together Bundle ── */}
      <FrequentlyBoughtTogether currentProduct={product} />

      {/* ── Verified Customer Ratings & Photo Reviews ── */}
      <ProductReviewsSection
        productId={product._id || ''}
        initialRating={product.rating || 5}
        initialReviewCount={product.reviewsCount || 0}
      />
    </>
  );
};
