import type { SiteTheme } from '@/types/theme';

/* ─── Helpers ─────────────────────────────────────────────────── */
/** Converts a hex color to "R, G, B" format for rgba() usage */
export function hexToRgb(hex: string): string {
  if (!hex || typeof hex !== 'string') return '234, 88, 12';
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  if (isNaN(num)) return '234, 88, 12';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

/** Shadow presets keyed by intensity */
export const SHADOW_MAP: Record<SiteTheme['shadowIntensity'], string> = {
  none:   '0 0 0 rgba(0,0,0,0)',
  light:  '0 4px 12px rgba(15,23,42,0.06)',
  medium: '0 10px 30px rgba(15,23,42,0.1)',
  strong: '0 20px 50px rgba(15,23,42,0.18)',
};

export const SHADOW_HOVER_MAP: Record<SiteTheme['shadowIntensity'], string> = {
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
body, input, select, textarea {
  font-family: var(--pd-font) !important;
}
.btn, .nav-link, button {
  font-family: var(--pd-font);
}
html { font-size: var(--pd-font-size-base); }

/* ── Icon Fonts Protection (Guarantees icons never turn into empty squares) ── */
i, [class*="fa-"], [class^="fa-"], .fa, .fas, .far, .fab, .fa-solid, .fa-regular, .fa-brands,
.bi, [class*="bi-"], [class^="bi-"],
.material-icons, .material-icons-round,
[class*="ri-"], [class^="ri-"],
[class*="ph-"], [class^="ph-"] {
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}

.fa, .fas, .fa-solid {
  font-family: 'Font Awesome 7 Free', 'Font Awesome 6 Free', 'Font Awesome 5 Free', 'FontAwesome', sans-serif !important;
  font-weight: 900 !important;
}
.fab, .fa-brands {
  font-family: 'Font Awesome 7 Brands', 'Font Awesome 6 Brands', 'Font Awesome 5 Brands', 'FontAwesome', sans-serif !important;
  font-weight: 400 !important;
}
.far, .fa-regular {
  font-family: 'Font Awesome 7 Free', 'Font Awesome 6 Free', 'Font Awesome 5 Free', 'FontAwesome', sans-serif !important;
  font-weight: 400 !important;
}
.material-icons, .material-icons-round {
  font-family: 'Material Icons Round' !important;
}
.bi::before, [class^="bi-"]::before, [class*=" bi-"]::before {
  font-family: 'bootstrap-icons' !important;
}
[class^="ri-"]::before, [class*=" ri-"]::before {
  font-family: 'remixicon' !important;
}
[class^="ph-"]::before, [class*=" ph-"]::before {
  font-family: 'Phosphor' !important;
}

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
  color: #f1f5f9 !important;
}
.footer p, .footer span {
  color: #f1f5f9 !important;
}
footer h3, footer h4, footer h5, .footer h3, .footer h4, .footer h5 {
  color: #ffffff !important;
}
footer a, .footer a {
  color: #f1f5f9 !important;
}
footer a:hover, .footer a:hover {
  color: #ffffff !important;
  text-decoration: underline !important;
}
.copyright {
  background: color-mix(in srgb, ${theme.secondaryColor} 80%, #000) !important;
  color: #cbd5e1 !important;
}
.copyright a {
  color: #ffffff !important;
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

${theme.layoutTheme === 'modern-green' ? `
body {
  background-color: #f7f5ed !important;
}
/* Warm dark green topbar and navbar */
header, .announcement-bar {
  background: #0d231d !important;
  border-bottom: 1px solid #1a3c32 !important;
}
header a, header button, header span, header input {
  color: #f7f5ed !important;
}
header input::placeholder {
  color: rgba(247, 245, 237, 0.6) !important;
}
/* Search container */
header form div {
  border-color: #d4af37 !important;
  background: rgba(255,255,255,0.05) !important;
}
header form button {
  background: #d4af37 !important;
  color: #0d231d !important;
}
/* Gold accent on active links */
header nav a {
  color: #f7f5ed !important;
}
header nav a:hover, header nav a.active {
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.1) !important;
}
/* Categories menu button in navbar */
header button {
  background: #14352c !important;
  color: #d4af37 !important;
}
/* Logo */
header span {
  color: #d4af37 !important;
}
header div[style*="background"] {
  background: #d4af37 !important;
}

/* Announcement Bar */
.announcement-bar {
  background: #d4af37 !important;
  color: #0d231d !important;
  font-weight: 700 !important;
}

/* Product Card styling */
.product-item, .pd-card {
  background-color: #fbfaf7 !important;
  border: 1.5px solid #d4af3740 !important;
  border-radius: var(--pd-card-radius) !important;
  box-shadow: 0 4px 15px rgba(13, 35, 29, 0.05) !important;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
}
.product-item:hover, .pd-card:hover {
  border-color: #d4af37 !important;
  transform: translateY(-4px) !important;
  box-shadow: 0 10px 25px rgba(13, 35, 29, 0.12) !important;
}
.product-item p, .product-item span, .product-item h3, .product-item h4 {
  color: #0d231d !important;
}
.product-item .btn-gradient, .pd-card .btn-gradient {
  background: #0d231d !important;
  color: #f7f5ed !important;
  border-radius: 8px !important;
  border: 1px solid #14352c !important;
  box-shadow: none !important;
}
.product-item .btn-gradient:hover, .pd-card .btn-gradient:hover {
  background: #d4af37 !important;
  color: #0d231d !important;
}

/* Tabs */
.tab-btn {
  background-color: #eae7db !important;
  color: #0d231d !important;
  border: 1px solid #d1cbba !important;
}
.tab-btn.active {
  background: #0d231d !important;
  color: #d4af37 !important;
  border-color: #0d231d !important;
  box-shadow: none !important;
}

/* Category pills on main page */
.category-pill-item {
  background: #0d231d !important;
  color: #d4af37 !important;
  border: 2px solid #d4af37 !important;
  font-weight: 700 !important;
}

/* USP Stats circles */
.usp-circle {
  border: 3px solid #d4af37 !important;
  border-radius: 50% !important;
  width: 100px !important;
  height: 100px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 auto !important;
  background: #fbfaf7 !important;
  color: #0d231d !important;
}

/* Why Choose Us Cards */
.why-us-card {
  background: #0d231d !important;
  color: #f7f5ed !important;
  border-radius: var(--pd-card-radius) !important;
  border: 1px solid #1a3c32 !important;
}
.why-us-card h5, .why-us-card p {
  color: #f7f5ed !important;
}
.why-us-icon-container {
  background: #d4af37 !important;
}

/* Footer styling */
footer, .footer {
  background: #0d231d !important;
  color: #eae7db !important;
  border-top: 1px solid #14352c !important;
}
footer h5, footer h4, footer a, .footer a {
  color: #f7f5ed !important;
}
footer a:hover, .footer a:hover {
  color: #d4af37 !important;
}
.copyright {
  background: #091714 !important;
  border-top: 1px solid #0d231d !important;
  color: #94a3b8 !important;
}
` : ''}

${theme.layoutTheme === 'theme1' ? `
body {
  background-color: #f8fafc !important;
}
/* Clean white topbar and navbar */
header, .announcement-bar {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
header a, header button, header span, header input {
  color: ${theme.secondaryColor} !important;
}
header input::placeholder {
  color: color-mix(in srgb, ${theme.secondaryColor} 60%, transparent) !important;
}
/* Search container */
header form div {
  border-color: ${theme.primaryColor} !important;
  background: #ffffff !important;
}
header form button {
  background: ${theme.primaryColor} !important;
  color: #ffffff !important;
}
/* Active link styling */
header nav a {
  color: ${theme.secondaryColor} !important;
}
header nav a:hover, header nav a.active {
  color: ${theme.primaryColor} !important;
  background: color-mix(in srgb, ${theme.primaryColor} 8%, transparent) !important;
}
/* Categories menu button in navbar */
header button {
  background: color-mix(in srgb, ${theme.secondaryColor} 5%, transparent) !important;
  color: ${theme.primaryColor} !important;
}
/* Logo */
header span {
  color: ${theme.primaryColor} !important;
}


/* Announcement Bar */
.announcement-bar {
  background: color-mix(in srgb, ${theme.secondaryColor} 4%, transparent) !important;
  color: ${theme.secondaryColor} !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

/* Product Card styling */
.product-item, .pd-card {
  background-color: #ffffff !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: var(--pd-card-radius) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03) !important;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
}
.product-item:hover, .pd-card:hover {
  border-color: ${theme.primaryColor} !important;
  transform: translateY(-4px) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07) !important;
}
.product-item p, .product-item span, .product-item h3, .product-item h4 {
  color: ${theme.secondaryColor} !important;
}
.product-item .btn-gradient, .pd-card .btn-gradient {
  background: ${theme.primaryColor} !important;
  color: #ffffff !important;
  border-radius: var(--pd-btn-radius) !important;
  border: 1px solid color-mix(in srgb, ${theme.primaryColor} 85%, #000) !important;
  box-shadow: none !important;
}
.product-item .btn-gradient:hover, .pd-card .btn-gradient:hover {
  background: color-mix(in srgb, ${theme.primaryColor} 85%, #000) !important;
}

/* Tabs */
.tab-btn {
  background-color: color-mix(in srgb, ${theme.secondaryColor} 4%, transparent) !important;
  color: ${theme.secondaryColor} !important;
  border: 1px solid #e2e8f0 !important;
}
.tab-btn.active {
  background: ${theme.primaryColor} !important;
  color: #ffffff !important;
  border-color: ${theme.primaryColor} !important;
  box-shadow: none !important;
}

/* Category pills on main page */
.category-pill-item {
  background: #ffffff !important;
  color: ${theme.secondaryColor} !important;
  border: 1.5px solid #e2e8f0 !important;
  font-weight: 700 !important;
}

/* USP Stats circles */
.usp-circle {
  border: 3px solid ${theme.primaryColor} !important;
  border-radius: 50% !important;
  width: 100px !important;
  height: 100px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 auto !important;
  background: #ffffff !important;
  color: ${theme.secondaryColor} !important;
}

/* Why Choose Us Cards */
.why-us-card {
  background: #ffffff !important;
  color: ${theme.secondaryColor} !important;
  border-radius: var(--pd-card-radius) !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02) !important;
}
.why-us-card h5, .why-us-card p {
  color: ${theme.secondaryColor} !important;
}
.why-us-icon-container {
  background: ${theme.primaryColor} !important;
}

/* Footer styling */
footer, .footer {
  background: #f8fafc !important;
  color: #475569 !important;
  border-top: 1px solid #e2e8f0 !important;
}
footer h5, footer h4, footer a, .footer a {
  color: ${theme.secondaryColor} !important;
}
footer a:hover, .footer a:hover {
  color: ${theme.primaryColor} !important;
}
.copyright {
  background: color-mix(in srgb, ${theme.secondaryColor} 4%, transparent) !important;
  border-top: 1px solid #e2e8f0 !important;
  color: #64748b !important;
}

/* Custom classes for Theme 1 Navbar and general elements */
.theme1-logo-badge {
  background-color: ${theme.primaryColor} !important;
  color: #ffffff !important;
}
.theme1-nav-link {
  color: #475569 !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s ease-in-out;
  background: transparent !important;
}
.theme1-nav-link:hover {
  color: ${theme.primaryColor} !important;
  border-bottom-color: color-mix(in srgb, ${theme.primaryColor} 40%, transparent) !important;
}
.theme1-nav-link.active {
  color: ${theme.primaryColor} !important;
  border-bottom-color: ${theme.primaryColor} !important;
}
.theme1-dropdown-header {
  background: #f1f5f9 !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
.theme1-dropdown-header span {
  color: #1e293b !important;
}
.theme1-dropdown-header p {
  color: #64748b !important;
}
.theme1-dropdown-footer-btn {
  background: ${theme.primaryColor} !important;
  color: #ffffff !important;
  transition: all 0.2s ease-in-out !important;
  box-shadow: 0 4px 14px rgba(${primaryRgb}, 0.3) !important;
}
.theme1-dropdown-footer-btn:hover {
  background: color-mix(in srgb, ${theme.primaryColor} 85%, #000) !important;
  color: #ffffff !important;
  box-shadow: 0 6px 20px rgba(${primaryRgb}, 0.45) !important;
}
.theme1-cart-badge {
  background-color: ${theme.primaryColor} !important;
  color: #ffffff !important;
}
.theme1-track-order-btn {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  color: #475569 !important;
  background: transparent !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.2s ease-in-out;
}
.theme1-track-order-btn:hover {
  color: ${theme.primaryColor} !important;
  border-color: color-mix(in srgb, ${theme.primaryColor} 30%, transparent) !important;
  background: color-mix(in srgb, ${theme.primaryColor} 5%, transparent) !important;
}
.theme1-track-order-btn.active {
  color: ${theme.primaryColor} !important;
  background: color-mix(in srgb, ${theme.primaryColor} 10%, transparent) !important;
  border-color: color-mix(in srgb, ${theme.primaryColor} 30%, transparent) !important;
}
.theme1-mobile-nav-link {
  color: #374151 !important;
  background: transparent !important;
  transition: all 0.2s ease-in-out;
}
.theme1-mobile-nav-link:hover {
  background: #f8fafc !important;
  color: #1e293b !important;
}
.theme1-mobile-nav-link.active {
  color: ${theme.primaryColor} !important;
  background: color-mix(in srgb, ${theme.primaryColor} 10%, transparent) !important;
}
.theme1-mobile-sub-link {
  color: #475569 !important;
  transition: all 0.15s ease-in-out;
}
.theme1-mobile-sub-link:hover {
  color: ${theme.primaryColor} !important;
  background: color-mix(in srgb, ${theme.primaryColor} 8%, transparent) !important;
}
.theme1-collection-item:hover .theme1-collection-circle {
  border-color: ${theme.primaryColor} !important;
  box-shadow: 0 4px 12px color-mix(in srgb, ${theme.primaryColor} 15%, transparent) !important;
}
.theme1-collection-item:hover .theme1-collection-text {
  color: ${theme.primaryColor} !important;
}
.theme1-product-title:hover {
  color: ${theme.primaryColor} !important;
}
.theme1-product-btn {
  background-color: #f8fafc !important;
  color: #1e293b !important;
  border: 1px solid #e2e8f0 !important;
}
.theme1-product-btn:hover {
  background-color: ${theme.primaryColor} !important;
  color: #ffffff !important;
  border-color: ${theme.primaryColor} !important;
}
` : ''}
  `.trim();
}
