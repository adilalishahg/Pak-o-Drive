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

  const { overviewDescription, featuresDescription, cleanedDescription } = useMemo(() => {
    if (!currentDescription) {
      return { overviewDescription: '', featuresDescription: '', cleanedDescription: '' };
    }

    const cleaned = currentDescription
      .split('\n')
      .filter((line) => {
        const lower = line.toLowerCase();
        return (
          !lower.includes('#tiktokmademebuyit') &&
          !lower.includes('#unboxing') &&
          !lower.includes('#viral') &&
          !lower.includes('#trending') &&
          !lower.includes('#pakodrive') &&
          !lower.includes('#carmirrors')
        );
      })
      .join('\n')
      .replace(/#\w+/g, '')
      .trim();

    const splitRegex = /(?:\n\s*|\n)(?=[*_~`\s]*(?:✅|\u2705|\u2714)?\s*[*_~`\s]*(?:Why You Need This|Key Features|Features|Highlights|What's Included)\b)/i;
    const idx = cleaned.search(splitRegex);

    if (idx > 0) {
      return {
        overviewDescription: cleaned.substring(0, idx).trim(),
        featuresDescription: cleaned.substring(idx).trim(),
        cleanedDescription: cleaned,
      };
    }

    // If no explicit header, check if multiple paragraphs
    const paragraphs = cleaned.split(/\n\s*\n/);
    if (paragraphs.length > 1) {
      return {
        overviewDescription: paragraphs[0].trim(),
        featuresDescription: paragraphs.slice(1).join('\n\n').trim(),
        cleanedDescription: cleaned,
      };
    }

    return {
      overviewDescription: cleaned,
      featuresDescription: '',
      cleanedDescription: cleaned,
    };
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
    overviewDescription,
    featuresDescription,
    currentStock,
    discountPercent,
    specs,
  };
}
