'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { IProduct } from '@/types';

export interface ProductCardCleanWhiteProps {
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

export const ProductCardCleanWhite: React.FC<ProductCardCleanWhiteProps> = ({
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
      className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group relative h-100 cursor-pointer"
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />

      {/* Top Badges */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
        {discountPercent > 0 && (
          <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm leading-normal">
            -{discountPercent}% OFF
          </span>
        )}
        {product.isNewArrival && (
          <span
            className="text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm leading-normal"
            style={{ backgroundColor: 'var(--pd-primary-dark, #c2410c)' }}
          >
            NEW
          </span>
        )}
      </div>

      <Link
        href={`/product/${formattedId}`}
        prefetch={true}
        className="aspect-square w-full bg-slate-50 rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-4 flex items-center justify-center p-1.5 sm:p-2 relative text-decoration-none block group/img"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wishlist toggle */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white bg-opacity-90 hover:bg-white hover:scale-110 shadow-sm rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all z-10 border-0"
          style={{ border: 'none', outline: 'none' }}
          aria-label="Toggle Wishlist"
        >
          <i className={`${inWishlist ? 'fas fa-heart text-red-500' : 'far fa-heart text-slate-400'} text-[11px] sm:text-xs`} />
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
            className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-all duration-300"
            onError={handleImageError}
            itemProp="image"
            priority={priority}
          />
        )}

        {/* COD Tag */}
        <div className="absolute bottom-1.5 left-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-normal">
          <i className="fas fa-truck-moving text-[8px]" /> COD
        </div>
      </Link>

      <div className="flex flex-col flex-grow justify-between">
        <div>
          <Link
            href={`/product/${formattedId}`}
            prefetch={true}
            className="text-decoration-none block"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[12px] sm:text-xs font-semibold text-slate-800 line-clamp-2 mb-1 theme1-product-title leading-normal py-0.5 hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <div className="flex text-amber-400 text-[10px] sm:text-xs">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className="fas fa-star" style={{ color: i < Math.floor(product.rating || 5) ? '#f59e0b' : '#e2e8f0', fontSize: '9px' }} />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">({product.reviewsCount || 12})</span>
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-normal">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-slate-400 line-through leading-normal">Rs. {product.originalPrice.toLocaleString()}</span>
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
};
