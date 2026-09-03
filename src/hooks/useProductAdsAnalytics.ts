'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { IProductAdAnalytics, ProductAdsAnalyticsResponse, ProductAdsScope, ProductAdsSortBy } from '../types/productAds';

export function useProductAdsAnalytics() {
  const [scope, setScope] = useState<ProductAdsScope>('my_products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<ProductAdsSortBy>('ads_desc');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<IProductAdAnalytics[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [summary, setSummary] = useState({
    totalActiveAdsPK: 0,
    totalTrackedSalesPKR: 0,
    totalUnitsSold: 0,
    topPerformingCategory: 'General',
    activeCampaignsCount: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('scope', scope);
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/admin/products/ads-analytics?${params.toString()}`, {
        headers: {
          authorization: 'Bearer pakodrive_admin_secret_token',
        },
      });

      const json: ProductAdsAnalyticsResponse = await res.json();

      if (json.success) {
        setProducts(json.products || []);
        setCategories(json.categories || []);
        if (json.summary) {
          setSummary(json.summary);
        }
      } else {
        throw new Error(json.error || 'Failed to load product ad analytics');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading product ad analytics');
    } finally {
      setLoading(false);
    }
  }, [scope, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side sort options (defaulting to ads_desc)
  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'ads_desc':
        return list.sort((a, b) => b.activeAdsCountPK - a.activeAdsCountPK);
      case 'sales_desc':
        return list.sort((a, b) => b.totalSold - a.totalSold);
      case 'demand_desc':
        return list.sort((a, b) => b.demandScore - a.demandScore);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      default:
        return list.sort((a, b) => b.activeAdsCountPK - a.activeAdsCountPK);
    }
  }, [products, sortBy]);

  return {
    scope,
    setScope,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    error,
    products: sortedProducts,
    categories,
    summary,
    refetch: fetchData,
  };
}
