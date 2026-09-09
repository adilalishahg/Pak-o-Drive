import { NextRequest, NextResponse } from 'next/server';
import {
  generateAdminAiExecutiveResponse,
  getAdminStoreSnapshot,
  getStoreSeoAuditSnapshot,
  auditLivePageSeo,
  scrapeCompetitorPage,
} from '@/lib/adminAiEngine';
import { detectActionWithAI, executeAdminAction } from '@/lib/adminActionEngine';

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
    const { message, history, targetSeoUrl, competitorUrl, actionConfirmation } = body;

    // 1. Direct Safety Confirmed Execution
    if (actionConfirmation && actionConfirmation.operation) {
      const confirmedResult = await executeAdminAction(actionConfirmation, true);
      return NextResponse.json({
        success: true,
        reply: confirmedResult.reply,
        actionExecuted: confirmedResult.actionExecuted,
        actionRequired: confirmedResult.actionRequired,
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query message is required' },
        { status: 400 }
      );
    }

    const trimmedMsg = message.trim();

    // 2. Action Intent Detection (Only if not explicitly requesting external competitor or SEO URL audit)
    if (!competitorUrl && !targetSeoUrl) {
      const actionIntent = await detectActionWithAI(trimmedMsg);
      if (actionIntent && actionIntent.isAction) {
        const actionResult = await executeAdminAction(actionIntent, false);
        if (actionResult.handled) {
          return NextResponse.json({
            success: true,
            reply: actionResult.reply,
            actionExecuted: actionResult.actionExecuted,
            actionRequired: actionResult.actionRequired,
          });
        }
      }
    }

    // 3. Fallback to Executive Copilot Intelligence & SEO response
    const reply = await generateAdminAiExecutiveResponse(
      trimmedMsg,
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
