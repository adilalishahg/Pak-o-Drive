'use client';

import { useState, useMemo, useCallback } from 'react';
import { IProduct, IProductVariant } from '../types';

export interface UseProductDetailProps {
  product: IProduct;
}

export function useProductDetail({ product }: UseProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant
    ? selectedVariant.originalPrice || selectedVariant.price
    : product.originalPrice || product.price;

  const currentImage = selectedVariant && selectedVariant.image ? selectedVariant.image : product.image;
  const currentDescription = selectedVariant && selectedVariant.description ? selectedVariant.description : product.description;
  const currentStock = selectedVariant !== undefined ? selectedVariant.stock : product.stock;

  const discountPercent = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const specs = useMemo(() => {
    return product.specifications ? Object.entries(product.specifications) : [];
  }, [product.specifications]);

  const cleanedDescription = useMemo(() => {
    if (!currentDescription) return '';
    return currentDescription
      .split('\n')
      .filter((line) => {
        const lower = line.toLowerCase();
        return (
          !lower.includes('pov:') &&
          !lower.includes('#tiktokmademebuyit') &&
          !lower.includes('#unboxing') &&
          !lower.includes('#viral') &&
          !lower.includes('#trending')
        );
      })
      .join('\n')
      .replace(/#\w+/g, '')
      .trim();
  }, [currentDescription]);

  const handleSelectVariant = useCallback((variant: IProductVariant) => {
    setSelectedVariant(variant);
  }, []);

  return {
    selectedVariant,
    setSelectedVariant,
    handleSelectVariant,
    currentPrice,
    currentOriginalPrice,
    currentImage,
    currentDescription,
    cleanedDescription,
    currentStock,
    discountPercent,
    specs,
  };
}
