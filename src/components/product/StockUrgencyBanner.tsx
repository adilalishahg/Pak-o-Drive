'use client';

import React from 'react';

export interface StockUrgencyBannerProps {
  stock: number;
}

export const StockUrgencyBanner: React.FC<StockUrgencyBannerProps> = ({ stock }) => {
  if (stock <= 0) {
    return (
      <div
        className="p-2 rounded-2 mb-3 d-flex align-items-center gap-2 border"
        style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}
      >
        <i className="fas fa-exclamation-circle" />
        <span>Currently Out of Stock &bull; Tap WhatsApp below to pre-order</span>
      </div>
    );
  }

  const isLowStock = stock <= 10;

  if (!isLowStock) {
    return (
      <div
        className="p-2 rounded-2 mb-3 d-flex align-items-center gap-2 border"
        style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', fontSize: '0.78rem', fontWeight: 600 }}
      >
        <i className="fas fa-check-circle text-success" />
        <span>In Stock &bull; Ready for Same-Day Dispatch Across Pakistan</span>
      </div>
    );
  }

  // Calculate percentage of remaining stock out of a nominal batch of 15
  const stockPct = Math.min(100, Math.max(15, Math.round((stock / 15) * 100)));

  return (
    <div
      className="p-2.5 rounded-3 mb-3 border transition-all"
      style={{
        background: '#fff7ed',
        borderColor: '#fed7aa',
        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-1.5">
        <div className="d-flex align-items-center gap-1.5">
          <span style={{ fontSize: '13px' }}>🔥</span>
          <span className="fw-bold" style={{ fontSize: '0.78rem', color: '#c2410c' }}>
            Hurry! Only <span className="text-danger fw-bolder">{stock} units</span> left in stock!
          </span>
        </div>
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" style={{ fontSize: '0.64rem' }}>
          High Demand
        </span>
      </div>

      {/* Stock scarcity bar */}
      <div className="progress rounded-pill overflow-hidden" style={{ height: '6px', background: '#ffedd5' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-danger"
          style={{ width: `${stockPct}%`, transition: 'width 0.4s ease' }}
        />
      </div>

      <div className="mt-1.5 d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.68rem' }}>
        <span>⚡ 14 people are viewing this product right now</span>
        <span className="fw-semibold text-secondary">Selling Fast</span>
      </div>
    </div>
  );
};
