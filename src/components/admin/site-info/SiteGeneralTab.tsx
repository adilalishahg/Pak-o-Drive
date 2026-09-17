'use client';

import React from 'react';

interface SiteGeneralTabProps {
  info: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setInfo: React.Dispatch<React.SetStateAction<any>>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoUploading: boolean;
}

export function SiteGeneralTab({
  info,
  handleChange,
  setInfo,
  handleLogoUpload,
  logoUploading,
}: SiteGeneralTabProps) {
  return (
    <div className="fade-in">
      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">General Branding Settings</h6>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Site Title Name</label>
          <input
            type="text"
            name="siteName"
            value={info.siteName || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. PAKODRIVE"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Site Logo Text</label>
          <input
            type="text"
            name="logoText"
            value={info.logoText || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Electro"
          />
        </div>
        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Site Tagline</label>
          <input
            type="text"
            name="siteTagline"
            value={info.siteTagline || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Pakistan's Trusted Electronics Store"
          />
        </div>

        {/* Logo Image Upload & Toggle Section */}
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Upload Brand Logo Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="form-control rounded-3"
          />
          {logoUploading && (
            <div className="d-flex align-items-center gap-1.5 mt-1 text-primary small">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Uploading logo image...</span>
            </div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Or Provide Brand Logo Image URL</label>
          <input
            type="text"
            name="logoImage"
            value={info.logoImage || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="Path: /img/logo.png or absolute URL"
          />
        </div>

        <div className="col-12">
          <div className="form-check form-switch p-0 d-flex align-items-center gap-2 mt-1">
            <input
              type="checkbox"
              name="showLogoImage"
              checked={!!info.showLogoImage}
              onChange={(e) => setInfo((prev: any) => ({ ...prev, showLogoImage: e.target.checked }))}
              className="form-check-input ms-0"
              id="showLogoImageSwitch"
              style={{ cursor: 'pointer', width: '2.5rem', height: '1.25rem' }}
            />
            <label className="form-check-label text-dark small fw-semibold mb-0" htmlFor="showLogoImageSwitch" style={{ cursor: 'pointer' }}>
              {info.showLogoImage ? 'Show Brand Logo Image on website header' : 'Show Brand Logo Text on website header'}
            </label>
          </div>
        </div>

        {info.logoImage && (
          <div className="col-12">
            <div className="bg-light p-3 rounded-3 text-center border" style={{ maxWidth: '240px' }}>
              <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="position-relative w-100">
                <img
                  src={info.logoImage}
                  alt="Brand Logo Preview"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className="text-muted small mt-2">Brand Logo Preview</div>
            </div>
          </div>
        )}
        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Newsletter Subscription Subtitle Text</label>
          <textarea
            name="newsletterText"
            value={info.newsletterText || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={3}
            placeholder="Subscribe text shown in the footer..."
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">
            🔥 Daily Trending Products AI Discovery Limit
          </label>
          <input
            type="number"
            min={3}
            max={50}
            name="trendingProductLimit"
            value={info.trendingProductLimit || 10}
            onChange={e => setInfo((prev: any) => ({ ...prev, trendingProductLimit: parseInt(e.target.value) || 10 }))}
            className="form-control rounded-3"
            placeholder="e.g. 10"
          />
          <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '3px' }}>
            Controls how many viral trending products AI intelligence finds & sends via WhatsApp daily.
          </div>
        </div>
        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Footer Copyright Text</label>
          <input
            type="text"
            name="copyrightText"
            value={info.copyrightText || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. © 2026 PAKODRIVE. All rights reserved."
          />
        </div>
      </div>
    </div>
  );
}
