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
  const address = info.address || 'Muslim Town, Khana Road, Rawalpindi';
  const email = info.email || 'support@pakodrive.pk';
  const phone = info.phone || '+92 318 5205667';
  const rawPhone = phone.replace(/\D/g, '');
  const telLink = `tel:${rawPhone.startsWith('92') ? '+' + rawPhone : '+92' + rawPhone.replace(/^0/, '')}`;
  const website = info.website || 'https://www.pakodrive.pk';
  const webLink = website.startsWith('http') ? website : `https://${website}`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${info.city || 'Rawalpindi'}, Pakistan`)}`;

  const contactCards = [
    {
      Icon: FooterIconMap.location,
      label: 'Address',
      value: address,
      href: mapLink,
      isExternal: true,
    },
    {
      Icon: FooterIconMap.mail,
      label: 'Mail Us',
      value: email,
      href: `mailto:${email}`,
      isExternal: false,
    },
    {
      Icon: FooterIconMap.phone,
      label: 'Telephone',
      value: phone,
      href: telLink,
      isExternal: false,
    },
    {
      Icon: FooterIconMap.globe,
      label: 'Website',
      value: website.replace(/^https?:\/\//, ''),
      href: webLink,
      isExternal: true,
    },
  ].filter((c) => Boolean(c.value && c.value.trim() !== ''));

  if (isCleanWhite) {
    return (
      <div className="space-y-3 text-xs sm:text-sm text-slate-400">
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2.5 text-slate-400 hover:text-white transition-colors text-decoration-none"
        >
          <FooterIconMap.location size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <span>{address}</span>
        </a>
        <a
          href={telLink}
          className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-decoration-none"
        >
          <FooterIconMap.phone size={16} className="text-blue-500 flex-shrink-0" />
          <span>{phone}</span>
        </a>
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-decoration-none"
        >
          <FooterIconMap.mail size={16} className="text-blue-500 flex-shrink-0" />
          <span>{email}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="row g-2 g-md-3">
      {contactCards.map(({ Icon, label, value, href, isExternal }) => (
        <div key={label} className="col-6 col-md-6 col-lg-3">
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="d-flex align-items-center gap-2.5 p-2.5 px-3 rounded-3 text-decoration-none h-100 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: `linear-gradient(135deg, var(--pd-primary, #ea580c), color-mix(in srgb, var(--pd-primary, #ea580c) 75%, #000))`,
                boxShadow: `0 4px 10px rgba(var(--pd-primary-rgb, 234,88,12), 0.3)`,
              }}
            >
              <Icon size={16} color="#fff" />
            </div>
            <div className="overflow-hidden" style={{ minWidth: 0, flex: 1 }}>
              <span
                className="d-block text-white fw-bold"
                style={{ fontSize: '0.72rem', letterSpacing: '0.3px', lineHeight: 1.2 }}
              >
                {label}
              </span>
              <span
                className="d-block text-slate-300 text-truncate"
                style={{ fontSize: '0.72rem', lineHeight: 1.3, marginTop: '2px' }}
                title={value}
              >
                {value}
              </span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};
