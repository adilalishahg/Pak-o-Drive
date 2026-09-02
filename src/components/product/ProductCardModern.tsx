'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { IProduct } from '@/types';

export interface ProductCardModernProps {
  product: IProduct;
  priority?: boolean;
  formattedId: string;
  adding: boolean;
  displayImage: string;
  discountPercent: number;
  inWishlist: boolean;
  handleAddToCart: (e: React.MouseEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleCardClick: () => void;
  handleToggleWishlist: (e: React.MouseEvent) => void;
  handleImageError: () => void;
}

export const ProductCardModern: React.FC<ProductCardModernProps> = ({
  product,
  priority,
  formattedId,
  adding,
  displayImage,
  discountPercent,
  inWishlist,
  handleAddToCart,
  handleMouseEnter,
  handleMouseLeave,
  handleCardClick,
  handleToggleWishlist,
  handleImageError,
}) => {
  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="pd-card product-item product-card-container"
      style={{
        cursor: 'pointer',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #f0f3f6',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
      }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />

      {/* ── Image Area ── */}
      <Link
        href={`/product/${formattedId}`}
        prefetch={true}
        className="product-card-image-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          background: '#f8fafc',
          flexShrink: 0,
          display: 'block',
          textDecoration: 'none',
        }}
      >
        {/* Wishlist toggle */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10,
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: inWishlist ? '#dc2626' : '#9ca3af',
            transition: 'all 0.2s',
            outline: 'none',
          }}
          aria-label="Toggle Wishlist"
        >
          <i className={inWishlist ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '12px' }} />
        </button>

        {product.showVideoOnFront && product.video ? (
          <video
            src={product.video}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <OptimizedImage
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
            style={{ objectFit: 'contain', padding: '8px', transition: 'all 0.35s ease' }}
            onError={handleImageError}
            itemProp="image"
            priority={priority}
          />
        )}

        {/* Top-Left Badges */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {discountPercent > 0 ? (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '20px',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
                lineHeight: '1.4',
              }}
            >
              -{discountPercent}% OFF
            </span>
          ) : product.isNewArrival ? (
            <span
              style={{
                background: 'var(--pd-primary-dark, #c2410c)',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                lineHeight: '1.4',
              }}
            >
              NEW
            </span>
          ) : null}
        </div>

        {/* Bottom-Left COD tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            zIndex: 2,
            background: 'rgba(236,253,245,0.95)',
            color: '#047857',
            fontSize: '0.58rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            lineHeight: '1.4',
          }}
        >
          <i className="fas fa-truck-moving" style={{ fontSize: '7px' }} />
          <span>COD Available</span>
        </div>
      </Link>

      {/* ── Content ── */}
      <div
        className="product-card-content"
        style={{
          padding: '12px 12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexGrow: 1,
        }}
      >
        {/* Name */}
        <Link
          href={`/product/${formattedId}`}
          prefetch={true}
          className="text-decoration-none block"
          onClick={(e) => e.stopPropagation()}
        >
          <p
            className="product-card-title"
            style={{
              margin: 0,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0f172a',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.2em',
              paddingTop: '2px',
              paddingBottom: '2px',
            }}
          >
            {product.name}
          </p>
        </Link>

        {/* Stars */}
        <div className="product-card-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '1px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <i
                key={i}
                className="fas fa-star"
                style={{ fontSize: '9px', color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0' }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
            ({product.reviewsCount || 15})
          </span>
        </div>

        {/* Price */}
        <div className="product-card-price-container" style={{ marginTop: '2px' }}>
          {product.originalPrice > product.price && (
            <del className="product-card-price-original" style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', lineHeight: 1.3 }}>
              Rs. {product.originalPrice.toLocaleString()}
            </del>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Rs.</span>
            <span
              className="product-card-price-current"
              style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: 'var(--pd-primary, #ea580c)',
                lineHeight: 1.2,
                paddingTop: '2px',
                paddingBottom: '2px',
              }}
            >
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Button container */}
        <div className="product-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '6px' }}>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="btn-gradient product-card-btn"
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '9px 8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              width: '100%',
              cursor: adding ? 'default' : 'pointer',
              opacity: adding ? 0.85 : 1,
              boxShadow: '0 2px 8px rgba(234,88,12,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <i
              className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`}
              style={{ fontSize: '11px' }}
            />
            {adding ? 'Added to Cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};
