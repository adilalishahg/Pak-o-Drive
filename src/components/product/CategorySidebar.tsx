'use client';

import React, { useState, useEffect } from 'react';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (min: number, max: number) => void;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  onReset: () => void;
}

const DEFAULT_CATEGORIES = [
  { name: 'Headphones', slug: 'headphones', icon: 'fas fa-headphones-alt' },
  { name: 'Chargers & Cables', slug: 'chargers', icon: 'fas fa-bolt' },
  { name: 'Automotive', slug: 'automotive', icon: 'fas fa-car' },
  { name: 'Smartwatches', slug: 'smartwatches', icon: 'fas fa-clock' },
  { name: 'Mobile Accessories', slug: 'accessories', icon: 'fas fa-mobile-alt' },
];

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedRating,
  onSelectRating,
  onReset,
}) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategories(json.data.map((c: any) => ({
            name: c.name, slug: c.slug,
            icon: 'fas fa-tag',
          })));
        }
      } catch {}
    })();
  }, []);

  const hasActiveFilters = selectedCategory || selectedRating || priceRange.max < 150000;

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #eef2f7',
    padding: '16px',
    marginBottom: '12px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  return (
    <div>
      {/* Active filters + Reset */}
      {hasActiveFilters && (
        <div style={{ ...sectionStyle, background: 'rgba(var(--pd-primary-rgb,234,88,12),0.05)', border: '1px solid rgba(var(--pd-primary-rgb,234,88,12),0.15)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pd-primary)' }}>
              <i className="fas fa-filter me-1" /> Active Filters
            </span>
            <button onClick={onReset} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', color: 'var(--pd-primary)', fontWeight: 700, padding: 0,
            }}>
              <i className="fas fa-times me-1" />Clear All
            </button>
          </div>
          <div className="d-flex flex-wrap gap-1">
            {selectedCategory && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'var(--pd-primary)', color: '#fff', borderRadius: '20px',
                padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600 }}>
                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => onSelectCategory(null)} />
              </span>
            )}
            {selectedRating && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'var(--pd-primary)', color: '#fff', borderRadius: '20px',
                padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600 }}>
                {selectedRating}★ & above
                <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => onSelectRating(null)} />
              </span>
            )}
            {priceRange.max < 150000 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'var(--pd-primary)', color: '#fff', borderRadius: '20px',
                padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600 }}>
                Up to PKR {priceRange.max.toLocaleString()}
                <i className="fas fa-times" style={{ cursor: 'pointer', fontSize: '9px' }} onClick={() => onPriceRangeChange(0, 150000)} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          <i className="fas fa-th-large" style={{ color: 'var(--pd-primary)' }} />
          Categories
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* All */}
          <button onClick={() => onSelectCategory(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: selectedCategory === null ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)' : 'transparent',
              textAlign: 'left', width: '100%', transition: 'background 0.15s',
              borderLeft: selectedCategory === null ? '3px solid var(--pd-primary)' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (selectedCategory !== null) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
            onMouseLeave={e => { if (selectedCategory !== null) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: selectedCategory === null ? 'var(--pd-primary)' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-border-all" style={{ fontSize: '11px', color: selectedCategory === null ? '#fff' : '#64748b' }} />
            </div>
            <span style={{ fontSize: '0.83rem', fontWeight: selectedCategory === null ? 700 : 500,
              color: selectedCategory === null ? 'var(--pd-primary)' : '#374151' }}>
              All Products
            </span>
          </button>

          {categories.map(cat => (
            <button key={cat.slug} onClick={() => onSelectCategory(cat.slug)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: selectedCategory === cat.slug ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)' : 'transparent',
                textAlign: 'left', width: '100%', transition: 'background 0.15s',
                borderLeft: selectedCategory === cat.slug ? '3px solid var(--pd-primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (selectedCategory !== cat.slug) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (selectedCategory !== cat.slug) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                background: selectedCategory === cat.slug ? 'var(--pd-primary)' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={cat.icon} style={{ fontSize: '11px', color: selectedCategory === cat.slug ? '#fff' : '#64748b' }} />
              </div>
              <span style={{ fontSize: '0.83rem', fontWeight: selectedCategory === cat.slug ? 700 : 500,
                color: selectedCategory === cat.slug ? 'var(--pd-primary)' : '#374151',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          <i className="fas fa-tag" style={{ color: 'var(--pd-primary)' }} />
          Price Range
        </p>
        <input type="range" className="form-range w-100" min="500" max="150000" step="500"
          value={maxPrice}
          onChange={e => { const v = parseInt(e.target.value); setMaxPrice(v); onPriceRangeChange(0, v); }}
          style={{ accentColor: 'var(--pd-primary)' }}
        />
        <div className="d-flex justify-content-between mt-2">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>PKR 0</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pd-primary)' }}>
            PKR {maxPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Rating Filter */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          <i className="fas fa-star" style={{ color: 'var(--pd-primary)' }} />
          Rating
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[4, 3, 2].map(r => (
            <button key={r} onClick={() => onSelectRating(selectedRating === r ? null : r)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: selectedRating === r ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)' : 'transparent',
                textAlign: 'left', width: '100%', transition: 'background 0.15s',
                borderLeft: selectedRating === r ? '3px solid var(--pd-primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (selectedRating !== r) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (selectedRating !== r) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className={`fas fa-star`}
                    style={{ fontSize: '11px', color: i < r ? '#fbbf24' : '#e2e8f0' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: selectedRating === r ? 700 : 500,
                color: selectedRating === r ? 'var(--pd-primary)' : '#64748b' }}>
                {r}★ & above
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
