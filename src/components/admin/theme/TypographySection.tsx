'use client';

import React from 'react';
import { SiteTheme } from '../../common/DynamicThemeProvider';
import { SectionCard } from './ThemeUIPrimitives';

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Plus Jakarta Sans',
  'Nunito', 'Raleway', 'DM Sans', 'Lato', 'Open Sans',
  'Outfit', 'Figtree', 'Sora', 'Space Grotesk', 'Josefin Sans',
];

const FONT_SIZE_OPTIONS = ['13px', '14px', '15px', '16px', '17px', '18px', '20px'];

interface TypographySectionProps {
  fontFamily: string;
  fontSizeBase: string;
  onSet: <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => void;
}

export function TypographySection({ fontFamily, fontSizeBase, onSet }: TypographySectionProps) {
  return (
    <SectionCard title="Typography & Fonts" icon="fas fa-font" badge="Google Fonts">
      <div className="row g-3">
        <div className="col-12 col-md-7">
          <label className="form-label small fw-medium mb-1">Primary Font Family</label>
          <select
            className="form-select"
            value={fontFamily}
            onChange={(e) => onSet('fontFamily', e.target.value)}
            style={{ fontFamily }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f} — Preview: The quick brown fox jumps over 123
              </option>
            ))}
          </select>
          <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
            Automatically loads from Google Fonts. Applied site-wide across all headings, cards, and body text.
          </div>
        </div>

        <div className="col-12 col-md-5">
          <label className="form-label small fw-medium mb-1">Base Font Size</label>
          <div className="d-flex gap-1 flex-wrap">
            {FONT_SIZE_OPTIONS.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onSet('fontSizeBase', sz)}
                className={`btn btn-sm rounded-3 ${
                  fontSizeBase === sz ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.78rem', minWidth: '42px' }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Live Preview */}
      <div
        className="mt-3 p-3 bg-light rounded-3 border"
        style={{ fontFamily, fontSize: fontSizeBase }}
      >
        <div className="fw-bold mb-1">Typography Sample — {fontFamily}</div>
        <p className="text-muted mb-0" style={{ fontSize: '0.88em' }}>
          Pak-o-Drive: Pakistan&apos;s leading e-commerce destination for automobile accessories, audio gadgets & tech.
        </p>
      </div>
    </SectionCard>
  );
}
