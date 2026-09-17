'use client';

import React from 'react';

interface SitePoliciesTabProps {
  info: any;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function SitePoliciesTab({ info, handleChange }: SitePoliciesTabProps) {
  return (
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
            value={info.aboutUs || ''}
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
            value={info.privacyPolicy || ''}
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
            value={info.termsConditions || ''}
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
            value={info.returnPolicy || ''}
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
            value={info.shippingPolicy || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={6}
            placeholder="Shipping timelines and fees..."
          />
        </div>
      </div>
    </div>
  );
}
