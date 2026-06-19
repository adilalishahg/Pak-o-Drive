'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

export interface HeroSlide {
  badge: string;
  tagline: string;
  title: string;
  desc: string;
  btnLink: string;
  btnLabel: string;
  accent: string;
  bg: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
}

export function HeroSlider({ slides, autoPlayMs = 5000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (idx: number, direction: 'next' | 'prev' = 'next') => {
      if (animating) return;
      setDir(direction);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
      }, 520);
    },
    [animating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 'next');
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev');
  }, [current, slides.length, goTo]);

  /* Auto-play */
  useEffect(() => {
    timerRef.current = setTimeout(next, autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next, autoPlayMs]);

  const slide = slides[current];

  /* Animation styles */
  const slideIn: React.CSSProperties = {
    animation: animating
      ? `pd-slide-${dir}-in 0.52s cubic-bezier(0.4,0,0.2,1) forwards`
      : 'none',
  };

  return (
    <>
      <style>{`
        @keyframes pd-slide-next-in {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes pd-slide-prev-in {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        .pd-hero-btn-nav {
          transition: all 0.22s ease;
          border: 2px solid rgba(255,255,255,0.22);
        }
        .pd-hero-btn-nav:hover {
          background: var(--pd-primary) !important;
          border-color: var(--pd-primary) !important;
          transform: scale(1.08);
        }
        .pd-hero-dot {
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          padding: 0;
        }
        .pd-hero-dot:hover { transform: scale(1.3); }
      `}</style>

      <div
        className="position-relative overflow-hidden"
        style={{ minHeight: '460px', background: slide.bg, transition: 'background 0.6s ease' }}
        aria-label="Featured Products Carousel"
        aria-roledescription="carousel"
      >
        {/* Slide content */}
        <div
          className="d-flex align-items-center h-100"
          style={{ minHeight: '460px', padding: 'clamp(32px, 5vw, 72px)', ...slideIn }}
          aria-roledescription="slide"
          aria-label={`Slide ${current + 1} of ${slides.length}: ${slide.title}`}
        >
          <div style={{ maxWidth: '620px' }}>
            {/* Badge */}
            <span
              className="d-inline-flex align-items-center gap-2 mb-4"
              style={{
                background: `linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 80%, #000))`,
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                padding: '5px 14px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                boxShadow: `0 4px 12px rgba(var(--pd-primary-rgb,234,88,12), 0.4)`,
              }}
            >
              {slide.badge}
            </span>

            {/* Tagline */}
            <p
              className="text-uppercase fw-bold mb-2"
              style={{ color: slide.accent, fontSize: '0.82rem', letterSpacing: '3px' }}
            >
              {slide.tagline}
            </p>

            {/* Title */}
            <h2
              className="fw-bold text-dark mb-3"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.5px' }}
            >
              {slide.title}
            </h2>

            {/* Description */}
            <p
              className="text-secondary mb-4"
              style={{ fontSize: '1rem', lineHeight: 1.7, maxWidth: '500px' }}
            >
              {slide.desc}
            </p>

            {/* CTAs */}
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <Link
                href={slide.btnLink}
                className="btn btn-gradient rounded-pill py-3 px-5"
                style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.2px' }}
              >
                {slide.btnLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link
                href="/shop"
                className="text-muted fw-semibold text-decoration-none"
                style={{ fontSize: '0.88rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--pd-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = '')}
              >
                View All Products →
              </Link>
            </div>
          </div>
        </div>

        {/* Prev / Next buttons */}
        <button
          onClick={prev}
          className="pd-hero-btn-nav position-absolute d-flex align-items-center justify-content-center"
          aria-label="Previous slide"
          style={{
            left: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)', cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pd-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          onClick={next}
          className="pd-hero-btn-nav position-absolute d-flex align-items-center justify-content-center"
          aria-label="Next slide"
          style={{
            right: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '46px', height: '46px', borderRadius: '50%',
            background: `linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 80%, #000))`,
            backdropFilter: 'blur(8px)', cursor: 'pointer', border: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(0,0,0,0.08)' }}>
          <div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 80%, #000))`,
              width: `${((current + 1) / slides.length) * 100}%`,
              transition: 'width 0.5s ease',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </div>

        {/* Dots */}
        <div
          style={{
            position: 'absolute', bottom: '18px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: '8px', alignItems: 'center',
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              className="pd-hero-dot"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
              style={{
                width: i === current ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === current
                  ? 'var(--pd-primary)'
                  : 'rgba(var(--pd-secondary, 15,23,42), 0.25)',
              }}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div
          style={{
            position: 'absolute', top: '20px', right: '72px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px', padding: '4px 12px',
            fontSize: '11px', fontWeight: 700, color: 'var(--pd-secondary)',
            letterSpacing: '0.5px',
          }}
        >
          {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      </div>
    </>
  );
}
