'use client';

import React from 'react';
import Link from 'next/link';
import { useProductAdsAnalytics } from '../../../../hooks/useProductAdsAnalytics';
import { ProductAdsStatsHeader } from '../../../../components/admin/ads/ProductAdsStatsHeader';
import { ProductAdsFilters } from '../../../../components/admin/ads/ProductAdsFilters';
import { ProductAdsListCard } from '../../../../components/admin/ads/ProductAdsListCard';

export default function ProductAdsAnalyticsPage() {
  const {
    scope,
    setScope,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    error,
    products,
    categories,
    summary,
    refetch,
  } = useProductAdsAnalytics();

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link href="/admin/products" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
              <i className="fas fa-arrow-left me-1" /> Products
            </Link>
            <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>
              Product Ads &amp; Sales Analytics
            </h3>
            <span className="badge bg-danger rounded-pill px-2.5 py-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
              Pakistan Ad Radar
            </span>
          </div>
          <p className="text-muted small mb-0" style={{ fontSize: '0.85rem' }}>
            Live Pakistan Meta/TikTok ad intelligence, order sales velocity, and competitor marketing angles.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1.5"
            style={{ fontSize: '0.82rem' }}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Radar'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center gap-2">
          <i className="fas fa-exclamation-circle text-danger" />
          <span className="small fw-semibold">{error}</span>
        </div>
      )}

      {/* Stats KPI Header */}
      <ProductAdsStatsHeader summary={summary} scope={scope} />

      {/* Filters Bar */}
      <ProductAdsFilters
        scope={scope}
        setScope={setScope}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        totalResults={products.length}
      />

      {/* Loading Skeleton */}
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Analyzing Pakistan Ad Creatives...</span>
          </div>
          <p className="text-muted fw-semibold mb-1">Scanning Pakistan Meta &amp; TikTok Ad Libraries...</p>
          <span className="text-muted small">Matching store catalog products &amp; sales velocity</span>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 p-4 bg-white">
          <div
            className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: '64px', height: '64px' }}
          >
            <i className="fas fa-search text-muted fs-3" />
          </div>
          <h5 className="fw-bold text-dark mb-1">No Matching Products Found</h5>
          <p className="text-muted small mb-3">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your category filter or search query.'
              : scope === 'my_products'
              ? 'You have not added any products to your store catalog yet.'
              : 'No market competitor products found.'}
          </p>
          {scope === 'my_products' && (
            <div className="d-flex justify-content-center gap-2">
              <Link href="/admin/products/new" className="btn btn-sm btn-primary rounded-pill px-3">
                <i className="fas fa-plus me-1" /> Add Product to Store
              </Link>
              <button
                type="button"
                onClick={() => setScope('all')}
                className="btn btn-sm btn-outline-dark rounded-pill px-3"
              >
                Browse All Market Trends
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Products List (Ranked Descending by Ads in Pakistan) */
        <div className="product-ads-list">
          {products.map((product, idx) => (
            <ProductAdsListCard key={product.id} product={product} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
