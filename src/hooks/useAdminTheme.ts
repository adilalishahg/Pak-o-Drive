'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_THEME,
  DEFAULT_SVG_LOGO,
  SiteTheme,
  SvgLogoSettings,
} from '../components/common/DynamicThemeProvider';

export interface AdminThemeHookReturn {
  form: SiteTheme;
  setForm: React.Dispatch<React.SetStateAction<SiteTheme>>;
  loading: boolean;
  saving: boolean;
  toast: { type: 'success' | 'danger'; message: string } | null;
  setToast: (t: { type: 'success' | 'danger'; message: string } | null) => void;
  availableProducts: any[];
  set: <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => void;
  setSvgLogo: <K extends keyof SvgLogoSettings>(key: K, val: SvgLogoSettings[K]) => void;
  applyPreset: (presetName: 'classic' | 'modern-green' | 'theme1') => void;
  addHeroSlide: () => void;
  updateHeroSlide: (idx: number, field: string, value: any) => void;
  deleteHeroSlide: (idx: number) => void;
  moveHeroSlide: (idx: number, direction: 'up' | 'down') => void;
  selectProductForHeroSlide: (idx: number, prodId: string) => void;
  updateHeroSliderSetting: (key: string, val: any) => void;
  updateHomepageSection: (sectionKey: string, field: string, val: any) => void;
  handleSave: () => Promise<void>;
  handleReset: () => void;
}

export function useAdminTheme(): AdminThemeHookReturn {
  const [form, setForm] = useState<SiteTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // Fetch initial theme & available products
  useEffect(() => {
    async function loadData() {
      try {
        const [themeRes, prodRes] = await Promise.all([
          fetch('/api/site-settings'),
          fetch('/api/products?limit=100'),
        ]);

        if (themeRes.ok) {
          const themeData = await themeRes.json();
          if (themeData.success && themeData.settings) {
            setForm((prev) => ({
              ...prev,
              ...themeData.settings,
              svgLogo: {
                ...DEFAULT_SVG_LOGO,
                ...(themeData.settings.svgLogo || {}),
              },
              homepageSections: {
                ...DEFAULT_THEME.homepageSections,
                ...(themeData.settings.homepageSections || {}),
                heroSliderSettings: {
                  autoSlideEnabled: true,
                  autoSlideIntervalSec: 5,
                  showArrows: true,
                  showDots: true,
                  ...(themeData.settings.homepageSections?.heroSliderSettings || {}),
                },
                heroSlides: themeData.settings.homepageSections?.heroSlides || [],
              },
            }));
          }
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.success && Array.isArray(prodData.products)) {
            setAvailableProducts(prodData.products);
          }
        }
      } catch (err) {
        console.error('Failed to load site theme data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const set = useCallback(<K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const setSvgLogo = useCallback(<K extends keyof SvgLogoSettings>(key: K, val: SvgLogoSettings[K]) => {
    setForm((prev) => ({
      ...prev,
      svgLogo: {
        ...(prev.svgLogo || DEFAULT_SVG_LOGO),
        [key]: val,
      },
    }));
  }, []);

  const applyPreset = useCallback((presetName: 'classic' | 'modern-green' | 'theme1') => {
    if (presetName === 'classic') {
      setForm((prev) => ({
        ...prev,
        layoutTheme: 'classic',
        primaryColor: '#ea580c',
        secondaryColor: '#0f172a',
        accentColor: '#3b82f6',
        successColor: '#10b981',
        heroGradientStart: '#fff7ed',
        heroGradientEnd: '#ffffff',
        navbarStyle: 'dark',
        footerStyle: 'dark',
        cardRadius: '16px',
        borderRadius: '16px',
        buttonRadius: '50px',
      }));
    } else if (presetName === 'modern-green') {
      setForm((prev) => ({
        ...prev,
        layoutTheme: 'modern-green',
        primaryColor: '#0d231d',
        secondaryColor: '#eae7db',
        accentColor: '#d4af37',
        successColor: '#10b981',
        heroGradientStart: '#0d231d',
        heroGradientEnd: '#13352c',
        navbarStyle: 'dark',
        footerStyle: 'dark',
        cardRadius: '24px',
        borderRadius: '24px',
        buttonRadius: '50px',
      }));
    } else if (presetName === 'theme1') {
      setForm((prev) => ({
        ...prev,
        layoutTheme: 'theme1',
        primaryColor: '#2563eb',
        secondaryColor: '#1e293b',
        accentColor: '#8b5cf6',
        successColor: '#10b981',
        heroGradientStart: '#f8fafc',
        heroGradientEnd: '#f1f5f9',
        navbarStyle: 'light',
        footerStyle: 'light',
        cardRadius: '12px',
        borderRadius: '12px',
        buttonRadius: '12px',
      }));
    }
  }, []);

  /* ── Hero Slides Mutations ─────────────────────────────────────── */
  const addHeroSlide = useCallback(() => {
    setForm((prev) => {
      const currentSlides = prev.homepageSections?.heroSlides || [];
      const newSlide = {
        enabled: true,
        productId: '',
        badge: '🔥 Hot Deal',
        title: 'New Featured Product',
        subtitle: 'Experience premium performance and uncompromised quality.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        imageType: 'product' as const,
        imageUrl: '/img/product-1.png',
        bgGradient: '',
      };
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: [...currentSlides, newSlide],
        },
      };
    });
  }, []);

  const updateHeroSlide = useCallback((idx: number, field: string, value: any) => {
    setForm((prev) => {
      const currentSlides = [...(prev.homepageSections?.heroSlides || [])];
      if (!currentSlides[idx]) return prev;
      currentSlides[idx] = { ...currentSlides[idx], [field]: value };
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  }, []);

  const deleteHeroSlide = useCallback((idx: number) => {
    setForm((prev) => {
      const currentSlides = (prev.homepageSections?.heroSlides || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  }, []);

  const moveHeroSlide = useCallback((idx: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const currentSlides = [...(prev.homepageSections?.heroSlides || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= currentSlides.length) return prev;
      const temp = currentSlides[idx];
      currentSlides[idx] = currentSlides[targetIdx];
      currentSlides[targetIdx] = temp;
      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  }, []);

  const selectProductForHeroSlide = useCallback((idx: number, prodId: string) => {
    setForm((prev) => {
      const currentSlides = [...(prev.homepageSections?.heroSlides || [])];
      if (!currentSlides[idx]) return prev;
      const prod = availableProducts.find((p) => String(p._id) === String(prodId));

      if (prod) {
        currentSlides[idx] = {
          ...currentSlides[idx],
          productId: prod._id,
          title: prod.name || currentSlides[idx].title,
          badge: prod.heroText || prod.brand || 'Featured Product',
          subtitle: prod.description ? prod.description.slice(0, 110) + '...' : currentSlides[idx].subtitle,
          buttonLink: `/product/${prod._id}`,
          imageUrl: prod.image || currentSlides[idx].imageUrl,
          imageType: 'product',
        };
      } else {
        currentSlides[idx] = {
          ...currentSlides[idx],
          productId: '',
          imageType: 'custom',
        };
      }

      return {
        ...prev,
        homepageSections: {
          ...prev.homepageSections,
          heroSlides: currentSlides,
        },
      };
    });
  }, [availableProducts]);

  const updateHeroSliderSetting = useCallback((key: string, val: any) => {
    setForm((prev) => ({
      ...prev,
      homepageSections: {
        ...prev.homepageSections,
        heroSliderSettings: {
          autoSlideEnabled: true,
          autoSlideIntervalSec: 5,
          showArrows: true,
          showDots: true,
          ...(prev.homepageSections?.heroSliderSettings || {}),
          [key]: val,
        },
      },
    }));
  }, []);

  const updateHomepageSection = useCallback((sectionKey: string, field: string, val: any) => {
    setForm((prev) => ({
      ...prev,
      homepageSections: {
        ...prev.homepageSections,
        [sectionKey]: {
          ...(prev.homepageSections?.[sectionKey as keyof typeof prev.homepageSections] as any || {}),
          [field]: val,
        },
      },
    }));
  }, []);

  /* ── Save & Reset Actions ─────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', message: 'Theme & appearance settings saved and applied live!' });
      } else {
        setToast({ type: 'danger', message: data.error || 'Failed to save settings.' });
      }
    } catch {
      setToast({ type: 'danger', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleReset = useCallback(() => {
    setForm(DEFAULT_THEME);
    setToast({ type: 'success', message: 'Reset to default theme settings. Click "Save & Apply" to make permanent.' });
  }, []);

  return {
    form,
    setForm,
    loading,
    saving,
    toast,
    setToast,
    availableProducts,
    set,
    setSvgLogo,
    applyPreset,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    moveHeroSlide,
    selectProductForHeroSlide,
    updateHeroSliderSetting,
    updateHomepageSection,
    handleSave,
    handleReset,
  };
}
