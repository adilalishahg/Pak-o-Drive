'use client';

import React from 'react';
import { PakODriveLogo } from '../../common/PakODriveLogo';
import { SectionCard } from './ThemeUIPrimitives';
import { SvgLogoSettings, SvgLogoStudioProps } from '@/types/theme';
import { FONT_OPTIONS, LOGO_PRESETS, DEFAULT_SVG_LOGO } from '@/lib/themeConstants';

export function SvgLogoStudio({ svgLogo, onSetSvgLogo }: SvgLogoStudioProps) {

  const currentLogo = svgLogo || DEFAULT_SVG_LOGO;

  return (
    <SectionCard title="⚡ SVG Vector Logo Studio" icon="fas fa-shapes" badge="Vector Engine">
      <p className="text-muted small mb-3" style={{ fontSize: '0.83rem' }}>
        Customize the native Vector SVG Logo. Live preview adjusts colors, typography, font style, and letter spacing across all Navbars & Footers site-wide.
      </p>

      {/* Live Logo Preview Canvas */}
      <div className="bg-dark rounded-4 p-4 mb-4 text-center border position-relative overflow-hidden shadow-inner">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center py-2">
          <div className="mb-2">
            <span
              className="badge bg-secondary bg-opacity-50 text-white rounded-pill px-3 py-1"
              style={{ fontSize: '0.68rem', letterSpacing: '1px' }}
            >
              NAVBAR PREVIEW (DARK BACKDROP)
            </span>
          </div>
          <div className="py-2">
            <PakODriveLogo {...currentLogo} height={Math.min(currentLogo.height || 38, 48)} />
          </div>
        </div>
      </div>

      {/* 1-Click Logo Color Presets */}
      <div className="mb-4">
        <label className="form-label small fw-bold text-dark mb-2" style={{ fontSize: '0.82rem' }}>
          🎨 1-Click Logo Color Palettes:
        </label>
        <div className="d-flex flex-wrap gap-2">
          {LOGO_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSetSvgLogo('primaryColor', p.primaryColor);
                onSetSvgLogo('secondaryColor', p.secondaryColor);
                onSetSvgLogo('accentColor', p.accentColor);
              }}
              className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1.5 px-3 py-1 text-start"
              style={{ fontSize: '0.75rem', background: '#f8fafc' }}
            >
              <span
                className="rounded-circle d-inline-block border"
                style={{ width: '10px', height: '10px', background: p.primaryColor }}
              />
              <span
                className="rounded-circle d-inline-block border"
                style={{ width: '10px', height: '10px', background: p.accentColor }}
              />
              <span className="text-dark fw-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Colors Row */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Primary Color (Upper Wing)
          </label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="color"
              value={currentLogo.primaryColor || '#00A8E8'}
              onChange={(e) => onSetSvgLogo('primaryColor', e.target.value)}
              className="form-control form-control-color flex-shrink-0"
              style={{ width: '38px', height: '34px', cursor: 'pointer', padding: '2px', borderRadius: '8px' }}
            />
            <input
              type="text"
              value={currentLogo.primaryColor || '#00A8E8'}
              onChange={(e) => onSetSvgLogo('primaryColor', e.target.value)}
              className="form-control form-control-sm font-monospace"
              style={{ fontSize: '0.8rem' }}
              maxLength={7}
            />
          </div>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Secondary Color (Lower Wing)
          </label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="color"
              value={currentLogo.secondaryColor || '#0066CC'}
              onChange={(e) => onSetSvgLogo('secondaryColor', e.target.value)}
              className="form-control form-control-color flex-shrink-0"
              style={{ width: '38px', height: '34px', cursor: 'pointer', padding: '2px', borderRadius: '8px' }}
            />
            <input
              type="text"
              value={currentLogo.secondaryColor || '#0066CC'}
              onChange={(e) => onSetSvgLogo('secondaryColor', e.target.value)}
              className="form-control form-control-sm font-monospace"
              style={{ fontSize: '0.8rem' }}
              maxLength={7}
            />
          </div>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Accent Color (Speed Needle & Text 2)
          </label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="color"
              value={currentLogo.accentColor || '#FF7A00'}
              onChange={(e) => onSetSvgLogo('accentColor', e.target.value)}
              className="form-control form-control-color flex-shrink-0"
              style={{ width: '38px', height: '34px', cursor: 'pointer', padding: '2px', borderRadius: '8px' }}
            />
            <input
              type="text"
              value={currentLogo.accentColor || '#FF7A00'}
              onChange={(e) => onSetSvgLogo('accentColor', e.target.value)}
              className="form-control form-control-sm font-monospace"
              style={{ fontSize: '0.8rem' }}
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Typography & Text Controls */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Primary Word (Text 1)
          </label>
          <input
            type="text"
            value={currentLogo.text1 ?? 'PAKO'}
            onChange={(e) => onSetSvgLogo('text1', e.target.value)}
            className="form-control form-control-sm font-monospace fw-bold"
            placeholder="PAKO"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Secondary Word (Text 2)
          </label>
          <input
            type="text"
            value={currentLogo.text2 ?? 'DRIVE'}
            onChange={(e) => onSetSvgLogo('text2', e.target.value)}
            className="form-control form-control-sm font-monospace fw-bold"
            placeholder="DRIVE"
          />
        </div>
      </div>

      {/* Font Family, Weight, Style */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Font Family
          </label>
          <select
            className="form-select form-select-sm"
            value={currentLogo.fontFamily || 'Montserrat'}
            onChange={(e) => onSetSvgLogo('fontFamily', e.target.value)}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Font Weight
          </label>
          <select
            className="form-select form-select-sm"
            value={currentLogo.fontWeight || '900'}
            onChange={(e) => onSetSvgLogo('fontWeight', e.target.value)}
          >
            <option value="600">600 — Semi Bold</option>
            <option value="700">700 — Bold</option>
            <option value="800">800 — Extra Bold</option>
            <option value="900">900 — Black / Heavy</option>
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label small text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
            Font Style
          </label>
          <select
            className="form-select form-select-sm"
            value={currentLogo.fontStyle || 'normal'}
            onChange={(e) => onSetSvgLogo('fontStyle', e.target.value as 'normal' | 'italic')}
          >
            <option value="normal">Normal (Straight)</option>
            <option value="italic">Italic (Sporty / Slanted)</option>
          </select>
        </div>
      </div>

      {/* Sliders: Letter Spacing & Height */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label className="form-label small text-muted fw-semibold mb-0" style={{ fontSize: '0.78rem' }}>
              Letter Spacing
            </label>
            <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>
              {currentLogo.letterSpacing ?? 5}px
            </span>
          </div>
          <input
            type="range"
            className="form-range"
            min={-5}
            max={25}
            step={1}
            value={currentLogo.letterSpacing ?? 5}
            onChange={(e) => onSetSvgLogo('letterSpacing', Number(e.target.value))}
          />
        </div>

        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label className="form-label small text-muted fw-semibold mb-0" style={{ fontSize: '0.78rem' }}>
              Logo Display Height
            </label>
            <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>
              {currentLogo.height ?? 38}px
            </span>
          </div>
          <input
            type="range"
            className="form-range"
            min={24}
            max={64}
            step={2}
            value={currentLogo.height ?? 38}
            onChange={(e) => onSetSvgLogo('height', Number(e.target.value))}
          />
        </div>
      </div>
    </SectionCard>
  );
}
