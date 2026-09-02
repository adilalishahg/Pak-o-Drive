import React from 'react';

export interface WishlistHeaderProps {
  count: number;
}

export function WishlistHeader({ count }: WishlistHeaderProps) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
      <h2
        className="fw-black text-dark mb-0 font-extrabold tracking-tight"
        style={{ fontSize: '1.5rem' }}
      >
        ❤️ My Wishlist
      </h2>
      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
        {count} {count === 1 ? 'item' : 'items'} favorited
      </span>
    </div>
  );
}
