'use client';

import React from 'react';
import { ThemeIcon } from '../common/ThemeIcon';
import { useSiteTheme } from '../common/DynamicThemeProvider';

const SERVICES = [
  { icon: 'sync', title: 'Free Return', desc: '30-day money back guarantee', color: 'var(--pd-primary)' },
  { icon: 'shipping', title: 'Fast Shipping', desc: 'Free on all orders', color: 'var(--pd-accent)' },
  { icon: 'headset', title: 'Support 24/7', desc: 'Online help around the clock', color: '#8b5cf6' },
  { icon: 'gift', title: 'Gift Cards', desc: 'For orders above PKR 5,000', color: '#ec4899' },
  { icon: 'shield', title: 'Secure Payment', desc: 'Your data is always safe', color: 'var(--pd-success)' },
  { icon: 'star', title: 'Top Rated', desc: '4.9★ average customer rating', color: '#eab308' },
];

export function HomeServicesSection() {
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  if (isCleanWhite) {
    return (
      <section className="border-y border-slate-200/60 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 flex-shrink-0">
                <i className="fas fa-truck text-lg" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Fast Shipping</h4>
                <p className="text-xs text-slate-500 mt-0.5">Nationwide delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 flex-shrink-0">
                <i className="fas fa-undo text-lg" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">7-Day Returns</h4>
                <p className="text-xs text-slate-500 mt-0.5">Money back guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 flex-shrink-0">
                <i className="fas fa-headset text-lg" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">24/7 Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">WhatsApp assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 flex-shrink-0">
                <i className="fas fa-shield-alt text-lg" style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">100% Authentic</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verified products</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isModernGreen) {
    return (
      <section className="usp-banner-strip py-4">
        <div className="container-fluid px-3 px-lg-5">
          <div className="row g-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="col-6 col-md-4 col-lg-2">
                <div className="service-card text-center p-3 h-100 rounded-3">
                  <div className="service-icon-wrap mx-auto mb-2">
                    <ThemeIcon name={s.icon} className="fs-5" style={{ color: '#d4af37' }} />
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>{s.title}</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 border-bottom bg-white">
      <div className="container-fluid px-3 px-lg-5">
        <div className="row g-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="col-6 col-md-4 col-lg-2">
              <div className="service-card text-center p-3 h-100 rounded-3 border bg-light">
                <div className="service-icon-wrap mx-auto mb-2">
                  <ThemeIcon name={s.icon} className="fs-5" style={{ color: s.color }} />
                </div>
                <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.85rem' }}>{s.title}</h6>
                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
