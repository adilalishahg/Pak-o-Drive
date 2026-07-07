'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/product/ProductCard';
import { IProduct } from '../../types';
import { useSiteTheme } from '../../components/common/DynamicThemeProvider';

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();
  const { theme } = useSiteTheme();
  const router = useRouter();
  const isCleanWhite = theme.layoutTheme === 'theme1';
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const bg = isCleanWhite ? '#f8fafc' : isModernGreen ? '#f7f5ed' : '#f5f7fa';

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && isMounted) {
          const filtered = data.data.filter((p: IProduct) => wishlist.includes(p._id?.toString() || ''));
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching wishlist products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [wishlist]);

  return (
    <div style={{ background: bg, minHeight: '80vh', padding: '40px 12px 60px' }}>
      <div className="container-fluid px-3 px-lg-4" style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb" style={{ fontSize: '0.8rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" className="text-decoration-none text-muted">Home</Link>
            </li>
            <li className="breadcrumb-item active fw-semibold" style={{ color: '#1e293b' }}>My Wishlist</li>
          </ol>
        </nav>

        {/* Title */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
          <h2 className="fw-black text-dark mb-0 font-extrabold text-2xl tracking-tight" style={{ fontSize: '1.5rem' }}>
            ❤️ My Wishlist
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} favorited
          </span>
        </div>

        {/* Wishlist Grid */}
        {loading ? (
          <div className="row g-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <div className="skeleton bg-white border border-slate-100 rounded-4" style={{ height: '320px' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 px-3 rounded-4 bg-white border" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#fee2e2', color: '#ef4444',
              display: 'flex', alignItems: 'center', justify: 'center',
              margin: '0 auto 16px',
            }}>
              <i className="far fa-heart" style={{ fontSize: '1.6rem' }} />
            </div>
            <h4 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Your Wishlist is Empty</h4>
            <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '380px' }}>
              Add items that you like to your wishlist so you can easily find them later and order whenever you are ready!
            </p>
            <Link href="/shop" className="btn btn-gradient px-4 py-2 border-0 text-white rounded-pill fw-bold text-decoration-none text-sm inline-flex align-items-center gap-2">
              <i className="fas fa-shopping-bag" /> Go Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }} className="wishlist-grid">
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
        )}

      </div>
    </div>
  );
}
