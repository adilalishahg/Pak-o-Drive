'use client';

import React from 'react';
import { SectionCard } from './ThemeUIPrimitives';
import { LayoutThemeSelectorProps } from '@/types/theme';

export function LayoutThemeSelector({ layoutTheme, onSelectPreset }: LayoutThemeSelectorProps) {

  return (
    <SectionCard title="Layout Theme & Storefront Style" icon="fas fa-desktop" badge="1-Click Presets">
      <p className="text-muted small mb-3" style={{ fontSize: '0.83rem' }}>
        Select the visual layout structure for your entire e-commerce storefront. Each preset activates tailored hero cards, navigation, and product grids.
      </p>

      <div className="row g-3">
        {/* Preset 1: Classic (Pak-o-Drive Vibrant Orange) */}
        <div className="col-12 col-sm-6 col-md-4">
          <div
            onClick={() => onSelectPreset('classic')}
            className={`p-3 rounded-4 border text-start h-100 transition-all ${
              layoutTheme === 'classic'
                ? 'border-primary shadow-sm bg-primary bg-opacity-10 ring-2 ring-primary'
                : 'border-secondary-subtle hover:border-primary hover:shadow-xs'
            }`}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {layoutTheme === 'classic' && (
              <span className="position-absolute top-0 end-0 translate-middle-y me-2 badge bg-primary rounded-pill">
                Active
              </span>
            )}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px', background: '#ea580c', color: '#fff' }}
              >
                <i className="fas fa-bolt" style={{ fontSize: '0.75rem' }} />
              </div>
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                Classic Orange
              </h6>
            </div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.74rem', lineHeight: 1.4 }}>
              Pak-o-Drive original vibrant layout with dynamic hero carousel, hot deals ticker, and bold category grids.
            </p>
            <div className="d-flex gap-1">
              <span className="badge bg-dark text-white" style={{ fontSize: '0.65rem' }}>
                Dark Nav
              </span>
              <span className="badge text-white" style={{ background: '#ea580c', fontSize: '0.65rem' }}>
                #ea580c
              </span>
            </div>
          </div>
        </div>

        {/* Preset 2: Modern Green (Pro Deep Emerald & Gold) */}
        <div className="col-12 col-sm-6 col-md-4">
          <div
            onClick={() => onSelectPreset('modern-green')}
            className={`p-3 rounded-4 border text-start h-100 transition-all ${
              layoutTheme === 'modern-green'
                ? 'border-success shadow-sm bg-success bg-opacity-10 ring-2 ring-success'
                : 'border-secondary-subtle hover:border-success hover:shadow-xs'
            }`}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {layoutTheme === 'modern-green' && (
              <span className="position-absolute top-0 end-0 translate-middle-y me-2 badge bg-success rounded-pill">
                Active
              </span>
            )}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px', background: '#0d231d', color: '#d4af37' }}
              >
                <i className="fas fa-crown" style={{ fontSize: '0.75rem' }} />
              </div>
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                Modern Emerald
              </h6>
            </div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.74rem', lineHeight: 1.4 }}>
              Luxury deep emerald background (`#0d231d`) with gold accents, high-contrast borders, and cream typography.
            </p>
            <div className="d-flex gap-1">
              <span className="badge text-white" style={{ background: '#0d231d', fontSize: '0.65rem' }}>
                #0d231d
              </span>
              <span className="badge text-dark" style={{ background: '#d4af37', fontSize: '0.65rem' }}>
                #d4af37
              </span>
            </div>
          </div>
        </div>

        {/* Preset 3: Theme 1 (Clean Minimalist White) */}
        <div className="col-12 col-sm-6 col-md-4">
          <div
            onClick={() => onSelectPreset('theme1')}
            className={`p-3 rounded-4 border text-start h-100 transition-all ${
              layoutTheme === 'theme1'
                ? 'border-primary shadow-sm bg-primary bg-opacity-10 ring-2 ring-primary'
                : 'border-secondary-subtle hover:border-primary hover:shadow-xs'
            }`}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {layoutTheme === 'theme1' && (
              <span className="position-absolute top-0 end-0 translate-middle-y me-2 badge bg-primary rounded-pill">
                Active
              </span>
            )}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary border"
                style={{ width: '28px', height: '28px' }}
              >
                <i className="fas fa-sparkles" style={{ fontSize: '0.75rem' }} />
              </div>
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.88rem' }}>
                Clean Minimalist
              </h6>
            </div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.74rem', lineHeight: 1.4 }}>
              Light airy aesthetic with hero grid banners, soft neutral backgrounds, and royal blue accents.
            </p>
            <div className="d-flex gap-1">
              <span className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>
                Light Nav
              </span>
              <span className="badge text-white" style={{ background: '#2563eb', fontSize: '0.65rem' }}>
                #2563eb
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
