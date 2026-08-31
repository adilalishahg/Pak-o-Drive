'use client';

import React from 'react';
import { OrderData } from '../../../hooks/useAdminOrders';

interface OrdersTableProps {
  orders: OrderData[];
  selectedOrder: OrderData | null;
  dispatchReady: Record<string, boolean>;
  courierStatus: Record<string, string>;
  onSelectOrder: (order: OrderData) => void;
  onToggleReady: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onPrintReceipt: (order: OrderData) => void;
}

export function OrdersTable({
  orders,
  selectedOrder,
  dispatchReady,
  courierStatus,
  onSelectOrder,
  onToggleReady,
  onStatusChange,
  onPrintReceipt,
}: OrdersTableProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success text-white';
      case 'Shipped':
      case 'On the Way':
        return 'bg-primary text-white';
      case 'Processing':
        return 'bg-info text-dark';
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
      <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <i className="fas fa-boxes text-primary" /> Live Orders Ledger ({orders.length})
        </h6>
        <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
          Click row to inspect details &amp; dispatch courier consignment.
        </span>
      </div>

      <div className="card-body p-0">
        {orders.length === 0 ? (
          <div className="text-center py-5 px-3">
            <i className="fas fa-inbox text-muted mb-2" style={{ fontSize: '2.5rem' }} />
            <h6 className="fw-bold text-secondary mb-1">No Orders Found</h6>
            <p className="text-muted small">No customer orders matching the current filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Order ID &amp; Date</th>
                  <th>Customer &amp; City</th>
                  <th>Items Summary</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Dispatch Ready</th>
                  <th>Courier Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const isSelected = selectedOrder?._id === o._id;
                  const isReady = dispatchReady[o._id] || false;
                  const cStatus = courierStatus[o._id] || 'Not Booked';

                  return (
                    <tr
                      key={o._id}
                      onClick={() => onSelectOrder(o)}
                      className={`cursor-pointer transition-all ${isSelected ? 'table-primary bg-opacity-25' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="ps-4">
                        <div className="fw-bold font-monospace text-primary">#{o._id.slice(-6).toUpperCase()}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold text-dark">{o.customerDetails?.name || 'Customer'}</div>
                        <div className="text-muted small d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                          <span className="badge bg-light text-secondary border">{o.customerDetails?.city || 'Pakistan'}</span>
                          <span className="font-monospace">{o.customerDetails?.phone}</span>
                        </div>
                      </td>

                      <td>
                        <div className="text-truncate" style={{ maxWidth: '180px' }} title={o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}>
                          {o.items.length} item{o.items.length > 1 ? 's' : ''} ({o.items[0]?.name})
                        </div>
                      </td>

                      <td>
                        <div className="fw-bold text-dark font-monospace">PKR {o.totalAmount?.toLocaleString()}</div>
                        <span className="badge bg-light text-muted border text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {o.paymentMethod || 'COD'}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`form-select form-select-sm rounded-pill fw-semibold border-0 ${getStatusBadgeClass(o.status)}`}
                          value={o.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onStatusChange(o._id, e.target.value)}
                          style={{ fontSize: '0.75rem', width: '120px', cursor: 'pointer' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="On the Way">On the Way</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="form-check form-switch d-inline-block mb-0">
                          <input
                            className="form-check-input my-0"
                            type="checkbox"
                            role="switch"
                            checked={isReady}
                            onChange={() => onToggleReady(o._id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill ${
                            cStatus.includes('Booked') || cStatus.includes('Dispatched')
                              ? 'bg-success bg-opacity-15 text-success border border-success'
                              : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {cStatus}
                        </span>
                      </td>

                      <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPrintReceipt(o)}
                            className="btn btn-outline-secondary btn-sm py-1 px-2"
                            title="Print Thermal POS Receipt"
                          >
                            <i className="fas fa-print" />
                          </button>
                          <a
                            href={`https://wa.me/${(o.customerDetails?.phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              o.customerDetails?.name || 'Customer'
                            )},%20this%20is%20Pak-o-Drive%20regarding%20Order%20%23${o._id.slice(-6).toUpperCase()}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-success btn-sm py-1 px-2"
                            title="WhatsApp Customer"
                          >
                            <i className="fab fa-whatsapp" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
