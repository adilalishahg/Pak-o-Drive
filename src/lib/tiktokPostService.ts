/**
 * Autonomous TikTok Video Auto-Post Service for Pak-o-Drive
 * Supports:
 * 1. Buffer GraphQL API (Zero-docs, Official Partner Direct Publish for Creator/Personal TikTok)
 * 2. Native TikTok Content Posting API v2 (Direct Post / Pull From URL fallback)
 */

export interface TikTokPostResult {
  success: boolean;
  publishId?: string;
  videoUrl?: string;
  caption?: string;
  service?: 'buffer' | 'tiktok-direct';
  error?: string;
}

/**
 * Formats a high-velocity, clean caption optimized for TikTok's algorithm and UI
 * Avoids blocking the 9:16 video while maximizing FYP reach
 */
export function formatViralTikTokCaption(rawCaption: string): string {
  // Extract top hook / quote
  const sections = rawCaption.split(/━+|─+/).map((s) => s.trim()).filter(Boolean);
  const mainHook = sections[0] || rawCaption.slice(0, 250);

  // Dedicated high-traffic TikTok hashtags for automotive FYP
  const tikTokTags = '#fyp #foryou #foryoupage #viral #carsoftiktok #pakwheels #pakodrive #supercars #nightdrive #carguy #darkaesthetic #explore';

  return `${mainHook}

🚗 Tap Link in Bio for Car Styling & COD Pakistan | +92 318 5205667
Save & Share with someone on the grind 📌

${tikTokTags}`.trim();
}

/**
 * Publishes video to TikTok via Buffer GraphQL API
 */
async function publishViaBuffer(videoUrl: string, caption: string): Promise<TikTokPostResult> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  let channelId = process.env.BUFFER_TIKTOK_CHANNEL_ID || '6aa929edea19ca0bde48964e';

  if (!token) {
    throw new Error('BUFFER_ACCESS_TOKEN is not defined');
  }

  console.log('📱 [TikTokPostService] Initializing Buffer GraphQL API for TikTok dispatch...');
  console.log(`🎬 [TikTokPostService] Source Video: ${videoUrl}`);
  console.log(`🎯 [TikTokPostService] Target TikTok Channel ID: ${channelId}`);

  // Format optimized caption specifically tailored for TikTok FYP
  const trimmedCaption = formatViralTikTokCaption(caption);

  const mutation = `
    mutation CreateTikTokPost($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess {
          post {
            id
            status
          }
        }
        ... on InvalidInputError {
          message
        }
        ... on LimitReachedError {
          message
        }
        ... on UnauthorizedError {
          message
        }
        ... on UnexpectedError {
          message
        }
      }
    }
  `;

  const payload = {
    query: mutation,
    variables: {
      input: {
        channelId,
        text: trimmedCaption,
        mode: 'shareNow',
        schedulingType: 'automatic',
        needsApproval: false,
        assets: [
          {
            video: {
              url: videoUrl,
            },
          },
        ],
      },
    },
  };

  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || json.errors?.length) {
    const errMsg = json.errors?.[0]?.message || 'Buffer API HTTP error ' + res.status;
    throw new Error(`Buffer API Error: ${errMsg}`);
  }

  const result = json.data?.createPost;

  if (result?.__typename === 'PostActionSuccess' && result.post?.id) {
    const publishId = result.post.id;
    console.log(`🎉 [TikTokPostService] Video successfully published to TikTok via Buffer! Post ID: ${publishId}`);
    return {
      success: true,
      publishId,
      videoUrl,
      caption: trimmedCaption,
      service: 'buffer',
    };
  }

  const errorDetail = result?.message || JSON.stringify(result);
  throw new Error(`Buffer Dispatch Rejected: ${errorDetail}`);
}

/**
 * Publishes video to TikTok via Direct TikTok Content Posting API v2
 */
async function publishViaDirectTikTok(videoUrl: string, caption: string): Promise<TikTokPostResult> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('TIKTOK_ACCESS_TOKEN is not configured');
  }

  console.log('📱 [TikTokPostService] Fallback: Initializing Native TikTok Content Posting API v2...');
  const trimmedTitle = caption.slice(0, 1800);

  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: trimmedTitle,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    }),
  });

  const initData = await initRes.json();

  if (!initRes.ok || initData.error?.code !== 'ok' || !initData.data?.publish_id) {
    throw new Error('TikTok Publish Init Failed: ' + (initData.error?.message || JSON.stringify(initData)));
  }

  const publishId = initData.data.publish_id;
  console.log(`✓ [TikTokPostService] Native TikTok video queued! Publish ID: ${publishId}`);

  return {
    success: true,
    publishId,
    videoUrl,
    caption: trimmedTitle,
    service: 'tiktok-direct',
  };
}

export async function publishToTikTok(videoUrl: string, caption: string): Promise<TikTokPostResult> {
  // Strategy 1: Buffer Engine (Primary - 0 docs required, works for personal/creator TikTok)
  if (process.env.BUFFER_ACCESS_TOKEN) {
    try {
      return await publishViaBuffer(videoUrl, caption);
    } catch (bufferErr: any) {
      console.warn(`⚠️ [TikTokPostService] Buffer dispatch failed: ${bufferErr.message}. Attempting native fallback...`);
    }
  }

  // Strategy 2: Direct TikTok API v2 (Secondary fallback)
  if (process.env.TIKTOK_ACCESS_TOKEN) {
    try {
      return await publishViaDirectTikTok(videoUrl, caption);
    } catch (directErr: any) {
      console.error(`❌ [TikTokPostService] Native TikTok dispatch failed: ${directErr.message}`);
      return {
        success: false,
        error: directErr.message,
      };
    }
  }

  const msg = 'Neither BUFFER_ACCESS_TOKEN nor TIKTOK_ACCESS_TOKEN is configured in environment / GitHub Secrets. TikTok auto-post skipped.';
  console.warn(`⚠️ [TikTokPostService] ${msg}`);
  return {
    success: false,
    error: msg,
  };
}

