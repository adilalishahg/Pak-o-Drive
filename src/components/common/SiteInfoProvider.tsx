'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SiteInfo, DEFAULT_SITE_INFO, SiteInfoContextValue } from '@/types';

const SiteInfoContext = createContext<SiteInfoContextValue>({
  info: DEFAULT_SITE_INFO,
  loading: true,
  error: null,
  refresh: async () => {},
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
    <SiteInfoContext.Provider value={{ info, loading, error: null, refresh: fetch_ }}>
      {children}
    </SiteInfoContext.Provider>
  );

}
