'use client';

import React from 'react';
import { BotConfirmDialogsProps } from '@/types/whatsapp';

export function BotConfirmDialogs({

  deleteConfirmId,
  onCancelDelete,
  onConfirmDelete,
  logoutConfirmOpen,
  onCancelLogout,
  onConfirmLogout,
}: BotConfirmDialogsProps) {
  return (
    <>
      {/* Delete Rule Modal */}
      {deleteConfirmId && (
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
                  style={{ width: '54px', height: '54px' }}
                >
                  <i className="fas fa-trash-alt" style={{ fontSize: '1.4rem' }} />
                </div>
                <h6 className="fw-bold text-dark mb-1">Delete Auto-Reply Rule?</h6>
                <p className="text-muted small mb-4">
                  This rule will be permanently removed from the WhatsApp engine.
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-pill flex-fill"
                    onClick={onCancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm rounded-pill flex-fill"
                    onClick={onConfirmDelete}
                  >
                    Delete Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout / Disconnect Modal */}
      {logoutConfirmOpen && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-warning bg-warning bg-opacity-10"
                  style={{ width: '54px', height: '54px' }}
                >
                  <i className="fas fa-power-off" style={{ fontSize: '1.4rem' }} />
                </div>
                <h6 className="fw-bold text-dark mb-1">Disconnect WhatsApp?</h6>
                <p className="text-muted small mb-4">
                  Are you sure you want to disconnect WhatsApp and wipe the saved Baileys session credentials?
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-pill flex-fill"
                    onClick={onCancelLogout}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm rounded-pill flex-fill"
                    onClick={onConfirmLogout}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
