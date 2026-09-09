'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: any) => void;
  scrollDirection: 'up' | 'down' | null;
  isScrolled: boolean;
  scrollY: number;
  stopScroll: () => void;
  startScroll: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  scrollDirection: null,
  isScrolled: false,
  scrollY: 0,
  stopScroll: () => {},
  startScroll: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const stopScroll = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
  }, []);

  const startScroll = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, []);

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

    let lastY = 0;
    let ticking = false;

    // Dynamic Top Progress Bar & Scroll Direction updates
    lenis.on('scroll', (e: any) => {
      const currentY = Math.max(0, e.animatedScroll ?? window.scrollY ?? 0);
      const progress = Math.max(0, Math.min(1, e.progress || 0));

      // Direct DOM update for top progress bar (zero React re-render lag)
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
        progressBarRef.current.style.opacity = progress > 0.005 ? '1' : '0';
      }

      // Hardware-accelerated html attributes for instant CSS responsiveness
      const htmlEl = document.documentElement;
      const threshold = 80;

      if (currentY > threshold) {
        if (htmlEl.getAttribute('data-scrolled') !== 'true') {
          htmlEl.setAttribute('data-scrolled', 'true');
        }

        const diff = currentY - lastY;
        if (Math.abs(diff) > 3) {
          const dir = diff > 0 ? 'down' : 'up';
          if (htmlEl.getAttribute('data-scroll-direction') !== dir) {
            htmlEl.setAttribute('data-scroll-direction', dir);
          }
        }
      } else {
        if (htmlEl.getAttribute('data-scrolled') === 'true') {
          htmlEl.removeAttribute('data-scrolled');
        }
        if (htmlEl.getAttribute('data-scroll-direction') !== 'up') {
          htmlEl.setAttribute('data-scroll-direction', 'up');
        }
      }

      lastY = currentY;

      // Throttle React state updates to avoid unnecessary render loops
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrollY(currentY);
          setIsScrolled(currentY > threshold);
          const dir = htmlEl.getAttribute('data-scroll-direction') as 'up' | 'down' | null;
          setScrollDirection(dir);
          ticking = false;
        });
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

    // Auto-Lock Lenis when any modal or drawer is open (body.overflow-hidden)
    const observer = new MutationObserver(() => {
      const isLocked =
        document.body.style.overflow === 'hidden' ||
        document.body.classList.contains('overflow-hidden') ||
        document.documentElement.classList.contains('overflow-hidden');

      if (isLocked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      observer.disconnect();
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

  const scrollTo = useCallback((target: string | number | HTMLElement, options?: any) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollTo,
        scrollDirection,
        isScrolled,
        scrollY,
        stopScroll,
        startScroll,
      }}
    >
      {/* Luxury Glowing Scroll Progress Bar */}
      <div className="pd-scroll-progress-container" aria-hidden="true">
        <div ref={progressBarRef} className="pd-scroll-progress-bar" />
      </div>

      {children}
    </SmoothScrollContext.Provider>
  );
}
