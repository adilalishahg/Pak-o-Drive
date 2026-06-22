'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  image: string;
  images: string[];
  name: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ image, images, name }) => {
  const allImages = Array.from(new Set([image, ...(images || [])])).filter(Boolean);
  const [activeImage, setActiveImage] = useState(allImages[0] || image);
  const [mainImgSrc, setMainImgSrc] = useState(activeImage || '/img/product-placeholder.png');
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});

  // Zoom + pan state
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch drag tracking
  const isDragging = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchMoved = useRef(false);

  useEffect(() => {
    setMainImgSrc(activeImage || '/img/product-placeholder.png');
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [activeImage]);

  /* ── Desktop mouse ── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !zoomed) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
    setZoomed(true);
  };

  /* ── Mobile touch ── */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchMoved.current = false;
    isDragging.current = false;
  };

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    e.preventDefault(); // prevent page scroll when zoomed
    const touch = e.touches[0];
    const dx = touch.clientX - lastTouch.current.x;
    const dy = touch.clientY - lastTouch.current.y;
    lastTouch.current = { x: touch.clientX, y: touch.clientY };

    const totalMoved = Math.abs(touch.clientX - touchStartPos.current.x)
      + Math.abs(touch.clientY - touchStartPos.current.y);
    if (totalMoved > 5) {
      touchMoved.current = true;
      isDragging.current = true;
    }

    // Clamp pan so image doesn't go too far out
    setPan(prev => ({
      x: Math.max(-150, Math.min(150, prev.x + dx)),
      y: Math.max(-150, Math.min(150, prev.y + dy)),
    }));
  }, [zoomed]);

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      // Was a drag — don't toggle zoom
      isDragging.current = false;
      return;
    }
    // Was a tap
    if (!zoomed) {
      if (!containerRef.current) return;
      const touch = e.changedTouches[0];
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = ((touch.clientX - left) / width) * 100;
      const y = ((touch.clientY - top) / height) * 100;
      setZoomOrigin({ x, y });
      setPan({ x: 0, y: 0 });
      setZoomed(true);
    } else {
      setZoomed(false);
      setPan({ x: 0, y: 0 });
    }
  };

  const SCALE = 2.4;

  // When zoomed, transform uses translate for pan + scale with transformOrigin for initial zoom point
  const imgTransform = zoomed
    ? `scale(${SCALE}) translate(${pan.x / SCALE}px, ${pan.y / SCALE}px)`
    : 'scale(1)';

  const imgTransformOrigin = zoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : '50% 50%';

  return (
    <div style={{ width: '100%' }}>
      {/* Main image */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => { setZoomed(false); setPan({ x: 0, y: 0 }); }}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#f5f5f5',
          overflow: 'hidden',
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
          touchAction: zoomed ? 'none' : 'auto', // block scroll only when zoomed
        }}
      >
        <Image
          src={mainImgSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{
            objectFit: 'contain',
            padding: '12px',
            transition: zoomed ? 'none' : 'transform 0.3s ease',
            transform: imgTransform,
            transformOrigin: imgTransformOrigin,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          onError={() => setMainImgSrc('/img/product-placeholder.png')}
          priority
          draggable={false}
        />

        {/* Hint badge */}
        {!zoomed && (
          <span style={{
            position: 'absolute', bottom: '10px', right: '10px',
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 600,
            padding: '4px 9px', borderRadius: '20px',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none', zIndex: 5,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <i className="fas fa-search-plus" style={{ fontSize: '10px' }} />
            Zoom
          </span>
        )}

        {/* Mobile close hint */}
        {zoomed && (
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            fontSize: '0.6rem', fontWeight: 600,
            padding: '3px 8px', borderRadius: '20px',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none', zIndex: 5,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <i className="fas fa-hand-paper" style={{ fontSize: '9px' }} />
            Drag · Tap to close
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div style={{
          display: 'flex', gap: '6px', padding: '10px 12px',
          overflowX: 'auto', background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          scrollbarWidth: 'none',
        }}>
          {allImages.map((imgUrl, idx) => {
            const isActive = activeImage === imgUrl;
            const src = thumbnailErrors[idx] ? '/img/product-placeholder.png' : imgUrl;
            return (
              <button
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                style={{
                  width: '62px', height: '62px', flexShrink: 0,
                  border: isActive ? '2px solid var(--pd-primary)' : '2px solid #e5e7eb',
                  borderRadius: '6px', background: '#fff', padding: 0,
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  transition: 'border-color 0.15s', outline: 'none',
                }}
              >
                <Image
                  src={src}
                  alt={`${name} ${idx + 1}`}
                  fill
                  sizes="62px"
                  style={{ objectFit: 'contain', padding: '4px' }}
                  onError={() => setThumbnailErrors(p => ({ ...p, [idx]: true }))}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
