import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WhatsAppRule, { DEFAULT_WHATSAPP_RULES } from '@/models/WhatsAppRule';

export async function GET() {
  try {
    await dbConnect();
    let rules = await WhatsAppRule.find({}).sort({ priority: 1, createdAt: 1 });

    // Auto seed if empty
    if (rules.length === 0) {
      await WhatsAppRule.insertMany(DEFAULT_WHATSAPP_RULES);
      rules = await WhatsAppRule.find({}).sort({ priority: 1 });
    }

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.replyMessage) {
      return NextResponse.json(
        { success: false, error: 'Rule name and reply message are required.' },
        { status: 400 }
      );
    }

    const keywords = Array.isArray(body.keywords)
      ? body.keywords.map((k: string) => k.trim()).filter(Boolean)
      : (body.keywords || '')
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean);

    const rule = await WhatsAppRule.create({
      name: body.name.trim(),
      triggerType: body.triggerType || 'contains',
      keywords,
      replyMessage: body.replyMessage.trim(),
      dynamicAction: body.dynamicAction || 'none',
      enabled: body.enabled !== false,
      priority: Number(body.priority) || 10,
    });

    return NextResponse.json({
      success: true,
      data: rule,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
