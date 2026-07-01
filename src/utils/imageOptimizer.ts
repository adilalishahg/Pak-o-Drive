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
  // If the file is not an image, or it's a GIF (keep animation), return original file
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while limiting maximum dimensions
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
          resolve(file); // Fallback to original if canvas context is not supported
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas contents to a WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalName = file.name;
              const lastDotIndex = originalName.lastIndexOf('.');
              const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
              const newName = `${baseName}.webp`;

              const optimizedFile = new File([blob], newName, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              
              // Only return optimized file if it's actually smaller than the original
              if (optimizedFile.size < file.size) {
                console.log(`[ImageOptimizer] Optimized ${file.name} (${(file.size / 1024).toFixed(1)} KB) -> ${optimizedFile.name} (${(optimizedFile.size / 1024).toFixed(1)} KB)`);
                resolve(optimizedFile);
              } else {
                console.log(`[ImageOptimizer] Original is smaller, skipping optimization.`);
                resolve(file);
              }
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
