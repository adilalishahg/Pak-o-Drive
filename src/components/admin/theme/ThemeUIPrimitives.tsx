'use client';

import React from 'react';
import { SiteTheme } from '../../common/DynamicThemeProvider';

/* Radius value ↔ slider index */
export const RADIUS_STEPS = [0, 4, 8, 12, 16, 20, 24, 32, 40, 50];

export function pxToStep(px: string, maxIdx: number): number {
  const n = parseInt(px) || 0;
  let closest = 0;
  let minDiff = Infinity;
  RADIUS_STEPS.forEach((v, i) => {
    if (i > maxIdx) return;
    const diff = Math.abs(v - n);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  });
  return closest;
}

export function stepToPx(idx: number): string {
  return `${RADIUS_STEPS[Math.min(idx, RADIUS_STEPS.length - 1)]}px`;
}

/* ─── Radius Slider ──────────────────────────────────────────── */
export function RadiusSlider({
  label,
  value,
  onChange,
  max = 9,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
}) {
  const stepIdx = pxToStep(value, max);

  return (
    <div className="mb-1">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <label className="form-label small fw-medium mb-0" style={{ fontSize: '0.82rem' }}>
          {label}
        </label>
        <span
          className="badge rounded-pill text-white"
          style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)', fontSize: '0.72rem', minWidth: '48px' }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        className="form-range"
        min={0}
        max={max}
        step={1}
        value={stepIdx}
        onChange={(e) => onChange(stepToPx(Number(e.target.value)))}
        style={{ accentColor: 'var(--pd-primary, #ea580c)' }}
      />
      <div className="d-flex justify-content-between" style={{ marginTop: '-4px' }}>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Sharp</span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Round</span>
      </div>
    </div>
  );
}

/* ─── Color Picker Row ───────────────────────────────────────── */
export function ColorRow({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof SiteTheme;
  value: string;
  onChange: (k: keyof SiteTheme, v: string) => void;
}) {
  return (
    <div className="d-flex align-items-center justify-content-between py-2 border-bottom flex-wrap gap-2">
      <label className="fw-medium text-dark mb-0" style={{ fontSize: '0.85rem' }}>
        {label}
      </label>
      <div className="d-flex align-items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-control form-control-color flex-shrink-0"
          style={{ width: '38px', height: '34px', cursor: 'pointer', padding: '2px', borderRadius: '8px' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-control form-control-sm font-monospace"
          style={{ width: '92px', fontSize: '0.8rem' }}
          maxLength={7}
        />
      </div>
    </div>
  );
}

/* ─── Section Card Wrapper ───────────────────────────────────── */
export function SectionCard({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="card border-0 rounded-4 mb-4 overflow-hidden w-100 min-w-0"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        background: '#ffffff',
      }}
    >
      <div
        className="card-header border-0 py-3 px-3 px-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2"
        style={{
          background: 'linear-gradient(135deg, rgba(234,88,12,0.06) 0%, rgba(234,88,12,0.01) 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '32px', height: '32px', background: 'rgba(234,88,12,0.12)', color: '#ea580c' }}
          >
            <i className={icon} style={{ fontSize: '0.9rem' }} />
          </div>
          <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.95rem', letterSpacing: '-0.3px' }}>
            {title}
          </h6>
        </div>
        {badge && (
          <span
            className="badge rounded-pill text-white flex-shrink-0 ms-auto"
            style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)', fontSize: '0.68rem' }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="card-body p-3 p-md-4 w-100 min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
