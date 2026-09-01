'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OptimizedImage } from '../common/OptimizedImage';
import { ProductImageGalleryProps } from '@/types/product';


export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  image,
  images,
  name,
  video,
  showVideoOnFront,
}) => {
  // Construct a list of media items: video is strictly shown ONLY when showVideoOnFront is enabled
  const mediaItems: { type: 'video' | 'image'; url: string }[] = [];
  const allImages = Array.from(new Set([image, ...(images || [])])).filter(Boolean);
  const hasActiveVideo = Boolean(showVideoOnFront && video && video.trim());

  if (hasActiveVideo && video) {
    mediaItems.push({ type: 'video', url: video.trim() });
  }

  allImages.forEach((img) => {
    mediaItems.push({ type: 'image', url: img });
  });



  const initialItem = mediaItems[0] || { type: 'image' as const, url: image };
  const [activeItem, setActiveItem] = useState<{ type: 'video' | 'image'; url: string }>(initialItem);
  const [mainImgSrc, setMainImgSrc] = useState(image || '/img/product-placeholder.png');
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});

  // Desktop Hover Zoom state
  const [isDesktopZoomed, setIsDesktopZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const cachedRect = useRef<DOMRect | null>(null);

  // Fullscreen Lightbox Modal State (The standard for mobile zoom)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);

  // Touch swipe in lightbox
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const initialImageRef = useRef(image);
  const prevImageRef = useRef(image);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Instant 0ms RAM Preloader: Pre-cache all full gallery images immediately in browser memory
  useEffect(() => {
    if (typeof window === 'undefined') return;
    allImages.forEach((imgUrl) => {
      if (!imgUrl) return;
      const cleanUrl = imgUrl.startsWith('http') || imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
      const preloadedImg = new window.Image();
      preloadedImg.src = cleanUrl;
    });
  }, [allImages]);

  // Synchronous, Instant media selector (0ms lag on mobile touch)
  const handleSelectMedia = useCallback((item: { type: 'video' | 'image'; url: string }) => {
    setActiveItem(item);
    if (item.type === 'image') {
      setMainImgSrc(item.url || '/img/product-placeholder.png');
    }
    setIsDesktopZoomed(false);
  }, []);

  // Update on variant change
  useEffect(() => {
    if (image && image !== prevImageRef.current) {
      setActiveItem({ type: 'image', url: image });
      setMainImgSrc(image);
    }
    prevImageRef.current = image;
  }, [image]);

  useEffect(() => {
    if (activeItem.type === 'video') {
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    }
  }, [activeItem]);


  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsLightboxZoomed(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Handle keyboard events for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNextMedia();
      if (e.key === 'ArrowLeft') handlePrevMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxIndex, mediaItems.length]);

  const openLightbox = (index?: number) => {
    const targetIdx = index !== undefined
      ? index
      : mediaItems.findIndex((m) => m.url === activeItem.url);
    setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
    setIsLightboxOpen(true);
  };

  const handleNextMedia = () => {
    setLightboxIndex((prev) => (prev + 1) % mediaItems.length);
    setIsLightboxZoomed(false);
  };

  const handlePrevMedia = () => {
    setLightboxIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    setIsLightboxZoomed(false);
  };

  /* ── Desktop mouse hover zoom ── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cachedRect.current || !isDesktopZoomed) return;
    const { left, top, width, height } = cachedRect.current;
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    cachedRect.current = containerRef.current.getBoundingClientRect();
    const { left, top, width, height } = cachedRect.current;
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
    setIsDesktopZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsDesktopZoomed(false);
    cachedRect.current = null;
  };

  // Lightbox swipe handlers
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45 && !isLightboxZoomed) {
      if (diff > 0) {
        handleNextMedia();
      } else {
        handlePrevMedia();
      }
    }
  };

  const isImage = activeItem.type === 'image';
  const currentLightboxItem = mediaItems[lightboxIndex] || activeItem;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Main Viewer */}
      <div
        ref={containerRef}
        onMouseEnter={isImage ? handleMouseEnter : undefined}
        onMouseLeave={isImage ? handleMouseLeave : undefined}
        onMouseMove={isImage ? handleMouseMove : undefined}
        onClick={() => openLightbox()}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#ffffff',
          overflow: 'hidden',
          cursor: isImage ? 'zoom-in' : 'default',
          userSelect: 'none',
        }}
      >
        {!isImage ? (
          <video
            ref={videoRef}
            src={activeItem.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '12px',
            }}
          />
        ) : (
          <OptimizedImage
            src={mainImgSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: 'contain',
              padding: '12px',
              transition: isDesktopZoomed ? 'none' : 'transform 0.25s ease',
              transform: isDesktopZoomed ? 'scale(1.8)' : 'scale(1)',
              transformOrigin: isDesktopZoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : '50% 50%',
              pointerEvents: 'none',
            }}
            onError={() => setMainImgSrc('/img/product-placeholder.png')}
            priority
            draggable={false}
          />
        )}

        {/* Zoom Button Trigger (Mobile & Desktop) */}
        {isImage && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox();
            }}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              cursor: 'pointer',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
            }}
            aria-label="Open Fullscreen HD Zoom"
          >
            <i className="fas fa-expand-arrows-alt" style={{ fontSize: '11px' }} />
            <span>Tap to Zoom</span>
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 12px',
            overflowX: 'auto',
            background: '#fafafa',
            borderTop: '1px solid #f0f0f0',
            scrollbarWidth: 'none',
          }}
        >
          {mediaItems.map((item, idx) => {
            const isActive = activeItem.url === item.url;
            return (
              <button
                key={idx}
                onClick={() => handleSelectMedia(item)}
                type="button"

                style={{
                  width: '58px',
                  height: '58px',
                  flexShrink: 0,
                  border: isActive ? '2px solid var(--pd-primary, #ea580c)' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#fff',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
              >
                {item.type === 'video' ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    <i className="fas fa-play" style={{ fontSize: '14px', color: 'var(--pd-primary, #ea580c)' }} />
                    <span style={{ fontSize: '8px', fontWeight: 800, marginTop: '2px' }}>VIDEO</span>
                  </div>
                ) : (
                  <OptimizedImage
                    src={thumbnailErrors[idx] ? '/img/product-placeholder.png' : item.url}
                    alt={`${name} ${idx + 1}`}
                    fill
                    sizes="58px"
                    style={{ objectFit: 'contain', padding: '4px' }}
                    onError={() => setThumbnailErrors((p) => ({ ...p, [idx]: true }))}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── World-Class Fullscreen HD Lightbox Modal (Mobile & Desktop) ── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Lightbox Top Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              zIndex: 10,
              padding: '4px 8px',
            }}
          >
            {/* Counter */}
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              {lightboxIndex + 1} / {mediaItems.length}
            </span>

            {/* Product Title Clamped */}
            <span
              style={{
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: 0.85,
              }}
            >
              {name}
            </span>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background 0.15s',
              }}
              aria-label="Close Lightbox"
            >
              ✕
            </button>
          </div>

          {/* Lightbox Main Stage */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              margin: '10px 0',
            }}
          >
            {/* Left Nav Arrow */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevMedia();
                }}
                style={{
                  position: 'absolute',
                  left: '8px',
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            {/* Active Media Container */}
            <div
              onClick={() => setIsLightboxZoomed((prev) => !prev)}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentLightboxItem.type === 'image' ? (isLightboxZoomed ? 'zoom-out' : 'zoom-in') : 'default',
              }}
            >
              {currentLightboxItem.type === 'video' ? (
                <video
                  src={currentLightboxItem.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <OptimizedImage
                  src={currentLightboxItem.url}
                  alt={name}
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: 'contain',
                    transition: 'transform 0.25s ease',
                    transform: isLightboxZoomed ? 'scale(1.8)' : 'scale(1)',
                  }}
                  draggable={false}
                  priority
                />
              )}
            </div>

            {/* Right Nav Arrow */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextMedia();
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>

          {/* Lightbox Bottom Strip: Thumbnails & Helper Hint */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Swipe left/right to browse · Tap image to zoom
            </span>

            {mediaItems.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  padding: '4px',
                  scrollbarWidth: 'none',
                }}
              >
                {mediaItems.map((item, idx) => {
                  const isSel = lightboxIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLightboxIndex(idx);
                        setIsLightboxZoomed(false);
                      }}
                      style={{
                        width: '48px',
                        height: '48px',
                        flexShrink: 0,
                        border: isSel ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#000',
                        position: 'relative',
                        padding: 0,
                        cursor: 'pointer',
                        opacity: isSel ? 1 : 0.6,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <OptimizedImage
                        src={item.url}
                        alt={`${name} thumb ${idx + 1}`}
                        fill
                        sizes="48px"
                        style={{ objectFit: 'contain' }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
