'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DEFAULT_THEME, IconLibrary, SiteTheme } from '../../../components/common/DynamicThemeProvider';
import { optimizeImageBeforeUpload } from '../../../utils/imageOptimizer';

/* ─── Helpers ────────────────────────────────────────────────── */
const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Plus Jakarta Sans',
  'Nunito', 'Raleway', 'DM Sans', 'Lato', 'Open Sans',
  'Outfit', 'Figtree', 'Sora', 'Space Grotesk', 'Josefin Sans',
];

const FONT_SIZE_OPTIONS = ['13px', '14px', '15px', '16px', '17px', '18px', '20px'];

/* Radius value ↔ slider index */
const RADIUS_STEPS = [0, 4, 8, 12, 16, 20, 24, 32, 40, 50];

function pxToStep(px: string, maxIdx: number): number {
  const n = parseInt(px) || 0;
  let closest = 0;
  let minDiff = Infinity;
  RADIUS_STEPS.forEach((v, i) => {
    if (i > maxIdx) return;
    const diff = Math.abs(v - n);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}

function stepToPx(idx: number): string {
  return `${RADIUS_STEPS[Math.min(idx, RADIUS_STEPS.length - 1)]}px`;
}

const SHADOW_OPTIONS: SiteTheme['shadowIntensity'][] = ['none', 'light', 'medium', 'strong'];
const NAVBAR_STYLE_OPTIONS: SiteTheme['navbarStyle'][] = ['dark', 'light', 'gradient'];
const FOOTER_STYLE_OPTIONS: SiteTheme['footerStyle'][] = ['dark', 'light'];

/* ─── Icon Library definitions ───────────────────────────────── */
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
    // Material uses ligatures — rendered differently
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

/* ─── Radius Slider ──────────────────────────────────────────── */
function RadiusSlider({
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
        <label className="form-label small fw-medium mb-0" style={{ fontSize: '0.82rem' }}>{label}</label>
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
function ColorRow({
  label, name, value, onChange,
}: { label: string; name: keyof SiteTheme; value: string; onChange: (k: keyof SiteTheme, v: string) => void }) {
  return (
    <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
      <label className="fw-medium text-dark mb-0" style={{ fontSize: '0.88rem' }}>{label}</label>
      <div className="d-flex align-items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-control form-control-color"
          style={{ width: '44px', height: '36px', padding: '2px', cursor: 'pointer', borderRadius: '8px' }}
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-control form-control-sm"
          style={{ width: '100px', fontFamily: 'monospace', fontSize: '0.82rem' }}
          aria-label={`${label} hex value`}
          maxLength={7}
        />
      </div>
    </div>
  );
}

/* ─── Section Card ───────────────────────────────────────────── */
function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-4">
        <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem', letterSpacing: '-0.2px' }}>
          <i className={`${icon} text-primary`} />
          {title}
        </h6>
        {children}
      </div>
    </div>
  );
}

/* ─── Live Preview ───────────────────────────────────────────── */
function LivePreview({ theme }: { theme: SiteTheme }) {
  const primaryRgb = theme.primaryColor
    .replace('#', '')
    .match(/.{2}/g)!
    .map((h) => parseInt(h, 16))
    .join(', ');

  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  const navBg = isModernGreen
    ? '#0d231d'
    : isCleanWhite
      ? '#ffffff'
      : theme.navbarStyle === 'light'
        ? '#fff'
        : theme.navbarStyle === 'gradient'
        ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
        : `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.secondaryColor}cc 100%)`;

  const footerBg = isModernGreen ? '#0d231d' : isCleanWhite ? '#f8fafc' : theme.footerStyle === 'light' ? '#f8fafc' : theme.secondaryColor;
  const bodyBg = isModernGreen ? '#f7f5ed' : isCleanWhite ? '#f8fafc' : '#f8fafc';
  const cardBg = isModernGreen ? '#fbfaf7' : isCleanWhite ? '#ffffff' : (theme.glassmorphismEnabled ? 'rgba(255,255,255,0.85)' : '#fff');
  const cardBorder = isModernGreen ? '1px solid #d4af3740' : isCleanWhite ? '1px solid #e2e8f0' : '1px solid #f1f5f9';
  const logoColor = isModernGreen ? '#d4af37' : isCleanWhite ? '#2563eb' : (theme.navbarStyle === 'light' ? theme.secondaryColor : '#fff');
  const textColor = isModernGreen ? '#d4af37' : isCleanWhite ? '#1e293b' : (theme.navbarStyle === 'light' ? '#64748b' : 'rgba(255,255,255,0.8)');
  const itemTextColor = isModernGreen ? '#0d231d' : isCleanWhite ? '#1e293b' : theme.secondaryColor;

  const cardShadow =
    theme.shadowIntensity === 'none' ? 'none'
      : theme.shadowIntensity === 'light' ? '0 4px 12px rgba(0,0,0,0.06)'
      : theme.shadowIntensity === 'medium' ? '0 10px 30px rgba(0,0,0,0.10)'
      : '0 20px 50px rgba(0,0,0,0.18)';

  return (
    <div
      className="rounded-4 overflow-hidden border"
      style={{ fontFamily: `'${theme.fontFamily}', sans-serif`, fontSize: theme.fontSizeBase, boxShadow: cardShadow }}
    >
      {/* Announcement Bar */}
      {theme.announcementBarEnabled && (
        <div
          style={{ background: isModernGreen ? '#d4af37' : theme.secondaryColor, color: isModernGreen ? '#0d231d' : '#fff', fontSize: '11px', padding: '6px 12px', textAlign: 'center', fontWeight: isModernGreen ? 700 : 500 }}
        >
          {theme.announcementBarText}
        </div>
      )}

      {/* Navbar */}
      <div
        style={{
          background: navBg,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            color: logoColor,
            fontWeight: 800,
            fontSize: '0.9rem',
          }}
        >
          🛒 PAKODRIVE
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Home', 'Shop', 'Contact'].map((l) => (
            <span
              key={l}
              style={{
                color: textColor,
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          background: isModernGreen ? '#0d231d' : `linear-gradient(135deg, ${theme.heroGradientStart} 0%, ${theme.heroGradientEnd} 100%)`,
          padding: '20px 16px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: isModernGreen ? '#d4af37' : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
            color: isModernGreen ? '#0d231d' : '#fff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            marginBottom: '8px',
            letterSpacing: '0.8px',
          }}
        >
          🔥 Limited Time Deal
        </div>
        <p style={{ color: isModernGreen ? '#d4af37' : theme.primaryColor, fontWeight: 800, fontSize: '0.75rem', margin: '0 0 4px', letterSpacing: '2px' }}>
          Save Up To PKR 15,000
        </p>
        <h2 style={{ color: isModernGreen ? '#f7f5ed' : theme.secondaryColor, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 10px' }}>
          Premium Electronics
        </h2>
        <button
          style={{
            background: isModernGreen ? '#d4af37' : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
            color: isModernGreen ? '#0d231d' : '#fff',
            border: 'none',
            borderRadius: theme.buttonRadius,
            padding: '8px 20px',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: isModernGreen ? 'none' : `0 4px 14px rgba(${primaryRgb}, 0.35)`,
          }}
        >
          Shop Now →
        </button>
      </div>

      {/* Product Cards */}
      <div style={{ background: bodyBg, padding: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['Headphones', 'Smartwatch', 'Charger'].map((p, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              borderRadius: theme.cardRadius,
              padding: '12px',
              flex: '1 1 80px',
              boxShadow: cardShadow,
              border: cardBorder,
              backdropFilter: !isModernGreen && theme.glassmorphismEnabled ? 'blur(8px)' : 'none',
            }}
          >
            <div style={{ height: '40px', background: isModernGreen ? '#eae7db' : '#f1f5f9', borderRadius: '8px', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: '0 0 2px', color: itemTextColor }}>{p}</p>
            <p style={{ fontSize: '0.68rem', color: isModernGreen ? '#d4af37' : theme.primaryColor, fontWeight: 600, margin: 0 }}>PKR 12,000</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          background: footerBg,
          color: isModernGreen ? '#eae7db' : (theme.footerStyle === 'light' ? '#64748b' : '#94a3b8'),
          padding: '10px 16px',
          fontSize: '0.7rem',
          textAlign: 'center',
        }}
      >
        © 2026 PAKODRIVE — {theme.siteTagline}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ThemeSettingsPage() {
  const [form, setForm] = useState<SiteTheme>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  /* Load settings on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/site-settings');
        const json = await res.json();
        if (json.success && json.data) {
          setForm({ ...DEFAULT_THEME, ...json.data });
        }
      } catch {
        /* use defaults */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = useCallback(<K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const applyPreset = (presetName: 'classic' | 'modern-green' | 'theme1') => {
    if (presetName === 'classic') {
      setForm((prev) => ({
        ...prev,
        layoutTheme: 'classic',
        primaryColor: '#ea580c',
        secondaryColor: '#0f172a',
        accentColor: '#3b82f6',
        successColor: '#10b981',
        heroGradientStart: '#fff7ed',
        heroGradientEnd: '#ffffff',
        navbarStyle: 'dark',
        footerStyle: 'dark',
        cardRadius: '16px',
        borderRadius: '16px',
        buttonRadius: '50px',
      }));
    } else if (presetName === 'modern-green') {
      setForm((prev) => ({
        ...prev,
        layoutTheme: 'modern-green',
        primaryColor: '#0d231d',
        secondaryColor: '#0d231d',
        accentColor: '#d4af37',
        successColor: '#16a34a',
        heroGradientStart: '#0d231d',
        heroGradientEnd: '#0d231d',
        navbarStyle: 'dark',
        footerStyle: 'dark',
        cardRadius: '24px',
        borderRadius: '24px',
        buttonRadius: '10px',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        layoutTheme: 'theme1',
        primaryColor: '#2563eb',
        secondaryColor: '#1e293b',
        accentColor: '#2563eb',
        successColor: '#10b981',
        heroGradientStart: '#ffffff',
        heroGradientEnd: '#f8fafc',
        navbarStyle: 'light',
        footerStyle: 'light',
        cardRadius: '12px',
        borderRadius: '12px',
        buttonRadius: '8px',
        fontFamily: 'Outfit',
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ msg: 'Theme saved! Changes are live on the storefront.', type: 'success' });
      } else {
        setToast({ msg: json.error || 'Failed to save.', type: 'error' });
      }
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all theme settings to defaults?')) return;
    setForm(DEFAULT_THEME);
    setSaving(true);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_THEME),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ msg: 'Theme reset to defaults.', type: 'success' });
      }
    } catch {
      setToast({ msg: 'Reset failed.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
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
        <div className="d-flex gap-2">
          <button onClick={handleReset} className="btn btn-outline-secondary rounded-pill px-4" style={{ fontWeight: 500 }}>
            <i className="fas fa-undo me-1" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn rounded-pill px-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(234,88,12,0.35)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
            ) : (
              <><i className="fas fa-save me-2" />Save & Apply</>
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`alert border-0 rounded-3 mb-4 d-flex align-items-center gap-2 ${
            toast.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          {toast.msg}
        </div>
      )}

      <div className="row g-4">
        {/* ── LEFT COLUMN — Controls ───────────────────────── */}
        <div className="col-12 col-xl-7">

          {/* Active Layout Switcher preset card */}
          <SectionCard title="Active Layout Theme" icon="fas fa-layer-group">
            <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
              Choose your active storefront layout. Applying a layout automatically updates the color palette, borders, and footer style parameters.
            </p>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div 
                  onClick={() => applyPreset('classic')}
                  className="card p-3 cursor-pointer text-center h-100 transition-all"
                  style={{
                    cursor: 'pointer',
                    border: form.layoutTheme === 'classic' ? '2.5px solid var(--pd-primary, #ea580c)' : '1.5px solid #e2e8f0',
                    background: form.layoutTheme === 'classic' ? 'rgba(234,88,12,0.04)' : '#fff',
                    borderRadius: '16px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-2 flex-wrap gap-1">
                    <span className="badge bg-warning text-dark">Orange Accent</span>
                    <span className="badge bg-dark text-white">Classic</span>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: form.layoutTheme === 'classic' ? 'var(--pd-primary)' : '#1e293b' }}>
                    Classic Storefront
                  </h6>
                  <p className="mb-0 text-muted small" style={{ fontSize: '0.72rem' }}>
                    Bright orange elements, dark footer, sharp cards, and slate background overlays.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div 
                  onClick={() => applyPreset('modern-green')}
                  className="card p-3 cursor-pointer text-center h-100 transition-all"
                  style={{
                    cursor: 'pointer',
                    border: form.layoutTheme === 'modern-green' ? '2.5px solid #d4af37' : '1.5px solid #e2e8f0',
                    background: form.layoutTheme === 'modern-green' ? 'rgba(212,175,55,0.05)' : '#fff',
                    borderRadius: '16px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-2 flex-wrap gap-1">
                    <span className="badge text-dark" style={{ background: '#d4af37' }}>Gold Accent</span>
                    <span className="badge text-white" style={{ background: '#0d231d' }}>Dark Green</span>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: form.layoutTheme === 'modern-green' ? '#0d231d' : '#1e293b' }}>
                    Premium Modern Green
                  </h6>
                  <p className="mb-0 text-muted small" style={{ fontSize: '0.72rem' }}>
                    Dark green topbar/navbar, warm off-white body background, gold highlights, and rounded cards.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div 
                  onClick={() => applyPreset('theme1')}
                  className="card p-3 cursor-pointer text-center h-100 transition-all"
                  style={{
                    cursor: 'pointer',
                    border: form.layoutTheme === 'theme1' ? '2.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: form.layoutTheme === 'theme1' ? 'rgba(37,99,235,0.04)' : '#fff',
                    borderRadius: '16px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-2 flex-wrap gap-1">
                    <span className="badge bg-primary text-white">Blue Accent</span>
                    <span className="badge bg-secondary text-white">Theme 1</span>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: form.layoutTheme === 'theme1' ? '#2563eb' : '#1e293b' }}>
                    Theme 1 (Clean White)
                  </h6>
                  <p className="mb-0 text-muted small" style={{ fontSize: '0.72rem' }}>
                    Theme 1 layout with clean white background, dynamic blue accents, light card borders, and minimalistic structure.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Colors */}
          <SectionCard title="Color Palette" icon="fas fa-fill-drip">
            <ColorRow label="Primary Color" name="primaryColor" value={form.primaryColor} onChange={set} />
            <ColorRow label="Secondary / Dark" name="secondaryColor" value={form.secondaryColor} onChange={set} />
            <ColorRow label="Accent Color" name="accentColor" value={form.accentColor} onChange={set} />
            <ColorRow label="Success / Green" name="successColor" value={form.successColor} onChange={set} />
            <ColorRow label="Hero Gradient Start" name="heroGradientStart" value={form.heroGradientStart} onChange={set} />
            <ColorRow label="Hero Gradient End" name="heroGradientEnd" value={form.heroGradientEnd} onChange={set} />
          </SectionCard>

          {/* Typography */}
          <SectionCard title="Typography" icon="fas fa-font">
            <div className="row g-3">
              <div className="col-md-7">
                <label className="form-label small fw-medium">Font Family</label>
                <select
                  className="form-select form-select-sm"
                  value={form.fontFamily}
                  onChange={(e) => set('fontFamily', e.target.value)}
                  style={{ fontFamily: `'${form.fontFamily}', sans-serif` }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label small fw-medium">Base Font Size</label>
                <select
                  className="form-select form-select-sm"
                  value={form.fontSizeBase}
                  onChange={(e) => set('fontSizeBase', e.target.value)}
                >
                  {FONT_SIZE_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div
              className="mt-3 p-3 bg-light rounded-3"
              style={{ fontFamily: `'${form.fontFamily}', sans-serif`, fontSize: form.fontSizeBase }}
            >
              <span className="fw-bold text-dark">Preview: </span>
              The quick brown fox jumps over the lazy dog.
            </div>
          </SectionCard>

          {/* Icon Library */}
          <SectionCard title="Icon Library" icon="fas fa-icons">
            <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
              Select which icon library to use across the storefront. Changes take effect after save.
            </p>
            <div className="row g-2">
              {ICON_LIBRARIES.map((lib) => {
                const selected = (form.iconLibrary ?? 'fontawesome') === lib.id;
                return (
                  <div key={lib.id} className="col-12 col-sm-6">
                    <button
                      type="button"
                      onClick={() => set('iconLibrary', lib.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: selected ? `2px solid ${lib.color}` : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        background: selected ? `${lib.color}10` : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: selected ? `0 4px 16px ${lib.color}22` : 'none',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div
                          style={{
                            width: '28px', height: '28px',
                            borderRadius: '7px',
                            background: selected ? lib.color : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background 0.18s',
                          }}
                        >
                          <i
                            className="fas fa-icons"
                            style={{ fontSize: '12px', color: selected ? '#fff' : lib.color }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: selected ? lib.color : '#1e293b' }}>
                          {lib.name}
                        </span>
                        {selected && (
                          <span
                            className="ms-auto badge rounded-pill text-white"
                            style={{ background: lib.color, fontSize: '0.68rem' }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 }}>
                        {lib.description}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Shape */}
          <SectionCard title="Shape & Radius" icon="fas fa-vector-square">
            <div className="row g-4">
              <div className="col-md-4">
                <RadiusSlider
                  label="Card Radius"
                  value={form.cardRadius}
                  onChange={(v) => set('cardRadius', v)}
                  max={8}
                />
              </div>
              <div className="col-md-4">
                <RadiusSlider
                  label="Section Radius"
                  value={form.borderRadius}
                  onChange={(v) => set('borderRadius', v)}
                  max={8}
                />
              </div>
              <div className="col-md-4">
                <RadiusSlider
                  label="Button Radius"
                  value={form.buttonRadius}
                  onChange={(v) => set('buttonRadius', v)}
                  max={9}
                />
              </div>
            </div>
            {/* Live shape preview */}
            <div className="mt-3 d-flex gap-3 flex-wrap align-items-center">
              <div
                style={{
                  width: '80px', height: '80px',
                  background: form.primaryColor,
                  borderRadius: form.cardRadius,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '10px', fontWeight: 700,
                  transition: 'border-radius 0.25s ease',
                }}
              >
                Card
              </div>
              <button
                style={{
                  background: `linear-gradient(135deg, ${form.primaryColor}, ${form.primaryColor}cc)`,
                  color: '#fff', border: 'none',
                  borderRadius: form.buttonRadius,
                  padding: '10px 24px', fontWeight: 600, fontSize: '0.85rem', cursor: 'default',
                  transition: 'border-radius 0.25s ease',
                }}
              >
                Button Preview
              </button>
            </div>
          </SectionCard>

          {/* Effects */}
          <SectionCard title="Effects & Animations" icon="fas fa-magic">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-medium">Shadow Intensity</label>
                <div className="d-flex gap-2 flex-wrap">
                  {SHADOW_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('shadowIntensity', s)}
                      className={`btn btn-sm rounded-pill ${form.shadowIntensity === s ? 'text-white' : 'btn-outline-secondary'}`}
                      style={form.shadowIntensity === s ? { background: form.primaryColor, border: 'none' } : {}}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input" type="checkbox" role="switch"
                    id="animToggle" checked={form.animationsEnabled}
                    onChange={(e) => set('animationsEnabled', e.target.checked)}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="animToggle">
                    Scroll Animations & Transitions
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input" type="checkbox" role="switch"
                    id="glassToggle" checked={form.glassmorphismEnabled}
                    onChange={(e) => set('glassmorphismEnabled', e.target.checked)}
                  />
                  <label className="form-check-label small fw-medium" htmlFor="glassToggle">
                    Glassmorphism Effect on Cards
                  </label>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Layout */}
          <SectionCard title="Layout Style" icon="fas fa-layer-group">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-medium">Navbar Style</label>
                <div className="d-flex gap-2 flex-wrap">
                  {NAVBAR_STYLE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('navbarStyle', s)}
                      className={`btn btn-sm rounded-pill ${form.navbarStyle === s ? 'text-white' : 'btn-outline-secondary'}`}
                      style={form.navbarStyle === s ? { background: form.primaryColor, border: 'none' } : {}}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-medium">Footer Style</label>
                <div className="d-flex gap-2">
                  {FOOTER_STYLE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('footerStyle', s)}
                      className={`btn btn-sm rounded-pill ${form.footerStyle === s ? 'text-white' : 'btn-outline-secondary'}`}
                      style={form.footerStyle === s ? { background: form.primaryColor, border: 'none' } : {}}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Site Text */}
          <SectionCard title="Site Text & Announcement" icon="fas fa-bullhorn">
            <div className="mb-3">
              <label className="form-label small fw-medium">Site Tagline</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.siteTagline}
                onChange={(e) => set('siteTagline', e.target.value)}
                placeholder="Pakistan's Trusted Electronics Store"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Announcement Bar Text</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.announcementBarText}
                onChange={(e) => set('announcementBarText', e.target.value)}
                placeholder="🎉 Free Shipping on orders above PKR 5,000…"
              />
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input" type="checkbox" role="switch"
                id="announcementToggle" checked={form.announcementBarEnabled}
                onChange={(e) => set('announcementBarEnabled', e.target.checked)}
              />
              <label className="form-check-label small fw-medium" htmlFor="announcementToggle">
                Show Announcement Bar
              </label>
            </div>
          </SectionCard>

          {/* Homepage Sections */}
          <SectionCard title="Homepage Sections & Content" icon="fas fa-th-large">
              <p className="text-muted mb-4" style={{ fontSize: '0.82rem' }}>
                Toggle each homepage section on/off and edit its content. Changes are applied after saving.
              </p>
              {(() => {
                const hs = (form as any).homepageSections ?? {};
                const setHs = (section: string, field: string, val: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    homepageSections: {
                      ...prev.homepageSections,
                      [section]: { ...(prev.homepageSections?.[section] ?? {}), [field]: val },
                    },
                  }));
                };
                const Toggle = ({ s, label, icon }: { s: string; label: string; icon: string }) => (
                  <div className="d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`${icon} text-primary`} style={{ fontSize: '0.85rem', width: '16px' }} />
                      <span className="fw-semibold" style={{ fontSize: '0.88rem' }}>{label}</span>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" role="switch"
                        checked={hs[s]?.enabled ?? true}
                        onChange={(e) => setHs(s, 'enabled', e.target.checked)} />
                    </div>
                  </div>
                );
                const Txt = ({ s, f, label, ph }: { s: string; f: string; label: string; ph?: string }) => (
                  <div className="mb-2">
                    <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{label}</label>
                    <input type="text" className="form-control form-control-sm" value={hs[s]?.[f] ?? ''} onChange={(e) => setHs(s, f, e.target.value)} placeholder={ph} style={{ fontSize: '0.82rem' }} />
                  </div>
                );
                const ImageUpload = ({ s, f, label }: { s: string; f: string; label: string }) => {
                  const [up, setUp] = useState(false);
                  const imageUrl = hs[s]?.[f] ?? '';

                  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUp(true);
                    try {
                      const optimizedFile = await optimizeImageBeforeUpload(file);
                      const formData = new FormData();
                      formData.append('file', optimizedFile);

                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      });
                      const json = await res.json();
                      if (json.success) {
                        setHs(s, f, json.url);
                      } else {
                        alert(json.error || 'Failed to upload image.');
                      }
                    } catch (err) {
                      console.error('Upload error:', err);
                      alert('Error uploading image.');
                    } finally {
                      setUp(false);
                    }
                  };

                  return (
                    <div className="mb-2">
                      <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{label}</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUpload}
                          className="form-control form-control-sm"
                          style={{ fontSize: '0.82rem' }}
                          disabled={up}
                        />
                        {up && (
                          <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        )}
                      </div>
                      {imageUrl && (
                        <div className="mt-2 border rounded bg-white p-1" style={{ width: '80px', height: '80px', position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={imageUrl}
                            alt="preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                };
                const Num = ({ s, f, label, min, max }: { s: string; f: string; label: string; min: number; max: number }) => (
                  <div className="mb-2">
                    <label className="form-label mb-1" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{label}: <strong>{hs[s]?.[f] ?? 4}</strong> cards</label>
                    <input type="range" className="form-range" min={min} max={max} value={hs[s]?.[f] ?? 4} onChange={(e) => setHs(s, f, Number(e.target.value))} style={{ accentColor: '#2563eb' }} />
                  </div>
                );
                const sections = [
                  {
                    key: 'heroBig', label: 'Hero Banner (Large)', icon: 'fas fa-image',
                    fields: [
                      { f: 'badge', label: 'Badge', ph: 'Featured Product' },
                      { f: 'title', label: 'Heading', ph: 'Smart Speakers With Google Assistant' },
                      { f: 'subtitle', label: 'Subtitle', ph: 'Experience room-filling sound...' },
                      { f: 'buttonText', label: 'Button Text', ph: 'Shop Now' },
                      { f: 'buttonLink', label: 'Button Link', ph: '/shop' },
                      { f: 'imageUrl', label: 'Banner Image', isImage: true },
                    ],
                  },
                  {
                    key: 'heroSmall', label: 'Hero Banner (Small)', icon: 'fas fa-image',
                    fields: [
                      { f: 'badge', label: 'Badge', ph: 'Special Discount' },
                      { f: 'title', label: 'Product Name', ph: 'TWS Earbuds' },
                      { f: 'highlight', label: 'Highlight (e.g. 50% Off)', ph: '50% Off' },
                      { f: 'imageUrl', label: 'Product Image', isImage: true },
                    ],
                  },
                  {
                    key: 'offerBanner1', label: 'Left Offer Banner (Small)', icon: 'fas fa-percent',
                    fields: [
                      { f: 'subtitle', label: 'Subtitle / Badge', ph: 'Special Discount' },
                      { f: 'title', label: 'Heading', ph: 'TWS Earbuds' },
                      { f: 'discount', label: 'Discount Tag (e.g. 50% Off)', ph: '50% Off' },
                      { f: 'buttonLink', label: 'Button Link', ph: '/shop?category=headphones' },
                      { f: 'imageUrl', label: 'Banner Image', isImage: true },
                    ],
                  },
                  {
                    key: 'offerBanner2', label: 'Right Offer Banner (Small)', icon: 'fas fa-percent',
                    fields: [
                      { f: 'subtitle', label: 'Subtitle / Badge', ph: 'Find The Best Smartwatches for You!' },
                      { f: 'title', label: 'Heading', ph: 'Smart Wearables' },
                      { f: 'discount', label: 'Discount Tag (e.g. 20% Off)', ph: '20% Off' },
                      { f: 'buttonLink', label: 'Button Link', ph: '/shop?category=smartwatches' },
                      { f: 'imageUrl', label: 'Banner Image', isImage: true },
                    ],
                  },
                  {
                    key: 'weeklyDeal', label: 'Weekly Big Deal Banner', icon: 'fas fa-tags',
                    fields: [
                      { f: 'label', label: 'Label', ph: 'The Big Deal This Week' },
                      { f: 'title', label: 'Product Heading', ph: 'Apple iPhone 12 Pro Max...' },
                      { f: 'description', label: 'Description', ph: 'Get the ultimate package...' },
                      { f: 'buttonText', label: 'Button Text', ph: 'Shop Now' },
                      { f: 'buttonLink', label: 'Button Link', ph: '/shop' },
                      { f: 'imageUrl', label: 'Deal Image', isImage: true },
                    ],
                  },
                ];
                return (
                  <div className="d-flex flex-column gap-3">
                    {sections.map(sec => (
                      <div key={sec.key} className="border rounded-3 overflow-hidden">
                        <div className="px-3 pt-2 pb-1 bg-white"><Toggle s={sec.key} label={sec.label} icon={sec.icon} /></div>
                        {(hs[sec.key]?.enabled ?? true) && (
                          <div className="p-3 bg-light border-top">
                            <div className="row g-2">
                              {sec.fields.map(({ f, label, ph, isImage }) => (
                                <div key={f} className={f === 'title' || f === 'subtitle' || f === 'description' ? 'col-12' : 'col-md-6'}>
                                  {isImage ? (
                                    <ImageUpload s={sec.key} f={f} label={label} />
                                  ) : (
                                    <Txt s={sec.key} f={f} label={label} ph={ph} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Trending Products */}
                    <div className="border rounded-3 overflow-hidden">
                      <div className="px-3 pt-2 pb-1 bg-white"><Toggle s="trendingProducts" label="Trending Products Section" icon="fas fa-fire" /></div>
                      {(hs.trendingProducts?.enabled ?? true) && (
                        <div className="p-3 bg-light border-top">
                          <Txt s="trendingProducts" f="title" label="Section Title" ph="Trending Products" />
                          <Num s="trendingProducts" f="limit" label="Products to show" min={2} max={8} />
                        </div>
                      )}
                    </div>
                    {/* Collections */}
                    <div className="border rounded-3 overflow-hidden">
                      <div className="px-3 pt-2 pb-1 bg-white"><Toggle s="collections" label="Top Collections Section" icon="fas fa-th" /></div>
                      {(hs.collections?.enabled ?? true) && (
                        <div className="p-3 bg-light border-top">
                          <Txt s="collections" f="title" label="Section Title" ph="The Top Collections" />
                        </div>
                      )}
                    </div>
                    {/* More Deals */}
                    <div className="border rounded-3 overflow-hidden">
                      <div className="px-3 pt-2 pb-1 bg-white"><Toggle s="moreDeals" label="More Active Deals Section" icon="fas fa-bolt" /></div>
                      {(hs.moreDeals?.enabled ?? true) && (
                        <div className="p-3 bg-light border-top">
                          <Txt s="moreDeals" f="title" label="Section Title" ph="More Active Deals" />
                          <Num s="moreDeals" f="limit" label="Products to show" min={2} max={8} />
                        </div>
                      )}
                    </div>
                    {/* Featured Products Section */}
                    <div className="border rounded-3 overflow-hidden">
                      <div className="px-3 pt-2 pb-1 bg-white"><Toggle s="featuredSection" label="Featured Products Section" icon="fas fa-star" /></div>
                      {(hs.featuredSection?.enabled ?? true) && (
                        <div className="p-3 bg-light border-top">
                          <Txt s="featuredSection" f="title" label="Section Title" ph="Featured Products" />
                          <Num s="featuredSection" f="limit" label="Products to show" min={2} max={12} />
                        </div>
                      )}
                    </div>
                    {/* Value Props */}
                    <div className="border rounded-3 overflow-hidden">
                      <div className="px-3 pt-2 pb-1 bg-white"><Toggle s="valueProps" label="Value Propositions Strip" icon="fas fa-award" /></div>
                    </div>
                  </div>
                );
              })()}
            </SectionCard>

        </div>

        {/* ── RIGHT COLUMN — Live Preview ─────────────────── */}
        <div className="col-12 col-xl-5">
          <div style={{ position: 'sticky', top: '88px' }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
              <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-eye text-primary" />
                Live Preview
                <span className="badge bg-success rounded-pill ms-auto" style={{ fontSize: '0.68rem' }}>Real-time</span>
              </h6>
              <LivePreview theme={form} />
            </div>

            {/* Color Quick Palettes */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.88rem' }}>
                <i className="fas fa-swatchbook text-primary me-2" />
                Quick Palettes
              </h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: 'Orange (Default)', primary: '#ea580c', secondary: '#0f172a', accent: '#3b82f6' },
                  { label: 'Electric Blue', primary: '#2563eb', secondary: '#1e1b4b', accent: '#06b6d4' },
                  { label: 'Emerald Green', primary: '#059669', secondary: '#064e3b', accent: '#0891b2' },
                  { label: 'Royal Purple', primary: '#7c3aed', secondary: '#1e1b4b', accent: '#ec4899' },
                  { label: 'Hot Pink', primary: '#db2777', secondary: '#1f2937', accent: '#f59e0b' },
                  { label: 'Crimson Red', primary: '#dc2626', secondary: '#1c1917', accent: '#f97316' },
                  { label: 'Teal Modern', primary: '#0891b2', secondary: '#0c4a6e', accent: '#06d6a0' },
                ].map((pal) => (
                  <button
                    key={pal.label}
                    type="button"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      primaryColor: pal.primary,
                      secondaryColor: pal.secondary,
                      accentColor: pal.accent,
                    }))}
                    className="btn btn-sm d-flex align-items-center gap-3 text-start border rounded-3 px-3 py-2"
                    style={{ fontWeight: 500, fontSize: '0.82rem' }}
                  >
                    <div className="d-flex gap-1">
                      {[pal.primary, pal.secondary, pal.accent].map((c, i) => (
                        <div key={i} style={{ width: '16px', height: '16px', background: c, borderRadius: '50%' }} />
                      ))}
                    </div>
                    {pal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
