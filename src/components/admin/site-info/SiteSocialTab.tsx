'use client';

import React from 'react';

interface SiteSocialTabProps {
  info: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function SiteSocialTab({ info, handleChange }: SiteSocialTabProps) {
  return (
    <div className="fade-in">
      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Social Networks & Map Coordinates</h6>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold"><i className="fab fa-facebook me-1" /> Facebook Page URL</label>
          <input
            type="text"
            name="facebook"
            value={info.facebook || ''}
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
            value={info.instagram || ''}
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
            value={info.tiktok || ''}
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
            value={info.twitter || ''}
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
            value={info.youtube || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. https://youtube.com/c/pakodrive"
          />
        </div>
        <div className="col-12">
          <label className="form-label text-muted small fw-semibold">Google Maps Iframe Embed Link (iframe src)</label>
          <textarea
            name="mapEmbedUrl"
            value={info.mapEmbedUrl || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            rows={4}
            placeholder="Paste google map iframe src URL link only..."
          />
          <div className="form-text small">Provide map coordinates embed iframe URL to show on the contact page.</div>
        </div>
      </div>
    </div>
  );
}
