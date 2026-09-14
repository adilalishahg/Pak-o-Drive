import dbConnect from '@/lib/mongodb';
import { uploadVideoToCdn } from './instagramReelPostService';

export interface InstagramStoryResult {
  success: boolean;
  storyId?: string;
  mediaUrl?: string;
  error?: string;
}

/**
 * Publishes a video story to Instagram via Meta Graph API
 */
export async function publishInstagramStory(videoFilePath: string): Promise<InstagramStoryResult> {
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    return { success: false, error: 'Instagram credentials missing.' };
  }

  console.log('📱 [InstagramStoryService] Uploading story video to CDN...');
  const publicVideoUrl = await uploadVideoToCdn(videoFilePath);

  console.log('📦 [InstagramStoryService] Creating Story container in Meta Graph API...');
  const containerRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'STORIES',
      video_url: publicVideoUrl,
      access_token: accessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error || !containerData.id) {
    const errMsg = containerData.error?.message || JSON.stringify(containerData);
    console.error('❌ Failed to create Story container:', errMsg);
    return { success: false, error: errMsg };
  }

  const containerId = containerData.id;
  console.log(`✓ [InstagramStoryService] Story container created: ${containerId}. Waiting for processing...`);

  // Wait for Meta to process story
  let isReady = false;
  let attempts = 0;
  const maxAttempts = 20;

  while (!isReady && attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 3500));
    try {
      const statusRes = await fetch(
        `https://graph.facebook.com/v20.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      console.log(`⏳ Story processing: ${statusData.status_code || 'IN_PROGRESS'} (attempt ${attempts}/${maxAttempts})`);

      if (statusData.status_code === 'FINISHED') {
        isReady = true;
        break;
      } else if (statusData.status_code === 'ERROR') {
        return { success: false, error: 'Meta failed to encode story video.' };
      }
    } catch {}
  }

  if (!isReady) {
    return { success: false, error: 'Story processing timed out.' };
  }

  // Publish Story
  console.log('📡 [InstagramStoryService] Publishing Story live...');
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
    return { success: false, error: publishData.error?.message || 'Failed to publish story' };
  }

  console.log(`🎉 [InstagramStoryService] Story published live! ID: ${publishData.id}`);
  return {
    success: true,
    storyId: publishData.id,
    mediaUrl: publicVideoUrl,
  };
}
