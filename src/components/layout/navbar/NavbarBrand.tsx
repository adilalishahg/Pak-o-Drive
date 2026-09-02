'use client';

import React from 'react';
import Link from 'next/link';
import { PakODriveLogo } from '../../common/PakODriveLogo';
import { ThemeIcon } from '../../common/ThemeIcon';
import { SiteInfo } from '@/types';
import { SiteTheme } from '@/types/theme';

interface NavbarBrandProps {
  info: SiteInfo;
  theme: SiteTheme;
  isCleanWhite?: boolean;
}

export const NavbarBrand: React.FC<NavbarBrandProps> = ({ info, theme, isCleanWhite }) => {
  if (theme.svgLogo?.enabled !== false) {
    return (
      <Link
        href="/"
        aria-label={`${theme.svgLogo?.text1 || 'PAKO'} ${theme.svgLogo?.text2 || 'DRIVE'} Home`}
        className="flex items-center text-decoration-none flex-shrink-0"
      >
        <PakODriveLogo height={theme.svgLogo?.height || 38} />
      </Link>
    );
  }

  if (info.showLogoImage && info.logoImage) {
    return (
      <Link
        href="/"
        aria-label={`${info.logoText || 'ALPHA'} Home`}
        className="flex items-center text-decoration-none flex-shrink-0"
      >
        <img
          src={info.logoImage}
          alt={info.logoText || 'ALPHA'}
          style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label={`${info.logoText || 'ALPHA'} Home`}
      className="text-2xl font-extrabold tracking-wider text-slate-900 flex items-center gap-2 text-decoration-none flex-shrink-0"
    >
      <span className="theme1-logo-badge w-8 h-8 rounded-lg flex items-center justify-center text-white text-base font-black">
        <ThemeIcon name={info.logoIcon || 'shopping-bag'} style={{ color: '#fff', fontSize: '15px' }} />
      </span>
      {info.logoText || 'ALPHA'}
    </Link>
  );
};
