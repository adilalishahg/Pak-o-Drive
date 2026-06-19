'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'loader'> {
  /**
   * Fallback image URL to display if the main image fails to load.
   */
  fallbackSrc?: string;
}

/**
 * Custom Cloudinary Loader to leverage Cloudinary's global CDN features:
 * - Automatic format selection (AVIF/WebP) based on browser support (f_auto)
 * - Automatic quality optimization (q_auto)
 * - Dynamic scaling to requested layout widths (w_{width})
 */
export const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // If the image is not hosted on Cloudinary, bypass loader and return as-is
  if (!src.includes('res.cloudinary.com')) {
    return src;
  }

  // Set default quality to 80 if not specified
  const q = quality || 80;
  const transformations = `f_auto,q_auto,w_${width},c_limit`;

  // Insert transformations into Cloudinary URL
  // Matches '/upload/' or '/upload/v1234567/' to insert the transformation string
  const uploadIndex = src.indexOf('/upload/');
  if (uploadIndex !== -1) {
    const prefix = src.substring(0, uploadIndex + 8);
    const suffix = src.substring(uploadIndex + 8);
    return `${prefix}${transformations}/${suffix}`;
  }

  return src;
};

/**
 * Generates a tiny, blurred placeholder URL for Cloudinary images.
 * For local/other images, returns a tiny SVG data-URI.
 */
const getBlurPlaceholder = (src: string): string => {
  if (src.includes('res.cloudinary.com')) {
    const uploadIndex = src.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = src.substring(0, uploadIndex + 8);
      const suffix = src.substring(uploadIndex + 8);
      // Generate a tiny 20px blurred image
      return `${prefix}f_auto,q_30,w_20,e_blur:1000/${suffix}`;
    }
  }
  // Generic grey placeholder base64/SVG data URI for non-Cloudinary images
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2UzZTFlMSIvPjwvc3ZnPg==';
};

/**
 * OptimizedImage component wraps next/image to enforce:
 * 1. Automatic format conversion (WebP/AVIF) and quality compression via Cloudinary's dynamic CDN.
 * 2. Proper responsive size adjustments via the `sizes` attribute.
 * 3. Lazy loading by default (with option to override for priority banners/LCP).
 * 4. High-quality blurred placeholder loading states.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes,
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/images/placeholder.png',
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = React.useState<string>(typeof src === 'string' ? src : '');

  React.useEffect(() => {
    if (typeof src === 'string') {
      setImgSrc(src);
    }
  }, [src]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  // Determine standard responsive sizes string if not provided
  // Standard breakpoints: mobile (< 768px) -> 100vw, desktop (>= 768px) -> 50vw or custom
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  // Generate blur placeholder if using blur placeholder but no custom blurDataURL is provided
  const finalBlurDataURL = placeholder === 'blur' ? (blurDataURL || getBlurPlaceholder(imgSrc)) : undefined;

  // Check if we can use custom loader (only for Cloudinary assets)
  const isCloudinary = imgSrc.includes('res.cloudinary.com');

  return (
    <Image
      src={imgSrc || fallbackSrc}
      alt={alt || 'Product Image'}
      sizes={defaultSizes}
      loading={loading}
      placeholder={placeholder}
      blurDataURL={finalBlurDataURL}
      loader={isCloudinary ? cloudinaryLoader : undefined}
      onError={handleImageError}
      {...props}
    />
  );
};

export default OptimizedImage;
