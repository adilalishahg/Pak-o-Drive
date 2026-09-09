'use client';

import React, { useEffect, useRef } from 'react';
import { useSmoothScroll } from './SmoothScrollProvider';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number; // e.g. -0.15 (slower) or 0.15 (faster)
  className?: string;
  style?: React.CSSProperties;
}

/**
 * High-Performance Parallax Container powered by Lenis 120fps RAF loop
 * Delivers multi-layer depth for car banners, category cards, and product showcases.
 */
export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.12,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (!lenis) return;

    // Check user reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onScroll = () => {
      if (!containerRef.current || !contentRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Only calculate if element is anywhere near viewport
      if (rect.bottom >= -100 && rect.top <= windowHeight + 100) {
        const center = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const delta = center - viewportCenter;
        const translateVal = delta * speed;

        contentRef.current.style.transform = `translate3d(0, ${translateVal.toFixed(2)}px, 0)`;
      }
    };

    lenis.on('scroll', onScroll);

    return () => {
      lenis.off('scroll', onScroll);
    };
  }, [lenis, speed]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
      style={{
        ...style,
      }}
    >
      <div
        ref={contentRef}
        style={{
          willChange: 'transform',
          transition: 'transform 0.05s linear',
        }}
      >
        {children}
      </div>
    </div>
  );
};
