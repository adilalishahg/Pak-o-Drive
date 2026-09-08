import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

import fs from 'fs';

async function main() {
  console.log('🚀 [Verify-Live] Starting End-to-End Carousel Auto-Post Execution...');
  
  const { default: dbConnect } = await import('../src/lib/mongodb');
  const { executeAutoLinkedInPost } = await import('../src/lib/socialAutoPostService');

  await dbConnect();

  const preferredIndex = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : undefined;
  const res = await executeAutoLinkedInPost(preferredIndex);
  console.log('Publish Result:', JSON.stringify(res, null, 2));

  // Verification 1: Check active-post-graphic.jpg
  if (fs.existsSync('public/active-post-graphic.jpg')) {
    const stat = fs.statSync('public/active-post-graphic.jpg');
    console.log(`✓ VERIFIED: public/active-post-graphic.jpg exists (${stat.size} bytes)`);
  } else {
    console.warn('⚠️ WARNING: public/active-post-graphic.jpg not found on disk');
  }

  // Verification 2: Check active-carousel.pdf
  if (fs.existsSync('public/active-carousel.pdf')) {
    const stat = fs.statSync('public/active-carousel.pdf');
    console.log(`✓ VERIFIED: public/active-carousel.pdf exists (${stat.size} bytes)`);
  } else {
    console.warn('⚠️ WARNING: public/active-carousel.pdf not found on disk');
  }

  if (res.success) {
    console.log('🎉 SUCCESS: Post is live on LinkedIn! Post ID:', res.postId);
    process.exit(0);
  } else {
    console.error('❌ FAILED:', res.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
