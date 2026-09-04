import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Ignore dummy/placeholder keys
  const isDummy = !cloudName || cloudName.includes('dvasdadxzc') || !apiKey || apiKey.length < 5;

  if (isDummy) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Uploads an external blog cover image (e.g. Unsplash URL) to the user's Cloudinary storage:
 * - Stored in dedicated folder: `pakodrive_blog/`
 * - Automatically converted to modern WebP format
 * - Cropped to crisp 16:9 aspect ratio with smart gravity auto-focus
 * - Prevents 404 broken images if original Unsplash photo is deleted or rate-limited
 */
export async function uploadBlogCoverToCloudinary(
  sourceUrl: string,
  slug: string
): Promise<string> {
  const client = getCloudinaryClient();
  if (!client) {
    console.log('[BlogCloudinary] Cloudinary not configured or using placeholder credentials. Using verified source URL:', sourceUrl);
    return sourceUrl;
  }

  if (!sourceUrl || sourceUrl.startsWith('/') || sourceUrl.includes('res.cloudinary.com')) {
    return sourceUrl;
  }

  try {
    const cleanPublicId = `${slug.slice(0, 50).replace(/[^a-z0-9-]/gi, '_')}_${Date.now().toString().slice(-4)}`;

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      // 8-second timeout so publishing never hangs indefinitely
      const timer = setTimeout(() => reject(new Error('Cloudinary blog upload timed out')), 8000);

      client.uploader.upload(
        sourceUrl,
        {
          folder: 'pakodrive_blog',
          public_id: cleanPublicId,
          overwrite: true,
          resource_type: 'image',
          format: 'webp',
          transformation: [
            {
              width: 1600,
              height: 900,
              crop: 'fill',
              gravity: 'auto',
              quality: 'auto:good',
              fetch_format: 'webp',
            },
          ],
        },
        (error, res) => {
          clearTimeout(timer);
          if (error || !res) {
            reject(error || new Error('No Cloudinary response'));
          } else {
            resolve(res);
          }
        }
      );
    });

    console.log(`✓ [BlogCloudinary] Re-hosted blog cover to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (err: any) {
    console.warn('⚠️ [BlogCloudinary] Failed to upload to Cloudinary, falling back to source URL:', err?.message || err);
    return sourceUrl;
  }
}
