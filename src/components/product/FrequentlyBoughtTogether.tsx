'use client';

import React from 'react';
import Link from 'next/link';
import { IProduct } from '@/types';
import { useFrequentlyBoughtTogether } from '@/hooks/useFrequentlyBoughtTogether';

export interface FrequentlyBoughtTogetherProps {
  currentProduct: IProduct;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({ currentProduct }) => {
  const {
    companionProduct,
    includeCompanion,
    setIncludeCompanion,
    loading,
    added,
    rawTotal,
    discountSavings,
    bundleFinalPrice,
    handleAddBundle,
  } = useFrequentlyBoughtTogether({ currentProduct });

  if (loading || !companionProduct) return null;

  return (
    <div
      className="pd-card p-3 p-lg-4 mt-3"
      style={{
        background: 'linear-gradient(180deg, #fff 0%, #fffbf7 100%)',
        borderRadius: '12px',
        border: '1.5px solid #fed7aa',
        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)',
      }}
    >
      {/* ── Bundle Header ── */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2.5 mb-3 border-bottom border-orange-100">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 6px rgba(234,88,12,0.3)',
            }}
          >
            <i className="fas fa-layer-group" />
          </span>
          <div>
            <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.02rem', lineHeight: 1.2 }}>
              Frequently Bought Together
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 600 }}>
              ⚡ 1-Click Combo Deal • Save Rs. {discountSavings.toLocaleString()} on this set!
            </span>
          </div>
        </div>

        <span
          className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1"
          style={{ fontSize: '0.72rem', fontWeight: 700 }}
        >
          <i className="fas fa-shipping-fast me-1" /> Free Delivery Included
        </span>
      </div>

      {/* ── Products & Total Calculation Grid ── */}
      <div className="row g-3 align-items-center">
        {/* Dual Products Row */}
        <div className="col-12 col-lg-8">
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            {/* Item 1: Current Product */}
            <div
              className="p-2 rounded-3 border bg-white flex-1"
              style={{ minWidth: 0, borderColor: '#ffedd5' }}
            >
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  disabled
                  className="form-check-input mt-0"
                  style={{ cursor: 'not-allowed', width: '16px', height: '16px' }}
                />
                <span className="badge bg-orange-100 text-orange-700" style={{ fontSize: '0.62rem', background: '#ffedd5', color: '#c2410c' }}>
                  Current Item
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    className="text-truncate fw-bold text-dark"
                    style={{ fontSize: '0.78rem', lineHeight: 1.3 }}
                    title={currentProduct.name}
                  >
                    {currentProduct.name}
                  </div>
                  <div className="fw-bolder text-orange-600" style={{ fontSize: '0.85rem', color: 'var(--pd-primary, #ea580c)' }}>
                    Rs. {currentProduct.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Plus Symbol */}
            <div
              className="text-muted fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#fff',
                border: '1.5px solid #fed7aa',
                color: '#ea580c',
                fontSize: '14px',
              }}
            >
              +
            </div>

            {/* Item 2: Complementary Product */}
            <div
              className="p-2 rounded-3 border bg-white flex-1"
              style={{
                minWidth: 0,
                borderColor: includeCompanion ? '#ffedd5' : '#e2e8f0',
                opacity: includeCompanion ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <input
                  type="checkbox"
                  id="companionCheck"
                  checked={includeCompanion}
                  onChange={(e) => setIncludeCompanion(e.target.checked)}
                  className="form-check-input mt-0"
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label
                  htmlFor="companionCheck"
                  className="badge bg-secondary-subtle text-secondary mb-0"
                  style={{ fontSize: '0.62rem', cursor: 'pointer' }}
                >
                  Recommended Add-on
                </label>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <img
                    src={companionProduct.image}
                    alt={companionProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Link
                    href={`/product/${companionProduct._id}`}
                    className="text-truncate fw-bold text-dark d-block text-decoration-none"
                    style={{ fontSize: '0.78rem', lineHeight: 1.3 }}
                    title={companionProduct.name}
                  >
                    {companionProduct.name}
                  </Link>
                  <div className="fw-bolder text-secondary" style={{ fontSize: '0.85rem' }}>
                    Rs. {companionProduct.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Summary & 1-Click CTA */}
        <div className="col-12 col-lg-4 ps-lg-3 border-start-lg">
          <div className="p-3 bg-white rounded-3 border border-orange-200">
            <div className="d-flex align-items-baseline justify-content-between mb-1">
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Bundle Total:</span>
              <div className="text-end">
                {discountSavings > 0 && (
                  <span
                    className="text-muted text-decoration-line-through me-1.5"
                    style={{ fontSize: '0.74rem' }}
                  >
                    Rs. {rawTotal.toLocaleString()}
                  </span>
                )}
                <span
                  className="fw-bolder"
                  style={{ fontSize: '1.25rem', color: 'var(--pd-primary, #ea580c)' }}
                >
                  Rs. {bundleFinalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {discountSavings > 0 && (
              <div className="mb-2 text-end">
                <span
                  className="badge bg-danger-subtle text-danger border border-danger-subtle"
                  style={{ fontSize: '0.68rem', fontWeight: 800 }}
                >
                  Save Rs. {discountSavings.toLocaleString()} Combo Discount
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddBundle}
              disabled={added}
              className="btn btn-primary w-100 fw-bold py-2 rounded-2 d-flex align-items-center justify-content-center gap-2"
              style={{
                fontSize: '0.84rem',
                background: added ? '#15803d' : 'linear-gradient(135deg, #ea580c, #c2410c)',
                border: 'none',
                boxShadow: '0 3px 10px rgba(234,88,12,0.25)',
              }}
            >
              <i className={`fas ${added ? 'fa-check' : 'fa-layer-group'}`} />
              <span>{added ? 'Both Items Added to Cart!' : '⚡ Add Both to Cart (1-Click)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
