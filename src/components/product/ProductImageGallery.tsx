'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { OptimizedImage } from '../common/OptimizedImage';
import { ProductImageGalleryProps } from '@/types/product';
import { useProductImageGallery } from '@/hooks/useProductImageGallery';

// Lazy-load Fullscreen Lightbox to reduce initial mobile JS bundle size
const ProductLightboxModal = dynamic(
  () => import('./ProductLightboxModal').then((m) => m.ProductLightboxModal),
  { ssr: false }
);

/**
 * ProductImageGallery - Pure Presentational View
 * Zero Logic in UI (Rule 8) + 100% Uncropped Media Presentation (Rule 3).
 * Optimized with Instant DOM Pre-rendered Layers for 0ms Thumbnail Switching.
 */
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  image,
  images,
  name,
  video,
  showVideoOnFront,
}) => {
  const {
    mediaItems,
    activeItem,
    thumbnailErrors,
    isDesktopZoomed,
    zoomOrigin,
    containerRef,
    videoRef,
    isLightboxOpen,
    lightboxIndex,
    isLightboxZoomed,
    isImage,
    handleSelectMedia,
    handleThumbnailError,
    handleMainImageError,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    openLightbox,
    closeLightbox,
    handleNextMedia,
    handlePrevMedia,
    toggleLightboxZoom,
    handleLightboxTouchStart,
    handleLightboxTouchEnd,
    setLightboxIndex,
    setIsLightboxZoomed,
  } = useProductImageGallery({
    image,
    images,
    video,
    showVideoOnFront,
  });

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* ── Main Stage: 100% Clean Crisp White Uncropped Container ── */}
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
        {/* Active Media Rendering — Multi-Layer Preloaded Stack for 0ms Swap */}
        {mediaItems.map((item, idx) => {
          const isItemActive = activeItem.url === item.url;
          if (item.type === 'video') {
            return isItemActive ? (
              <video
                key={idx}
                ref={videoRef}
                src={item.url}
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
                  padding: '8px',
                  zIndex: 2,
                }}
              />
            ) : null;
          }

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isItemActive ? 1 : 0,
                transition: 'opacity 0.12s ease-in-out',
                pointerEvents: isItemActive ? 'auto' : 'none',
                zIndex: isItemActive ? 2 : 1,
              }}
            >
              <OptimizedImage
                src={item.url}
                alt={`${name} - View ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={idx === 0}
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'low'}
                style={{
                  objectFit: 'contain',
                  padding: '12px',
                  transition: isDesktopZoomed && isItemActive ? 'none' : 'transform 0.2s ease',
                  transform: isDesktopZoomed && isItemActive ? 'scale(1.8)' : 'scale(1)',
                  transformOrigin: isDesktopZoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : '50% 50%',
                  pointerEvents: 'none',
                }}
                onError={handleMainImageError}
                draggable={false}
              />
            </div>
          );
        })}

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
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.15s ease',
            }}
            aria-label="Open Fullscreen HD Zoom"
          >
            <i className="fas fa-expand-arrows-alt" style={{ fontSize: '11px' }} />
            <span>Tap to Zoom</span>
          </button>
        )}
      </div>

      {/* ── Thumbnails Strip ── */}
      {mediaItems.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 12px',
            overflowX: 'auto',
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9',
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
                  width: '60px',
                  height: '60px',
                  flexShrink: 0,
                  border: isActive ? '2px solid var(--pd-primary, #ea580c)' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: '#ffffff',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  boxShadow: isActive ? '0 0 0 1px var(--pd-primary, #ea580c)' : 'none',
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
                      background: '#f8fafc',
                      color: '#475569',
                    }}
                  >
                    <i className="fas fa-play" style={{ fontSize: '14px', color: 'var(--pd-primary, #ea580c)' }} />
                    <span style={{ fontSize: '8px', fontWeight: 800, marginTop: '2px' }}>VIDEO</span>
                  </div>
                ) : (
                  <OptimizedImage
                    src={thumbnailErrors[idx] ? '/img/product-placeholder.png' : item.url}
                    alt={`${name} thumbnail ${idx + 1}`}
                    fill
                    sizes="60px"
                    loading="eager"
                    style={{ objectFit: 'contain', padding: '4px' }}
                    onError={() => handleThumbnailError(idx)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Fullscreen HD Lightbox Modal (Dynamically Imported) ── */}
      {isLightboxOpen && (
        <ProductLightboxModal
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
          name={name}
          mediaItems={mediaItems}
          currentIndex={lightboxIndex}
          isZoomed={isLightboxZoomed}
          onToggleZoom={toggleLightboxZoom}
          onPrev={handlePrevMedia}
          onNext={handleNextMedia}
          onSelectIndex={(idx) => {
            setLightboxIndex(idx);
            setIsLightboxZoomed(false);
          }}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        />
      )}
    </div>
  );
};

export default ProductImageGallery;
