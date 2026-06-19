'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  image: string;
  images: string[];
  name: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ image, images, name }) => {
  // Combine main image and gallery images, making sure there are no duplicates
  const allImages = Array.from(new Set([image, ...(images || [])])).filter(Boolean);
  const [activeImage, setActiveImage] = useState(allImages[0] || image);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Fallback states for images
  const [mainImgSrc, setMainImgSrc] = useState(activeImage || '/img/product-placeholder.png');
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    setMainImgSrc(activeImage || '/img/product-placeholder.png');
  }, [activeImage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="w-100">
      {/* Active Main Image Container with Magnifier Zoom */}
      <div 
        className="single-inner bg-light rounded d-flex align-items-center justify-content-center p-3 position-relative border overflow-hidden" 
        style={{ height: '400px', cursor: 'zoom-in' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={mainImgSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded"
          style={{
            objectFit: 'contain',
            pointerEvents: 'none', // Keeps mousemove triggering on container
            transition: isZoomed ? 'none' : 'transform 0.25s ease, transform-origin 0.25s ease',
            transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            padding: '1rem',
          }}
          onError={() => {
            setMainImgSrc('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400');
          }}
          priority
        />
        
        {/* Subtle Zoom Instruction Badge */}
        {!isZoomed && (
          <span 
            className="position-absolute bottom-3 end-3 badge bg-dark bg-opacity-50 text-white rounded-pill px-2.5 py-1"
            style={{ fontSize: '0.75rem', pointerEvents: 'none', transition: 'opacity 0.2s', zIndex: 10 }}
          >
            <i className="fas fa-search-plus me-1" /> Hover to zoom
          </span>
        )}
      </div>

      {/* Thumbnail Slider / List */}
      {allImages.length > 1 && (
        <div className="mt-3">
          <p className="text-muted small fw-semibold mb-2">Product Gallery ({allImages.length} images):</p>
          <div 
            className="d-flex gap-2 overflow-auto pb-2"
            style={{
              scrollbarWidth: 'thin',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {allImages.map((imgUrl, idx) => {
              const hasError = thumbnailErrors[idx];
              const thumbSrc = hasError 
                ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=72'
                : imgUrl;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`btn p-0 border rounded bg-white flex-shrink-0 position-relative ${
                    activeImage === imgUrl ? 'border-primary border-2 shadow-sm' : 'border-secondary-subtle'
                  }`}
                  style={{ 
                    width: '72px', 
                    height: '72px',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                  }}
                >
                  <Image 
                    src={thumbSrc} 
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="72px"
                    style={{ 
                      objectFit: 'contain', 
                      padding: '4px' 
                    }}
                    onError={() => {
                      setThumbnailErrors(prev => ({ ...prev, [idx]: true }));
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
