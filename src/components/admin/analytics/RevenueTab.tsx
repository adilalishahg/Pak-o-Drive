'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsData } from '../../../hooks/useAdminAnalytics';

const TrendChart = dynamic(
  () => import('../../../components/common/AnalyticsCharts').then((m) => m.TrendChart),
  {
    ssr: false,
    loading: () => <div className="skeleton-pulse w-100 rounded" style={{ height: '260px', backgroundColor: '#f1f5f9' }} />,
  }
);

interface RevenueTabProps {
  data: AnalyticsData | null;
}

export function RevenueTab({ data }: RevenueTabProps) {
  const chartLabels = data?.charts?.labels || [];
  const chartRevenue = data?.charts?.revenue || [];
  const chartConversion = data?.charts?.conversion || [];
  const chartPageviews = data?.charts?.pageviews || [];
  const marketing = data?.marketing || [];
  const topProducts = data?.topProducts || [];

  const timeSeriesData = chartLabels.map((label, idx) => ({
    name: label,
    Revenue: chartRevenue[idx] || 0,
    Pageviews: chartPageviews[idx] || 0,
    Conversion: chartConversion[idx] || 0,
  }));

  return (
    <div className="d-flex flex-column gap-4">
      {/* Revenue Trend Line Chart */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="fas fa-chart-area text-primary" /> Sales &amp; Revenue Trajectory
          </h6>
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 small">
            PKR Currency
          </span>
        </div>
        <div style={{ height: '280px', width: '100%' }}>
          <TrendChart data={timeSeriesData} />
        </div>
      </div>

      {/* Two Column: Marketing Sources & Top Products */}
      <div className="row g-4">
        {/* Marketing Attribution & ROAS Table */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="fas fa-bullhorn text-primary" /> Marketing Channels &amp; ROAS
              </h6>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Traffic Attribution
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Channel / Source</th>
                      <th className="text-center">Visits</th>
                      <th className="text-center">Cart Adds</th>
                      <th className="text-center">Orders</th>
                      <th className="text-end pe-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketing.map((m, idx) => (
                      <tr key={idx}>
                        <td className="ps-4 fw-semibold text-dark">
                          <span className="badge bg-light text-secondary border me-1.5">{m.source}</span>
                        </td>
                        <td className="text-center font-monospace">{m.visits.toLocaleString()}</td>
                        <td className="text-center font-monospace">{m.add_to_carts}</td>
                        <td className="text-center fw-bold font-monospace text-success">{m.purchases}</td>
                        <td className="text-end pe-4 font-monospace fw-bold">
                          PKR {m.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <div className="card-header bg-white py-3 px-4">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="fas fa-trophy text-warning" /> Top Performing Products
              </h6>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-2">
                {topProducts.slice(0, 6).map((prod) => (
                  <div key={prod._id} className="p-2 border rounded-3 d-flex align-items-center justify-content-between bg-light">
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <div className="rounded border bg-white p-1 flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                        <img src={prod.image || '/img/product-1.png'} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className="text-truncate min-w-0" style={{ fontSize: '0.8rem' }}>
                        <div className="fw-semibold text-dark text-truncate">{prod.name}</div>
                        <div className="text-muted small">{prod.quantity} units sold</div>
                      </div>
                    </div>
                    <div className="fw-bold text-primary font-monospace small ps-2 text-nowrap" style={{ fontSize: '0.82rem' }}>
                      PKR {prod.revenue?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
