'use client';

import React from 'react';
import Image from 'next/image';
import { useAdminCampaignOffers } from '@/hooks/useAdminCampaignOffers';

interface CampaignOfferEditorModalProps {
  hook: ReturnType<typeof useAdminCampaignOffers>;
}

export function CampaignOfferEditorModal({ hook }: CampaignOfferEditorModalProps) {
  const {
    form,
    setForm,
    editingId,
    isModalOpen,
    saving,
    filteredCatalog,
    catalogSearch,
    setCatalogSearch,
    calculatedOriginalSum,
    calculatedOfferSum,
    overallDiscountPercent,
    handleToggleProduct,
    handleProductOfferPriceChange,
    handleResetForm,
    handleSubmit,
  } = hook;

  if (!isModalOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1060, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white w-100"
        style={{ maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="p-3 px-4 border-bottom bg-light d-flex align-items-center justify-content-between">
          <div>
            <h5 className="fw-bold text-dark mb-0 leading-normal py-0.5">
              {editingId ? 'Edit Sale Offer Banner' : 'Create Multi-Product Sale & Bundle Banner'}
            </h5>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              Select 2 or more products, configure discount or bundle price, and publish to homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetForm}
            className="btn btn-sm btn-light rounded-circle border-0 d-flex align-items-center justify-content-center p-2"
            style={{ width: '32px', height: '32px' }}
          >
            <i className="fas fa-times text-muted" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto flex-grow-1">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Title & Badge */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-7">
                <label className="form-label small fw-bold text-secondary">Offer Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramadan Special Auto Deal, Weekend Flash Sale"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-control rounded-3"
                />
              </div>
              <div className="col-12 col-md-5">
                <label className="form-label small fw-bold text-secondary">Badge Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. 🔥 MEGA DEAL 30% OFF"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="form-control rounded-3"
                />
              </div>
            </div>

            {/* Row 2: Subtitle & Offer Type */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-7">
                <label className="form-label small fw-bold text-secondary">Offer Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Limited stock available! Best rates across Pakistan."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="form-control rounded-3"
                />
              </div>

              <div className="col-12 col-md-5">
                <label className="form-label small fw-bold text-secondary">Offer Mode (Hybrid)</label>
                <select
                  value={form.offerType}
                  onChange={(e) => setForm({ ...form, offerType: e.target.value as any })}
                  className="form-select rounded-3 fw-semibold"
                >
                  <option value="flash_sale">🔥 Multi-Product Flash Sale (Individual Discounts)</option>
                  <option value="combo_bundle">📦 Combo Bundle Deal (Single Package Price)</option>
                </select>
              </div>
            </div>

            {/* ── Product Selection Section ── */}
            <div className="card border rounded-4 p-3 bg-light mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-boxes text-primary" />
                  <h6 className="fw-bold text-dark mb-0 leading-normal py-0.5">
                    Select Products ({form.products.length} Selected)
                  </h6>
                </div>
                <span className="badge bg-primary rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                  Min 2 Products Required
                </span>
              </div>

              {/* Product Search Box */}
              <div className="input-group mb-3">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted" style={{ fontSize: '0.8rem' }} />
                </span>
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="form-control border-start-0 shadow-none"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Catalog Selection Checklist */}
              <div
                className="d-flex flex-wrap gap-2 mb-3 p-2 bg-white rounded-3 border overflow-y-auto"
                style={{ maxHeight: '140px' }}
              >
                {filteredCatalog.map((prod) => {
                  const isSelected = form.products.some((p) => p.productId === String(prod._id));
                  return (
                    <button
                      key={String(prod._id)}
                      type="button"
                      onClick={() => handleToggleProduct(prod)}
                      className={`btn btn-xs rounded-pill d-flex align-items-center gap-2 p-1.5 pe-2.5 transition-all ${
                        isSelected
                          ? 'btn-primary text-white shadow-xs'
                          : 'btn-outline-secondary bg-light text-dark'
                      }`}
                      style={{ fontSize: '0.76rem' }}
                    >
                      <div
                        className="rounded-circle overflow-hidden position-relative flex-shrink-0"
                        style={{ width: '22px', height: '22px', background: '#e2e8f0' }}
                      >
                        <Image src={prod.image || '/img/product-placeholder.png'} alt={prod.name} fill sizes="22px" style={{ objectFit: 'cover' }} />
                      </div>
                      <span className="text-truncate" style={{ maxWidth: '160px' }}>{prod.name}</span>
                      <i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'} small ms-1`} />
                    </button>
                  );
                })}
              </div>

              {/* Selected Products Table (Rate Configuration) */}
              {form.products.length > 0 && (
                <div className="table-responsive bg-white rounded-3 border">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                    <thead className="table-light text-muted small">
                      <tr>
                        <th>Product</th>
                        <th style={{ width: '130px' }}>Original Price</th>
                        <th style={{ width: '150px' }}>Deal Price (PKR)</th>
                        <th style={{ width: '90px' }}>Discount</th>
                        <th style={{ width: '40px' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {form.products.map((p) => (
                        <tr key={p.productId}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-2 overflow-hidden position-relative flex-shrink-0 border"
                                style={{ width: '36px', height: '36px' }}
                              >
                                <Image src={p.image} alt={p.name} fill sizes="36px" style={{ objectFit: 'cover' }} />
                              </div>
                              <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-muted text-decoration-line-through">
                            Rs. {p.originalPrice.toLocaleString()}
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text py-0">Rs.</span>
                              <input
                                type="number"
                                min={1}
                                value={p.offerPrice}
                                onChange={(e) =>
                                  handleProductOfferPriceChange(p.productId, Number(e.target.value) || 0)
                                }
                                className="form-control form-control-sm fw-bold text-success"
                              />
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-danger rounded-pill px-2 py-0.5">
                              {p.discountPercent || 0}% OFF
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              onClick={() => handleToggleProduct({ _id: p.productId } as any)}
                              className="btn btn-link text-danger p-0 text-decoration-none"
                              title="Remove Product"
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* If Combo Bundle Mode: Set overall bundle package price */}
            {form.offerType === 'combo_bundle' && (
              <div className="card border-primary border-2 rounded-4 p-3 bg-primary bg-opacity-10 mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold text-primary mb-0 leading-normal py-0.5">
                    📦 Combo Package Bundle Price
                  </h6>
                  <span className="small text-muted">
                    Original Combined: <s>Rs. {calculatedOriginalSum.toLocaleString()}</s>
                  </span>
                </div>
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-bold text-dark">Bundle Sale Price (PKR) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white fw-bold">Rs.</span>
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder={String(calculatedOfferSum)}
                        value={form.bundlePrice || ''}
                        onChange={(e) => setForm({ ...form, bundlePrice: Number(e.target.value) || 0 })}
                        className="form-control fw-bold text-success"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-2.5 bg-white rounded-3 border text-center">
                      <span className="text-muted small">Customer Saves:</span>
                      <h6 className="text-danger fw-bold mb-0">
                        Rs. {Math.max(0, calculatedOriginalSum - (form.bundlePrice || calculatedOfferSum)).toLocaleString()} ({overallDiscountPercent}% OFF)
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Row 3: Countdown Timer & Background Theme */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-secondary">
                  <i className="fas fa-stopwatch me-1 text-warning" />
                  Countdown Expiry (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="form-control rounded-3"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-secondary">Banner Theme</label>
                <select
                  value={form.bgTheme}
                  onChange={(e) => setForm({ ...form, bgTheme: e.target.value as any })}
                  className="form-select rounded-3"
                >
                  <option value="dark_slate">🌑 Dark Slate / Charcoal (High Contrast)</option>
                  <option value="sunset_orange">🌅 Sunset Orange / Flame Gradient</option>
                  <option value="emerald_gold">🌲 Emerald Green & Gold</option>
                  <option value="midnight_blue">🌌 Midnight Blue & Cyan</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-secondary">Button CTA Text</label>
                <input
                  type="text"
                  placeholder="e.g. Claim Offer Now"
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                  className="form-control rounded-3"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="form-check form-switch mb-4">
              <input
                type="checkbox"
                id="activeBannerSwitch"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="form-check-input"
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="activeBannerSwitch" className="form-check-label fw-bold text-dark small" style={{ cursor: 'pointer' }}>
                Publish Immediately (Make this the Active Banner on Homepage)
              </label>
            </div>

            {/* Submit & Cancel Footer */}
            <div className="d-flex align-items-center justify-content-end gap-2 border-top pt-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="btn btn-light rounded-pill px-4"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || form.products.length < 2}
                className="btn btn-primary rounded-pill px-5 fw-bold text-white shadow-sm"
              >
                {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Publish Offer Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
