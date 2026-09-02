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
              background: slide.bg || 'var(--pd-hero-grad-start, #fff7ed)',
              transform: 'translateZ(0)',
            }}
          >
            <Link
              href={slide.btnLink || '/shop'}
              className="smooothy-slide-clickable text-decoration-none"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '22px 28px',
                minHeight: '260px',
                gap: '20px',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              {/* Left Content Column */}
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                {slide.badge && (
                  <div style={{ marginBottom: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, var(--pd-primary, #ea580c), color-mix(in srgb, var(--pd-primary, #ea580c) 75%, #000))',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        boxShadow: '0 3px 10px rgba(234,88,12,0.25)',
                      }}
                    >
                      {slide.badge}
                    </span>
                  </div>
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
                    margin: '0 0 10px 0',
                    fontSize: 'clamp(1.15rem, 3.2vw, 2.2rem)',
                    lineHeight: 1.18,
                    letterSpacing: '-0.3px',
                  }}
                >
                  {slide.title}
                </h2>

                {/* Price Tag Directly Below Title */}
                {(slide.price || slide.originalPrice) && (
                  <div
                    className="hero-slide-price-tag"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    }}
                  >
                    {slide.originalPrice && slide.originalPrice > (slide.price || 0) && (
                      <del
                        style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          fontWeight: 600,
                          textDecoration: 'line-through',
                        }}
                      >
                        Rs. {slide.originalPrice.toLocaleString()}
                      </del>
                    )}
                    {slide.price && (
                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 900,
                          color: 'var(--pd-primary, #ea580c)',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        Rs. {slide.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right Product Image Column: Clean Centered Image */}
              {slide.productImage && (
                <div
                  className="hero-slide-image-col"
                  style={{
                    flex: '0 0 40%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: '260px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    className="hero-slide-img-box"
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      filter: 'drop-shadow(0 14px 24px rgba(0,0,0,0.1))',
                    }}
                  >
                    <Image
                      src={slide.productImage}
                      alt={slide.productImageAlt || slide.title}
                      fill
                      sizes="(max-width: 767px) 40vw, (max-width: 991px) 35vw, 260px"
                      style={{ objectFit: 'contain' }}
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      loading={idx === 0 ? undefined : 'lazy'}
                      draggable={false}
                    />
                  </div>
                </div>
              )}
            </Link>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGoTo(i);
              }}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            style={{
              position: 'absolute',
              left: '8px',
              top: '55%',
              transform: 'translateY(-50%)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
            aria-label="Previous slide"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            style={{
              position: 'absolute',
              right: '8px',
              top: '55%',
              transform: 'translateY(-50%)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
            aria-label="Next slide"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <style>{`
        @media (max-width: 767px) {
          .smooothy-slide-clickable {
            align-items: flex-start !important;
            min-height: 200px !important;
            padding-top: 14px !important;
            padding-bottom: 14px !important;
            padding-left: 44px !important;
            padding-right: 44px !important;
            gap: 12px !important;
          }
          .hero-slide-image-col {
            align-self: center !important;
            margin-top: 0 !important;
            padding-right: 0 !important;
            max-width: 140px !important;
          }
          .hero-slide-img-box {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
