'use client';

import React from 'react';
import { SectionCard } from './ThemeUIPrimitives';
import { SiteTheme, NavbarFooterSectionProps } from '@/types/theme';

const NAVBAR_STYLE_OPTIONS: SiteTheme['navbarStyle'][] = ['dark', 'light', 'gradient'];
const FOOTER_STYLE_OPTIONS: SiteTheme['footerStyle'][] = ['dark', 'light'];

export function NavbarFooterSection({ form, onSet }: NavbarFooterSectionProps) {

  return (
    <SectionCard title="Navbar, Footer & Announcement Bar" icon="fas fa-bars">
      <div className="row g-3 mb-4">
        {/* Navbar Style */}
        <div className="col-12 col-md-6">
          <label className="form-label small fw-medium mb-1">Navbar Style</label>
          <div className="d-flex gap-2">
            {NAVBAR_STYLE_OPTIONS.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onSet('navbarStyle', style)}
                className={`btn btn-sm rounded-pill text-capitalize flex-fill ${
                  form.navbarStyle === style ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.8rem' }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Style */}
        <div className="col-12 col-md-6">
          <label className="form-label small fw-medium mb-1">Footer Style</label>
          <div className="d-flex gap-2">
            {FOOTER_STYLE_OPTIONS.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onSet('footerStyle', style)}
                className={`btn btn-sm rounded-pill text-capitalize flex-fill ${
                  form.footerStyle === style ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.8rem' }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="pt-3 border-top">
        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
          <label className="fw-semibold text-dark mb-0 small">Top Announcement Bar</label>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={form.announcementBarEnabled}
              onChange={(e) => onSet('announcementBarEnabled', e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
        <input
          type="text"
          className="form-control form-control-sm"
          value={form.announcementBarText}
          onChange={(e) => onSet('announcementBarText', e.target.value)}
          placeholder="Announcement text banner..."
          style={{ fontSize: '0.82rem' }}
        />
      </div>

      {/* Site Tagline */}
      <div className="pt-3 border-top mt-3">
        <label className="form-label small fw-medium text-dark mb-1">Store Tagline / Slogan</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={form.siteTagline}
          onChange={(e) => onSet('siteTagline', e.target.value)}
          placeholder="Pakistan's Trusted Electronics Store"
          style={{ fontSize: '0.82rem' }}
        />
      </div>
    </SectionCard>
  );
}
