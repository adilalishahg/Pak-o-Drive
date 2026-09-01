'use client';

import React from 'react';
import { OptimizedImage } from '../common/OptimizedImage';
import { GalleryMediaItem } from '@/hooks/useProductImageGallery';

export interface ProductLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  mediaItems: GalleryMediaItem[];
  currentIndex: number;
  isZoomed: boolean;
  onToggleZoom: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const ProductLightboxModal: React.FC<ProductLightboxModalProps> = ({
  isOpen,
  onClose,
  name,
  mediaItems,
  currentIndex,
  isZoomed,
  onToggleZoom,
  onPrev,
  onNext,
  onSelectIndex,
  onTouchStart,
  onTouchEnd,
}) => {
  if (!isOpen) return null;

  const currentItem = mediaItems[currentIndex] || mediaItems[0];
  if (!currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
      {/* Header */}
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
          {currentIndex + 1} / {mediaItems.length}
        </span>

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

        <button
          type="button"
          onClick={onClose}
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

      {/* Main Stage */}
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
        {mediaItems.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
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

        <div
          onClick={onToggleZoom}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentItem.type === 'image' ? (isZoomed ? 'zoom-out' : 'zoom-in') : 'default',
          }}
        >
          {currentItem.type === 'video' ? (
            <video
              src={currentItem.url}
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
              src={currentItem.url}
              alt={name}
              fill
              sizes="100vw"
              style={{
                objectFit: 'contain',
                transition: 'transform 0.25s ease',
                transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
              }}
              draggable={false}
              priority
            />
          )}
        </div>

        {mediaItems.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
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

      {/* Bottom Thumbnail Strip */}
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
              const isSel = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
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
  );
};
