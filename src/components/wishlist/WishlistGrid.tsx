import React from 'react';
import { IProduct } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

export interface WishlistGridProps {
  products: IProduct[];
}

export function WishlistGrid({ products }: WishlistGridProps) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
      className="wishlist-grid"
    >
      <style>{`
        .wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; }
        @media (min-width: 576px) { .wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (min-width: 768px) { .wishlist-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (min-width: 992px) { .wishlist-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (min-width: 1200px) { .wishlist-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 12px !important; } }
      `}</style>
      {products.map((prod) => (
        <div key={prod._id}>
          <ProductCard product={prod} />
        </div>
      ))}
    </div>
  );
}
