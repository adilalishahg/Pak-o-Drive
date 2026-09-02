'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeIcon } from '../common/ThemeIcon';
import { useSiteTheme } from '../common/DynamicThemeProvider';

const STATS = [
  { value: 15000, label: 'Happy Customers', suffix: '+', icon: 'smile' },
  { value: 500, label: 'Products Listed', suffix: '+', icon: 'box' },
  { value: 98, label: 'Satisfaction Rate', suffix: '%', icon: 'star' },
  { value: 5, label: 'Years in Business', suffix: '+', icon: 'award' },
];

function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounterItem({ value, label, suffix, icon, trigger }: typeof STATS[number] & { trigger: boolean }) {
  const count = useCountUp(value, 1800, trigger);
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  if (isModernGreen || isCleanWhite) {
    const iconColor = isModernGreen ? '#d4af37' : theme.primaryColor;
    const textColor = isModernGreen ? '#0d231d' : '#1e293b';
    const labelColor = isModernGreen ? '#eae7db' : '#64748b';
    return (
      <div className="col-6 col-md-3 text-center py-4">
        <div className="usp-circle mb-3">
          <ThemeIcon name={icon} className="fs-4 mb-1" style={{ color: iconColor }} />
          <span className="fw-bold" style={{ fontSize: '1.1rem', color: textColor }}>
            {count.toLocaleString()}{suffix}
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', color: labelColor, fontWeight: 600 }}>{label}</span>
      </div>
    );
  }

  return (
    <div className="col-6 col-md-3 text-center py-4">
      <ThemeIcon name={icon} className="fa-2x mb-2 d-block" style={{ color: 'var(--pd-primary)' }} />
      <span className="counter-number d-block">{count.toLocaleString()}{suffix}</span>
      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export function HomeStatsSection() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={statsRef} className={`py-5 ${isModernGreen ? 'stats-section-green' : isCleanWhite ? 'bg-slate-50 border-y border-slate-200/60' : 'bg-light border-top border-bottom'}`}>
      <div className="container-fluid px-3 px-lg-5">
        <div className="row g-3">
          {STATS.map((s) => (
            <StatCounterItem key={s.label} {...s} trigger={statsVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
