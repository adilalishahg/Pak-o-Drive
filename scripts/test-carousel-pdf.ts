import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { CURATED_DECKS, renderSlobodanCarouselPdf } from '../src/lib/carouselGenerator';
import { getTopicImage } from '../src/lib/carousel/utils';
import type { CarouselDeck } from '../src/lib/carousel/types';

async function main() {
  console.log('\n🚀 [TestCarousel] Starting LinkedIn Document Carousel PDF Generation...\n');

  const arg = process.argv[2];
  let deck: CarouselDeck;

  if (arg && !isNaN(Number(arg))) {
    const idx = parseInt(arg, 10);
    deck = CURATED_DECKS[idx % CURATED_DECKS.length];
    console.log(`📋 Selected Curated Deck [${idx}]: "${deck.topic}"`);
  } else if (arg && arg.length > 5) {
    // Dynamic topic provided as argument
    console.log(`🤖 Generating Dynamic AI Deck for: "${arg}"...`);
    try {
      const { generateDynamicTechCarouselDeck } = await import('../src/lib/dynamicCarouselAiEngine');
      const res = await generateDynamicTechCarouselDeck();
      deck = res.deck;
    } catch (err) {
      console.warn('⚠️ Dynamic AI deck failed, falling back to Curated Deck:', err);
      deck = CURATED_DECKS[0];
    }
  } else {
    // Default: Test Event-Driven Resilience Deck
    deck = {
      topic: 'Event-Driven Resilience: The 2026 Blueprint for Unbreakable Cloud Systems',
      caption: 'Event-Driven Resilience in 2026 #CloudArchitecture #Microservices #TechLead',
      slides: [
        {
          isCover: true,
          slideType: 'cover',
          tag: 'CLOUD ARCHITECTURE // 2026',
          headline: 'Event-Driven Resilience:\nThe 2026 Blueprint for Unbreakable Cloud Systems',
          subheadline: 'How modern engineering teams eliminate cascading failures and reduce P99 latency with asynchronous domain messaging.',
          footer: 'SWIPE TO EXPLORE ➔',
        },
        {
          slideType: 'intro',
          tag: 'THE CORE BOTTLENECK',
          headline: 'Why traditional synchronous patterns fail at scale',
          subheadline: 'Real-world engineering bottlenecks in distributed microservices production.',
          points: [
            'Tight coupling across distributed services creates cascading failure loops under traffic spikes.',
            'Synchronous request-reply chains amplify P99 latency and exhaust connection pools.',
            'Unbounded state mutations without strict transaction boundaries risk silent data corruption.',
          ],
          footer: 'Swipe to continue ➔',
        },
        {
          slideType: 'stat_card',
          tag: '01 / ARCHITECTURE PARADIGM',
          headline: 'Asynchronous Communication Paradigm',
          subheadline: 'Decoupled services publish events, not synchronous commands, to an event bus.',
          cardContent: {
            badge: 'PRODUCTION METRIC',
            title: 'Decoupled Service Mesh',
            highlightText: 'Reduce MTTR by 40% with event-driven domain architecture',
            bodyLines: [
              'Services publish lightweight domain events to an asynchronous message backbone.',
              'Decoupled consumer workers handle processing independently, isolating failures and scaling horizontally.',
            ],
          },
          takeawayQuote: '"Events are immutable facts, not requests. Embrace the event-driven backbone."',
          footer: 'Swipe to continue ➔',
        },
        {
          slideType: 'diagram',
          tag: '02 / SYSTEM TOPOLOGY',
          headline: 'Decoupled Event Streaming Flow',
          subheadline: 'Zero direct RPC coupling between producer services and background processors.',
          takeawayQuote: '"Strict isolation prevents downstream outages from taking down client checkouts."',
          footer: 'Swipe to continue ➔',
        },
        {
          slideType: 'outro',
          tag: 'SUMMARY CHECKLIST',
          headline: 'Key Architectural Takeaways',
          subheadline: 'Deploying unbreakable event-driven cloud systems in 2026.',
          points: [
            'Decouple writes from reads using an asynchronous event backbone.',
            'Implement idempotent consumer workers with dead-letter queue isolation.',
            'Monitor end-to-end event latency with OpenTelemetry distributed tracing.',
          ],
          footer: 'Follow @Syed Adil Ali for daily systems design',
        },
      ],
    };
    console.log(`📋 Selected Target Deck: "${deck.topic}" (${deck.slides.length} slides)`);
  }

  // 1. Resolve 3D Topic Graphic (if matching or available)
  console.log(`🎨 Fetching topic graphic...`);
  const graphic = getTopicImage(deck.topic);
  if (graphic) {
    console.log(`✓ Loaded topic graphic (${graphic.length} bytes)`);
  } else {
    console.log(`ℹ️ No static 3D graphic matched. Native vector blueprint will be utilized.`);
  }

  // 2. Render 4:5 Portrait PDF Carousel
  console.log(`📄 Compiling 1080x1350 PDF Carousel...`);
  const startTime = Date.now();
  const pdfBuffer = await renderSlobodanCarouselPdf(deck, graphic);
  const duration = Date.now() - startTime;
  console.log(`✓ PDF compiled successfully in ${duration}ms! Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

  // 3. Save to public directory
  const outPdfPath = path.resolve('public/test-carousel.pdf');
  const activePdfPath = path.resolve('public/active-carousel.pdf');
  fs.writeFileSync(outPdfPath, pdfBuffer);
  fs.writeFileSync(activePdfPath, pdfBuffer);
  console.log(`💾 Saved test PDF to: ${outPdfPath}`);
  console.log(`💾 Saved active PDF to: ${activePdfPath}`);

  // 4. Generate HTML Preview Viewer
  const htmlViewerPath = path.resolve('public/carousel-preview.html');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Carousel PDF Preview | Pak-o-Drive</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #030712;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    header {
      width: 100%;
      background: #0B132B;
      border-bottom: 1px solid rgba(0, 245, 212, 0.2);
      padding: 16px 24px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      color: #00F5D4;
    }
    .meta {
      font-size: 14px;
      color: #94A3B8;
    }
    .badge {
      background: rgba(0, 245, 212, 0.15);
      border: 1px solid #00F5D4;
      color: #00F5D4;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
    }
    .container {
      margin: 24px auto;
      width: 90%;
      max-width: 900px;
      height: 85vh;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #1E293B;
      background: #070B14;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>⚡ LinkedIn Document Carousel Preview</h1>
      <div class="meta">${deck.topic} • ${deck.slides.length} Slides • ${(pdfBuffer.length / 1024).toFixed(1)} KB</div>
    </div>
    <span class="badge">Author: Syed Adil Ali</span>
  </header>
  <div class="container">
    <iframe src="/test-carousel.pdf#toolbar=0&view=Fit" type="application/pdf"></iframe>
  </div>
</body>
</html>`;
  fs.writeFileSync(htmlViewerPath, htmlContent);
  console.log(`🌐 Generated HTML Previewer: ${htmlViewerPath}`);

  // 5. Output Slide Inventory Summary
  console.log('\n📊 Slide Inventory:');
  deck.slides.forEach((s, i) => {
    const typeStr = (s.slideType || (s.isCover ? 'cover' : 'slide')).toUpperCase().padEnd(12);
    console.log(`  [Slide ${i + 1}/${deck.slides.length}] Type: ${typeStr} | Headline: "${s.headline.split('\n')[0]}"`);
  });

  console.log('\n✨ [DONE] You can inspect the PDF directly at:');
  console.log(`   👉 file://${outPdfPath.replace(/\\/g, '/')}\n`);
}

main().catch((err) => {
  console.error('\n❌ [TestCarousel] Error generating carousel:', err);
  process.exit(1);
});
