import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { executeAutoLinkedInPost } from '@/lib/socialAutoPostService';
import { TECH_TRACKS, TechTrack } from '@/lib/dynamicCarouselAiEngine';
import LinkedInPostLog from '@/models/LinkedInPostLog';
import { SocialAccount } from '@/models/SocialAccount';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s timeout for AI generation and LinkedIn PDF upload

async function verifyAdminAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_token')?.value;

  const validToken = 'pakodrive_admin_secret_token';
  if (adminCookie === validToken) return true;
  if (authHeader && authHeader.replace('Bearer ', '').trim() === validToken) return true;

  // In non-production development environments, permit localhost debug
  if (process.env.NODE_ENV !== 'production') return true;

  return false;
}

export async function GET(request: Request) {
  try {
    const isAuthed = await verifyAdminAuth(request);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin session' }, { status: 401 });
    }

    await dbConnect();

    const [account, recentLogs, allPublishedLogs] = await Promise.all([
      SocialAccount.findOne({ platform: 'linkedin' }).lean(),
      LinkedInPostLog.find().sort({ createdAt: -1 }).limit(25).lean(),
      LinkedInPostLog.find({ status: 'published' }).select('topic createdAt track postId').sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      account: account
        ? {
            platform: account.platform,
            accountName: account.accountName,
            accountUrn: account.accountUrn,
            isActive: account.isActive,
            lastPostedAt: account.lastPostedAt,
            postCount: account.postCount,
          }
        : null,
      tracks: Object.values(TECH_TRACKS),
      recentLogs,
      publishedTopics: allPublishedLogs.map((l: any) => ({
        topic: l.topic,
        track: l.track,
        createdAt: l.createdAt,
        postId: l.postId,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch LinkedIn status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthed = await verifyAdminAuth(request);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin session' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const track = (body.track as TechTrack | 'auto') || 'auto';
    const preferredDeckIndex = typeof body.preferredDeckIndex === 'number' ? body.preferredDeckIndex : undefined;

    console.log(`📡 [AdminLinkedInAPI] Triggering manual post. Track: "${track}", PreferredDeckIndex: ${preferredDeckIndex}`);

    const result = await executeAutoLinkedInPost({
      track,
      preferredDeckIndex,
      source: 'admin-manual',
      forceDynamic: true,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to publish post to LinkedIn',
          topic: result.topic,
          track: result.track,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dynamic technical carousel generated and published to LinkedIn successfully!',
      topic: result.topic,
      postId: result.postId,
      track: result.track,
      isDynamic: result.isDynamic,
      isCarousel: result.isCarousel,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during LinkedIn post execution' },
      { status: 500 }
    );
  }
}
