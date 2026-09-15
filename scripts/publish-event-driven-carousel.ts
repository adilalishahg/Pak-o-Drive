import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import dbConnect from '../src/lib/mongodb';
import LinkedInPostLog from '../src/models/LinkedInPostLog';
import { publishToLinkedIn } from '../src/lib/socialAutoPostService';

async function main() {
  console.log('\n🚀 [LinkedIn] Preparing to publish Event-Driven Architecture Carousel to LinkedIn...\n');

  const pdfPath = 'public/active-carousel.pdf';
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Active carousel PDF not found at ${pdfPath}. Please build it first.`);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log(`✓ Loaded Carousel PDF (${Math.round(pdfBuffer.length / 1024)} KB, 8 Slides)`);

  const topic = 'Event-Driven Architecture: Why High-Scale Teams Abandoned Synchronous REST';

  const caption = `When Service A calls Service B, which calls Service C... your entire system is only as reliable as its slowest downstream link. ⛓️💥

In distributed microservices, synchronous HTTP/REST chains quietly turn independent services into a brittle distributed monolith. A single 3rd-party payment latency spike or database pool lock cascades backwards, exhausting worker threads and crashing checkout for 100% of end users.

Top cloud engineering teams abandoned synchronous cascades in favor of Event-Driven Architecture (EDA):

1️⃣ 12ms Instant Response — The client receives an immediate 202 Accepted. Zero waiting on external payment gateways or third-party webhooks.
2️⃣ 100% Blast Radius Isolation — If your email or analytics worker crashes, domain events buffer safely in the message broker. Not a single customer order is dropped.
3️⃣ Zero-Coupling Extensibility — Producers emit immutable domain facts ('order.placed'). New microservices subscribe without modifying a single line of core checkout code.

Swipe through the 8-slide visual breakdown below:
• Cascading REST failure diagram & thread exhaustion breakdown
• Side-by-side macOS code comparison (Brittle REST vs Event Publisher)
• Real production metrics (-85% MTTR, 9.4x throughput, 99.999% uptime)
• 4 unbreakable cloud rules (Idempotency, Transactional Outbox, DLQ, Schemas)
• Synchronous vs Asynchronous decision matrix

📌 Repost to help other engineers building distributed systems.
📌 Follow @Syed Adil Ali for weekly deep-dives into production cloud systems and high-scale architecture.

#SystemDesign #CloudArchitecture #Microservices #EventDriven #SoftwareEngineering #Kafka #NodeJS #DistributedSystems #TechLead #DevOps #Backend`;

  console.log('📡 Dispatching 8-Slide PDF Document Carousel to LinkedIn API...');
  const res = await publishToLinkedIn(caption, {
    type: 'document',
    buffer: pdfBuffer,
    title: 'Event-Driven Architecture: Why High-Scale Teams Abandoned REST',
  });

  if (!res.success) {
    console.error('\n❌ [LinkedIn] Publish failed:', res.error);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🎉 [SUCCESS] Published Event-Driven Carousel to LinkedIn!');
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
      keywords: ['event-driven', 'microservices', 'cloud', 'system-design', 'architecture'],
      track: 'cloud-architecture',
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
