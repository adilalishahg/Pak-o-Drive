'use client';

import React from 'react';
import { ProductAdsScope, ProductAdsSortBy } from '../../../types/productAds';

interface ProductAdsFiltersProps {
  scope: ProductAdsScope;
  setScope: (s: ProductAdsScope) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: ProductAdsSortBy;
  setSortBy: (s: ProductAdsSortBy) => void;
  categories: string[];
  totalResults: number;
}

export function ProductAdsFilters({
  scope,
  setScope,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  categories,
  totalResults,
}: ProductAdsFiltersProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
      <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3">
        {/* Left: Scope Switcher (Meri Products vs All Over) */}
        <div className="d-flex align-items-center gap-1.5 p-1 bg-light rounded-pill border" style={{ width: 'fit-content' }}>
          <button
            type="button"
            onClick={() => setScope('my_products')}
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
              scope === 'my_products'
                ? 'btn-dark text-white shadow-sm'
                : 'text-muted border-0 bg-transparent'
            }`}
            style={{ fontSize: '0.82rem' }}
          >
            <i className="fas fa-store me-1.5" />
            Meri Products ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
              scope === 'all'
                ? 'btn-dark text-white shadow-sm'
                : 'text-muted border-0 bg-transparent'
            }`}
            style={{ fontSize: '0.82rem' }}
          >
            <i className="fas fa-globe me-1.5" />
            All Over (Market Trends)
          </button>
        </div>

        {/* Right: Category, Search & Sort */}
        <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1 justify-content-lg-end">
          {/* Category Dropdown */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select form-select-sm rounded-pill border"
              style={{ fontSize: '0.82rem', height: '36px' }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="position-relative flex-grow-1 flex-sm-grow-0" style={{ minWidth: '180px' }}>
            <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.8rem' }} />
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control form-control-sm rounded-pill ps-5"
              style={{ fontSize: '0.82rem', height: '36px' }}
            />
          </div>

          {/* Sort By Dropdown */}
          <div style={{ minWidth: '170px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductAdsSortBy)}
              className="form-select form-select-sm rounded-pill border fw-semibold"
              style={{ fontSize: '0.82rem', height: '36px' }}
            >
              <option value="ads_desc">🔥 Active Ads (High to Low)</option>
              <option value="demand_desc">⚡ Demand Score (Highest)</option>
              <option value="sales_desc">🛍️ Sales Units (Highest)</option>
              <option value="price_desc">💰 Price (High to Low)</option>
              <option value="price_asc">🏷️ Price (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scope Help Note */}
      <div className="mt-2.5 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small" style={{ fontSize: '0.75rem' }}>
        <span>
          {scope === 'my_products' ? (
            <>
              <i className="fas fa-info-circle me-1 text-primary" />
              Showing <b>your active store products</b> sorted by live ad campaigns running in Pakistan.
            </>
          ) : (
            <>
              <i className="fas fa-info-circle me-1 text-warning" />
              Showing <b>store products + competitor viral products</b> across all store categories.
            </>
          )}
        </span>
        <span className="text-secondary fw-semibold">
          Sorted by: <span className="text-danger fw-bold">Active Ads in Pakistan (Desc)</span>
        </span>
      </div>
    </div>
  );
}
