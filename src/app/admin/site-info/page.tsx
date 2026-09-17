'use client';

import React from 'react';
import { useAdminSiteInfo } from '@/hooks/useAdminSiteInfo';
import { SiteGeneralTab } from '@/components/admin/site-info/SiteGeneralTab';
import { SiteSeoTab } from '@/components/admin/site-info/SiteSeoTab';
import { SiteContactTab } from '@/components/admin/site-info/SiteContactTab';
import { SiteSocialTab } from '@/components/admin/site-info/SiteSocialTab';
import { SitePoliciesTab } from '@/components/admin/site-info/SitePoliciesTab';

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
              <SiteGeneralTab
                info={info}
                handleChange={handleChange}
                setInfo={setInfo}
                handleLogoUpload={handleLogoUpload}
                logoUploading={logoUploading}
              />
            )}

            {activeTab === 'seo' && (
              <SiteSeoTab
                info={info}
                handleChange={handleChange}
                setInfo={setInfo}
              />
            )}

            {activeTab === 'contact' && (
              <SiteContactTab
                info={info}
                handleChange={handleChange}
                setInfo={setInfo}
              />
            )}

            {activeTab === 'social' && (
              <SiteSocialTab
                info={info}
                handleChange={handleChange}
              />
            )}

            {activeTab === 'policies' && (
              <SitePoliciesTab
                info={info}
                handleChange={handleChange}
              />
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

