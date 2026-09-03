'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { IProduct } from '@/types';
import { useCart } from '@/context/CartContext';

export interface UseFrequentlyBoughtTogetherProps {
  currentProduct: IProduct;
}

export function useFrequentlyBoughtTogether({ currentProduct }: UseFrequentlyBoughtTogetherProps) {
  const { addToCart } = useCart();
  const [companionProduct, setCompanionProduct] = useState<IProduct | null>(null);
  const [includeCompanion, setIncludeCompanion] = useState(true);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch products in the same category or utility accessories
        const res = await fetch(`/api/products?category=${encodeURIComponent(currentProduct.category || '')}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          // Exclude current product and pick a complementary accessory
          const companions = data.data.filter((p: IProduct) => p._id !== currentProduct._id);
          if (companions.length > 0) {
            setCompanionProduct(companions[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load bundle product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [currentProduct._id, currentProduct.category]);

  const rawTotal = useMemo(() => {
    const mainPrice = currentProduct.price || 0;
    const compPrice = includeCompanion && companionProduct ? companionProduct.price : 0;
    return mainPrice + compPrice;
  }, [currentProduct.price, companionProduct, includeCompanion]);

  // Apply bundle discount if companion is included (e.g. 8% discount, min Rs. 100)
  const discountSavings = useMemo(() => {
    if (!includeCompanion || !companionProduct) return 0;
    return Math.max(100, Math.round(rawTotal * 0.08));
  }, [includeCompanion, companionProduct, rawTotal]);

  const bundleFinalPrice = useMemo(() => {
    return Math.max(0, rawTotal - discountSavings);
  }, [rawTotal, discountSavings]);

  const handleAddBundle = useCallback(() => {
    // Add current product
    addToCart(currentProduct, 1);
    // Add companion if selected
    if (includeCompanion && companionProduct) {
      addToCart(companionProduct, 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }, [addToCart, currentProduct, includeCompanion, companionProduct]);

  return {
    companionProduct,
    includeCompanion,
    setIncludeCompanion,
    loading,
    added,
    rawTotal,
    discountSavings,
    bundleFinalPrice,
    handleAddBundle,
  };
}
