import { NextResponse } from 'next/server';
import { executeAutoLinkedInPost, generateLinkedInTechPost } from '@/lib/socialAutoPostService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s timeout for AI generation and API dispatch
// Cache-bust: 2026-09-07T19:32:00Z - Verified AI image & Slobodan carousel upgrade

export async function GET(request: Request) {
  return handleSocialPost(request);
}

export async function POST(request: Request) {
  return handleSocialPost(request);
}

async function handleSocialPost(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
  const action = searchParams.get('action'); // 'preview' | 'publish'
  const cronSecret = process.env.CRON_SECRET;

  // Validate CRON_SECRET if configured and in production
  if (cronSecret && secret !== cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Unauthorized. Invalid secret.' }, { status: 401 });
  }

  // 1. Preview Mode: Just generate the post content without publishing
  if (action === 'preview') {
    const post = await generateLinkedInTechPost();
    return NextResponse.json({
      success: true,
      mode: 'preview',
      topic: post.topic,
      content: post.content,
    });
  }

  // 2. Full Execution: Generate + Publish to LinkedIn
  const result = await executeAutoLinkedInPost();

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        topic: result.topic,
        generatedContent: result.content,
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
  });
}
