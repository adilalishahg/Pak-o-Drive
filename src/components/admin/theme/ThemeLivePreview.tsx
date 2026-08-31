'use client';

import React from 'react';
import { SiteTheme } from '../../common/DynamicThemeProvider';
import { PakODriveLogo } from '../../common/PakODriveLogo';

interface ThemeLivePreviewProps {
  theme: SiteTheme;
  onSetForm?: React.Dispatch<React.SetStateAction<SiteTheme>>;
}

export function ThemeLivePreview({ theme, onSetForm }: ThemeLivePreviewProps) {
  const primaryRgb = (theme.primaryColor || '#ea580c')
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((h) => parseInt(h, 16))
    .join(', ') || '234, 88, 12';

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
    theme.shadowIntensity === 'none'
      ? 'none'
      : theme.shadowIntensity === 'light'
      ? '0 4px 12px rgba(0,0,0,0.06)'
      : theme.shadowIntensity === 'medium'
      ? '0 10px 30px rgba(0,0,0,0.10)'
      : '0 20px 50px rgba(0,0,0,0.18)';

  return (
    <div style={{ position: 'sticky', top: '88px' }}>
      {/* Live Preview Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
        <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
          <i className="fas fa-eye text-primary" />
          Live Preview
          <span className="badge bg-success rounded-pill ms-auto" style={{ fontSize: '0.68rem' }}>
            Real-time
          </span>
        </h6>

        <div
          className="rounded-4 overflow-hidden border"
          style={{ fontFamily: `'${theme.fontFamily}', sans-serif`, fontSize: theme.fontSizeBase, boxShadow: cardShadow }}
        >
          {/* Announcement Bar */}
          {theme.announcementBarEnabled && (
            <div
              style={{
                background: isModernGreen ? '#d4af37' : theme.secondaryColor,
                color: isModernGreen ? '#0d231d' : '#fff',
                fontSize: '11px',
                padding: '6px 12px',
                textAlign: 'center',
                fontWeight: isModernGreen ? 700 : 500,
              }}
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
              background: isModernGreen
                ? '#0d231d'
                : `linear-gradient(135deg, ${theme.heroGradientStart} 0%, ${theme.heroGradientEnd} 100%)`,
              padding: '20px 16px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: isModernGreen
                  ? '#d4af37'
                  : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
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
            <p
              style={{
                color: isModernGreen ? '#d4af37' : theme.primaryColor,
                fontWeight: 800,
                fontSize: '0.75rem',
                margin: '0 0 4px',
                letterSpacing: '2px',
              }}
            >
              Save Up To PKR 15,000
            </p>
            <h2 style={{ color: isModernGreen ? '#f7f5ed' : theme.secondaryColor, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 10px' }}>
              Premium Electronics
            </h2>
            <button
              style={{
                background: isModernGreen
                  ? '#d4af37'
                  : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
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
                <div
                  style={{
                    height: '40px',
                    background: isModernGreen ? '#eae7db' : '#f1f5f9',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                />
                <p style={{ fontSize: '0.72rem', fontWeight: 700, margin: '0 0 2px', color: itemTextColor }}>
                  {p}
                </p>
                <p
                  style={{
                    fontSize: '0.68rem',
                    color: isModernGreen ? '#d4af37' : theme.primaryColor,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  PKR 12,000
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              background: footerBg,
              color: isModernGreen ? '#eae7db' : theme.footerStyle === 'light' ? '#64748b' : '#94a3b8',
              padding: '10px 16px',
              fontSize: '0.7rem',
              textAlign: 'center',
            }}
          >
            © 2026 PAKODRIVE — {theme.siteTagline}
          </div>
        </div>
      </div>

      {/* Color Quick Palettes */}
      {onSetForm && (
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
                onClick={() =>
                  onSetForm((prev) => ({
                    ...prev,
                    primaryColor: pal.primary,
                    secondaryColor: pal.secondary,
                    accentColor: pal.accent,
                  }))
                }
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
      )}
    </div>
  );
}
