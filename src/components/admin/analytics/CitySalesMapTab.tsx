'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsData } from '../../../hooks/useAdminAnalytics';

const InteractiveMap = dynamic(() => import('../../../components/common/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="skeleton-pulse rounded-4" style={{ height: '360px', backgroundColor: '#f1f5f9' }} />,
});

const cityCoordinates: Record<string, [number, number]> = {
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  faisalabad: [31.4504, 73.1350],
  multan: [30.1575, 71.5249],
  peshawar: [34.0151, 71.5805],
  quetta: [30.1798, 66.9750],
  sialkot: [32.4945, 74.5228],
  gujranwala: [32.1877, 74.1945],
};

const deliveryRoutes: Array<{ path: [number, number][]; color?: string; weight?: number }> = [
  { path: [[24.8607, 67.0011], [27.7244, 68.8228], [30.1575, 71.5249], [31.5204, 74.3587], [33.6844, 73.0479]], color: '#10b981', weight: 3 },
  { path: [[24.8607, 67.0011], [30.1798, 66.9750]], color: '#f97316', weight: 2 },
  { path: [[25.3960, 68.3578], [27.7244, 68.8228]], color: '#f97316', weight: 2 },
  { path: [[30.1798, 66.9750], [27.7244, 68.8228]], color: '#f97316', weight: 2 },
  { path: [[30.1798, 66.9750], [30.1575, 71.5249]], color: '#f97316', weight: 2 },
  { path: [[30.1575, 71.5249], [31.4504, 73.1350], [31.5204, 74.3587]], color: '#f97316', weight: 2 },
  { path: [[33.6844, 73.0479], [34.0151, 71.5805]], color: '#f97316', weight: 2 },
];

interface CitySalesMapTabProps {
  data: AnalyticsData | null;
}

export function CitySalesMapTab({ data }: CitySalesMapTabProps) {
  const locations = data?.insights?.locations || [
    { city: 'Karachi', count: 42 },
    { city: 'Lahore', count: 35 },
    { city: 'Islamabad', count: 28 },
    { city: 'Rawalpindi', count: 18 },
    { city: 'Faisalabad', count: 12 },
    { city: 'Multan', count: 9 },
  ];

  const mapMarkers = locations.map((loc) => {
    const coords = cityCoordinates[loc.city.toLowerCase()] || [30.3753, 69.3451];
    return {
      lat: coords[0],
      lng: coords[1],
      popupText: `<b>${loc.city}</b><br/>${loc.count} Orders Delivered`,
    };
  });

  return (
    <div className="row g-4">
      {/* Interactive Map */}
      <div className="col-12 col-xl-8">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between">
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i className="fas fa-map-marked-alt text-success" /> Pakistan City-Wise Delivery Heatmap
            </h6>
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
              Live Logistics Links
            </span>
          </div>
          <div style={{ height: '380px', width: '100%' }}>
            <InteractiveMap
              center={[30.3753, 69.3451]}
              zoom={5}
              markers={mapMarkers}
              routes={deliveryRoutes}
            />
          </div>
        </div>
      </div>

      {/* City Leaderboard */}
      <div className="col-12 col-xl-4">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
          <div className="card-header bg-white py-3 px-4">
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i className="fas fa-city text-primary" /> Top Ordering Cities
            </h6>
          </div>
          <div className="card-body p-3">
            <div className="d-flex flex-column gap-2">
              {locations.map((loc, idx) => (
                <div key={loc.city} className="p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary rounded-circle" style={{ width: '22px', height: '22px', lineHeight: '14px' }}>
                      {idx + 1}
                    </span>
                    <span className="fw-bold text-dark small">{loc.city}</span>
                  </div>
                  <span className="badge bg-primary rounded-pill font-monospace" style={{ fontSize: '0.78rem' }}>
                    {loc.count} Orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
