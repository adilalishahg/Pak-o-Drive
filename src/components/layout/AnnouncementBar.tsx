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

        {/* Right: Dynamic WhatsApp Helpline */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <a
            href={`https://wa.me/${digitsOnly}?text=${encodeURIComponent('Hi Pakodrive, I need support with an order.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#25D366',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'clamp(0.64rem, 1.7vw, 0.72rem)',
              fontWeight: 700,
              background: 'rgba(37, 211, 102, 0.12)',
              padding: '2px 7px',
              borderRadius: '20px',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              transition: 'background 0.15s ease',
            }}
            title="Chat on WhatsApp Helpline"
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '11px' }} />
            <span className="d-none d-xs-inline">Helpline: </span>
            <span>{cleanPhone}</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

