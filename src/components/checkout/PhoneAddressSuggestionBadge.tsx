'use client';

import React from 'react';
import { SavedDeliveryProfile } from '@/hooks/useCheckout';

interface PhoneAddressSuggestionBadgeProps {
  suggestion: SavedDeliveryProfile | null;
  isLoading: boolean;
  onApply: () => void;
  onDismiss: () => void;
}

export const PhoneAddressSuggestionBadge: React.FC<PhoneAddressSuggestionBadgeProps> = ({
  suggestion,
  isLoading,
  onApply,
  onDismiss,
}) => {
  if (isLoading) {
    return (
      <div className="mt-2 d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.78rem' }}>
        <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '12px', height: '12px' }}>
          <span className="visually-hidden">Looking up address...</span>
        </div>
        <span>Checking for previous order address...</span>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div
      className="mt-2.5 p-2.5 rounded-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 shadow-xs animate-fadeIn"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1.5px solid #86efac',
      }}
    >
      <div className="d-flex align-items-start gap-2">
        <i className="fas fa-check-circle text-success mt-1" style={{ fontSize: '13px' }} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534' }}>
            Found Previous Delivery Address for this Number:
          </div>
          <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
            {suggestion.fullName ? `${suggestion.fullName} • ` : ''}
            {suggestion.address}, <strong>{suggestion.city}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-1 ms-auto flex-shrink-0">
        <button
          type="button"
          onClick={onApply}
          className="btn btn-sm text-white border-0 d-inline-flex align-items-center gap-1 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            fontSize: '0.76rem',
            fontWeight: 800,
            padding: '5px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-bolt" />
          <span>Auto-fill Address</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-sm btn-link text-secondary text-decoration-none p-1"
          style={{ fontSize: '0.74rem' }}
          title="Dismiss"
        >
          <i className="fas fa-times" />
        </button>
      </div>
    </div>
  );
};
