'use client';

import React from 'react';
import Link from 'next/link';
import { IProduct } from '@/types';
import { ProductCardAuto } from '../product/ProductCardAuto';

interface HomeProductTabsProps {
  products: IProduct[];
  activeTab: 'all' | 'new' | 'featured' | 'selling';
  onTabChange: (tab: 'all' | 'new' | 'featured' | 'selling') => void;
  filteredProducts: IProduct[];
}

export function HomeProductTabs({ activeTab, onTabChange, filteredProducts }: HomeProductTabsProps) {
  const tabs: { key: 'all' | 'new' | 'featured' | 'selling'; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'new', label: 'New Arrivals' },
    { key: 'featured', label: 'Featured' },
    { key: 'selling', label: 'Top Selling' },
  ];

  return (
    <section className="py-5">
      <div className="container-fluid px-3 px-lg-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Explore Catalog</h4>
            <p className="text-muted small mb-0">Browse latest deals, top sellers, and new arrivals</p>
          </div>

          {/* Tabs Filter */}
          <div className="d-flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold transition-all ${
                  activeTab === t.key
                    ? 'btn-dark text-white shadow-sm'
                    : 'btn-outline-secondary border text-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5 border rounded-4 bg-light">
            <i className="fas fa-box-open fa-3x text-muted mb-3" />
            <h6 className="text-muted">No products found in this tab.</h6>
            <button
              type="button"
              onClick={() => onTabChange('all')}
              className="btn btn-sm btn-primary rounded-pill mt-2 px-4"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="row g-3 g-md-4">
            {filteredProducts.map((p) => (
              <div key={p._id} className="col-6 col-md-4 col-lg-3 fade-in">
                <ProductCardAuto product={p} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5">
          <Link
            href="/shop"
            className="btn btn-outline-dark rounded-pill px-4 py-2 fw-semibold text-decoration-none"
          >
            View Entire Shop Collection <i className="fas fa-arrow-right ms-2 small" />
          </Link>
        </div>
      </div>
    </section>
  );
}
