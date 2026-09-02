import React from 'react';
import Link from 'next/link';

export interface ProductBreadcrumbProps {
  category: string;
  productName: string;
}

export function ProductBreadcrumb({ category, productName }: ProductBreadcrumbProps) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '8px 0' }}>
      <div className="container-fluid px-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.75rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <li className="breadcrumb-item flex-shrink-0">
              <Link href="/" className="text-decoration-none text-muted">Home</Link>
            </li>
            <li className="breadcrumb-item flex-shrink-0">
              <Link href="/shop" className="text-decoration-none text-muted">Shop</Link>
            </li>
            <li className="breadcrumb-item flex-shrink-0">
              <Link
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="text-decoration-none text-muted text-capitalize"
              >
                {category}
              </Link>
            </li>
            <li
              className="breadcrumb-item active text-dark fw-semibold"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {productName}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
