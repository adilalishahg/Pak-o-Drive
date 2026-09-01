import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface GalleryMediaItem {
  type: 'video' | 'image';
  url: string;
}

export interface UseProductImageGalleryProps {
  image: string;
  images?: string[];
  video?: string;
  showVideoOnFront?: boolean;
}

export function useProductImageGallery({
  image,
  images = [],
  video,
  showVideoOnFront,
}: UseProductImageGalleryProps) {
  // Construct a deduplicated list of media items
  const mediaItems = useMemo<GalleryMediaItem[]>(() => {
    const items: GalleryMediaItem[] = [];
    const allImages = Array.from(new Set([image, ...(images || [])])).filter(Boolean);
    const hasActiveVideo = Boolean(showVideoOnFront && video && video.trim());

    if (hasActiveVideo && video) {
      items.push({ type: 'video', url: video.trim() });
    }

    allImages.forEach((img) => {
      items.push({ type: 'image', url: img });
    });

    return items.length > 0 ? items : [{ type: 'image', url: image || '/img/product-placeholder.png' }];
  }, [image, images, video, showVideoOnFront]);

  const [activeItem, setActiveItem] = useState<GalleryMediaItem>(mediaItems[0]);
  const [mainImgSrc, setMainImgSrc] = useState(image || '/img/product-placeholder.png');
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});

  // Desktop Hover Zoom state
  const [isDesktopZoomed, setIsDesktopZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const cachedRect = useRef<DOMRect | null>(null);

  // Fullscreen Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);

  // Touch swipe in lightbox
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const prevImageRef = useRef(image);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Instant 0ms RAM Preloader: Pre-cache all full gallery images immediately in browser memory
  useEffect(() => {
    if (typeof window === 'undefined') return;
    mediaItems.forEach((item) => {
      if (item.type === 'image' && item.url) {
        const cleanUrl = item.url.startsWith('http') || item.url.startsWith('/') ? item.url : `/${item.url}`;
        const preloadedImg = new window.Image();
        preloadedImg.src = cleanUrl;
      }
    });
  }, [mediaItems]);

  // Synchronous, Instant media selector (0ms lag on mobile touch)
  const handleSelectMedia = useCallback((item: GalleryMediaItem) => {
    setActiveItem(item);
    if (item.type === 'image') {
      setMainImgSrc(item.url || '/img/product-placeholder.png');
    }
    setIsDesktopZoomed(false);
  }, []);

  // Update on variant change
  useEffect(() => {
    if (image && image !== prevImageRef.current) {
      const newItem: GalleryMediaItem = { type: 'image', url: image };
      setActiveItem(newItem);
      setMainImgSrc(image);
    }
    prevImageRef.current = image;
  }, [image]);

  // Play video on video media item selection
  useEffect(() => {
    if (activeItem.type === 'video') {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 50);
      return () => clearTimeout(timer);
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

  const handleNextMedia = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % mediaItems.length);
    setIsLightboxZoomed(false);
  }, [mediaItems.length]);

  const handlePrevMedia = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    setIsLightboxZoomed(false);
  }, [mediaItems.length]);

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
  }, [isLightboxOpen, handleNextMedia, handlePrevMedia]);

  const openLightbox = useCallback((index?: number) => {
    const targetIdx = index !== undefined
      ? index
      : mediaItems.findIndex((m) => m.url === activeItem.url);
    setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
    setIsLightboxOpen(true);
  }, [mediaItems, activeItem.url]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const toggleLightboxZoom = useCallback(() => {
    setIsLightboxZoomed((prev) => !prev);
  }, []);

  // Desktop mouse hover zoom
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cachedRect.current || !isDesktopZoomed) return;
    const { left, top, width, height } = cachedRect.current;
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
  }, [isDesktopZoomed]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || (typeof window !== 'undefined' && window.innerWidth < 768)) return;
    cachedRect.current = containerRef.current.getBoundingClientRect();
    const { left, top, width, height } = cachedRect.current;
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
    setIsDesktopZoomed(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDesktopZoomed(false);
    cachedRect.current = null;
  }, []);

  // Lightbox swipe handlers
  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleLightboxTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45 && !isLightboxZoomed) {
      if (diff > 0) {
        handleNextMedia();
      } else {
        handlePrevMedia();
      }
    }
  }, [handleNextMedia, handlePrevMedia, isLightboxZoomed]);

  const handleThumbnailError = useCallback((index: number) => {
    setThumbnailErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  const handleMainImageError = useCallback(() => {
    setMainImgSrc('/img/product-placeholder.png');
  }, []);

  const isImage = activeItem.type === 'image';
  const currentLightboxItem = mediaItems[lightboxIndex] || activeItem;

  return {
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
    currentLightboxItem,
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
  };
}
