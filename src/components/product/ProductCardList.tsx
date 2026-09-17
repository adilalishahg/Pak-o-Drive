'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { SpotlightCard } from '../ui/SpotlightCard';
import { useProductCard } from '@/hooks/useProductCard';
import { ProductCardListProps } from '@/types/product';

export const ProductCardList: React.FC<ProductCardListProps> = ({ product, priority }) => {
  const {
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
  } = useProductCard({ product });

  const secondaryImg =
    product.images && product.images.length > 0 && product.images[0] !== product.image
      ? product.images[0]
      : null;

  return (
    <SpotlightCard
      spotlightColor="rgba(234, 88, 12, 0.08)"
      borderColor="rgba(234, 88, 12, 0.28)"
      size={320}
      className="w-full rounded-xl sm:rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200"
    >
      <article
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="product-card-container product-card-list-item group relative flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3.5 cursor-pointer w-full"
        itemScope
        itemType="https://schema.org/Product"
      >
        <meta itemProp="name" content={product.name} />

        {/* ── Left Media Thumbnail (Rule 3: Dual-Layer Uncropped Media Presentation) ── */}
        <div className="product-card-image-wrapper relative flex-shrink-0 w-[104px] h-[104px] sm:w-[128px] sm:h-[128px] md:w-[136px] md:h-[136px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
          {/* Layer 1: Ambient Blur Backdrop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <OptimizedImage
              src={displayImage || '/img/product-placeholder.png'}
              alt=""
              fill
              sizes="(max-width: 640px) 104px, 136px"
              className="object-cover blur-xl opacity-35 scale-125 pointer-events-none"
              fallbackSrc="/img/product-placeholder.png"
            />
          </div>

          {/* Layer 2: 100% Uncropped Crisp Product Image */}
          <div className="dual-img-wrapper relative w-full h-full z-[1]">
            <div
              className={`dual-img-primary ${secondaryImg ? 'has-secondary' : ''} absolute inset-0`}
            >
              <OptimizedImage
                src={displayImage || '/img/product-placeholder.png'}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 104px, 136px"
                className="object-contain p-1.5 sm:p-2 group-hover:scale-105 transition-transform duration-300"
                priority={priority}
                onError={handleImageError}
                fallbackSrc="/img/product-placeholder.png"
                itemProp="image"
              />
            </div>
            {secondaryImg && (
              <div className="dual-img-secondary absolute inset-0">
                <OptimizedImage
                  src={secondaryImg}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 640px) 104px, 136px"
                  className="object-contain p-1.5 sm:p-2"
                  fallbackSrc="/img/product-placeholder.png"
                />
              </div>
            )}
          </div>

          {/* Top-Left Discount or New Tag */}
          {discountPercent > 0 ? (
            <span className="badge-shimmer absolute top-1.5 left-1.5 z-[3] bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm leading-normal">
              -{discountPercent}%
            </span>
          ) : product.isNewArrival ? (
            <span
              className="badge-shimmer absolute top-1.5 left-1.5 z-[3] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm leading-normal"
              style={{ backgroundColor: 'var(--pd-primary-dark, #c2410c)' }}
            >
              NEW
            </span>
          ) : null}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute bottom-1.5 right-1.5 z-[3] bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-all text-slate-400 hover:text-red-500"
            aria-label="Wishlist"
          >
            <i
              className={`${inWishlist ? 'fas fa-heart text-red-500' : 'far fa-heart text-slate-400'} text-[10px] sm:text-[11px]`}
            />
          </button>
        </div>

        {/* ── Right Product Details ── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 self-stretch pr-1 sm:pr-0">
          {/* Top Badges Row */}
          <div className="flex items-center justify-between gap-1.5 mb-0.5">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {product.category || 'Automotive'}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 leading-normal">
              <i className="fas fa-truck-moving text-[8px]" />
              <span>COD Available</span>
            </span>
          </div>

          {/* Product Title (Rule 4: Typography Clipping Prevention leading-normal py-0.5) */}
          <Link
            href={`/product/${formattedId}`}
            prefetch={true}
            scroll={true}
            onClick={(e) => e.stopPropagation()}
            className="text-decoration-none block my-0.5 min-w-0"
          >
            <h3 className="text-[12.5px] sm:text-[14.5px] font-bold text-slate-800 line-clamp-2 leading-snug py-0.5 group-hover:text-orange-600 transition-colors m-0">
              {product.name}
            </h3>
          </Link>

          {/* Rating Stars & Review Count */}
          <div className="flex items-center gap-1.5 my-0.5">
            <div className="flex text-amber-400 text-[9px] sm:text-[10px]">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className="fas fa-star"
                  style={{
                    color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0',
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">
              ({product.reviewsCount || 14})
            </span>
          </div>

          {/* Bottom Pricing & Add-to-Cart Action Bar */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            {/* Price Container (Stacked on mobile to preserve layout integrity) */}
            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-baseline gap-1 leading-normal py-0.5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">Rs.</span>
                <span className="text-[14px] sm:text-base font-black text-orange-600 leading-normal">
                  {product.price.toLocaleString()}
                </span>
              </div>
              {product.originalPrice > product.price && (
                <del className="text-[9.5px] sm:text-xs text-slate-400 line-through leading-normal -mt-1">
                  Rs. {product.originalPrice.toLocaleString()}
                </del>
              )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="btn-gradient product-card-btn flex-shrink-0 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 !rounded-xl text-[11px] sm:text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border-0"
            >
              <i
                className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'} text-[10px] sm:text-[11px]`}
              />
              <span className="hidden sm:inline">{adding ? 'Added!' : 'Add to Cart'}</span>
              <span className="sm:hidden">{adding ? 'Added!' : 'Add'}</span>
            </button>
          </div>
        </div>
      </article>
    </SpotlightCard>
  );
};

export default ProductCardList;
