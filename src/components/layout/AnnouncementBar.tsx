'use client';

import React from 'react';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { useSiteInfo } from '../common/SiteInfoProvider';

export const AnnouncementBar: React.FC = () => {
  const { theme } = useSiteTheme();
  const { info } = useSiteInfo();
  const isModernGreen = theme.layoutTheme === 'modern-green';

  const rawPhone = info?.whatsapp || info?.phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const digitsOnly = cleanPhone.replace('+', '');

  return (
    <aside
      aria-label="Store Announcement & Trust Bar"
      style={{
        background: isModernGreen
          ? 'linear-gradient(90deg, #091a15, #113329, #091a15)'
          : 'linear-gradient(90deg, #0f172a, #1e293b, #0f172a)',
        color: '#ffffff',
        fontSize: 'clamp(0.68rem, 1.8vw, 0.74rem)',
        fontWeight: 600,
        padding: '5px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1035,
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '8px',
        }}
      >
        {/* Left: Main Trust Message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <i className="fas fa-truck-moving" style={{ color: '#38bdf8', fontSize: '11px', flexShrink: 0 }} />
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Cash On Delivery</span>
            <span style={{ opacity: 0.75 }} className="d-none d-sm-inline">Available Nationwide</span>
          </div>

          <span style={{ opacity: 0.3 }} className="d-none d-md-inline">|</span>

          <div className="d-none d-md-flex align-items-center gap-1" style={{ color: '#a7f3d0' }}>
            <i className="fas fa-undo-alt" style={{ fontSize: '11px' }} />
            <span>7-Day Replacement Guarantee</span>
          </div>

          <span style={{ opacity: 0.3 }} className="d-none d-lg-inline">|</span>

          <div className="d-none d-lg-flex align-items-center gap-1" style={{ color: '#fef08a' }}>
            <i className="fas fa-bolt" style={{ fontSize: '11px' }} />
            <span>Fast 24–48h Dispatch</span>
          </div>
        </div>

        {/* Right: Dynamic WhatsApp Helpline with Live Animation */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes whatsappPulseGlow {
              0% {
                box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.65);
                border-color: rgba(37, 211, 102, 0.4);
              }
              50% {
                box-shadow: 0 0 10px 2px rgba(37, 211, 102, 0.35);
                border-color: rgba(37, 211, 102, 0.85);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.65);
                border-color: rgba(37, 211, 102, 0.4);
              }
            }
            @keyframes whatsappIconWiggle {
              0%, 70%, 100% { transform: rotate(0deg) scale(1); }
              75% { transform: rotate(-14deg) scale(1.2); }
              80% { transform: rotate(14deg) scale(1.2); }
              85% { transform: rotate(-8deg) scale(1.15); }
              90% { transform: rotate(8deg) scale(1.1); }
              95% { transform: rotate(0deg) scale(1); }
            }
            @keyframes liveRadarDot {
              0% { transform: scale(0.9); opacity: 0.7; }
              50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 8px #25D366; }
              100% { transform: scale(0.9); opacity: 0.7; }
            }
            .whatsapp-announcement-pill:hover {
              background: rgba(37, 211, 102, 0.28) !important;
              transform: translateY(-1px) scale(1.02);
            }
          `}} />
          <a
            href={`https://wa.me/${digitsOnly}?text=${encodeURIComponent('Hi Pakodrive, I need support with an order.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-announcement-pill"
            style={{
              color: '#25D366',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'clamp(0.68rem, 1.8vw, 0.76rem)',
              fontWeight: 700,
              background: 'rgba(37, 211, 102, 0.16)',
              padding: '3px 9px',
              borderRadius: '20px',
              border: '1px solid rgba(37, 211, 102, 0.5)',
              animation: 'whatsappPulseGlow 2.4s infinite ease-in-out',
              transition: 'all 0.2s ease',
              lineHeight: 1.3,
            }}
            title="Chat on WhatsApp Helpline"
          >
            {/* Live Indicator Dot */}
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#25D366',
                display: 'inline-block',
                flexShrink: 0,
                animation: 'liveRadarDot 1.8s infinite ease-in-out',
              }}
            />
            {/* Wiggling WhatsApp Icon */}
            <i
              className="fab fa-whatsapp"
              style={{
                fontSize: '13px',
                display: 'inline-block',
                animation: 'whatsappIconWiggle 3.2s infinite ease-in-out',
                color: '#25D366',
              }}
            />
            <span className="d-none d-xs-inline" style={{ color: '#ffffff', opacity: 0.9 }}>
              Helpline:
            </span>
            <span style={{ color: '#25D366', letterSpacing: '0.3px', fontWeight: 800 }}>
              {cleanPhone}
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
};

