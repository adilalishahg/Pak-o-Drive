'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

export interface ProductData {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  stock: number;
  image: string;
  rating: number;
}

export function useAdminProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        throw new Error(json.error || 'Failed to load products');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading products database.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget.id));
        setToast(`Product "${deleteTarget.name}" deleted successfully.`);
        setTimeout(() => setToast(null), 3500);
      } else {
        setError(json.error || 'Failed to delete product.');
      }
    } catch {
      setError('Network error, could not delete product.');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const markImageFailed = useCallback((id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        filterCategory === 'All' || p.category.toLowerCase() === filterCategory.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, searchQuery]);

  return {
    products,
    categories,
    loading,
    error,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    failedImages,
    markImageFailed,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    toast,
    confirmDelete,
    filteredProducts,
    fetchProducts,
  };
}
