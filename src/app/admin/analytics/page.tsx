'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminAnalytics } from '../../../hooks/useAdminAnalytics';
import { AnalyticsKPIHeader } from '../../../components/admin/analytics/AnalyticsKPIHeader';
import { RevenueTab } from '../../../components/admin/analytics/RevenueTab';
import { TrafficTab } from '../../../components/admin/analytics/TrafficTab';
import { CitySalesMapTab } from '../../../components/admin/analytics/CitySalesMapTab';
import { ConversionFunnelTab } from '../../../components/admin/analytics/ConversionFunnelTab';
import { MarketIntelligenceTab } from '../../../components/admin/analytics/MarketIntelligenceTab';

export default function AdminAnalyticsPage() {
  const {
    data,
    loading,
    refreshing,
    error,
    timeframe,
    setTimeframe,
    activeTab,
    setActiveTab,
    fetchAnalytics,
  } = useAdminAnalytics();

  if (loading && !data) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading analytics...</span>
        </div>
        <p className="text-muted fw-semibold">Loading business intelligence &amp; analytics...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <i className="fas fa-exclamation-circle" />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* 1. Header with KPIs, Timeframe Filter & Tab Navigator */}
      <AnalyticsKPIHeader
        data={data}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={() => fetchAnalytics(true)}
        refreshing={refreshing}
      />

      {/* 2. Categorized Tab Content */}
      <div className="mt-2">
        {activeTab === 'revenue' && <RevenueTab data={data} />}
        {activeTab === 'traffic' && <TrafficTab data={data} />}
        {activeTab === 'cities' && <CitySalesMapTab data={data} />}
        {activeTab === 'funnel' && <ConversionFunnelTab data={data} />}
        {activeTab === 'market' && <MarketIntelligenceTab />}
      </div>
    </div>
  );
}
