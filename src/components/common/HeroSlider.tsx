'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface HeroSlide {
  badge: string;
  tagline: string;
  title: string;
  desc: string;
  btnLink: string;
  btnLabel: string;
  accent: string;
  bg: string;
  productImage?: string;
  productImageAlt?: string;
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

  useEffect(() => {
    timerRef.current = setTimeout(next, autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next, autoPlayMs]);

  const slide = slides[current];

  const contentAnim: React.CSSProperties = {
    animation: animating
      ? `pd-slide-${dir}-in 0.52s cubic-bezier(0.4,0,0.2,1) forwards`
      : 'none',
  };

  const imgAnim: React.CSSProperties = {
    animation: animating
      ? `pd-img-${dir}-in 0.6s cubic-bezier(0.4,0,0.2,1) forwards`
      : 'none',
  };

  return (
    <>
      <style>{`
        @keyframes pd-slide-next-in {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pd-slide-prev-in {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pd-img-next-in {
          from { opacity: 0; transform: translateX(80px) scale(0.92); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes pd-img-prev-in {
          from { opacity: 0; transform: translateX(-80px) scale(0.92); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes pd-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        .pd-hero-product-img {
          animation: pd-float 4s ease-in-out infinite;
          filter: drop-shadow(0 30px 40px rgba(0,0,0,0.18));
        }
        .pd-hero-btn-nav {
          transition: all 0.22s ease;
          border: 2px solid rgba(255,255,255,0.22);
        }
        .pd-hero-btn-nav:hover {
          background: var(--pd-primary) !important;
          border-color: var(--pd-primary) !important;
        }
        .pd-hero-dot {
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          padding: 0;
        }
        .pd-hero-dot:hover { transform: scale(1.3); }
        .pd-hero-blob {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.10) 0%, transparent 70%);
          top: 50%;
          right: -60px;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .btn-gradient {
          background: linear-gradient(135deg, var(--pd-primary) 0%, var(--pd-primary-dark, #c2410c) 100%) !important;
          color: #fff !important;
          border: none !important;
          box-shadow: 0 6px 20px rgba(234,88,12,0.35) !important;
          transition: all 0.25s ease !important;
        }
        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(234,88,12,0.45) !important;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
        }
        @media (max-width: 991px) {
          .pd-hero-product-col { display: none !important; }
        }
      `}</style>

      <div
        className="position-relative overflow-hidden"
        style={{ minHeight: '520px', background: slide.bg, transition: 'background 0.6s ease' }}
        aria-label="Featured Products Carousel"
        aria-roledescription="carousel"
      >
        {slide.productImage && <div className="pd-hero-blob" />}

        <div style={{ minHeight: '520px', display: 'flex', alignItems: 'stretch' }}>
          <div className="container-fluid" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="row w-100 align-items-center" style={{ minHeight: '520px' }}>

              {/* ── Left: Text ── */}
              <div
                className={`${slide.productImage ? 'col-lg-6' : 'col-12'} col-12 py-5`}
                style={{ paddingLeft: 'clamp(24px, 5vw, 80px)', paddingRight: '24px', ...contentAnim }}
              >
                {/* Badge */}
                <span
                  className="d-inline-flex align-items-center gap-2 mb-4"
                  style={{
                    background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    padding: '5px 14px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(234,88,12,0.4)',
                  }}
                >
                  {slide.badge}
                </span>

                {/* Tagline */}
                <p className="text-uppercase fw-bold mb-2" style={{ color: slide.accent, fontSize: '0.82rem', letterSpacing: '3px' }}>
                  {slide.tagline}
                </p>

                {/* Title */}
                <h2 className="fw-bold text-dark mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="text-secondary mb-5" style={{ fontSize: '1rem', lineHeight: 1.7, maxWidth: '480px' }}>
                  {slide.desc}
                </p>

                {/* CTAs */}
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  <Link
                    href={slide.btnLink}
                    className="btn btn-gradient rounded-pill px-5"
                    style={{ fontSize: '0.92rem', fontWeight: 700, padding: '14px 32px', letterSpacing: '0.2px' }}
                  >
                    {slide.btnLabel}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-2">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                  <Link
                    href="/shop"
                    className="fw-semibold text-decoration-none d-flex align-items-center gap-1"
                    style={{ fontSize: '0.88rem', color: '#64748b', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--pd-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                  >
                    View All Products
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* ── Right: Product Image ── */}
              {slide.productImage && (
                <div
                  className="pd-hero-product-col col-lg-6 d-flex align-items-center justify-content-center"
                  style={{ minHeight: '400px', ...imgAnim }}
                >
                  <div className="pd-hero-product-img" style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '380px' }}>
                    <Image
                      src={slide.productImage}
                      alt={slide.productImageAlt || slide.title}
                      fill
                      sizes="(max-width: 991px) 0px, 400px"
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Prev button */}
        <button
          onClick={prev}
          className="pd-hero-btn-nav position-absolute d-flex align-items-center justify-content-center"
          aria-label="Previous slide"
          style={{
            left: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(8px)', cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Next button */}
        <button
          onClick={next}
          className="pd-hero-btn-nav position-absolute d-flex align-items-center justify-content-center"
          aria-label="Next slide"
          style={{
            right: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)',
            backdropFilter: 'blur(8px)', cursor: 'pointer', border: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(0,0,0,0.08)' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--pd-primary), #c2410c)',
            width: `${((current + 1) / slides.length) * 100}%`,
            transition: 'width 0.5s ease',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                background: i === current ? 'var(--pd-primary)' : 'rgba(15,23,42,0.2)',
              }}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div style={{
          position: 'absolute', top: '20px', right: '72px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '11px', fontWeight: 700, color: '#0f172a',
          letterSpacing: '0.5px',
        }}>
          {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      </div>
    </>
  );
}
