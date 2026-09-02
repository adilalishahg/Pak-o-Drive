'use client';

import { useState } from 'react';
import { IOrder } from '@/types';

export function useOrderTracking() {
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrders([]);
    setSearched(false);

    if (!inputValue.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }

    try {
      setLoading(true);
      const payload =
        searchType === 'email'
          ? { email: inputValue.trim() }
          : { phone: inputValue.trim() };

      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error || 'No orders found.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const toggleExpand = (id: string | null) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return {
    searchType,
    setSearchType,
    inputValue,
    setInputValue,
    orders,
    loading,
    error,
    setError,
    searched,
    expandedId,
    toggleExpand,
    handleSearch,
  };
}
