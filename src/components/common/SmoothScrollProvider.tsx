'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: any) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [lenisReady, setLenisReady] = useState(false);

  useEffect(() => {
    // SSR Guard - Only initialize on client
    if (typeof window === 'undefined') return;

    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.2,
      autoRaf: false, // We control RAF explicitly for buttery 120fps
    });

    lenisRef.current = lenis;
    setLenisReady(true);

    // Dynamic Top Progress Bar updates via direct DOM transform (zero React re-render lag)
    lenis.on('scroll', (e: any) => {
      if (progressBarRef.current) {
        const progress = Math.max(0, Math.min(1, e.progress || 0));
        progressBarRef.current.style.transform = `scaleX(${progress})`;
        progressBarRef.current.style.opacity = progress > 0.005 ? '1' : '0';
      }
    });

    // Request Animation Frame loop
    let rafId: number;
    function updateRaf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(updateRaf);
    }
    rafId = requestAnimationFrame(updateRaf);

    // Global interceptor for smooth #hash anchor scrolling
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          event.preventDefault();
          lenis.scrollTo(element as HTMLElement, {
            offset: -80, // Offset for sticky navbar
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll to top on Next.js 16 route transition
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const scrollTo = (target: string | number | HTMLElement, options?: any) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {/* Luxury Glowing Scroll Progress Bar */}
      <div className="pd-scroll-progress-container" aria-hidden="true">
        <div ref={progressBarRef} className="pd-scroll-progress-bar" />
      </div>

      {children}
    </SmoothScrollContext.Provider>
  );
}
