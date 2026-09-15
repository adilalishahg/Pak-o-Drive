import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import dbConnect from '../src/lib/mongodb';
import SocialAccount from '../src/models/SocialAccount';
import LinkedInPostLog from '../src/models/LinkedInPostLog';
import { publishToLinkedIn } from '../src/lib/socialAutoPostService';

async function main() {
  console.log('\n🚀 [LinkedIn] Preparing to publish Ultra-High-Fidelity Document Carousel to LinkedIn...\n');

  const pdfPath = 'public/active-carousel.pdf';
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Active carousel PDF not found at ${pdfPath}. Please build it first.`);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log(`✓ Loaded Carousel PDF (${Math.round(pdfBuffer.length / 1024)} KB, 8 Slides)`);

  const topic = 'Next.js, Beyond React: The 2026 Blueprint for High-Scale Systems';

  const caption = `Next.js is no longer just a React framework — it has evolved into a complete server runtime. 🚀⚡

For years, engineering teams built Single Page Applications (SPAs) that shipped megabytes of JavaScript to the browser.
The result? Heavy hydration bottlenecks, main thread freezes, and sluggish P99 latencies on mobile devices.

In 2026, the architecture paradigm has fundamentally flipped:
👉 "The best optimization is not running JavaScript faster — it's not sending it to the client in the first place."

Here is the architectural breakdown:

1️⃣ React Server Components (RSC) run directly on the edge server, querying the database with zero public API waterfalls and shipping 0 KB of client JS for static views.
2️⃣ Server Actions eliminate custom REST controllers while guaranteeing type-safe mutations with automatic cache revalidation.
3️⃣ Streaming HTML with Suspense paints the visual UI shell in sub-800ms, hydrating only dynamic interactive islands.

Swipe through the 8-slide visual masterclass below for the complete code comparison and production decision matrix! ➡️

📌 Repost to help other engineers in your feed.
📌 Follow @Syed Adil Ali for weekly system design & high-scale full-stack breakdowns.

#NextJS #React19 #WebDevelopment #SoftwareEngineering #CloudArchitecture #FullStack #TechLead #Performance #Programming #JavaScript #SystemDesign`;

  console.log('📡 Dispatching 8-Slide PDF Document Carousel to LinkedIn API...');
  const res = await publishToLinkedIn(caption, {
    type: 'document',
    buffer: pdfBuffer,
    title: 'Next.js, Beyond React: High-Scale Systems Architecture',
  });

  if (!res.success) {
    console.error('\n❌ [LinkedIn] Publish failed:', res.error);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🎉 [SUCCESS] Published to LinkedIn Successfully!');
  console.log(`🔗 Post ID / URN: ${res.postId}`);
  console.log(`📌 Topic:        ${topic}`);
  console.log(`📄 Attachment:   8-Slide Document Carousel (PDF)`);
  console.log(`👤 Author:       Syed Adil Ali`);
  console.log('======================================================\n');

  // Audit logging
  try {
    await dbConnect();
    await LinkedInPostLog.create({
      topic,
      topicNormalized: topic.toLowerCase().trim(),
      keywords: ['nextjs', 'react', 'architecture', 'fullstack', 'performance'],
      track: 'fullstack-architecture',
      caption,
      slidesCount: 8,
      postId: res.postId,
      source: 'cli-script',
      isCarousel: true,
      status: 'published',
      pdfUrl: '/active-carousel.pdf',
    });
    console.log('✓ Recorded post in LinkedInPostLog audit collection.');
  } catch (logErr) {
    console.warn('⚠️ Could not log to DB:', logErr);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal LinkedIn publisher error:', err);
  process.exit(1);
});
