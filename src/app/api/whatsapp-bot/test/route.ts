import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WhatsAppRule from '@/models/WhatsAppRule';
import WhatsAppBotManager from '@/lib/whatsappBot/engine';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const queryText = body.message || '';
    const customerPhone = body.phone || '03001234567';

    if (!queryText.trim()) {
      return NextResponse.json({ success: false, error: 'Please provide a test message.' }, { status: 400 });
    }

    const rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
    const bot = WhatsAppBotManager.getInstance();
    const matchedRule = bot.matchRule(queryText, rules);

    if (!matchedRule) {
      return NextResponse.json({
        success: true,
        data: {
          matched: false,
          matchedRuleName: null,
          simulatedReply: '⚠️ No active rule matched this test message. (You can create a new rule with relevant keywords or enable a default rule).',
        },
      });
    }

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
  } catch (err: any) {
    console.error('[WhatsAppTestRouteError]:', err);
    return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
  }
}
