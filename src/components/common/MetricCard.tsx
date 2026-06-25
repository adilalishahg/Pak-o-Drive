'use client';

import React, { useState, useEffect } from 'react';

interface MetricCardProps {
  title: string;
  metricType: string;
  initialValue: number;
  formatValue: (val: number) => string;
  iconClass: string;
  iconBg: string;
  iconColor: string;
  footerContent?: React.ReactNode;
  globalRange?: string;
  className?: string;
}

export default function MetricCard({
  title,
  metricType,
  initialValue,
  formatValue,
  iconClass,
  iconBg,
  iconColor,
  footerContent,
  globalRange,
  className = ''
}: MetricCardProps) {
  const [range, setRange] = useState('this week');
  const [value, setValue] = useState<number>(initialValue);
  const [loading, setLoading] = useState(false);

  // Sync value when initialValue changes (due to global updates or initial mount)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Sync range when globalRange changes
  useEffect(() => {
    if (globalRange) {
      const mappedRange = 
        globalRange === '7days' ? 'this week' :
        globalRange === '30days' ? 'this month' :
        globalRange === 'all' ? 'this year' :
        globalRange;
      setRange(mappedRange);
    }
  }, [globalRange]);

  const handleRangeChange = async (newRange: string) => {
    setRange(newRange);
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/card-metric?type=${metricType}&range=${encodeURIComponent(newRange)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setValue(json.value);
      } else {
        console.error(`Error fetching ${metricType} for range ${newRange}:`, json.error);
        setValue(0);
      }
    } catch (err) {
      console.error(`Exception fetching ${metricType} for range ${newRange}:`, err);
      setValue(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card border-0 shadow-sm rounded-4 bg-white h-100 ${className}`} style={{ padding: '14px', position: 'relative' }}>
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.4px' }}>
            {title}
          </p>
          <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: 'clamp(0.82rem, 3.5vw, 1.4rem)', lineHeight: 1.2, wordBreak: 'break-word' }}>
            {loading ? (
              <span className="spinner-border spinner-border-sm text-secondary" role="status" style={{ width: '1rem', height: '1rem', display: 'inline-block' }} />
            ) : (
              formatValue(value)
            )}
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '34px', height: '34px', minWidth: '34px', background: iconBg, color: iconColor }}>
            <i className={`fas ${iconClass}`} style={{ fontSize: '13px' }} />
          </div>
          <select 
            value={range} 
            onChange={(e) => handleRangeChange(e.target.value)} 
            className="border-0 bg-light rounded px-1 py-0 text-muted" 
            style={{ fontSize: '0.62rem', width: 'auto', minWidth: '80px', height: '20px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="today">Today</option>
            <option value="this week">This Week</option>
            <option value="this month">This Month</option>
            <option value="this year">This Year</option>
          </select>
        </div>
      </div>
      {footerContent && <div style={{ marginTop: 'auto' }}>{footerContent}</div>}
    </div>
  );
}
