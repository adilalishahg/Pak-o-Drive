import { NextRequest, NextResponse } from 'next/server';
import {
  generateAdminAiExecutiveResponse,
  getAdminStoreSnapshot,
  getStoreSeoAuditSnapshot,
  auditLivePageSeo,
  scrapeCompetitorPage,
} from '@/lib/adminAiEngine';
import { detectActionWithAI, executeAdminAction } from '@/lib/adminActionEngine';
import { analyzeProductImageWithAI } from '@/lib/visionAiEngine';

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
    const { message, history, targetSeoUrl, competitorUrl, actionConfirmation, image } = body;

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

    // 2. Vision AI Snap & Auto-List Handling
    if (image && typeof image === 'string') {
      const analysis = await analyzeProductImageWithAI(
        image,
        message && typeof message === 'string' ? message : 'Analyze this product and prepare an auto-listing'
      );

      const displayStock = analysis.stock || 25;
      const displayWholesale = analysis.wholesaleCost || Math.round(analysis.price * 0.45);

      return NextResponse.json({
        success: true,
        reply: `📸 **Vision AI Auto-Analysis Mukammal!**\n\nTasweer me **"${analysis.name}"** identify ho chuki hai. Pakistan automotive market aur competitors (Sehgal Motors / Daraz) se benchmark kar ke optimized PKR pricing aur SEO description tayyar hai:\n\n- 🏷️ **Product Title:** ${analysis.name}\n- 💰 **Suggested Retail Price:** PKR ${analysis.price.toLocaleString()} *(Estimated Wholesale: PKR ${displayWholesale.toLocaleString()})*\n- 🏬 **Competitor Benchmark:** PKR ${analysis.competitorPrice.toLocaleString()} (${analysis.competitorStore})\n- 🚀 **Profit Margin:** ~${analysis.profitMarginPercent}%\n- 📦 **Initial Stock:** ${displayStock} units\n- 📂 **Category:** ${analysis.category}\n- 🔑 **Target SEO Keywords:** ${analysis.seoKeywords}\n\nAgar aap mutma'in hain tou neeche diye gaye proposal card par **"✅ Approve & Publish Live"** dabayein taake product foran store par live ho jaye!`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'publish_vision_product',
          title: `Publish: ${analysis.name}`,
          description: `PKR ${analysis.price.toLocaleString()} (Competitor: PKR ${analysis.competitorPrice.toLocaleString()})`,
          payload: {
            operation: 'publish_vision_product',
            params: {
              ...analysis,
              userUploadedImage: image,
              stock: displayStock,
              profitMarginPercentage: analysis.profitMarginPercent,
              competitorSource: analysis.competitorStore,
              images: [image || analysis.studioImage],
            },
          },
        },
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
