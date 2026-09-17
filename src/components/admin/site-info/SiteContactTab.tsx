'use client';

import React from 'react';
import { SearchableCitySelect } from '@/components/common/SearchableCitySelect';

interface SiteContactTabProps {
  info: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setInfo: React.Dispatch<React.SetStateAction<any>>;
}

export function SiteContactTab({ info, handleChange, setInfo }: SiteContactTabProps) {
  return (
    <div className="fade-in">
      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Site Contact Details</h6>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Primary Phone *</label>
          <input
            type="text"
            required
            name="phone"
            value={info.phone || ''}
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
            value={info.phone2 || ''}
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
            value={info.email || ''}
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
            value={info.supportEmail || ''}
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
            value={info.whatsapp || ''}
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
            value={info.adminPhones || ''}
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
            value={info.website || ''}
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
            value={info.address || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Office 4B, Sector G-11, Islamabad"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Base City</label>
          <SearchableCitySelect
            value={info.city || ''}
            onChange={val => setInfo((prev: any) => ({ ...prev, city: val }))}
            placeholder="e.g. Rawalpindi, Islamabad, Lahore"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small fw-semibold">Country</label>
          <input
            type="text"
            name="country"
            value={info.country || ''}
            onChange={handleChange}
            className="form-control rounded-3"
            placeholder="e.g. Pakistan"
          />
        </div>
      </div>
    </div>
  );
}
