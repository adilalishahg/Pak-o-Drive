'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardData } from '@/types';

export interface AdminDashboardHookReturn {
  data: DashboardData | null;
  stats: any | null;
  charts: any | null;
  recentOrders: any[];
  recentContacts: any[];
  searches: any[];
  popularProducts: any[];
  salesChange: number;
  viewsChange: number;
  loading: boolean;
  error: string;
  getSvgPoints: (values: number[] | undefined, width: number, height: number) => string;
  refetch: () => Promise<void>;
}

export function useAdminDashboard(): AdminDashboardHookReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [analyticsRes, ordersRes, contactsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/orders'),
        fetch('/api/contacts'),
      ]);

      const analyticsJson = await analyticsRes.json();
      const ordersJson = await ordersRes.json();
      const contactsJson = await contactsRes.json();

      if (analyticsJson.success) {
        setData(analyticsJson.data);
      } else {
        throw new Error(analyticsJson.error || 'Failed to fetch analytics data');
      }

      if (ordersJson.success) {
        setRecentOrders((ordersJson.data || []).slice(0, 5));
      }

      if (contactsJson.success) {
        setRecentContacts((contactsJson.data || []).slice(0, 5));
      }
    } catch (err: any) {
      console.error('Error fetching dashboard content:', err);
      setError(err.message || 'Failed to load dashboard data. Ensure MongoDB is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(() => data?.stats || null, [data]);
  const charts = useMemo(() => data?.charts || null, [data]);

  const searches = useMemo(() => {
    if (!data) return [];
    return (data as any).insights?.searches || (data as any).searches || [];
  }, [data]);

  const popularProducts = useMemo(() => {
    if (!data) return [];
    return (data as any).popularProducts || [];
  }, [data]);

  const salesChange = useMemo(() => {
    if (!charts?.sales || charts.sales.length < 2) return 0;
    const lastSales = charts.sales[charts.sales.length - 1];
    const prevSales = charts.sales[charts.sales.length - 2];
    return prevSales > 0 ? ((lastSales - prevSales) / prevSales) * 100 : 0;
  }, [charts]);

  const viewsChange = useMemo(() => {
    if (!charts?.pageviews || charts.pageviews.length < 2) return 0;
    const lastViews = charts.pageviews[charts.pageviews.length - 1];
    const prevViews = charts.pageviews[charts.pageviews.length - 2];
    return prevViews > 0 ? ((lastViews - prevViews) / prevViews) * 100 : 0;
  }, [charts]);

  const getSvgPoints = useCallback((values: number[] = [], width: number, height: number) => {
    if (!values || values.length === 0) return '';
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal;

    return values
      .map((val, idx) => {
        const x = (idx / (values.length - 1)) * width;
        // Invert Y since (0,0) is top-left in SVG
        const y = height - ((val - minVal) / range) * (height - 10) - 5;
        return `${x},${y}`;
      })
      .join(' ');
  }, []);

  return {
    data,
    stats,
    charts,
    recentOrders,
    recentContacts,
    searches,
    popularProducts,
    salesChange,
    viewsChange,
    loading,
    error,
    getSvgPoints,
    refetch: fetchDashboardData,
  };
}
