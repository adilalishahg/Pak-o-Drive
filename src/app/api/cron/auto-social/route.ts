import { NextResponse } from 'next/server';
import { executeAutoLinkedInPost, generateLinkedInTechPost, ensurePostHashtagsWithAI } from '@/lib/socialAutoPostService';
import { CURATED_DECKS, renderSlobodanCarouselPdf } from '@/lib/carouselGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 300s (5m) timeout for AI generation, PDF compilation, and LinkedIn API dispatch
// Cache-bust: 2026-09-11T23:30:00Z - 504 Gateway Timeout fix: expanded maxDuration to 300s + AI latency optimization

export async function GET(request: Request) {
  return handleSocialPost(request);
}

export async function POST(request: Request) {
  return handleSocialPost(request);
}

async function handleSocialPost(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
  const action = searchParams.get('action'); // 'preview' | 'preview-carousel' | 'publish'
  const cronSecret = process.env.CRON_SECRET;

  // Validate CRON_SECRET if configured and in production
  if (cronSecret && secret !== cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Unauthorized. Invalid secret.' }, { status: 401 });
  }

  // 1. Preview Carousel Mode: Render 8-slide 4:5 PDF & generate post text with AI hashtags
  if (action === 'preview-carousel' || action === 'preview-pdf') {
    const chosenDeck = CURATED_DECKS[0];
    const postContent = await ensurePostHashtagsWithAI(chosenDeck.caption, chosenDeck.topic);
    const pdfBuffer = await renderSlobodanCarouselPdf(chosenDeck);
    try {
      const fs = await import('fs');
      fs.writeFileSync('public/active-carousel.pdf', pdfBuffer);
    } catch {}

    return NextResponse.json({
      success: true,
      mode: 'preview-carousel',
      topic: chosenDeck.topic,
      slidesCount: chosenDeck.slides.length,
      aspectRatio: '4:5 Vertical Portrait (1080x1350)',
      pdfSize: pdfBuffer.length,
      pdfUrl: '/active-carousel.pdf',
      postContent,
      durationMs: Date.now() - startTime,
    });
  }

  // 2. Standard Preview Mode: Just generate the post content with AI hashtags
  if (action === 'preview') {
    const post = await generateLinkedInTechPost();
    return NextResponse.json({
      success: true,
      mode: 'preview',
      topic: post.topic,
      content: post.content,
      durationMs: Date.now() - startTime,
    });
  }

  // 3. Full Execution: Generate + Publish to LinkedIn
  const result = await executeAutoLinkedInPost();

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        topic: result.topic,
        generatedContent: result.content,
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'LinkedIn technical post published successfully!',
    topic: result.topic,
    postId: result.postId,
    content: result.content,
    durationMs: Date.now() - startTime,
  });
}
