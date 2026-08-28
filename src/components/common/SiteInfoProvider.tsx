'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface SiteInfo {
  siteName: string;
  siteTagline: string;
  logoText: string;
  logoIcon: string;
  logoImage?: string;
  showLogoImage?: boolean;
  favicon: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
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

export const DEFAULT_SITE_INFO: SiteInfo = {
  siteName: 'PAKODRIVE',
  siteTagline: "Pakistan's Trusted Electronics & Automotive Store",
  logoText: 'PAKODRIVE',
  logoIcon: 'shopping-bag',
  logoImage: '',
  showLogoImage: false,
  favicon: '/favicon.ico',
  seoTitle: 'PAKODRIVE Electronics — Best Electronics Store in Pakistan',
  seoDescription: "PAKODRIVE — Pakistan's trusted electronics store. Shop headphones, chargers, smartwatches, automotive electronics & more with free shipping and 30-day returns.",
  seoKeywords: 'electronics Pakistan, buy headphones Pakistan, smartwatches online, chargers cables Pakistan, automotive electronics, PAKODRIVE, online shopping Pakistan',
  address: 'Main Muslim Town, Sadiqabad, Rawalpindi, Punjab, Pakistan',
  city: 'Rawalpindi',
  country: 'Pakistan',
  phone: '03185205667',
  phone2: '03218827748',
  email: 'support@pakodrive.com',
  supportEmail: 'support@pakodrive.com',
  website: 'pakodrive.com',
  whatsapp: '03185205667',
  facebook: '#',
  instagram: '#',
  twitter: '#',
  youtube: '#',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13284.629471168434!2d73.0735!3d33.6268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df952136e4f3a7%3A0xb35a09c2dbad7d72!2sMuslim%20Town%2C%20Rawalpindi%2C%20Punjab!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s',
  privacyPolicy: '',
  termsConditions: '',
  returnPolicy: '',
  shippingPolicy: '',
  aboutUs: '',
  newsletterText: 'Subscribe to get notifications on headphones, chargers, and automotive electronics.',
  copyrightText: '© 2026 PAKODRIVE. All rights reserved.',
};

interface SiteInfoContextValue {
  info: SiteInfo;
  loading: boolean;
  refresh: () => void;
}

const SiteInfoContext = createContext<SiteInfoContextValue>({
  info: DEFAULT_SITE_INFO,
  loading: true,
  refresh: () => {},
});

export function useSiteInfo() {
  return useContext(SiteInfoContext);
}

interface SiteInfoProviderProps {
  children: React.ReactNode;
  initialInfo?: Partial<SiteInfo> | null;
}

export function SiteInfoProvider({ children, initialInfo }: SiteInfoProviderProps) {
  const [info, setInfo] = useState<SiteInfo>(() => {
    if (initialInfo) {
      return { ...DEFAULT_SITE_INFO, ...initialInfo };
    }
    return DEFAULT_SITE_INFO;
  });
  const [loading, setLoading] = useState(initialInfo ? false : true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/site-info', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setInfo({ ...DEFAULT_SITE_INFO, ...json.data });
      }
    } catch {
      /* use defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialInfo) {
      fetch_();
    }
  }, [initialInfo, fetch_]);

  return (
    <SiteInfoContext.Provider value={{ info, loading, refresh: fetch_ }}>
      {children}
    </SiteInfoContext.Provider>
  );
}
