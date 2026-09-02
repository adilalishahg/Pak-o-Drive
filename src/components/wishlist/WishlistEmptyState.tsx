import React from 'react';
import Link from 'next/link';

export function WishlistEmptyState() {
  return (
    <div
      className="text-center py-5 px-3 rounded-4 bg-white border"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <i className="far fa-heart" style={{ fontSize: '1.6rem' }} />
      </div>
      <h4 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
        Your Wishlist is Empty
      </h4>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '380px' }}>
        Add items that you like to your wishlist so you can easily find them later and order whenever you are ready!
      </p>
      <Link
        href="/shop"
        className="btn btn-gradient px-4 py-2 border-0 text-white rounded-pill fw-bold text-decoration-none text-sm inline-flex align-items-center gap-2"
      >
        <i className="fas fa-shopping-bag" /> Go Shopping
      </Link>
    </div>
  );
}
