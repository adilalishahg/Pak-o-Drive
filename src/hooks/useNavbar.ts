'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logInteraction } from '@/components/common/AnalyticsTracker';

const DEFAULT_CATS = [
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Chargers & Cables', slug: 'chargers' },
  { name: 'Automotive Electronics', slug: 'automotive' },
  { name: 'Smartwatches', slug: 'smartwatches' },
  { name: 'Mobile Accessories', slug: 'accessories' },
];

export interface NavbarHookReturn {
  cats: any[];
  categoryTree: any[];
  catOpen: boolean;
  setCatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  scrolled: boolean;
  showTop: boolean;
  mounted: boolean;
  catRef: React.RefObject<HTMLDivElement | null>;
  handleSearch: (e: React.FormEvent) => void;
  scrollToTop: () => void;
}

export function useNavbar(): NavbarHookReturn {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setCatOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open so page doesn't scroll
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // Fetch categories using client-side cache
  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const { fetchCategoriesClient } = await import('@/lib/client-cache');
        const data = await fetchCategoriesClient();
        if (isSubscribed && data && data.length > 0) {
          setCats(data);
        }
      } catch { }
    })();
    return () => { isSubscribed = false; };
  }, []);

  // Compute hierarchical category tree
  const categoryTree = useMemo(() => {
    if (cats.length === 0) {
      return DEFAULT_CATS.map(c => ({ name: c.name, slug: c.slug, subcategories: [] }));
    }
    const map: Record<string, any> = {};
    const roots: any[] = [];

    // Filter categories to only those with products (if at least one category has products)
    const hasAnyProducts = cats.some(c => (c.productCount || 0) > 0);
    const activeCats = hasAnyProducts ? cats.filter(c => {
      if ((c.productCount || 0) > 0) return true;
      if (!c.parentCategory) {
        return cats.some(child => child.parentCategory === c.slug && (child.productCount || 0) > 0);
      }
      return false;
    }) : cats;

    activeCats.forEach(c => {
      map[c.slug] = {
        name: c.name,
        slug: c.slug,
        parentCategory: c.parentCategory,
        image: c.image || '',
        icon: c.icon || '',
        productCount: c.productCount || 0,
        subcategories: []
      };
    });

    activeCats.forEach(c => {
      const node = map[c.slug];
      if (c.parentCategory && map[c.parentCategory]) {
        map[c.parentCategory].subcategories.push(node);
      } else if (!c.parentCategory) {
        roots.push(node);
      }
    });

    return roots;
  }, [cats]);

  // Window scroll listener with passive listener
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      logInteraction('search_intent', window.location.pathname, { keyword: query.trim() });
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/shop');
    }
    setSearchOpen(false);
  }, [query, router]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    cats,
    categoryTree,
    catOpen,
    setCatOpen,
    mobileOpen,
    setMobileOpen,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    scrolled,
    showTop,
    mounted,
    catRef,
    handleSearch,
    scrollToTop,
  };
}
