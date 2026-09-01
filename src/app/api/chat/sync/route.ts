import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebChatSession from '@/models/WebChatSession';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId required' }, { status: 400 });
    }

    const session = await WebChatSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ success: true, messages: [], isAgentLive: false });
    }

    return NextResponse.json({
      success: true,
      messages: session.messages || [],
      isAgentLive: session.isAgentLive,
      shortCode: session.shortCode,
    });
  } catch (err: any) {
    console.error('[ChatSyncAPI Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
