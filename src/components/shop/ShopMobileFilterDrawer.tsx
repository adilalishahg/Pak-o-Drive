'use client';

import React from 'react';
import { CategorySidebar } from '../product/CategorySidebar';

interface ShopMobileFilterDrawerProps {
  mobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
  handleReset: () => void;
  sortedLength: number;
}

export function ShopMobileFilterDrawer({
  mobileFilterOpen,
  setMobileFilterOpen,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  selectedRating,
  setSelectedRating,
  handleReset,
  sortedLength,
}: ShopMobileFilterDrawerProps) {
  if (!mobileFilterOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setMobileFilterOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Drawer Card */}
      <div
        data-lenis-prevent="true"
        style={{
          position: 'relative',
          zIndex: 9999,
          background: '#fff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          touchAction: 'pan-y',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Drawer Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-sliders-h text-primary" style={{ fontSize: '14px' }} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Filter Products</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(false)}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
            }}
          >
            <i className="fas fa-times" style={{ fontSize: '13px' }} />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div style={{
          flex: '1 1 0%',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          padding: '16px 20px',
          touchAction: 'pan-y',
        }}>
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

        {/* Drawer Footer Actions */}
        <div style={{
          padding: '12px 20px 24px', borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: '10px', background: '#fff', flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => {
              handleReset();
              setMobileFilterOpen(false);
            }}
            style={{
              flex: 1, border: '1.5px solid #cbd5e1', borderRadius: '10px',
              padding: '10px', fontWeight: 700, fontSize: '0.84rem',
              color: '#475569', background: '#fff', cursor: 'pointer'
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(false)}
            className="btn-gradient"
            style={{
              flex: 2, border: 'none', borderRadius: '10px',
              padding: '10px', fontWeight: 800, fontSize: '0.84rem',
              color: '#fff', cursor: 'pointer'
            }}
          >
            Show Results ({sortedLength})
          </button>
        </div>
      </div>
    </div>
  );
}
