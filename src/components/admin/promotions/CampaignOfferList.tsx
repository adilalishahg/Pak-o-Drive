'use client';

import React from 'react';
import Image from 'next/image';
import { useAdminCampaignOffers } from '@/hooks/useAdminCampaignOffers';
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal';

interface CampaignOfferListProps {
  hook: ReturnType<typeof useAdminCampaignOffers>;
}

export function CampaignOfferList({ hook }: CampaignOfferListProps) {
  const {
    offers,
    loading,
    setIsModalOpen,
    handleEdit,
    handleToggleActive,
    deleteTarget,
    setDeleteTarget,
    handleDelete,
  } = hook;

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold text-dark mb-0 leading-normal py-0.5">
            🔥 Multi-Product Sale & Bundle Banners
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
            Active banners appear prominently on the Homepage with live countdown timers & product pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
          style={{ fontSize: '0.84rem' }}
        >
          <i className="fas fa-plus" />
          <span>Create New Offer Banner</span>
        </button>
      </div>

      {loading && offers.length === 0 ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center p-5 bg-light rounded-4 border">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-warning" style={{ width: '48px', height: '48px', background: '#fef3c7' }}>
            <i className="fas fa-bullhorn fs-5" />
          </div>
          <h6 className="fw-bold text-dark mb-1">No Sale Banners Created Yet</h6>
          <p className="text-muted small mb-3">
            Combine 2 or more products into a flash sale or combo package to boost your conversions!
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
          >
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small uppercase">
              <tr>
                <th>Offer Details</th>
                <th>Mode</th>
                <th>Products</th>
                <th>Total / Bundle Price</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const isExpired = offer.expiryDate && new Date(offer.expiryDate) < new Date();
                return (
                  <tr key={offer._id}>
                    <td>
                      <div>
                        <span className="badge bg-warning text-dark rounded-pill px-2 py-0.5 mb-1 fw-bold" style={{ fontSize: '0.68rem' }}>
                          {offer.badge}
                        </span>
                        <h6 className="fw-bold text-dark mb-0 leading-normal py-0.5" style={{ fontSize: '0.92rem' }}>
                          {offer.title}
                        </h6>
                        <div className="d-flex align-items-center gap-1 flex-wrap mt-0.5">
                          <span className="badge bg-light text-secondary border rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                            <i className="fas fa-map-marker-alt me-1 text-primary" />
                            {offer.placement === 'below_slider'
                              ? 'Top (Below Slider)'
                              : offer.placement === 'after_first_category'
                              ? 'After 1st Category'
                              : offer.placement === 'after_specific_category'
                              ? `After "${offer.targetCategorySlug || 'Category'}"`
                              : offer.placement === 'middle_promotions'
                              ? 'Middle Section'
                              : offer.placement === 'before_why_us'
                              ? 'Bottom (Before Why Us)'
                              : 'Top (Below Slider)'}
                          </span>
                          {offer.expiryDate && (
                            <span className={`small ${isExpired ? 'text-danger fw-bold' : 'text-muted'}`} style={{ fontSize: '0.72rem' }}>
                              <i className="fas fa-clock me-1" />
                              {isExpired ? 'Expired' : `Ends: ${new Date(offer.expiryDate).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge rounded-pill px-2.5 py-1 fw-semibold ${offer.offerType === 'combo_bundle' ? 'bg-primary' : 'bg-danger'}`} style={{ fontSize: '0.72rem' }}>
                        {offer.offerType === 'combo_bundle' ? '📦 Combo Bundle' : '🔥 Flash Sale'}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-1">
                        {offer.products?.slice(0, 4).map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="position-relative rounded-2 overflow-hidden border shadow-xs"
                            style={{ width: '32px', height: '32px', background: '#f8fafc' }}
                            title={p.name}
                          >
                            <Image src={p.image} alt={p.name} fill sizes="32px" style={{ objectFit: 'cover' }} />
                          </div>
                        ))}
                        {offer.products?.length > 4 && (
                          <span className="badge bg-light text-muted border rounded-circle p-1 small" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            +{offer.products.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className="fw-bold text-success fs-6">
                          Rs. {(offer.bundlePrice || offer.products?.reduce((a: any, b: any) => a + (b.offerPrice || 0), 0)).toLocaleString()}
                        </span>
                        {offer.bundleOriginalPrice > 0 && (
                          <div className="text-muted text-decoration-line-through small" style={{ fontSize: '0.72rem' }}>
                            Rs. {offer.bundleOriginalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          disabled={isExpired}
                          onChange={() => handleToggleActive(offer._id, offer.isActive)}
                          className="form-check-input"
                          style={{ cursor: isExpired ? 'not-allowed' : 'pointer' }}
                        />
                        <label className="form-check-label small text-muted">
                          {offer.isActive ? 'Active on Home' : 'Disabled'}
                        </label>
                      </div>
                    </td>

                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(offer)}
                          className="btn btn-sm btn-light rounded-circle"
                          title="Edit Offer"
                        >
                          <i className="fas fa-edit text-secondary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(offer._id)}
                          className="btn btn-sm btn-light text-danger rounded-circle"
                          title="Delete Offer"
                        >
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Sale Offer Banner"
        message="Are you sure you want to delete this offer banner? It will be removed from the homepage."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
