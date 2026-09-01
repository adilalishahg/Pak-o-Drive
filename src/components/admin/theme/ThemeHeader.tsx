'use client';

import React from 'react';
import { ThemeHeaderProps } from '@/types/theme';

export function ThemeHeader({ saving, toast, onSave, onReset }: ThemeHeaderProps) {

  return (
    <>
      {/* Top Header Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            <i className="fas fa-palette text-primary me-2" />
            Theme & Appearance
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
            Customize colors, fonts, shapes, and effects. Changes apply site-wide instantly.
          </p>
        </div>
        <div className="d-flex gap-2 w-100 w-sm-auto flex-wrap">
          <button
            type="button"
            onClick={onReset}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 px-sm-4 flex-fill flex-sm-grow-0"
            style={{ fontWeight: 500 }}
          >
            <i className="fas fa-undo me-1" /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn btn-sm rounded-pill px-3 px-sm-4 text-white flex-fill flex-sm-grow-0"
            style={{
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(234,88,12,0.35)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving…
              </>
            ) : (
              <>
                <i className="fas fa-save me-2" />
                Save & Apply
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`alert border-0 rounded-3 mb-4 d-flex align-items-center gap-2 ${
            toast.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}
    </>
  );
}
