import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import dbConnect from '../src/lib/mongodb';
import LinkedInPostLog from '../src/models/LinkedInPostLog';
import { publishToLinkedIn } from '../src/lib/socialAutoPostService';

async function main() {
  console.log('\n🚀 [LinkedIn] Preparing to publish Agentic AI Document Carousel to LinkedIn...\n');

  const pdfPath = 'public/active-carousel.pdf';
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Active carousel PDF not found at ${pdfPath}. Please build it first.`);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log(`✓ Loaded Carousel PDF (${Math.round(pdfBuffer.length / 1024)} KB, 8 Slides)`);

  const topic = 'Autonomous AI Agents: Why Single Prompts Fail and Multi-Agent Swarms Take Over';

  const caption = `Treating LLMs like monolithic text generators is the #1 reason enterprise AI experiments fail in production. 🤖❌

When you give a single prompt to a raw model and expect it to plan, write hundreds of lines of code, and execute safely:
👉 Recall drops by 60% due to context dilution ("lost in the middle").
👉 Hallucinated dependencies and broken imports get written directly to disk.
👉 A single syntax bug causes the entire one-shot generation to crash without self-healing.

In 2026, high-performing AI engineering teams have replaced single-prompt toys with Deterministic Multi-Agent Topologies:

1️⃣ Planner Agent — Parses codebase ASTs, Tree-Sitter graphs, and file blast radii before writing a single line.
2️⃣ Coder Agent — Performs targeted, surgical diff chunk replacements rather than expensive 1,000+ line rewrites.
3️⃣ Verifier Agent — Runs headless compiler gates (TypeScript, ESLint, Unit Tests) to validate reality over predictions.
4️⃣ Self-Healer Agent — Feeds compiler diagnostic stacks back into the loop until 0 errors remain.

Swipe through the 8-slide masterclass below for:
• The single-prompt breakdown & recall degradation curve
• The 4-agent autonomous execution loop
• Side-by-side macOS code comparison (Naive generation vs Typed Agent Loop)
• Production benchmarks (99.2% task success, 4.8x lower token burn)
• 4 unbreakable architectural rules for AI swarms
• Cognitive architecture decision matrix (Single Prompt vs RAG vs Multi-Agent Swarms)

📌 Save this deck for your engineering team's next AI sprint!
📌 Follow @Syed Adil Ali for weekly system design & high-scale software engineering deep-dives.

#AgenticAI #ArtificialIntelligence #SoftwareEngineering #MachineLearning #SystemDesign #TechLead #DevOps #TypeScript #OpenAI #Programming #FullStack`;

  console.log('📡 Dispatching 8-Slide PDF Document Carousel to LinkedIn API...');
  const res = await publishToLinkedIn(caption, {
    type: 'document',
    buffer: pdfBuffer,
    title: 'Autonomous AI Agents: The Multi-Agent Systems Architecture',
  });

  if (!res.success) {
    console.error('\n❌ [LinkedIn] Publish failed:', res.error);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🎉 [SUCCESS] Published Agentic AI Carousel to LinkedIn!');
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
      keywords: ['agentic-ai', 'ai-agents', 'system-design', 'multi-agent', 'architecture'],
      track: 'agentic-ai',
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
