'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useRecentSales } from '../../hooks/useRecentSales';
import { isBlogPath } from '@/lib/constants';

export const RecentSalesNotification: React.FC = () => {
  const pathname = usePathname();
  const { currentSale, visible, dismiss } = useRecentSales();

  if (!currentSale || !visible || isBlogPath(pathname) || pathname?.startsWith('/admin')) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '20px',
        zIndex: 1040,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '320px',
        animation: 'fadeInUp 0.35s ease-out forwards',
      }}
      className="d-none d-sm-flex"
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: '#f0fdf4',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1.5px solid #bbf7d0',
        }}
      >
        <i className="fas fa-shopping-bag" style={{ fontSize: '15px' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
          {currentSale.customer} from {currentSale.city}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Purchased <strong style={{ color: 'var(--pd-primary, #ea580c)' }}>{currentSale.product}</strong>
        </p>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <i className="fas fa-check-circle text-success" style={{ fontSize: '9px' }} /> Verified COD Order • {currentSale.timeAgo}
        </span>
      </div>

      <button
        onClick={dismiss}
        type="button"
        style={{
          border: 'none',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: '12px',
        }}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};
