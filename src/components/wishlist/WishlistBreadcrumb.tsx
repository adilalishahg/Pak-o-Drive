import React from 'react';
import Link from 'next/link';

export function WishlistBreadcrumb() {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
        <li className="breadcrumb-item">
          <Link href="/" className="text-decoration-none text-muted">Home</Link>
        </li>
        <li className="breadcrumb-item active fw-semibold" style={{ color: '#1e293b' }}>
          My Wishlist
        </li>
      </ol>
    </nav>
  );
}
