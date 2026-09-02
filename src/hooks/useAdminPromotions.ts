'use client';

import { useState, useEffect } from 'react';
import { PromoData } from '@/types';

export function useAdminPromotions() {
  const [promos, setPromos] = useState<PromoData[]>([]);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPromos();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpiryDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  async function fetchPromos() {
    try {
      setLoading(true);
      const res = await fetch('/api/promotions');
      const json = await res.json();
      if (json.success) {
        setPromos(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch promotions');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching promotions data.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent || !expiryDate) return;
    setSaving(true);
    setError('');

    const payload = {
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      expiryDate: new Date(expiryDate),
      isActive,
    };

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setPromos([json.data, ...promos]);
        setCode('');
        setDiscountPercent('10');
        setIsActive(true);
      } else {
        throw new Error(json.error || 'Failed to save coupon code');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while creating promo code.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setPromos(promos.map((p) => (p._id === id ? { ...p, isActive: !currentStatus } : p)));
      } else {
        setError(json.error || 'Failed to toggle status.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error saving status changes.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/promotions/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setPromos(promos.filter((p) => p._id !== deleteTarget.id));
      } else {
        setError(json.error || 'Failed to delete coupon.');
      }
    } catch {
      setError('Network error, could not delete coupon.');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  return {
    promos,
    code,
    setCode,
    discountPercent,
    setDiscountPercent,
    expiryDate,
    setExpiryDate,
    isActive,
    setIsActive,
    loading,
    saving,
    error,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleSubmit,
    handleToggleActive,
    confirmDelete,
  };
}
