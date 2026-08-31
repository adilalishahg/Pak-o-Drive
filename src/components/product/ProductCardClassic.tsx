'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { IProduct } from '../../types';
import { useSiteTheme } from '../common/DynamicThemeProvider';

interface Props { product: IProduct; priority?: boolean; }

export const ProductCardClassic: React.FC<Props> = ({ product, priority }) => {
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/img/product-placeholder.png');
  const id = product._id?.toString() || '';
  const { theme } = useSiteTheme();

  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  const primaryColor = isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary, #ea580c)');
  const buttonBg = adding
    ? '#10b981'
    : `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 82%, #000))`;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 900);
  };

  const rating = Math.min(5, Math.max(0, Math.floor(product.rating || 0)));

  const secondaryImg = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div
      className="product-card-container product-card-classic-container card-hover-lift group"
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onClick={() => router.push(`/product/${id}`)}
    >
      {/* Image area */}
      <div 
        className="product-image-container product-card-image-wrapper"
        style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f8fafc', overflow: 'hidden' }}
      >
        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(id);
          }}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 10,
            background: 'rgba(255,255,255,0.92)', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: isInWishlist(id) ? '#dc2626' : '#9ca3af',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s',
            outline: 'none',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          aria-label="Toggle Wishlist"
        >
          <i className={isInWishlist(id) ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '12px' }} />
        </button>

        {product.video ? (
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
          <div className="dual-img-wrapper">
            <div className={`dual-img-primary ${secondaryImg ? 'has-secondary' : ''}`} style={{ position: 'absolute', inset: 0 }}>
              <OptimizedImage
                src={imgSrc}
                alt={product.name}
                fill
                sizes="(max-width: 575px) 50vw, (max-width: 992px) 33vw, 25vw"
                style={{ objectFit: 'cover' }}
                onError={() => setImgSrc('/img/product-placeholder.png')}
                priority={priority}
              />
            </div>
            {secondaryImg && (
              <div className="dual-img-secondary">
                <OptimizedImage
                  src={secondaryImg}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 575px) 50vw, (max-width: 992px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Badge */}
        {discount > 0 && (
          <span className="product-card-badge badge-shimmer" style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'var(--pd-primary-dark, #c2410c)', color: '#fff',
            borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 8px', letterSpacing: '0.3px',
            zIndex: 2,
          }}>
            -{discount}%
          </span>
        )}
        {product.isNewArrival && !discount && (
          <span className="product-card-badge badge-shimmer" style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#047857', color: '#fff',
            borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 8px',
            zIndex: 2,
          }}>
            New
          </span>
        )}

        {/* Hover quick-view overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.22s',
        }}
          className="card-overlay"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
        >
          <Link
            href={`/product/${id}`}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', color: '#0f172a',
              borderRadius: '8px', padding: '8px 16px',
              fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <i className="fas fa-eye" style={{ fontSize: '12px' }} /> Quick View
          </Link>
        </div>
        {/* Bottom-Left COD tag */}
        <div style={{
          position: 'absolute', bottom: '6px', left: '8px', zIndex: 2,
          background: 'rgba(236,253,245,0.95)', color: '#047857',
          fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px',
          borderRadius: '4px', border: '1px solid #a7f3d0',
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <i className="fas fa-truck-moving" style={{ fontSize: '8px' }} />
          <span>COD</span>
        </div>
      </div>

      {/* Product info */}
      <div className="product-card-content" style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Category */}
        <span
          className="product-card-category"
          style={{
            fontSize: '0.72rem', color: '#576574', textDecoration: 'none',
            textTransform: 'capitalize', fontWeight: 500, letterSpacing: '0.3px',
          }}
        >
          {product.category}
        </span>

        {/* Name */}
        <span
          className="product-card-title"
          style={{
            fontSize: '0.9rem', fontWeight: 600, color: '#1e293b',
            textDecoration: 'none', lineHeight: 1.4,
            display: '-webkit-box', overflow: 'hidden',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </span>

        {/* Price row */}
        <div className="product-card-price-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span className="product-card-price-current" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pd-primary-dark, #c2410c)' }}>
            Rs. {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <del className="product-card-price-original" style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Rs. {product.originalPrice.toLocaleString()}
            </del>
          )}
        </div>

        {/* Stars */}
        <div className="product-card-stars" style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className="fas fa-star"
              style={{ fontSize: '11px', color: i < rating ? 'var(--pd-primary-dark, #c2410c)' : '#e2e8f0' }}
            />
          ))}
          {product.rating > 0 && (
            <span className="product-card-rating-text" style={{ fontSize: '0.72rem', color: '#576574', marginLeft: '4px' }}>
              ({product.rating.toFixed(1)})
            </span>
          )}
        </div>
      </div>

      {/* Add to cart button */}
      <div className="product-card-actions" style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="product-card-btn"
          style={{
            width: '100%', border: 'none', borderRadius: '8px',
            padding: '8px 0', fontSize: '0.78rem', fontWeight: 700,
            cursor: adding ? 'default' : 'pointer', transition: 'all 0.2s',
            background: buttonBg,
            color: isModernGreen ? '#0d231d' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: adding 
              ? '0 3px 10px rgba(16,185,129,0.3)' 
              : `0 3px 10px color-mix(in srgb, ${primaryColor} 20%, transparent)`,
          }}
        >
          <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '11px' }} />
          {adding ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>

      <style>{`
        .card-overlay { opacity: 0 !important; }
        div:hover > .card-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
};
