'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
      {/* Metric Cards Grid */}
      <div className="row g-4 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-muted mb-1 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Total Sales Revenue
                </p>
                <h3 className="fw-bold text-dark mb-0">PKR {stats.revenue.toLocaleString()}</h3>
              </div>
              <div
                className="rounded-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                }}
              >
                <i className="fas fa-wallet fa-lg" />
              </div>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <span className="text-success fw-bold">
                <i className="fas fa-caret-up me-1" />
                12.5%
              </span>
              <span>vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-muted mb-1 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Total Orders
                </p>
                <h3 className="fw-bold text-dark mb-0">{stats.orders}</h3>
              </div>
              <div
                className="rounded-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(249, 115, 22, 0.1)',
                  color: '#f97316',
                }}
              >
                <i className="fas fa-shopping-bag fa-lg" />
              </div>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <span className="text-success fw-bold">
                <i className="fas fa-caret-up me-1" />
                8.3%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Support Inbox Message */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-muted mb-1 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Unread Messages
                </p>
                <h3 className="fw-bold text-dark mb-0">{stats.unreadContacts}</h3>
              </div>
              <div
                className="rounded-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                }}
              >
                <i className="fas fa-envelope fa-lg" />
              </div>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              {stats.unreadContacts > 0 ? (
                <span className="text-danger fw-bold">Action required</span>
              ) : (
                <span className="text-success fw-bold">All caught up!</span>
              )}
            </div>
          </div>
        </div>

        {/* Traffic Pageviews */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-muted mb-1 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Total Page Views
                </p>
                <h3 className="fw-bold text-dark mb-0">{stats.pageviews}</h3>
              </div>
              <div
                className="rounded-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#06b6d4',
                }}
              >
                <i className="fas fa-eye fa-lg" />
              </div>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <span>Add-to-cart clicks: </span>
              <span className="text-dark fw-bold">{stats.cartClicks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Trend Graphs */}
      <div className="row g-4 mb-4">
        {/* Sales Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-secondary mb-3">Sales Revenue Trend (Last 7 Days)</h5>
            <div style={{ position: 'relative', height: '200px', width: '100%' }}>
              <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {/* Gradient background */}
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                {/* Filled Area */}
                <path
                  d={`M 0,200 L ${getSvgPoints(charts.sales, 500, 200)} L 500,200 Z`}
                  fill="url(#salesGrad)"
                />

                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  points={getSvgPoints(charts.sales, 500, 200)}
                />
              </svg>
            </div>
            {/* X Labels */}
            <div className="d-flex justify-content-between mt-2 px-1">
              {charts.labels.map((lbl, idx) => (
                <span key={idx} className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-secondary mb-3">Traffic Views (Last 7 Days)</h5>
            <div style={{ position: 'relative', height: '200px', width: '100%' }}>
              <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {/* Gradient background */}
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                {/* Filled Area */}
                <path
                  d={`M 0,200 L ${getSvgPoints(charts.pageviews, 500, 200)} L 500,200 Z`}
                  fill="url(#trafficGrad)"
                />

                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  points={getSvgPoints(charts.pageviews, 500, 200)}
                />
              </svg>
            </div>
            {/* X Labels */}
            <div className="d-flex justify-content-between mt-2 px-1">
              {charts.labels.map((lbl, idx) => (
                <span key={idx} className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-secondary mb-0">Recent Orders</h5>
              <Link href="/admin/orders" className="btn btn-link text-decoration-none btn-sm">
                View All <i className="fas fa-arrow-right ms-1" />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small uppercase">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted">
                        No orders recorded yet. Place an order on the storefront!
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order: any) => {
                      let badgeClass = 'bg-warning text-dark';
                      if (order.status === 'Shipped') badgeClass = 'bg-info text-white';
                      if (order.status === 'Delivered') badgeClass = 'bg-success text-white';
                      if (order.status === 'Cancelled') badgeClass = 'bg-danger text-white';

                      return (
                        <tr key={order._id}>
                          <td className="fw-bold text-muted" style={{ fontSize: '0.85rem' }}>
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </td>
                          <td>
                            <div className="fw-semibold">{order.customerDetails.name}</div>
                            <div className="text-muted small">{order.customerDetails.phone}</div>
                          </td>
                          <td className="fw-bold">PKR {order.totalAmount.toLocaleString()}</td>
                          <td>
                            <span className={`badge rounded-pill px-2.5 py-1 ${badgeClass}`}>{order.status}</span>
                          </td>
                          <td className="text-muted small">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
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

        {/* Inbox / Popular Searches */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h5 className="fw-bold text-secondary mb-3">Top Search Keywords</h5>
            <ul className="list-group list-group-flush mb-4">
              {searches.map((s: any, idx: number) => (
                <li
                  key={idx}
                  className="list-group-item d-flex align-items-center justify-content-between px-0 py-2.5 border-0 border-bottom"
                >
                  <span className="text-dark fw-medium">
                    <span className="text-muted me-2" style={{ width: '15px', display: 'inline-block' }}>
                      {idx + 1}.
                    </span>
                    {s.keyword}
                  </span>
                  <span className="badge bg-light text-dark rounded-pill px-2 py-1">{s.count} searches</span>
                </li>
              ))}
            </ul>

            <h5 className="fw-bold text-secondary mb-3">Quick Support Inbox</h5>
            <div className="d-flex flex-column gap-3">
              {recentContacts.length === 0 ? (
                <div className="text-center p-3 text-muted small bg-light rounded-3">No messages in inbox.</div>
              ) : (
                recentContacts.map((contact: any) => (
                  <div key={contact._id} className="p-3 bg-light rounded-3 text-start">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark small">{contact.name}</span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="fw-semibold text-secondary small text-truncate mb-1">{contact.subject}</div>
                    <p className="text-muted mb-0 text-truncate" style={{ fontSize: '0.75rem' }}>
                      {contact.message}
                    </p>
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
