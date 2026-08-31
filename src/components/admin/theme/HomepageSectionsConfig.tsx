'use client';

import React from 'react';
import { SiteTheme } from '../../common/DynamicThemeProvider';
import { SectionCard } from './ThemeUIPrimitives';
import { optimizeImageBeforeUpload } from '../../../utils/imageOptimizer';

interface HomepageSectionsConfigProps {
  form: SiteTheme;
  onUpdateSection: (sectionKey: string, field: string, val: any) => void;
}

export function HomepageSectionsConfig({ form, onUpdateSection }: HomepageSectionsConfigProps) {
  const hs = form.homepageSections || ({} as any);

  const sections = [
    {
      key: 'weeklyDeal',
      label: 'Weekly Deal Banner',
      icon: 'fas fa-calendar-week',
      fields: [
        { f: 'label', label: 'Badge / Label', ph: 'The Big Deal This Week' },
        { f: 'title', label: 'Deal Title', ph: 'Apple iPhone 12 Pro Max' },
        { f: 'description', label: 'Description', ph: 'Deal description...' },
        { f: 'buttonText', label: 'Button Text', ph: 'Shop Now' },
        { f: 'buttonLink', label: 'Button Link', ph: '/shop' },
        { f: 'imageUrl', label: 'Banner Image', isImage: true },
      ],
    },
    {
      key: 'offerBanner1',
      label: 'Offer Banner 1 (Top Left)',
      icon: 'fas fa-tag',
      fields: [
        { f: 'subtitle', label: 'Subtitle', ph: 'Special Discount' },
        { f: 'title', label: 'Title', ph: 'TWS Earbuds' },
        { f: 'discount', label: 'Discount Badge', ph: '50% Off' },
        { f: 'buttonLink', label: 'Button Link', ph: '/shop?category=headphones' },
        { f: 'imageUrl', label: 'Banner Image', isImage: true },
      ],
    },
    {
      key: 'offerBanner2',
      label: 'Offer Banner 2 (Top Right)',
      icon: 'fas fa-percentage',
      fields: [
        { f: 'subtitle', label: 'Subtitle', ph: 'Find The Best Smartwatches' },
        { f: 'title', label: 'Title', ph: 'Smart Wearables' },
        { f: 'discount', label: 'Discount Badge', ph: '20% Off' },
        { f: 'buttonLink', label: 'Button Link', ph: '/shop?category=smartwatches' },
        { f: 'imageUrl', label: 'Banner Image', isImage: true },
      ],
    },
  ];

  return (
    <SectionCard title="Other Homepage Banners & Sections" icon="fas fa-th-large">
      <div className="d-flex flex-column gap-3">
        {/* Deal & Offer Banners */}
        {sections.map((sec) => {
          const secData = (hs as any)[sec.key] || {};
          const isEnabled = secData.enabled !== false;

          return (
            <div key={sec.key} className="border rounded-3 overflow-hidden">
              <div className="px-3 py-2 bg-white d-flex align-items-center justify-content-between">
                <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                  <i className={`${sec.icon} text-primary`} /> {sec.label}
                </span>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input my-0"
                    type="checkbox"
                    role="switch"
                    checked={isEnabled}
                    onChange={(e) => onUpdateSection(sec.key, 'enabled', e.target.checked)}
                  />
                </div>
              </div>

              {isEnabled && (
                <div className="p-3 bg-light border-top">
                  <div className="row g-2">
                    {sec.fields.map(({ f, label, ph, isImage }) => (
                      <div
                        key={f}
                        className={
                          f === 'title' || f === 'subtitle' || f === 'description'
                            ? 'col-12'
                            : 'col-12 col-md-6'
                        }
                      >
                        {isImage ? (
                          <div>
                            <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {label}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control form-control-sm"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const opt = await optimizeImageBeforeUpload(file);
                                  const fd = new FormData();
                                  fd.append('file', opt);
                                  const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                  const j = await res.json();
                                  if (j.success) {
                                    onUpdateSection(sec.key, f, j.url);
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            />
                            {secData[f] && (
                              <div className="mt-1 small text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                                Current: {secData[f]}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {label}
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={secData[f] || ''}
                              placeholder={ph}
                              onChange={(e) => onUpdateSection(sec.key, f, e.target.value)}
                              style={{ fontSize: '0.82rem' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Trending Products */}
        <div className="border rounded-3 overflow-hidden">
          <div className="px-3 py-2 bg-white d-flex align-items-center justify-content-between">
            <span className="fw-bold text-dark small d-flex align-items-center gap-2">
              <i className="fas fa-fire text-primary" /> Trending Products Section
            </span>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input my-0"
                type="checkbox"
                role="switch"
                checked={hs.trendingProducts?.enabled !== false}
                onChange={(e) => onUpdateSection('trendingProducts', 'enabled', e.target.checked)}
              />
            </div>
          </div>
          {hs.trendingProducts?.enabled !== false && (
            <div className="p-3 bg-light border-top row g-2">
              <div className="col-12 col-md-8">
                <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Section Title
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={hs.trendingProducts?.title || ''}
                  placeholder="Trending Products"
                  onChange={(e) => onUpdateSection('trendingProducts', 'title', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Products Limit
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={2}
                  max={8}
                  value={hs.trendingProducts?.limit || 4}
                  onChange={(e) => onUpdateSection('trendingProducts', 'limit', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Collections */}
        <div className="border rounded-3 overflow-hidden">
          <div className="px-3 py-2 bg-white d-flex align-items-center justify-content-between">
            <span className="fw-bold text-dark small d-flex align-items-center gap-2">
              <i className="fas fa-th text-primary" /> Top Collections Section
            </span>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input my-0"
                type="checkbox"
                role="switch"
                checked={hs.collections?.enabled !== false}
                onChange={(e) => onUpdateSection('collections', 'enabled', e.target.checked)}
              />
            </div>
          </div>
          {hs.collections?.enabled !== false && (
            <div className="p-3 bg-light border-top">
              <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                Section Title
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={hs.collections?.title || ''}
                placeholder="The Top Collections"
                onChange={(e) => onUpdateSection('collections', 'title', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Value Props */}
        <div className="border rounded-3 overflow-hidden">
          <div className="px-3 py-2 bg-white d-flex align-items-center justify-content-between">
            <span className="fw-bold text-dark small d-flex align-items-center gap-2">
              <i className="fas fa-award text-primary" /> Value Propositions Strip (Guarantees & COD)
            </span>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input my-0"
                type="checkbox"
                role="switch"
                checked={hs.valueProps?.enabled !== false}
                onChange={(e) => onUpdateSection('valueProps', 'enabled', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
