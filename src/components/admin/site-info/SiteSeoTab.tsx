'use client';

import React from 'react';

interface SiteSeoTabProps {
  info: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setInfo: React.Dispatch<React.SetStateAction<any>>;
}

export function SiteSeoTab({ info, handleChange, setInfo }: SiteSeoTabProps) {
  return (
    <div className="fade-in">
      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">SEO & Browser Tab Icons Settings</h6>
      
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Site Header Logo Icon</label>
          <select
            name="logoIcon"
            value={info.logoIcon || 'shopping-bag'}
            onChange={handleChange}
            className="form-select rounded-3"
          >
            <option value="shopping-bag">Shopping Bag (Default)</option>
            <option value="shopping-cart">Shopping Cart</option>
            <option value="laptop">Laptop / PC</option>
            <option value="mobile">Mobile Phone</option>
            <option value="headset">Headset</option>
            <option value="plug">Power Plug</option>
            <option value="bolt">Flash / Bolt</option>
            <option value="fire">Fire / Hot</option>
            <option value="heart">Heart</option>
          </select>
          <div className="form-text small">Choose the icon displayed next to your brand logo in the navigation header.</div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Custom Icon Class (Optional)</label>
          <input
            type="text"
            name="logoIcon"
            value={info.logoIcon || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. fas fa-desktop"
          />
          <div className="form-text small">Or type any FontAwesome icon class name. Overrides dropdown selection.</div>
        </div>

        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Website Favicon URL</label>
          <input
            type="text"
            name="favicon"
            value={info.favicon || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. /favicon.ico"
          />
          <div className="form-text small">The URL of the tab icon. You can use standard `/favicon.ico` or any uploaded image URL.</div>
        </div>
      </div>

      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-4">Search Engine Optimization (SEO) Metadata</h6>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Default Browser Tab Meta Title</label>
          <input
            type="text"
            name="seoTitle"
            value={info.seoTitle || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Pak-o-Drive™ (PakDrive) | Pakistan's #1 Car Accessories & Auto Gadgets Store"
          />
          <div className="form-text small">This is the title search engines show. Recommended: 50-60 characters.</div>
        </div>

        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Default Meta Description</label>
          <textarea
            name="seoDescription"
            value={info.seoDescription || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={3}
            placeholder="e.g. Pak-o-Drive (Pak Drive / PakDrive) is Pakistan's premier online automotive accessories & viral car gadgets store."
          />
          <div className="form-text small">Summarize your shop details for search engine listing snippets. Recommended: 150-160 characters.</div>
        </div>

        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Default Meta Keywords (Comma separated)</label>
          <input
            type="text"
            name="seoKeywords"
            value={info.seoKeywords || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. pakdrive, pak drive, pakodrive, pak o drive, pakdrives, car accessories pakistan, viral car gadgets"
          />
          <div className="form-text small">Provide search phrases separated by commas.</div>
        </div>

        <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-4">Homepage H1 Heading &amp; Search Engine Brand Aliases</h6>
        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Homepage Primary &lt;H1&gt; Heading</label>
          <input
            type="text"
            name="h1Heading"
            value={info.h1Heading || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's #1 Car Accessories, Viral Auto Gadgets & LED Lights Store"
          />
          <div className="form-text small">This is the critical top-level H1 heading indexed by Google for broad search intent.</div>
        </div>

        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Brand Aliases &amp; Alternate Names (Comma separated)</label>
          <input
            type="text"
            value={Array.isArray(info.brandAliases) ? info.brandAliases.join(', ') : (info.brandAliases || '')}
            onChange={e => {
              const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setInfo((prev: any) => ({ ...prev, brandAliases: arr }));
            }}
            className="form-control rounded-3"
            placeholder="e.g. Pak Drive, Pak-o-Drive, PakODrive, PakDrive, Pak Drives, pakdriv, pakdrv, پاک او ڈرائیو"
          />
          <div className="form-text small">Used in Schema.org Organization, WebSite alternateName, and knowledge graph queries.</div>
        </div>

        <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-4">Dedicated Sub-Pages Dynamic SEO Metadata</h6>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Shop / All Products Page SEO Title</label>
          <input
            type="text"
            name="shopSeoTitle"
            value={info.shopSeoTitle || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Shop Car Accessories & Auto Gadgets in Pakistan | Pak-o-Drive (Pak Drive)"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Shop / All Products Page SEO Description</label>
          <textarea
            name="shopSeoDescription"
            value={info.shopSeoDescription || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={2}
            placeholder="Browse all viral car accessories, LED headlights, ambient lighting, car perfumes..."
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">About Us Page SEO Title</label>
          <input
            type="text"
            name="aboutSeoTitle"
            value={info.aboutSeoTitle || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. About Pak-o-Drive (Pak Drive) | Pakistan's #1 Car Accessories Brand"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">About Us Page SEO Description</label>
          <textarea
            name="aboutSeoDescription"
            value={info.aboutSeoDescription || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={2}
            placeholder="Learn about Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's leading automotive accessories..."
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Contact Page SEO Title</label>
          <input
            type="text"
            name="contactSeoTitle"
            value={info.contactSeoTitle || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Contact Customer Support | Pak-o-Drive (Pak Drive)"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Contact Page SEO Description</label>
          <textarea
            name="contactSeoDescription"
            value={info.contactSeoDescription || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={2}
            placeholder="Need help with your car accessories order? Contact Pak-o-Drive customer support..."
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Track Order Page SEO Title</label>
          <input
            type="text"
            name="trackOrderSeoTitle"
            value={info.trackOrderSeoTitle || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Track Your Order Status | Pak-o-Drive (Pak Drive)"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Track Order Page SEO Description</label>
          <textarea
            name="trackOrderSeoDescription"
            value={info.trackOrderSeoDescription || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={2}
            placeholder="Track your Pak-o-Drive parcel in real time. Enter your Order ID and phone number..."
          />
        </div>
      </div>
    </div>
  );
}
