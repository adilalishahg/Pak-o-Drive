'use client';

import { useLayoutEffect, useEffect } from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Hook to guarantee instant viewport scroll to (0, 0) synchronously before browser paint on mount.
 */
export function useScrollToTopOnMount() {
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // Instant top scroll before browser paint
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // RAF fallback in case async content or hydration shifts layout
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(raf);
  }, []);
}
