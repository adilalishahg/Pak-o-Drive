'use client';

import React from 'react';
import MetricCard from '@/components/common/MetricCard';
import { AnalyticsData, AnalyticsTabKey } from '../../../hooks/useAdminAnalytics';

interface AnalyticsKPIHeaderProps {
  data: AnalyticsData | null;
  timeframe: '7d' | '30d' | '90d' | 'all';
  setTimeframe: (t: '7d' | '30d' | '90d' | 'all') => void;
  activeTab: AnalyticsTabKey;
  setActiveTab: (t: AnalyticsTabKey) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const TABS: { key: AnalyticsTabKey; label: string; icon: string }[] = [
  { key: 'revenue', label: 'Revenue & Sales', icon: 'fas fa-chart-line' },
  { key: 'traffic', label: 'Traffic & Devices', icon: 'fas fa-users' },
  { key: 'cities', label: 'City Logistics Map', icon: 'fas fa-map-marker-alt' },
  { key: 'funnel', label: 'Conversion Funnel', icon: 'fas fa-filter' },
  { key: 'market', label: 'Market Intelligence', icon: 'fas fa-brain' },
];

export function AnalyticsKPIHeader({
  data,
  timeframe,
  setTimeframe,
  activeTab,
  setActiveTab,
  onRefresh,
  refreshing,
}: AnalyticsKPIHeaderProps) {
  const stats = data?.stats;

  return (
    <>
      {/* Top Header Row with Timeframe Selector */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            <i className="fas fa-chart-pie text-primary me-2" />
            Analytics &amp; Business Intelligence
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
            Real-time revenue performance, conversion funnels, Pakistan logistics heatmap &amp; user behavior.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Timeframe Selector */}
          <div className="btn-group btn-group-sm bg-white p-1 rounded-pill shadow-xs border" role="group">
            {(['7d', '30d', '90d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  timeframe === tf ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted border-0'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            title="Refresh Data"
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Total Revenue"
            metricType="revenue"
            initialValue={stats?.revenue || 0}
            formatValue={(v) => `PKR ${v.toLocaleString()}`}
            iconClass="fa-money-bill-wave"
            iconBg="rgba(234,88,12,0.12)"
            iconColor="#ea580c"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Total Orders"
            metricType="orders"
            initialValue={stats?.orders || 0}
            formatValue={(v) => v.toString()}
            iconClass="fa-shopping-cart"
            iconBg="rgba(16,185,129,0.12)"
            iconColor="#10b981"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Average Order Value"
            metricType="aov"
            initialValue={Math.round(stats?.averageOrderValue || 0)}
            formatValue={(v) => `PKR ${v.toLocaleString()}`}
            iconClass="fa-calculator"
            iconBg="rgba(59,130,246,0.12)"
            iconColor="#3b82f6"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Store Conversion Rate"
            metricType="conversion"
            initialValue={Number((stats?.conversionRate || 0).toFixed(2))}
            formatValue={(v) => `${v}%`}
            iconClass="fa-percentage"
            iconBg="rgba(168,85,247,0.12)"
            iconColor="#a855f7"
          />
        </div>
      </div>

      {/* Categorized Tab Navigation Bar */}
      <div className="bg-white p-2 p-md-3 rounded-4 shadow-sm border mb-4">
        <div className="d-flex align-items-center gap-1.5 gap-md-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 flex-shrink-0 transition-all ${
                  isActive ? 'btn-primary text-white shadow-xs fw-bold' : 'btn-light text-secondary border fw-medium'
                }`}
                style={{
                  fontSize: '0.82rem',
                  letterSpacing: '-0.2px',
                  background: isActive ? 'linear-gradient(135deg, #ea580c, #c2410c)' : undefined,
                  border: isActive ? 'none' : undefined,
                }}
              >
                <i className={tab.icon} style={{ fontSize: '0.85rem' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
