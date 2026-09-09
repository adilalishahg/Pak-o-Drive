'use client';

import React from 'react';
import { ProductCardProps } from '@/types/product';
import { useProductCard } from '@/hooks/useProductCard';
import { ProductCardCleanWhite } from './ProductCardCleanWhite';
import { ProductCardModern } from './ProductCardModern';
import { SpotlightCard } from '../ui/SpotlightCard';

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const {
    isCleanWhite,
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

  const cardContent = isCleanWhite ? (
    <ProductCardCleanWhite
      product={product}
      priority={priority}
      formattedId={formattedId}
      adding={adding}
      displayImage={displayImage}
      discountPercent={discountPercent}
      inWishlist={inWishlist}
      handleAddToCart={handleAddToCart}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      handleCardClick={handleCardClick}
      handleToggleWishlist={handleToggleWishlist}
      handleImageError={handleImageError}
    />
  ) : (
    <ProductCardModern
      product={product}
      priority={priority}
      formattedId={formattedId}
      adding={adding}
      displayImage={displayImage}
      discountPercent={discountPercent}
      inWishlist={inWishlist}
      handleAddToCart={handleAddToCart}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      handleCardClick={handleCardClick}
      handleToggleWishlist={handleToggleWishlist}
      handleImageError={handleImageError}
    />
  );

  return (
    <SpotlightCard
      spotlightColor="rgba(234, 88, 12, 0.08)"
      borderColor="rgba(234, 88, 12, 0.28)"
      size={260}
      className="h-full rounded-[12px]"
    >
      {cardContent}
    </SpotlightCard>
  );
};
