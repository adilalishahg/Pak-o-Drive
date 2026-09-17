'use client';

import React from 'react';
import Link from 'next/link';

interface ShopBreadcrumbBarProps {
  selectedCategory: string | null;
  loading: boolean;
  totalProductsCount: number;
}

export function ShopBreadcrumbBar({
  selectedCategory,
  loading,
  totalProductsCount,
}: ShopBreadcrumbBarProps) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eef2f7', padding: '10px 0' }}>
      <div className="container-fluid px-3 px-lg-4" style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none text-muted">Home</Link>
              </li>
              <li className="breadcrumb-item active fw-semibold" style={{ color: '#1e293b' }}>Shop</li>
              {selectedCategory && (
                <li className="breadcrumb-item active" style={{ color: 'var(--pd-primary)', fontWeight: 600 }}>
                  {selectedCategory}
                </li>
              )}
            </ol>
          </nav>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
            {loading ? '...' : `${totalProductsCount} products found`}
          </span>
        </div>
      </div>
    </div>
  );
}
