import React from 'react';
import Link from 'next/link';

export interface OrderErrorStateProps {
  error: string | null;
}

export function OrderErrorState({ error }: OrderErrorStateProps) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <i
          className="fas fa-exclamation-circle"
          style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '16px', display: 'block' }}
        />
        <h3 style={{ fontWeight: 700, color: '#111', marginBottom: '8px' }}>Order Not Found</h3>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error || 'The requested order could not be located.'}</p>
        <Link
          href="/"
          className="btn-gradient"
          style={{
            textDecoration: 'none',
            borderRadius: '8px',
            padding: '11px 24px',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
