'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroSlide, HeroSliderProps } from '@/types/common';
import { SmooothyHeroSlider } from './SmooothyHeroSlider';
export type { HeroSlide };

function ClassicHeroSlider({
  slides,
  autoPlayMs = 5000,
  autoPlayEnabled = true,
  showArrows = true,
  showDots = true,
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (slides.length <= 1) return;
    setCurrent(idx);
  }, [slides.length]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    if (!autoPlayEnabled || slides.length <= 1 || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(next, Math.max(autoPlayMs, 2000));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next, autoPlayMs, autoPlayEnabled, slides.length, isPaused]);

  if (!slides || slides.length === 0) return null;
  const slide = slides[current] || slides[0];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      style={{
        position: 'relative',
        background: slide.bg || 'var(--pd-hero-grad-start, #fff7ed)',
        transition: 'background 0.5s ease',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '36px 24px',
          gap: '24px',
          minHeight: '340px',
        }}
      >
        {/* Left Column */}
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

        {/* Right Column */}
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
                priority={current === 0}
                loading={current === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 0 12px',
            position: 'relative',
            gap: '6px',
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                borderRadius: '4px',
                height: '6px',
                width: i === current ? '22px' : '7px',
                background: i === current ? 'var(--pd-primary, #ea580c)' : 'rgba(15,23,42,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
          {/* Progress bar */}
          {autoPlayEnabled && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.06)' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--pd-primary, #ea580c)',
                  width: `${((current + 1) / slides.length) * 100}%`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Prev / Next Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 10,
            }}
            aria-label="Previous slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            style={{
              position: 'absolute',
              right: '10px',
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

export function HeroSlider({
  slides,
  autoPlayMs = 5000,
  autoPlayEnabled = true,
  showArrows = true,
  showDots = true,
  engine = 'smooothy',
}: HeroSliderProps) {
  if (engine === 'classic') {
    return (
      <ClassicHeroSlider
        slides={slides}
        autoPlayMs={autoPlayMs}
        autoPlayEnabled={autoPlayEnabled}
        showArrows={showArrows}
        showDots={showDots}
      />
    );
  }

  return (
    <SmooothyHeroSlider
      slides={slides}
      autoPlayMs={autoPlayMs}
      autoPlayEnabled={autoPlayEnabled}
      showArrows={showArrows}
      showDots={showDots}
    />
  );
}
