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
 * Adheres to Zero Logic in UI (Rule 8) and 100% Uncropped Media Presentation (Rule 3).
 * Fully optimized for sub-10ms mobile responsive interactions.
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
    mainImgSrc,
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
      {/* ── Main Dual-Layer Uncropped Media Stage ── */}
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
        {/* Layer 1: Ambient Blur Backdrop for Uncropped Dual-Layer Presentation (Hardware Accelerated) */}
        {isImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${mainImgSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(22px)',
              opacity: 0.16,
              transform: 'scale(1.2) translateZ(0)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          />
        )}

        {/* Layer 2: Main Media Foreground with High Priority Eager Loading */}
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
              zIndex: 2,
            }}
          />
        ) : (
          <OptimizedImage
            src={mainImgSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
            style={{
              objectFit: 'contain',
              padding: '12px',
              transition: isDesktopZoomed ? 'none' : 'transform 0.25s ease',
              transform: isDesktopZoomed ? 'scale(1.8)' : 'scale(1)',
              transformOrigin: isDesktopZoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : '50% 50%',
              pointerEvents: 'none',
              zIndex: 2,
            }}
            onError={handleMainImageError}
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

      {/* ── Thumbnails Strip ── */}
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
