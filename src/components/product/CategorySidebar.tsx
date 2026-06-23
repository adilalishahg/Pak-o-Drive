'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (min: number, max: number) => void;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  onReset: () => void;
}

interface SidebarCategory {
  name: string;
  slug: string;
  icon: string;
  parentCategory?: string;
  image?: string;
}

const DEFAULT_CATEGORIES: SidebarCategory[] = [
  { name: 'Headphones', slug: 'headphones', icon: 'fas fa-headphones-alt', parentCategory: '' },
  { name: 'Chargers & Cables', slug: 'chargers', icon: 'fas fa-bolt', parentCategory: '' },
  { name: 'Automotive', slug: 'automotive', icon: 'fas fa-car', parentCategory: '' },
  { name: 'Smartwatches', slug: 'smartwatches', icon: 'fas fa-clock', parentCategory: '' },
  { name: 'Mobile Accessories', slug: 'accessories', icon: 'fas fa-mobile-alt', parentCategory: '' },
];

const PRICE_MAX = 150000;
const PRICE_MIN = 0;

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedRating,
  onSelectRating,
  onReset,
}) => {
  const [categories, setCategories] = useState<SidebarCategory[]>(DEFAULT_CATEGORIES);
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);
  const [minInput, setMinInput] = useState(String(priceRange.min));
  const [maxInput, setMaxInput] = useState(String(priceRange.max));
  const trackRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategories(json.data.map((c: any) => ({
            name: c.name,
            slug: c.slug,
            icon: c.icon || 'fas fa-tag',
            parentCategory: c.parentCategory || '',
            image: c.image || ''
          })));
        }
      } catch {}
    })();
  }, []);

  // Sync if parent resets
  useEffect(() => {
    setLocalMin(priceRange.min);
    setLocalMax(priceRange.max);
    setMinInput(String(priceRange.min));
    setMaxInput(String(priceRange.max));
  }, [priceRange.min, priceRange.max]);

  const applyRange = (min: number, max: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onPriceRangeChange(min, max);
    }, 400);
  };

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), localMax - 500);
    setLocalMin(v);
    setMinInput(String(v));
    applyRange(v, localMax);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), localMin + 500);
    setLocalMax(v);
    setMaxInput(String(v));
    applyRange(localMin, v);
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value);
    const v = parseInt(e.target.value) || 0;
    if (!isNaN(v) && v >= PRICE_MIN && v < localMax) {
      setLocalMin(v);
      applyRange(v, localMax);
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value);
    const v = parseInt(e.target.value) || 0;
    if (!isNaN(v) && v <= PRICE_MAX && v > localMin) {
      setLocalMax(v);
      applyRange(localMin, v);
    }
  };

  const minPct = ((localMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((localMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const hasFilters = !!(selectedCategory || selectedRating || priceRange.max < PRICE_MAX || priceRange.min > PRICE_MIN);

  const section = (children: React.ReactNode) => (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '14px', marginBottom: '10px', border: '1px solid #eef2f7' }}>
      {children}
    </div>
  );

  const sectionTitle = (icon: string, label: string) => (
    <p style={{ margin: '0 0 12px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <i className={icon} style={{ color: 'var(--pd-primary)', fontSize: '11px' }} />
      {label}
    </p>
  );

  return (
    <div>
      {/* Reset */}
      {hasFilters && section(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pd-primary)' }}>
            <i className="fas fa-filter me-1" /> Active Filters
          </span>
          <button onClick={onReset} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, padding: 0,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <i className="fas fa-times" style={{ fontSize: '10px' }} /> Clear All
          </button>
        </div>
      )}

      {/* Categories */}
      {section(<>
        {sectionTitle('fas fa-th-large', 'Categories')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Render All Products first */}
          {(() => {
            const active = selectedCategory === null;
            return (
              <button onClick={() => onSelectCategory(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '7px 10px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                  background: active ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)' : 'transparent',
                  textAlign: 'left', width: '100%', transition: 'background 0.15s',
                  borderLeft: active ? '3px solid var(--pd-primary)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                  background: active ? 'var(--pd-primary)' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-border-all" style={{ fontSize: '10px', color: active ? '#fff' : '#64748b' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: active ? 700 : 500, color: active ? 'var(--pd-primary)' : '#374151' }}>
                  All Products
                </span>
              </button>
            );
          })()}

          {/* Render Root Categories and their Sub-categories */}
          {categories
            .filter(c => !c.parentCategory)
            .map(root => {
              const rootActive = selectedCategory === root.slug;
              const subcats = categories.filter(c => c.parentCategory === root.slug);

              return (
                <div key={root.slug} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Root Category */}
                  <button onClick={() => onSelectCategory(root.slug)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '9px',
                      padding: '7px 10px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                      background: rootActive ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)' : 'transparent',
                      textAlign: 'left', width: '100%', transition: 'background 0.15s',
                      borderLeft: rootActive ? '3px solid var(--pd-primary)' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!rootActive) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!rootActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                      background: rootActive ? 'var(--pd-primary)' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', position: 'relative'
                    }}>
                      {root.image ? (
                        <img
                          src={root.image}
                          alt={root.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <i className={root.icon || 'fas fa-tag'} style={{ fontSize: '10px', color: rootActive ? '#fff' : '#64748b' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: rootActive ? 700 : 500, color: rootActive ? 'var(--pd-primary)' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {root.name}
                    </span>
                  </button>

                  {/* Sub-categories */}
                  {subcats.map(sub => {
                    const subActive = selectedCategory === sub.slug;
                    return (
                      <button key={sub.slug} onClick={() => onSelectCategory(sub.slug)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '5px 10px 5px 28px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                          background: subActive ? 'rgba(var(--pd-primary-rgb,234,88,12),0.05)' : 'transparent',
                          textAlign: 'left', width: '100%', transition: 'background 0.15s',
                          borderLeft: subActive ? '2.5px solid var(--pd-primary)' : '2.5px solid transparent',
                          marginTop: '1px',
                        }}
                        onMouseEnter={e => { if (!subActive) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                        onMouseLeave={e => { if (!subActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <i className="fas fa-level-up-alt fa-rotate-90 text-muted me-1" style={{ fontSize: '9px', opacity: 0.6 }} />
                        <span style={{ fontSize: '0.76rem', fontWeight: subActive ? 700 : 500, color: subActive ? 'var(--pd-primary)' : '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </>)}

      {/* Price Range */}
      {section(<>
        {sectionTitle('fas fa-tag', 'Price Range')}

        {/* Dual range track */}
        <div ref={trackRef} style={{ position: 'relative', height: '32px', marginBottom: '10px' }}>
          {/* Track background */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: '#e2e8f0', borderRadius: '2px', transform: 'translateY(-50%)' }} />
          {/* Active range */}
          <div style={{
            position: 'absolute', top: '50%', height: '4px',
            left: `${minPct}%`, width: `${maxPct - minPct}%`,
            background: 'var(--pd-primary)', borderRadius: '2px', transform: 'translateY(-50%)',
          }} />
          {/* Min thumb */}
          <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={500} value={localMin}
            onChange={handleMinSlider}
            style={{
              position: 'absolute', top: '50%', left: 0, right: 0, width: '100%',
              transform: 'translateY(-50%)', appearance: 'none', background: 'transparent',
              pointerEvents: 'none', height: '4px',
            }}
            className="pd-range-thumb"
          />
          {/* Max thumb */}
          <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={500} value={localMax}
            onChange={handleMaxSlider}
            style={{
              position: 'absolute', top: '50%', left: 0, right: 0, width: '100%',
              transform: 'translateY(-50%)', appearance: 'none', background: 'transparent',
              pointerEvents: 'none', height: '4px',
            }}
            className="pd-range-thumb"
          />
        </div>

        {/* Min/Max inputs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>MIN</div>
            <input type="number" value={minInput} onChange={handleMinInput} min={PRICE_MIN} max={localMax - 500}
              style={{
                width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '6px',
                padding: '5px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#374151',
                outline: 'none', fontFamily: 'var(--pd-font)',
              }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ color: '#cbd5e1', fontWeight: 700, paddingTop: '14px' }}>—</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>MAX</div>
            <input type="number" value={maxInput} onChange={handleMaxInput} min={localMin + 500} max={PRICE_MAX}
              style={{
                width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '6px',
                padding: '5px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#374151',
                outline: 'none', fontFamily: 'var(--pd-font)',
              }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        <style>{`
          .pd-range-thumb { pointer-events: none; }
          .pd-range-thumb::-webkit-slider-thumb {
            pointer-events: all;
            -webkit-appearance: none;
            width: 18px; height: 18px;
            border-radius: 50%;
            background: var(--pd-primary);
            border: 2px solid #fff;
            box-shadow: 0 2px 6px rgba(234,88,12,0.35);
            cursor: pointer;
          }
          .pd-range-thumb::-moz-range-thumb {
            pointer-events: all;
            width: 16px; height: 16px;
            border-radius: 50%;
            background: var(--pd-primary);
            border: 2px solid #fff;
            box-shadow: 0 2px 6px rgba(234,88,12,0.35);
            cursor: pointer;
          }
        `}</style>
      </>)}

      {/* Rating */}
      {section(<>
        {sectionTitle('fas fa-star', 'Rating')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {[4, 3, 2].map(r => (
            <button key={r} onClick={() => onSelectRating(selectedRating === r ? null : r)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 10px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                background: selectedRating === r ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)' : 'transparent',
                textAlign: 'left', width: '100%', transition: 'background 0.15s',
                borderLeft: selectedRating === r ? '3px solid var(--pd-primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (selectedRating !== r) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (selectedRating !== r) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className="fas fa-star" style={{ fontSize: '11px', color: i < r ? '#f59e0b' : '#e2e8f0' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: selectedRating === r ? 700 : 500, color: selectedRating === r ? 'var(--pd-primary)' : '#6b7280' }}>
                {r}★ & above
              </span>
            </button>
          ))}
        </div>
      </>)}
    </div>
  );
};
