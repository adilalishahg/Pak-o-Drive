'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';
import { useSiteTheme } from '../common/DynamicThemeProvider';

interface Props { product: IProduct }

export const ProductCardClassic: React.FC<Props> = ({ product }) => {
  const { addToCart, cartCount } = useCart();
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

  return (
    <div
      className="product-card-container product-card-classic-container"
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        overflow: 'hidden',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
      onClick={() => router.push(`/product/${id}`)}
    >
      {/* Image area */}
      <div 
        className="product-image-container product-card-image-wrapper"
        style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f8fafc', overflow: 'hidden' }}
        onMouseEnter={e => {
          const img = e.currentTarget.querySelector('img');
          if (img) img.style.transform = 'scale(1.06)';
        }}
        onMouseLeave={e => {
          const img = e.currentTarget.querySelector('img');
          if (img) img.style.transform = 'scale(1)';
        }}
      >
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
          <OptimizedImage
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 575px) 50vw, (max-width: 992px) 33vw, 25vw"
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onError={() => setImgSrc('/img/product-placeholder.png')}
          />
        )}

        {/* Badge */}
        {discount > 0 && (
          <span className="product-card-badge" style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'var(--bs-primary, #ea580c)', color: '#fff',
            borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 8px', letterSpacing: '0.3px',
            zIndex: 2,
          }}>
            -{discount}%
          </span>
        )}
        {product.isNewArrival && !discount && (
          <span className="product-card-badge" style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#10b981', color: '#fff',
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
      </div>

      {/* Product info */}
      <div className="product-card-content" style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Category */}
        <Link
          href={`/shop?category=${product.category}`}
          onClick={e => e.stopPropagation()}
          className="product-card-category"
          style={{
            fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'none',
            textTransform: 'capitalize', fontWeight: 500, letterSpacing: '0.3px',
          }}
        >
          {product.category}
        </Link>

        {/* Name */}
        <Link
          href={`/product/${id}`}
          onClick={e => e.stopPropagation()}
          className="product-card-title"
          style={{
            fontSize: '0.9rem', fontWeight: 600, color: '#1e293b',
            textDecoration: 'none', lineHeight: 1.4,
            display: '-webkit-box', overflow: 'hidden',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </Link>

        {/* Price row */}
        <div className="product-card-price-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span className="product-card-price-current" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bs-primary, #ea580c)' }}>
            PKR {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <del className="product-card-price-original" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              PKR {product.originalPrice.toLocaleString()}
            </del>
          )}
        </div>

        {/* Stars */}
        <div className="product-card-stars" style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className="fas fa-star"
              style={{ fontSize: '11px', color: i < rating ? 'var(--bs-primary, #ea580c)' : '#e2e8f0' }}
            />
          ))}
          {product.rating > 0 && (
            <span className="product-card-rating-text" style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>
              ({product.rating.toFixed(1)})
            </span>
          )}
        </div>
      </div>

      {/* Add to cart button and Checkout button */}
      <div className="product-card-actions" style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="product-card-btn"
          style={{
            width: '100%', border: 'none', borderRadius: '8px',
            padding: '9px 0', fontSize: '0.82rem', fontWeight: 700,
            cursor: adding ? 'default' : 'pointer', transition: 'all 0.2s',
            background: buttonBg,
            color: isModernGreen ? '#0d231d' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            boxShadow: adding 
              ? '0 3px 10px rgba(16,185,129,0.3)' 
              : `0 3px 10px color-mix(in srgb, ${primaryColor} 20%, transparent)`,
          }}
        >
          <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '12px' }} />
          {adding ? 'Added to Cart!' : 'Add to Cart'}
        </button>

        {cartCount > 0 && (
          <Link
            href="/cart"
            onClick={e => e.stopPropagation()}
            className="d-flex align-items-center justify-content-center product-card-btn"
            style={{
              width: '100%', border: '1.5px solid #111', borderRadius: '8px',
              padding: '8px 0', fontSize: '0.78rem', fontWeight: 800,
              textDecoration: 'none', color: '#111', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#111';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#fff';
              (e.currentTarget as HTMLElement).style.color = '#111';
            }}
          >
            <i className="fas fa-lock" style={{ fontSize: '10px' }} />
            Checkout
          </Link>
        )}
      </div>

      <style>{`
        .card-overlay { opacity: 0 !important; }
        div:hover > .card-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
};
