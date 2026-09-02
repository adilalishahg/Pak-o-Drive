import React from 'react';

export function OrderEmptyState() {
  return (
    <div className="text-center py-5">
      <i className="fas fa-box-open fa-3x text-muted mb-3 d-block" />
      <h5 className="text-muted fw-bold">No orders found</h5>
      <p className="text-muted small mb-0">
        Make sure you entered the correct email or phone number used at checkout.
      </p>
    </div>
  );
}
