'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState('7days');

  useEffect(() => { setMounted(true); fetchAnalytics('7days'); }, []);

  async function fetchAnalytics(r = range) {
    try {
      setLoading(true); setError('');
      const res = await fetch(`/api/analytics?range=${r}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) setData(json.data);
      else throw new Error(json.error || 'Failed to load.');
    } catch (e: any) {
      setError(e.message || 'Connection error.');
    } finally { setLoading(false); }
  }

  if (!mounted || loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
  if (error || !data) return <div className="alert alert-danger border-0 m-3">{error || 'No data.'}</div>;

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

  const kpis = [
    { t: 'Total Revenue',   v: `PKR ${data.stats.revenue.toLocaleString()}`,            i: 'fa-wallet',          c: '#f97316', bg: '#fff7ed' },
    { t: 'Total Orders',    v: data.stats.orders,                                        i: 'fa-shopping-bag',    c: '#3b82f6', bg: '#eff6ff' },
    { t: 'Avg. Order Value',v: `PKR ${Math.round(data.stats.averageOrderValue).toLocaleString()}`, i: 'fa-receipt', c: '#8b5cf6', bg: '#f5f3ff' },
    { t: 'Conversion Rate', v: `${data.stats.conversionRate.toFixed(2)}%`,               i: 'fa-percentage',      c: '#10b981', bg: '#ecfdf5' },
    { t: 'Unique Sessions', v: data.stats.uniqueSessionsCount,                           i: 'fa-users',           c: '#0f172a', bg: '#f8fafc' },
    { t: 'Page Views',      v: data.stats.pageviews ?? 0,                                i: 'fa-eye',             c: '#0891b2', bg: '#ecfeff' },
    { t: 'Cart Clicks',     v: data.stats.cartClicks ?? 0,                               i: 'fa-cart-plus',       c: '#059669', bg: '#f0fdf4' },
    { t: 'WhatsApp Clicks', v: data.stats.whatsappClicks ?? 0,                           i: 'fa-whatsapp',        c: '#25d366', bg: '#f0fdf4' },
  ];

  return (
    <div style={{ padding: '0 2px' }}>

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

      {/* ── 8 KPI Cards ── */}
      <div className="row g-2 mb-3">
        {kpis.map((k, i) => (
          <div key={i} className="col-6 col-sm-4 col-lg-3">
            <div className="bg-white rounded-4 shadow-sm border p-3 h-100" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-semibold" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1.3 }}>{k.t}</span>
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '30px', height: '30px', background: k.bg, color: k.c }}>
                  <i className={`fas ${k.i}`} style={{ fontSize: '12px' }} />
                </div>
              </div>
              <div className="fw-black text-dark" style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{k.v}</div>
            </div>
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

    </div>
  );
}
