'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ─── Centralized Types ────────────────────────────────────── */
export type {
  IconLibrary,
  SvgLogoSettings,
  IHeroSlideItem,
  SiteTheme,
  ThemeContextValue,
  DynamicThemeProviderProps,
} from '@/types/theme';

import type {
  IconLibrary,
  SvgLogoSettings,
  IHeroSlideItem,
  SiteTheme,
  ThemeContextValue,
  DynamicThemeProviderProps,
} from '@/types/theme';


export const DEFAULT_SVG_LOGO: SvgLogoSettings = {
  enabled: true,
  primaryColor: '#00A8E8',
  secondaryColor: '#0066CC',
  accentColor: '#FF7A00',
  text1: 'PAKO',
  text2: 'DRIVE',
  fontFamily: 'Montserrat',
  fontWeight: '900',
  letterSpacing: 5,
  fontSize: 105,
  fontStyle: 'normal',
  showIcon: true,
  showText: true,
  height: 38,
};


export const DEFAULT_THEME: SiteTheme = {
  primaryColor: '#ea580c',
  secondaryColor: '#0f172a',
  accentColor: '#3b82f6',
  successColor: '#10b981',
  fontFamily: 'Inter',
  fontSizeBase: '16px',
  borderRadius: '16px',
  buttonRadius: '50px',
  cardRadius: '16px',
  animationsEnabled: true,
  glassmorphismEnabled: true,
  shadowIntensity: 'medium',
  navbarStyle: 'dark',
  footerStyle: 'dark',
  heroGradientStart: '#fff7ed',
  heroGradientEnd: '#ffffff',
  iconLibrary: 'fontawesome',
  siteTagline: "Pakistan's Trusted Electronics Store",
  announcementBarText: '🎉 Free Shipping on orders above PKR 5,000 | 📦 30-Day Easy Returns | Shop Now →',
  announcementBarEnabled: true,
  layoutTheme: 'classic',
  svgLogo: DEFAULT_SVG_LOGO,
  homepageSections: {
    heroSliderSettings: {
      sliderEngine: 'smooothy',
      autoSlideEnabled: true,
      autoSlideIntervalSec: 5,
      showArrows: true,
      showDots: true,
    },
    heroBig: {
      enabled: true,
      badge: 'Featured Product',
      title: 'Smart Speakers With Google Assistant',
      subtitle: 'Experience room-filling sound and intelligent voice assistance. Control your smart home with ease.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80',
    },
    heroSmall: {
      enabled: true,
      badge: 'Special Discount',
      title: 'TWS Earbuds',
      highlight: '50% Off',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    },
    trendingProducts: { enabled: true, title: 'Trending Products', limit: 4 },
    collections:      { enabled: true, title: 'The Top Collections' },
    weeklyDeal: {
      enabled: true,
      label: 'The Big Deal This Week',
      title: 'Apple iPhone 12 Pro Max 128GB Blue Edition',
      description: 'Get the ultimate photography and performance package. Limited stock available at a special discount.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=500&q=80',
    },
    moreDeals:  { enabled: true, title: 'More Active Deals', limit: 4 },
    featuredSection: { enabled: true, title: 'Featured Products', limit: 8 },
    valueProps: { enabled: true },
    offerBanner1: {
      enabled: true,
      subtitle: 'Special Discount',
      title: 'TWS Earbuds',
      discount: '50% Off',
      buttonLink: '/shop?category=headphones',
      imageUrl: '/img/product-1.png',
    },
    offerBanner2: {
      enabled: true,
      subtitle: 'Find The Best Smartwatches for You!',
      title: 'Smart Wearables',
      discount: '20% Off',
      buttonLink: '/shop?category=smartwatches',
      imageUrl: '/img/product-2.png',
    },
  },
};

import { generateThemeCss, hexToRgb, SHADOW_MAP, SHADOW_HOVER_MAP } from '@/lib/themeCssGenerator';
export { generateThemeCss, hexToRgb, SHADOW_MAP, SHADOW_HOVER_MAP };

/* ─── Context ────────────────────────────────────────────────── */
const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  loading: true,
  refresh: () => {},
});

export function useSiteTheme() {
  return useContext(ThemeContext);
}

/* ─── Provider ───────────────────────────────────────────────── */
export function DynamicThemeProvider({ children, initialTheme }: DynamicThemeProviderProps) {
  const [theme, setTheme] = useState<SiteTheme>(() => {
    if (initialTheme) {
      return { ...DEFAULT_THEME, ...initialTheme };
    }

    return DEFAULT_THEME;
  });
  const [loading, setLoading] = useState(initialTheme ? false : true);

  const fetchAndApply = useCallback(async () => {
    try {
      const res = await fetch('/api/site-settings', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        const t: SiteTheme = { ...DEFAULT_THEME, ...json.data };
        setTheme(t);
      }
    } catch (err) {
      console.error('Failed to load site theme:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndApply();

    const handleUpdate = () => {
      fetchAndApply();
    };

    window.addEventListener('pakodrive:theme_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('pakodrive:theme_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchAndApply]);

  // For layoutTheme 'theme1' (Clean White), if the font is default 'Inter' or empty, use 'Plus Jakarta Sans' as a more aesthetic default.
  const activeFontFamily = theme.layoutTheme === 'theme1' && (theme.fontFamily === 'Inter' || !theme.fontFamily)
    ? 'Plus Jakarta Sans'
    : (theme.fontFamily || 'Inter');

  const fontName = activeFontFamily.replace(/ /g, '+');
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800&display=swap`;
  const css = `@import url('${fontUrl}');\n` + generateThemeCss({ ...theme, fontFamily: activeFontFamily });

  // Dynamically manage google font link in document.head without body JSX mismatch
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let link = document.getElementById('dynamic-google-font') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-google-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== fontUrl) {
      link.href = fontUrl;
    }
  }, [fontUrl]);

  return (
    <ThemeContext.Provider value={{ theme, loading, refresh: fetchAndApply }}>
      <style id="pd-dynamic-theme" dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </ThemeContext.Provider>
  );
}
