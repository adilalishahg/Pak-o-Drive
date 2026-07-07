'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import MetricCard from '../../../components/common/MetricCard';
import MarketIntelligenceDashboard from '../../../components/MarketIntelligenceDashboard';

declare global {
  interface Window {
    trends: any;
  }
}

// Dynamically import InteractiveMap (SSR false since Leaflet needs window/document)
const InteractiveMap = dynamic(() => import('../../../components/common/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="skeleton-pulse" style={{ height: '140px', background: '#424447ff', borderRadius: '16px' }} />
});

// Dynamically import Recharts Chart Sub-components (SSR false to prevent bundle bloating)
const TrendChart = dynamic(() => import('../../../components/common/AnalyticsCharts').then(m => m.TrendChart), {
  ssr: false,
  loading: () => <div className="skeleton-pulse w-100 h-100 rounded" style={{ height: '200px', backgroundColor: '#f1f5f9' }} />
});
const DeviceBreakdownChart = dynamic(() => import('../../../components/common/AnalyticsCharts').then(m => m.DeviceBreakdownChart), {
  ssr: false,
  loading: () => <div className="skeleton-pulse rounded-circle bg-light" style={{ width: '120px', height: '120px', margin: 'auto' }} />
});
const AgeBreakdownChart = dynamic(() => import('../../../components/common/AnalyticsCharts').then(m => m.AgeBreakdownChart), {
  ssr: false,
  loading: () => <div className="skeleton-pulse w-100 h-100 rounded" style={{ height: '80px', backgroundColor: '#f1f5f9' }} />
});
const ConversionRateChart = dynamic(() => import('../../../components/common/AnalyticsCharts').then(m => m.ConversionRateChart), {
  ssr: false,
  loading: () => <div className="skeleton-pulse w-100 h-100 rounded" style={{ height: '200px', backgroundColor: '#f1f5f9' }} />
});

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
  campaigns?: Array<{ campaign: string; source: string; visits: number; add_to_carts: number; purchases: number; revenue: number; roas: number }>;
  topProducts?: Array<{ _id: string; name: string; image: string; quantity: number; revenue: number }>;
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

interface GoogleTrendsWidgetProps {
  widgetType: string;
  keyword: string;
  geo: string;
  time: string;
}

const GoogleTrendsWidget: React.FC<GoogleTrendsWidgetProps> = ({ widgetType, keyword, geo, time }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.trends) return;

    let isMounted = true;

    // Stagger render call with a delay to prevent rendering script conflicts/race conditions
    const delay = widgetType === 'TIMESERIES' ? 0 : widgetType === 'GEO_MAP' ? 100 : widgetType === 'RELATED_QUERIES' ? 200 : 300;

    const timer = setTimeout(() => {
      if (!isMounted || !containerRef.current || !window.trends) return;
      containerRef.current.innerHTML = '';
      
      try {
        window.trends.embed.renderExploreWidgetTo(
          containerRef.current,
          widgetType,
          {
            comparisonItem: [{ keyword, geo, time }],
            category: 0,
            property: ""
          },
          {
            exploreQuery: `geo=${geo}&q=${encodeURIComponent(keyword)}&date=${time}`,
            guestPath: "https://trends.google.com:443/trends/embed/"
          }
        );
      } catch (err) {
        console.error("Error rendering Google Trends widget:", err);
      }
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [widgetType, keyword, geo, time]);

  return (
    <div 
      ref={containerRef} 
      className="w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ minHeight: '330px', background: '#f8fafc' }}
    />
  );
};

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState('7days');
  const [activeSection, setActiveSection] = useState<'overview' | 'engagement' | 'marketing' | 'logistics' | 'trends'>('overview');
  const [activeLogisticsTab, setActiveLogisticsTab] = useState<'orders' | 'dispatch' | 'bookings' | 'performance'>('orders');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingOrder, setSelectedBookingOrder] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('TRAX');
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Google Trends State
  const [trendsKeyword, setTrendsKeyword] = useState('smartwatch');
  const [trendsGeo, setTrendsGeo] = useState('PK');
  const [trendsTime, setTrendsTime] = useState('today 12-m');
  const [customTrendsKeyword, setCustomTrendsKeyword] = useState('');

  useEffect(() => { setMounted(true); fetchAnalytics('7days'); }, []);

  // Store categories state and loader for Trends presets
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadStoreCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Error loading categories for trends:", err);
      }
    }
    loadStoreCategories();
  }, []);

  // Dynamically load Google Trends Script once at the top level
  const [trendsLoaded, setTrendsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.trends) {
      setTrendsLoaded(true);
      return;
    }
    const scriptId = 'google-trends-embed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://ssl.gstatic.com/trends_nrtr/3728_RC01/embed_loader.js';
      script.async = true;
      document.body.appendChild(script);
    }
    const handleLoad = () => setTrendsLoaded(true);
    script.addEventListener('load', handleLoad);
    return () => {
      if (script) script.removeEventListener('load', handleLoad);
    };
  }, []);

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

  if (error) return <div className="alert alert-danger border-0 m-3">{error}</div>;

  // Determine if we should show skeleton loading inside components
  const isPageLoading = !mounted || loading || !data;

  // Calculate live order coordinates map markers (jittered for visibility)
  const mapMarkers = (orders || [])
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

  const timeSeriesData = data ? data.charts.labels.map((label, i) => ({
    name: label,
    Revenue: data.charts.revenue[i] || 0,
    Pageviews: data.charts.pageviews?.[i] ?? 0,
    Conversion: parseFloat((data.charts.conversion[i] || 0).toFixed(2))
  })) : [];

  const devicePie = data ? [
    { name: 'Mobile', value: data.insights.devices.mobile, color: '#f97316' },
    { name: 'Desktop', value: data.insights.devices.desktop, color: '#0f172a' }
  ] : [];

  const funnelColors = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

  const kpisConfig = data ? [
    { t: 'Total Revenue',       type: 'revenue',            val: data.stats.revenue,               fmt: (v: number) => `PKR ${v.toLocaleString()}`,                   i: 'fa-wallet',          c: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { t: 'Total Orders',        type: 'orders',             val: data.stats.orders,                fmt: (v: number) => v.toString(),                                  i: 'fa-shopping-bag',    c: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { t: 'Avg. Order Value',    type: 'avg_order_value',    val: data.stats.averageOrderValue,     fmt: (v: number) => `PKR ${Math.round(v).toLocaleString()}`,       i: 'fa-receipt',         c: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { t: 'Conversion Rate',     type: 'conversion_rate',    val: data.stats.conversionRate,        fmt: (v: number) => `${v.toFixed(2)}%`,                            i: 'fa-percentage',      c: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { t: 'Unique Sessions',     type: 'sessions',           val: data.stats.uniqueSessionsCount,   fmt: (v: number) => v.toString(),                                  i: 'fa-users',           c: '#0f172a', bg: 'rgba(15,23,42,0.1)' },
    { t: 'Page Views',          type: 'pageviews',          val: data.stats.pageviews ?? 0,        fmt: (v: number) => v.toString(),                                  i: 'fa-eye',             c: '#0891b2', bg: 'rgba(8,145,178,0.1)' },
    { t: 'Cart Clicks',         type: 'cart_clicks',        val: data.stats.cartClicks ?? 0,       fmt: (v: number) => v.toString(),                                  i: 'fa-cart-plus',       c: '#059669', bg: 'rgba(5,150,105,0.1)' },
    { t: 'WhatsApp Clicks',     type: 'whatsapp_clicks',    val: data.stats.whatsappClicks ?? 0,   fmt: (v: number) => v.toString(),                                  i: 'fa-whatsapp',        c: '#25d366', bg: 'rgba(37,211,102,0.1)' },
    { t: 'Cart Revenue Leak',   type: 'abandoned_cart',     val: data.stats.abandonedCartLeak || 0,fmt: (v: number) => `PKR ${v.toLocaleString()}`,                   i: 'fa-shopping-cart',   c: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  ] : [];

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
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .skeleton-pulse {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        .skeleton-block {
          background-color: #e2e8f0;
          border-radius: 6px;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-none {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
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

      {/* ── Tabs Bar ── */}
      <div 
        className="d-flex overflow-x-auto gap-2 pb-2 mb-3 scrollbar-none" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: '0',
          background: '#fff',
          zIndex: 10,
          paddingTop: '8px',
          paddingBottom: '8px',
          margin: '0 -2px'
        }}
      >
        {[
          { id: 'overview',   label: 'Overview',      icon: 'fa-chart-pie' },
          { id: 'engagement', label: 'Audience & Engagement', icon: 'fa-users' },
          { id: 'marketing',  label: 'Marketing & Conversion', icon: 'fa-funnel-dollar' },
          { id: 'logistics',  label: 'Orders & Logistics', icon: 'fa-shipping-fast' },
          { id: 'trends',     label: 'Market Intel & AI',  icon: 'fa-brain' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className="btn btn-sm rounded-pill px-3 py-1.5 border d-flex align-items-center gap-2 fw-bold transition-all"
            style={{
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              background: activeSection === tab.id ? 'linear-gradient(to right, #ea580c, #f97316)' : '#fff',
              color: activeSection === tab.id ? '#fff' : '#64748b',
              borderColor: activeSection === tab.id ? 'transparent' : '#e2e8f0',
              boxShadow: activeSection === tab.id ? '0 2px 4px rgba(234,88,12,0.15)' : 'none'
            }}
          >
            <i className={`fas ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className={activeSection === 'overview' ? '' : 'd-none'}>
      {/* ── 9 KPI Cards ── */}
      <div className="row g-2 mb-3">
        {isPageLoading ? (
          [...Array(9)].map((_, i) => (
            <div key={i} className="col-6 col-sm-6 col-md-4 col-lg-3">
              <div className="bg-white rounded-4 border p-3 mb-2 skeleton-pulse" style={{ borderColor: '#f1f5f9', minHeight: '84px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="skeleton-block" style={{ height: '12px', width: '90px' }} />
                  <div className="skeleton-block rounded-circle" style={{ height: '22px', width: '22px' }} />
                </div>
                <div className="skeleton-block" style={{ height: '24px', width: '130px' }} />
              </div>
            </div>
          ))
        ) : (
          kpisConfig.map((k, i) => (
            <div key={i} className="col-6 col-sm-6 col-md-4 col-lg-3">
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
          ))
        )}
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
              {isPageLoading ? (
                <div className="skeleton-pulse w-100 h-100 rounded" style={{ backgroundColor: '#f1f5f9' }} />
              ) : (
                <TrendChart data={timeSeriesData} />
              )}
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-4">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <Ttl>Device Breakdown</Ttl>
            </div>
            <div style={{ height: '160px', position: 'relative' }}>
              {isPageLoading ? (
                <div className="d-flex justify-content-center align-items-center h-100 skeleton-pulse">
                  <div className="rounded-circle" style={{ height: '120px', width: '120px', backgroundColor: '#e2e8f0' }} />
                </div>
              ) : (
                <>
                  <DeviceBreakdownChart data={devicePie} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span className="fw-black text-dark" style={{ fontSize: '1rem' }}>
                      {devicePie.length ? Math.round((devicePie[0].value / Math.max(devicePie[0].value + devicePie[1].value, 1)) * 100) : 0}%
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Mobile</span>
                  </div>
                </>
              )}
            </div>
            <div className="d-flex justify-content-center gap-3 mt-1">
              {isPageLoading ? (
                <div className="skeleton-pulse w-75 mx-auto" style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px' }} />
              ) : (
                devicePie.map((d, i) => (
                  <div key={i} className="d-flex align-items-center gap-1">
                    <span className="rounded-circle" style={{ width: '9px', height: '9px', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{d.name} ({d.value})</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      </div>

      <div className={activeSection === 'engagement' ? '' : 'd-none'}>
      {/* ── Engagement Stats + Categories + Searches ── */}
      <div className="row g-3 mb-3">
        {/* Engagement */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Engagement Overview</Ttl></div>
            {isPageLoading ? (
              <div className="skeleton-pulse d-flex flex-column gap-3 py-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between">
                    <div style={{ height: '14px', width: '120px', background: '#e2e8f0', borderRadius: '4px' }} />
                    <div style={{ height: '14px', width: '45px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <StatRow label="Total Page Views"   value={data.stats.pageviews ?? 0}      icon="fa-eye"        color="#0891b2" />
                <StatRow label="Search Events"       value={data.stats.searchesCount ?? 0}  icon="fa-search"     color="#8b5cf6" />
                <StatRow label="Add to Cart Events"  value={data.stats.cartClicks ?? 0}     icon="fa-cart-plus"  color="#059669" />
                <StatRow label="WhatsApp Clicks"     value={data.stats.whatsappClicks ?? 0} icon="fa-whatsapp"   color="#25d366" />
                <StatRow label="Unique Sessions"     value={data.stats.uniqueSessionsCount} icon="fa-fingerprint" color="#f97316" />
                <StatRow label="Active Products"     value={data.stats.products ?? 0}       icon="fa-box"        color="#3b82f6" />
              </>
            )}
          </Card>
        </div>

        {/* Top Categories */}
        <div className="col-12 col-md-4">
          <Card className="h-100">
            <div className="border-bottom pb-2 mb-3"><Ttl>Popular Categories</Ttl></div>
            {isPageLoading ? (
              <div className="skeleton-pulse d-flex flex-column gap-3 py-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-100">
                    <div className="d-flex justify-content-between mb-1">
                      <div style={{ height: '12px', width: '90px', background: '#e2e8f0', borderRadius: '4px' }} />
                      <div style={{ height: '12px', width: '35px', background: '#e2e8f0', borderRadius: '4px' }} />
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : data.insights.categories.length ? (
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
              {isPageLoading ? (
                <div className="skeleton-pulse d-flex flex-column gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-2 rounded-3 d-flex justify-content-between align-items-center" style={{ background: '#f8fafc', height: '34px' }}>
                      <div style={{ height: '12px', width: '85px', background: '#e2e8f0', borderRadius: '4px' }} />
                      <div style={{ height: '16px', width: '24px', background: '#e2e8f0', borderRadius: '10px' }} />
                    </div>
                  ))}
                </div>
              ) : data.insights.searches.length ? data.insights.searches.map((s, i) => (
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
              {isPageLoading ? (
                <div className="skeleton-pulse d-flex flex-column gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-2 rounded-3 d-flex justify-content-between align-items-center" style={{ background: '#f8fafc', height: '34px' }}>
                      <div style={{ height: '12px', width: '90px', background: '#e2e8f0', borderRadius: '4px' }} />
                      <div style={{ height: '16px', width: '24px', background: '#e2e8f0', borderRadius: '10px' }} />
                    </div>
                  ))}
                </div>
              ) : data.insights.locations?.length ? data.insights.locations.map((loc, i) => (
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
            {isPageLoading ? (
              <div className="skeleton-pulse d-flex flex-column gap-3 py-1">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="w-100">
                    <div className="d-flex justify-content-between mb-1">
                      <div style={{ height: '12px', width: '80px', background: '#e2e8f0', borderRadius: '4px' }} />
                      <div style={{ height: '12px', width: '40px', background: '#e2e8f0', borderRadius: '4px' }} />
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : data.insights.demographics?.gender?.length ? data.insights.demographics.gender.map((g, i) => {
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
              {isPageLoading ? (
                <div className="skeleton-pulse w-100" style={{ height: '80px', background: '#f1f5f9', borderRadius: '8px' }} />
              ) : data.insights.demographics?.age?.length ? (
                <div style={{ height: '80px' }}>
                  <AgeBreakdownChart data={data.insights.demographics.age.map(a => ({ name: a.range, count: a.count }))} />
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
            {isPageLoading ? (
              <div className="skeleton-pulse d-flex flex-column gap-2 mb-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between">
                    <div style={{ height: '13px', width: '90px', background: '#e2e8f0', borderRadius: '4px' }} />
                    <div style={{ height: '13px', width: '40px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : data.insights.platforms?.os?.length ? data.insights.platforms.os.map((o, i) => (
              <div key={i} className="d-flex justify-content-between mb-2" style={{ fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark">{o.os}</span>
                <span className="text-muted fw-bold">{o.count} hits</span>
              </div>
            )) : <p className="text-muted" style={{ fontSize: '0.72rem' }}>No OS data.</p>}
            <p className="fw-bold mb-2 mt-3 text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Web Browsers</p>
            {isPageLoading ? (
              <div className="skeleton-pulse d-flex flex-column gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between">
                    <div style={{ height: '13px', width: '80px', background: '#e2e8f0', borderRadius: '4px' }} />
                    <div style={{ height: '13px', width: '40px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : data.insights.platforms?.browsers?.length ? data.insights.platforms.browsers.map((b, i) => (
              <div key={i} className="d-flex justify-content-between mb-2" style={{ fontSize: '0.78rem' }}>
                <span className="fw-semibold text-dark">{b.browser}</span>
                <span className="text-muted fw-bold">{b.count} hits</span>
              </div>
            )) : <p className="text-muted" style={{ fontSize: '0.72rem' }}>No browser data.</p>}
          </Card>
        </div>
      </div>
      </div>

      <div className={activeSection === 'marketing' ? '' : 'd-none'}>
      {/* ── Marketing Attribution & Top Selling Products ── */}
      <div className="row g-3 mb-3">
        {/* Marketing Attribution */}
        <div className="col-12 col-md-4">
          <Card className="h-100 mb-0">
            <div className="border-bottom pb-2 mb-3"><Ttl>Marketing Channels (UTM)</Ttl></div>
            <div className="table-responsive">
              <table className="table table-sm mb-0" style={{ fontSize: '0.78rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Source</th>
                    <th className="text-center">Visits</th>
                    <th className="text-center">Orders</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {isPageLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="skeleton-pulse">
                        <td><div style={{ height: '13px', width: '60px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                        <td className="text-center"><div style={{ height: '13px', width: '25px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                        <td className="text-center"><div style={{ height: '13px', width: '25px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                        <td className="text-end"><div style={{ height: '13px', width: '45px', background: '#e2e8f0', borderRadius: '4px', marginLeft: 'auto' }} /></td>
                      </tr>
                    ))
                  ) : (
                    data.marketing.map((ch, i) => (
                      <tr key={i}>
                        <td className="fw-semibold text-capitalize" style={{ fontSize: '0.75rem' }}>
                          <span className="d-inline-block rounded-circle me-1"
                            style={{ width: '8px', height: '8px', verticalAlign: 'middle',
                              background: ch.source.includes('instagram') ? '#ec4899' : ch.source.includes('tiktok') ? '#06b6d4' : '#94a3b8' }} />
                          {ch.source}
                        </td>
                        <td className="text-center">{ch.visits}</td>
                        <td className="text-center">{ch.purchases}</td>
                        <td className="text-end fw-semibold">PKR {ch.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Top Selling Products */}
        <div className="col-12 col-md-4">
          <Card className="h-100 mb-0">
            <div className="border-bottom pb-2 mb-3"><Ttl>Top Selling Products</Ttl></div>
            <div className="table-responsive">
              <table className="table table-sm mb-0" style={{ fontSize: '0.78rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Sold</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {isPageLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="skeleton-pulse">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '20px', height: '20px', background: '#e2e8f0', borderRadius: '4px' }} />
                            <div style={{ height: '13px', width: '100px', background: '#e2e8f0', borderRadius: '4px' }} />
                          </div>
                        </td>
                        <td className="text-center"><div style={{ height: '13px', width: '25px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                        <td className="text-end"><div style={{ height: '13px', width: '45px', background: '#e2e8f0', borderRadius: '4px', marginLeft: 'auto' }} /></td>
                      </tr>
                    ))
                  ) : data.topProducts && data.topProducts.length ? (
                    data.topProducts.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div className="d-flex align-items-center gap-1.5" style={{ minWidth: 0 }}>
                            {p.image && (
                              <div style={{ width: '20px', height: '20px', position: 'relative', overflow: 'hidden', borderRadius: '4px', background: '#f8fafc', flexShrink: 0 }}>
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                            )}
                            <span className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.75rem' }}>{p.name}</span>
                          </div>
                        </td>
                        <td className="text-center fw-bold">{p.quantity}</td>
                        <td className="text-end fw-semibold">PKR {p.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-3 text-muted">No sales in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Conversion Chart */}
        <div className="col-12 col-md-4">
          <Card className="h-100 mb-0">
            <div className="border-bottom pb-2 mb-3"><Ttl>Daily Conversion Rate (%)</Ttl></div>
            <div style={{ height: '180px' }}>
              {isPageLoading ? (
                <div className="skeleton-pulse w-100 h-100 rounded" style={{ backgroundColor: '#f1f5f9' }} />
              ) : (
                <ConversionRateChart data={timeSeriesData} />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Ad Campaigns & Creative Intelligence ── */}
      <div className="row g-3 mb-3">
        {/* Ad Campaign Performance */}
        <div className="col-12 col-md-8">
          <Card className="h-100 mb-0">
            <div className="border-bottom pb-2 mb-3 d-flex align-items-center justify-content-between">
              <Ttl>🎯 Ad Campaign Performance (UTM Campaigns)</Ttl>
              <span className="badge rounded-pill text-white fw-bold px-2 py-0.5" style={{ fontSize: '0.62rem', background: 'linear-gradient(to right, #ea580c, #f97316)' }}>
                Facebook & TikTok Ads
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-sm mb-0" style={{ fontSize: '0.78rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Campaign Name</th>
                    <th>Source</th>
                    <th className="text-center">Ad Clicks</th>
                    <th className="text-center">Add to Carts</th>
                    <th className="text-center">Purchases</th>
                    <th className="text-end">Revenue</th>
                    <th className="text-end">Est. ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {isPageLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="skeleton-pulse">
                        <td><div style={{ height: '13px', width: '120px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                        <td><div style={{ height: '13px', width: '50px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                        <td className="text-center"><div style={{ height: '13px', width: '25px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                        <td className="text-center"><div style={{ height: '13px', width: '25px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                        <td className="text-center"><div style={{ height: '13px', width: '25px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                        <td className="text-end"><div style={{ height: '13px', width: '45px', background: '#e2e8f0', borderRadius: '4px', marginLeft: 'auto' }} /></td>
                        <td className="text-end"><div style={{ height: '13px', width: '30px', background: '#e2e8f0', borderRadius: '4px', marginLeft: 'auto' }} /></td>
                      </tr>
                    ))
                  ) : data?.campaigns && data.campaigns.length ? (
                    data.campaigns.map((camp, i) => (
                      <tr key={i}>
                        <td className="fw-bold text-dark">{camp.campaign}</td>
                        <td className="text-capitalize small">
                          <span className="badge px-2 py-0.5 text-white" style={{
                            background: camp.source.includes('facebook') ? '#1877f2' : camp.source.includes('tiktok') ? '#000000' : '#8b5cf6',
                            fontSize: '0.62rem'
                          }}>
                            {camp.source}
                          </span>
                        </td>
                        <td className="text-center">{camp.visits}</td>
                        <td className="text-center">{camp.add_to_carts}</td>
                        <td className="text-center fw-semibold">{camp.purchases}</td>
                        <td className="text-end fw-bold text-success">PKR {camp.revenue.toLocaleString()}</td>
                        <td className="text-end fw-black" style={{ color: camp.roas > 2.5 ? '#10b981' : camp.roas > 1 ? '#eab308' : '#ef4444' }}>
                          {camp.roas > 0 ? `${camp.roas.toFixed(1)}x` : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted small">
                        <i className="fas fa-ad me-1" /> No active UTM campaign traffic found. Add <code>?utm_campaign=your_ad_name</code> to your ad links!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Ad Traffic Geo-Locations */}
        <div className="col-12 col-md-4">
          <Card className="h-100 mb-0">
            <div className="border-bottom pb-2 mb-3"><Ttl>Ad Traffic Geo-Locations</Ttl></div>
            <div className="table-responsive">
              <table className="table table-sm mb-0" style={{ fontSize: '0.78rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>City</th>
                    <th className="text-center">Ad Traffic Share</th>
                  </tr>
                </thead>
                <tbody>
                  {isPageLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="skeleton-pulse">
                        <td><div style={{ height: '13px', width: '80px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                        <td className="text-center"><div style={{ height: '13px', width: '35px', background: '#e2e8f0', borderRadius: '4px', margin: 'auto' }} /></td>
                      </tr>
                    ))
                  ) : data?.insights.locations && data.insights.locations.length ? (
                    data.insights.locations.slice(0, 5).map((loc, i) => (
                      <tr key={i}>
                        <td className="fw-semibold text-dark">{loc.city}</td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span className="small text-muted">{loc.count} sessions</span>
                            <div className="progress flex-grow-1" style={{ height: '4px', width: '50px', background: '#e2e8f0' }}>
                              <div className="progress-bar bg-primary" style={{ width: `${Math.min(100, (loc.count / (data.stats.uniqueSessionsCount || 1)) * 100)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center py-3 text-muted">No geographical data logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>


      {/* ── Conversion Funnel ── */}
      {isPageLoading ? (
        <Card>
          <div className="d-flex align-items-start justify-content-between border-bottom pb-2 mb-3">
            <Ttl>Conversion Funnel — Drop-Off Analysis</Ttl>
          </div>
          <div className="skeleton-pulse d-flex flex-column gap-3 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="d-flex gap-3">
                <div style={{ width: '26px', height: '26px', background: '#e2e8f0', borderRadius: '8px' }} />
                <div className="flex-grow-1">
                  <div style={{ height: '14px', width: '120px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : data.funnel && data.funnel.length > 0 && (
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
            const topCount = data.funnel ? (data.funnel[0]?.count || 1) : 1;
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
      </div>

      <div className={activeSection === 'logistics' ? '' : 'd-none'}>
      {/* ── Orders & Logistics Section ── */}
      <div className="row g-3 mb-3">
        {/* Left column: Tabs & Lists */}
        <div className="col-12 col-xl-8">
          <Card className="h-100 mb-0">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 border-bottom pb-2 mb-3">
              <Ttl>Orders & Logistics</Ttl>
              <div className="d-flex gap-1 overflow-x-auto pb-1 scrollbar-none flex-nowrap w-100 justify-content-start justify-content-sm-end" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                    {isPageLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="skeleton-pulse">
                          <td><div style={{ height: '13px', width: '70px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '13px', width: '90px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '13px', width: '80px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '13px', width: '70px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '13px', width: '50px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '18px', width: '60px', background: '#e2e8f0', borderRadius: '10px' }} /></td>
                          <td><div style={{ height: '22px', width: '100px', background: '#e2e8f0', borderRadius: '10px', margin: 'auto' }} /></td>
                        </tr>
                      ))
                    ) : orders.length === 0 ? (
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
                {isPageLoading ? (
                  <div className="skeleton-pulse d-flex flex-column gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-3 rounded-3 d-flex justify-content-between align-items-center border" style={{ height: '54px', background: '#f8fafc' }}>
                        <div style={{ height: '14px', width: '220px', background: '#e2e8f0', borderRadius: '4px' }} />
                        <div style={{ height: '24px', width: '120px', background: '#e2e8f0', borderRadius: '12px' }} />
                      </div>
                    ))}
                  </div>
                ) : orders.filter(o => o.status === 'Processing').length === 0 ? (
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
                              `Hi ${order.customerDetails.name}, your order #${orderIdShort} has been verified and is ready for dispatch! Thank you for shopping with PAKODRIVE.\nOrder details: ${typeof window !== 'undefined' ? window.location.origin : 'https://pakodrive.com'}/order-confirmation/${order._id}`
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
                    {isPageLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="skeleton-pulse">
                          <td><div style={{ height: '13px', width: '70px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '13px', width: '80px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '13px', width: '95px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                          <td><div style={{ height: '18px', width: '85px', background: '#e2e8f0', borderRadius: '10px' }} /></td>
                          <td><div style={{ height: '13px', width: '110px', background: '#e2e8f0', borderRadius: '4px' }} /></td>
                        </tr>
                      ))
                    ) : orders.filter(o => o.status === 'Shipped' || o.status === 'On the Way').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-muted">
                          No active courier bookings.
                        </td>
                      </tr>
                    ) : (
                      orders.filter(o => o.status === 'Shipped' || o.status === 'On the Way').map((order: any) => {
                        const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
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
            {isPageLoading ? (
              <div className="skeleton-pulse d-flex flex-column gap-2 mb-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-2.5 rounded-3 d-flex justify-content-between align-items-center border" style={{ height: '42px', background: '#f8fafc' }}>
                    <div style={{ height: '12px', width: '100px', background: '#e2e8f0', borderRadius: '4px' }} />
                    <div style={{ height: '12px', width: '60px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : (
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
            )}

            {/* Action Buttons */}
            <button
              onClick={() => handleGenerateSlip()}
              disabled={isPageLoading}
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
              {isPageLoading ? (
                <div className="skeleton-pulse w-100 h-100 rounded" style={{ background: '#424447ff' }} />
              ) : (
                <>
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
                </>
              )}
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
          {isPageLoading ? (
            <div className="skeleton-pulse d-flex flex-column gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded-3 d-flex gap-3 align-items-center" style={{ background: '#f8fafc', height: '46px' }}>
                  <div style={{ width: '30px', height: '30px', background: '#e2e8f0', borderRadius: '8px' }} />
                  <div className="flex-grow-1">
                    <div style={{ height: '12px', width: '80%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '6px' }} />
                    <div style={{ height: '10px', width: '40%', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : data.feed && data.feed.length ? data.feed.map(act => (
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
      </div>

      <div className={activeSection === 'trends' ? '' : 'd-none'}>
      {/* ── AI Marketing Co-Pilot & Ad Campaign Advisor ── */}
      <Card>
        <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
          <div className="rounded-3 d-flex align-items-center justify-content-center text-white"
            style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
            <i className="fas fa-robot" />
          </div>
          <div>
            <Ttl>🤖 AI Marketing Co-Pilot & Ad Campaign Advisor</Ttl>
            <p className="text-muted mb-0 mt-0.5" style={{ fontSize: '0.7rem' }}>
              Actionable advertising strategies to increase reach & scale sales based on your store's live data.
            </p>
          </div>
        </div>

        {isPageLoading ? (
          <div className="skeleton-pulse d-flex flex-column gap-2 py-2">
            <div style={{ height: '50px', background: '#e2e8f0', borderRadius: '8px' }} />
            <div style={{ height: '80px', background: '#e2e8f0', borderRadius: '8px' }} />
          </div>
        ) : (
          <div className="row g-3">
            {/* Recommendation 1: High Demand Products to Advertise */}
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-4 border h-100 d-flex flex-column justify-content-between" style={{ background: '#fef8f3', borderColor: '#ffedd5' }}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-warning text-dark fw-bold rounded-pill uppercase px-2 py-0.5" style={{ fontSize: '0.65rem' }}>Top Pick</span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.82rem' }}>Recommended Ad Product</h6>
                  </div>
                  <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                    Based on your store's search volume and pageviews, you should run ads on:
                  </p>
                  <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3 border mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary" style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                      <i className="fas fa-ad fs-6" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong className="text-dark d-block text-capitalize text-truncate" style={{ fontSize: '0.82rem' }}>
                        {data.insights.categories[0]?.category || 'Electronics'}
                      </strong>
                      <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
                        {data.insights.categories[0]?.count || 0} organic views this week
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#ea580c' }} className="fw-semibold mt-2">
                  <i className="fas fa-bullseye me-1.5" />
                  Tip: Target "Interests: Online Shopping, Gadgets" on Meta Ads.
                </div>
              </div>
            </div>

            {/* Recommendation 2: Geographic targeting for Rawalpindi / Islamabad */}
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-4 border h-100 d-flex flex-column justify-content-between" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge text-white fw-bold rounded-pill uppercase px-2 py-0.5" style={{ background: '#8b5cf6', fontSize: '0.65rem' }}>Geotargeting</span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.82rem' }}>Best Location to Target</h6>
                  </div>
                  <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                    Your highest customer density is in Northern Punjab & Islamabad. Configure your Meta Ads location pin to:
                  </p>
                  <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3 border mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', minWidth: '36px', background: '#f5f3ff', color: '#8b5cf6' }}>
                      <i className="fas fa-map-marked-alt fs-6" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong className="text-dark d-block text-truncate" style={{ fontSize: '0.82rem' }}>
                        Rawalpindi & Islamabad (ICT)
                      </strong>
                      <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
                        Punjab represents {data.insights.locations && data.insights.locations.length > 0 ? '65%' : 'over 50%'} of your sales
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6d28d9' }} className="fw-semibold mt-2">
                  <i className="fas fa-location-arrow me-1.5" />
                  Set a 15km radius around Islamabad Zero Point.
                </div>
              </div>
            </div>

            {/* Recommendation 3: Ad Type & Funnel Fix */}
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-4 border h-100 d-flex flex-column justify-content-between" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-success text-white fw-bold rounded-pill uppercase px-2 py-0.5" style={{ fontSize: '0.65rem' }}>Ad Strategy</span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.82rem' }}>Recommended Ad Type</h6>
                  </div>
                  <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                    Based on your high mobile traffic ({data.insights.devices.mobile} mobile visits) and WhatsApp clicks:
                  </p>
                  <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3 border mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-success" style={{ width: '36px', height: '36px', minWidth: '36px', background: '#ecfdf5', color: '#10b981' }}>
                      <i className="fab fa-whatsapp fs-5" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong className="text-dark d-block text-truncate" style={{ fontSize: '0.82rem' }}>
                        Click-to-WhatsApp Meta Ads
                      </strong>
                      <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
                        WhatsApp has a 4.5× higher checkout rate in Pakistan
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#047857' }} className="fw-semibold mt-2">
                  <i className="fas fa-comments me-1.5" />
                  Use Instagram Reels ads + "Order via WhatsApp" CTA.
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Google Trends Market Intelligence ── */}
      <Card>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border-bottom pb-2 mb-3 gap-2">
          <div>
            <Ttl>📊 Google Trends Market Intelligence</Ttl>
            <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.72rem' }}>
              Real-time consumer search trends & demand analytics for Pakistan, Punjab (covers Rawalpindi) & Islamabad.
            </p>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="text-muted small fw-semibold d-none d-lg-inline">Presets:</span>
            {categories && categories.length > 0 ? (
              categories.map((cat) => {
                const normalizedCatName = cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id || cat._id || cat.slug}
                    type="button"
                    onClick={() => {
                      setTrendsKeyword(normalizedCatName);
                      setCustomTrendsKeyword('');
                    }}
                    className={`btn btn-xs rounded-pill px-2.5 py-0.5 border-0 ${trendsKeyword === normalizedCatName ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      background: trendsKeyword === normalizedCatName ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })
            ) : (
              [
                { label: 'Smartwatch', val: 'smartwatch' },
                { label: 'Earbuds', val: 'earbuds' },
                { label: 'Charger', val: 'charger' },
                { label: 'Air Freshener', val: 'air freshener' }
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => {
                    setTrendsKeyword(p.val);
                    setCustomTrendsKeyword('');
                  }}
                  className={`btn btn-xs rounded-pill px-2.5 py-0.5 border-0 ${trendsKeyword === p.val ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    background: trendsKeyword === p.val ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
                  }}
                >
                  {p.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-5">
            <label className="form-label text-muted small fw-semibold mb-1">Search Term / Keyword</label>
            <div className="input-group input-group-sm">
              <input
                type="text"
                value={customTrendsKeyword}
                onChange={e => setCustomTrendsKeyword(e.target.value)}
                placeholder="Type custom keyword (e.g. mobile stand)"
                className="form-control rounded-start-pill px-3"
                style={{ fontSize: '0.78rem' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customTrendsKeyword.trim()) {
                    setTrendsKeyword(customTrendsKeyword.trim());
                  }
                }}
                className="btn btn-primary rounded-end-pill px-3 text-white fw-bold"
                style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none', fontSize: '0.78rem' }}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label text-muted small fw-semibold mb-1">Geographic Target</label>
            <select
              value={trendsGeo}
              onChange={e => setTrendsGeo(e.target.value)}
              className="form-select form-select-sm rounded-pill px-3 fw-semibold text-dark"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="PK">🇵🇰 Pakistan (National)</option>
              <option value="PK-PB">📍 Punjab (incl. Rawalpindi)</option>
              <option value="PK-IS">📍 Islamabad Capital Territory</option>
              <option value="PK-SD">📍 Sindh (incl. Karachi)</option>
              <option value="PK-KP">📍 Khyber Pakhtunkhwa (incl. Peshawar)</option>
            </select>
          </div>

          <div className="col-6 col-md-4">
            <label className="form-label text-muted small fw-semibold mb-1">Time Range</label>
            <select
              value={trendsTime}
              onChange={e => setTrendsTime(e.target.value)}
              className="form-select form-select-sm rounded-pill px-3 fw-semibold text-dark"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="today 1-m">Last 30 Days</option>
              <option value="today 3-m">Last 90 Days</option>
              <option value="today 12-m">Last 12 Months</option>
              <option value="today 5-y">Last 5 Years</option>
            </select>
          </div>
        </div>

        {/* Current Target Indicator */}
        <div className="alert alert-light border d-flex flex-wrap align-items-center gap-1.5 py-2 px-3 mb-3 rounded-3" style={{ fontSize: '0.75rem' }}>
          <i className="fas fa-chart-line text-primary" />
          <span className="text-muted">Analyzing Trends for:</span>
          <strong className="text-dark">"{trendsKeyword}"</strong>
          <span className="text-muted">in</span>
          <strong className="text-dark">
            {trendsGeo === 'PK' ? 'Pakistan (National)' :
             trendsGeo === 'PK-PB' ? 'Punjab (covers Rawalpindi)' :
             trendsGeo === 'PK-IS' ? 'Islamabad' :
             trendsGeo === 'PK-SD' ? 'Sindh' : 'Khyber Pakhtunkhwa'}
          </strong>
          <span className="text-muted">over</span>
          <strong className="text-dark">
            {trendsTime === 'today 1-m' ? 'Last 30 Days' :
             trendsTime === 'today 3-m' ? 'Last 90 Days' :
             trendsTime === 'today 12-m' ? 'Last 12 Months' : 'Last 5 Years'}
          </strong>
        </div>

        {/* Widgets Grid */}
        {trendsLoaded ? (
          <div className="row g-3">
            {/* Chart Widget */}
            <div className="col-12 col-lg-7">
              <div className="bg-light rounded-4 border p-2 overflow-hidden position-relative" style={{ height: '350px', borderColor: '#e2e8f0' }}>
                <GoogleTrendsWidget
                  widgetType="TIMESERIES"
                  keyword={trendsKeyword}
                  geo={trendsGeo}
                  time={trendsTime}
                />
              </div>
            </div>

            {/* Map/Subregion Widget */}
            <div className="col-12 col-lg-5">
              <div className="bg-light rounded-4 border p-2 overflow-hidden position-relative" style={{ height: '350px', borderColor: '#e2e8f0' }}>
                <GoogleTrendsWidget
                  widgetType="GEO_MAP"
                  keyword={trendsKeyword}
                  geo={trendsGeo}
                  time={trendsTime}
                />
              </div>
            </div>

            {/* Related Queries Widget */}
            <div className="col-12 col-lg-6">
              <div className="bg-light rounded-4 border p-2 overflow-hidden position-relative" style={{ height: '350px', borderColor: '#e2e8f0' }}>
                <GoogleTrendsWidget
                  widgetType="RELATED_QUERIES"
                  keyword={trendsKeyword}
                  geo={trendsGeo}
                  time={trendsTime}
                />
              </div>
            </div>

            {/* Related Topics Widget */}
            <div className="col-12 col-lg-6">
              <div className="bg-light rounded-4 border p-2 overflow-hidden position-relative" style={{ height: '350px', borderColor: '#e2e8f0' }}>
                <GoogleTrendsWidget
                  widgetType="RELATED_TOPICS"
                  keyword={trendsKeyword}
                  geo={trendsGeo}
                  time={trendsTime}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '330px' }}>
            <div className="spinner-border text-primary mb-2" role="status" />
            <span className="text-muted small">Loading Google Trends Market Data...</span>
          </div>
        )}
      </Card>

      {/* ── Market Intelligence & Ad Finder ── */}
      <MarketIntelligenceDashboard key={trendsKeyword} initialQuery={trendsKeyword} />
      </div>


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
