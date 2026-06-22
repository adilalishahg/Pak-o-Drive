'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CategorySidebar } from '../../components/product/CategorySidebar';
import { ProductCard } from '../../components/product/ProductCard';
import { IProduct } from '../../types';

function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts]               = useState<IProduct[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [searchQuery, setSearchQuery]         = useState<string | null>(searchParams.get('search'));
  const [priceRange, setPriceRange]           = useState({ min: 0, max: 150000 });
  const [selectedRating, setSelectedRating]   = useState<number | null>(null);
  const [sortBy, setSortBy]                   = useState('default');
  const [keywords, setKeywords]               = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  /* Sync URL params */
  useEffect(() => {
    setSelectedCategory(searchParams.get('category'));
    setSearchQuery(searchParams.get('search'));
  }, [searchParams]);

  /* Fetch products */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let url = '/api/products?';
        if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
        if (searchQuery)       url += `search=${encodeURIComponent(searchQuery)}&`;
        if (priceRange.min > 0)       url += `minPrice=${priceRange.min}&`;
        if (priceRange.max < 150000)  url += `maxPrice=${priceRange.max}&`;
        if (selectedRating)   url += `rating=${selectedRating}&`;
        url = url.replace(/[&?]$/, '');
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [selectedCategory, searchQuery, priceRange, selectedRating]);

  const handleReset = () => {
    setSelectedCategory(null); setSearchQuery(null);
    setPriceRange({ min: 0, max: 150000 });
    setSelectedRating(null); setSortBy('default'); setKeywords('');
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-asc')    return a.price - b.price;
    if (sortBy === 'price-desc')   return b.price - a.price;
    if (sortBy === 'rating-desc')  return b.rating - a.rating;
    return 0;
  });

  const hasFilters = !!(selectedCategory || selectedRating || priceRange.max < 150000 || searchQuery);

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>

      {/* ── Breadcrumb bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef2f7', padding: '10px 0' }}>
        <div className="container-fluid px-3 px-lg-4">
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
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
              {loading ? '...' : `${sorted.length} products found`}
            </span>
          </div>
        </div>
      </div>

      <div className="container-fluid px-3 px-lg-4 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="row g-3">

          {/* ── Sidebar (desktop) ── */}
          <div className="col-lg-3 d-none d-lg-block">
            <div style={{ position: 'sticky', top: '80px' }}>
              <CategorySidebar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
                selectedRating={selectedRating}
                onSelectRating={setSelectedRating}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* ── Products area ── */}
          <div className="col-12 col-lg-9">

            {/* Toolbar */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '12px 16px',
              border: '1px solid #eef2f7', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

              {/* Mobile filter button */}
              <button onClick={() => setMobileFilterOpen(true)}
                className="d-flex d-lg-none btn-gradient"
                style={{ display: 'flex', alignItems: 'center', gap: '6px',
                  border: 'none', borderRadius: '8px', padding: '8px 14px',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}>
                <i className="fas fa-sliders-h" />
                Filters {hasFilters && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>ON</span>}
              </button>

              {/* Search */}
              <form onSubmit={e => { e.preventDefault(); setSearchQuery(keywords.trim() || null); }}
                style={{ flex: 1, minWidth: '180px', display: 'flex',
                  border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <input type="search" placeholder="Search products..."
                  value={keywords} onChange={e => setKeywords(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 14px',
                    fontSize: '0.85rem', fontFamily: 'var(--pd-font)', background: 'transparent' }} />
                <button type="submit" style={{ background: 'none', border: 'none', padding: '0 14px', cursor: 'pointer', color: '#94a3b8' }}>
                  <i className="fas fa-search" style={{ fontSize: '13px' }} />
                </button>
              </form>

              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  padding: '8px 12px', fontSize: '0.82rem', fontFamily: 'var(--pd-font)',
                  fontWeight: 500, outline: 'none', cursor: 'pointer', color: '#374151',
                  background: '#fff', flexShrink: 0 }}>
                <option value="default">Default Sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Active:</span>
                {selectedCategory && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(var(--pd-primary-rgb,234,88,12),0.1)', color: 'var(--pd-primary)',
                    borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {selectedCategory}
                    <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => setSelectedCategory(null)} />
                  </span>
                )}
                {searchQuery && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(var(--pd-primary-rgb,234,88,12),0.1)', color: 'var(--pd-primary)',
                    borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700 }}>
                    &ldquo;{searchQuery}&rdquo;
                    <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => setSearchQuery(null)} />
                  </span>
                )}
                {priceRange.max < 150000 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(var(--pd-primary-rgb,234,88,12),0.1)', color: 'var(--pd-primary)',
                    borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700 }}>
                    ≤ PKR {priceRange.max.toLocaleString()}
                    <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => setPriceRange({ min: 0, max: 150000 })} />
                  </span>
                )}
                <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, padding: '0 4px' }}>
                  Clear all
                </button>
              </div>
            )}

            {/* Products grid */}
            {loading ? (
              <div className="row g-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="skeleton" style={{ height: '280px', borderRadius: '12px' }} />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff',
                borderRadius: '12px', border: '1px solid #eef2f7' }}>
                <i className="fas fa-search" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '16px', display: 'block' }} />
                <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>No products found</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Try adjusting your filters or search terms.
                </p>
                <button onClick={handleReset} className="btn-gradient"
                  style={{ border: 'none', borderRadius: '50px', padding: '10px 28px',
                    fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="row g-0" style={{ borderTop: '1px solid #f0f0f0', borderLeft: '1px solid #f0f0f0' }}>
                {sorted.map(prod => (
                  <div key={prod._id} className="col-6 col-md-4 col-xl-3"
                    style={{ borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setMobileFilterOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }} />
          {/* Drawer */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1051,
            background: '#f5f7fa', borderRadius: '20px 20px 0 0',
            padding: '0 0 32px 0', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
          }}>
            {/* Handle */}
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', display: 'inline-block' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 16px 12px', borderBottom: '1px solid #eef2f7' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Filters</span>
              <button onClick={() => setMobileFilterOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <i className="fas fa-times" style={{ fontSize: '13px' }} />
              </button>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <CategorySidebar
                selectedCategory={selectedCategory}
                onSelectCategory={cat => { setSelectedCategory(cat); setMobileFilterOpen(false); }}
                priceRange={priceRange}
                onPriceRangeChange={(min, max) => setPriceRange({ min, max })}
                selectedRating={selectedRating}
                onSelectRating={setSelectedRating}
                onReset={() => { handleReset(); setMobileFilterOpen(false); }}
              />
            </div>
            <div style={{ padding: '0 16px' }}>
              <button onClick={() => setMobileFilterOpen(false)} className="btn-gradient w-100"
                style={{ border: 'none', borderRadius: '10px', padding: '13px',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                Show {sorted.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="container py-5 text-center text-muted">Loading Shop...</div>
    }>
      <ShopContent />
    </Suspense>
  );
}
