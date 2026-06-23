'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface OrderData {
  _id: string;
  customerDetails: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variantName?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'On the Way' | 'Shipped' | 'Delivered' | 'Cancelled';
  statusHistory?: Array<{ status: string; changedAt: string; note?: string }>;
  createdAt: string;
  whatsappSent: boolean;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading orders database.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        // Update local state
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
        );
      } else {
        alert(json.error || 'Failed to update order status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'All') return true;
    return o.status === filterStatus;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-scroll-filters::-webkit-scrollbar {
          display: none !important;
        }
      `}} />
      {/* Filter bar */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex gap-2 overflow-x-auto pb-1 w-100 flex-nowrap admin-scroll-filters" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {['All', 'Pending', 'Processing', 'On the Way', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-sm rounded-pill px-3 flex-shrink-0 ${
                  filterStatus === status ? 'btn-primary border-0' : 'btn-light border'
                }`}
                style={{
                  background: filterStatus === status ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
                  fontWeight: 500,
                }}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="text-muted small">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small uppercase">
              <tr>
                <th style={{ width: '40px' }} />
                <th>Order ID</th>
                <th>Customer Name</th>
                <th className="d-none d-md-table-cell">City</th>
                <th className="d-none d-md-table-cell">Items Count</th>
                <th>Total amount</th>
                <th>Status</th>
                <th className="d-none d-sm-table-cell">Order Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  let badgeClass = 'bg-warning text-dark';
                  if (order.status === 'Processing') badgeClass = 'bg-primary text-white';
                  if (order.status === 'On the Way') badgeClass = 'bg-purple text-white';
                  if (order.status === 'Shipped') badgeClass = 'bg-info text-white';
                  if (order.status === 'Delivered') badgeClass = 'bg-success text-white';
                  if (order.status === 'Cancelled') badgeClass = 'bg-danger text-white';

                  const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();

                  return (
                    <React.Fragment key={order._id}>
                      <tr
                        onClick={() => toggleExpand(order._id)}
                        style={{ cursor: 'pointer' }}
                        className={isExpanded ? 'table-active' : ''}
                      >
                        <td>
                          <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-muted`} />
                        </td>
                        <td className="fw-bold text-secondary">#{orderIdShort}</td>
                        <td>{order.customerDetails.name}</td>
                        <td className="d-none d-md-table-cell">{order.customerDetails.city}</td>
                        <td className="d-none d-md-table-cell">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                        <td className="fw-bold text-dark">PKR {order.totalAmount.toLocaleString()}</td>
                        <td>
                          <span className={`badge rounded-pill px-2.5 py-1 ${badgeClass}`}>{order.status}</span>
                        </td>
                        <td className="text-muted small d-none d-sm-table-cell">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-4" style={{ background: '#f8fafc' }}>
                            <div className="row g-4">
                              {/* Shipping Information */}
                              <div className="col-12 col-md-5">
                                <h6 className="fw-bold text-secondary border-bottom pb-1 mb-2">Customer Details</h6>
                                <table className="table table-sm table-borderless small mb-0">
                                  <tbody>
                                    <tr>
                                      <td className="text-muted fw-semibold" style={{ width: '90px' }}>Name:</td>
                                      <td>{order.customerDetails.name}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-semibold">Phone:</td>
                                      <td>
                                        <a href={`tel:${order.customerDetails.phone}`} className="text-decoration-none text-dark">
                                          {order.customerDetails.phone}
                                        </a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-semibold">Email:</td>
                                      <td>{order.customerDetails.email || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-semibold">Address:</td>
                                      <td>{order.customerDetails.address}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-semibold">City / Area:</td>
                                      <td>{order.customerDetails.city}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-semibold">Payment:</td>
                                      <td>{order.paymentMethod} (Cash On Delivery)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Order Items */}
                              <div className="col-12 col-md-4">
                                <h6 className="fw-bold text-secondary border-bottom pb-1 mb-2">Purchased Items</h6>
                                <div className="d-flex flex-column gap-2">
                                  {order.items.map((item, idx) => {
                                    const itemKey = `${order._id}-${idx}`;
                                    return (
                                      <div key={idx} className="d-flex align-items-center gap-2">
                                        <div
                                          className="rounded bg-white border d-flex align-items-center justify-content-center overflow-hidden position-relative"
                                          style={{ width: '40px', height: '40px' }}
                                        >
                                          <Image
                                            src={failedImages[itemKey] ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100' : (item.image || '/img/product-placeholder.png')}
                                            alt={item.name}
                                            fill
                                            sizes="40px"
                                            style={{ objectFit: 'contain', padding: '2px' }}
                                            onError={() => {
                                              setFailedImages((prev) => ({ ...prev, [itemKey]: true }));
                                            }}
                                          />
                                        </div>
                                      <div className="min-w-0" style={{ flex: 1 }}>
                                        <p className="mb-0 fw-semibold text-dark small text-truncate" style={{ maxWidth: '180px' }} title={item.variantName ? `${item.name} (${item.variantName})` : item.name}>
                                          {item.name}
                                          {item.variantName && (
                                            <span className="text-secondary ms-1 fw-bold">
                                              ({item.variantName})
                                            </span>
                                          )}
                                        </p>
                                        <span className="text-muted small">
                                          PKR {item.price.toLocaleString()} x {item.quantity}
                                        </span>
                                      </div>
                                      <div className="fw-bold text-dark small">
                                        PKR {(item.price * item.quantity).toLocaleString()}
                                      </div>
                                    </div>
                                  );
                                })}
                                </div>
                              </div>

                              {/* Status Control */}
                              <div className="col-12 col-md-3">
                                <h6 className="fw-bold text-secondary border-bottom pb-1 mb-2">Order Action</h6>
                                <div className="mb-3">
                                  <label className="form-label text-muted small">Update Order Status</label>
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className="form-select form-select-sm rounded-3"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="Pending">⏳ Pending</option>
                                    <option value="Processing">⚙️ Processing</option>
                                    <option value="On the Way">🚚 On the Way</option>
                                    <option value="Shipped">📦 Shipped</option>
                                    <option value="Delivered">✅ Delivered</option>
                                    <option value="Cancelled">❌ Cancelled</option>
                                  </select>
                                </div>

                                <a
                                  href={`https://wa.me/${order.customerDetails.phone.replace('+', '')}?text=${encodeURIComponent(
                                    `Hi ${order.customerDetails.name}, your order #${orderIdShort} status has been updated to "${order.status}". Thank you for shopping with PAKODRIVE!`
                                  )}`}
                                  target="_blank"
                                  className="btn btn-sm btn-success w-100 d-flex align-items-center justify-content-center gap-2 border-0 rounded-pill"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <i className="fab fa-whatsapp" /> WhatsApp Update
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
