'use client';

import React from 'react';
import { ORDER_TRACKING_STEPS, ORDER_STATUS_CONFIG } from '@/lib/constants';

export interface OrderProgressTrackerProps {
  stepIndex: number;
}

export function OrderProgressTracker({ stepIndex }: OrderProgressTrackerProps) {
  const stepsCount = ORDER_TRACKING_STEPS.length;
  const progressPercent = (stepIndex / (stepsCount - 1)) * (100 - 40 / stepsCount);

  return (
    <div className="mb-4 pt-3">
      <div className="d-flex align-items-start justify-content-between position-relative">
        {/* Background line */}
        <div
          className="position-absolute"
          style={{
            top: '20px',
            left: '20px',
            right: '20px',
            height: '3px',
            background: '#e2e8f0',
            zIndex: 0,
          }}
        />

        {/* Animated Active progress fill line */}
        <div
          className="position-absolute"
          style={{
            top: '20px',
            left: '20px',
            width: `${progressPercent}%`,
            height: '3px',
            background: 'linear-gradient(to right, #ea580c, #f97316)',
            zIndex: 1,
            transition: 'width 0.5s ease',
          }}
        />

        {/* Step circles and labels */}
        {ORDER_TRACKING_STEPS.map((step, idx) => {
          const stepCfg = ORDER_STATUS_CONFIG[step] || ORDER_STATUS_CONFIG['Pending'];
          const done = idx <= stepIndex;

          return (
            <div key={step} className="d-flex flex-column align-items-center" style={{ zIndex: 2, flex: 1 }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 fw-bold"
                style={{
                  width: '40px',
                  height: '40px',
                  background: done ? 'linear-gradient(135deg, #ea580c, #f97316)' : '#e2e8f0',
                  color: done ? '#fff' : '#94a3b8',
                  fontSize: '0.85rem',
                  boxShadow: done ? '0 4px 12px rgba(234,88,12,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                <i className={stepCfg.icon.replace(' fa-spin', '')} />
              </div>
              <span
                className="text-center"
                style={{
                  fontSize: '0.68rem',
                  fontWeight: done ? 600 : 400,
                  color: done ? '#ea580c' : '#94a3b8',
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
