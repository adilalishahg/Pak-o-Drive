'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { IProduct } from '../../types';
import { useSiteTheme } from '../common/DynamicThemeProvider';

interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/img/product-placeholder.png');
  const formattedId = product._id ? product._id.toString() : '';
  const { theme } = useSiteTheme();
  const isCleanWhite = theme.layoutTheme === 'theme1';

  // Check if secondary image is available for hover
  const secondaryImage = (product.images && product.images.length > 0 && product.images[0] !== product.image)
    ? product.images[0]
    : null;

  const displayImage = (isHovered && secondaryImage) ? secondaryImage : imgSrc;

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

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    router.push('/checkout');
  };

  if (isCleanWhite) {
    return (
      <article
        onClick={() => router.push(`/product/${formattedId}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group relative h-100 cursor-pointer"
        itemScope
        itemType="https://schema.org/Product"
      >
        <meta itemProp="name" content={product.name} />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm" style={{ backgroundColor: 'var(--pd-primary-dark, #c2410c)' }}>
              NEW
            </span>
          )}
        </div>

        <div className="aspect-square w-full bg-slate-50 rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-4 flex items-center justify-center p-1.5 sm:p-2 relative">
          {/* Wishlist toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(formattedId);
            }}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white bg-opacity-90 hover:bg-white hover:scale-110 shadow-sm rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all z-10 border-0"
            style={{ border: 'none', outline: 'none' }}
            aria-label="Toggle Wishlist"
          >
            <i className={`${isInWishlist(formattedId) ? 'fas fa-heart text-red-500' : 'far fa-heart text-slate-400'} text-[11px] sm:text-xs`} />
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
            <OptimizedImage
              src={displayImage}
              alt={product.name}
              fill
              sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
              className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300"
              onError={() => setImgSrc('/img/product-placeholder.png')}
              itemProp="image"
              priority={priority}
            />
          )}

          {/* COD Tag */}
          <div className="absolute bottom-1.5 left-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <i className="fas fa-truck-moving text-[8px]" /> COD
          </div>
        </div>

        <div className="flex flex-col flex-grow justify-between">
          <div>
            <h3 className="text-[12px] sm:text-xs font-semibold text-slate-800 line-clamp-2 mb-1 theme1-product-title leading-tight sm:leading-normal">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <div className="flex text-amber-400 text-[10px] sm:text-xs">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className="fas fa-star" style={{ color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0', fontSize: '9px' }} />
                ))}
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">({product.reviewsCount || 12})</span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] text-slate-400 line-through">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-2.5 sm:mt-3">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full text-[11px] sm:text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 theme1-product-btn shadow-sm"
            >
              <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'}`} style={{ fontSize: '11px' }} />
              {adding ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => router.push(`/product/${formattedId}`)}
      onMouseEnter={e => {
        setIsHovered(true);
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        setIsHovered(false);
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
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
      <div className="product-card-image-wrapper" style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        background: '#f8fafc',
        flexShrink: 0,
      }}>
        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(formattedId);
          }}
          style={{
            position: 'absolute', top: '8px', right: '8px', zIndex: 10,
            background: 'rgba(255,255,255,0.92)', border: 'none',
            borderRadius: '50%', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: isInWishlist(formattedId) ? '#dc2626' : '#9ca3af',
            transition: 'all 0.2s',
            outline: 'none',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          aria-label="Toggle Wishlist"
        >
          <i className={isInWishlist(formattedId) ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '12px' }} />
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
          <OptimizedImage
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
            style={{ objectFit: 'contain', padding: '8px', transition: 'all 0.35s ease' }}
            onError={() => setImgSrc('/img/product-placeholder.png')}
            itemProp="image"
            priority={priority}
          />
        )}

        {/* Top-Left Badges */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {discountPercent > 0 ? (
            <span style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
              fontSize: '0.62rem', fontWeight: 800,
              padding: '3px 8px', borderRadius: '20px',
              letterSpacing: '0.3px', textTransform: 'uppercase',
              boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
            }}>
              -{discountPercent}% OFF
            </span>
          ) : product.isNewArrival ? (
            <span style={{
              background: 'var(--pd-primary-dark, #c2410c)', color: '#fff',
              fontSize: '0.62rem', fontWeight: 800,
              padding: '3px 8px', borderRadius: '20px',
              textTransform: 'uppercase',
            }}>
              NEW
            </span>
          ) : null}
        </div>

        {/* Bottom-Left COD tag */}
        <div style={{
          position: 'absolute', bottom: '6px', left: '8px', zIndex: 2,
          background: 'rgba(236,253,245,0.95)', color: '#047857',
          fontSize: '0.58rem', fontWeight: 700, padding: '2px 6px',
          borderRadius: '4px', border: '1px solid #a7f3d0',
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <i className="fas fa-truck-moving" style={{ fontSize: '7px' }} />
          <span>COD Available</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="product-card-content" style={{
        padding: '12px 12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexGrow: 1,
      }}>
        {/* Name */}
        <p className="product-card-title" style={{
          margin: 0,
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#0f172a',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.2em',
        }}>
          {product.name}
        </p>

        {/* Stars */}
        <div className="product-card-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '1px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} className="fas fa-star"
                style={{ fontSize: '9px', color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
            ({product.reviewsCount || 15})
          </span>
        </div>

        {/* Price */}
        <div className="product-card-price-container" style={{ marginTop: '2px' }}>
          {product.originalPrice > product.price && (
            <del className="product-card-price-original" style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', lineHeight: 1.2 }}>
              Rs. {product.originalPrice.toLocaleString()}
            </del>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Rs.</span>
            <span className="product-card-price-current" style={{
              fontSize: '1.05rem', fontWeight: 900,
              color: 'var(--pd-primary, #ea580c)', lineHeight: 1,
            }}>
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
