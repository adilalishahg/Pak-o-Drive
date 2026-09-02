'use client';

import React from 'react';
import { useWishlistPage } from '@/hooks/useWishlistPage';
import { WishlistBreadcrumb } from '@/components/wishlist/WishlistBreadcrumb';
import { WishlistHeader } from '@/components/wishlist/WishlistHeader';
import { WishlistSkeleton } from '@/components/wishlist/WishlistSkeleton';
import { WishlistEmptyState } from '@/components/wishlist/WishlistEmptyState';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';

export default function WishlistPage() {
  const { wishlistCount, products, loading, bg } = useWishlistPage();

  return (
    <div style={{ background: bg, minHeight: '80vh', padding: '40px 12px 60px' }}>
      <div className="container-fluid px-3 px-lg-4" style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <WishlistBreadcrumb />
        <WishlistHeader count={wishlistCount} />

        {loading ? (
          <WishlistSkeleton />
        ) : products.length === 0 ? (
          <WishlistEmptyState />
        ) : (
          <WishlistGrid products={products} />
        )}
      </div>
    </div>
  );
}
