/**
 * Client-Side Image Optimizer
 * Resizes and converts images to WebP format in the browser before upload.
 * Reduces payload size by ~90%, improving upload speeds and saving server storage.
 */
export async function optimizeImageBeforeUpload(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const isImage = 
    file.type.startsWith('image/') || 
    ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'heic', 'heif', 'bmp'].includes(ext);

  // If not an image or is animated GIF, return original file safely
  if (!isImage || file.type === 'image/gif' || ext === 'gif') {
    return file;
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let drawable: ImageBitmap | HTMLImageElement | null = null;
    let cleanup: (() => void) | null = null;

    // Prefer createImageBitmap for modern mobile devices (hardware-accelerated & EXIF orientation aware)
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        sourceWidth = bitmap.width;
        sourceHeight = bitmap.height;
        drawable = bitmap;
        cleanup = () => bitmap.close();
      } catch {
        // Fallback to Image() element below
      }
    }

    if (!drawable || !sourceWidth) {
      const objectUrl = URL.createObjectURL(file);
      cleanup = () => URL.revokeObjectURL(objectUrl);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imageElement = new Image();
        imageElement.onload = () => resolve(imageElement);
        imageElement.onerror = (err) => reject(err);
        imageElement.src = objectUrl;
      });
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      drawable = img;
    }

    let width = sourceWidth;
    let height = sourceHeight;

    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cleanup?.();
      return file;
    }

    ctx.drawImage(drawable, 0, 0, width, height);
    cleanup?.();

    // Export to WebP with fallback to JPEG if WebP is unsupported on certain mobile devices
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => {
          if (b) return resolve(b);
          canvas.toBlob((b2) => resolve(b2), 'image/jpeg', quality);
        },
        'image/webp',
        quality
      );
    });

    if (!blob) {
      return file;
    }

    const originalName = file.name;
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
    const isWebp = blob.type === 'image/webp';
    const newName = `${baseName}.${isWebp ? 'webp' : 'jpg'}`;

    const optimizedFile = new File([blob], newName, {
      type: blob.type || 'image/webp',
      lastModified: Date.now(),
    });

    if (optimizedFile.size < file.size) {
      console.log(`[ImageOptimizer] Optimized ${file.name} (${(file.size / 1024).toFixed(1)} KB) -> ${optimizedFile.name} (${(optimizedFile.size / 1024).toFixed(1)} KB)`);
      return optimizedFile;
    }
    return file;
  } catch (err) {
    console.warn('[ImageOptimizer] Mobile optimization skipped or failed, using original file:', err);
    return file;
  }
}
