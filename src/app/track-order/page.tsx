'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IOrder } from '../../types';

type OrderStatus = 'Pending' | 'Processing' | 'On the Way' | 'Shipped' | 'Delivered' | 'Cancelled';

const STATUS_STEPS: OrderStatus[] = ['Pending', 'Processing', 'On the Way', 'Shipped', 'Delivered'];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  Pending:      { color: '#d97706', bg: '#fef3c7', icon: 'fas fa-clock',           label: 'Pending'      },
  Processing:   { color: '#2563eb', bg: '#dbeafe', icon: 'fas fa-cog fa-spin',     label: 'Processing'   },
  'On the Way': { color: '#7c3aed', bg: '#ede9fe', icon: 'fas fa-truck',           label: 'On the Way'   },
  Shipped:      { color: '#0891b2', bg: '#cffafe', icon: 'fas fa-shipping-fast',   label: 'Shipped'      },
  Delivered:    { color: '#16a34a', bg: '#dcfce7', icon: 'fas fa-check-circle',    label: 'Delivered'    },
  Cancelled:    { color: '#dc2626', bg: '#fee2e2', icon: 'fas fa-times-circle',    label: 'Cancelled'    },
};

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.indexOf(status as OrderStatus);
  return idx === -1 ? 0 : idx;
}

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrders([]);
    setSearched(false);

    if (!inputValue.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }

    try {
      setLoading(true);
      const payload = searchType === 'email'
        ? { email: inputValue.trim() }
        : { phone: inputValue.trim() };

      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error || 'No orders found.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '32px' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
        <div className="container-fluid px-3">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.78rem' }}>
            <li className="breadcrumb-item"><Link href="/" className="text-decoration-none text-muted">Home</Link></li>
            <li className="breadcrumb-item active fw-semibold" style={{ color: '#111' }}>Track Order</li>
          </ol>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '16px auto 0', padding: '0 12px' }}>

        {/* Search Card */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <i className="fas fa-search" style={{ color: '#fff', fontSize: '1.1rem' }} />
            </div>
            <h4 style={{ fontWeight: 800, color: '#111', marginBottom: '4px', fontSize: '1.1rem' }}>Track Your Order</h4>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Enter email or phone used at checkout</p>
          </div>

          <form onSubmit={handleSearch}>
            {/* Toggle Email / Phone */}
            <div className="d-flex gap-2 justify-content-center mb-4">
              <button
                type="button"
                onClick={() => { setSearchType('email'); setInputValue(''); setError(''); }}
                className={`btn btn-sm rounded-pill px-4 ${searchType === 'email' ? 'btn-primary border-0' : 'btn-outline-secondary'}`}
                style={searchType === 'email' 
                  ? { background: 'linear-gradient(to right, #c2410c, #ea580c)', border: 'none', color: '#ffffff' } 
                  : { color: '#475569', borderColor: '#94a3b8' }}
              >
                <i className="fas fa-envelope me-2" />Email
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('phone'); setInputValue(''); setError(''); }}
                className={`btn btn-sm rounded-pill px-4 ${searchType === 'phone' ? 'btn-primary border-0' : 'btn-outline-secondary'}`}
                style={searchType === 'phone' 
                  ? { background: 'linear-gradient(to right, #c2410c, #ea580c)', border: 'none', color: '#ffffff' } 
                  : { color: '#475569', borderColor: '#94a3b8' }}
              >
                <i className="fas fa-phone me-2" />Phone
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Input row */}
              <div style={{
                display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: '8px',
                overflow: 'hidden', background: '#fff',
              }}>
                <span style={{
                  display: 'flex', alignItems: 'center', padding: '0 12px',
                  background: '#f9fafb', borderRight: '1px solid #e5e7eb', flexShrink: 0,
                }}>
                  <i className={`fas ${searchType === 'email' ? 'fa-envelope' : 'fa-phone'}`}
                    style={{ color: '#9ca3af', fontSize: '14px' }} />
                </span>
                <input
                  type={searchType === 'email' ? 'email' : 'tel'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={searchType === 'email' ? 'your@email.com' : '+923001234567'}
                  aria-label={searchType === 'email' ? 'Email Address' : 'Phone Number'}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    padding: '13px 14px', fontSize: '0.9rem',
                    color: '#111', background: 'transparent',
                    fontFamily: 'var(--pd-font)',
                    minWidth: 0,
                  }}
                  required
                />
              </div>

              {/* Track button — full width below */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient"
                style={{
                  border: 'none', borderRadius: '8px',
                  padding: '13px', fontWeight: 700, fontSize: '0.9rem',
                  width: '100%', cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Searching…</>
                  : <><i className="fas fa-search me-2" />Track Order</>
                }
              </button>
            </div>

            {error && (
              <div className="alert alert-danger border-0 rounded-3 mt-3 py-2 px-3 small" role="alert">
                <i className="fas fa-exclamation-circle me-2" />{error}
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {searched && orders.length > 0 && (
          <div>
            <h5 className="fw-bold text-dark mb-3">
              <i className="fas fa-box-open me-2 text-primary" />
              {orders.length} Order{orders.length > 1 ? 's' : ''} Found
            </h5>

            <div className="d-flex flex-column gap-4">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                const stepIdx = getStepIndex(order.status);
                const isCancelled = order.status === 'Cancelled';
                const shortId = order._id ? order._id.substring(order._id.length - 8).toUpperCase() : '';
                const isExpanded = expandedId === order._id;

                return (
                  <div key={order._id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {/* Order Header */}
                    <div
                      className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
                      style={{ borderLeft: `4px solid ${cfg.color}`, cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : (order._id || null))}
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
                            {new Date(order.createdAt || '').toLocaleDateString('en-PK', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                            &nbsp;&bull;&nbsp;{order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                            &nbsp;&bull;&nbsp;PKR {order.totalAmount.toLocaleString()}
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

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4">

                        {/* Progress Tracker */}
                        {!isCancelled && (
                          <div className="mb-4 pt-3">
                            <div className="d-flex align-items-start justify-content-between position-relative">
                              {/* Progress line */}
                              <div
                                className="position-absolute"
                                style={{
                                  top: '20px',
                                  left: '20px',
                                  right: '20px',
                                  height: '3px',
                                  background: '#e2e8f0',
                                  zIndex: 0,
                                }}
                              />
                              <div
                                className="position-absolute"
                                style={{
                                  top: '20px',
                                  left: '20px',
                                  width: `${(stepIdx / (STATUS_STEPS.length - 1)) * (100 - (40 / (STATUS_STEPS.length)))}%`,
                                  height: '3px',
                                  background: 'linear-gradient(to right, #ea580c, #f97316)',
                                  zIndex: 1,
                                  transition: 'width 0.5s ease',
                                }}
                              />
                              {STATUS_STEPS.map((step, idx) => {
                                const stepCfg = STATUS_CONFIG[step];
                                const done = idx <= stepIdx;
                                return (
                                  <div key={step} className="d-flex flex-column align-items-center" style={{ zIndex: 2, flex: 1 }}>
                                    <div
                                      className="rounded-circle d-flex align-items-center justify-content-center mb-2 fw-bold"
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        background: done ? 'linear-gradient(135deg, #ea580c, #f97316)' : '#e2e8f0',
                                        color: done ? '#fff' : '#94a3b8',
                                        fontSize: '0.85rem',
                                        boxShadow: done ? '0 4px 12px rgba(234,88,12,0.3)' : 'none',
                                        transition: 'all 0.3s',
                                      }}
                                    >
                                      <i className={stepCfg.icon.replace(' fa-spin', '')} />
                                    </div>
                                    <span className="text-center" style={{ fontSize: '0.68rem', fontWeight: done ? 600 : 400, color: done ? '#ea580c' : '#94a3b8' }}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="alert border-0 rounded-3 py-2 px-3 small mb-3" style={{ background: '#fee2e2', color: '#dc2626' }}>
                            <i className="fas fa-times-circle me-2" />This order has been cancelled.
                          </div>
                        )}

                        {/* Items */}
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
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/img/product-placeholder.png'; }}
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

                        {/* Shipping Info + Total */}
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

                        {/* Status History */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                          <div className="border-top pt-3 mt-3">
                            <p className="fw-bold text-dark small mb-2">Status History</p>
                            <div className="d-flex flex-column gap-1">
                              {[...order.statusHistory].reverse().map((h, idx) => {
                                const hcfg = STATUS_CONFIG[h.status] || STATUS_CONFIG['Pending'];
                                return (
                                  <div key={idx} className="d-flex align-items-start gap-2 small">
                                    <span className="badge rounded-pill px-2 py-1 mt-0.5" style={{ background: hcfg.bg, color: hcfg.color, fontSize: '0.7rem', flexShrink: 0 }}>
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
              })}
            </div>
          </div>
        )}

        {/* No results state */}
        {searched && orders.length === 0 && !error && (
          <div className="text-center py-5">
            <i className="fas fa-box-open fa-3x text-muted mb-3" />
            <h5 className="text-muted">No orders found</h5>
            <p className="text-muted small">Make sure you entered the correct email or phone number used at checkout.</p>
          </div>
        )}
      </div>
    </div>
  );
}
