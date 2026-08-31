'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onCancel,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-body p-4 text-center">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-danger bg-danger bg-opacity-10"
              style={{ width: '56px', height: '56px' }}
            >
              <i className="fas fa-trash-alt" style={{ fontSize: '1.4rem' }} />
            </div>

            <h6 className="fw-bold text-dark mb-1">{title}</h6>

            {itemName && (
              <div className="badge bg-light text-dark border p-2 mb-2 font-monospace text-truncate d-block">
                {itemName}
              </div>
            )}

            <p className="text-muted small mb-4">{message}</p>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm rounded-pill flex-fill"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm rounded-pill flex-fill"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" /> Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
