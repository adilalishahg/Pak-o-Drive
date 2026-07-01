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

  // Use passed quality or default to 70 for better compression
  const q = quality || 70;
  // f_auto lets Cloudinary serve AVIF (30-50% smaller than WebP) when the browser supports it
  const transformations = `f_auto,q_${q},w_${width},c_limit`;

  // Insert transformations into Cloudinary URL
  const uploadIndex = src.indexOf('/upload/');
  if (uploadIndex !== -1) {
    const prefix = src.substring(0, uploadIndex + 8);
    let suffix = src.substring(uploadIndex + 8);
    // Strip any pre-existing Cloudinary transformations (e.g. f_webp,q_auto,w_128/)
    // They look like segments of key_value pairs before the actual path
    suffix = suffix.replace(/^(?:[a-z_]+[,/])*(?:v\d+\/)?/, (match) => {
      // Keep version prefix like v1234567/ but remove transformation chains
      const versionMatch = match.match(/(v\d+\/)/);
      return versionMatch ? versionMatch[1] : '';
    });
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
  const [hasError, setHasError] = React.useState(false);

  // Reset error state if image source changes
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  const finalSrc = hasError ? fallbackSrc : (typeof src === 'string' ? src : '');

  // Determine standard responsive sizes string if not provided
  // Standard breakpoints: mobile (< 768px) -> 100vw, desktop (>= 768px) -> 50vw or custom
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  // Generate blur placeholder if using blur placeholder but no custom blurDataURL is provided
  const finalBlurDataURL = placeholder === 'blur' ? (blurDataURL || getBlurPlaceholder(finalSrc)) : undefined;

  // Check if we can use custom loader (only for Cloudinary assets)
  const isCloudinary = finalSrc.includes('res.cloudinary.com');

  // Next.js: If priority is true, completely omit loading prop and force fetchPriority="high"
  const isPriority = props.priority === true;

  // Build image props — when priority is set we must NOT pass loading at all
  const imageProps: Record<string, unknown> = {
    src: finalSrc || fallbackSrc,
    alt: alt || 'Product Image',
    sizes: defaultSizes,
    placeholder,
    blurDataURL: finalBlurDataURL,
    loader: isCloudinary ? cloudinaryLoader : undefined,
    onError: handleImageError,
    ...props,
  };

  if (isPriority) {
    // Ensure loading is completely absent and fetchPriority is high
    delete imageProps.loading;
    imageProps.fetchPriority = 'high';
    imageProps.priority = true;
  } else {
    imageProps.loading = loading;
  }

  return (
    <Image {...(imageProps as ImageProps)} />
  );
};

export default OptimizedImage;
