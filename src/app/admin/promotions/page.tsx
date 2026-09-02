'use client';

import React from 'react';
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal';
import { useAdminPromotions } from '@/hooks/useAdminPromotions';

export default function AdminPromotionsPage() {
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
    loading,
    saving,
    error,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleSubmit,
    handleToggleActive,
    confirmDelete,
  } = useAdminPromotions();

  if (loading && promos.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
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
                                onChange={() => handleToggleActive(promo._id, promo.isActive)}
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
                              onClick={() => setDeleteTarget({ id: promo._id, code: promo.code })}
                              className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Delete Coupon"
                            >
                              <i className="fas fa-trash-alt small" />
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

        {/* Add Promo Code Panel */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-secondary mb-3 border-bottom pb-2">Create Discount Coupon</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="form-control rounded-3 font-monospace fw-bold"
                  placeholder="e.g. SAVE20"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Discount Percentage *</label>
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="form-select rounded-3 fw-bold text-primary"
                >
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((percent) => (
                    <option key={percent} value={percent}>
                      {percent}% OFF
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="form-control rounded-3"
                />
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="form-check-input"
                  id="couponActiveSwitch"
                />
                <label className="form-check-label small text-muted" htmlFor="couponActiveSwitch">
                  Enable coupon immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-gradient w-100 py-2.5 fw-semibold border-0 text-white rounded-3 shadow"
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" /> Creating...
                  </>
                ) : (
                  'Create Coupon'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Coupon Code?"
        message="Are you sure you want to permanently delete this coupon code?"
        itemName={deleteTarget?.code}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
