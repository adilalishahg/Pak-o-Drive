'use client';

import React from 'react';
import { SavedDeliveryProfile } from '@/hooks/useCheckout';

interface SavedAddressQuickCardProps {
  savedProfile: SavedDeliveryProfile | null;
  isDismissed: boolean;
  onApply: () => void;
  onDismiss: () => void;
  isHydrated: boolean;
}

export const SavedAddressQuickCard: React.FC<SavedAddressQuickCardProps> = ({
  savedProfile,
  isDismissed,
  onApply,
  onDismiss,
  isHydrated,
}) => {
  // SSR Hydration Guard (Rule #1)
  if (!isHydrated || !savedProfile) return null;

  if (isDismissed) {
    return (
      <div className="mb-3 d-flex justify-content-end">
        <button
          type="button"
          onClick={onApply}
          className="btn btn-sm d-inline-flex align-items-center gap-1 text-decoration-none border-0"
          style={{
            background: 'rgba(234, 88, 12, 0.08)',
            color: '#c2410c',
            fontWeight: 700,
            fontSize: '0.78rem',
            padding: '5px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-history text-warning" />
          <span>Use saved address ({savedProfile.city})</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="mb-4 shadow-sm position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
        border: '1.5px solid #fde68a',
        borderRadius: '14px',
        padding: '16px 18px',
      }}
    >
      {/* Top Banner Tag */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              background: '#fef3c7',
              color: '#b45309',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            ⚡ 1-Click Returning Customer
          </span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome back, {savedProfile.fullName.split(' ')[0]}!
          </span>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="btn-close p-1"
          style={{ fontSize: '0.65rem' }}
          aria-label="Dismiss saved address card"
        />
      </div>

      {/* Saved Address Preview */}
      <div className="mb-3 ps-1" style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
        <div className="d-flex align-items-baseline gap-2 mb-1">
          <i className="fas fa-map-marker-alt text-danger" style={{ fontSize: '12px' }} />
          <strong style={{ color: '#1e293b' }}>{savedProfile.address}</strong>
          <span className="badge bg-secondary-subtle text-secondary px-2 py-0.5 rounded-pill" style={{ fontSize: '0.74rem' }}>
            {savedProfile.city}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3 ms-4 text-muted" style={{ fontSize: '0.78rem' }}>
          <span><i className="fab fa-whatsapp text-success me-1" />{savedProfile.phone}</span>
          {savedProfile.email && <span><i className="far fa-envelope me-1" />{savedProfile.email}</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap align-items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="btn btn-sm d-inline-flex align-items-center gap-2 text-white border-0 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            fontWeight: 800,
            fontSize: '0.82rem',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-bolt" />
          <span>Deliver to This Address</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 border-slate-300"
          style={{
            fontWeight: 600,
            fontSize: '0.8rem',
            padding: '7px 14px',
            borderRadius: '8px',
            background: '#fff',
          }}
        >
          <i className="fas fa-pen" style={{ fontSize: '11px' }} />
          <span>Enter Different / New Address</span>
        </button>
      </div>
    </div>
  );
};
