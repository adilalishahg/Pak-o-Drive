import { NextResponse } from 'next/server';
import { executeAutoInstagramReelPost } from '@/lib/instagramReelPostService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute maximum duration for full video synthesis & Meta queue

export async function GET(request: Request) {
  return handleInstagramReelPost(request);
}

export async function POST(request: Request) {
  return handleInstagramReelPost(request);
}

async function handleInstagramReelPost(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
  const cronSecret = process.env.CRON_SECRET;

  // Validate CRON_SECRET if configured and in production
  if (cronSecret && secret !== cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Unauthorized. Invalid secret.' }, { status: 401 });
  }

  const customTool = searchParams.get('tool') || undefined;

  try {
    console.log('🎬 [CronAutoInstagramReel] Triggering Cinematic AI Reel Auto-Post...');
    const result = await executeAutoInstagramReelPost({
      source: 'cron',
      customToolName: customTool,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          tool: result.toolName,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cinematic AI Reel published to Instagram successfully!',
      toolName: result.toolName,
      postId: result.postId,
      permalink: result.permalink,
      videoUrl: result.videoUrl,
      duration: result.durationSeconds,
    });
  } catch (err: any) {
    console.error('❌ [CronAutoInstagramReel] Task failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Instagram Reel execution failed',
      },
      { status: 500 }
    );
  }
}
