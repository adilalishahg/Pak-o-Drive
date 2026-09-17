'use client';

import React, { Suspense } from 'react';
import { CategorySidebar } from '../product/CategorySidebar';
import { ProductCardAuto } from '../product/ProductCardAuto';
import { ProductCardList } from '../product/ProductCardList';
import { ShopClientProps } from '@/types/product';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { useShopFilters } from '@/hooks/useShopFilters';
import { ShopBreadcrumbBar } from './ShopBreadcrumbBar';
import { ShopToolbar } from './ShopToolbar';
import { ShopActiveFilters } from './ShopActiveFilters';
import { ShopMobileFilterDrawer } from './ShopMobileFilterDrawer';

function ShopContent({ initialProducts }: ShopClientProps) {
  const { theme } = useSiteTheme();
  const isCleanWhite = theme.layoutTheme === 'theme1';
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const bg = isCleanWhite ? '#f8fafc' : isModernGreen ? '#f7f5ed' : '#f5f7fa';

  const {
    sortedProducts: sorted,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
    selectedRating,
    setSelectedRating,
    sortBy,
    setSortBy,
    keywords,
    setKeywords,
    viewMode,
    setViewMode,
    mobileFilterOpen,
    setMobileFilterOpen,
    handleReset,
    hasFilters,
  } = useShopFilters({ initialProducts });

  // Lock background scroll when mobile filter drawer is open
  React.useEffect(() => {
    if (!mobileFilterOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow || '';
    };
  }, [mobileFilterOpen]);

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {/* Breadcrumb Header Bar */}
      <ShopBreadcrumbBar
        selectedCategory={selectedCategory}
        loading={loading}
        totalProductsCount={sorted.length}
      />

      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        gap: '24px',
        padding: '16px 12px 140px',
        alignItems: 'flex-start'
      }}>
        {/* Sidebar (Desktop) */}
        <div className="d-none d-lg-block" style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
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

        {/* Products Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <ShopToolbar
            keywords={keywords}
            setKeywords={setKeywords}
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            loading={loading}
            sortedLength={sorted.length}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            setMobileFilterOpen={setMobileFilterOpen}
            hasFilters={hasFilters}
          />

          {/* Active Filter Chips */}
          {hasFilters && (
            <ShopActiveFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setKeywords={setKeywords}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              handleReset={handleReset}
            />
          )}

          {/* Products Grid / List */}
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

      {/* Mobile Filter Drawer */}
      <ShopMobileFilterDrawer
        mobileFilterOpen={mobileFilterOpen}
        setMobileFilterOpen={setMobileFilterOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        handleReset={handleReset}
        sortedLength={sorted.length}
      />
    </div>
  );
}

export function ShopClient({ initialProducts }: ShopClientProps) {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    }>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
