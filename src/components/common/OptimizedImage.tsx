'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { OptimizedImageProps } from '@/types/common';



/**
 * Custom Cloudinary Loader to leverage Cloudinary's global CDN features:
 * - Automatic format selection (AVIF/WebP) based on browser support (f_auto)
 * - Automatic quality optimization (q_auto)
 * - Dynamic scaling to requested layout widths (w_{width})
 */
export const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // If the image is not hosted on Cloudinary, return as-is
  if (!src || !src.includes('res.cloudinary.com')) {
    return src;
  }

  // q_auto:good applies intelligent perceptual compression for 40-70% lighter payloads
  const qParam = quality ? `q_${quality}` : 'q_auto:good';
  // f_auto auto-serves AVIF (or WebP fallback), dpr_auto handles retina screens
  const transformations = `f_auto,${qParam},c_limit,w_${width || 800},fl_immutable_cache`;

  // Insert transformations into Cloudinary URL
  const uploadIndex = src.indexOf('/upload/');
  if (uploadIndex !== -1) {
    const prefix = src.substring(0, uploadIndex + 8);
    let suffix = src.substring(uploadIndex + 8);
    // Strip any pre-existing Cloudinary transformations
    suffix = suffix.replace(/^(?:[a-z_]+[,/])*(?:v\d+\/)?/, (match) => {
      const versionMatch = match.match(/(v\d+\/)/);
      return versionMatch ? versionMatch[1] : '';
    });
    return `${prefix}${transformations}/${suffix}`;
  }

  return src;
};

/**
 * Generates an instant blurred placeholder for Cloudinary or fallback SVG shimmer.
 */
export const getBlurPlaceholder = (src?: string): string => {
  if (src && src.includes('res.cloudinary.com')) {
    const uploadIndex = src.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = src.substring(0, uploadIndex + 8);
      let suffix = src.substring(uploadIndex + 8);
      suffix = suffix.replace(/^(?:[a-z_]+[,/])*(?:v\d+\/)?/, (match) => {
        const versionMatch = match.match(/(v\d+\/)/);
        return versionMatch ? versionMatch[1] : '';
      });
      return `${prefix}f_auto,q_10,w_30,e_blur:1000/${suffix}`;
    }
  }
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg==';
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
  placeholder = 'empty',
  blurDataURL,
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgZmlsbD0iI2UzZTFlMSIvPjwvc3ZnPg==',
  onError,
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);

  // Parse and clean the source string to protect against stringified arrays, invalid formatting, etc.
  const cleanImageSrc = (inputSrc: unknown): string => {
    if (!inputSrc || typeof inputSrc !== 'string') {
      return '';
    }
    let s = inputSrc.trim();
    if (!s) return '';

    // If it's a JSON-like stringified array, extract the first URL
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          s = parsed[0];
        }
      } catch (e) {
        const match = s.match(/["']([^"']+)["']/);
        if (match && match[1]) {
          s = match[1];
        } else {
          s = s.replace(/[\[\]"']/g, '').split(',')[0].trim();
        }
      }
    }

    // Clean up wrapping quotes if present
    s = s.replace(/^["']|["']$/g, '').trim();

    // Ensure leading slash for relative paths
    if (
      s &&
      !s.startsWith('/') &&
      !s.startsWith('http://') &&
      !s.startsWith('https://') &&
      !s.startsWith('data:')
    ) {
      s = '/' + s;
    }

    return s;
  };

  const initialSrc = cleanImageSrc(src);
  const finalSrc = hasError || !initialSrc ? cleanImageSrc(fallbackSrc) : initialSrc;

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

  // Determine standard responsive sizes string if not provided
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  // Check if we can use custom loader (only for Cloudinary assets)
  const isCloudinary = finalSrc.includes('res.cloudinary.com');
  // Only bypass optimization for data-URIs or SVGs unless explicitly specified
  const isSvgOrData = finalSrc.startsWith('data:') || finalSrc.toLowerCase().endsWith('.svg');

  // Next.js: If priority is true, completely omit loading prop and force fetchPriority="high"
  const isPriority = props.priority === true;

  // Build image props — when priority is set we must NOT pass loading at all to prevent Next.js warnings
  const imageProps: Record<string, unknown> = {
    src: finalSrc || fallbackSrc,
    alt: alt || 'Product Image',
    sizes: defaultSizes,
    placeholder,
    blurDataURL: placeholder === 'blur' ? (blurDataURL || getBlurPlaceholder(finalSrc)) : undefined,
    loader: isCloudinary ? cloudinaryLoader : undefined,
    unoptimized: props.unoptimized !== undefined ? props.unoptimized : isSvgOrData,
    onError: handleImageError,
    ...props,
  };

  if (isPriority) {
    imageProps.priority = true;
    delete imageProps.loading;
  } else {
    imageProps.loading = loading;
  }

  return (
    <Image {...(imageProps as ImageProps)} />
  );
};

export default OptimizedImage;
