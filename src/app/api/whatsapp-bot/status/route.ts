import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WhatsAppBotStatus from '@/models/WhatsAppBotStatus';
import WhatsAppBotManager from '@/lib/whatsappBot/engine';

export async function GET() {
  try {
    await dbConnect();
    const daemonStatus = await WhatsAppBotStatus.findOne().sort({ updatedAt: -1 }).lean();

    if (daemonStatus) {
      const pingAgeMs = Date.now() - new Date(daemonStatus.lastPingAt).getTime();
      // If daemon pinged within last 3 minutes
      if (daemonStatus.status === 'CONNECTED' && pingAgeMs < 3 * 60 * 1000) {
        return NextResponse.json({
          success: true,
          data: {
            status: 'CONNECTED',
            phoneNumber: daemonStatus.phoneNumber,
            qrCodeBase64: null,
            lastConnectedAt: daemonStatus.lastConnectedAt || daemonStatus.updatedAt,
            totalMessagesProcessed: daemonStatus.totalMessagesProcessed || 0,
            totalAutoRepliesSent: daemonStatus.totalAutoRepliesSent || 0,
            pausedContacts: {},
            error: null,
            platform: daemonStatus.platform || 'Alwaysdata 24/7 Cloud Daemon',
          },
        });
      }
    }

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
