'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';
import { useSiteTheme } from '../common/DynamicThemeProvider';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/img/product-placeholder.png');
  const formattedId = product._id ? product._id.toString() : '';
  const { theme } = useSiteTheme();
  const isCleanWhite = theme.layoutTheme === 'theme1';

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

  if (isCleanWhite) {
    return (
      <article
        onClick={() => router.push(`/product/${formattedId}`)}
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group relative h-100 cursor-pointer"
        itemScope
        itemType="https://schema.org/Product"
      >
        <meta itemProp="name" content={product.name} />
        {discountPercent > 0 ? (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
            -{discountPercent}%
          </span>
        ) : product.isNewArrival ? (
          <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10" style={{ backgroundColor: theme.primaryColor }}>
            New
          </span>
        ) : null}

        <div className="aspect-square w-full bg-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-2 relative">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
            className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc('/img/product-placeholder.png')}
            itemProp="image"
          />
        </div>

        <div className="flex flex-col flex-grow justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 mb-1 theme1-product-title">
              <Link href={`/product/${formattedId}`} onClick={e => e.stopPropagation()}>
                {product.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400 text-xs">&#9733;</span>
              <span className="text-[10px] font-medium text-slate-500">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-slate-900">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] text-slate-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full mt-4 text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 theme1-product-btn"
          >
            <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '11px' }} />
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => router.push(`/product/${formattedId}`)}
      className="pd-card product-item"
      style={{
        cursor: 'pointer',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />

      {/* ── Image ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        background: '#f5f5f5',
        flexShrink: 0,
      }}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
          style={{ objectFit: 'cover', transition: 'transform 0.35s ease' }}
          onError={() => setImgSrc('/img/product-placeholder.png')}
          onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'}
          onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
          itemProp="image"
        />

        {/* Badge */}
        {discountPercent > 0 ? (
          <span style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: '#dc2626', color: '#fff',
            fontSize: '0.6rem', fontWeight: 800,
            padding: '3px 7px', borderRadius: '4px',
            letterSpacing: '0.3px', textTransform: 'uppercase',
          }}>-{discountPercent}% OFF</span>
        ) : product.isNewArrival ? (
          <span style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 2,
            background: 'var(--pd-primary)', color: '#fff',
            fontSize: '0.6rem', fontWeight: 800,
            padding: '3px 7px', borderRadius: '4px',
            textTransform: 'uppercase',
          }}>NEW</span>
        ) : null}
      </div>

      {/* ── Content ── */}
      <div style={{
        padding: '10px 10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexGrow: 1,
      }}>
        {/* Name */}
        <p style={{
          margin: 0,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#111827',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.18em',
        }}>
          {product.name}
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} className="fas fa-star"
              style={{ fontSize: '10px', color: i < Math.floor(product.rating) ? '#f59e0b' : '#d1d5db' }} />
          ))}
        </div>

        {/* Price */}
        <div>
          {product.originalPrice > product.price && (
            <del style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', lineHeight: 1.2 }}>
              PKR {product.originalPrice.toLocaleString()}
            </del>
          )}
          <span style={{
            fontSize: '0.95rem', fontWeight: 800,
            color: 'var(--pd-primary)', lineHeight: 1,
          }}>
            PKR {product.price.toLocaleString()}
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="btn-gradient"
          style={{
            border: 'none',
            borderRadius: '6px',
            padding: '9px 8px',
            fontSize: '0.74rem',
            fontWeight: 700,
            width: '100%',
            cursor: adding ? 'default' : 'pointer',
            opacity: adding ? 0.8 : 1,
          }}
        >
          <i
            className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`}
            style={{ fontSize: '11px' }}
          />
          {adding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
};
