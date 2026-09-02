'use client';

import React from 'react';
import Image from 'next/image';
import { IOrder } from '@/types';
import { ORDER_STATUS_CONFIG, getOrderStepIndex } from '@/lib/constants';
import { OrderProgressTracker } from './OrderProgressTracker';

export interface OrderTrackingCardProps {
  order: IOrder;
  isExpanded: boolean;
  onToggleExpand: (orderId: string | null) => void;
}

export function OrderTrackingCard({
  order,
  isExpanded,
  onToggleExpand,
}: OrderTrackingCardProps) {
  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['Pending'];
  const stepIdx = getOrderStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';
  const shortId = order._id ? order._id.substring(order._id.length - 8).toUpperCase() : '';
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const formattedDate = new Date(order.createdAt || '').toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      {/* Clickable Header */}
      <div
        className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ borderLeft: `4px solid ${cfg.color}`, cursor: 'pointer' }}
        onClick={() => onToggleExpand(order._id || null)}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: '48px', height: '48px', background: cfg.bg, color: cfg.color, fontSize: '1.2rem' }}
          >
            <i className={cfg.icon} />
          </div>
          <div>
            <p className="mb-0 fw-bold text-dark">Order #{shortId}</p>
            <p className="mb-0 text-muted small">
              {formattedDate} &bull; {totalItemsCount} item(s) &bull; PKR {order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span
            className="badge rounded-pill px-3 py-2 fw-semibold"
            style={{ background: cfg.bg, color: cfg.color, fontSize: '0.8rem' }}
          >
            {cfg.label}
          </span>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-muted`} />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Progress Tracker / Cancelled Alert */}
          {!isCancelled ? (
            <OrderProgressTracker stepIndex={stepIdx} />
          ) : (
            <div className="alert border-0 rounded-3 py-2 px-3 small mb-3" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <i className="fas fa-times-circle me-2" />
              This order has been cancelled.
            </div>
          )}

          {/* Items Ordered */}
          <div className="border-top pt-3 mb-3">
            <p className="fw-bold text-dark small mb-2">Items Ordered</p>
            <div className="d-flex flex-column gap-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: '#f8fafc' }}>
                  <div className="position-relative rounded bg-white border" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                    <Image
                      src={item.image || '/img/product-placeholder.png'}
                      alt={item.name}
                      fill
                      sizes="48px"
                      style={{ objectFit: 'contain', padding: '4px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/product-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-0 fw-semibold text-dark small text-truncate">{item.name}</p>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      PKR {item.price.toLocaleString()} × {item.quantity}
                    </span>
                  </div>
                  <span className="fw-bold text-dark small">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info + Payment */}
          <div className="row g-3 border-top pt-3">
            <div className="col-md-6">
              <p className="fw-bold text-dark small mb-1">Shipping Address</p>
              <p className="text-muted small mb-0">
                {order.customerDetails.name}<br />
                {order.customerDetails.address}, {order.customerDetails.city}<br />
                {order.customerDetails.phone}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="fw-bold text-dark small mb-1">Payment</p>
              <p className="text-muted small mb-0">Cash on Delivery (COD)</p>
              <p className="fw-bold mb-0 mt-2" style={{ color: '#ea580c', fontSize: '1.1rem' }}>
                Total: PKR {order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status History Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="border-top pt-3 mt-3">
              <p className="fw-bold text-dark small mb-2">Status History</p>
              <div className="d-flex flex-column gap-1">
                {[...order.statusHistory].reverse().map((h, idx) => {
                  const hcfg = ORDER_STATUS_CONFIG[h.status] || ORDER_STATUS_CONFIG['Pending'];
                  return (
                    <div key={idx} className="d-flex align-items-start gap-2 small">
                      <span
                        className="badge rounded-pill px-2 py-1 mt-0.5"
                        style={{ background: hcfg.bg, color: hcfg.color, fontSize: '0.7rem', flexShrink: 0 }}
                      >
                        {h.status}
                      </span>
                      <span className="text-muted">
                        {new Date(h.changedAt).toLocaleString('en-PK')}
                        {h.note && <> &bull; {h.note}</>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
