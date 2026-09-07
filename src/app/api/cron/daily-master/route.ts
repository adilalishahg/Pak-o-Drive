import { NextResponse } from 'next/server';
import { executeAutoBlogPost } from '@/lib/autoBlogService';
import { executeAutoLinkedInPost } from '@/lib/socialAutoPostService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed serverless duration on Vercel

/**
 * GET / POST /api/cron/daily-master
 * 
 * Master Cron Runner for Vercel Free (Hobby) Plan:
 * - Vercel Hobby allows only 1 cron job schedule.
 * - This master endpoint triggers both Auto-Blog and LinkedIn Auto-Post in a single unified execution.
 * - Each job runs with isolated error handling so failure in one never blocks the other.
 */
export async function GET(request: Request) {
  return handleMasterCron(request);
}

export async function POST(request: Request) {
  return handleMasterCron(request);
}

async function handleMasterCron(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
  const cronSecret = process.env.CRON_SECRET;

  // Validate secret if configured in production
  if (cronSecret && secret !== cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized master cron request. Invalid secret.' },
      { status: 401 }
    );
  }

  const results: Record<string, any> = {};

  // 1. Run Auto-Blog Engine
  try {
    console.log('🤖 [MasterCron] 1/2: Executing Autonomous AI Blog Generation...');
    const blogRes = await executeAutoBlogPost();
    results.blog = {
      success: blogRes.success,
      title: blogRes.post?.title,
      slug: blogRes.post?.slug,
      error: blogRes.error,
    };
  } catch (err: any) {
    console.error('❌ [MasterCron] Blog task failed:', err);
    results.blog = { success: false, error: err.message || 'Blog task error' };
  }

  // 2. Run LinkedIn Auto-Post Engine
  try {
    console.log('🚀 [MasterCron] 2/2: Executing LinkedIn Tech Carousel Auto-Post...');
    const socialRes = await executeAutoLinkedInPost();
    results.social = {
      success: socialRes.success,
      topic: socialRes.topic,
      postId: socialRes.postId,
      isCarousel: socialRes.isCarousel,
      error: socialRes.error,
    };
  } catch (err: any) {
    console.error('❌ [MasterCron] LinkedIn task failed:', err);
    results.social = { success: false, error: err.message || 'LinkedIn task error' };
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    success: results.blog?.success || results.social?.success,
    timestamp: new Date().toISOString(),
    durationMs,
    results,
  });
}
