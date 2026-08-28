'use client';

import React from 'react';
import { useSiteTheme } from '../common/DynamicThemeProvider';

export const AnnouncementBar: React.FC = () => {
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';

  return (
    <aside
      aria-label="Store Announcement & Trust Bar"
      style={{
        background: isModernGreen
          ? 'linear-gradient(90deg, #091a15, #113329, #091a15)'
          : 'linear-gradient(90deg, #0f172a, #1e293b, #0f172a)',
        color: '#ffffff',
        fontSize: '0.74rem',
        fontWeight: 600,
        padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1035,
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Main Trust Message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>🇵🇰</span>
            <span style={{ color: '#38bdf8' }}>Cash On Delivery</span>
            <span style={{ opacity: 0.8 }}>Available Nationwide</span>
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

        {/* WhatsApp Helpline link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent('Hi Pakodrive, I need support with an order.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#25D366',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'rgba(37, 211, 102, 0.12)',
              padding: '2px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(37, 211, 102, 0.3)',
            }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '12px' }} />
            <span>Helpline: {whatsappNumber}</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
