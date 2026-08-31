'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FunnelStep {
  step: number;
  label: string;
  description: string;
  count: number;
  conversionFromPrevious: number;
  conversionToEnd: number;
}

export interface AnalyticsData {
  stats: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    conversionRate: number;
    uniqueSessionsCount: number;
    products?: number;
    unreadContacts?: number;
    activePromos?: number;
    pageviews?: number;
    cartClicks?: number;
    whatsappClicks?: number;
    searchesCount?: number;
    abandonedCartLeak?: number;
  };
  marketing: Array<{
    source: string;
    visits: number;
    add_to_carts: number;
    purchases: number;
    revenue: number;
    roas: number;
  }>;
  campaigns?: Array<{
    campaign: string;
    source: string;
    visits: number;
    add_to_carts: number;
    purchases: number;
    revenue: number;
    roas: number;
  }>;
  topProducts?: Array<{
    _id: string;
    name: string;
    image: string;
    quantity: number;
    revenue: number;
  }>;
  funnel?: FunnelStep[];
  insights: {
    searches: Array<{ keyword: string; count: number }>;
    categories: Array<{ category: string; count: number }>;
    devices: { mobile: number; desktop: number };
    demographics?: {
      age: Array<{ range: string; count: number }>;
      gender: Array<{ gender: string; count: number }>;
    };
    platforms?: {
      os: Array<{ os: string; count: number }>;
      browsers: Array<{ browser: string; count: number }>;
    };
    locations?: Array<{ city: string; count: number }>;
  };
  feed: Array<{
    _id: string;
    description: string;
    device: 'Mobile' | 'Desktop';
    source: string;
    timestamp: string;
  }>;
  charts: {
    labels: string[];
    revenue: number[];
    conversion: number[];
    pageviews?: number[];
  };
}

export type AnalyticsTabKey = 'revenue' | 'traffic' | 'cities' | 'funnel' | 'market';

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
