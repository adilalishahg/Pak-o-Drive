'use client';

import React from 'react';
import { SiteTheme, IconLibrary } from '../../common/DynamicThemeProvider';
import { SectionCard, RadiusSlider } from './ThemeUIPrimitives';

const SHADOW_OPTIONS: SiteTheme['shadowIntensity'][] = ['none', 'light', 'medium', 'strong'];

const ICON_LIBRARIES: {
  id: IconLibrary;
  name: string;
  description: string;
  preview: string[];
  color: string;
}[] = [
  {
    id: 'fontawesome',
    name: 'Font Awesome',
    description: 'The most popular icon library with 2,000+ icons',
    preview: ['fas fa-home', 'fas fa-star', 'fas fa-bolt', 'fas fa-heart'],
    color: '#528dd3',
  },
  {
    id: 'material',
    name: 'Material Icons',
    description: "Google's Material Design icon set",
    preview: [],
    color: '#4285f4',
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap Icons',
    description: 'Official Bootstrap icon library with 1,800+ icons',
    preview: ['bi-house', 'bi-star', 'bi-lightning', 'bi-heart'],
    color: '#7952b3',
  },
  {
    id: 'remix',
    name: 'Remix Icons',
    description: 'Open-source neutral-style system icons',
    preview: ['ri-home-line', 'ri-star-line', 'ri-flashlight-line', 'ri-heart-line'],
    color: '#0ea5e9',
  },
  {
    id: 'phosphor',
    name: 'Phosphor Icons',
    description: 'Flexible icon family for interfaces',
    preview: ['ph ph-house', 'ph ph-star', 'ph ph-lightning', 'ph ph-heart'],
    color: '#8b5cf6',
  },
];

interface ShapesEffectsSectionProps {
  form: SiteTheme;
  onSet: <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => void;
}

export function ShapesEffectsSection({ form, onSet }: ShapesEffectsSectionProps) {
  return (
    <SectionCard title="Shapes, Borders & UI Effects" icon="fas fa-shapes" badge="Corner Radius">
      {/* Corner Radiuses */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <RadiusSlider
            label="Buttons Corner Radius"
            value={form.buttonRadius}
            onChange={(v) => onSet('buttonRadius', v)}
          />
        </div>
        <div className="col-12 col-md-4">
          <RadiusSlider
            label="Product Cards Radius"
            value={form.cardRadius}
            onChange={(v) => onSet('cardRadius', v)}
          />
        </div>
        <div className="col-12 col-md-4">
          <RadiusSlider
            label="General Elements (Modals/Inputs)"
            value={form.borderRadius}
            onChange={(v) => onSet('borderRadius', v)}
          />
        </div>
      </div>

      {/* Shadow Intensity */}
      <div className="mb-4 pt-3 border-top">
        <label className="form-label small fw-medium text-dark mb-2">Shadow Intensity</label>
        <div className="d-flex gap-2 flex-wrap">
          {SHADOW_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSet('shadowIntensity', opt)}
              className={`btn btn-sm rounded-pill text-capitalize px-3 ${
                form.shadowIntensity === opt ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              style={{ fontSize: '0.8rem' }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-3 border-top">
        <div className="d-flex align-items-center justify-content-between py-2 border-bottom flex-wrap gap-2">
          <div>
            <div className="fw-medium text-dark" style={{ fontSize: '0.88rem' }}>
              Micro-Animations & Hover Transitions
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Card hover elevation, button scale effect, pulsing live visitor dots.
            </div>
          </div>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={form.animationsEnabled}
              onChange={(e) => onSet('animationsEnabled', e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between py-2 flex-wrap gap-2">
          <div>
            <div className="fw-medium text-dark" style={{ fontSize: '0.88rem' }}>
              Glassmorphism & Frosted Glass Backdrops
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Backdrop blur effect on floating cart badge, sticky bottom bars, and modals.
            </div>
          </div>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={form.glassmorphismEnabled}
              onChange={(e) => onSet('glassmorphismEnabled', e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Icon Library Selector */}
      <div className="pt-3 border-top">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="fw-semibold text-dark mb-0 small">Icon Library Provider</label>
          <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.7rem' }}>
            Multi-Provider Ready
          </span>
        </div>
        <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
          Select the active icon provider for storefront navigation, badges, cart buttons, and feature cards.
        </p>
        <div className="row g-2">
          {ICON_LIBRARIES.map((lib) => {
            const isSel = form.iconLibrary === lib.id;
            return (
              <div key={lib.id} className="col-12 col-sm-6 col-md-4">
                <div
                  onClick={() => onSet('iconLibrary', lib.id)}
                  className={`p-2.5 rounded-3 border text-start h-100 transition-all ${
                    isSel
                      ? 'border-primary bg-primary bg-opacity-10 shadow-xs'
                      : 'border-secondary-subtle hover:border-primary'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-dark small" style={{ fontSize: '0.8rem' }}>
                      {lib.name}
                    </span>
                    {isSel && (
                      <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.62rem' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
                    {lib.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
