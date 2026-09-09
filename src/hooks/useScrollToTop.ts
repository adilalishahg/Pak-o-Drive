'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * High-performance hook to monitor page scroll and trigger smooth scroll-to-top
 * Uses requestAnimationFrame and passive event listeners to preserve 60 FPS mobile performance.
 */
export function useScrollToTop(threshold: number = 280) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const checkScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return { showScrollTop, scrollToTop };
}
