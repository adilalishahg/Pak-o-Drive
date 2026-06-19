'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AnalyticsData {
  stats: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    conversionRate: number;
    uniqueSessionsCount: number;
  };
  marketing: Array<{
    source: string;
    visits: number;
    add_to_carts: number;
    purchases: number;
    revenue: number;
    roas: number;
  }>;
  insights: {
    searches: Array<{ keyword: string; count: number }>;
    categories: Array<{ category: string; count: number }>;
    devices: {
      mobile: number;
      desktop: number;
    };
    demographics?: {
      age: Array<{ range: string; count: number }>;
      gender: Array<{ gender: string; count: number }>;
    };
    platforms?: {
      os: Array<{ os: string; count: number }>;
      browsers: Array<{ browser: string; count: number }>;
    };
    locations?: Array<{ city: string; count: number }>;
  };
  feed: Array<{
    _id: string;
    description: string;
    device: 'Mobile' | 'Desktop';
    source: string;
    timestamp: string;
  }>;
  charts: {
    labels: string[];
    revenue: number[];
    conversion: number[];
  };
}

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to load analytics.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to analytics database.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger border-0 m-4" role="alert">
        <i className="fas fa-exclamation-circle me-2" />
        {error || 'No analytics data available.'}
      </div>
    );
  }

  // Format chart data for Recharts
  const timeSeriesData = data.charts.labels.map((label, idx) => ({
    name: label,
    Revenue: data.charts.revenue[idx],
    Conversion: parseFloat(data.charts.conversion[idx].toFixed(2))
  }));

  const devicePieData = [
    { name: 'Mobile', value: data.insights.devices.mobile, color: '#f97316' },
    { name: 'Desktop', value: data.insights.devices.desktop, color: '#0f172a' }
  ];

  return (
    <div className="fade-in space-y-6">
      {/* Header card */}
      <div className="bg-white border-0 shadow-sm rounded-3xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h5 className="font-extrabold text-slate-800 text-xl tracking-tight">Marketing & Traffic Intelligence</h5>
            <p className="text-slate-400 text-xs mt-1">
              Analyze UTM campaign attribution, return on ad spend (ROAS), and real-time storefront sales conversion.
            </p>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs px-4 py-2.5 rounded-full transition-all font-semibold"
          >
            <i className="fas fa-sync-alt" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { 
            title: 'Total Revenue', 
            value: `PKR ${data.stats.revenue.toLocaleString()}`, 
            icon: 'fas fa-wallet', 
            color: 'from-orange-500 to-amber-500', 
            subtitle: 'Cumulative order income' 
          },
          { 
            title: 'Average Order Value (AOV)', 
            value: `PKR ${Math.round(data.stats.averageOrderValue).toLocaleString()}`, 
            icon: 'fas fa-shopping-basket', 
            color: 'from-blue-600 to-indigo-600', 
            subtitle: 'Average billing per cart' 
          },
          { 
            title: 'Store Conversion Rate', 
            value: `${data.stats.conversionRate.toFixed(2)}%`, 
            icon: 'fas fa-percentage', 
            color: 'from-emerald-500 to-teal-500', 
            subtitle: 'Sessions to sales ratio' 
          },
          { 
            title: 'Active User Sessions', 
            value: data.stats.uniqueSessionsCount.toLocaleString(), 
            icon: 'fas fa-users', 
            color: 'from-slate-700 to-slate-900', 
            subtitle: 'Total unique visitors' 
          }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{kpi.title}</span>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-sm`}>
                <i className={`${kpi.icon} text-sm`} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</span>
              <p className="text-slate-400 text-xs mt-1.5">{kpi.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Revenue & Conversion Trend (7 Days)</h6>
            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-2xs font-bold uppercase">Weekly metrics</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area name="Sales Revenue (PKR)" type="monotone" dataKey="Revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Pie Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Device Breakdown</h6>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-2xs font-semibold">User agents</span>
            </div>
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={devicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {devicePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} hits`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800">
                  {Math.round((data.insights.devices.mobile / (data.insights.devices.mobile + data.insights.devices.desktop || 1)) * 100)}%
                </span>
                <span className="text-slate-400 text-3xs uppercase tracking-widest font-semibold mt-0.5">Mobile</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {devicePieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-semibold text-slate-600">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demographics, Platforms & Geolocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Visitor Locations */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="border-b pb-4 mb-4">
            <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Top Cities (Visitor Locations)</h6>
          </div>
          <div className="space-y-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {data.insights.locations && data.insights.locations.length > 0 ? (
              data.insights.locations.map((loc, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700 text-xs flex align-items-center gap-2">
                    <i className="fas fa-map-marker-alt text-orange-500" />
                    {loc.city}
                  </span>
                  <span className="badge bg-slate-200 text-slate-700 px-2.5 py-1 text-3xs rounded-full font-bold">
                    {loc.count} pageviews
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted text-xs">No city location data available yet.</div>
            )}
          </div>
        </div>

        {/* Demographics: Age & Gender */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between" style={{ minHeight: '380px' }}>
          <div>
            <div className="border-b pb-4 mb-4">
              <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Gender Breakdown</h6>
            </div>
            <div className="space-y-3">
              {data.insights.demographics?.gender && data.insights.demographics.gender.length > 0 ? (
                data.insights.demographics.gender.map((g, idx) => {
                  const total = data.insights.demographics?.gender.reduce((sum, item) => sum + item.count, 0) || 1;
                  const pct = Math.round((g.count / total) * 100);
                  
                  return (
                    <div key={idx} className="mb-2">
                      <div className="d-flex justify-content-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="text-capitalize">{g.gender}</span>
                        <span>{g.count} users ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: '8px', borderRadius: '4px', background: '#f1f5f9' }}>
                        <div
                          className={`progress-bar rounded-pill ${g.gender.toLowerCase() === 'female' ? 'bg-pink-500' : g.gender.toLowerCase() === 'male' ? 'bg-orange-500' : 'bg-slate-500'}`}
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted text-xs">No gender demographic data available yet.</div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <h6 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">Age Groups Distribution</h6>
            <div className="d-flex justify-content-between gap-1 align-items-end h-28">
              {data.insights.demographics?.age && data.insights.demographics.age.length > 0 ? (
                data.insights.demographics.age.map((a, idx) => {
                  const total = data.insights.demographics?.age.reduce((sum, item) => sum + item.count, 0) || 1;
                  const pct = (a.count / total) * 100;
                  
                  return (
                    <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                      <span className="text-3xs font-bold text-slate-500 mb-1">{a.count}</span>
                      <div
                        className="w-8 rounded-t-lg bg-indigo-500 transition-all"
                        style={{ height: `${Math.max(pct * 1.5, 4)}px` }}
                      />
                      <span className="text-3xs font-semibold text-slate-400 mt-2">{a.range}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted text-xs w-full">No age demographic data available yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Operating Systems & Browsers */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100" style={{ minHeight: '380px' }}>
          <div className="border-b pb-4 mb-4">
            <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Device OS & Browser Platform</h6>
          </div>
          <div className="row g-3">
            <div className="col-6 border-end" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <span className="text-slate-400 text-3xs font-bold uppercase tracking-widest block mb-2">Operating Systems</span>
              <div className="space-y-2">
                {data.insights.platforms?.os && data.insights.platforms.os.length > 0 ? (
                  data.insights.platforms.os.map((osItem, idx) => (
                    <div key={idx} className="text-xs d-flex align-items-center justify-content-between">
                      <span className="text-slate-700 font-semibold">{osItem.os}</span>
                      <span className="text-slate-400 font-bold">{osItem.count} hits</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-3xs py-3 text-center">No OS data.</div>
                )}
              </div>
            </div>
            
            <div className="col-6" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <span className="text-slate-400 text-3xs font-bold uppercase tracking-widest block mb-2">Web Browsers</span>
              <div className="space-y-2">
                {data.insights.platforms?.browsers && data.insights.platforms.browsers.length > 0 ? (
                  data.insights.platforms.browsers.map((bItem, idx) => (
                    <div key={idx} className="text-xs d-flex align-items-center justify-content-between">
                      <span className="text-slate-700 font-semibold">{bItem.browser}</span>
                      <span className="text-slate-400 font-bold">{bItem.count} hits</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-3xs py-3 text-center">No browser data.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Attribution & ROAS Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Attribution table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="border-b pb-4 mb-6">
            <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Marketing Channel & UTM Attribution</h6>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead>
                <tr className="text-left text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Source Channel</th>
                  <th className="pb-3 text-center">Visits</th>
                  <th className="pb-3 text-center">Add to Carts</th>
                  <th className="pb-3 text-center">Purchases</th>
                  <th className="pb-3 text-right">Revenue (PKR)</th>
                  <th className="pb-3 text-right">Estimated ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.marketing.map((channel, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 flex items-center gap-2 text-capitalize">
                      <span className={`w-2.5 h-2.5 rounded-full ${channel.source.includes('instagram') ? 'bg-pink-500' : channel.source.includes('tiktok') ? 'bg-cyan-500' : 'bg-slate-400'}`} />
                      {channel.source}
                    </td>
                    <td className="py-3 text-center font-medium">{channel.visits}</td>
                    <td className="py-3 text-center font-medium">{channel.add_to_carts}</td>
                    <td className="py-3 text-center font-medium">{channel.purchases}</td>
                    <td className="py-3 text-right font-semibold text-slate-800">PKR {channel.revenue.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      {channel.roas > 0 ? (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {channel.roas.toFixed(1)}x
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Keywords Intent */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="border-b pb-4 mb-6">
            <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Customer Search Intents</h6>
          </div>
          <div className="space-y-4">
            {data.insights.searches.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700 text-xs">"{s.keyword}"</span>
                <span className="badge bg-slate-200 text-slate-700 px-2 py-1 text-2xs rounded-full font-bold">
                  {s.count} searches
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h6 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Live Customer Activity Feed</h6>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {data.feed.map((act) => (
            <div key={act._id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <i className={act.device === 'Mobile' ? 'fas fa-mobile-alt text-sm' : 'fas fa-desktop text-sm'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{act.description}</p>
                <div className="flex items-center gap-3 mt-1.5 text-3xs text-slate-400 uppercase tracking-wider font-bold">
                  <span className="text-capitalize">{act.source} Campaign</span>
                  <span>•</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
