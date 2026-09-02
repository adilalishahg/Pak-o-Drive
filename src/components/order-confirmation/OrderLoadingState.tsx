import React from 'react';

export function OrderLoadingState() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        className="spinner-border"
        style={{ color: 'var(--pd-primary)', width: '2.5rem', height: '2.5rem' }}
      />
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading your order…</p>
    </div>
  );
}
