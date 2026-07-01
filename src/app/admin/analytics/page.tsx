'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import MetricCard from '../../../components/common/MetricCard';
import InteractiveMap from '../../../components/common/InteractiveMap';

const cityCoordinates: Record<string, [number, number]> = {
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  faisalabad: [31.4504, 73.1350],
  multan: [30.1575, 71.5249],
  peshawar: [34.0151, 71.5805],
  quetta: [30.1798, 66.9750],
  sialkot: [32.4945, 74.5228],
  gujranwala: [32.1877, 74.1945],
};

const deliveryRoutes: Array<{ path: [number, number][]; color?: string; weight?: number }> = [
  // Primary green hub lines
  { path: [[24.8607, 67.0011], [27.7244, 68.8228], [30.1575, 71.5249], [31.5204, 74.3587], [33.6844, 73.0479]], color: '#10b981', weight: 3 },
  // Secondary orange link lines
  { path: [[24.8607, 67.0011], [30.1798, 66.9750]], color: '#f97316', weight: 2 },
  { path: [[25.3960, 68.3578], [27.7244, 68.8228]], color: '#f97316', weight: 2 },
  { path: [[30.1798, 66.9750], [27.7244, 68.8228]], color: '#f97316', weight: 2 },
  { path: [[30.1798, 66.9750], [30.1575, 71.5249]], color: '#f97316', weight: 2 },
  { path: [[30.1575, 71.5249], [31.4504, 73.1350], [31.5204, 74.3587]], color: '#f97316', weight: 2 },
  { path: [[33.6844, 73.0479], [34.0151, 71.5805]], color: '#f97316', weight: 2 },
];

interface FunnelStep {
  step: number; label: string; description: string; count: number;
  conversionFromPrevious: number; conversionToEnd: number;
}

interface AnalyticsData {
  stats: {
    revenue: number; orders: number; averageOrderValue: number;
    conversionRate: number; uniqueSessionsCount: number;
    products?: number; unreadContacts?: number; activePromos?: number;
    pageviews?: number; cartClicks?: number; whatsappClicks?: number; searchesCount?: number;
    abandonedCartLeak?: number;
  };
  marketing: Array<{ source: string; visits: number; add_to_carts: number; purchases: number; revenue: number; roas: number }>;
  funnel?: FunnelStep[];
  insights: {
    searches: Array<{ keyword: string; count: number }>;
    categories: Array<{ category: string; count: number }>;
    devices: { mobile: number; desktop: number };
    demographics?: { age: Array<{ range: string; count: number }>; gender: Array<{ gender: string; count: number }> };
    platforms?: { os: Array<{ os: string; count: number }>; browsers: Array<{ browser: string; count: number }> };
    locations?: Array<{ city: string; count: number }>;
  };
  feed: Array<{ _id: string; description: string; device: 'Mobile' | 'Desktop'; source: string; timestamp: string }>;
  charts: { labels: string[]; revenue: number[]; conversion: number[]; pageviews?: number[] };
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-4 shadow-sm border p-3 p-md-4 mb-3 ${className}`} style={{ borderColor: '#f1f5f9' }}>
    {children}
  </div>
);

const Ttl = ({ children }: { children: React.ReactNode }) => (
  <h6 className="fw-black text-dark mb-0" style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
    {children}
  </h6>
);

const StatRow = ({ label, value, icon, color = '#f97316' }: { label: string; value: string | number; icon: string; color?: string }) => (
  <div className="d-flex align-items-center justify-content-between py-2 border-bottom" style={{ fontSize: '0.82rem' }}>
    <span className="d-flex align-items-center gap-2 text-muted fw-semibold">
      <i className={`fas ${icon}`} style={{ width: '14px', color, fontSize: '12px' }} />
      {label}
    </span>
    <span className="fw-black text-dark">{value}</span>
  </div>
);

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState('7days');
  const [activeLogisticsTab, setActiveLogisticsTab] = useState<'orders' | 'dispatch' | 'bookings' | 'performance'>('orders');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingOrder, setSelectedBookingOrder] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('TRAX');
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => { setMounted(true); fetchAnalytics('7days'); }, []);

  async function fetchAnalytics(r = range) {
    try {
      setLoading(true); setError('');
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch(`/api/analytics?range=${r}`, { cache: 'no-store' }),
        fetch('/api/orders', { cache: 'no-store' })
      ]);
      const analyticsJson = await analyticsRes.json();
      const ordersJson = await ordersRes.json();
      if (analyticsJson.success) setData(analyticsJson.data);
      else throw new Error(analyticsJson.error || 'Failed to load.');
      if (ordersJson.success) setOrders(ordersJson.data);
    } catch (e: any) {
      setError(e.message || 'Connection error.');
    } finally { setLoading(false); }
  }

  const handleVerifyCall = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Processing' })
      });
      const json = await res.json();
      if (json.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Processing' } : o));
      } else {
        alert(json.error || 'Failed to verify call.');
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying call.');
    }
  };

  const handleCreateBooking = async (orderId: string, courier: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Shipped' })
      });
      const json = await res.json();
      if (json.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Shipped' } : o));
        alert(`Successfully booked with ${courier}! Tracking ID: ${orderId.substring(orderId.length - 8).toUpperCase()}`);
      } else {
        alert(json.error || 'Failed to create booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating booking.');
    }
  };

  const handleGenerateSlip = () => {
    setShowSlipModal(true);
  };

  if (!mounted || loading) return (
    <div style={{ padding: '0 2px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton-pulse {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        .skeleton-block {
          background-color: #e2e8f0;
          border-radius: 8px;
        }
      `}} />

      {/* Header Skeleton */}
      <div className="bg-white rounded-4 border p-3 p-md-4 mb-3" style={{ borderColor: '#f1f5f9' }}>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
          <div className="w-100">
            <div className="skeleton-block skeleton-pulse mb-2" style={{ width: '220px', height: '24px' }} />
            <div className="skeleton-block skeleton-pulse" style={{ width: '380px', height: '16px' }} />
          </div>
        </div>
      </div>

      {/* 9 KPI Cards Skeleton */}
      <div className="row g-2 mb-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="bg-white rounded-4 border p-3 mb-2" style={{ borderColor: '#f1f5f9', minHeight: '80px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="skeleton-block skeleton-pulse" style={{ height: '12px', width: '95px' }} />
                <div className="skeleton-block skeleton-pulse rounded-circle" style={{ height: '24px', width: '24px' }} />
              </div>
              <div className="skeleton-block skeleton-pulse" style={{ height: '26px', width: '130px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Device Pie Skeleton */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="bg-white rounded-4 border p-3 p-md-4 mb-3" style={{ borderColor: '#f1f5f9', height: '272px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <div className="skeleton-block skeleton-pulse" style={{ height: '14px', width: '200px' }} />
            </div>
            <div className="skeleton-block skeleton-pulse w-100 h-75" />
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-4 border p-3 p-md-4 mb-3" style={{ borderColor: '#f1f5f9', height: '272px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <div className="skeleton-block skeleton-pulse" style={{ height: '14px', width: '120px' }} />
            </div>
            <div className="d-flex justify-content-center align-items-center h-75">
              <div className="skeleton-block skeleton-pulse rounded-circle" style={{ height: '120px', width: '120px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error || !data) return <div className="alert alert-danger border-0 m-3">{error || 'No data.'}</div>;

  // Calculate live order coordinates map markers (jittered for visibility)
  const mapMarkers = orders
    .map(order => {
      const city = order.customerDetails?.city?.toLowerCase()?.trim();
      if (!city) return null;
      const coords = cityCoordinates[city];
      if (coords) {
        const randomJitterLat = (Math.random() - 0.5) * 0.15;
        const randomJitterLng = (Math.random() - 0.5) * 0.15;
        return {
          lat: coords[0] + randomJitterLat,
          lng: coords[1] + randomJitterLng,
          popupText: `Order #${order._id.substring(order._id.length - 8).toUpperCase()} - ${order.customerDetails.name} (${order.customerDetails.city})`
        };
      }
      return null;
    })
    .filter(Boolean) as any[];

  const timeSeriesData = data.charts.labels.map((label, i) => ({
    name: label,
    Revenue: data.charts.revenue[i],
    Pageviews: data.charts.pageviews?.[i] ?? 0,
    Conversion: parseFloat(data.charts.conversion[i].toFixed(2))
  }));

  const devicePie = [
    { name: 'Mobile', value: data.insights.devices.mobile, color: '#f97316' },
    { name: 'Desktop', value: data.insights.devices.desktop, color: '#0f172a' }
  ];

  const funnelColors = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

  const kpisConfig = [
    { t: 'Total Revenue',       type: 'revenue',            val: data.stats.revenue,               fmt: (v: number) => `PKR ${v.toLocaleString()}`,                   i: 'fa-wallet',          c: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { t: 'Total Orders',        type: 'orders',             val: data.stats.orders,                fmt: (v: number) => v.toString(),                                  i: 'fa-shopping-bag',    c: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { t: 'Avg. Order Value',    type: 'avg_order_value',    val: data.stats.averageOrderValue,     fmt: (v: number) => `PKR ${Math.round(v).toLocaleString()}`,       i: 'fa-receipt',         c: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { t: 'Conversion Rate',     type: 'conversion_rate',    val: data.stats.conversionRate,        fmt: (v: number) => `${v.toFixed(2)}%`,                            i: 'fa-percentage',      c: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { t: 'Unique Sessions',     type: 'sessions',           val: data.stats.uniqueSessionsCount,   fmt: (v: number) => v.toString(),                                  i: 'fa-users',           c: '#0f172a', bg: 'rgba(15,23,42,0.1)' },
    { t: 'Page Views',          type: 'pageviews',          val: data.stats.pageviews ?? 0,        fmt: (v: number) => v.toString(),                                  i: 'fa-eye',             c: '#0891b2', bg: 'rgba(8,145,178,0.1)' },
    { t: 'Cart Clicks',         type: 'cart_clicks',        val: data.stats.cartClicks ?? 0,       fmt: (v: number) => v.toString(),                                  i: 'fa-cart-plus',       c: '#059669', bg: 'rgba(5,150,105,0.1)' },
    { t: 'WhatsApp Clicks',     type: 'whatsapp_clicks',    val: data.stats.whatsappClicks ?? 0,   fmt: (v: number) => v.toString(),                                  i: 'fa-whatsapp',        c: '#25d366', bg: 'rgba(37,211,102,0.1)' },
    { t: 'Cart Revenue Leak',   type: 'abandoned_cart',     val: data.stats.abandonedCartLeak || 0,fmt: (v: number) => `PKR ${v.toLocaleString()}`,                   i: 'fa-shopping-cart',   c: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  ];

  return (
    <div style={{ padding: '0 2px' }} className="fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.35s ease-out forwards;
        }
      `}} />

      {/* ── Header ── */}
      <Card>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2">
          <div>
            <h5 className="fw-black text-dark mb-1" style={{ fontSize: '1rem' }}>Analytics Deep-Dive</h5>
            <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Real-time traffic, conversions & revenue from your store.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <select value={range} onChange={e => { setRange(e.target.value); fetchAnalytics(e.target.value); }}
              className="form-select form-select-sm rounded-pill border-0 bg-light fw-semibold"
              style={{ fontSize: '0.78rem', minWidth: '130px' }}>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button onClick={() => fetchAnalytics(range)}
              className="btn btn-sm btn-light rounded-pill fw-semibold d-flex align-items-center gap-1"
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
              <i className="fas fa-sync-alt" style={{ fontSize: '11px' }} /> Refresh
            </button>
          </div>
        </div>
      </Card>

      {/* ── 9 KPI Cards ── */}
      <div className="row g-2 mb-3">
        {kpisConfig.map((k, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <MetricCard
              title={k.t}
              metricType={k.type}
              initialValue={k.val}
              formatValue={k.fmt}
              iconClass={k.i}
              iconBg={k.bg}
              iconColor={k.c}
              globalRange={range}
            />
          </div>
        ))}
      </div>

      {/* ── Revenue Chart + Device Pie ── */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <Ttl>Revenue & Pageviews Trend</Ttl>
              <span className="badge rounded-pill fw-bold" style={{ background: '#fff7ed', color: '#f97316', fontSize: '0.6rem' }}>Daily</span>
            </div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px' }} />
                  <Area name="Revenue (PKR)" type="monotone" dataKey="Revenue" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#rG)" />
                  <Area name="Page Views" type="monotone" dataKey="Pageviews" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#pG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-4">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <Ttl>Device Breakdown</Ttl>
            </div>
            <div style={{ height: '160px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={devicePie} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {devicePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v} hits`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span className="fw-black text-dark" style={{ fontSize: '1rem' }}>
                  {Math.round((data.insights.devices.mobile / Math.max(data.insights.devices.mobile + data.insights.devices.desktop, 1)) * 100)}%
                </span>
                <span className="text-muted" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Mobile</span>
              </div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-1">
              {devicePie.map((d, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <span className="rounded-circle" style={{ width: '9px', height: '9px', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Engagement Stats + Categories + Searches ── */}
      <div className="row g-3 mb-3">
        {/* Engagement */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Engagement Overview</Ttl></div>
            <StatRow label="Total Page Views"   value={data.stats.pageviews ?? 0}      icon="fa-eye"        color="#0891b2" />
            <StatRow label="Search Events"       value={data.stats.searchesCount ?? 0}  icon="fa-search"     color="#8b5cf6" />
            <StatRow label="Add to Cart Events"  value={data.stats.cartClicks ?? 0}     icon="fa-cart-plus"  color="#059669" />
            <StatRow label="WhatsApp Clicks"     value={data.stats.whatsappClicks ?? 0} icon="fa-whatsapp"   color="#25d366" />
            <StatRow label="Unique Sessions"     value={data.stats.uniqueSessionsCount} icon="fa-fingerprint" color="#f97316" />
            <StatRow label="Active Products"     value={data.stats.products ?? 0}       icon="fa-box"        color="#3b82f6" />
          </Card>
        </div>

        {/* Top Categories */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Popular Categories</Ttl></div>
            {data.insights.categories.length ? (
              data.insights.categories.map((c, i) => {
                const max = data.insights.categories[0].count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      <span className="text-capitalize">{c.category}</span>
                      <span className="text-muted">{c.count} views</span>
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '4px', background: '#f1f5f9' }}>
                      <div className="progress-bar rounded-pill" style={{ width: `${pct}%`, background: '#f97316' }} />
                    </div>
                  </div>
                );
              })
            ) : <p className="text-muted text-center py-3" style={{ fontSize: '0.75rem' }}>No category views yet.</p>}
          </Card>
        </div>

        {/* Search Intents */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Customer Search Intents</Ttl></div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {data.insights.searches.length ? data.insights.searches.map((s, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-3 mb-2"
                  style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                  <span className="fw-medium text-dark">"{s.keyword}"</span>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary fw-bold rounded-pill"
                    style={{ fontSize: '0.65rem' }}>{s.count}×</span>
                </div>
              )) : <p className="text-muted text-center py-3" style={{ fontSize: '0.75rem' }}>No searches logged yet.</p>}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Demographics + Locations + Platforms ── */}
      <div className="row g-3 mb-3">
        {/* Locations */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Top Cities</Ttl></div>
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {data.insights.locations?.length ? data.insights.locations.map((loc, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-3 mb-2"
                  style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                  <span className="fw-semibold text-dark d-flex align-items-center gap-2">
                    <i className="fas fa-map-marker-alt text-primary" style={{ fontSize: '11px' }} />{loc.city}
                  </span>
                  <span className="badge rounded-pill fw-bold" style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '0.65rem' }}>{loc.count}</span>
                </div>
              )) : <p className="text-muted text-center py-3" style={{ fontSize: '0.75rem' }}>No location data yet.</p>}
            </div>
          </Card>
        </div>

        {/* Gender + Age */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Gender Breakdown</Ttl></div>
            {data.insights.demographics?.gender?.length ? data.insights.demographics.gender.map((g, i) => {
              const tot = data.insights.demographics!.gender.reduce((s, x) => s + x.count, 0) || 1;
              const pct = Math.round((g.count / tot) * 100);
              return (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    <span className="text-capitalize">{g.gender}</span>
                    <span className="text-muted">{g.count} ({pct}%)</span>
                  </div>
                  <div className="progress" style={{ height: '6px', borderRadius: '4px', background: '#f1f5f9' }}>
                    <div className="progress-bar rounded-pill" style={{ width: `${pct}%`, background: g.gender === 'female' ? '#ec4899' : '#f97316' }} />
                  </div>
                </div>
              );
            }) : <p className="text-muted" style={{ fontSize: '0.75rem' }}>No gender data yet.</p>}

            <div className="border-top pt-3 mt-2">
              <p className="fw-bold mb-2" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>Age Groups</p>
              {data.insights.demographics?.age?.length ? (
                <div style={{ height: '80px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={data.insights.demographics.age.map(a => ({ name: a.range, count: a.count }))} barSize={20} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="name" fontSize={9} tickLine={false} stroke="#94a3b8" />
                      <YAxis fontSize={9} tickLine={false} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-muted" style={{ fontSize: '0.72rem' }}>No age data.</p>}
            </div>
          </Card>
        </div>

        {/* OS & Browsers */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>OS & Browser Platform</Ttl></div>
            <p className="fw-bold mb-2 text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operating Systems</p>
            {data.insights.platforms?.os?.length ? data.insights.platforms.os.map((o, i) => (
              <div key={i} className="d-flex justify-content-between mb-2" style={{ fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark">{o.os}</span>
                <span className="text-muted fw-bold">{o.count} hits</span>
              </div>
            )) : <p className="text-muted" style={{ fontSize: '0.72rem' }}>No OS data.</p>}
            <p className="fw-bold mb-2 mt-3 text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Web Browsers</p>
            {data.insights.platforms?.browsers?.length ? data.insights.platforms.browsers.map((b, i) => (
              <div key={i} className="d-flex justify-content-between mb-2" style={{ fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark">{b.browser}</span>
                <span className="text-muted fw-bold">{b.count} hits</span>
              </div>
            )) : <p className="text-muted" style={{ fontSize: '0.72rem' }}>No browser data.</p>}
          </Card>
        </div>
      </div>

      {/* ── Marketing Attribution ── */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <Card>
            <div className="border-bottom pb-2 mb-3"><Ttl>Marketing Channel & UTM Attribution</Ttl></div>
            <div className="table-responsive">
              <table className="table table-sm mb-0" style={{ fontSize: '0.78rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-center">Visits</th>
                    <th className="text-center d-none d-sm-table-cell">Carts</th>
                    <th className="text-center d-none d-sm-table-cell">Orders</th>
                    <th className="text-end">Revenue</th>
                    <th className="text-end d-none d-md-table-cell">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.marketing.map((ch, i) => (
                    <tr key={i}>
                      <td className="fw-semibold text-capitalize">
                        <span className="d-inline-block rounded-circle me-1"
                          style={{ width: '8px', height: '8px', verticalAlign: 'middle',
                            background: ch.source.includes('instagram') ? '#ec4899' : ch.source.includes('tiktok') ? '#06b6d4' : '#94a3b8' }} />
                        {ch.source}
                      </td>
                      <td className="text-center">{ch.visits}</td>
                      <td className="text-center d-none d-sm-table-cell">{ch.add_to_carts}</td>
                      <td className="text-center d-none d-sm-table-cell">{ch.purchases}</td>
                      <td className="text-end fw-semibold">PKR {ch.revenue.toLocaleString()}</td>
                      <td className="text-end d-none d-md-table-cell">
                        {ch.roas > 0
                          ? <span className="badge fw-bold" style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem' }}>{ch.roas.toFixed(1)}x</span>
                          : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Conversion Chart */}
        <div className="col-12 col-lg-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Daily Conversion Rate (%)</Ttl></div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => `${v}%`} />
                  <Area name="Conversion %" type="monotone" dataKey="Conversion" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#cG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Conversion Funnel ── */}
      {data.funnel && data.funnel.length > 0 && (
        <Card>
          <div className="d-flex align-items-start justify-content-between border-bottom pb-2 mb-3">
            <div>
              <Ttl>Conversion Funnel — Drop-Off Analysis</Ttl>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.72rem' }}>Where are customers leaving your store?</p>
            </div>
            <span className="badge rounded-pill fw-bold ms-2 flex-shrink-0" style={{ background: '#fff7ed', color: '#f97316', fontSize: '0.62rem' }}>
              {data.funnel[0].conversionToEnd}% to purchase
            </span>
          </div>
          {data.funnel.map((step, idx) => {
            const topCount = data.funnel![0].count || 1;
            const bw = Math.max((step.count / topCount) * 100, 0);
            const col = funnelColors[idx] || funnelColors[0];
            const drop = idx > 0 ? (100 - step.conversionFromPrevious).toFixed(1) : null;
            return (
              <div key={step.step}>
                {idx > 0 && (
                  <div className="d-flex align-items-center gap-2 py-1 ps-2">
                    <div style={{ width: '2px', height: '12px', background: '#e2e8f0', marginLeft: '11px' }} />
                    <span className="text-danger fw-bold" style={{ fontSize: '0.67rem' }}>▼ {drop}% dropped off</span>
                  </div>
                )}
                <div className="d-flex align-items-start gap-3 mb-1">
                  <div className="rounded-3 d-flex align-items-center justify-content-center text-white fw-black flex-shrink-0"
                    style={{ width: '26px', height: '26px', background: col, fontSize: '0.72rem' }}>{step.step}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>{step.label}</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-black text-dark" style={{ fontSize: '0.85rem' }}>{step.count.toLocaleString()}</span>
                        {idx > 0 && <span className="badge rounded-pill fw-bold" style={{ background: `${col}20`, color: col, fontSize: '0.62rem' }}>{step.conversionFromPrevious}%</span>}
                      </div>
                    </div>
                    <div className="rounded-pill overflow-hidden" style={{ height: '6px', background: '#f1f5f9' }}>
                      <div className="rounded-pill" style={{ width: `${bw}%`, height: '100%', background: col, transition: 'width 0.7s ease' }} />
                    </div>
                    <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.67rem' }}>{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="row g-2 mt-3 pt-3 border-top">
            {data.funnel.slice(1).map(step => (
              <div key={step.step} className="col-6 col-sm-3">
                <div className="text-center p-2 rounded-3" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <p className="text-muted fw-bold mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{step.label}</p>
                  <p className="fw-black text-dark mb-0" style={{ fontSize: '1.05rem' }}>{step.conversionFromPrevious}%</p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.6rem' }}>from prev.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Orders & Logistics Section ── */}
      <div className="row g-3 mb-3">
        {/* Left column: Tabs & Lists */}
        <div className="col-12 col-xl-8">
          <Card className="h-100 mb-0">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <Ttl>Orders & Logistics</Ttl>
              <div className="d-flex gap-1 flex-wrap justify-content-end">
                {(['orders', 'dispatch', 'bookings', 'performance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLogisticsTab(tab)}
                    className={`btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${activeLogisticsTab === tab ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: activeLogisticsTab === tab ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
                    }}
                  >
                    {tab === 'orders' ? 'Recent Orders' :
                     tab === 'dispatch' ? 'Dispatch Verification' :
                     tab === 'bookings' ? 'Courier Bookings' :
                     'Courier Performance'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Recent Orders */}
            {activeLogisticsTab === 'orders' && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ minWidth: '550px', fontSize: '0.78rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>ORDER ID</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>CUSTOMER</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>PHONE</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>TOTAL</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>DATE</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>STATUS</th>
                      <th style={{ color: '#64748b', fontWeight: 700, textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-4 text-muted">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 6).map((order: any) => {
                        let badgeClass = 'bg-warning text-dark';
                        if (order.status === 'Processing') badgeClass = 'bg-primary text-white';
                        if (order.status === 'On the Way' || order.status === 'Shipped') badgeClass = 'bg-info text-white';
                        if (order.status === 'Delivered') badgeClass = 'bg-success text-white';
                        if (order.status === 'Cancelled') badgeClass = 'bg-danger text-white';

                        const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                        const isPending = order.status === 'Pending';
                        const isProcessing = order.status === 'Processing';

                        return (
                          <tr key={order._id}>
                            <td className="fw-bold text-muted">#{orderIdShort}</td>
                            <td className="fw-semibold text-dark">{order.customerDetails.name}</td>
                            <td className="text-muted">
                              {order.customerDetails.phone.substring(0, 4)}xxxx{order.customerDetails.phone.substring(order.customerDetails.phone.length - 3)}
                            </td>
                            <td className="fw-bold">PKR {order.totalAmount.toLocaleString()}</td>
                            <td className="text-muted">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </td>
                            <td>
                              <span className={`badge rounded-pill ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '4px 8px' }}>
                                {order.status === 'Processing' ? 'Confirmed' : order.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1 justify-content-center">
                                <button
                                  disabled={!isPending}
                                  onClick={() => handleVerifyCall(order._id)}
                                  className={`btn btn-xs py-1 px-2.5 rounded-pill ${isPending ? 'btn-outline-warning fw-semibold' : 'btn-light text-muted'}`}
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {isPending ? 'Verify Call' : 'Verified'}
                                </button>
                                <button
                                  disabled={!isProcessing}
                                  onClick={() => {
                                    setSelectedBookingOrder(order._id);
                                    setShowBookingModal(true);
                                  }}
                                  className={`btn btn-xs py-1 px-2.5 rounded-pill ${isProcessing ? 'btn-primary text-white fw-semibold' : 'btn-light text-muted'}`}
                                  style={{ fontSize: '0.65rem', background: isProcessing ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined }}
                                >
                                  Book Courier
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Dispatch Verification */}
            {activeLogisticsTab === 'dispatch' && (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {orders.filter(o => o.status === 'Processing').length === 0 ? (
                  <p className="text-muted text-center py-4 small">No orders pending dispatch verification.</p>
                ) : (
                  orders.filter(o => o.status === 'Processing').map((order: any) => {
                    const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                    return (
                      <div key={order._id} className="p-3 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                        <div>
                          <span className="fw-bold text-dark">Order #{orderIdShort}</span>
                          <span className="text-muted ms-2">&bull; Verified for dispatch ({order.customerDetails.name} - {order.customerDetails.city})</span>
                        </div>
                        <div className="d-flex gap-1">
                          <a
                            href={`https://wa.me/${order.customerDetails.phone.replace('+', '')}?text=${encodeURIComponent(
                              `Hi ${order.customerDetails.name}, your order #${orderIdShort} has been verified and is ready for dispatch! Thank you for shopping with PAKODRIVE.`
                            )}`}
                            target="_blank"
                            className="btn btn-sm btn-success border-0 rounded-pill d-flex align-items-center gap-1 text-white"
                            style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                          >
                            <i className="fab fa-whatsapp" /> WhatsApp
                          </a>
                          <button
                            onClick={() => {
                              setSelectedBookingOrder(order._id);
                              setShowBookingModal(true);
                            }}
                            className="btn btn-sm btn-primary border-0 rounded-pill d-flex align-items-center gap-1 text-white"
                            style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'linear-gradient(to right, #ea580c, #f97316)' }}
                          >
                            <i className="fas fa-truck" /> Book Courier
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Courier Bookings */}
            {activeLogisticsTab === 'bookings' && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ minWidth: '500px', fontSize: '0.78rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>ORDER ID</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>COURIER</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>TRACKING ID</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>STATUS</th>
                      <th style={{ color: '#64748b', fontWeight: 700 }}>BOOKED ON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === 'Shipped' || o.status === 'On the Way').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-muted">
                          No active courier bookings.
                        </td>
                      </tr>
                    ) : (
                      orders.filter(o => o.status === 'Shipped' || o.status === 'On the Way').map((order: any) => {
                        const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                        // Deterministic mock courier assignment based on order ID hash
                        const courierIndex = order._id.charCodeAt(0) % 4;
                        const couriers = ['TRAX', 'Leopards', 'TCS', 'T-Rex'];
                        const courier = couriers[courierIndex];
                        return (
                          <tr key={order._id}>
                            <td className="fw-bold text-muted">#{orderIdShort}</td>
                            <td className="fw-semibold text-dark">{courier}</td>
                            <td className="text-primary fw-mono">TRK-{orderIdShort}</td>
                            <td>
                              <span className="badge bg-success bg-opacity-10 text-success rounded-pill fw-bold" style={{ fontSize: '0.68rem', padding: '4px 8px' }}>
                                Active Booking
                              </span>
                            </td>
                            <td className="text-muted">
                              {new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Courier Performance */}
            {activeLogisticsTab === 'performance' && (
              <div className="d-flex flex-column gap-3 py-2">
                {[
                  { name: 'T-Rex Logistics', success: 96.5, time: '2.1 days', color: '#10b981', orders: 24 },
                  { name: 'TRAX Express', success: 94.2, time: '2.8 days', color: '#3b82f6', orders: 48 },
                  { name: 'TCS Courier', success: 91.0, time: '3.0 days', color: '#f59e0b', orders: 35 },
                  { name: 'Leopards Courier', success: 88.5, time: '3.5 days', color: '#ef4444', orders: 19 }
                ].map((courier, idx) => (
                  <div key={idx} className="p-3 rounded-4 border" style={{ background: '#f8fafc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.78rem' }}>
                      <span className="fw-bold text-dark">{courier.name} ({courier.orders} bookings)</span>
                      <div className="d-flex gap-3 text-muted fw-semibold">
                        <span>Avg Time: <strong className="text-dark">{courier.time}</strong></span>
                        <span>Success Rate: <strong style={{ color: courier.color }}>{courier.success}%</strong></span>
                      </div>
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '4px', background: '#e2e8f0' }}>
                      <div className="progress-bar rounded-pill" style={{ width: `${courier.success}%`, background: courier.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Courier Setup / Slips / RTO */}
        <div className="col-12 col-xl-4">
          <Card className="h-100 mb-0 d-flex flex-column">
            <div className="border-bottom pb-2 mb-3">
              <Ttl>Courier Booking Integration</Ttl>
            </div>
            
            {/* Courier Toggles */}
            <div className="d-flex flex-column gap-2 mb-3">
              <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark"><i className="fas fa-check-circle text-success me-2" /> T-Rex Integration</span>
                <span className="badge bg-success bg-opacity-10 text-success fw-bold rounded-pill">Active</span>
              </div>
              <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark"><i className="fas fa-check-circle text-success me-2" /> TRAX Logistics</span>
                <span className="badge bg-primary bg-opacity-10 text-primary fw-bold rounded-pill">Assigned 245625-01</span>
              </div>
              <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark"><i className="fas fa-check-circle text-success me-2" /> Leopards Courier</span>
                <span className="badge bg-info bg-opacity-10 text-info fw-bold rounded-pill">Created</span>
              </div>
              <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark text-muted"><i className="fas fa-minus-circle text-muted me-2" /> TCS Courier</span>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fw-bold rounded-pill">Disconnected</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleGenerateSlip()}
              className="btn btn-sm w-100 mb-3 text-white fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill shadow-sm"
              style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none', padding: '8px 16px', fontSize: '0.78rem' }}
            >
              <i className="fas fa-print" /> Generate Dispatch Slips
            </button>

            {/* Metrics Row */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="p-2 rounded-3 border text-center" style={{ background: '#fff5f5' }}>
                  <p className="text-muted fw-bold mb-1" style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RTO Ratio</p>
                  <p className="fw-black text-danger mb-0" style={{ fontSize: '1.05rem' }}>5.1%</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded-3 border text-center" style={{ background: '#eff6ff' }}>
                  <p className="text-muted fw-bold mb-1" style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Delivery</p>
                  <p className="fw-black text-primary mb-0" style={{ fontSize: '1.05rem' }}>3.2 Days</p>
                </div>
              </div>
            </div>

            {/* Map Visualizer */}
            <div className="mt-auto border rounded-4 overflow-hidden position-relative" style={{ height: '140px' }}>
              <InteractiveMap
                center={[30.3753, 69.3451]} // Center of Pakistan
                zoom={5}
                markers={mapMarkers}
                routes={deliveryRoutes}
                height="140px"
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex align-items-center justify-content-between" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', fontSize: '0.62rem', zIndex: 1000 }}>
                <span className="text-white fw-semibold"><i className="fas fa-circle text-success me-1 pulse-dot" /> Tracking Live Shipments</span>
                <span className="text-white-50">{mapMarkers.length} Active Routes</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Live Activity Feed ── */}
      <Card>
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <Ttl>Live Customer Activity Feed</Ttl>
          <span className="rounded-circle" style={{ width: '9px', height: '9px', background: '#f97316', display: 'inline-block', boxShadow: '0 0 0 3px rgba(249,115,22,0.25)' }} />
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {data.feed.length ? data.feed.map(act => (
            <div key={String(act._id)} className="d-flex align-items-start gap-3 p-2 rounded-3 mb-2"
              style={{ background: '#f8fafc', fontSize: '0.78rem' }}>
              <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '30px', height: '30px', background: '#fff7ed', color: '#f97316' }}>
                <i className={`fas ${act.device === 'Mobile' ? 'fa-mobile-alt' : 'fa-desktop'}`} style={{ fontSize: '12px' }} />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <p className="fw-semibold text-dark mb-0" style={{ wordBreak: 'break-word' }}>{act.description}</p>
                <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {act.source} &bull; {new Date(act.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )) : <p className="text-muted text-center py-3" style={{ fontSize: '0.75rem' }}>No activity yet.</p>}
        </div>
      </Card>

      {/* Courier Booking Modal */}
      {showBookingModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-black text-dark" style={{ fontSize: '1rem' }}>Create Courier Booking</h5>
                <button type="button" className="btn-close" onClick={() => setShowBookingModal(false)} />
              </div>
              <div className="modal-body py-3">
                <p className="text-muted small mb-3">Select a courier service to dispatch this shipment:</p>
                <div className="d-flex flex-column gap-2">
                  {[
                    { name: 'T-Rex Logistics (Same Day / Next Day)', code: 'T-Rex' },
                    { name: 'TRAX Express (COD Specialized)', code: 'TRAX' },
                    { name: 'Leopards Courier Service', code: 'Leopards' },
                    { name: 'TCS Courier', code: 'TCS' }
                  ].map((courier) => (
                    <label key={courier.code} className={`p-2.5 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${selectedCourier === courier.code ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="courierSelection"
                        value={courier.code}
                        checked={selectedCourier === courier.code}
                        onChange={() => setSelectedCourier(courier.code)}
                      />
                      <span className="fw-semibold text-dark" style={{ fontSize: '0.78rem' }}>{courier.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-sm btn-light rounded-pill fw-semibold" onClick={() => setShowBookingModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill fw-bold text-white px-3"
                  style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none' }}
                  onClick={() => {
                    if (selectedBookingOrder) {
                      handleCreateBooking(selectedBookingOrder, selectedCourier);
                    }
                    setShowBookingModal(false);
                  }}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Slip Modal */}
      {showSlipModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-black text-dark" style={{ fontSize: '1rem' }}>Generated Dispatch Slips</h5>
                <button type="button" className="btn-close" onClick={() => setShowSlipModal(false)} />
              </div>
              <div className="modal-body py-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className="d-flex flex-column gap-3">
                  {orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length === 0 ? (
                    <p className="text-muted text-center py-4 small">No confirmed/dispatched orders available to generate slips.</p>
                  ) : (
                    orders.filter(o => o.status === 'Processing' || o.status === 'Shipped').map((order: any) => {
                      const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                      return (
                        <div key={order._id} className="p-3 border rounded-3 bg-white" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                            <div>
                              <h6 className="fw-black mb-0 text-dark" style={{ fontSize: '0.85rem' }}>PAKODRIVE SHIPMENT SLIP</h6>
                              <span className="text-muted" style={{ fontSize: '0.6rem' }}>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-end">
                              <span className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>COD - PKR {order.totalAmount.toLocaleString()}</span>
                              <br />
                              <span className="text-muted" style={{ fontSize: '0.6rem' }}>Order ID: #{orderIdShort}</span>
                            </div>
                          </div>
                          <div className="row g-2">
                            <div className="col-6">
                              <strong>SHIP TO:</strong>
                              <br />
                              {order.customerDetails.name}
                              <br />
                              {order.customerDetails.phone}
                              <br />
                              {order.customerDetails.address}, {order.customerDetails.city}
                            </div>
                            <div className="col-6 text-end">
                              <strong>BARCODE / TRACKING:</strong>
                              <div className="my-1 p-1 bg-dark text-white text-center rounded" style={{ fontSize: '0.75rem', letterSpacing: '3px' }}>
                                *{orderIdShort}*
                              </div>
                              <span className="text-muted" style={{ fontSize: '0.55rem' }}>TRK-{orderIdShort}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-sm btn-light rounded-pill fw-semibold" onClick={() => setShowSlipModal(false)}>Close</button>
                <button type="button" className="btn btn-sm btn-primary rounded-pill fw-bold text-white px-3" onClick={() => window.print()}>
                  Print Slips
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
