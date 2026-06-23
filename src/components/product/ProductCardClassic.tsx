'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';

interface Props { product: IProduct }

export const ProductCardClassic: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/img/product-placeholder.png');
  const id = product._id?.toString() || '';

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
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f8fafc', overflow: 'hidden' }}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 575px) 50vw, (max-width: 992px) 33vw, 25vw"
          style={{ objectFit: 'contain', padding: '14px', transition: 'transform 0.4s ease' }}
          onError={() => setImgSrc('/img/product-placeholder.png')}
        />

        {/* Badge */}
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'var(--bs-primary, #ea580c)', color: '#fff',
            borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 8px', letterSpacing: '0.3px',
          }}>
            -{discount}%
          </span>
        )}
        {product.isNewArrival && !discount && (
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#10b981', color: '#fff',
            borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 8px',
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
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Category */}
        <Link
          href={`/shop?category=${product.category}`}
          onClick={e => e.stopPropagation()}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bs-primary, #ea580c)' }}>
            PKR {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <del style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              PKR {product.originalPrice.toLocaleString()}
            </del>
          )}
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className="fas fa-star"
              style={{ fontSize: '11px', color: i < rating ? 'var(--bs-primary, #ea580c)' : '#e2e8f0' }}
            />
          ))}
          {product.rating > 0 && (
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>
              ({product.rating.toFixed(1)})
            </span>
          )}
        </div>
      </div>

      {/* Add to cart button */}
      <div style={{ padding: '0 14px 14px' }}>
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            width: '100%', border: 'none', borderRadius: '8px',
            padding: '9px 0', fontSize: '0.82rem', fontWeight: 700,
            cursor: adding ? 'default' : 'pointer', transition: 'all 0.2s',
            background: adding
              ? '#10b981'
              : 'linear-gradient(135deg, var(--bs-primary, #ea580c), #c2410c)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            boxShadow: adding ? '0 3px 10px rgba(16,185,129,0.3)' : '0 3px 10px rgba(234,88,12,0.25)',
          }}
        >
          <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '12px' }} />
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
