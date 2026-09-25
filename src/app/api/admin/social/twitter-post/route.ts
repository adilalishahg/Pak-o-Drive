import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { executeAutoTwitterPost, generateTechTwitterThread } from '@/lib/twitterAutoPostService';
import TwitterPostLog from '@/models/TwitterPostLog';
import { SocialAccount } from '@/models/SocialAccount';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function verifyAdminAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_token')?.value;

  const validToken = 'pakodrive_admin_secret_token';
  if (adminCookie === validToken) return true;
  if (authHeader && authHeader.replace('Bearer ', '').trim() === validToken) return true;

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

    const [account, recentLogs] = await Promise.all([
      SocialAccount.findOne({ platform: 'twitter' }).lean(),
      TwitterPostLog.find().sort({ createdAt: -1 }).limit(25).lean(),
    ]);

    const hasEnvKeys = !!(
      (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) ||
      process.env.TWITTER_BEARER_TOKEN ||
      process.env.TWITTER_WEBHOOK_URL
    );

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
      hasEnvKeys,
      recentLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthed = await verifyAdminAuth(request);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin session' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, topic, forceSimulation } = body;

    if (action === 'preview') {
      const threadData = await generateTechTwitterThread(topic);
      return NextResponse.json({
        success: true,
        mode: 'preview',
        data: threadData,
      });
    }

    const result = await executeAutoTwitterPost({
      topic,
      forceSimulation: forceSimulation === true,
      source: 'admin-manual',
    });

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
