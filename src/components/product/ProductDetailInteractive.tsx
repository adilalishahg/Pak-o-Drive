'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IProduct, IProductVariant } from '../../types';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductActions } from './ProductActions';
import { ProductViewLogger } from '../common/ProductViewLogger';

interface ProductDetailInteractiveProps {
  product: IProduct;
}

export const ProductDetailInteractive: React.FC<ProductDetailInteractiveProps> = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  // Fallbacks based on selected variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant
    ? selectedVariant.originalPrice || selectedVariant.price
    : product.originalPrice || product.price;

  const currentImage = selectedVariant && selectedVariant.image ? selectedVariant.image : product.image;
  const currentDescription = selectedVariant && selectedVariant.description ? selectedVariant.description : product.description;
  const currentStock = selectedVariant !== undefined ? selectedVariant.stock : product.stock;

  const discountPercent = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const specs = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <>
      <ProductViewLogger
        id={product._id || ''}
        name={product.name}
        category={product.category}
        price={currentPrice}
      />

      <div className="row g-0">
        {/* Image col */}
        <div className="col-12 col-md-5" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <ProductImageGallery
            image={currentImage}
            images={product.images || []}
            name={selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
          />
        </div>

        {/* Info col */}
        <div className="col-12 col-md-7">
          <div className="pd-detail-right" style={{ padding: '20px 20px 24px' }}>
            {/* Category */}
            <Link
              href={`/shop?category=${product.category}`}
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                background: 'rgba(var(--pd-primary-rgb,234,88,12),0.08)',
                color: 'var(--pd-primary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              {product.category}
            </Link>

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
                        onClick={() => setSelectedVariant(v)}
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
                          <div className="rounded-circle overflow-hidden border" style={{ width: '18px', height: '18px', position: 'relative' }}>
                            <img src={v.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <del style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
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
                <span style={{ color: '#9ca3af' }}>Availability: </span>
                <span style={{ fontWeight: 700, color: currentStock > 0 ? '#16a34a' : '#dc2626' }}>
                  {currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>SKU: </span>
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  PAK-{product._id?.substring(18).toUpperCase()}-{selectedVariant ? selectedVariant.name.substring(0, 3).toUpperCase() : 'MAIN'}
                </span>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Shipping: </span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Free above PKR 5,000</span>
              </div>
            </div>

            {/* Description */}
            {currentDescription && (
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#6b7280',
                  lineHeight: 1.65,
                  marginBottom: '16px',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '12px',
                }}
              >
                {currentDescription}
              </p>
            )}

            {/* Actions */}
            <ProductActions product={product} selectedVariant={selectedVariant} />

            {/* Trust row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              {[
                { icon: 'fas fa-shield-alt', text: '100% Genuine' },
                { icon: 'fas fa-undo', text: '30-Day Return' },
                { icon: 'fas fa-truck', text: 'Fast Delivery' },
                { icon: 'fas fa-lock', text: 'Secure COD' },
              ].map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fafafa',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    border: '1px solid #f0f0f0',
                    fontSize: '0.72rem',
                    color: '#374151',
                    fontWeight: 600,
                  }}
                >
                  <i
                    className={b.icon}
                    style={{ color: 'var(--pd-primary)', fontSize: '13px', flexShrink: 0 }}
                  />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      {specs.length > 0 && (
        <div className="pd-card" style={{ marginTop: '8px' }}>
          <div style={{ padding: '16px 16px 20px' }}>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#111',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid var(--pd-primary)',
                display: 'inline-block',
              }}
            >
              Technical Specifications
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <tbody>
                  {specs.map(([key, val], i) => (
                    <tr key={key} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                      <td
                        style={{
                          padding: '9px 12px',
                          fontWeight: 700,
                          color: '#374151',
                          width: '45%',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        {key}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#6b7280', borderBottom: '1px solid #f0f0f0' }}>
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
