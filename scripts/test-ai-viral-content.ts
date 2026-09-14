import dotenv from 'dotenv';
dotenv.config();

import { generateViralAiContent } from '../src/lib/viralMotionReelEngine';

async function main() {
  console.log('🤖 Calling Multi-AI to generate fresh viral reel package...');
  const res = await generateViralAiContent();
  console.log('\n========================================');
  console.log('🔥 Title / Hook:', res.title);
  console.log('\n📺 Text Lines on Screen:');
  res.quoteLines.forEach((l, i) => console.log(`   Line ${i + 1}: ${l}`));
  console.log('\n📝 Caption:\n', res.caption);
  console.log('\n🏷️ Hashtags:\n', res.hashtags.join(' '));
  console.log('========================================\n');
}

main().catch(console.error);
