import dotenv from 'dotenv';
dotenv.config();

import { executeAutoInstagramReelPost } from '../src/lib/instagramReelPostService';

async function main() {
  console.log('🚀 [PublishViralUkReel] Launching new moving reel for Instagram...');

  const quoteLines = [
    'Silence is not weakness.',
    'It is the ultimate sign of',
    'Self-Control.',
    '',
    'Move in silence.',
  ];

  const result = await executeAutoInstagramReelPost({
    source: 'admin-manual',
    reelType: 'viral-motion',
    quoteLines,
    sourceVideoPath: 'public/img/viral-reels/raw/nissan-300zx.mp4',
  });

  console.log('\n=============================================');
  console.log('🎉 REEL DISPATCH RESULT:', result.success ? 'SUCCESS' : 'FAILED');
  console.log('Post ID:', result.postId);
  console.log('Permalink:', result.permalink);
  console.log('Video URL:', result.videoUrl);
  console.log('Duration:', result.durationSeconds, 'seconds');
  console.log('Caption:\n', result.caption);
  console.log('=============================================\n');

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error('❌ Error publishing reel:', err);
  process.exit(1);
});
