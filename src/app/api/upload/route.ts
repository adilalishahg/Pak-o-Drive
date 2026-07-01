import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials are provided in the environment
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: Request) {
  try {
    // 1. Enforce Admin Authentication
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminCookie = cookieHeader.includes('admin_token=pakodrive_admin_secret_token');
    
    const authHeader = request.headers.get('authorization') || '';
    const hasAuthHeader = authHeader === 'Bearer pakodrive_admin_secret_token';

    if (!hasAdminCookie && !hasAuthHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication session required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Verify file type is an image or video
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Only image and video files are allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract extensions and sanitize base name
    const fileExtension = path.extname(file.name) || '.png';
    const sanitizedBase = path.basename(file.name, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueId = `${Date.now()}_${sanitizedBase}`;
    const filename = `${uniqueId}${fileExtension}`;

    // If Cloudinary is configured, upload to Cloudinary (Recommended for Live Site)
    if (isCloudinaryConfigured) {
      console.log('☁ Uploading file to Cloudinary with unique ID:', uniqueId);
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'electro_store',
            public_id: uniqueId,
            overwrite: true,
            resource_type: 'auto',
            format: 'webp',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      console.log('✓ Successfully uploaded to Cloudinary:', uploadResult.secure_url);
      return NextResponse.json({ success: true, url: uploadResult.secure_url });
    }

    // FALLBACK: Local file storage (For offline local development)
    console.log('📁 Cloudinary not configured. Falling back to local storage...');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, new Uint8Array(buffer));
    console.log(`✓ Saved uploaded image locally: ${filePath}`);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error: any) {
    console.error('Error handling upload API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
