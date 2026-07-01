'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

interface TimeSeriesItem {
  name: string;
  Revenue: number;
  Pageviews: number;
  Conversion: number;
}

interface DeviceItem {
  name: string;
  value: number;
  color: string;
}

interface AgeItem {
  name: string;
  count: number;
}

export function TrendChart({ data }: { data: TimeSeriesItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ea580c" stopOpacity="0.35" />
            <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity="0.25" />
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
  );
}

export function DeviceBreakdownChart({ data }: { data: DeviceItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
          {data.map((e, i) => <Cell key={i} fill={e.color} />)}
        </Pie>
        <Tooltip formatter={v => `${v} hits`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AgeBreakdownChart({ data }: { data: AgeItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart data={data} barSize={20} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
        <XAxis dataKey="name" fontSize={9} tickLine={false} stroke="#94a3b8" />
        <YAxis fontSize={9} tickLine={false} stroke="#94a3b8" />
        <Tooltip />
        <Bar dataKey="count" fill="#6366f1" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConversionRateChart({ data }: { data: TimeSeriesItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity="0.35" />
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
  );
}
