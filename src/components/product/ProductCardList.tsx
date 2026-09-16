'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OptimizedImage } from '../common/OptimizedImage';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { IProduct } from '../../types';

interface ProductCardListProps {
  product: IProduct;
  priority?: boolean;
}

export const ProductCardList: React.FC<ProductCardListProps> = ({ product, priority }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);

  const formattedId = product._id ? product._id.toString() : '';
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 800);
  };

  const secondaryImg = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <article
      onClick={() => router.push(`/product/${formattedId}`)}
      className="product-card-container product-card-list-item card-hover-lift group"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s ease',
      }}
    >
      {/* ── Left Media Thumbnail (Rule 3: Dual-Layer Uncropped Media Presentation) ── */}
      <div
        className="product-card-image-wrapper flex-shrink-0"
        style={{
          width: '106px',
          height: '106px',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f8fafc',
          border: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Layer 1: Ambient Blur Backdrop */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <OptimizedImage
            src={product.image || '/img/product-placeholder.png'}
            alt=""
            fill
            sizes="106px"
            style={{
              objectFit: 'cover',
              filter: 'blur(16px)',
              opacity: 0.35,
              transform: 'scale(1.25)',
            }}
            fallbackSrc="/img/product-placeholder.png"
          />
        </div>

        {/* Layer 2: 100% Uncropped Crisp Product Image */}
        <div className="dual-img-wrapper" style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
          <div className={`dual-img-primary ${secondaryImg ? 'has-secondary' : ''}`} style={{ position: 'absolute', inset: 0 }}>
            <OptimizedImage
              src={product.image || '/img/product-placeholder.png'}
              alt={product.name}
              fill
              sizes="106px"
              style={{ objectFit: 'contain', padding: '6px' }}
              priority={priority}
              fallbackSrc="/img/product-placeholder.png"
            />
          </div>
          {secondaryImg && (
            <div className="dual-img-secondary" style={{ position: 'absolute', inset: 0 }}>
              <OptimizedImage
                src={secondaryImg}
                alt={`${product.name} alternate view`}
                fill
                sizes="106px"
                style={{ objectFit: 'contain', padding: '6px' }}
                fallbackSrc="/img/product-placeholder.png"
              />
            </div>
          )}
        </div>

        {/* Discount Tag */}
        {discountPercent > 0 && (
          <span
            className="badge-shimmer"
            style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '6px',
              zIndex: 3,
              letterSpacing: '0.2px',
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.35)',
            }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(formattedId);
          }}
          style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            zIndex: 3,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            color: isInWishlist(formattedId) ? '#dc2626' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
          aria-label="Wishlist"
        >
          <i className={isInWishlist(formattedId) ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '11px' }} />
        </button>
      </div>

      {/* ── Right Product Details ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Top Badges Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.category}
          </span>
          <span
            style={{
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '1.5px 6px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-shield-alt" style={{ fontSize: '8px' }} />
            <span>COD Available</span>
          </span>
        </div>

        {/* Product Title (Rule 4: Typography Clipping Prevention leading-normal py-0.5) */}
        <h3
          className="group-hover:text-orange-600 transition-colors"
          style={{
            margin: 0,
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: '1.45',
            padding: '2px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </h3>

        {/* Rating Stars & Review Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <i
                key={i}
                className="fas fa-star"
                style={{
                  fontSize: '9px',
                  color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8' }}>
            ({product.reviewsCount || 12})
          </span>
        </div>

        {/* Bottom Pricing & Add-to-Cart Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '4px',
            gap: '8px',
          }}
        >
          {/* Price Container */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: 'var(--pd-primary, #ea580c)',
                letterSpacing: '-0.3px',
                lineHeight: '1.2',
              }}
            >
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <del style={{ fontSize: '0.74rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                Rs. {product.originalPrice.toLocaleString()}
              </del>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="btn-gradient product-card-btn flex-shrink-0"
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: adding ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '11px' }} />
            <span>{adding ? 'Added!' : 'Add'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCardList;
