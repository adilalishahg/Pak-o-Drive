import { NextRequest, NextResponse } from 'next/server';
import { generateTrendingIntelligence } from '@/lib/intelligenceEngine';
import { sendAdminDailyTrendsDigest, getAdminWhatsAppNumber } from '@/lib/whatsappNotification';

import SiteInfo from '@/models/SiteInfo';

let cachedReport: any = null;
let lastGeneratedAt: number = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

export async function GET(req: NextRequest) {
  try {
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const limitParam = req.nextUrl.searchParams.get('limit');
    const requestedLimit = limitParam ? parseInt(limitParam, 10) : undefined;
    const now = Date.now();

    if (!forceRefresh && !requestedLimit && cachedReport && now - lastGeneratedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        data: cachedReport,
        cached: true,
      });
    }

    const report = await generateTrendingIntelligence(requestedLimit);
    if (!requestedLimit) {
      cachedReport = report;
      lastGeneratedAt = now;
    }

    return NextResponse.json({
      success: true,
      data: report,
      cached: false,
    });
  } catch (err: any) {
    console.error('[TrendingIntelligenceAPI GET Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate trend intelligence' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'send_whatsapp';

    if (action === 'update_limit') {
      const newLimit = parseInt(body.limit, 10) || 10;
      await SiteInfo.findOneAndUpdate({}, { trendingProductLimit: newLimit }, { upsert: true });
      cachedReport = null; // Invalidate cache so new limit takes effect
      const updatedReport = await generateTrendingIntelligence(newLimit);
      return NextResponse.json({
        success: true,
        limit: newLimit,
        data: updatedReport,
        message: `Daily trending product limit updated to ${newLimit}`,
      });
    }

    if (action === 'send_whatsapp') {
      const report = cachedReport || (await generateTrendingIntelligence());
      const adminPhone = getAdminWhatsAppNumber();

      const sent = await sendAdminDailyTrendsDigest(report);

      return NextResponse.json({
        success: true,
        sent,
        targetPhone: adminPhone,
        message: sent
          ? `Trending Intelligence Digest WhatsApp par bhej diya gaya hai (${adminPhone})`
          : `Bot connected nahi tha ya message queue me chala gaya. (${adminPhone})`,
      });
    }


    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[TrendingIntelligenceAPI POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch intelligence action' },
      { status: 500 }
    );
  }
}
