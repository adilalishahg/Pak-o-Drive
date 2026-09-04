import { NextResponse } from 'next/server';
import { executeAutoBlogPost } from '@/lib/autoBlogService';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes max duration for AI generation and DB writing

/**
 * GET / POST /api/cron/auto-blog
 * 
 * Autonomous AI Auto-Blogger Endpoint:
 * - Triggered automatically via Vercel Cron, GitHub Actions, or external cron.
 * - Chooses next unique high-intent Pakistani automotive topic (preventing duplicate titles/slugs).
 * - Generates 1,200+ word human-quality comprehensive guide using Gemini / Groq / HuggingFace.
 * - Auto-matches active Cash on Delivery products from MongoDB catalog.
 * - Publishes with schema.org FAQs, AdSense slots, and instantly invalidates Next.js cache.
 */
export async function GET(request: Request) {
  return handleAutoBlog(request);
}

export async function POST(request: Request) {
  return handleAutoBlog(request);
}

async function handleAutoBlog(request: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
    const cronSecret = process.env.CRON_SECRET;

    // Validate secret if configured
    if (cronSecret && secret !== cronSecret) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized cron request. Invalid CRON_SECRET.' },
          { status: 401 }
        );
      }
    }

    const hubParam = searchParams.get('hub');
    const targetHub = hubParam === 'auto' || hubParam === 'general' ? hubParam : undefined;

    console.log(`🤖 [AutoBlog-Cron] Initiating scheduled AI auto-blog generation${targetHub ? ` for hub: ${targetHub}` : ' (auto-alternating)'}...`);
    const result = await executeAutoBlogPost(targetHub);

    if (!result.success || !result.post) {
      console.error('❌ [AutoBlog-Cron] Execution failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to auto-generate blog post',
          durationMs: Date.now() - startTime,
        },
        { status: 500 }
      );
    }

    const durationMs = Date.now() - startTime;
    console.log(`✅ [AutoBlog-Cron] Successfully published "${result.post.title}" in ${durationMs}ms`);

    return NextResponse.json({
      success: true,
      message: `Autonomous blog post published successfully: "${result.post.title}"`,
      post: result.post,
      stats: {
        durationMs,
        providerUsed: result.post.providerUsed,
        wordCount: result.post.wordCount,
        readTimeMinutes: result.post.readTimeMinutes,
        linkedProductsCount: result.post.linkedProductsCount,
        publishedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ [AutoBlog-Cron] Unexpected exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error during auto-blog execution',
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
