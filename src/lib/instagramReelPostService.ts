/**
 * Autonomous Instagram Reel Auto-Post Service for Pak-o-Drive
 * Generates cinematic AI video, uploads to CDN, and publishes directly to Instagram Reels feed
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import dbConnect from '@/lib/mongodb';
import InstagramPostLog from '@/models/InstagramPostLog';
import { generateCinematicVideo, DeepDiveToolScript } from './cinematicVideo';
import { generateViralMotionReel, burnOverlayWithSharpAndFfmpeg } from './viralMotionReelEngine';
import { ReelCategory } from './reelCategoryLibrary';
import { publishInstagramStory } from './instagramStoryPostService';
import { callMultiProviderAI } from './multiAiEngine';
import { getUkTimeInfo, getRandomUkLocation } from './ukScheduleHelper';
import { ensureTrendingAudioPoolFresh } from './trendingAudioService';

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

Drop a "🔥" in the comments if you agree.
Save this for when you need a reminder 📌

Follow @digitalinspirer for daily drive & unstoppable mindset.

#mindset #stoic #nightdrive #darkaesthetic #discipline`;
}

/**
 * Uploads a local or Vercel public MP4 video file to public HTTPS CDN
 */
export async function uploadVideoToCdn(
  videoFilePath: string,
  overlayQuoteLines?: string[],
  isAlreadyBurned: boolean = false,
  audioFilePath?: string,
  audioRemoteUrl?: string,
  overlayPngPath?: string
): Promise<string> {
  console.log(`📤 [InstagramReelService] Processing video for CDN: ${videoFilePath}...`);

  let currentVideoPath = videoFilePath;
  let burnedStatus = isAlreadyBurned;

  const filteredLines = overlayQuoteLines
    ? overlayQuoteLines.filter((l) => l && l.trim().length > 0)
    : [];

  // 0. If local FFmpeg is available and video isn't burned, attempt local burn
  if (!burnedStatus && filteredLines.length > 0 && !videoFilePath.startsWith('http://') && !videoFilePath.startsWith('https://')) {
    try {
      console.log('🎨 [InstagramReelService] Checking local text overlay burn...');
      const burnedPath = await burnOverlayWithSharpAndFfmpeg(currentVideoPath, filteredLines);
      if (burnedPath && fs.existsSync(burnedPath) && fs.statSync(burnedPath).size > 1000 && burnedPath !== currentVideoPath) {
        currentVideoPath = burnedPath;
        burnedStatus = true;
        console.log(`✓ [InstagramReelService] Text overlay burned locally: ${currentVideoPath}`);
      }
    } catch (overlayErr: any) {
      console.warn(`⚠️ [InstagramReelService] Local overlay burn skipped: ${overlayErr.message}`);
    }
  }

  // 1. If it's already a full HTTP/HTTPS URL, return it directly
  if (currentVideoPath.startsWith('http://') || currentVideoPath.startsWith('https://')) {
    return currentVideoPath;
  }

  // 2. Determine public web URL on Vercel CDN fallback
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pakodrive.pk').replace(/\/$/, '');
  const cleanRelativePath = currentVideoPath
    .replace(/^.*?public[/\\]/, '')
    .replace(/\\/g, '/')
    .replace(/^\//, '');
  const publicFallbackUrl = `${siteUrl}/${cleanRelativePath}`;

  // 3. Try reading local file buffer if file exists on disk (e.g. in /tmp or local dev)
  let fileBuffer: Buffer | null = null;
  try {
    if (fs.existsSync(currentVideoPath)) {
      fileBuffer = fs.readFileSync(currentVideoPath);
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
    let tempOverlayCleanup: string | null = null;
    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const targetSource = fs.existsSync(videoFilePath) ? videoFilePath : publicFallbackUrl;

      // Check if video requires cloud overlay synthesis (e.g. raw video without local FFmpeg burn)
      const shouldApplyOverlay = !burnedStatus && (filteredLines.length > 0 || Boolean(audioFilePath || audioRemoteUrl));

      let transformations: any[] | undefined = undefined;

      if (shouldApplyOverlay) {
        transformations = [
          { width: 720, height: 1280, crop: 'fill', gravity: 'center', effect: 'volume:mute' },
          { effect: 'contrast:12' },
        ];

        // 5a. Resolve or generate high-contrast Sharp PNG overlay
        let activeOverlayPng = overlayPngPath && fs.existsSync(overlayPngPath) ? overlayPngPath : null;

        if (!activeOverlayPng && filteredLines.length > 0) {
          try {
            const sharp = (await import('sharp')).default;
            const WIDTH = 720;
            const HEIGHT = 1280;
            const lineHeight = 58;
            const totalTextHeight = filteredLines.length * lineHeight;
            const startY = Math.round((HEIGHT - totalTextHeight) / 2) + 26;

            const lineElements = filteredLines
              .map((line, idx) => {
                const y = startY + idx * lineHeight;
                const clean = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const pillWidth = Math.min(WIDTH - 50, Math.max(200, Math.round(line.length * 19.5 + 44)));
                const pillHeight = 50;
                const pillX = Math.round(360 - pillWidth / 2);
                const pillY = Math.round(y - 35);
                const isEmphasis = idx === 1 || (filteredLines.length > 2 && idx === filteredLines.length - 1);
                const textColor = isEmphasis ? '#FDE047' : '#FFFFFF';

                return `
                  <g>
                    <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="12" 
                      fill="#090D16" fill-opacity="0.85" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2" />
                    <text x="360" y="${y}" font-family="'Inter', Arial, sans-serif" font-size="32" font-weight="800" 
                      fill="${textColor}" stroke="#000000" stroke-width="1.2" paint-order="stroke fill"
                      text-anchor="middle" letter-spacing="-0.3">${clean}</text>
                  </g>
                `;
              })
              .join('');

            const overlaySvg = `
              <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000" fill-opacity="0.18" />
                ${lineElements}
              </svg>
            `;

            const tempDir = path.join(os.tmpdir(), 'viral_reels_temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            tempOverlayCleanup = path.join(tempDir, `cloud_overlay_${Date.now()}.png`);
            await sharp(Buffer.from(overlaySvg)).png().toFile(tempOverlayCleanup);
            activeOverlayPng = tempOverlayCleanup;
          } catch (sharpErr: any) {
            console.warn('⚠️ [InstagramReelService] Sharp cloud overlay preparation failed:', sharpErr.message);
          }
        }

        // 5b. Upload Sharp overlay PNG to Cloudinary as full-frame image layer
        let overlayImagePublicId: string | null = null;
        if (activeOverlayPng && fs.existsSync(activeOverlayPng)) {
          try {
            console.log('🎨 [InstagramReelService] Pre-uploading Sharp high-contrast text overlay to Cloudinary...');
            const overlayUpload = await cloudinary.uploader.upload(activeOverlayPng, {
              resource_type: 'image',
              folder: 'instagram_reels/overlays',
            });
            overlayImagePublicId = overlayUpload.public_id;
            console.log(`✓ [InstagramReelService] Overlay image uploaded: ${overlayImagePublicId}`);
          } catch (oErr: any) {
            console.warn(`⚠️ [InstagramReelService] Cloudinary overlay image upload failed: ${oErr.message}`);
          }
        }

        if (overlayImagePublicId) {
          transformations.push({
            overlay: overlayImagePublicId.replace(/\//g, ':'),
            width: 720,
            height: 1280,
            crop: 'scale',
            gravity: 'center',
          });
          transformations.push({
            flags: 'layer_apply',
          });
        }

        // 5c. Pre-upload and layer background trending audio
        let audioPublicId: string | null = null;
        if (audioFilePath && fs.existsSync(audioFilePath)) {
          try {
            console.log(`🎵 [InstagramReelService] Pre-uploading background audio: ${path.basename(audioFilePath)}...`);
            const audioUpload = await cloudinary.uploader.upload(audioFilePath, {
              resource_type: 'video',
              folder: 'instagram_reels/audio',
            });
            audioPublicId = audioUpload.public_id;
          } catch (aErr: any) {
            console.warn(`⚠️ [InstagramReelService] Cloudinary local audio upload failed: ${aErr.message}`);
          }
        } else if (audioRemoteUrl) {
          try {
            console.log(`🎵 [InstagramReelService] Pre-uploading remote audio: ${audioRemoteUrl}...`);
            const audioUpload = await cloudinary.uploader.upload(audioRemoteUrl, {
              resource_type: 'video',
              folder: 'instagram_reels/audio',
            });
            audioPublicId = audioUpload.public_id;
          } catch (aErr: any) {
            console.warn(`⚠️ [InstagramReelService] Cloudinary remote audio upload failed: ${aErr.message}`);
          }
        }

        if (audioPublicId) {
          console.log(`✓ [InstagramReelService] Attaching background audio track: ${audioPublicId}`);
          transformations.push({
            overlay: `video:${audioPublicId.replace(/\//g, ':')}`,
          });
          transformations.push({
            flags: 'layer_apply',
          });
        }
      }

      console.log(
        `☁️ [InstagramReelService] Uploading video to Cloudinary (cloud overlay synthesis active: ${Boolean(transformations && transformations.length > 2)})...`
      );

      const uploadOptions: Record<string, any> = {
        resource_type: 'video',
        folder: 'instagram_reels',
      };

      if (transformations && transformations.length > 1) {
        uploadOptions.eager = [
          {
            transformation: transformations,
            format: 'mp4',
            audio_codec: 'aac',
            video_codec: 'auto',
          },
        ];
        uploadOptions.eager_async = false;
      }

      const uploadRes = await cloudinary.uploader.upload(targetSource, uploadOptions);

      // Clean up temporary overlay files
      if (tempOverlayCleanup && fs.existsSync(tempOverlayCleanup)) {
        try { fs.unlinkSync(tempOverlayCleanup); } catch {}
      }
      if (overlayPngPath && fs.existsSync(overlayPngPath)) {
        try { fs.unlinkSync(overlayPngPath); } catch {}
      }

      if (uploadRes?.public_id) {
        console.log(`✓ [InstagramReelService] Raw video hosted on Cloudinary: ${uploadRes.public_id}`);

        // 1. If eager transformation succeeded, return pre-baked overlaid MP4
        if (uploadRes.eager && uploadRes.eager[0] && uploadRes.eager[0].secure_url) {
          console.log(`✨ [InstagramReelService] Cloudinary Eager Overlay Video ready: ${uploadRes.eager[0].secure_url}`);
          return uploadRes.eager[0].secure_url;
        }

        // 2. If eager wasn't returned, generate dynamic transformed URL with AAC audio
        if (transformations && transformations.length > 1) {
          const publicIdWithExt = uploadRes.public_id.endsWith('.mp4')
            ? uploadRes.public_id
            : `${uploadRes.public_id}.mp4`;

          const transformedUrl = cloudinary.url(publicIdWithExt, {
            resource_type: 'video',
            transformation: transformations,
            audio_codec: 'aac',
            secure: true,
          });

          console.log(`✨ [InstagramReelService] Dynamic Cloud Overlay Video URL generated: ${transformedUrl}`);

          // Warm up Cloudinary cache before passing to Meta/TikTok
          try {
            const warmup = await fetch(transformedUrl, { method: 'HEAD' });
            console.log(`📡 [InstagramReelService] Cloudinary warm-up status: ${warmup.status}`);
          } catch {}

          return transformedUrl;
        }

        return uploadRes.secure_url;
      }
    } catch (err: any) {
      console.warn(`⚠️ [InstagramReelService] Cloudinary upload failed: ${err.message}.`);
      if (tempOverlayCleanup && fs.existsSync(tempOverlayCleanup)) {
        try { fs.unlinkSync(tempOverlayCleanup); } catch {}
      }
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

  // Step 0: Ensure weekly trending audio pool is fresh (auto-checks every 7 days inside the cron)
  try {
    await ensureTrendingAudioPoolFresh();
  } catch (audioErr: any) {
    console.warn('⚠️ [InstagramReelService] Audio freshness check non-fatal warning:', audioErr.message);
  }

  // Step 1: Generate Real Moving Video or Cinematic Video
  let videoPath = '';
  let videoDuration = 7.5;
  let toolName = options?.customToolName || 'Viral Mindset Reel';
  let caption = '';

  let reelQuoteLines: string[] | undefined = undefined;
  let audioPath: string | undefined = undefined;
  let audioRemoteUrl: string | undefined = undefined;
  let overlayPngPath: string | undefined = undefined;

  let isBurnedWithFfmpeg = false;

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
    reelQuoteLines = motionResult.quoteLines;
    caption = motionResult.caption || (await generateViralUkCaption(toolName));
    isBurnedWithFfmpeg = motionResult.isBurnedWithFfmpeg ?? false;
    audioPath = motionResult.audioPath;
    audioRemoteUrl = motionResult.audioRemoteUrl;
    overlayPngPath = motionResult.overlayPngPath;
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
    isBurnedWithFfmpeg = true;
  }

  console.log(`✓ [InstagramReelService] Video ready for "${toolName}" (${videoDuration.toFixed(1)}s)`);

  // Step 2: Upload Video to Public CDN (with Cloudinary Cloud Synthesis Overlay support)
  console.log('☁️ [InstagramReelService] Step 2: Uploading video to CDN for social ingestion...');
  const publicVideoUrl = await uploadVideoToCdn(
    videoPath,
    reelQuoteLines,
    isBurnedWithFfmpeg,
    audioPath,
    audioRemoteUrl,
    overlayPngPath
  );

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
        console.log(`📍 [InstagramReelService] Algorithmic UK Geo-targeting: ${ukLocation.name}`);
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
          const storyRes = await publishInstagramStory(publicVideoUrl);
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
