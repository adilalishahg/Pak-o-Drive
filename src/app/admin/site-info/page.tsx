'use client';

import React from 'react';
import { SearchableCitySelect } from '@/components/common/SearchableCitySelect';
import { useAdminSiteInfo } from '@/hooks/useAdminSiteInfo';

export default function AdminSiteInfoPage() {
  const {
    info,
    setInfo,
    activeTab,
    setActiveTab,
    loading,
    saving,
    logoUploading,
    error,
    success,
    handleChange,
    handleLogoUpload,
    handleSubmit,
  } = useAdminSiteInfo();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <h5 className="fw-bold text-secondary mb-0">Manage Site Information & Policies</h5>
        <p className="text-muted small mb-0 mt-1">Configure global contact numbers, email settings, addresses, social networks, map locations, and store policy terms.</p>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          <i className="fas fa-exclamation-circle me-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success border-0 mb-4" role="alert">
          <i className="fas fa-check-circle me-2" />
          {success}
        </div>
      )}

      <div className="row g-4">
        {/* Navigation tabs */}
        <div className="col-12 col-md-3">
          <div className="list-group shadow-sm border-0 rounded-4 bg-white p-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 mb-1 d-flex align-items-center gap-2.5 ${activeTab === 'general' ? 'active bg-primary' : 'text-secondary'}`}
              style={{ fontWeight: 500 }}
            >
              <i className="fas fa-sliders-h" />
              <span>General Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 mb-1 d-flex align-items-center gap-2.5 ${activeTab === 'seo' ? 'active bg-primary' : 'text-secondary'}`}
              style={{ fontWeight: 500 }}
            >
              <i className="fas fa-globe" />
              <span>SEO & Site Icons</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 mb-1 d-flex align-items-center gap-2.5 ${activeTab === 'contact' ? 'active bg-primary' : 'text-secondary'}`}
              style={{ fontWeight: 500 }}
            >
              <i className="fas fa-address-book" />
              <span>Contact details</span>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 mb-1 d-flex align-items-center gap-2.5 ${activeTab === 'social' ? 'active bg-primary' : 'text-secondary'}`}
              style={{ fontWeight: 500 }}
            >
              <i className="fas fa-share-alt" />
              <span>Socials & Maps</span>
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`list-group-item list-group-item-action border-0 rounded-3 py-2.5 px-3 d-flex align-items-center gap-2.5 ${activeTab === 'policies' ? 'active bg-primary' : 'text-secondary'}`}
              style={{ fontWeight: 500 }}
            >
              <i className="fas fa-file-contract" />
              <span>Store Policies</span>
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="col-12 col-md-9">
          <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-4 bg-white p-4">
            {activeTab === 'general' && (
              <div className="fade-in">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">General Branding Settings</h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Site Title Name</label>
                    <input
                      type="text"
                      name="siteName"
                      value={info.siteName}
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
                      value={info.logoText}
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
                      value={info.siteTagline}
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
                        onChange={(e) => setInfo((prev) => ({ ...prev, showLogoImage: e.target.checked }))}
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
                      value={info.newsletterText}
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
                      onChange={e => setInfo(prev => ({ ...prev, trendingProductLimit: parseInt(e.target.value) || 10 }))}
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
                      value={info.copyrightText}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. © 2026 PAKODRIVE. All rights reserved."
                    />
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'seo' && (
              <div className="fade-in">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">SEO & Browser Tab Icons Settings</h6>
                
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Site Header Logo Icon</label>
                    <select
                      name="logoIcon"
                      value={info.logoIcon}
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
                      value={info.logoIcon}
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
                      value={info.favicon}
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
                      value={info.seoTitle}
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
                      value={info.seoDescription}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={3}
                      placeholder="e.g. Pak-o-Drive (Pak Drive / PakDrive) is Pakistan's premier online automotive accessories & viral car gadgets store. LED lights, ambient lighting, car perfumes & car care. Fast Cash on Delivery across Pakistan."
                    />
                    <div className="form-text small">Summarize your shop details for search engine listing snippets. Recommended: 150-160 characters.</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Default Meta Keywords (Comma separated)</label>
                    <input
                      type="text"
                      name="seoKeywords"
                      value={info.seoKeywords}
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
                        setInfo(prev => ({ ...prev, brandAliases: arr }));
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
            )}

            {activeTab === 'contact' && (
              <div className="fade-in">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Site Contact Details</h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Primary Phone *</label>
                    <input
                      type="text"
                      required
                      name="phone"
                      value={info.phone}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. +92 318 5205667"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Secondary Phone</label>
                    <input
                      type="text"
                      name="phone2"
                      value={info.phone2}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. 03218827748"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Support Email Address *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={info.email}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. info@pakodrive.com"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Order Billing/Escalation Email</label>
                    <input
                      type="email"
                      name="supportEmail"
                      value={info.supportEmail}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. billing@pakodrive.com"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Primary WhatsApp Number (e.g. +923185205667)</label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={info.whatsapp}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. +923185205667"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">
                      📱 Multi-Admin Live Chat WhatsApp Numbers
                    </label>
                    <input
                      type="text"
                      name="adminPhones"
                      value={info.adminPhones}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. 03185205667, 03218827748"
                    />
                    <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '3px' }}>
                      Separate multiple numbers with commas. Live customer inquiries will be broadcast to all these numbers, and any admin can reply from WhatsApp!
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Website Domain Link</label>
                    <input
                      type="text"
                      name="website"
                      value={info.website}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. pakodrive.com"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Physical Shop Address</label>
                    <input
                      type="text"
                      name="address"
                      value={info.address}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. Office 4B, Sector G-11, Islamabad"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Base City</label>
                    <SearchableCitySelect
                      value={info.city}
                      onChange={val => setInfo(prev => ({ ...prev, city: val }))}
                      placeholder="e.g. Rawalpindi, Islamabad, Lahore"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={info.country}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. Pakistan"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="fade-in">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Social Networks & Map Coordinates</h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold"><i className="fab fa-facebook me-1" /> Facebook Page URL</label>
                    <input
                      type="text"
                      name="facebook"
                      value={info.facebook}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. https://facebook.com/pakodrive"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold"><i className="fab fa-instagram me-1" /> Instagram Handle URL</label>
                    <input
                      type="text"
                      name="instagram"
                      value={info.instagram}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. https://instagram.com/pakodrive"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold"><i className="fab fa-tiktok me-1" /> TikTok Profile URL</label>
                    <input
                      type="text"
                      name="tiktok"
                      value={info.tiktok}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. https://tiktok.com/@pakodrive"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold"><i className="fab fa-twitter me-1" /> Twitter Handle URL</label>
                    <input
                      type="text"
                      name="twitter"
                      value={info.twitter}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. https://twitter.com/pakodrive"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-muted small fw-semibold"><i className="fab fa-youtube me-1" /> YouTube Channel URL</label>
                    <input
                      type="text"
                      name="youtube"
                      value={info.youtube}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. https://youtube.com/c/pakodrive"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Google Maps Iframe Embed Link (iframe src)</label>
                    <textarea
                      name="mapEmbedUrl"
                      value={info.mapEmbedUrl}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={4}
                      placeholder="Paste google map iframe src URL link only..."
                    />
                    <div className="form-text small">Provide map coordinates embed iframe URL to show on the contact page.</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="fade-in">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Store Pages & Markdown Policies</h6>
                <div className="alert alert-info border-0 small">
                  <i className="fas fa-info-circle me-1" /> Markdown elements like `## Headings`, `**bold text**` and list items `- item` are supported!
                </div>
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">About Us Content</label>
                    <textarea
                      name="aboutUs"
                      value={info.aboutUs}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={6}
                      placeholder="Detailed about store information..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Privacy Policy Content</label>
                    <textarea
                      name="privacyPolicy"
                      value={info.privacyPolicy}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={6}
                      placeholder="Privacy policies and guidelines..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Terms & Conditions Content</label>
                    <textarea
                      name="termsConditions"
                      value={info.termsConditions}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={6}
                      placeholder="Store purchasing terms & conditions..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Return & Refund Policy Content</label>
                    <textarea
                      name="returnPolicy"
                      value={info.returnPolicy}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={6}
                      placeholder="Product return policies..."
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Shipping Policy Content</label>
                    <textarea
                      name="shippingPolicy"
                      value={info.shippingPolicy}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      rows={6}
                      placeholder="Shipping timelines and fees..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-gradient px-5 py-2.5 rounded-pill border-0 text-white shadow-sm"
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" /> Saving Settings...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2" /> Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
