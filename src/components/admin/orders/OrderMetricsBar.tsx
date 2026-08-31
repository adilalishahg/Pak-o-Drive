'use client';

import React from 'react';
import { OrderData } from '../../../hooks/useAdminOrders';

interface OrderMetricsBarProps {
  orders: OrderData[];
}

export function OrderMetricsBar({ orders }: OrderMetricsBarProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const processingOrders = orders.filter((o) => o.status === 'Processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'Shipped' || o.status === 'On the Way').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <div className="row g-3 mb-4">
      {/* Total Orders */}
      <div className="col-6 col-md-3 col-xl-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
              Total Orders
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
              style={{ width: '28px', height: '28px' }}
            >
              <i className="fas fa-shopping-bag" style={{ fontSize: '0.75rem' }} />
            </div>
          </div>
          <h4 className="fw-bold text-dark mb-0">{totalOrders}</h4>
        </div>
      </div>

      {/* Pending COD */}
      <div className="col-6 col-md-3 col-xl-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
              Pending COD
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-15 text-warning"
              style={{ width: '28px', height: '28px' }}
            >
              <i className="fas fa-clock" style={{ fontSize: '0.75rem' }} />
            </div>
          </div>
          <h4 className="fw-bold text-warning mb-0">{pendingOrders}</h4>
        </div>
      </div>

      {/* Processing */}
      <div className="col-6 col-md-3 col-xl-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
              Processing
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-15 text-info"
              style={{ width: '28px', height: '28px' }}
            >
              <i className="fas fa-box" style={{ fontSize: '0.75rem' }} />
            </div>
          </div>
          <h4 className="fw-bold text-info mb-0">{processingOrders}</h4>
        </div>
      </div>

      {/* Dispatched / Shipped */}
      <div className="col-6 col-md-3 col-xl-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
              In Transit
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
              style={{ width: '28px', height: '28px' }}
            >
              <i className="fas fa-truck" style={{ fontSize: '0.75rem' }} />
            </div>
          </div>
          <h4 className="fw-bold text-primary mb-0">{shippedOrders}</h4>
        </div>
      </div>

      {/* Delivered */}
      <div className="col-6 col-md-3 col-xl-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
              Delivered
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-15 text-success"
              style={{ width: '28px', height: '28px' }}
            >
              <i className="fas fa-check-circle" style={{ fontSize: '0.75rem' }} />
            </div>
          </div>
          <h4 className="fw-bold text-success mb-0">{deliveredOrders}</h4>
        </div>
      </div>

      {/* Total Volume */}
      <div className="col-6 col-md-3 col-xl-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
              Total Volume
            </span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 text-dark"
              style={{ width: '28px', height: '28px' }}
            >
              <i className="fas fa-money-bill-wave" style={{ fontSize: '0.75rem' }} />
            </div>
          </div>
          <h5 className="fw-bold text-dark mb-0 font-monospace text-truncate" style={{ fontSize: '0.95rem' }}>
            PKR {totalRevenue.toLocaleString()}
          </h5>
        </div>
      </div>
    </div>
  );
}
