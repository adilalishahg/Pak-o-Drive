'use client';

import React from 'react';
import { SiteTheme } from '../../common/DynamicThemeProvider';
import { SectionCard, ColorRow } from './ThemeUIPrimitives';

const COLOR_PRESETS = [
  { name: '🔥 Orange (Default)', primary: '#ea580c', secondary: '#0f172a', accent: '#3b82f6', success: '#10b981' },
  { name: '🔵 Modern Blue', primary: '#2563eb', secondary: '#1e293b', accent: '#f59e0b', success: '#10b981' },
  { name: '🌿 Forest Emerald', primary: '#059669', secondary: '#132a13', accent: '#d97706', success: '#10b981' },
  { name: '💜 Royal Purple', primary: '#7c3aed', secondary: '#1e1b4b', accent: '#ec4899', success: '#10b981' },
  { name: '🌹 Crimson Dark', primary: '#e11d48', secondary: '#0f172a', accent: '#8b5cf6', success: '#10b981' },
  { name: '🖤 Ultra Dark', primary: '#38bdf8', secondary: '#090d16', accent: '#a855f7', success: '#10b981' },
];

interface ColorPaletteSectionProps {
  form: SiteTheme;
  onSet: <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => void;
}

export function ColorPaletteSection({ form, onSet }: ColorPaletteSectionProps) {
  return (
    <SectionCard title="Color Palette & Brand Colors" icon="fas fa-eye-dropper" badge="Dynamic Tokens">
      {/* Preset Badges */}
      <div className="mb-3">
        <label className="form-label small fw-medium text-muted mb-2">⚡ Quick Color Palettes</label>
        <div className="d-flex flex-wrap gap-2">
          {COLOR_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSet('primaryColor', p.primary);
                onSet('secondaryColor', p.secondary);
                onSet('accentColor', p.accent);
                onSet('successColor', p.success);
              }}
              className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1.5 px-3 py-1"
              style={{ fontSize: '0.78rem' }}
            >
              <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', background: p.primary }} />
              <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', background: p.accent }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="row g-2 pt-2">
        <div className="col-12 col-md-6">
          <ColorRow label="Primary (Brand & CTAs)" name="primaryColor" value={form.primaryColor} onChange={onSet} />
        </div>
        <div className="col-12 col-md-6">
          <ColorRow label="Secondary (Dark Surfaces)" name="secondaryColor" value={form.secondaryColor} onChange={onSet} />
        </div>
        <div className="col-12 col-md-6">
          <ColorRow label="Accent (Badges & Highlights)" name="accentColor" value={form.accentColor} onChange={onSet} />
        </div>
        <div className="col-12 col-md-6">
          <ColorRow label="Success (In Stock & COD)" name="successColor" value={form.successColor} onChange={onSet} />
        </div>
      </div>

      {/* Hero Banner Gradient */}
      <div className="mt-4 pt-3 border-top">
        <label className="fw-semibold text-dark mb-1 small d-block">Hero Banner Background Gradient</label>
        <p className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
          Gradient applied to the top hero section behind banners and product showcases.
        </p>
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <ColorRow label="Gradient Start" name="heroGradientStart" value={form.heroGradientStart} onChange={onSet} />
          </div>
          <div className="col-12 col-md-6">
            <ColorRow label="Gradient End" name="heroGradientEnd" value={form.heroGradientEnd} onChange={onSet} />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
