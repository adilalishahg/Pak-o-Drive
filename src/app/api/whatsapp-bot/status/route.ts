import { NextRequest, NextResponse } from 'next/server';
import WhatsAppBotManager from '@/lib/whatsappBot/engine';

export async function GET() {
  try {
    const bot = WhatsAppBotManager.getInstance();
    return NextResponse.json({
      success: true,
      data: bot.state,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'start';
    const bot = WhatsAppBotManager.getInstance();

    if (action === 'start') {
      const state = await bot.startBot();
      return NextResponse.json({ success: true, data: state });
    } else if (action === 'logout') {
      const state = await bot.logout();
      return NextResponse.json({ success: true, data: state });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
