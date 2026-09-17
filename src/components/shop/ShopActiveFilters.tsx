'use client';

import React from 'react';

interface ShopActiveFiltersProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string | null;
  setSearchQuery: (query: string | null) => void;
  setKeywords: (kw: string) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  handleReset: () => void;
}

export function ShopActiveFilters({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  setKeywords,
  priceRange,
  setPriceRange,
  handleReset,
}: ShopActiveFiltersProps) {
  return (
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
          background: 'rgba(var(--pd-primary-rgb,234,88,12),0.12)', color: 'var(--pd-primary)',
          borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700,
          border: '1px solid rgba(var(--pd-primary-rgb,234,88,12),0.25)'
        }}>
          <i className="fas fa-search" style={{ fontSize: '9px', opacity: 0.8 }} />
          <span>&ldquo;{searchQuery}&rdquo;</span>
          <i
            className="fas fa-times"
            style={{ cursor: 'pointer', fontSize: '9px', padding: '1px' }}
            onClick={() => {
              setSearchQuery(null);
              setKeywords('');
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('search');
                url.searchParams.delete('q');
                window.history.replaceState({}, '', url.toString());
              }
            }}
          />
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
      <button
        onClick={() => {
          handleReset();
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('search');
            url.searchParams.delete('q');
            url.searchParams.delete('category');
            url.searchParams.delete('minPrice');
            url.searchParams.delete('maxPrice');
            url.searchParams.delete('rating');
            window.history.replaceState({}, '', url.pathname);
          }
        }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, padding: '0 4px'
        }}
      >
        Clear all
      </button>
    </div>
  );
}
