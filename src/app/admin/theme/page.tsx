'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DEFAULT_THEME, DEFAULT_SVG_LOGO, IconLibrary, SiteTheme, SvgLogoSettings } from '../../../components/common/DynamicThemeProvider';
import { optimizeImageBeforeUpload } from '../../../utils/imageOptimizer';
import { PakODriveLogo } from '../../../components/common/PakODriveLogo';

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

const LOGO_PRESETS = [
  {
    name: '⚡ Cyber Cyan & Neon Orange (Default)',
    primaryColor: '#00A8E8',
    secondaryColor: '#0066CC',
    accentColor: '#FF7A00',
  },
  {
    name: '🏎️ Flame Red & Pitch Black',
    primaryColor: '#EF4444',
    secondaryColor: '#991B1B',
    accentColor: '#F97316',
  },
  {
    name: '👑 Royal Gold & Deep Navy',
    primaryColor: '#D4AF37',
    secondaryColor: '#0F172A',
    accentColor: '#F59E0B',
  },
  {
    name: '🌿 Emerald Green & Lime Glow',
    primaryColor: '#10B981',
    secondaryColor: '#065F46',
    accentColor: '#84CC16',
  },
  {
    name: '💎 Electric Violet & Hot Pink',
    primaryColor: '#A855F7',
    secondaryColor: '#6B21A8',
    accentColor: '#EC4899',
  },
  {
    name: '⚪ Minimalist Clean Monochrome',
    primaryColor: '#F8FAFC',
    secondaryColor: '#94A3B8',
    accentColor: '#38BDF8',
  },
];

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
    <div className="d-flex align-items-center justify-content-between py-2 border-bottom flex-wrap gap-2">
      <label className="fw-medium text-dark mb-0" style={{ fontSize: '0.85rem' }}>{label}</label>
      <div className="d-flex align-items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-control form-control-color flex-shrink-0"
          style={{ width: '40px', height: '34px', padding: '2px', cursor: 'pointer', borderRadius: '8px' }}
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-control form-control-sm"
          style={{ width: '85px', fontFamily: 'monospace', fontSize: '0.8rem' }}
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
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden w-100">
      <div className="card-body p-3 p-md-4">
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
        {theme.svgLogo?.enabled !== false ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PakODriveLogo
              primaryColor={theme.svgLogo?.primaryColor}
              secondaryColor={theme.svgLogo?.secondaryColor}
              accentColor={theme.svgLogo?.accentColor}
              text1={theme.svgLogo?.text1}
              text2={theme.svgLogo?.text2}
              fontFamily={theme.svgLogo?.fontFamily}
              fontWeight={theme.svgLogo?.fontWeight}
              letterSpacing={theme.svgLogo?.letterSpacing}
              fontSize={theme.svgLogo?.fontSize}
              fontStyle={theme.svgLogo?.fontStyle}
              showIcon={theme.svgLogo?.showIcon}
              showText={theme.svgLogo?.showText}
              height={Math.min(theme.svgLogo?.height || 26, 28)}
            />
          </div>
        ) : (
          <span
            style={{
              color: logoColor,
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            🛒 PAKODRIVE
          </span>
        )}
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
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  /* Load settings and products on mount */
  useEffect(() => {
    (async () => {
      try {
        const [themeRes, prodRes] = await Promise.all([
          fetch('/api/site-settings'),
          fetch('/api/products?limit=150'),
        ]);
        const json = await themeRes.json();
        if (json.success && json.data) {
          setForm({ ...DEFAULT_THEME, ...json.data });
        }
        const prodJson = await prodRes.json();
        if (prodJson.success && Array.isArray(prodJson.data)) {
          setAvailableProducts(prodJson.data);
        }
      } catch {
        /* use defaults */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addHeroSlide = () => {
    setForm((prev) => {
      const currentSlides = prev.homepageSections?.heroSlides || [];
      const newSlide = {
        enabled: true,
        productId: '',
        badge: '🔥 HOT DEAL',
        title: 'New Featured Product',
        subtitle: 'Experience top-tier quality at unbeatable prices.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        imageType: 'product' as const,
        imageUrl: '/img/product-1.png',
        bgGradient: '',
      };
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: [...currentSlides, newSlide],
        },
      };
    });
  };

  const updateHeroSlide = (idx: number, field: string, value: any) => {
    setForm((prev) => {
      const currentSlides = [...(prev.homepageSections?.heroSlides || [])];
      if (!currentSlides[idx]) return prev;
      currentSlides[idx] = { ...currentSlides[idx], [field]: value };
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  };

  const selectProductForHeroSlide = (idx: number, productId: string) => {
    const product = availableProducts.find((p) => String(p._id) === String(productId));
    setForm((prev) => {
      const currentSlides = [...(prev.homepageSections?.heroSlides || [])];
      if (!currentSlides[idx]) return prev;
      if (!product) {
        currentSlides[idx] = {
          ...currentSlides[idx],
          productId: '',
        };
      } else {
        currentSlides[idx] = {
          ...currentSlides[idx],
          productId: String(product._id),
          title: product.name,
          buttonLink: `/product/${product._id}`,
          badge: product.heroText || '🔥 THE BIG DEAL THIS WEEK',
          subtitle: product.description ? (product.description.length > 110 ? product.description.slice(0, 110) + '...' : product.description) : '',
          imageType: 'product',
          imageUrl: product.image || '',
        };
      }
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  };

  const deleteHeroSlide = (idx: number) => {
    setForm((prev) => {
      const currentSlides = (prev.homepageSections?.heroSlides || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  };

  const moveHeroSlide = (idx: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const currentSlides = [...(prev.homepageSections?.heroSlides || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= currentSlides.length) return prev;
      const temp = currentSlides[idx];
      currentSlides[idx] = currentSlides[targetIdx];
      currentSlides[targetIdx] = temp;
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  };

  const set = useCallback(<K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const setSvgLogo = useCallback(<K extends keyof SvgLogoSettings>(key: K, val: SvgLogoSettings[K]) => {
    setForm((prev) => ({
      ...prev,
      svgLogo: {
        ...(prev.svgLogo || DEFAULT_SVG_LOGO),
        [key]: val,
      },
    }));
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
        <div className="d-flex gap-2 w-100 w-sm-auto flex-wrap">
          <button onClick={handleReset} className="btn btn-outline-secondary btn-sm rounded-pill px-3 px-sm-4 flex-fill flex-sm-grow-0" style={{ fontWeight: 500 }}>
            <i className="fas fa-undo me-1" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
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

          {/* ⚡ Dynamic Vector SVG Logo Studio */}
          <SectionCard title="⚡ SVG Vector Logo Studio (Dynamic Colors, Fonts & Style)" icon="fas fa-bolt">
            <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
              Customize your storefront&apos;s dynamic Pak-o-Drive vector SVG logo in real time. Adjust bolt gradients, speed swooshes, typography fonts, letter spacing, and sizing.
            </p>

            {/* Live Interactive Logo Canvas Preview */}
            <div className="mb-4 p-3 rounded-4" style={{ background: '#090d16', border: '1.5px solid #1e293b' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: '0.72rem' }}>
                  <i className="fas fa-eye me-1" /> Live Studio Vector Canvas
                </span>
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Height: {form.svgLogo?.height || 38}px | Spacing: {form.svgLogo?.letterSpacing || 5}px
                </span>
              </div>
              <div className="p-3 text-center rounded-3 d-flex align-items-center justify-content-center" style={{ minHeight: '85px', background: 'radial-gradient(ellipse at center, #1e293b 0%, #0b0f19 100%)' }}>
                <PakODriveLogo
                  primaryColor={form.svgLogo?.primaryColor}
                  secondaryColor={form.svgLogo?.secondaryColor}
                  accentColor={form.svgLogo?.accentColor}
                  text1={form.svgLogo?.text1}
                  text2={form.svgLogo?.text2}
                  fontFamily={form.svgLogo?.fontFamily}
                  fontWeight={form.svgLogo?.fontWeight}
                  letterSpacing={form.svgLogo?.letterSpacing}
                  fontSize={form.svgLogo?.fontSize}
                  fontStyle={form.svgLogo?.fontStyle}
                  showIcon={form.svgLogo?.showIcon}
                  showText={form.svgLogo?.showText}
                  height={Math.max(form.svgLogo?.height || 38, 38)}
                />
              </div>
            </div>

            {/* Enable / Disable Dynamic SVG Logo */}
            <div className="form-check form-switch mb-3 p-2 bg-light rounded-3 d-flex align-items-center justify-content-between">
              <label className="form-check-label fw-bold text-dark mb-0 ms-2" htmlFor="svgLogoEnabled" style={{ fontSize: '0.85rem' }}>
                Enable Dynamic Vector SVG Logo on Website
              </label>
              <input
                type="checkbox"
                id="svgLogoEnabled"
                className="form-check-input ms-0"
                role="switch"
                checked={form.svgLogo?.enabled ?? true}
                onChange={(e) => setSvgLogo('enabled', e.target.checked)}
                style={{ width: '2.5em', height: '1.3em', cursor: 'pointer' }}
              />
            </div>

            {/* Quick Color Presets */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
                ⚡ Quick 1-Click Logo Color Palettes:
              </label>
              <div className="d-flex flex-wrap gap-2">
                {LOGO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setSvgLogo('primaryColor', preset.primaryColor);
                      setSvgLogo('secondaryColor', preset.secondaryColor);
                      setSvgLogo('accentColor', preset.accentColor);
                    }}
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 rounded-pill px-2.5 py-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${preset.accentColor} 100%)`,
                        display: 'inline-block',
                      }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Inputs */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-medium mb-1">Word 1 (Top Text / Bolt)</label>
                <input
                  type="text"
                  className="form-control form-control-sm fw-bold"
                  value={form.svgLogo?.text1 ?? 'PAKO'}
                  onChange={(e) => setSvgLogo('text1', e.target.value)}
                  placeholder="e.g. PAKO"
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-medium mb-1">Word 2 (Bottom Text / Drive)</label>
                <input
                  type="text"
                  className="form-control form-control-sm fw-bold"
                  value={form.svgLogo?.text2 ?? 'DRIVE'}
                  onChange={(e) => setSvgLogo('text2', e.target.value)}
                  placeholder="e.g. DRIVE"
                />
              </div>
            </div>

            {/* SVG Logo Colors */}
            <div className="border rounded-3 p-3 mb-3 bg-light-subtle">
              <h6 className="fw-bold small mb-2 text-dark">Logo Vector Colors</h6>
              
              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span className="small fw-medium text-dark">Primary (Bolt Glow, Word 1 & Top Wave)</span>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    value={form.svgLogo?.primaryColor || '#00A8E8'}
                    onChange={(e) => setSvgLogo('primaryColor', e.target.value)}
                    className="form-control form-control-color"
                    style={{ width: '38px', height: '32px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={form.svgLogo?.primaryColor || '#00A8E8'}
                    onChange={(e) => setSvgLogo('primaryColor', e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: '90px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span className="small fw-medium text-dark">Secondary Depth (3D Bolt Base & Dark Arc)</span>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    value={form.svgLogo?.secondaryColor || '#0066CC'}
                    onChange={(e) => setSvgLogo('secondaryColor', e.target.value)}
                    className="form-control form-control-color"
                    style={{ width: '38px', height: '32px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={form.svgLogo?.secondaryColor || '#0066CC'}
                    onChange={(e) => setSvgLogo('secondaryColor', e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: '90px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-2">
                <span className="small fw-medium text-dark">Accent (Speed Swoosh, Arrow, Word 2 & Tail)</span>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    value={form.svgLogo?.accentColor || '#FF7A00'}
                    onChange={(e) => setSvgLogo('accentColor', e.target.value)}
                    className="form-control form-control-color"
                    style={{ width: '38px', height: '32px', padding: '2px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={form.svgLogo?.accentColor || '#FF7A00'}
                    onChange={(e) => setSvgLogo('accentColor', e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: '90px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Typography & Font Styling */}
            <div className="border rounded-3 p-3 mb-3 bg-light-subtle">
              <h6 className="fw-bold small mb-3 text-dark">Typography & Font Styling</h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium mb-1">Logo Font Family</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.svgLogo?.fontFamily || 'Montserrat'}
                    onChange={(e) => setSvgLogo('fontFamily', e.target.value)}
                    style={{ fontFamily: `'${form.svgLogo?.fontFamily || 'Montserrat'}', sans-serif` }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small fw-medium mb-1">Font Weight</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.svgLogo?.fontWeight || '900'}
                    onChange={(e) => setSvgLogo('fontWeight', e.target.value)}
                  >
                    <option value="900">900 (Black)</option>
                    <option value="800">800 (Extra Bold)</option>
                    <option value="700">700 (Bold)</option>
                    <option value="600">600 (Semi Bold)</option>
                    <option value="500">500 (Medium)</option>
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small fw-medium mb-1">Font Style</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.svgLogo?.fontStyle || 'normal'}
                    onChange={(e) => setSvgLogo('fontStyle', e.target.value as 'normal' | 'italic')}
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-medium mb-0">Letter Spacing: {form.svgLogo?.letterSpacing ?? 5}px</label>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min={0}
                    max={15}
                    step={1}
                    value={form.svgLogo?.letterSpacing ?? 5}
                    onChange={(e) => setSvgLogo('letterSpacing', Number(e.target.value))}
                    style={{ accentColor: 'var(--pd-primary, #ea580c)' }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-medium mb-0">SVG Font Size: {form.svgLogo?.fontSize ?? 105}px</label>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min={70}
                    max={135}
                    step={5}
                    value={form.svgLogo?.fontSize ?? 105}
                    onChange={(e) => setSvgLogo('fontSize', Number(e.target.value))}
                    style={{ accentColor: 'var(--pd-primary, #ea580c)' }}
                  />
                </div>
              </div>
            </div>

            {/* Elements & Sizing */}
            <div className="border rounded-3 p-3 bg-light-subtle">
              <h6 className="fw-bold small mb-2 text-dark">Display Elements & Header Scale</h6>
              <div className="row g-3">
                <div className="col-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showLogoIcon"
                      checked={form.svgLogo?.showIcon ?? true}
                      onChange={(e) => setSvgLogo('showIcon', e.target.checked)}
                    />
                    <label className="form-check-label small fw-medium text-dark" htmlFor="showLogoIcon">
                      Show Bolt & Speed Swoosh Icon
                    </label>
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showLogoText"
                      checked={form.svgLogo?.showText ?? true}
                      onChange={(e) => setSvgLogo('showText', e.target.checked)}
                    />
                    <label className="form-check-label small fw-medium text-dark" htmlFor="showLogoText">
                      Show Logo Typography Text
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-medium mb-0">
                      Header Logo Height: {form.svgLogo?.height ?? 38}px
                    </label>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min={24}
                    max={55}
                    step={1}
                    value={form.svgLogo?.height ?? 38}
                    onChange={(e) => setSvgLogo('height', Number(e.target.value))}
                    style={{ accentColor: 'var(--pd-primary, #ea580c)' }}
                  />
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
                const heroSlidesList = hs.heroSlides || [];

                return (
                  <div className="d-flex flex-column gap-3">
                    {/* 🎡 Multiple Hero Carousel Slides Manager */}
                    <div className="card border-primary border-opacity-25 shadow-sm rounded-4 overflow-hidden mb-2">
                      <div className="card-header bg-primary bg-opacity-10 py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <h6 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
                            <i className="fas fa-layer-group" />
                            Hero Carousel Slides ({heroSlidesList.length} Slides)
                          </h6>
                          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                            Add multiple slides to cycle on the homepage Hero section. Link directly to any product to auto-sync title, badge & product image!
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addHeroSlide}
                          className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-sm"
                        >
                          <i className="fas fa-plus" /> Add New Slide
                        </button>
                      </div>

                      <div className="card-body p-4 bg-white">
                        {heroSlidesList.length === 0 ? (
                          <div className="text-center py-4 px-3 border border-dashed rounded-3 bg-light">
                            <i className="fas fa-images text-muted mb-2" style={{ fontSize: '2rem' }} />
                            <h6 className="fw-bold text-secondary mb-1">No Custom Hero Slides Yet</h6>
                            <p className="text-muted small mb-3">
                              Currently using the fallback banners. Click below to add multiple dynamic product slides!
                            </p>
                            <button
                              type="button"
                              onClick={addHeroSlide}
                              className="btn btn-outline-primary btn-sm rounded-pill px-4"
                            >
                              <i className="fas fa-plus me-1" /> Create First Hero Slide
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {heroSlidesList.map((slide: any, idx: number) => {
                              const linkedProd = slide.productId
                                ? availableProducts.find((p) => String(p._id) === String(slide.productId))
                                : null;
                              const isProductImg = slide.imageType !== 'custom';
                              const displayImg = isProductImg
                                ? (linkedProd?.image || slide.imageUrl || '/img/product-1.png')
                                : (slide.imageUrl || '/img/product-1.png');

                              return (
                                <div
                                  key={idx}
                                  className={`border rounded-3 overflow-hidden shadow-xs w-100 ${
                                    slide.enabled !== false ? 'border-secondary-subtle' : 'border-danger-subtle opacity-75'
                                  }`}
                                >
                                  {/* Slide Header Bar */}
                                  <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                                      <span className="badge bg-secondary rounded-pill px-2 py-1 flex-shrink-0" style={{ fontSize: '0.72rem' }}>
                                        Slide #{idx + 1}
                                      </span>
                                      <span className="fw-bold text-dark small text-truncate">
                                        {slide.title || (linkedProd?.name ? linkedProd.name : 'Untitled Slide')}
                                      </span>
                                      {linkedProd && (
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 text-truncate d-none d-sm-inline-block" style={{ fontSize: '0.7rem', maxWidth: '130px' }}>
                                          <i className="fas fa-box me-1" /> {linkedProd.name}
                                        </span>
                                      )}
                                    </div>

                                    <div className="d-flex align-items-center gap-1.5 flex-shrink-0 ms-auto">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => moveHeroSlide(idx, 'up')}
                                        className="btn btn-light btn-sm border py-1 px-2 text-muted"
                                        title="Move Up"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        <i className="fas fa-arrow-up" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === heroSlidesList.length - 1}
                                        onClick={() => moveHeroSlide(idx, 'down')}
                                        className="btn btn-light btn-sm border py-1 px-2 text-muted"
                                        title="Move Down"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        <i className="fas fa-arrow-down" />
                                      </button>

                                      <div className="form-check form-switch mb-0 ms-1 d-flex align-items-center">
                                        <input
                                          className="form-check-input my-0"
                                          type="checkbox"
                                          role="switch"
                                          checked={slide.enabled !== false}
                                          onChange={(e) => updateHeroSlide(idx, 'enabled', e.target.checked)}
                                          title="Enable/Disable Slide"
                                        />
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => deleteHeroSlide(idx)}
                                        className="btn btn-outline-danger btn-sm py-1 px-2 ms-1"
                                        title="Delete Slide"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        <i className="fas fa-trash-alt" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Slide Form Body */}
                                  <div className="p-3 bg-white">
                                    <div className="row g-3">
                                      {/* Product Link Dropdown */}
                                      <div className="col-12">
                                        <label className="form-label mb-1 text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                                          <i className="fas fa-link me-1" /> Select Product to Feature (Auto-fills Title, Badge & Image)
                                        </label>
                                        <select
                                          className="form-select form-select-sm rounded-3 w-100"
                                          value={slide.productId || ''}
                                          onChange={(e) => selectProductForHeroSlide(idx, e.target.value)}
                                          style={{ fontSize: '0.84rem' }}
                                        >
                                          <option value="">-- Custom Banner (No Product Linked) --</option>
                                          {availableProducts.map((p: any) => (
                                            <option key={p._id} value={p._id}>
                                              📦 {p.name} — PKR {p.price?.toLocaleString()} {p.heroText ? `[Badge: "${p.heroText}"]` : ''}
                                            </option>
                                          ))}
                                        </select>
                                        <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                                          Selecting a product will automatically link to its detail page and load its headline, hero badge & image.
                                        </div>
                                      </div>

                                      {/* Image Selection Mode */}
                                      <div className="col-12 col-md-6">
                                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>
                                          Slide Image Option
                                        </label>
                                        <div className="d-flex flex-wrap gap-2 mb-2 w-100">
                                          <button
                                            type="button"
                                            onClick={() => updateHeroSlide(idx, 'imageType', 'product')}
                                            className={`btn btn-sm rounded-3 flex-fill ${
                                              isProductImg ? 'btn-primary' : 'btn-outline-secondary'
                                            }`}
                                            style={{ fontSize: '0.78rem', minWidth: '120px' }}
                                          >
                                            <i className="fas fa-box me-1" /> Product Image
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => updateHeroSlide(idx, 'imageType', 'custom')}
                                            className={`btn btn-sm rounded-3 flex-fill ${
                                              !isProductImg ? 'btn-primary' : 'btn-outline-secondary'
                                            }`}
                                            style={{ fontSize: '0.78rem', minWidth: '120px' }}
                                          >
                                            <i className="fas fa-upload me-1" /> Custom Banner
                                          </button>
                                        </div>

                                        {!isProductImg ? (
                                          <div>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="form-control form-control-sm w-100"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                  const opt = await optimizeImageBeforeUpload(file);
                                                  const fd = new FormData();
                                                  fd.append('file', opt);
                                                  const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                  const j = await res.json();
                                                  if (j.success) {
                                                    updateHeroSlide(idx, 'imageUrl', j.url);
                                                  }
                                                } catch (err) {
                                                  console.error(err);
                                                }
                                              }}
                                              style={{ fontSize: '0.8rem' }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                            {linkedProd ? 'Using product primary image.' : 'Select a product above or switch to Custom Banner.'}
                                          </div>
                                        )}
                                      </div>

                                      {/* Image Preview Box */}
                                      <div className="col-12 col-md-6 d-flex align-items-center">
                                        <div className="d-flex align-items-center gap-3 w-100 bg-light p-2 rounded-3 border overflow-hidden">
                                          <div
                                            className="border rounded bg-white p-1 position-relative flex-shrink-0"
                                            style={{ width: '56px', height: '56px' }}
                                          >
                                            <img
                                              src={displayImg}
                                              alt="Slide preview"
                                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                          </div>
                                          <div className="small text-truncate min-w-0 flex-grow-1" style={{ fontSize: '0.75rem' }}>
                                            <div className="fw-semibold text-dark text-truncate">
                                              {isProductImg ? (linkedProd?.name || 'Default Asset') : 'Custom Banner Asset'}
                                            </div>
                                            <div className="text-muted text-truncate">{displayImg}</div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Badge / Tagline */}
                                      <div className="col-md-6">
                                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                                          Hero Badge / Deal Tagline
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={slide.badge || ''}
                                          onChange={(e) => updateHeroSlide(idx, 'badge', e.target.value)}
                                          placeholder="e.g. 🔥 THE BIG DEAL THIS WEEK"
                                          style={{ fontSize: '0.82rem' }}
                                        />
                                      </div>

                                      {/* Button Text */}
                                      <div className="col-md-6">
                                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                                          Button Text
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={slide.buttonText || ''}
                                          onChange={(e) => updateHeroSlide(idx, 'buttonText', e.target.value)}
                                          placeholder="e.g. Shop Now, Claim Deal"
                                          style={{ fontSize: '0.82rem' }}
                                        />
                                      </div>

                                      {/* Main Heading / Title */}
                                      <div className="col-12">
                                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                                          Main Heading / Title
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={slide.title || ''}
                                          onChange={(e) => updateHeroSlide(idx, 'title', e.target.value)}
                                          placeholder="e.g. Apple iPhone 12 Pro Max 128GB Blue Edition"
                                          style={{ fontSize: '0.82rem' }}
                                        />
                                      </div>

                                      {/* Subtitle / Description */}
                                      <div className="col-12">
                                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                                          Subtitle / Description
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={slide.subtitle || ''}
                                          onChange={(e) => updateHeroSlide(idx, 'subtitle', e.target.value)}
                                          placeholder="e.g. Experience unmatched sound and high performance."
                                          style={{ fontSize: '0.82rem' }}
                                        />
                                      </div>

                                      {/* Button Link */}
                                      <div className="col-12">
                                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                                          Button Link / Redirect URL
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={slide.buttonLink || ''}
                                          onChange={(e) => updateHeroSlide(idx, 'buttonLink', e.target.value)}
                                          placeholder="e.g. /product/123 or /shop"
                                          style={{ fontSize: '0.82rem' }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Other Homepage Sections */}
                    <div className="d-flex align-items-center justify-content-between pt-2 pb-1">
                      <h6 className="fw-bold text-secondary mb-0" style={{ fontSize: '0.88rem' }}>
                        <i className="fas fa-th-large me-2 text-primary" />
                        Other Homepage Banners & Sections
                      </h6>
                    </div>

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
