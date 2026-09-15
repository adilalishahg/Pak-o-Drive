import dotenv from 'dotenv';
dotenv.config();

import { executeAutoInstagramReelPost } from '../src/lib/instagramReelPostService';
import { getUkTimeInfo } from '../src/lib/ukScheduleHelper';

async function main() {
  const args = process.argv.slice(2);
  const shouldWaitForUk = args.includes('--wait-uk');
  const customTool = args.find((a) => !a.startsWith('--'));

  const ukInfo = getUkTimeInfo();
  console.log('====================================================');
  console.log(`🇬🇧 UK TIME: ${ukInfo.ukTimeString} | 🇵🇰 PKT TIME: ${ukInfo.pktTimeString}`);
  console.log(`⚡ UK REACH STATUS: ${ukInfo.formattedCountdown}`);
  console.log('====================================================');

  if (shouldWaitForUk && !ukInfo.isPeakUkTime) {
    console.log(`⏳ Sleeping for ${(ukInfo.msUntilNextUkPeak / 1000 / 60).toFixed(0)} minutes until UK peak window (18:00 GMT / 23:00 PKT)...`);
    await new Promise((resolve) => setTimeout(resolve, ukInfo.msUntilNextUkPeak));
    console.log('🚀 UK Peak window reached! Launching reel dispatch...');
  }

  if (customTool) {
    console.log(`📌 Targeted Tool Specified via CLI: "${customTool}"`);
  }

  try {
    const result = await executeAutoInstagramReelPost({
      source: 'cli-script',
      customToolName: customTool,
      ukTargeting: true,
    });

    if (result.success) {
      console.log('----------------------------------------------------');
      console.log(`🎉 Reel Successfully Published to Instagram!`);
      console.log(`🛠️ Title: ${result.toolName}`);
      console.log(`🆔 Post ID: ${result.postId}`);
      console.log(`🔗 Link: ${result.permalink}`);
      console.log(`🌐 Video CDN: ${result.videoUrl}`);
      if (result.storyId) {
        console.log(`📲 Story ID: ${result.storyId}`);
      }

      // Step 10 Status: TikTok Auto-Publish
      if (result.tikTokPublishId) {
        console.log(`🎉 TikTok Video Published! Publish ID: ${result.tikTokPublishId}`);
      }

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
