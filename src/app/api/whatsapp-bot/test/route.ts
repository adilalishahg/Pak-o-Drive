import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WhatsAppRule from '@/models/WhatsAppRule';
import WhatsAppBotManager from '@/lib/whatsappBot/engine';
import { classifyMessageIntent, generateGeminiStoreResponse } from '@/lib/geminiAssistant';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const queryText = body.message || '';
    const customerPhone = body.phone || '03001234567';

    if (!queryText.trim()) {
      return NextResponse.json({ success: false, error: 'Please provide a test message.' }, { status: 400 });
    }

    // 1. Check Pre-set Rules
    const rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
    const bot = WhatsAppBotManager.getInstance();
    const matchedRule = bot.matchRule(queryText, rules);

    if (matchedRule) {
      const simulatedReply = await bot.resolveReplyMessage(matchedRule, queryText, customerPhone);
      return NextResponse.json({
        success: true,
        data: {
          matched: true,
          matchedRuleName: matchedRule.name,
          matchedRuleId: matchedRule._id,
          dynamicAction: matchedRule.dynamicAction,
          simulatedReply,
        },
      });
    }

    // 2. Gemini Smart Intent Classification (Dual Personal vs Store Check)
    const classification = await classifyMessageIntent(queryText);

    if (!classification.is_store_related) {
      return NextResponse.json({
        success: true,
        data: {
          matched: false,
          matchedRuleName: '🛑 Personal / Family Chat (Silent Mode)',
          dynamicAction: 'silent_ignore',
          simulatedReply:
            '🤫 [Bot Remains 100% Silent]\n\nGemini classified this as personal/family talk or casual conversation ("is_store_related: false"). The bot will NOT reply on WhatsApp, allowing you to chat manually as a normal person.',
        },
      });
    }

    // 3. Store Related: Generate Gemini AI Response with Live MongoDB Products
    const aiReply = await generateGeminiStoreResponse(queryText, customerPhone, classification.search_query);

    return NextResponse.json({
      success: true,
      data: {
        matched: true,
        matchedRuleName: `🤖 Gemini AI Sales Assistant (${classification.category})`,
        dynamicAction: 'gemini_ai_response',
        simulatedReply: aiReply,
      },
    });
  } catch (err: any) {
    console.error('[WhatsAppTestRouteError]:', err);
    return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
  }
}
