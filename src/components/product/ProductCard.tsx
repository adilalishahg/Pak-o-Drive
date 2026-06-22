'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/img/product-placeholder.png');
  const formattedId = product._id ? product._id.toString() : '';

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 900);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <i key={i}
        className={`fas fa-star ${i < Math.floor(rating) ? 'text-warning' : 'text-muted'}`}
        style={{ fontSize: '11px' }} />
    ));

  return (
    <article
      onClick={() => router.push(`/product/${formattedId}`)}
      style={{ cursor: 'pointer', background: '#fff', display: 'flex', flexDirection: 'column' }}
      itemScope itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />

      {/* ── Image — full bleed, no padding, no radius ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
          style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onError={() => setImgSrc('/img/product-placeholder.png')}
          onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
          onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
          itemProp="image"
        />

        {/* Discount badge — red pill top-left */}
        {discountPercent > 0 && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: '#e00', color: '#fff',
            fontSize: '0.65rem', fontWeight: 800,
            padding: '3px 8px', borderRadius: '3px',
            letterSpacing: '0.3px',
          }}>-{discountPercent}% OFF</span>
        )}
        {product.isNewArrival && !discountPercent && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: 'var(--pd-primary)', color: '#fff',
            fontSize: '0.65rem', fontWeight: 800,
            padding: '3px 8px', borderRadius: '3px',
          }}>NEW</span>
        )}
      </div>

      {/* ── Info below image ── */}
      <div style={{ padding: '8px 4px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>

        {/* Name — bold uppercase like reference */}
        <p style={{
          margin: 0,
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#111',
          lineHeight: 1.35,
          textTransform: 'uppercase',
          letterSpacing: '0.2px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {renderStars(product.rating)}
          {product.reviewsCount > 0 && (
            <span style={{ fontSize: '0.62rem', color: '#888', marginLeft: '2px' }}>({product.reviewsCount})</span>
          )}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '2px' }}>
          {product.originalPrice > product.price && (
            <del style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1 }}>
              PKR {product.originalPrice.toLocaleString()}
            </del>
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--pd-primary)', lineHeight: 1 }}>
            PKR {product.price.toLocaleString()}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="btn-gradient"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            border: 'none', borderRadius: '4px',
            padding: '8px 6px',
            fontSize: '0.72rem', fontWeight: 700,
            width: '100%', cursor: adding ? 'default' : 'pointer',
            whiteSpace: 'nowrap', lineHeight: 1,
            marginTop: '6px',
            opacity: adding ? 0.8 : 1,
          }}
        >
          <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '10px' }} />
          {adding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
};
