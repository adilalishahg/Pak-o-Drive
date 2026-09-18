import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { generateViralMotionReel } from '../src/lib/viralMotionReelEngine.js';
import { uploadVideoToCdn } from '../src/lib/instagramReelPostService.js';

async function main() {
  console.log('🚀 [TestReelGenerator] Generating sample viral reel with highlight backdrops...');

  // Use the exact quote lines from the user's recent screenshot to compare before vs after!
  const quoteLines = [
    'Rise above the static',
    "Sky's the only limit",
    'Drive beyond the clouds',
    'Vision never blurs',
  ];

  // Pick the exact sunset video from library
  const sourceVideo = 'public/img/viral-reels/library/beach/sunrise-beach-coast.mp4';
  const outputPath = 'public/test-highlight-reel.mp4';

  console.log(`🎬 Source video: ${sourceVideo}`);

  const reelRes = await generateViralMotionReel({
    sourceVideoPath: sourceVideo,
    quoteLines,
    durationSeconds: 6,
    outputFilePath: outputPath,
  });

  console.log('✓ Video rendered locally:', reelRes.videoPath);
  console.log('✓ Burned with FFmpeg:', reelRes.isBurnedWithFfmpeg);

  // Upload to Cloudinary to test cloud video URL with solid highlight
  console.log('☁️ Uploading to Cloudinary with new solid highlight transformation...');
  const cloudUrl = await uploadVideoToCdn(reelRes.videoPath, quoteLines, reelRes.isBurnedWithFfmpeg);

  console.log('\n======================================================');
  console.log('🎉 SUCCESS! Sample Reel Generated!');
  console.log('📁 Local File: public/test-highlight-reel.mp4');
  console.log('🌐 Direct Streaming Video URL:');
  console.log(cloudUrl);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('❌ Error generating sample reel:', err);
});
