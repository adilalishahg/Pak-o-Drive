'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  image: string;
  images: string[];
  name: string;
  video?: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ image, images, name, video }) => {
  // Construct a list of media items: video goes first
  const mediaItems: { type: 'video' | 'image'; url: string }[] = [];
  if (video) {
    mediaItems.push({ type: 'video', url: video });
  }
  const allImages = Array.from(new Set([image, ...(images || [])])).filter(Boolean);
  allImages.forEach(img => {
    mediaItems.push({ type: 'image', url: img });
  });

  // Start on video if available, otherwise the main image
  const initialItem = mediaItems[0] || { type: 'image' as const, url: image };
  const [activeItem, setActiveItem] = useState<{ type: 'video' | 'image'; url: string }>(initialItem);

  const [mainImgSrc, setMainImgSrc] = useState(
    initialItem.type === 'image' ? initialItem.url : '/img/product-placeholder.png'
  );
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

  // Track first mount: on first render don't override the video with image
  const isFirstMount = useRef(true);

  // Only reset to the new variant image when the user explicitly picks a variant
  // (skip the first mount so the video stays active on initial load)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (image) {
      setActiveItem({ type: 'image', url: image });
    }
  }, [image]);

  useEffect(() => {
    if (activeItem.type === 'image') {
      setMainImgSrc(activeItem.url || '/img/product-placeholder.png');
    }
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [activeItem]);

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
  const isImage = activeItem.type === 'image';

  return (
    <div style={{ width: '100%' }}>
      {/* Main viewer */}
      <div
        ref={containerRef}
        onMouseEnter={isImage ? handleMouseEnter : undefined}
        onMouseLeave={isImage ? () => { setZoomed(false); setPan({ x: 0, y: 0 }); } : undefined}
        onMouseMove={isImage ? handleMouseMove : undefined}
        onTouchStart={isImage ? handleTouchStart : undefined}
        onTouchMove={isImage ? handleTouchMove : undefined}
        onTouchEnd={isImage ? handleTouchEnd : undefined}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#f5f5f5',
          overflow: 'hidden',
          cursor: isImage ? (zoomed ? 'zoom-out' : 'zoom-in') : 'default',
          touchAction: (isImage && zoomed) ? 'none' : 'auto',
        }}
      >
        {!isImage ? (
          <video
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
        )}

        {/* Hint badge */}
        {isImage && !zoomed && (
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
        {isImage && zoomed && (
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
      {mediaItems.length > 1 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '10px 12px',
          overflowX: 'auto', background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          scrollbarWidth: 'none',
        }}>
          {mediaItems.map((item, idx) => {
            const isActive = activeItem.url === item.url;
            return (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                style={{
                  width: '62px', height: '62px', flexShrink: 0,
                  border: isActive ? '2px solid var(--pd-primary)' : '2px solid #e5e7eb',
                  borderRadius: '6px', background: '#fff', padding: 0,
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  transition: 'all 0.15s ease', outline: 'none',
                }}
              >
                {item.type === 'video' ? (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#f1f5f9', color: '#475569'
                  }}>
                    <i className="fas fa-play" style={{ fontSize: '15px', color: 'var(--pd-primary)' }} />
                    <span style={{ fontSize: '8px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.5px' }}>VIDEO</span>
                  </div>
                ) : (
                  <Image
                    src={thumbnailErrors[idx] ? '/img/product-placeholder.png' : item.url}
                    alt={`${name} ${idx + 1}`}
                    fill
                    sizes="62px"
                    style={{ objectFit: 'contain', padding: '4px' }}
                    onError={() => setThumbnailErrors(p => ({ ...p, [idx]: true }))}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
