'use client';

import React from 'react';
import { ProductCardProps } from '@/types/product';
import { useProductCard } from '@/hooks/useProductCard';
import { ProductCardCleanWhite } from './ProductCardCleanWhite';
import { ProductCardModern } from './ProductCardModern';

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

  if (isCleanWhite) {
    return (
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
    );
  }

  return (
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
};
