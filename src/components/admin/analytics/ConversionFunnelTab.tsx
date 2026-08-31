'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsData } from '../../../hooks/useAdminAnalytics';

const ConversionRateChart = dynamic(
  () => import('../../../components/common/AnalyticsCharts').then((m) => m.ConversionRateChart),
  {
    ssr: false,
    loading: () => <div className="skeleton-pulse w-100 rounded" style={{ height: '240px', backgroundColor: '#f1f5f9' }} />,
  }
);

interface ConversionFunnelTabProps {
  data: AnalyticsData | null;
}

export function ConversionFunnelTab({ data }: ConversionFunnelTabProps) {
  const chartLabels = data?.charts?.labels || [];
  const chartRevenue = data?.charts?.revenue || [];
  const chartConversion = data?.charts?.conversion || [];
  const chartPageviews = data?.charts?.pageviews || [];

  const timeSeriesData = chartLabels.map((label, idx) => ({
    name: label,
    Revenue: chartRevenue[idx] || 0,
    Pageviews: chartPageviews[idx] || 0,
    Conversion: chartConversion[idx] || 0,
  }));

  const funnel = data?.funnel || [
    { step: 1, label: 'Storefront Visitors', description: 'Total unique sessions', count: 1240, conversionFromPrevious: 100, conversionToEnd: 100 },
    { step: 2, label: 'Product Views', description: 'Viewed item details', count: 850, conversionFromPrevious: 68.5, conversionToEnd: 68.5 },
    { step: 3, label: 'Added to Cart', description: 'Cart badge click', count: 320, conversionFromPrevious: 37.6, conversionToEnd: 25.8 },
    { step: 4, label: 'Initiated Checkout', description: 'Address entered', count: 180, conversionFromPrevious: 56.2, conversionToEnd: 14.5 },
    { step: 5, label: 'Purchased / COD', description: 'Completed orders', count: 94, conversionFromPrevious: 52.2, conversionToEnd: 7.5 },
  ];

  const leakAmount = data?.stats?.abandonedCartLeak || 45000;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Funnel Progress Steps */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="fas fa-filter text-primary" /> E-Commerce Conversion Funnel
            </h6>
            <span className="text-muted small">
              Analyze drop-offs between product discovery, cart additions, and order confirmations.
            </span>
          </div>
          <div className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 p-2">
            ⚠️ Est. PKR {leakAmount.toLocaleString()} in Abandoned Cart Leaks
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {funnel.map((step) => (
            <div key={step.step} className="p-3 rounded-3 border bg-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary rounded-circle" style={{ width: '24px', height: '24px', lineHeight: '16px' }}>
                    {step.step}
                  </span>
                  <div>
                    <span className="fw-bold text-dark small">{step.label}</span>
                    <span className="text-muted ms-2 small" style={{ fontSize: '0.75rem' }}>
                      ({step.description})
                    </span>
                  </div>
                </div>
                <div className="text-end">
                  <span className="fw-bold text-dark font-monospace">{step.count.toLocaleString()}</span>
                  <span className="text-muted small ms-2" style={{ fontSize: '0.75rem' }}>
                    ({step.conversionToEnd.toFixed(1)}% of total)
                  </span>
                </div>
              </div>

              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-primary rounded-pill"
                  role="progressbar"
                  style={{ width: `${Math.max(step.conversionToEnd, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Rate Over Time Chart */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i className="fas fa-percentage text-success" /> Conversion Rate Daily Trend
        </h6>
        <div style={{ height: '260px', width: '100%' }}>
          <ConversionRateChart data={timeSeriesData} />
        </div>
      </div>
    </div>
  );
}
