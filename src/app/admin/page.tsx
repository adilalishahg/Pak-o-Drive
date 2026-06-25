'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricCard from '../../components/common/MetricCard';

interface DashboardData {
  stats: {
    revenue: number;
    orders: number;
    products: number;
    unreadContacts: number;
    activePromos: number;
    pageviews: number;
    cartClicks: number;
    whatsappClicks: number;
    searchesCount: number;
    abandonedCartLeak?: number;
  };
  charts: {
    labels: string[];
    pageviews: number[];
    sales: number[];
  };
  popularProducts: Array<{
    _id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    image: string;
    rating: number;
  }>;
  searches: Array<{
    keyword: string;
    count: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [analyticsRes, ordersRes, contactsRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/orders'),
          fetch('/api/contacts'),
        ]);

        const analyticsJson = await analyticsRes.json();
        const ordersJson = await ordersRes.json();
        const contactsJson = await contactsRes.json();

        if (analyticsJson.success) {
          setData(analyticsJson.data);
        } else {
          throw new Error(analyticsJson.error || 'Failed to fetch analytics data');
        }

        if (ordersJson.success) {
          setRecentOrders(ordersJson.data.slice(0, 5));
        }

        if (contactsJson.success) {
          setRecentContacts(contactsJson.data.slice(0, 5));
        }
      } catch (err: any) {
        console.error('Error fetching dashboard content:', err);
        setError(err.message || 'Failed to load dashboard data. Ensure MongoDB is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 p-4 shadow-sm" role="alert">
        <h4 className="alert-heading fw-bold">
          <i className="fas fa-exclamation-triangle me-2" />
          Dashboard Connection Error
        </h4>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, charts } = data;
  const searches = (data as any).insights?.searches || (data as any).searches || [];
  const popularProducts = (data as any).popularProducts || [];

  // Helper to generate SVG polyline points for chart
  const getSvgPoints = (values: number[] = [], width: number, height: number) => {
    if (!values || values.length === 0) return '';
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal;

    return values
      .map((val, idx) => {
        const x = (idx / (values.length - 1)) * width;
        // Invert Y since (0,0) is top-left in SVG
        const y = height - ((val - minVal) / range) * (height - 10) - 5;
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="fade-in">


      {/* Metric Cards Grid — col-12 = 1 per row on mobile, col-sm-6 = 2 per row on tablets, col-xl = equal width on desktop */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-xl">
          <MetricCard
            title="Total Revenue"
            metricType="revenue"
            initialValue={stats.revenue}
            formatValue={(val) => `PKR ${val.toLocaleString()}`}
            iconClass="fa-wallet"
            iconBg="rgba(37,99,235,0.1)"
            iconColor="#2563eb"
            footerContent={
              <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                <span className="text-success fw-bold"><i className="fas fa-caret-up" /> 12.5%</span>
                <span className="text-muted">vs last month</span>
              </div>
            }
          />
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-xl">
          <MetricCard
            title="Total Orders"
            metricType="orders"
            initialValue={stats.orders}
            formatValue={(val) => val.toString()}
            iconClass="fa-shopping-bag"
            iconBg="rgba(249,115,22,0.1)"
            iconColor="#f97316"
            footerContent={
              <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                <span className="text-success fw-bold"><i className="fas fa-caret-up" /> 8.3%</span>
                <span className="text-muted">vs last week</span>
              </div>
            }
          />
        </div>

        {/* Unread Messages */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100" style={{ padding: '14px' }}>
            <div className="d-flex align-items-start justify-content-between mb-2">
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.4px' }}>
                  Unread Msgs
                </p>
                <div className="fw-bold text-dark" style={{ fontSize: 'clamp(1.1rem, 5vw, 1.75rem)', lineHeight: 1.2 }}>
                  {stats.unreadContacts}
                </div>
              </div>
              <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ms-1"
                style={{ width: '34px', height: '34px', minWidth: '34px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <i className="fas fa-envelope" style={{ fontSize: '13px' }} />
              </div>
            </div>
            <div style={{ fontSize: '0.68rem' }}>
              {stats.unreadContacts > 0
                ? <span className="text-danger fw-bold">Action required</span>
                : <span className="text-success fw-bold">All caught up!</span>}
            </div>
          </div>
        </div>

        {/* Page Views */}
        <div className="col-12 col-sm-6 col-xl">
          <MetricCard
            title="Page Views"
            metricType="pageviews"
            initialValue={stats.pageviews}
            formatValue={(val) => val.toString()}
            iconClass="fa-eye"
            iconBg="rgba(6,182,212,0.1)"
            iconColor="#06b6d4"
            footerContent={
              <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                <span className="text-muted">Cart clicks:</span>
                <span className="text-dark fw-bold">{stats.cartClicks}</span>
              </div>
            }
          />
        </div>

        {/* Abandoned Cart Revenue Leak */}
        <div className="col-12 col-sm-6 col-xl">
          <MetricCard
            title="Cart Revenue Leak"
            metricType="abandoned_cart"
            initialValue={stats.abandonedCartLeak || 0}
            formatValue={(val) => `PKR ${val.toLocaleString()}`}
            iconClass="fa-shopping-cart"
            iconBg="rgba(239, 68, 68, 0.1)"
            iconColor="#ef4444"
            footerContent={
              <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                <span className="text-danger fw-bold"><i className="fas fa-exclamation-triangle" /> Potential leak</span>
              </div>
            }
          />
        </div>
      </div>


      {/* SVG Trend Graphs */}
      <div className="row g-3 g-md-4 mb-4">
        {/* Traffic Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white h-100">
            <h5 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#f97316' }}>
              Traffic Views (Last 7 Days)
            </h5>
            <div style={{ position: 'relative', height: '150px', width: '100%' }}>
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="37" x2="500" y2="37" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="112" x2="500" y2="112" stroke="#f1f5f9" strokeWidth="1" />
                <path d={`M 0,150 L ${getSvgPoints(charts.pageviews, 500, 150)} L 500,150 Z`} fill="url(#trafficGrad)" />
                <polyline fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
                  points={getSvgPoints(charts.pageviews, 500, 150)} />
              </svg>
            </div>
            <div className="d-flex justify-content-between mt-2">
              {charts.labels.map((lbl, idx) => (
                <span key={idx} className="text-muted" style={{ fontSize: '0.65rem' }}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white h-100">
            <h5 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#f97316' }}>
              Sales Revenue Trend (Last 7 Days)
            </h5>
            <div style={{ position: 'relative', height: '150px', width: '100%' }}>
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="37" x2="500" y2="37" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="112" x2="500" y2="112" stroke="#f1f5f9" strokeWidth="1" />
                <path d={`M 0,150 L ${getSvgPoints(charts.sales, 500, 150)} L 500,150 Z`} fill="url(#salesGrad)" />
                <polyline fill="none" stroke="#f97316" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
                  points={getSvgPoints(charts.sales, 500, 150)} />
              </svg>
            </div>
            <div className="d-flex justify-content-between mt-2">
              {charts.labels.map((lbl, idx) => (
                <span key={idx} className="text-muted" style={{ fontSize: '0.65rem' }}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        {/* Recent Orders */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Recent Orders</h5>
              <Link href="/admin/orders" className="text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem', color: '#f97316', fontWeight: 600 }}>
                View All <i className="fas fa-arrow-right" style={{ fontSize: '10px' }} />
              </Link>
            </div>
            <div className="table-responsive" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="table table-hover align-middle mb-0" style={{ minWidth: '400px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>ORDER ID</th>
                    <th className="d-none d-sm-table-cell" style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CUSTOMER</th>
                    <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>TOTAL</th>
                    <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>STATUS</th>
                    <th className="d-none d-md-table-cell" style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted" style={{ fontSize: '0.85rem' }}>
                        No orders yet. Place an order on the storefront!
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order: any) => {
                      let badgeClass = 'bg-warning text-dark';
                      if (order.status === 'Processing') badgeClass = 'bg-primary text-white';
                      if (order.status === 'Shipped') badgeClass = 'bg-info text-white';
                      if (order.status === 'Delivered') badgeClass = 'bg-success text-white';
                      if (order.status === 'Cancelled') badgeClass = 'bg-danger text-white';

                      return (
                        <tr key={order._id}>
                          <td className="fw-bold text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </td>
                          <td className="d-none d-sm-table-cell">
                            <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{order.customerDetails.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{order.customerDetails.phone}</div>
                          </td>
                          <td className="fw-bold" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            PKR {order.totalAmount.toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge rounded-pill ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '4px 8px' }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-muted d-none d-md-table-cell" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Searches + Inbox */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 h-100">
            {searches.length > 0 && (
              <>
                <h5 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.9rem' }}>Top Search Keywords</h5>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {searches.map((s: any, idx: number) => (
                    <span key={idx} className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                      style={{ background: '#f1f5f9', color: '#374151', fontSize: '0.73rem', fontWeight: 500 }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.62rem' }}>#{idx + 1}</span>
                      {s.keyword}
                      <span className="px-1 rounded" style={{ background: '#e2e8f0', fontSize: '0.62rem', color: '#64748b' }}>{s.count}</span>
                    </span>
                  ))}
                </div>
              </>
            )}

            <h5 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.9rem' }}>Quick Support Inbox</h5>
            <div className="d-flex flex-column gap-2">
              {recentContacts.length === 0 ? (
                <div className="text-center p-3 text-muted bg-light rounded-3" style={{ fontSize: '0.82rem' }}>
                  No messages in inbox.
                </div>
              ) : (
                recentContacts.map((contact: any) => (
                  <div key={contact._id} className="p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: '0.82rem' }}>{contact.name}</span>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="fw-semibold text-secondary text-truncate mb-1" style={{ fontSize: '0.78rem' }}>{contact.subject}</div>
                    <p className="text-muted mb-0 text-truncate" style={{ fontSize: '0.73rem' }}>{contact.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
