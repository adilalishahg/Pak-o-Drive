'use client';

import { useState, useEffect } from 'react';
import { Subscriber } from '@/types';

export function useAdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/newsletter');
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data || []);
      } else {
        throw new Error(json.error || 'Failed to retrieve newsletter subscribers.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setError('');
    setSuccess('');
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/newsletter?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setSuccess('Subscriber removed successfully!');
        setSubscribers((prev) => prev.filter((sub) => sub._id !== deleteTarget.id));
        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(json.error || 'Failed to unsubscribe user.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete subscriber.');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    subscribers,
    filteredSubscribers,
    loading,
    error,
    success,
    searchQuery,
    setSearchQuery,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    confirmDelete,
  };
}
