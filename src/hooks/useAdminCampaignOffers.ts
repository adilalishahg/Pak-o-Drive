'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { IProduct } from '@/types';
import { ICampaignProduct, ICampaignOfferDocument } from '@/models/CampaignOffer';

export interface CampaignOfferFormState {
  title: string;
  badge: string;
  subtitle: string;
  offerType: 'flash_sale' | 'combo_bundle';
  products: ICampaignProduct[];
  bundlePrice: number;
  expiryDate: string;
  isActive: boolean;
  bgTheme: 'dark_slate' | 'sunset_orange' | 'emerald_gold' | 'midnight_blue';
  ctaText: string;
}

const DEFAULT_FORM: CampaignOfferFormState = {
  title: '',
  badge: '🔥 SPECIAL FLASH SALE',
  subtitle: 'Handpicked auto accessories at discounted prices. Limited stock available!',
  offerType: 'flash_sale',
  products: [],
  bundlePrice: 0,
  expiryDate: '',
  isActive: true,
  bgTheme: 'dark_slate',
  ctaText: 'Claim Offer Now',
};

export function useAdminCampaignOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignOfferFormState>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Fetch offers and products catalog
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [offersRes, productsRes] = await Promise.all([
        fetch('/api/admin/campaign-offers'),
        fetch('/api/products?limit=100'),
      ]);

      const offersData = await offersRes.json();
      const productsData = await productsRes.json();

      if (offersData.success) setOffers(offersData.data || []);
      if (productsData.success) setCatalog(productsData.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter catalog for the search picker
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return catalog.slice(0, 15);
    const q = catalogSearch.toLowerCase();
    return catalog.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [catalog, catalogSearch]);

  // Total original price of selected products
  const calculatedOriginalSum = useMemo(() => {
    return form.products.reduce((acc, p) => acc + (p.originalPrice || 0), 0);
  }, [form.products]);

  // Total sale sum of selected products
  const calculatedOfferSum = useMemo(() => {
    if (form.offerType === 'combo_bundle') {
      return form.bundlePrice || calculatedOriginalSum;
    }
    return form.products.reduce((acc, p) => acc + (p.offerPrice || 0), 0);
  }, [form.offerType, form.bundlePrice, form.products, calculatedOriginalSum]);

  // Overall discount percent
  const overallDiscountPercent = useMemo(() => {
    if (calculatedOriginalSum <= 0) return 0;
    const diff = calculatedOriginalSum - calculatedOfferSum;
    return Math.max(0, Math.round((diff / calculatedOriginalSum) * 100));
  }, [calculatedOriginalSum, calculatedOfferSum]);

  // Toggle product selection
  const handleToggleProduct = useCallback((product: IProduct) => {
    setForm((prev) => {
      const exists = prev.products.some((p) => p.productId === String(product._id));
      if (exists) {
        return {
          ...prev,
          products: prev.products.filter((p) => p.productId !== String(product._id)),
        };
      } else {
        // Add new product with default 15% discount
        const original = product.price || 1000;
        const defaultDiscount = Math.round(original * 0.85);
        const newProd: ICampaignProduct = {
          productId: String(product._id),
          name: product.name,
          slug: product.slug || String(product._id),
          image: product.image || '/img/product-placeholder.png',
          originalPrice: original,
          offerPrice: defaultDiscount,
          discountPercent: 15,
        };
        return {
          ...prev,
          products: [...prev.products, newProd],
        };
      }
    });
  }, []);

  // Update specific product's offer price
  const handleProductOfferPriceChange = useCallback((productId: string, newOfferPrice: number) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.productId !== productId) return p;
        const disc = p.originalPrice > 0
          ? Math.max(0, Math.round(((p.originalPrice - newOfferPrice) / p.originalPrice) * 100))
          : 0;
        return { ...p, offerPrice: newOfferPrice, discountPercent: disc };
      }),
    }));
  }, []);

  // Reset form
  const handleResetForm = useCallback(() => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setIsModalOpen(false);
  }, []);

  // Open edit modal
  const handleEdit = useCallback((offer: any) => {
    setEditingId(offer._id);
    setForm({
      title: offer.title || '',
      badge: offer.badge || '',
      subtitle: offer.subtitle || '',
      offerType: offer.offerType || 'flash_sale',
      products: offer.products || [],
      bundlePrice: offer.bundlePrice || 0,
      expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().slice(0, 16) : '',
      isActive: offer.isActive ?? true,
      bgTheme: offer.bgTheme || 'dark_slate',
      ctaText: offer.ctaText || 'Claim Offer Now',
    });
    setIsModalOpen(true);
  }, []);

  // Toggle active status
  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/campaign-offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOffers((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isActive: !currentStatus } : !currentStatus ? { ...o, isActive: false } : o))
        );
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Submit form (Create or Update)
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.title.trim()) {
      setError('Please provide an Offer Title');
      return;
    }

    if (form.products.length < 2) {
      setError('Please select at least 2 products for this offer');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        bundleOriginalPrice: calculatedOriginalSum,
        bundlePrice: form.offerType === 'combo_bundle' ? (form.bundlePrice || calculatedOfferSum) : calculatedOfferSum,
      };

      const url = editingId ? `/api/admin/campaign-offers/${editingId}` : '/api/admin/campaign-offers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save offer');

      await fetchData();
      handleResetForm();
    } catch (err: any) {
      setError(err.message || 'Error saving offer');
    } finally {
      setSaving(false);
    }
  }, [form, editingId, calculatedOriginalSum, calculatedOfferSum, fetchData, handleResetForm]);

  // Delete offer
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/campaign-offers/${deleteTarget}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOffers((prev) => prev.filter((o) => o._id !== deleteTarget));
        setDeleteTarget(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [deleteTarget]);

  return {
    offers,
    catalog,
    filteredCatalog,
    catalogSearch,
    setCatalogSearch,
    loading,
    saving,
    error,
    setError,
    form,
    setForm,
    editingId,
    isModalOpen,
    setIsModalOpen,
    deleteTarget,
    setDeleteTarget,
    calculatedOriginalSum,
    calculatedOfferSum,
    overallDiscountPercent,
    handleToggleProduct,
    handleProductOfferPriceChange,
    handleResetForm,
    handleEdit,
    handleToggleActive,
    handleSubmit,
    handleDelete,
  };
}
