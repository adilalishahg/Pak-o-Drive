'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroSlide } from '@/types/common';
import { Smooothy } from '@/lib/smooothy';

export interface SmooothyHeroSliderProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
  autoPlayEnabled?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
}

export function SmooothyHeroSlider({
  slides,
  autoPlayMs = 5000,
  autoPlayEnabled = true,
  showArrows = true,
  showDots = true,
}: SmooothyHeroSliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<Smooothy | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current || !containerRef.current || slides.length === 0) return;

    const validSlides = slideRefs.current.filter(Boolean) as HTMLElement[];
    if (validSlides.length === 0) return;

    const smooothyInstance = new Smooothy({
      wrapper: wrapperRef.current,
      container: containerRef.current,
      slides: validSlides,
      lerpFactor: 0.12,
      dragSpeed: 1.2,
      snap: true,
      infinite: false,
      autoPlay: autoPlayEnabled,
      autoPlayInterval: autoPlayMs,
      onIndexChange: (idx) => setActiveIndex(idx),
    });

    engineRef.current = smooothyInstance;

    return () => {
      smooothyInstance.destroy();
      engineRef.current = null;
    };
  }, [slides, autoPlayMs, autoPlayEnabled]);

  const lastClickRef = useRef<number>(0);

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastClickRef.current < 250) return;
    lastClickRef.current = now;
    engineRef.current?.next();
  }, []);

  const handlePrev = useCallback(() => {
    const now = Date.now();
    if (now - lastClickRef.current < 250) return;
    lastClickRef.current = now;
    engineRef.current?.prev();
  }, []);

  const handleGoTo = useCallback((idx: number) => {
    const now = Date.now();
    if (now - lastClickRef.current < 250) return;
    lastClickRef.current = now;
    engineRef.current?.goTo(idx);
  }, []);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="smooothy-slider-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        touchAction: 'pan-y',
        userSelect: 'none',
        background: 'var(--pd-hero-grad-start, #fff7ed)',
      }}
    >
      {/* Track container with hardware acceleration */}
      <div
        ref={containerRef}
        className="smooothy-track"
        style={{
          display: 'flex',
          width: `${slides.length * 100}%`,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            ref={(el) => {
              slideRefs.current[idx] = el;
            }}
            className="smooothy-slide"
            style={{
              width: `${100 / slides.length}%`,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '36px 24px',
              minHeight: '340px',
              gap: '24px',
              background: slide.bg || 'var(--pd-hero-grad-start, #fff7ed)',
              transform: 'translateZ(0)',
            }}
          >
            {/* Left Content Column */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              {slide.badge && (
                <span
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, var(--pd-primary, #ea580c), color-mix(in srgb, var(--pd-primary, #ea580c) 75%, #000))',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    boxShadow: '0 3px 10px rgba(234,88,12,0.3)',
                  }}
                >
                  {slide.badge}
                </span>
              )}

              {slide.tagline && (
                <p
                  style={{
                    color: slide.accent || 'var(--pd-primary, #ea580c)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    margin: '0 0 6px 0',
                  }}
                >
                  {slide.tagline}
                </p>
              )}

              <h2
                style={{
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 14px 0',
                  fontSize: 'clamp(1.3rem, 3.5vw, 2.6rem)',
                  lineHeight: 1.18,
                  letterSpacing: '-0.3px',
                }}
              >
                {slide.title}
              </h2>

              {slide.desc && (
                <p
                  style={{
                    color: '#475569',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    maxWidth: '440px',
                    margin: '0 0 24px 0',
                  }}
                >
                  {slide.desc}
                </p>
              )}

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link
                  href={slide.btnLink || '/shop'}
                  className="btn-gradient"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    textDecoration: 'none',
                    padding: '11px 24px',
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {slide.btnLabel || 'Shop Now'}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link
                  href="/shop"
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  View All →
                </Link>
              </div>
            </div>

            {/* Right Product Image Column */}
            {slide.productImage && (
              <div
                style={{
                  flex: '0 0 42%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: '340px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    filter: 'drop-shadow(0 20px 32px rgba(0,0,0,0.12))',
                  }}
                >
                  <Image
                    src={slide.productImage}
                    alt={slide.productImageAlt || slide.title}
                    fill
                    sizes="(max-width: 767px) 42vw, (max-width: 991px) 38vw, 340px"
                    style={{ objectFit: 'contain' }}
                    priority={idx === 0}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Line */}
      {autoPlayEnabled && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(0,0,0,0.06)' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--pd-primary, #ea580c)',
              width: `${((activeIndex + 1) / slides.length) * 100}%`,
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            zIndex: 10,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleGoTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                borderRadius: '4px',
                height: '6px',
                width: i === activeIndex ? '24px' : '7px',
                background: i === activeIndex ? 'var(--pd-primary, #ea580c)' : 'rgba(15,23,42,0.25)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>
      )}

      {/* Prev / Next Navigation Handles */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 10,
              transition: 'transform 0.2s ease',
            }}
            aria-label="Previous slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--pd-primary, #ea580c), color-mix(in srgb, var(--pd-primary, #ea580c) 75%, #000))',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234,88,12,0.3)',
              zIndex: 10,
              transition: 'transform 0.2s ease',
            }}
            aria-label="Next slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
