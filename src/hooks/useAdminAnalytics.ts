'use client';

import { useState, useEffect, useCallback } from 'react';
import { FunnelStep, AnalyticsData, AnalyticsTabKey } from '@/types';
export type { FunnelStep, AnalyticsData, AnalyticsTabKey };



export function useAdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<AnalyticsTabKey>('revenue');

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await fetch(`/api/analytics?timeframe=${timeframe}`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to load analytics.');
      }
    } catch (err: any) {
      console.error('Analytics load error:', err);
      setError(err.message || 'Error loading business intelligence data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    refreshing,
    error,
    timeframe,
    setTimeframe,
    activeTab,
    setActiveTab,
    fetchAnalytics,
  };
}
