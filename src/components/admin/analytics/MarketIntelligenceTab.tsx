'use client';

import React from 'react';
import MarketIntelligenceDashboard from '@/components/MarketIntelligenceDashboard';

export function MarketIntelligenceTab() {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="fas fa-brain text-purple text-primary" /> Pakistani Market &amp; Competitor Intelligence
          </h6>
          <span className="text-muted small">
            AI-driven insights on high-demand automotive accessories, trending keyword clusters &amp; competitor benchmarks.
          </span>
        </div>
      </div>

      <MarketIntelligenceDashboard />
    </div>
  );
}
