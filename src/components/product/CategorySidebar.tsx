'use client';

import React, { useState, useEffect } from 'react';
import { CategorySidebarProps } from '@/types/product';
import { useCategorySidebar, PRICE_MAX, PRICE_MIN } from '@/hooks/useCategorySidebar';
import { CategoryIcon } from '@/components/common/ThemeIcon';
import { buildCategoryTree, CategoryTreeNode } from '@/lib/categoryTree';
import { getBestCategoryIcon } from '@/lib/categoryIconService';

/**
 * Recursive Category Sidebar Node Component
 * Supports infinite depth (Category -> Sub -> Sub -> Sub...) with collapsible carets
 */
const RecursiveSidebarNode: React.FC<{
  node: CategoryTreeNode;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  depth: number;
}> = ({ node, selectedCategory, onSelectCategory, depth }) => {
  const isDirectActive = selectedCategory === node.slug;
  const childList = node.children || [];
  const hasChildren = childList.length > 0;
  const [imageError, setImageError] = useState(false);

  const resolvedIcon =
    node.icon && node.icon !== 'fas fa-tag' && node.icon !== 'fas fa-box'
      ? node.icon
      : getBestCategoryIcon(node.slug || node.name);

  // Check if any descendant is currently selected
  const hasActiveDescendant = React.useMemo(() => {
    if (!selectedCategory) return false;
    function checkNode(n: CategoryTreeNode): boolean {
      if (n.slug === selectedCategory) return true;
      return (n.children || []).some(checkNode);
    }
    return (node.children || []).some(checkNode);
  }, [node, selectedCategory]);

  // Expand if active or has active child
  const [expanded, setExpanded] = useState(isDirectActive || hasActiveDescendant || depth === 0);

  useEffect(() => {
    if (isDirectActive || hasActiveDescendant) {
      setExpanded(true);
    }
  }, [isDirectActive, hasActiveDescendant]);

  const paddingLeft = depth === 0 ? '10px' : `${10 + depth * 14}px`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '7px',
          background: isDirectActive
            ? 'rgba(var(--pd-primary-rgb,234,88,12),0.08)'
            : hasActiveDescendant
            ? 'rgba(0,0,0,0.02)'
            : 'transparent',
          borderLeft: isDirectActive ? '3px solid var(--pd-primary)' : '3px solid transparent',
          transition: 'background 0.15s',
          marginTop: '1px',
        }}
      >
        <button
          type="button"
          onClick={() => onSelectCategory(node.slug)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: depth === 0 ? '7px 6px 7px 10px' : `5px 6px 5px ${paddingLeft}`,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            flex: 1,
            minWidth: 0,
          }}
          title={node.name}
        >
          {depth === 0 ? (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                flexShrink: 0,
                background: isDirectActive ? 'var(--pd-primary)' : 'rgba(var(--pd-primary-rgb,234,88,12),0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {node.image && !imageError ? (
                <img
                  src={node.image}
                  alt={node.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <CategoryIcon
                  icon={resolvedIcon}
                  style={{
                    fontSize: '11px',
                    color: isDirectActive ? '#fff' : 'var(--pd-primary, #ea580c)',
                  }}
                />
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', color: isDirectActive ? 'var(--pd-primary)' : '#94a3b8' }}>
                {'↳'.repeat(Math.min(depth, 3))}
              </span>
              <CategoryIcon
                icon={resolvedIcon}
                style={{
                  fontSize: '9px',
                  color: isDirectActive ? 'var(--pd-primary)' : '#94a3b8',
                }}
              />
            </div>
          )}

          <span
            style={{
              fontSize: depth === 0 ? '0.8rem' : '0.76rem',
              fontWeight: isDirectActive ? 700 : hasActiveDescendant ? 600 : 500,
              color: isDirectActive
                ? 'var(--pd-primary)'
                : hasActiveDescendant
                ? '#1e293b'
                : '#4b5563',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.name}
          </span>
        </button>

        {/* Right side: Count badge & Expand Caret */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '8px' }}>
          {node.totalProductCount > 0 && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: isDirectActive ? 'var(--pd-primary)' : '#94a3b8',
                background: isDirectActive ? 'rgba(var(--pd-primary-rgb,234,88,12),0.12)' : '#f1f5f9',
                padding: '1px 5px',
                borderRadius: '8px',
              }}
            >
              {node.totalProductCount}
            </span>
          )}

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '4px',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              <i
                className="fas fa-chevron-right"
                style={{
                  fontSize: '9px',
                  transition: 'transform 0.2s ease',
                  transform: expanded ? 'rotate(90deg)' : 'none',
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Render Nested Children */}
      {hasChildren && expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {childList.map((child) => (
            <RecursiveSidebarNode
              key={child.slug}
              node={child}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedRating,
  onSelectRating,
  onReset,
}) => {
  const {
    categories,
    localMin,
    localMax,
    minInput,
    maxInput,
    minPct,
    maxPct,
    hasFilters,
    trackRef,
    handleMinSlider,
    handleMaxSlider,
    handleMinInput,
    handleMaxInput,
  } = useCategorySidebar({
    selectedCategory,
    priceRange,
    onPriceRangeChange,
    selectedRating,
  });

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

          {/* Render Recursive N-Level Categories */}
          {buildCategoryTree(categories).map((rootNode) => (
            <RecursiveSidebarNode
              key={rootNode.slug}
              node={rootNode}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              depth={0}
            />
          ))}
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
