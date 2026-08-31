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

  return (
    <article
      onClick={() => router.push(`/product/${formattedId}`)}
      className="product-card-container product-card-list-item"
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #eef2f7',
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.05)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {/* Left Media Thumbnail */}
      <div
        className="product-card-image-wrapper"
        style={{
          width: '96px',
          height: '96px',
          flexShrink: 0,
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <OptimizedImage
          src={product.image || '/img/product-placeholder.png'}
          alt={product.name}
          fill
          sizes="96px"
          style={{ objectFit: 'contain', padding: '4px' }}
          priority={priority}
          fallbackSrc="/img/product-placeholder.png"
        />

        {/* Discount Tag */}
        {discountPercent > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '8px',
              fontWeight: 800,
              padding: '2px 5px',
              borderRadius: '4px',
            }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(formattedId);
          }}
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            color: isInWishlist(formattedId) ? '#dc2626' : '#94a3b8',
          }}
          aria-label="Wishlist"
        >
          <i className={isInWishlist(formattedId) ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '10px' }} />
        </button>
      </div>

      {/* Right Product Details */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            {product.category}
          </span>
          <span
            style={{
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              fontSize: '0.6rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '4px',
            }}
          >
            COD Available
          </span>
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </h3>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
          <div style={{ display: 'flex', gap: '1px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <i
                key={i}
                className="fas fa-star"
                style={{
                  fontSize: '8px',
                  color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
            ({product.reviewsCount || 10})
          </span>
        </div>

        {/* Price & Add to Cart button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '4px',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.94rem', fontWeight: 900, color: 'var(--pd-primary, #ea580c)' }}>
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <del style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Rs. {product.originalPrice.toLocaleString()}
              </del>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="btn-gradient product-card-btn"
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: adding ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.2)',
            }}
          >
            <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '10px' }} />
            <span>{adding ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCardList;
