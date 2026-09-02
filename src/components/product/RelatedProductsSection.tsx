import React from 'react';
import { getCachedRelatedProducts } from '@/lib/cache';
import { ProductCard } from './ProductCard';

export interface RelatedProductsSectionProps {
  category: string;
  excludeId: string;
}

export function RelatedProductsSkeleton() {
  return (
    <div className="pd-card p-4 mt-2 mb-4 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-36 mb-4" />
      <div className="row g-2 g-md-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="h-44 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function RelatedProductsSection({ category, excludeId }: RelatedProductsSectionProps) {
  const relatedProducts = await getCachedRelatedProducts(category, excludeId);
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="pd-card" style={{ marginTop: '8px', marginBottom: '16px' }}>
      <div style={{ padding: '16px 16px 8px' }}>
        <h2
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#111',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '2px solid var(--pd-primary)',
            display: 'inline-block',
          }}
        >
          Related Products
        </h2>
      </div>
      <div className="row g-2 g-md-3" style={{ padding: '0 12px 16px' }}>
        {relatedProducts.map((prod: any) => (
          <div key={prod._id} className="col-6 col-md-4 col-lg-3">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </div>
  );
}
