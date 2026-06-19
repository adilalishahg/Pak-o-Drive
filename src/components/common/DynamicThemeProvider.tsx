'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────────────── */
export type IconLibrary = 'fontawesome' | 'material' | 'bootstrap' | 'remix' | 'phosphor';

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  fontFamily: string;
  fontSizeBase: string;
  borderRadius: string;
  buttonRadius: string;
  cardRadius: string;
  animationsEnabled: boolean;
  glassmorphismEnabled: boolean;
  shadowIntensity: 'none' | 'light' | 'medium' | 'strong';
  navbarStyle: 'dark' | 'light' | 'gradient';
  footerStyle: 'dark' | 'light';
  heroGradientStart: string;
  heroGradientEnd: string;
  iconLibrary: IconLibrary;
  siteTagline: string;
  announcementBarText: string;
  announcementBarEnabled: boolean;
}

export const DEFAULT_THEME: SiteTheme = {
  primaryColor: '#ea580c',
  secondaryColor: '#0f172a',
  accentColor: '#3b82f6',
  successColor: '#10b981',
  fontFamily: 'Inter',
  fontSizeBase: '16px',
  borderRadius: '16px',
  buttonRadius: '50px',
  cardRadius: '16px',
  animationsEnabled: true,
  glassmorphismEnabled: true,
  shadowIntensity: 'medium',
  navbarStyle: 'dark',
  footerStyle: 'dark',
  heroGradientStart: '#fff7ed',
  heroGradientEnd: '#ffffff',
  iconLibrary: 'fontawesome',
  siteTagline: "Pakistan's Trusted Electronics Store",
  announcementBarText: '🎉 Free Shipping on orders above PKR 5,000 | 📦 30-Day Easy Returns | Shop Now →',
  announcementBarEnabled: true,
};

/* ─── Helpers ─────────────────────────────────────────────────── */
/** Converts a hex color to "R, G, B" format for rgba() usage */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

/** Shadow presets keyed by intensity */
const SHADOW_MAP: Record<SiteTheme['shadowIntensity'], string> = {
  none:   '0 0 0 rgba(0,0,0,0)',
  light:  '0 4px 12px rgba(15,23,42,0.06)',
  medium: '0 10px 30px rgba(15,23,42,0.1)',
  strong: '0 20px 50px rgba(15,23,42,0.18)',
};

const SHADOW_HOVER_MAP: Record<SiteTheme['shadowIntensity'], string> = {
  none:   '0 0 0 rgba(0,0,0,0)',
  light:  '0 8px 20px rgba(234,88,12,0.10)',
  medium: '0 20px 40px rgba(234,88,12,0.14)',
  strong: '0 30px 60px rgba(234,88,12,0.22)',
};

/** Generates CSS custom properties and styles from the theme settings */
export function generateThemeCss(theme: SiteTheme): string {
  const primaryRgb = hexToRgb(theme.primaryColor);
  const accentRgb  = hexToRgb(theme.accentColor);

  return `
:root {
  --pd-primary: ${theme.primaryColor};
  --pd-primary-dark: color-mix(in srgb, ${theme.primaryColor} 80%, #000);
  --pd-primary-rgb: ${primaryRgb};
  --pd-secondary: ${theme.secondaryColor};
  --pd-accent: ${theme.accentColor};
  --pd-accent-rgb: ${accentRgb};
  --pd-success: ${theme.successColor};
  --pd-light-bg: #f8fafc;
  --pd-font: '${theme.fontFamily}', system-ui, -apple-system, sans-serif;
  --pd-font-size-base: ${theme.fontSizeBase};
  --pd-radius: ${theme.borderRadius};
  --pd-btn-radius: ${theme.buttonRadius};
  --pd-card-radius: ${theme.cardRadius};
  --pd-card-shadow: ${SHADOW_MAP[theme.shadowIntensity]};
  --pd-card-shadow-hover: ${SHADOW_HOVER_MAP[theme.shadowIntensity]};
  --pd-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --pd-hero-grad-start: ${theme.heroGradientStart};
  --pd-hero-grad-end: ${theme.heroGradientEnd};

  /* Bootstrap overrides */
  --bs-primary: ${theme.primaryColor};
  --bs-primary-rgb: ${primaryRgb};
  --bs-success: ${theme.successColor};
  --bs-dark: ${theme.secondaryColor};

  /* Glassmorphism */
  --pd-glass-bg: ${theme.glassmorphismEnabled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,1)'};
  --pd-glass-blur: ${theme.glassmorphismEnabled ? 'blur(12px)' : 'none'};
  --pd-glass-border: ${theme.glassmorphismEnabled ? '1px solid rgba(255,255,255,0.4)' : '1px solid #e2e8f0'};
}

/* ── Animations toggle ─────────────────────────────────── */
${theme.animationsEnabled ? '' : `
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
`}

/* ── Typography ────────────────────────────────────────── */
body, button, input, select, textarea,
.btn, .nav-link {
  font-family: var(--pd-font) !important;
}
html { font-size: var(--pd-font-size-base); }

/* ── Dynamic button gradients ──────────────────────────── */
.btn-gradient {
  background: linear-gradient(135deg, ${theme.primaryColor} 0%,
    color-mix(in srgb, ${theme.primaryColor} 75%, #000) 100%) !important;
  border-radius: var(--pd-btn-radius) !important;
  box-shadow: 0 4px 14px rgba(${primaryRgb}, 0.35) !important;
}
.btn-gradient:hover {
  background: linear-gradient(135deg,
    color-mix(in srgb, ${theme.primaryColor} 85%, #000) 0%,
    color-mix(in srgb, ${theme.primaryColor} 60%, #000) 100%) !important;
  box-shadow: 0 6px 20px rgba(${primaryRgb}, 0.5) !important;
}
.btn-gradient:active {
  transform: translateY(1px) !important;
}

/* ── Tab active button ─────────────────────────────────── */
.tab-btn.active {
  background: linear-gradient(135deg, ${theme.primaryColor},
    color-mix(in srgb, ${theme.primaryColor} 80%, #000)) !important;
  box-shadow: 0 4px 14px rgba(${primaryRgb}, 0.3) !important;
}
.tab-btn:not(.active):hover {
  color: ${theme.primaryColor} !important;
}

/* ── Card radius ───────────────────────────────────────── */
.card, .product-item, .offer-card, .glass-card {
  border-radius: var(--pd-card-radius) !important;
}

/* ── Scrollbar primary color ───────────────────────────── */
::-webkit-scrollbar-thumb { background: ${theme.primaryColor}; }
::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, ${theme.primaryColor} 80%, #000);
}

/* ── Selection highlight ───────────────────────────────── */
::selection { background: ${theme.primaryColor}; color: #fff; }

/* ── Focus ring ────────────────────────────────────────── */
:focus-visible { outline-color: ${theme.primaryColor}; }

/* ── Glassmorphism card ────────────────────────────────── */
.glass-card {
  background: var(--pd-glass-bg);
  backdrop-filter: var(--pd-glass-blur);
  -webkit-backdrop-filter: var(--pd-glass-blur);
  border: var(--pd-glass-border);
  box-shadow: var(--pd-card-shadow);
}

/* ── Navbar dark/light/gradient ─────────────────────────── */
${theme.navbarStyle === 'dark' ? `
.nav-bar .bg-primary, nav.bg-primary {
  background: linear-gradient(135deg, ${theme.secondaryColor} 0%,
    color-mix(in srgb, ${theme.secondaryColor} 70%, #fff) 100%) !important;
}` : ''}
${theme.navbarStyle === 'light' ? `
.nav-bar .bg-primary, nav.bg-primary {
  background: #ffffff !important;
  box-shadow: 0 2px 20px rgba(0,0,0,0.08) !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
.nav-bar .navbar-nav .nav-link { color: ${theme.secondaryColor} !important; }
.nav-bar .navbar-nav .nav-link:hover { color: ${theme.primaryColor} !important; }
` : ''}
${theme.navbarStyle === 'gradient' ? `
.nav-bar .bg-primary, nav.bg-primary {
  background: linear-gradient(135deg, ${theme.primaryColor} 0%,
    color-mix(in srgb, ${theme.primaryColor} 60%, ${theme.secondaryColor}) 100%) !important;
}` : ''}

/* ── Footer dark/light ──────────────────────────────────── */
${theme.footerStyle === 'light' ? `
footer, .footer {
  background: #f8fafc !important;
  color: #475569 !important;
  border-top: 1px solid #e2e8f0 !important;
}
footer h5, footer h4, .footer h4, .footer h5 { color: ${theme.secondaryColor} !important; }
footer a, .footer a { color: #64748b !important; }
footer a:hover, .footer a:hover { color: ${theme.primaryColor} !important; }
.copyright { background: #e2e8f0 !important; border-top: 1px solid #cbd5e1 !important; }
` : `
footer, .footer {
  background: ${theme.secondaryColor} !important;
}
.copyright {
  background: color-mix(in srgb, ${theme.secondaryColor} 80%, #000) !important;
}
`}

/* ── Accent color links ─────────────────────────────────── */
a.text-primary, .text-primary { color: ${theme.primaryColor} !important; }
.bg-primary { background-color: ${theme.primaryColor} !important; }
.border-primary { border-color: ${theme.primaryColor} !important; }

/* ── Category sidebar highlight ──────────────────────────── */
.categories-item button.text-primary { color: ${theme.primaryColor} !important; }
.categories-item:hover i { color: ${theme.primaryColor} !important; }

/* ── Hero gradient ──────────────────────────────────────── */
.hero-gradient-overlay {
  background: linear-gradient(135deg,
    ${theme.heroGradientStart} 0%,
    color-mix(in srgb, ${theme.heroGradientStart} 80%, transparent) 60%,
    transparent 100%) !important;
}

/* ── Badge premium gradient ──────────────────────────────── */
.badge-premium {
  background: linear-gradient(135deg, ${theme.primaryColor}, 
    color-mix(in srgb, ${theme.primaryColor} 80%, #000)) !important;
}

/* ── Section title accent bar ─────────────────────────────── */
.section-title::after {
  background: linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor}) !important;
}

/* ── Announcement bar ─────────────────────────────────────── */
.announcement-bar {
  background: linear-gradient(90deg, 
    color-mix(in srgb, ${theme.secondaryColor} 90%, #fff) 0%, 
    ${theme.secondaryColor} 50%, 
    color-mix(in srgb, ${theme.secondaryColor} 90%, #fff) 100%) !important;
}

/* ── Product item hover ───────────────────────────────────── */
.product-item:hover {
  border-color: color-mix(in srgb, ${theme.primaryColor} 30%, #fff) !important;
  box-shadow: var(--pd-card-shadow-hover) !important;
}

/* ── Stats counter color ─────────────────────────────────── */
.counter-number { color: ${theme.primaryColor} !important; }

/* ── Back-to-top button ───────────────────────────────────── */
.back-to-top {
  background: linear-gradient(135deg, ${theme.primaryColor},
    color-mix(in srgb, ${theme.primaryColor} 80%, #000)) !important;
  box-shadow: 0 4px 16px rgba(${primaryRgb}, 0.4) !important;
}
.back-to-top:hover {
  box-shadow: 0 8px 24px rgba(${primaryRgb}, 0.55) !important;
}
  `.trim();
}

const ICON_CDNS: Record<IconLibrary, string> = {
  fontawesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  material: 'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
  bootstrap: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  remix: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css',
  phosphor: 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css',
};

/* ─── Context ────────────────────────────────────────────────── */
interface ThemeContextValue {
  theme: SiteTheme;
  loading: boolean;
  refresh: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  loading: true,
  refresh: () => {},
});

export function useSiteTheme() {
  return useContext(ThemeContext);
}

/* ─── Provider ───────────────────────────────────────────────── */
interface ProviderProps {
  children: React.ReactNode;
  initialTheme?: any;
}

export function DynamicThemeProvider({ children, initialTheme }: ProviderProps) {
  const [theme, setTheme] = useState<SiteTheme>(() => {
    if (initialTheme) {
      return { ...DEFAULT_THEME, ...initialTheme };
    }
    return DEFAULT_THEME;
  });
  const [loading, setLoading] = useState(initialTheme ? false : true);

  const fetchAndApply = useCallback(async () => {
    try {
      const res = await fetch('/api/site-settings', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        const t: SiteTheme = { ...DEFAULT_THEME, ...json.data };
        setTheme(t);
      }
    } catch (err) {
      console.error('Failed to load site theme:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Re-fetch client side to ensure dynamic changes are captured
    fetchAndApply();
  }, [fetchAndApply]);

  const css = generateThemeCss(theme);
  const fontName = theme.fontFamily.replace(/ /g, '+');
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800&display=swap`;
  const wantedLib = theme.iconLibrary ?? 'fontawesome';
  const iconUrl = ICON_CDNS[wantedLib];

  return (
    <ThemeContext.Provider value={{ theme, loading, refresh: fetchAndApply }}>
      {/* Declarative pre-rendering elements to prevent Flash of Unstyled Content (FOUC) */}
      <link rel="stylesheet" href={fontUrl} />
      {/* Load all icon CDNs to ensure static icons and selected library icons both render correctly */}
      <link rel="stylesheet" href={ICON_CDNS.fontawesome} />
      <link rel="stylesheet" href={ICON_CDNS.bootstrap} />
      <link rel="stylesheet" href={ICON_CDNS.material} />
      <link rel="stylesheet" href={ICON_CDNS.remix} />
      <link rel="stylesheet" href={ICON_CDNS.phosphor} />
      <style id="pd-dynamic-theme" dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </ThemeContext.Provider>
  );
}
