'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface BlogCategoryNav {
  label: string;
  href: string;
  tag?: string;
}

export const BLOG_NAV_CATEGORIES: BlogCategoryNav[] = [
  { label: 'All Guides', href: '/auto' },
  { label: 'Seasonal Car Care', href: '/auto?category=Seasonal+Car+Care', tag: 'Summer AC & Smog' },
  { label: 'DIY Maintenance', href: '/auto?category=Car+Maintenance', tag: 'Tuning & Fluids' },
  { label: 'Fuel Economy', href: '/auto?category=Fuel+Economy+%26+Tuning', tag: 'Mileage Hacks' },
  { label: 'Smart Gadgets', href: '/auto?category=Smart+Car+Gadgets', tag: 'Gear Reviews' },
  { label: 'Driving Safety', href: '/auto?category=Driving+Safety+%26+Rules', tag: 'Motorway Protocols' },
];

export function useBlogNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isArticlePage =
    (pathname?.startsWith('/auto/') && pathname !== '/auto') ||
    (pathname?.startsWith('/blog/') && pathname !== '/blog') ||
    (pathname?.startsWith('/general/') && pathname !== '/general');

  // Lock mobile scroll when menu is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu and search on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Track reading scroll progress on single article pages
  useEffect(() => {
    if (typeof window === 'undefined' || !isArticlePage) {
      setReadingProgress(0);
      return;
    }

    let ticking = false;
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentProgress = (window.scrollY / scrollHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, isArticlePage]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      startTransition(() => {
        router.push(`/auto?search=${encodeURIComponent(searchQuery.trim())}`);
      });
      setSearchOpen(false);
    },
    [searchQuery, router]
  );

  return {
    pathname,
    categories: BLOG_NAV_CATEGORIES,
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu: () => setMobileMenuOpen((prev) => !prev),
    readingProgress,
    isArticlePage,
    searchOpen,
    setSearchOpen,
    toggleSearch: () => setSearchOpen((prev) => !prev),
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isPending,
  };
}
