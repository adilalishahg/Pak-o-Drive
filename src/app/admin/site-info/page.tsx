'use client';

import React, { useEffect, useState } from 'react';

interface SiteInfo {
  siteName: string;
  siteTagline: string;
  logoText: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  phone2: string;
  email: string;
  supportEmail: string;
  website: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  mapEmbedUrl: string;
  privacyPolicy: string;
  termsConditions: string;
  returnPolicy: string;
  shippingPolicy: string;
  aboutUs: string;
  newsletterText: string;
  copyrightText: string;
}

const DEFAULT_INFO: SiteInfo = {
  siteName: '',
  siteTagline: '',
  logoText: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  phone2: '',
  email: '',
  supportEmail: '',
  website: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  mapEmbedUrl: '',
  privacyPolicy: '',
  termsConditions: '',
  returnPolicy: '',
  shippingPolicy: '',
  aboutUs: '',
  newsletterText: '',
  copyrightText: '',
};

type ActiveTab = 'general' | 'contact' | 'social' | 'policies';

export default function AdminSiteInfoPage() {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    try {
      setLoading(true);
      const res = await fetch('/api/site-info');
      const json = await res.json();
      if (json.success) {
        setInfo({ ...DEFAULT_INFO, ...json.data });
      } else {
        throw new Error(json.error || 'Failed to retrieve site information');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to the database.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess('Site settings and contact information updated successfully!');
        setInfo({ ...DEFAULT_INFO, ...json.data });
        // Auto fade out success message
        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(json.error || 'Failed to save changes.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

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
                      placeholder="e.g. +0123 456 7890"
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
                    <label className="form-label text-muted small fw-semibold">WhatsApp Number (e.g. +923185205667)</label>
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
                    <label className="form-label text-muted small fw-semibold">City</label>
                    <input
                      type="text"
                      name="city"
                      value={info.city}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      placeholder="e.g. Islamabad"
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
