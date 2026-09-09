import { NextRequest, NextResponse } from 'next/server';
import {
  generateAdminAiExecutiveResponse,
  getAdminStoreSnapshot,
  getStoreSeoAuditSnapshot,
  auditLivePageSeo,
  scrapeCompetitorPage,
} from '@/lib/adminAiEngine';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const auditPath = url.searchParams.get('auditPath');
    const competitorUrl = url.searchParams.get('competitorUrl');

    // If query requests a live competitor scrape
    if (competitorUrl) {
      const competitorData = await scrapeCompetitorPage(competitorUrl);
      return NextResponse.json({
        success: true,
        data: { competitorData },
      });
    }

    // If query requests a live page audit
    if (auditPath) {
      const pageAudit = await auditLivePageSeo(auditPath);
      return NextResponse.json({
        success: true,
        data: { pageAudit },
      });
    }

    const [snapshot, seoAudit] = await Promise.all([
      getAdminStoreSnapshot(),
      getStoreSeoAuditSnapshot(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        snapshot,
        seoAudit,
      },
    });
  } catch (error: any) {
    console.error('[AdminAiCopilot GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch copilot summary' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, targetSeoUrl, competitorUrl } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query message is required' },
        { status: 400 }
      );
    }

    const reply = await generateAdminAiExecutiveResponse(
      message.trim(),
      history || [],
      targetSeoUrl,
      competitorUrl
    );

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('[AdminAiCopilot POST Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error processing AI query',
      },
      { status: 500 }
    );
  }
}
