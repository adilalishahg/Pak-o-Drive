'use client';

import React from 'react';
import { SiteInfo } from '@/types';

export const FooterIconMap: Record<string, React.FC<{ size?: number; color?: string; className?: string }>> = {
  location: ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  mail: ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.34a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  globe: ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

interface FooterContactGridProps {
  info: SiteInfo;
  isCleanWhite?: boolean;
}

export const FooterContactGrid: React.FC<FooterContactGridProps> = ({ info, isCleanWhite }) => {
  const contactCards = [
    { Icon: FooterIconMap.location, label: 'Address', value: `${info.address || 'Rawalpindi, Punjab, Pakistan'}` },
    { Icon: FooterIconMap.mail, label: 'Mail Us', value: info.email || 'support@pakodrive.pk' },
    { Icon: FooterIconMap.phone, label: 'Telephone', value: info.phone || '03185205667' },
    { Icon: FooterIconMap.globe, label: 'Website', value: info.website || 'pakodrive.pk' },
  ].filter((c) => Boolean(c.value && c.value.trim() !== ''));

  if (isCleanWhite) {
    return (
      <div className="space-y-3 text-xs sm:text-sm text-slate-400">
        <p className="flex items-start gap-2.5">
          <FooterIconMap.location size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <span>{info.address || 'Rawalpindi, Punjab, Pakistan'}</span>
        </p>
        <p className="flex items-center gap-2.5">
          <FooterIconMap.phone size={16} className="text-blue-500 flex-shrink-0" />
          <span>{info.phone || '03185205667'}</span>
        </p>
        <p className="flex items-center gap-2.5">
          <FooterIconMap.mail size={16} className="text-blue-500 flex-shrink-0" />
          <span>{info.email || 'support@pakodrive.pk'}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="row g-4 rounded mb-5" style={{ background: 'rgba(255,255,255,.03)' }}>
      {contactCards.map(({ Icon, label, value }) => (
        <div key={label} className="col-md-6 col-lg-6 col-xl-3">
          <div className="rounded p-4 d-flex align-items-start gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '52px',
                height: '52px',
                background: `linear-gradient(135deg, var(--pd-primary, #ea580c), color-mix(in srgb, var(--pd-primary, #ea580c) 75%, #000))`,
                boxShadow: `0 6px 16px rgba(var(--pd-primary-rgb, 234,88,12), 0.35)`,
              }}
            >
              <Icon size={20} color="#fff" />
            </div>
            <div>
              <h5 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {label}
              </h5>
              <p className="mb-0 text-slate-200" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                {value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
