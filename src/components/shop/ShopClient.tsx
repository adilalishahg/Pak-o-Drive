'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CategorySidebar } from '../product/CategorySidebar';
import { ProductCardAuto } from '../product/ProductCardAuto';
import { ProductCardList } from '../product/ProductCardList';
import { IProduct } from '../../types';
import { ShopClientProps } from '@/types/product';
import { useSiteTheme } from '../common/DynamicThemeProvider';


function ShopContent({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const { theme } = useSiteTheme();
  const isCleanWhite = theme.layoutTheme === 'theme1';
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const bg = isCleanWhite ? '#f8fafc' : isModernGreen ? '#f7f5ed' : '#f5f7fa';

  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState<string | null>(searchParams.get('search'));
  const [priceRange, setPriceRange] = useState({ min: 0, max: 150000 });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [keywords, setKeywords] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  /* Sync URL params */
  useEffect(() => {
    setSelectedCategory(searchParams.get('category'));
    setSearchQuery(searchParams.get('search'));
  }, [searchParams]);

  /* Fetch filtered products when user changes filters */
  useEffect(() => {
    // If default state, keep initialProducts
    if (!selectedCategory && !searchQuery && priceRange.min === 0 && priceRange.max === 150000 && !selectedRating) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        let url = '/api/products?';
        if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
        if (priceRange.min > 0) url += `minPrice=${priceRange.min}&`;
        if (priceRange.max < 150000) url += `maxPrice=${priceRange.max}&`;
        if (selectedRating) url += `rating=${selectedRating}&`;
        url = url.replace(/[&?]$/, '');
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && data.success) setProducts(data.data);
      } catch { }
      finally { if (isMounted) setLoading(false); }
    })();

    return () => { isMounted = false; };
  }, [selectedCategory, searchQuery, priceRange, selectedRating, initialProducts]);

  const handleReset = () => {
    setSelectedCategory(null); setSearchQuery(null);
    setPriceRange({ min: 0, max: 150000 });
    setSelectedRating(null); setSortBy('default'); setKeywords('');
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    return 0;
  });

  const hasFilters = !!(selectedCategory || selectedRating || priceRange.max < 150000 || searchQuery);

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>

      {/* ── Breadcrumb bar ── */}
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
              {loading ? '...' : `${sorted.length} products found`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        width: '100%', 
        display: 'flex', 
        gap: '24px', 
        padding: '16px 12px 24px', 
        alignItems: 'flex-start' 
      }}>

        {/* ── Sidebar (desktop) ── */}
        <div className="d-none d-lg-block" style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '80px' }}>
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

        {/* ── Products area ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '10px 14px',
            border: '1px solid #eef2f7', marginBottom: '14px',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {/* Row 1: Search Form */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <form onSubmit={e => { e.preventDefault(); setSearchQuery(keywords.trim() || null); }}
                style={{
                  flex: 1, minWidth: 0, display: 'flex', alignItems: 'center',
                  border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden',
                  background: '#f8fafc', transition: 'all 0.2s ease',
                }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--pd-primary, #ea580c)'; e.currentTarget.style.background = '#fff'; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <i className="fas fa-search ms-3 text-muted" style={{ fontSize: '12px' }} />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none', padding: '8px 10px',
                    fontSize: '0.84rem', background: 'transparent', color: '#1e293b',
                  }}
                />
                {keywords && (
                  <button
                    type="button"
                    onClick={() => { setKeywords(''); setSearchQuery(null); }}
                    style={{ background: 'none', border: 'none', padding: '0 8px', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="Submit Search"
                  style={{
                    background: 'var(--pd-primary, #ea580c)',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Search
                </button>
              </form>
            </div>

            {/* Row 2: Filters + Results Count + Sort + Grid/List Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              
              {/* Left: Mobile Filters Button & Results Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="d-flex d-lg-none btn-gradient"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    border: 'none', borderRadius: '8px', padding: '6px 12px',
                    fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <i className="fas fa-sliders-h" style={{ fontSize: '10px' }} />
                  <span>Filters</span>
                  {hasFilters && (
                    <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '1px 5px', fontSize: '9px' }}>
                      ON
                    </span>
                  )}
                </button>

                <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  {loading ? 'Loading...' : `${sorted.length} ${sorted.length === 1 ? 'Item' : 'Items'}`}
                </span>
              </div>

              {/* Right: Sort By + View Mode Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    aria-label="Sort products"
                    style={{
                      border: '1.5px solid #e2e8f0', borderRadius: '8px',
                      padding: '6px 24px 6px 10px', fontSize: '0.76rem',
                      fontWeight: 600, outline: 'none', cursor: 'pointer', color: '#334155',
                      background: '#fff', appearance: 'none',
                    }}
                  >
                    <option value="default">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Highest Rated</option>
                  </select>
                  <i
                    className="fas fa-chevron-down"
                    style={{ position: 'absolute', right: '8px', fontSize: '9px', color: '#64748b', pointerEvents: 'none' }}
                  />
                </div>

                {/* View Mode Switcher */}
                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '2px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Grid View (2-Column)"
                    style={{
                      border: 'none',
                      background: viewMode === 'grid' ? '#fff' : 'transparent',
                      color: viewMode === 'grid' ? 'var(--pd-primary, #ea580c)' : '#64748b',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label="Grid View"
                  >
                    <i className="fas fa-th-large" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    title="List View (1-Column)"
                    style={{
                      border: 'none',
                      background: viewMode === 'list' ? '#fff' : 'transparent',
                      color: viewMode === 'list' ? 'var(--pd-primary, #ea580c)' : '#64748b',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label="List View"
                  >
                    <i className="fas fa-list" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Active:</span>
              {selectedCategory && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(var(--pd-primary-rgb,234,88,12),0.1)', color: 'var(--pd-primary)',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700
                }}>
                  {selectedCategory}
                  <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => setSelectedCategory(null)} />
                </span>
              )}
              {searchQuery && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(var(--pd-primary-rgb,234,88,12),0.1)', color: 'var(--pd-primary)',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700
                }}>
                  &ldquo;{searchQuery}&rdquo;
                  <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => setSearchQuery(null)} />
                </span>
              )}
              {priceRange.max < 150000 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(var(--pd-primary-rgb,234,88,12),0.1)', color: 'var(--pd-primary)',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700
                }}>
                  ≤ PKR {priceRange.max.toLocaleString()}
                  <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => setPriceRange({ min: 0, max: 150000 })} />
                </span>
              )}
              <button onClick={handleReset} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, padding: '0 4px'
              }}>
                Clear all
              </button>
            </div>
          )}

          {/* Products grid / list */}
          {loading ? (
            <div className="row g-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="col-6 col-md-4">
                  <div className="skeleton" style={{ height: '260px', borderRadius: '12px' }} />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: '#fff',
              borderRadius: '12px', border: '1px solid #eef2f7'
            }}>
              <i className="fas fa-search" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '16px', display: 'block' }} />
              <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>No products found</h5>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
                Try adjusting your filters or search terms.
              </p>
              <button onClick={handleReset} className="btn-gradient"
                style={{
                  border: 'none', borderRadius: '50px', padding: '10px 28px',
                  fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer'
                }}>
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sorted.map((prod, idx) => (
                <div
                  key={prod._id}
                  className="product-card-anim"
                  style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                >
                  <ProductCardList product={prod} priority={idx < 4} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }} className="shop-grid">
              <style>{`
                  @media (min-width: 576px) { .shop-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
                  @media (min-width: 768px) { .shop-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important; } }
                  @media (min-width: 992px) { .shop-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 12px !important; } }
                  @media (min-width: 1200px) { .shop-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 14px !important; } }
                `}</style>
              {sorted.map((prod, idx) => (
                <div
                  key={prod._id}
                  className="product-card-anim"
                  style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
                >
                  <ProductCardAuto product={prod} priority={idx < 4} />
                </div>
              ))}
            </div>
          )}
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
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 16px 12px', borderBottom: '1px solid #eef2f7'
            }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Filters</span>
              <button onClick={() => setMobileFilterOpen(false)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#64748b'
                }}>
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
                style={{
                  border: 'none', borderRadius: '10px', padding: '13px',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                }}>
                Show {sorted.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ShopClient({ initialProducts }: ShopClientProps) {
  return (
    <Suspense fallback={
      <div className="container py-5 text-center text-muted">Loading Shop...</div>
    }>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
