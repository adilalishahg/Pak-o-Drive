'use client';

import { useState, useEffect, useCallback } from 'react';
import { ISingleProductAdDetails } from '../types/productAds';

export function useSingleProductAds(productId: string) {
  const [details, setDetails] = useState<ISingleProductAdDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'top_ads' | 'hooks' | 'blueprint' | 'competitor' | 'targeting'>('top_ads');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/ads-analytics/${productId}`, {
        headers: {
          authorization: 'Bearer pakodrive_admin_secret_token',
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDetails(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch single product ad intelligence');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching ad intelligence');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const copyToClipboard = useCallback((text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  }, []);

  return {
    details,
    loading,
    error,
    activeTab,
    setActiveTab,
    copiedKey,
    copyToClipboard,
    refetch: fetchDetails,
  };
}
