'use client';

import React, { useState } from 'react';
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal';
import { useAdminPromotions } from '@/hooks/useAdminPromotions';
import { useAdminCampaignOffers } from '@/hooks/useAdminCampaignOffers';
import { CampaignOfferList } from '@/components/admin/promotions/CampaignOfferList';
import { CampaignOfferEditorModal } from '@/components/admin/promotions/CampaignOfferEditorModal';

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'campaign_banners' | 'coupon_codes'>('campaign_banners');

  // Hook for Coupon Codes
  const promoHook = useAdminPromotions();
  const {
    promos,
    code,
    setCode,
    discountPercent,
    setDiscountPercent,
    expiryDate,
    setExpiryDate,
    isActive,
    setIsActive,
    loading: promoLoading,
    saving: promoSaving,
    error: promoError,
    deleteTarget: promoDeleteTarget,
    setDeleteTarget: setPromoDeleteTarget,
    deleteLoading: promoDeleteLoading,
    handleSubmit: handlePromoSubmit,
    handleToggleActive: handlePromoToggleActive,
    confirmDelete: handlePromoConfirmDelete,
  } = promoHook;

  // Hook for Multi-Product Sale & Bundle Banners
  const campaignHook = useAdminCampaignOffers();

  return (
    <div className="fade-in">
      {/* ── Top Tabs Navigation ─────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center bg-white p-1.5 rounded-pill border shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('campaign_banners')}
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold transition-all ${
              activeTab === 'campaign_banners' ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
            }`}
            style={{ fontSize: '0.84rem' }}
          >
            <i className="fas fa-fire me-1.5 text-warning" />
            Multi-Product Sale & Bundle Banners
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coupon_codes')}
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold transition-all ${
              activeTab === 'coupon_codes' ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted'
            }`}
            style={{ fontSize: '0.84rem' }}
          >
            <i className="fas fa-ticket-alt me-1.5" />
            Promo Coupon Codes
          </button>
        </div>
      </div>

      {/* ── TAB 1: Multi-Product Sale & Bundle Banners ─────────── */}
      {activeTab === 'campaign_banners' && (
        <>
          {campaignHook.error && (
            <div className="alert alert-danger border-0 mb-4" role="alert">
              {campaignHook.error}
            </div>
          )}
          <CampaignOfferList hook={campaignHook} />
          <CampaignOfferEditorModal hook={campaignHook} />
        </>
      )}

      {/* ── TAB 2: Promo Coupon Codes ──────────────────────────── */}
      {activeTab === 'coupon_codes' && (
        <>
          {promoError && (
            <div className="alert alert-danger border-0 mb-4" role="alert">
              {promoError}
            </div>
          )}

          <div className="row g-4">
            {/* Promo Codes list */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <h5 className="fw-bold text-secondary mb-3">Coupon Codes</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small uppercase">
                      <tr>
                        <th>Coupon Code</th>
                        <th>Discount</th>
                        <th>Expiry Date</th>
                        <th>Active Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-4 text-muted">
                            No coupon codes created yet. Create one on the right panel!
                          </td>
                        </tr>
                      ) : (
                        promos.map((promo) => {
                          const isExpired = new Date(promo.expiryDate) < new Date();
                          return (
                            <tr key={promo._id}>
                              <td>
                                <span className="badge bg-secondary font-monospace fs-6 px-2.5 py-1">
                                  {promo.code}
                                </span>
                              </td>
                              <td className="fw-bold text-primary">{promo.discountPercent}% OFF</td>
                              <td>
                                <span className={isExpired ? 'text-danger fw-semibold' : 'text-muted'}>
                                  {new Date(promo.expiryDate).toLocaleDateString()}
                                  {isExpired && ' (Expired)'}
                                </span>
                              </td>
                              <td>
                                <div className="form-check form-switch">
                                  <input
                                    type="checkbox"
                                    checked={promo.isActive}
                                    disabled={isExpired}
                                    onChange={() => handlePromoToggleActive(promo._id, promo.isActive)}
                                    className="form-check-input"
                                    style={{ cursor: isExpired ? 'not-allowed' : 'pointer' }}
                                  />
                                  <label className="form-check-label small text-muted">
                                    {promo.isActive ? 'Active' : 'Disabled'}
                                  </label>
                                </div>
                              </td>
                              <td className="text-end">
                                  <button
                                    type="button"
                                    onClick={() => setPromoDeleteTarget({ id: promo._id, code: promo.code })}
                                    className="btn btn-sm btn-light text-danger rounded-circle"
                                    title="Delete Promo"
                                  >
                                  <i className="fas fa-trash-alt" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Create Promo Code form */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <h5 className="fw-bold text-secondary mb-3">Create New Coupon</h5>
                <form onSubmit={handlePromoSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">COUPON CODE *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SAVE20"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="form-control text-uppercase font-monospace"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">DISCOUNT PERCENTAGE (%) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      placeholder="e.g. 20"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">EXPIRY DATE *</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      id="isActiveSwitch"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="form-check-input"
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="isActiveSwitch" className="form-check-label small text-muted" style={{ cursor: 'pointer' }}>
                      Active Status Immediately
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={promoSaving}
                    className="btn btn-primary w-100 py-2 rounded-3 fw-bold text-white shadow-sm"
                  >
                    {promoSaving ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                    ) : (
                      <i className="fas fa-plus me-2" />
                    )}
                    Save Coupon Code
                  </button>
                </form>
              </div>
            </div>
          </div>

          <DeleteConfirmModal
            isOpen={Boolean(promoDeleteTarget)}
            title="Delete Coupon Code"
            message="Are you sure you want to delete this coupon? This action cannot be undone."
            onCancel={() => setPromoDeleteTarget(null)}
            onConfirm={handlePromoConfirmDelete}
            loading={promoDeleteLoading}
          />
        </>
      )}
    </div>
  );
}
