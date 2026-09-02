import React from 'react';

export interface OrderSuccessBannerProps {
  shortId: string;
  onWhatsApp: () => void;
  onPrint: () => void;
}

export function OrderSuccessBanner({ shortId, onWhatsApp, onPrint }: OrderSuccessBannerProps) {
  return (
    <div
      className="no-print"
      style={{
        background: 'linear-gradient(135deg, #16a34a, #15803d)',
        padding: '28px 20px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
      >
        <i className="fas fa-check" style={{ fontSize: '1.6rem', color: '#fff' }} />
      </div>

      <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 6px' }}>
        Order Placed!
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '0 0 20px' }}>
        Order #{shortId} &bull; Thank you for shopping with us
      </p>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '360px',
          margin: '0 auto',
        }}
      >
        <button
          type="button"
          onClick={onWhatsApp}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#25D366',
            border: 'none',
            borderRadius: '8px',
            padding: '13px 20px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }} />
          Confirm Order on WhatsApp
        </button>

        <button
          type="button"
          onClick={onPrint}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '12px 20px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-print" />
          Print Invoice
        </button>
      </div>
    </div>
  );
}
