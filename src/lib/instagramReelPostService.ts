/**
 * Autonomous Instagram Reel Auto-Post Service for Pak-o-Drive
 * Generates cinematic AI video, uploads to CDN, and publishes directly to Instagram Reels feed
 */
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import InstagramPostLog from '@/models/InstagramPostLog';
import { generateCinematicVideo, DeepDiveToolScript } from './cinematicVideo';
import { generateViralMotionReel } from './viralMotionReelEngine';
import { ReelCategory } from './reelCategoryLibrary';
import { publishInstagramStory } from './instagramStoryPostService';
import { callMultiProviderAI } from './multiAiEngine';
import { getUkTimeInfo, getRandomUkLocation } from './ukScheduleHelper';

export interface InstagramReelResult {
  success: boolean;
  toolName: string;
  postId?: string;
  permalink?: string;
  caption?: string;
  videoUrl?: string;
  durationSeconds?: number;
  storyId?: string;
  tikTokPublishId?: string;
  error?: string;
}

/**
 * Generates high-converting viral caption optimized for UK/Global Reach & Pak-o-Drive Dual Monetization
 */
export async function generateViralUkCaption(title: string): Promise<string> {
  return `${title.toUpperCase()} ⚡

Most people quit right before everything is about to change. 
Stay focused. Keep building in silence.

Save this for the days you need a reminder 📌

Drop a "🔥" in the comments if you are on your grind today.

━━━━━━━━━━━━━━━━━
🇬🇧 UK & Global (Digital & Affiliate):
✨ 4K Luxury Car Wallpapers & Presets 👉 Link in Bio
🛒 Trending Car Interior Styling on Amazon UK 👉 Link in Bio

🇵🇰 Pakistan (Physical Stock):
🚗 Cash on Delivery (COD) All Over Pakistan
📦 Tap Link in Bio or WhatsApp: +92 318 5205667

━━━━━━━━━━━━━━━━━
Follow @digitalinspirer & @pakodrive.official for daily drive & automotive luxury.

📍 London, United Kingdom

#ukcarscene #supercarsoflondon #londoncars #uknightdrive #birminghamcars #carcultureuk #supercarsuk #luxurycarslondon #britishautomotive #reelsuk #pakwheels #pakodrive #darkaesthetic #automotive #nightdrive #carsofinstagram #explorepage #reelsviral`;
}

/**
 * Uploads a local or Vercel public MP4 video file to public HTTPS CDN
 */
export async function uploadVideoToCdn(videoFilePath: string): Promise<string> {
  console.log(`📤 [InstagramReelService] Processing video for CDN: ${videoFilePath}...`);

  // 1. If it's already a full HTTP/HTTPS URL, return it directly
  if (videoFilePath.startsWith('http://') || videoFilePath.startsWith('https://')) {
    return videoFilePath;
  }

  // 2. Determine public web URL on Vercel CDN fallback
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pakodrive.pk').replace(/\/$/, '');
  const cleanRelativePath = videoFilePath
    .replace(/^.*?public[/\\]/, '')
    .replace(/\\/g, '/')
    .replace(/^\//, '');
  const publicFallbackUrl = `${siteUrl}/${cleanRelativePath}`;

  // 3. Try reading local file buffer if file exists on disk (e.g. in /tmp or local dev)
  let fileBuffer: Buffer | null = null;
  try {
    if (fs.existsSync(videoFilePath)) {
      fileBuffer = fs.readFileSync(videoFilePath);
    }
  } catch (err: any) {
    console.warn(`⚠️ [InstagramReelService] Local file read skipped: ${err.message}`);
  }

  // 4. If local file read failed (e.g. Vercel serverless read-only disk), try fetching from Vercel Public CDN
  if (!fileBuffer) {
    try {
      console.log(`🌐 [InstagramReelService] Fetching asset from site CDN: ${publicFallbackUrl}...`);
      const fetchRes = await fetch(publicFallbackUrl);
      if (fetchRes.ok) {
        const arrayBuf = await fetchRes.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
        console.log(`✓ [InstagramReelService] Asset fetched successfully from site CDN (${fileBuffer.length} bytes)`);
      }
    } catch (cdnErr: any) {
      console.warn(`⚠️ [InstagramReelService] CDN fetch fallback skipped: ${cdnErr.message}`);
    }
  }

  // 5. Try Cloudinary if real credentials exist and target is available
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

      const targetSource = fs.existsSync(videoFilePath) ? videoFilePath : publicFallbackUrl;

      const uploadRes = await cloudinary.uploader.upload(targetSource, {
        resource_type: 'video',
        folder: 'instagram_reels',
      });

      if (uploadRes?.secure_url) {
        console.log(`✓ [InstagramReelService] Video hosted on Cloudinary: ${uploadRes.secure_url}`);
        return uploadRes.secure_url;
      }
    } catch (err: any) {
      console.warn(`⚠️ [InstagramReelService] Cloudinary upload failed: ${err.message}.`);
    }
  }

  // 6. High-speed public CDN upload if buffer exists
  if (fileBuffer && fileBuffer.length > 0) {
    try {
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
    } catch (uguuErr: any) {
      console.warn(`⚠️ [InstagramReelService] Uguu upload skipped: ${uguuErr.message}`);
    }
  }

  // 7. Ultimate Fallback: Return the Vercel Public CDN URL directly
  console.log(`✓ [InstagramReelService] Using Vercel Public CDN URL directly: ${publicFallbackUrl}`);
  return publicFallbackUrl;
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
  reelType?: 'viral-motion' | 'cinematic-ai';
  category?: ReelCategory;
  shareToStory?: boolean;
  quoteLines?: string[];
  sourceVideoPath?: string;
  ukTargeting?: boolean;
}): Promise<InstagramReelResult> {
  const source = options?.source || 'cli-script';
  const reelType = options?.reelType || 'viral-motion';
  const ukTargeting = options?.ukTargeting !== false;
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  console.log(`🚀 [InstagramReelService] Initializing automated reel dispatcher (type: ${reelType})...`);

  // Step 1: Generate Real Moving Video or Cinematic Video
  let videoPath = '';
  let videoDuration = 7.5;
  let toolName = options?.customToolName || 'Viral Mindset Reel';
  let caption = '';

  if (reelType === 'viral-motion') {
    console.log('🎬 [InstagramReelService] Step 1: Generating real-motion viral video with embedded TrueType...');
    const motionResult = await generateViralMotionReel({
      category: options?.category,
      quoteLines: options?.quoteLines,
      sourceVideoPath: options?.sourceVideoPath,
    });
    videoPath = motionResult.videoPath;
    videoDuration = motionResult.durationSeconds;
    toolName = motionResult.title;
    caption = motionResult.caption || (await generateViralUkCaption(toolName));
  } else {
    console.log('🎬 [InstagramReelService] Step 1: Generating cinematic AI video...');
    const videoResult = await generateCinematicVideo({
      customToolName: options?.customToolName,
    });

    if (!videoResult.success || !fs.existsSync(videoResult.videoPath)) {
      throw new Error('Video generation failed or output file not found.');
    }

    videoPath = videoResult.videoPath;
    videoDuration = videoResult.videoDurationSeconds;
    toolName = videoResult.toolName;
    caption = await generateReelCaption(toolName, 'Next-Gen Developer Superpower', 'Developer Tools');
  }

  console.log(`✓ [InstagramReelService] Video ready for "${toolName}" (${videoDuration.toFixed(1)}s)`);

  // Step 2: Upload Video to Public CDN
  console.log('☁️ [InstagramReelService] Step 2: Uploading video to CDN for social ingestion...');
  const publicVideoUrl = await uploadVideoToCdn(videoPath);

  // Check UK Peak Hour status
  const ukTimeInfo = getUkTimeInfo();
  console.log(
    `🇬🇧 [InstagramReelService] Algorithmic Timing Status: UK Time: ${ukTimeInfo.ukTimeString} | PKT: ${ukTimeInfo.pktTimeString}`
  );

  let postId: string | undefined;
  let permalink: string | undefined;
  let storyId: string | undefined;
  let tikTokPublishId: string | undefined;
  let instagramError: string | undefined;
  let tikTokError: string | undefined;

  // Step 3: Publish to Instagram Reels & Story (if credentials configured)
  if (igUserId && accessToken) {
    try {
      console.log('📦 [InstagramReelService] Step 3: Creating Instagram Reel container in Meta Graph API...');
      const ukLocation = getRandomUkLocation();
      const containerPayload: Record<string, any> = {
        media_type: 'REELS',
        video_url: publicVideoUrl,
        caption,
        share_to_feed: true,
        access_token: accessToken,
      };

      if (ukTargeting) {
        console.log(`📍 [InstagramReelService] Tagging UK Location: ${ukLocation.name} (Place ID: ${ukLocation.id})`);
        containerPayload.location_id = ukLocation.id;
      }

      let containerRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(containerPayload),
      });

      let containerData = await containerRes.json();

      if (!containerRes.ok && containerPayload.location_id) {
        console.warn(
          `⚠️ [InstagramReelService] Location ID error (${containerData.error?.message}). Retrying container creation without location...`
        );
        delete containerPayload.location_id;
        containerRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(containerPayload),
        });
        containerData = await containerRes.json();
      }

      if (containerRes.ok && containerData.id) {
        const containerId = containerData.id;
        console.log(`✓ [InstagramReelService] Reel container created: ${containerId}`);

        // Wait for Meta processing (Fast 2s polling up to 15 attempts = 30s)
        let isReady = false;
        let attempts = 0;
        const maxAttempts = 15;

        while (!isReady && attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          try {
            const statusRes = await fetch(
              `https://graph.facebook.com/v20.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
            );
            const statusData = await statusRes.json();
            if (statusData.status_code === 'FINISHED') {
              isReady = true;
              break;
            } else if (statusData.status_code === 'ERROR') {
              throw new Error('Meta video processing error: ' + (statusData.status || 'Failed'));
            }
          } catch (e: any) {
            if (attempts >= maxAttempts) throw e;
          }
        }

        if (isReady) {
          console.log('📡 [InstagramReelService] Publishing Reel live to Instagram feed...');
          const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: containerId,
              access_token: accessToken,
            }),
          });
          const publishData = await publishRes.json();
          if (publishRes.ok && publishData.id) {
            postId = publishData.id;
            console.log(`🎉 [InstagramReelService] Reel published! Post ID: ${postId}`);

            try {
              const permalinkRes = await fetch(
                `https://graph.facebook.com/v20.0/${postId}?fields=permalink&access_token=${accessToken}`
              );
              const permalinkData = await permalinkRes.json();
              permalink = permalinkData.permalink;
            } catch {}
          } else {
            instagramError = publishData.error?.message || 'Publish failed';
          }
        } else {
          instagramError = 'Meta video processing timed out';
        }
      } else {
        instagramError = containerData.error?.message || 'Container creation failed';
      }

      // Log to MongoDB if published
      if (postId) {
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
        } catch {}
      }

      // Auto Share to Instagram Story
      if (options?.shareToStory !== false) {
        try {
          const storyRes = await publishInstagramStory(videoPath);
          if (storyRes.success) {
            storyId = storyRes.storyId;
          }
        } catch {}
      }
    } catch (err: any) {
      instagramError = err.message || 'Instagram dispatch exception';
      console.warn(`⚠️ [InstagramReelService] Instagram dispatch issue: ${instagramError}`);
    }
  } else {
    instagramError = 'INSTAGRAM_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN is missing in environment variables.';
    console.warn(`⚠️ [InstagramReelService] ${instagramError}`);
  }

  // Step 4: Dispatch to TikTok (Buffer GraphQL API or Native API)
  if (publicVideoUrl && caption) {
    try {
      const { publishToTikTok } = await import('./tiktokPostService');
      console.log('🎵 [InstagramReelService] Auto-publishing video to TikTok...');
      const tikTokRes = await publishToTikTok(publicVideoUrl, caption);
      if (tikTokRes.success) {
        tikTokPublishId = tikTokRes.publishId;
        console.log(`🎉 [InstagramReelService] TikTok Reel Published! ID: ${tikTokPublishId}`);
      } else {
        tikTokError = tikTokRes.error;
      }
    } catch (tikTokErr: any) {
      tikTokError = tikTokErr.message || 'TikTok dispatch failed';
      console.warn(`⚠️ [InstagramReelService] TikTok dispatch skipped: ${tikTokError}`);
    }
  }

  const overallSuccess = Boolean(postId || tikTokPublishId);

  return {
    success: overallSuccess,
    toolName,
    postId,
    permalink,
    caption,
    videoUrl: publicVideoUrl,
    durationSeconds: videoDuration,
    storyId,
    tikTokPublishId,
    error: overallSuccess
      ? undefined
      : `Dispatch report — Instagram: ${instagramError || 'N/A'}, TikTok: ${tikTokError || 'N/A'}`,
  };
}
