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

  const goTo = useCallback((idx: number, direction: 'next' | 'prev' = 'next') => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 450);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length, 'next'), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, 'prev'), [current, slides.length, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next, autoPlayMs]);

  const slide = slides[current];

  return (
    <>
      <style>{`
        @keyframes hero-next {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes hero-prev {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes img-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .hero-slide-inner {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 32px 24px;
          gap: 24px;
          animation: hero-next 0.45s ease forwards;
        }
        .hero-slide-inner.anim-prev { animation: hero-prev 0.45s ease forwards; }

        /* Text col */
        .hero-text { flex: 1 1 0; min-width: 0; }

        /* Image col */
        .hero-img-col {
          flex: 0 0 45%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-img-float {
          animation: img-float 4s ease-in-out infinite;
          filter: drop-shadow(0 20px 32px rgba(0,0,0,0.15));
        }

        /* Dots */
        .hero-dot { border: none; padding: 0; cursor: pointer; transition: all 0.3s; background: rgba(15,23,42,0.2); border-radius: 4px; height: 7px; }
        .hero-dot.active { background: var(--pd-primary); }

        /* Nav buttons */
        .hero-nav { cursor: pointer; transition: opacity 0.2s; }
        .hero-nav:hover { opacity: 0.8; }

        /* Desktop */
        @media (min-width: 992px) {
          .hero-slide-inner { padding: 48px 56px; gap: 40px; }
        }

        /* Mobile — image smaller, side by side still */
        @media (max-width: 767px) {
          .hero-slide-inner { padding: 22px 16px 12px; gap: 12px; }
          .hero-img-col { flex: 0 0 38%; }
          .hero-desc { display: none; }
          .hero-tagline { font-size: 0.65rem !important; letter-spacing: 1.5px !important; }
          .hero-title { font-size: 1.25rem !important; line-height: 1.25 !important; margin-bottom: 12px !important; }
          .hero-badge { font-size: 9px !important; padding: 4px 10px !important; margin-bottom: 8px !important; }
          .hero-cta { padding: 9px 18px !important; font-size: 0.78rem !important; }
          .hero-view-all { display: none !important; }
          .hero-nav { display: none !important; }
        }

        @media (max-width: 480px) {
          .hero-img-col { flex: 0 0 42%; }
        }
      `}</style>

      <div style={{ position: 'relative', background: slide.bg, transition: 'background 0.5s ease', overflow: 'hidden' }}>

        {/* Slide content */}
        <div className={`hero-slide-inner${animating && dir === 'prev' ? ' anim-prev' : ''}`}>

          {/* LEFT — Text */}
          <div className="hero-text">
            <span className="hero-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 75%, #000))',
              color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px',
              padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase',
              marginBottom: '10px', boxShadow: '0 3px 10px rgba(234,88,12,0.3)',
            }}>
              {slide.badge}
            </span>

            <p className="hero-tagline" style={{
              color: slide.accent, fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px 0',
            }}>
              {slide.tagline}
            </p>

            <h2 className="hero-title" style={{
              fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0',
              fontSize: 'clamp(1.3rem, 3.5vw, 2.6rem)', lineHeight: 1.18, letterSpacing: '-0.3px',
            }}>
              {slide.title}
            </h2>

            <p className="hero-desc" style={{
              color: '#475569', fontSize: '0.92rem', lineHeight: 1.65,
              maxWidth: '420px', margin: '0 0 24px 0',
            }}>
              {slide.desc}
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href={slide.btnLink} className="btn-gradient hero-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  textDecoration: 'none', padding: '11px 24px',
                  borderRadius: '50px', fontWeight: 700, fontSize: '0.88rem',
                  whiteSpace: 'nowrap', lineHeight: 1,
                }}>
                {slide.btnLabel}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/shop" className="hero-view-all"
                style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none',
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--pd-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
                View All →
              </Link>
            </div>
          </div>

          {/* RIGHT — Product Image */}
          {slide.productImage && (
            <div className="hero-img-col">
              <div className="hero-img-float" style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                maxWidth: '320px',
              }}>
                <Image
                  src={slide.productImage}
                  alt={slide.productImageAlt || slide.title}
                  fill
                  sizes="(max-width: 767px) 42vw, (max-width: 991px) 38vw, 320px"
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom — dots + progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 0 10px', position: 'relative', gap: '6px' }}>
          {slides.map((_, i) => (
            <button key={i}
              className={`hero-dot${i === current ? ' active' : ''}`}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              aria-label={`Slide ${i + 1}`}
              style={{ width: i === current ? '22px' : '7px' }}
            />
          ))}
          {/* Progress bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.06)' }}>
            <div style={{
              height: '100%', background: 'var(--pd-primary)',
              width: `${((current + 1) / slides.length) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button onClick={prev} className="hero-nav position-absolute d-flex align-items-center justify-content-center"
          style={{ left: '12px', top: '50%', transform: 'translateY(-50%)',
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.4)' }}
          aria-label="Previous slide">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button onClick={next} className="hero-nav position-absolute d-flex align-items-center justify-content-center"
          style={{ right: '12px', top: '50%', transform: 'translateY(-50%)',
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 75%, #000))',
            border: 'none' }}
          aria-label="Next slide">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </>
  );
}
