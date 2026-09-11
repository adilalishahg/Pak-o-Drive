import { NextResponse } from 'next/server';
import { executeAutoInstagramPost } from '@/lib/instagramAutoPostService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 300s timeout for slide rendering, CDN upload and Meta API dispatch

export async function GET(request: Request) {
  return handleInstagramPost(request);
}

export async function POST(request: Request) {
  return handleInstagramPost(request);
}

async function handleInstagramPost(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
  const cronSecret = process.env.CRON_SECRET;

  // Validate CRON_SECRET if configured and in production
  if (cronSecret && secret !== cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Unauthorized. Invalid secret.' }, { status: 401 });
  }

  try {
    console.log('📱 [CronAutoInstagram] Triggering Instagram Tech Carousel Auto-Post...');
    const result = await executeAutoInstagramPost({ source: 'cron' });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          topic: result.topic,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram carousel post published successfully!',
      topic: result.topic,
      category: result.category,
      postId: result.postId,
      permalink: result.permalink,
    });
  } catch (err: any) {
    console.error('❌ [CronAutoInstagram] Instagram task failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Instagram post execution failed',
      },
      { status: 500 }
    );
  }
}
