/**
 * CLI Runner: Post Cinematic AI Video Reel to Instagram
 * 
 * Usage:
 *   npx tsx scripts/post-to-instagram-reel.ts
 *   npx tsx scripts/post-to-instagram-reel.ts "Bolt.new"
 */
import dotenv from 'dotenv';
dotenv.config();

import { executeAutoInstagramReelPost } from '../src/lib/instagramReelPostService';

async function main() {
  const customTool = process.argv[2];
  if (customTool) {
    console.log(`📌 Targeted Tool Specified via CLI: "${customTool}"`);
  }

  try {
    const result = await executeAutoInstagramReelPost({
      source: 'cli-script',
      customToolName: customTool,
    });

    if (result.success) {
      console.log('----------------------------------------------------');
      console.log(`🎉 Reel Successfully Published to Instagram!`);
      console.log(`🛠️ Tool: ${result.toolName}`);
      console.log(`🆔 Post ID: ${result.postId}`);
      console.log(`🔗 Link: ${result.permalink}`);
      console.log(`🌐 Video CDN: ${result.videoUrl}`);
      console.log('----------------------------------------------------');
      process.exit(0);
    } else {
      console.error(`❌ Reel Publishing Failed: ${result.error}`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ [Instagram Reel Runner Error]:', err);
    process.exit(1);
  }
}

main();
