'use client';

import React from 'react';
import { OrderData } from '../../../hooks/useAdminOrders';
import InteractiveMap from '@/components/common/InteractiveMap';

interface CourierBookingPanelProps {
  selectedOrder: OrderData | null;
  selectedCourier: 'TCS' | 'LEOPARDS' | 'TRAX';
  setSelectedCourier: (c: 'TCS' | 'LEOPARDS' | 'TRAX') => void;
  bookingLoading: boolean;
  onBookCourier: () => Promise<void>;
  logs: Array<{ text: string; type: string }>;
}

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

export function CourierBookingPanel({
  selectedOrder,
  selectedCourier,
  setSelectedCourier,
  bookingLoading,
  onBookCourier,
  logs,
}: CourierBookingPanelProps) {
  if (!selectedOrder) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted bg-white">
        Select an order from the list to book courier consignment or review delivery route.
      </div>
    );
  }

  const cityName = (selectedOrder.customerDetails?.city || 'islamabad').toLowerCase();
  const targetCoord = cityCoordinates[cityName] || [33.6844, 73.0479];

  const mapMarkers = [
    {
      lat: targetCoord[0],
      lng: targetCoord[1],
      popupText: `<b>${selectedOrder.customerDetails?.name || 'Customer'}</b><br/>${selectedOrder.customerDetails?.city || ''}<br/>Order #${selectedOrder._id.slice(-6).toUpperCase()} — PKR ${selectedOrder.totalAmount?.toLocaleString()}`,
    },
  ];

  return (
    <div className="d-flex flex-column gap-3" style={{ position: 'sticky', top: '88px' }}>
      {/* 1-Click Courier Dispatch Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="fas fa-truck-loading text-primary" /> Courier 1-Click Dispatch
          </h6>
          <span className="badge bg-primary rounded-pill font-monospace">
            #{selectedOrder._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Customer Mini Summary */}
        <div className="p-3 bg-light rounded-3 mb-3 border">
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small">Customer:</span>
            <span className="fw-bold text-dark small">{selectedOrder.customerDetails?.name}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small">Destination:</span>
            <span className="fw-semibold text-dark small">{selectedOrder.customerDetails?.city}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small">COD Payable:</span>
            <span className="fw-bold text-primary font-monospace small">PKR {selectedOrder.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Courier Provider Tabs */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted mb-2">Select Logistics Partner:</label>
          <div className="d-flex gap-2">
            {(['LEOPARDS', 'TCS', 'TRAX'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCourier(c)}
                className={`btn btn-sm rounded-3 flex-fill fw-bold ${
                  selectedCourier === c ? 'btn-primary text-white shadow-xs' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Dispatch Action Button */}
        <button
          type="button"
          onClick={onBookCourier}
          disabled={bookingLoading || selectedOrder.status === 'Cancelled'}
          className="btn btn-primary btn-sm rounded-pill w-100 py-2 fw-bold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
        >
          {bookingLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" /> Booking Consignment Note...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2" /> Generate CN &amp; Dispatch with {selectedCourier}
            </>
          )}
        </button>
      </div>

      {/* Live Route Map Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white py-2.5 px-3 border-0 d-flex align-items-center justify-content-between">
          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
            <i className="fas fa-map-marked-alt text-success" /> Live Logistics Route Map
          </span>
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: '0.68rem' }}>
            Hub &amp; Spoke Link
          </span>
        </div>
        <div style={{ height: '220px', width: '100%' }}>
          <InteractiveMap
            center={targetCoord}
            zoom={6}
            markers={mapMarkers}
            routes={deliveryRoutes}
          />
        </div>
      </div>

      {/* Real-time Dispatch Activity Feed */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <span className="fw-bold text-dark small mb-2 d-block">Recent Dispatch Activity</span>
        <div className="d-flex flex-column gap-1.5 overflow-hidden" style={{ maxHeight: '120px' }}>
          {logs.map((log, idx) => (
            <div key={idx} className="small text-muted font-monospace text-truncate d-flex align-items-center gap-1.5" style={{ fontSize: '0.72rem' }}>
              <span className="badge bg-light text-dark border p-1">{log.type}</span>
              <span className="text-truncate">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
