'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteInfo } from '../../components/common/SiteInfoProvider';
import { parseMarkdown } from '../../lib/markdown';

export default function TermsConditionsPage() {
  const { info, loading } = useSiteInfo();

  return (
    <div className="bg-light min-vh-100 py-5">
      {/* Page Header */}
      <div 
        className="container-fluid page-header py-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, var(--pd-secondary) 0%, color-mix(in srgb, var(--pd-secondary) 80%, #000) 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <div className="container text-center py-3">
          <h1 className="text-white display-5 fw-bold mb-3 animate-on-scroll visible">
            Terms & Conditions
          </h1>
          <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.9rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" className="text-white-50 text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item text-white active" aria-current="page">
              Terms & Conditions
            </li>
          </ol>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-3">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div 
              className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5"
              style={{
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              {loading ? (
                <div className="d-flex align-items-center justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : info.termsConditions ? (
                <div 
                  className="policy-content text-dark"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(info.termsConditions) }}
                />
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No Terms & Conditions content is configured yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
