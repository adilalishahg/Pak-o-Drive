import React from 'react';
import Link from 'next/link';

export function TrackOrderBreadcrumb() {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
      <div className="container-fluid px-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.78rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" className="text-decoration-none text-muted">Home</Link>
            </li>
            <li className="breadcrumb-item active fw-semibold" style={{ color: '#111' }}>
              Track Order
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
