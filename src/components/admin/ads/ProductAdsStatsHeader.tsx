'use client';

import React from 'react';
import { ProductAdsAnalyticsSummary } from '../../../types/productAds';

interface ProductAdsStatsHeaderProps {
  summary: ProductAdsAnalyticsSummary;
  scope: 'my_products' | 'all';
}

export function ProductAdsStatsHeader({ summary, scope }: ProductAdsStatsHeaderProps) {
  return (
    <div className="row g-3 mb-4">
      {/* 1. Active Ads in Pakistan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              Pakistan Active Ads
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c' }}
            >
              <i className="fas fa-bullhorn" />
            </div>
          </div>
          <h3 className="fw-bold mb-1 text-dark leading-normal py-0.5">
            {summary.totalActiveAdsPK.toLocaleString()}
          </h3>
          <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
            🔥 Live tracked ad campaigns in PK
          </span>
        </div>
      </div>

      {/* 2. Tracked Sales */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              {scope === 'my_products' ? 'Store Product Sales' : 'Market Tracked Sales'}
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}
            >
              <i className="fas fa-money-bill-wave" />
            </div>
          </div>
          <h3 className="fw-bold mb-1 text-dark leading-normal py-0.5">
            Rs. {summary.totalTrackedSalesPKR.toLocaleString()}
          </h3>
          <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
            📦 {summary.totalUnitsSold.toLocaleString()} total units sold
          </span>
        </div>
      </div>

      {/* 3. Top Performing Ad Category */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              Top Ad Category
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}
            >
              <i className="fas fa-tags" />
            </div>
          </div>
          <h4 className="fw-bold mb-1 text-dark leading-normal py-0.5 text-truncate" style={{ fontSize: '1.25rem' }}>
            {summary.topPerformingCategory || 'Accessories'}
          </h4>
          <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
            Highest marketing velocity in PK
          </span>
        </div>
      </div>

      {/* 4. Active High-Growth Campaigns */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              Viral Potential
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}
            >
              <i className="fas fa-chart-line" />
            </div>
          </div>
          <h3 className="fw-bold mb-1 text-dark leading-normal py-0.5">
            {summary.activeCampaignsCount} Items
          </h3>
          <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
            ⚡ 10+ competitor ads running per item
          </span>
        </div>
      </div>
    </div>
  );
}
