'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsData } from '../../../hooks/useAdminAnalytics';

const DeviceBreakdownChart = dynamic(
  () => import('../../../components/common/AnalyticsCharts').then((m) => m.DeviceBreakdownChart),
  {
    ssr: false,
    loading: () => <div className="skeleton-pulse rounded-circle bg-light" style={{ width: '140px', height: '140px', margin: 'auto' }} />,
  }
);

interface TrafficTabProps {
  data: AnalyticsData | null;
}

export function TrafficTab({ data }: TrafficTabProps) {
  const devices = data?.insights?.devices || { mobile: 70, desktop: 30 };
  const searches = data?.insights?.searches || [];
  const feed = data?.feed || [];

  const deviceChartData = [
    { name: 'Mobile', value: devices.mobile, color: '#ea580c' },
    { name: 'Desktop', value: devices.desktop, color: '#3b82f6' },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Device Breakdown & Top Searches */}
      <div className="row g-4">
        {/* Device Breakdown */}
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="fas fa-mobile-alt text-primary" /> Traffic Device Share
            </h6>
            <div className="d-flex justify-content-center py-2" style={{ height: '180px' }}>
              <DeviceBreakdownChart data={deviceChartData} />
            </div>
            <div className="d-flex justify-content-around text-center pt-3 border-top mt-2">
              <div>
                <div className="text-muted small">Mobile Users</div>
                <div className="fw-bold text-primary font-monospace">{devices.mobile}%</div>
              </div>
              <div className="border-start" />
              <div>
                <div className="text-muted small">Desktop Users</div>
                <div className="fw-bold text-secondary font-monospace">{devices.desktop}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customer Searches */}
        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="fas fa-search text-info" /> Top On-Site Search Queries
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {searches.length === 0 ? (
                <span className="text-muted small">No recorded search queries yet.</span>
              ) : (
                searches.map((s, idx) => (
                  <span
                    key={idx}
                    className="badge bg-light text-dark border p-2 d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <span>{s.keyword}</span>
                    <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.68rem' }}>
                      {s.count}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Visitor Activity Feed */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="fas fa-bolt text-warning" /> Real-time Customer Activity Stream
          </h6>
          <span className="badge bg-success rounded-pill px-2 py-1 small">Live Intercept</span>
        </div>
        <div className="card-body p-0">
          <div className="d-flex flex-column divide-y" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {feed.length === 0 ? (
              <div className="text-center py-4 text-muted small">No visitor sessions recorded yet.</div>
            ) : (
              feed.map((item) => (
                <div key={item._id} className="p-3 border-bottom d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge rounded-circle p-1.5 ${
                        item.device === 'Mobile' ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <i className={`fas ${item.device === 'Mobile' ? 'fa-mobile-alt' : 'fa-desktop'} text-white`} style={{ fontSize: '0.7rem' }} />
                    </span>
                    <span className="small text-dark fw-medium" style={{ fontSize: '0.82rem' }}>
                      {item.description}
                    </span>
                  </div>
                  <span className="text-muted small font-monospace" style={{ fontSize: '0.72rem' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
