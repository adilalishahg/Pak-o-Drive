/**
 * CLI Runner: Generate Cinematic Single-Tool Deep Dive AI Reel
 * 
 * Usage:
 *   npx tsx scripts/generate-cinematic-reel.ts
 *   npx tsx scripts/generate-cinematic-reel.ts "Bolt.new"
 */
import dotenv from 'dotenv';
dotenv.config();

import { generateCinematicVideo } from '../src/lib/cinematicVideo';

async function main() {
  const customTool = process.argv[2];
  if (customTool) {
    console.log(`📌 Targeted Tool Specified via CLI: "${customTool}"`);
  }

  try {
    const result = await generateCinematicVideo({
      customToolName: customTool,
    });

    console.log('----------------------------------------------------');
    console.log(`🎬 Cinematic Reel Successfully Created for "${result.toolName}"!`);
    console.log(`📁 Video: ${result.videoPath}`);
    console.log(`⏱️ Duration: ${result.videoDurationSeconds.toFixed(1)} seconds`);
    console.log(`💾 Size: ${(result.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`🌐 Preview in browser: file://${result.previewHtmlPath?.replace(/\\/g, '/')}`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ [Cinematic Reel Error]:', err);
    process.exit(1);
  }
}

main();
