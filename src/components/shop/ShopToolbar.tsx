'use client';

import React from 'react';

interface ShopToolbarProps {
  keywords: string;
  setKeywords: (val: string) => void;
  setSearchQuery: (val: string | null) => void;
  searchQuery: string | null;
  loading: boolean;
  sortedLength: number;
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  setMobileFilterOpen: (open: boolean) => void;
  hasFilters: boolean;
}

export function ShopToolbar({
  keywords,
  setKeywords,
  setSearchQuery,
  searchQuery,
  loading,
  sortedLength,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  setMobileFilterOpen,
  hasFilters,
}: ShopToolbarProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '10px 14px',
      border: '1px solid #eef2f7', marginBottom: '14px',
      boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {/* Row 1: Search Form */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <form onSubmit={e => {
            e.preventDefault();
            const q = keywords.trim() || null;
            setSearchQuery(q);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              if (q) {
                url.searchParams.set('search', q);
              } else {
                url.searchParams.delete('search');
                url.searchParams.delete('q');
              }
              window.history.replaceState({}, '', url.toString());
            }
          }}
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
              onClick={() => {
                setKeywords('');
                setSearchQuery(null);
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  url.searchParams.delete('q');
                  window.history.replaceState({}, '', url.toString());
                }
              }}
              style={{ background: 'none', border: 'none', padding: '0 8px', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
              title="Clear search"
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
            {loading ? 'Loading...' : `${sortedLength} ${sortedLength === 1 ? 'Item' : 'Items'}`}
            {searchQuery && (
              <span className="ms-1 fw-bold text-dark">
                for &ldquo;<span style={{ color: 'var(--pd-primary, #ea580c)' }}>{searchQuery}</span>&rdquo;
              </span>
            )}
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
  );
}
