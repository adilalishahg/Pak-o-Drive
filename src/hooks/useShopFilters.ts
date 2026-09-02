'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { IProduct } from '@/types';

export interface ShopFiltersHookOptions {
  initialProducts: IProduct[];
}

export interface ShopFiltersHookReturn {
  products: IProduct[];
  sortedProducts: IProduct[];
  loading: boolean;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string | null;
  setSearchQuery: (query: string | null) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  keywords: string;
  setKeywords: (kw: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  mobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
  handleReset: () => void;
  hasFilters: boolean;
}

export function useShopFilters({ initialProducts }: ShopFiltersHookOptions): ShopFiltersHookReturn {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState<string | null>(searchParams.get('search'));
  const [priceRange, setPriceRange] = useState({ min: 0, max: 150000 });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [keywords, setKeywords] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  /* Sync URL params */
  useEffect(() => {
    setSelectedCategory(searchParams.get('category'));
    setSearchQuery(searchParams.get('search'));
  }, [searchParams]);

  /* Fetch filtered products when user changes filters */
  useEffect(() => {
    // If default state, keep initialProducts
    if (!selectedCategory && !searchQuery && priceRange.min === 0 && priceRange.max === 150000 && !selectedRating) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        let url = '/api/products?';
        if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
        if (priceRange.min > 0) url += `minPrice=${priceRange.min}&`;
        if (priceRange.max < 150000) url += `maxPrice=${priceRange.max}&`;
        if (selectedRating) url += `rating=${selectedRating}&`;
        url = url.replace(/[&?]$/, '');
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && data.success) setProducts(data.data);
      } catch { }
      finally { if (isMounted) setLoading(false); }
    })();

    return () => { isMounted = false; };
  }, [selectedCategory, searchQuery, priceRange, selectedRating, initialProducts]);

  const handleReset = () => {
    setSelectedCategory(null);
    setSearchQuery(null);
    setPriceRange({ min: 0, max: 150000 });
    setSelectedRating(null);
    setSortBy('default');
    setKeywords('');
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      return 0;
    });
  }, [products, sortBy]);

  const hasFilters = !!(selectedCategory || selectedRating || priceRange.max < 150000 || searchQuery);

  return {
    products,
    sortedProducts,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
    selectedRating,
    setSelectedRating,
    sortBy,
    setSortBy,
    keywords,
    setKeywords,
    viewMode,
    setViewMode,
    mobileFilterOpen,
    setMobileFilterOpen,
    handleReset,
    hasFilters,
  };
}
