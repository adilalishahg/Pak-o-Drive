'use client';

import React from 'react';
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal';
import { useAdminSubscribers } from '@/hooks/useAdminSubscribers';

export default function AdminSubscribersPage() {
  const {
    subscribers,
    filteredSubscribers,
    loading,
    error,
    success,
    searchQuery,
    setSearchQuery,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    confirmDelete,
  } = useAdminSubscribers();

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-secondary mb-0">Newsletter Subscribers</h5>
            <p className="text-muted small mb-0 mt-1">
              Manage website audience, newsletter leads, and email subscription lists.
            </p>
          </div>
          <div className="badge bg-primary px-3 py-2 rounded-pill fs-6 fw-semibold" style={{ width: 'fit-content' }}>
            {subscribers.length} Subscribers
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          <i className="fas fa-exclamation-circle me-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success border-0 mb-4" role="alert">
          <i className="fas fa-check-circle me-2" />
          {success}
        </div>
      )}

      {/* Main card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        {/* Search filter */}
        <div className="mb-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
              <i className="fas fa-search" />
            </span>
            <input
              type="text"
              placeholder="Search by email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control border-start-0 rounded-end-3 py-2"
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-envelope-open fa-3x text-muted mb-3" />
            <p className="text-muted mb-0">
              {searchQuery ? 'No matching subscribers found.' : 'No subscribers found.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="py-3 px-4 text-muted small fw-bold text-uppercase">Email Address</th>
                  <th scope="col" className="py-3 text-muted small fw-bold text-uppercase">Subscribed On</th>
                  <th scope="col" className="py-3 px-4 text-end text-muted small fw-bold text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr key={sub._id}>
                    <td className="px-4 py-3 fw-medium text-dark">{sub.email}</td>
                    <td className="py-3 text-muted">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: sub._id, email: sub.email })}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        title="Delete Subscriber"
                      >
                        <i className="fas fa-trash-alt me-1.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove Subscriber?"
        message="Are you sure you want to permanently remove this subscriber from the mailing list?"
        itemName={deleteTarget?.email}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
