'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface SiteInfo {
  siteName: string;
  siteTagline: string;
  logoText: string;
  logoIcon: string;
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
  siteTagline: "Pakistan's Trusted Electronics Store",
  logoText: 'Electro',
  logoIcon: 'shopping-bag',
  favicon: '/favicon.ico',
  seoTitle: 'PAKODRIVE Electronics — Best Electronics Store in Pakistan',
  seoDescription: "PAKODRIVE — Pakistan's trusted electronics store. Shop headphones, chargers, smartwatches, automotive electronics & more with free shipping and 30-day returns.",
  seoKeywords: 'electronics Pakistan, buy headphones Pakistan, smartwatches online, chargers cables Pakistan, automotive electronics, PAKODRIVE, online shopping Pakistan',
  address: '123 Street Karachi, Pakistan',
  city: 'Karachi',
  country: 'Pakistan',
  phone: '+0123 456 7890',
  phone2: '',
  email: 'support@pakodrive.com',
  supportEmail: 'support@pakodrive.com',
  website: 'pakodrive.com',
  whatsapp: '+923001234567',
  facebook: '#',
  instagram: '#',
  twitter: '#',
  youtube: '#',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.137684698506!2d67.0601449!3d24.860965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUxJzM5LjUiTiA2N8KwMDMnMzYuNSJFCg!5e0!3m2!1sen!2s!4v1694259649153!5m2!1sen!2s',
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

export function SiteInfoProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <SiteInfoContext.Provider value={{ info, loading, refresh: fetch_ }}>
      {children}
    </SiteInfoContext.Provider>
  );
}
