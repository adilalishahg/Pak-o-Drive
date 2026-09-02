'use client';

import { useState, useEffect, useRef } from 'react';
import { SidebarCategory } from '@/types/product';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

export const PRICE_MAX = 150000;
export const PRICE_MIN = 0;

export interface UseCategorySidebarProps {
  selectedCategory: string | null;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (min: number, max: number) => void;
  selectedRating: number | null;
}

export function useCategorySidebar({
  selectedCategory,
  priceRange,
  onPriceRangeChange,
  selectedRating,
}: UseCategorySidebarProps) {
  const [categories, setCategories] = useState<SidebarCategory[]>(DEFAULT_CATEGORIES);
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);
  const [minInput, setMinInput] = useState(String(priceRange.min));
  const [maxInput, setMaxInput] = useState(String(priceRange.max));
  const trackRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const { fetchCategoriesClient } = await import('../lib/client-cache');
        const data = await fetchCategoriesClient();
        if (data && data.length > 0 && isSubscribed) {
          const mapped = data.map((c: any) => ({
            name: c.name,
            slug: c.slug,
            icon: c.icon || 'fas fa-tag',
            parentCategory: c.parentCategory || '',
            image: c.image || '',
            productCount: Number(c.productCount ?? c.totalProductCount ?? 0)
          }));

          const hasAnyWithProducts = mapped.some((c: any) => (c.productCount || 0) > 0);
          const activeOnly = hasAnyWithProducts ? mapped.filter((c: any) => {
            if ((c.productCount || 0) > 0) return true;
            if (!c.parentCategory) {
              return mapped.some((sub: any) => sub.parentCategory === c.slug && (sub.productCount || 0) > 0);
            }
            return false;
          }) : mapped;

          setCategories(activeOnly);
        }
      } catch (err) {
        console.error('Failed to load categories client in useCategorySidebar:', err);
      }
    })();

    return () => {
      isSubscribed = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync if parent resets
  useEffect(() => {
    setLocalMin(priceRange.min);
    setLocalMax(priceRange.max);
    setMinInput(String(priceRange.min));
    setMaxInput(String(priceRange.max));
  }, [priceRange.min, priceRange.max]);

  const applyRange = (min: number, max: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onPriceRangeChange(min, max);
    }, 400);
  };

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), localMax - 500);
    setLocalMin(v);
    setMinInput(String(v));
    applyRange(v, localMax);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), localMin + 500);
    setLocalMax(v);
    setMaxInput(String(v));
    applyRange(localMin, v);
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value);
    const v = parseInt(e.target.value) || 0;
    if (!isNaN(v) && v >= PRICE_MIN && v < localMax) {
      setLocalMin(v);
      applyRange(v, localMax);
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value);
    const v = parseInt(e.target.value) || 0;
    if (!isNaN(v) && v <= PRICE_MAX && v > localMin) {
      setLocalMax(v);
      applyRange(localMin, v);
    }
  };

  const minPct = ((localMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((localMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const hasFilters = Boolean(
    selectedCategory ||
    selectedRating ||
    priceRange.max < PRICE_MAX ||
    priceRange.min > PRICE_MIN
  );

  return {
    categories,
    localMin,
    localMax,
    minInput,
    maxInput,
    minPct,
    maxPct,
    hasFilters,
    trackRef,
    handleMinSlider,
    handleMaxSlider,
    handleMinInput,
    handleMaxInput,
  };
}
