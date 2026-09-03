'use client';

import React from 'react';
import { useFreeShippingMeter } from '@/hooks/useFreeShippingMeter';

export const FreeShippingMeter: React.FC = () => {
  const { isHydrated, isUnlocked, progressPct, message } = useFreeShippingMeter();

  if (!isHydrated) return null;

  return (
    <div
      className="p-3 rounded-3 mb-3 border transition-all"
      style={{
        background: isUnlocked ? '#f0fdf4' : '#fff7ed',
        borderColor: isUnlocked ? '#bbf7d0' : '#fed7aa',
        boxShadow: isUnlocked ? '0 2px 10px rgba(22, 163, 74, 0.08)' : 'none',
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1.5">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: isUnlocked ? '#16a34a' : '#ea580c',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              flexShrink: 0,
            }}
          >
            <i className={`fas ${isUnlocked ? 'fa-check' : 'fa-truck-fast'}`} />
          </span>
          <span
            className="fw-bold"
            style={{
              fontSize: '0.78rem',
              color: isUnlocked ? '#15803d' : '#c2410c',
            }}
          >
            {message}
          </span>
        </div>

        <span
          className="fw-bolder"
          style={{
            fontSize: '0.75rem',
            color: isUnlocked ? '#15803d' : '#ea580c',
          }}
        >
          {progressPct}%
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="progress rounded-pill overflow-hidden"
        style={{ height: '7px', background: isUnlocked ? '#dcfce7' : '#ffedd5' }}
      >
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          style={{
            width: `${progressPct}%`,
            background: isUnlocked
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #f97316, #ea580c)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};
