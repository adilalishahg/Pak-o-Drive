/**
 * Autonomous Instagram Reel Auto-Post Service for Pak-o-Drive
 * Generates cinematic AI video, uploads to CDN, and publishes directly to Instagram Reels feed
 */
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import InstagramPostLog from '@/models/InstagramPostLog';
import { generateCinematicVideo, DeepDiveToolScript } from './cinematicVideo';
import { callMultiProviderAI } from './multiAiEngine';

export interface InstagramReelResult {
  success: boolean;
  toolName: string;
  postId?: string;
  permalink?: string;
  caption?: string;
  videoUrl?: string;
  durationSeconds?: number;
  error?: string;
}

/**
 * Uploads a local MP4 video file to public HTTPS CDN
 */
export async function uploadVideoToCdn(videoFilePath: string): Promise<string> {
  console.log(`📤 [InstagramReelService] Uploading video to CDN: ${videoFilePath}...`);

  // 1. Try Cloudinary if real credentials exist
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret && apiKey !== '52311231313') {
    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const uploadRes = await cloudinary.uploader.upload(videoFilePath, {
        resource_type: 'video',
        folder: 'instagram_reels',
      });

      if (uploadRes?.secure_url) {
        console.log(`✓ [InstagramReelService] Video hosted on Cloudinary: ${uploadRes.secure_url}`);
        return uploadRes.secure_url;
      }
    } catch (err: any) {
      console.warn(`⚠️ [InstagramReelService] Cloudinary upload failed: ${err.message}. Falling back to public CDN.`);
    }
  }

  // 2. High-speed resilient public CDN fallback (uguu.se)
  const fileBuffer = fs.readFileSync(videoFilePath);
  const formData = new FormData();
  formData.append('files[]', new Blob([new Uint8Array(fileBuffer)], { type: 'video/mp4' }), `reel_${Date.now()}.mp4`);

  const res = await fetch('https://uguu.se/upload', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (json.success && json.files && json.files[0] && json.files[0].url) {
    console.log(`✓ [InstagramReelService] Video hosted on CDN: ${json.files[0].url}`);
    return json.files[0].url;
  }

  throw new Error('Failed to upload video to CDN: ' + JSON.stringify(json));
}

/**
 * Generates high-converting viral caption for the Reel using AI
 */
export async function generateReelCaption(toolName: string, tagline: string, category: string): Promise<string> {
  const prompt = `Write a viral Instagram Reel caption for a revolutionary AI tool named "${toolName}".
Tagline: "${tagline}".
Category: "${category}".

Requirements:
- First line MUST be an irresistible thumb-stopping hook in ALL CAPS.
- Explain in 2 punchy bullet points why developers and creators need to stop doing this manually.
- Include a high-converting Call-to-Action: "Comment '${toolName.split(' ')[0].toUpperCase()}' below and I'll DM you the master prompt guide!"
- Add 15-20 trending hashtags (#aitools #webdev #coding #softwareengineer #fullstack #techtrends #developer #buildinpublic #pakistanitech #productivity #ai).
- Output ONLY the caption text.`;

  try {
    const { text } = await callMultiProviderAI('You are a viral Instagram growth director.', prompt);
    if (text && text.length > 50) {
      return text.trim();
    }
  } catch (err: any) {
    console.warn(`⚠️ [InstagramReelService] AI caption generation fallback: ${err.message}`);
  }

  return `STOP WASTING HOURS ON BOILERPLATE ⚡

Top 1% developers are quietly using ${toolName} to 10x their workflow in 2026.

🔥 Why you need this:
• ${tagline}
• Eliminates days of tedious manual coding and setup into 45 seconds.

━━━━━━━━━━━━━━━━━
💬 Comment "${toolName.split(' ')[0].toUpperCase()}" below and our automated bot will send you the master prompt template straight to your inbox!

🚀 Follow @pakodrive.official for daily breakthrough AI workflows & developer tools!

#aitools #webdev #coding #fullstack #softwareengineer #techtrends #developer #buildinpublic #reactjs #nextjs #productivity #automation #artificialintelligence #techstartups #pakistanitech`;
}

/**
 * Execute Instagram Reel Auto-Post
 */
export async function executeAutoInstagramReelPost(options?: {
  source?: 'cron' | 'admin-manual' | 'cli-script';
  customToolName?: string;
}): Promise<InstagramReelResult> {
  const source = options?.source || 'cli-script';
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    const err = 'INSTAGRAM_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN is missing from environment.';
    console.error(`❌ [InstagramReelService] ${err}`);
    return {
      success: false,
      toolName: options?.customToolName || 'N/A',
      error: err,
    };
  }

  console.log('🚀 [InstagramReelService] Initializing automated cinematic reel dispatcher...');
  console.log(`📱 [InstagramReelService] Target Instagram Account: ${igUserId}`);

  // Step 1: Generate Cinematic Video (Script + Voice + UI Frames + FFmpeg)
  console.log('🎬 [InstagramReelService] Step 1: Generating cinematic AI video...');
  const videoResult = await generateCinematicVideo({
    customToolName: options?.customToolName,
  });

  if (!videoResult.success || !fs.existsSync(videoResult.videoPath)) {
    throw new Error('Video generation failed or output file not found.');
  }

  const toolName = videoResult.toolName;
  console.log(`✓ [InstagramReelService] Video generated successfully for "${toolName}" (${videoResult.videoDurationSeconds.toFixed(1)}s)`);

  // Step 2: Upload Video to Public CDN
  console.log('☁️ [InstagramReelService] Step 2: Uploading video to CDN for Meta ingestion...');
  const publicVideoUrl = await uploadVideoToCdn(videoResult.videoPath);

  // Step 3: Generate Viral Caption
  console.log('📝 [InstagramReelService] Step 3: Generating viral caption...');
  const caption = await generateReelCaption(toolName, 'Next-Gen Developer Superpower', 'Developer Tools');

  // Step 4: Create Instagram Reel Media Container
  console.log('📦 [InstagramReelService] Step 4: Creating Instagram Reel container in Meta Graph API...');
  const containerRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: publicVideoUrl,
      caption,
      share_to_feed: true,
      access_token: accessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error || !containerData.id) {
    throw new Error('Failed to create Instagram Reel container: ' + (containerData.error?.message || JSON.stringify(containerData)));
  }

  const containerId = containerData.id;
  console.log(`✓ [InstagramReelService] Reel container created: ${containerId}`);

  // Step 5: Wait for Meta to process and encode video
  console.log('⏳ [InstagramReelService] Step 5: Waiting for Meta processing queue...');
  let isReady = false;
  let attempts = 0;
  const maxAttempts = 25; // 25 * 4s = 100s max polling for video encoding

  while (!isReady && attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 4000));
    try {
      const statusRes = await fetch(
        `https://graph.facebook.com/v20.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      console.log(`⏳ [InstagramReelService] Video processing status: ${statusData.status_code || 'IN_PROGRESS'} (attempt ${attempts}/${maxAttempts})`);

      if (statusData.status_code === 'FINISHED') {
        isReady = true;
        console.log(`✓ [InstagramReelService] Reel video ready for publication!`);
        break;
      } else if (statusData.status_code === 'ERROR') {
        throw new Error('Meta processing error: ' + (statusData.status || 'Failed to encode video'));
      }
    } catch (e: any) {
      if (attempts >= maxAttempts) throw e;
    }
  }

  if (!isReady) {
    throw new Error('Meta video processing timed out after 100 seconds.');
  }

  // Step 6: Publish Reel Live
  console.log('📡 [InstagramReelService] Step 6: Publishing Reel live to Instagram feed...');
  const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error || !publishData.id) {
    throw new Error('Failed to publish Reel: ' + (publishData.error?.message || JSON.stringify(publishData)));
  }

  const postId = publishData.id;
  console.log(`🎉 [InstagramReelService] Reel published successfully! Post ID: ${postId}`);

  // Step 7: Fetch Live Permalink
  let permalink: string | undefined;
  try {
    const permalinkRes = await fetch(
      `https://graph.facebook.com/v20.0/${postId}?fields=permalink&access_token=${accessToken}`
    );
    const permalinkData = await permalinkRes.json();
    if (permalinkData.permalink) {
      permalink = permalinkData.permalink;
      console.log(`🔗 [InstagramReelService] Reel Live Link: ${permalink}`);
    }
  } catch {}

  // Step 8: Log to MongoDB
  try {
    await dbConnect();
    await InstagramPostLog.create({
      topic: toolName,
      topicNormalized: toolName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      category: 'viral-ai-tools',
      caption,
      mediaUrl: publicVideoUrl,
      mediaType: 'REEL',
      postId,
      permalink,
      source,
      status: 'published',
    });
    console.log(`✓ [InstagramReelService] Log saved to MongoDB`);
  } catch (err: any) {
    console.warn('⚠️ [InstagramReelService] MongoDB log warning:', err.message);
  }

  return {
    success: true,
    toolName,
    postId,
    permalink,
    caption,
    videoUrl: publicVideoUrl,
    durationSeconds: videoResult.videoDurationSeconds,
  };
}
