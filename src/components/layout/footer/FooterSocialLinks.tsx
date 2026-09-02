'use client';

import React from 'react';
import { SiteInfo } from '@/types';

const SocialIconMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
  facebook: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  twitter: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  youtube: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.44a2.78 2.78 0 0 0 1.95-1.98A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  ),
  tiktok: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.127V9.41a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3.15 15.7 6.34 6.34 0 0 0 9.49 22a6.34 6.34 0 0 0 6.34-6.33V9.22a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.65z" />
    </svg>
  ),
  whatsapp: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.777.978-.953 1.179-.176.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.49-.893-.797-1.496-1.781-1.672-2.082-.176-.3-.019-.462.132-.612.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.634-.929-2.238-.244-.588-.492-.508-.678-.517-.175-.009-.376-.009-.577-.009-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.512c0 1.482 1.079 2.912 1.23 3.113.15.2 2.124 3.243 5.145 4.548.718.311 1.279.497 1.716.636.721.23 1.377.197 1.895.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.076-.126-.276-.201-.577-.351zM12.042 2C6.5 2 2 6.5 2 12.042c0 1.942.552 3.754 1.508 5.289L2 22l4.82-1.474c1.473.874 3.197 1.377 5.222 1.377 5.542 0 10.042-4.5 10.042-10.042C22.084 6.5 17.584 2 12.042 2z" />
    </svg>
  ),
};

interface FooterSocialLinksProps {
  info: SiteInfo;
}

export const FooterSocialLinks: React.FC<FooterSocialLinksProps> = ({ info }) => {
  const rawWhatsapp = info.whatsapp ? info.whatsapp.replace(/\D/g, '') : '';
  const formattedWhatsapp = rawWhatsapp
    ? rawWhatsapp.startsWith('92')
      ? rawWhatsapp
      : `92${rawWhatsapp.replace(/^0/, '')}`
    : '';

  const socials = [
    { Icon: SocialIconMap.facebook, href: info.facebook, label: 'Facebook' },
    { Icon: SocialIconMap.instagram, href: info.instagram, label: 'Instagram' },
    { Icon: SocialIconMap.tiktok, href: (info as any).tiktok, label: 'TikTok' },
    { Icon: SocialIconMap.twitter, href: info.twitter, label: 'Twitter' },
    { Icon: SocialIconMap.youtube, href: info.youtube, label: 'YouTube' },
    {
      Icon: SocialIconMap.whatsapp,
      href: formattedWhatsapp ? `https://wa.me/${formattedWhatsapp}` : '',
      label: 'WhatsApp',
    },
  ].filter((s) => Boolean(s.href && s.href !== '#' && s.href.trim() !== ''));

  if (socials.length === 0) return null;

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap mt-3">
      {socials.map(({ Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="btn btn-sm-square btn-light rounded-circle text-primary"
          style={{
            width: '36px',
            height: '36px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <Icon size={15} />
        </a>
      ))}
    </div>
  );
};
