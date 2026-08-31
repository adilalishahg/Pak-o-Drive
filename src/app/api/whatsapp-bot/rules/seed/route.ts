import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WhatsAppRule, { DEFAULT_WHATSAPP_RULES } from '@/models/WhatsAppRule';

export async function POST() {
  try {
    await dbConnect();
    await WhatsAppRule.deleteMany({});
    const seeded = await WhatsAppRule.insertMany(DEFAULT_WHATSAPP_RULES);

    return NextResponse.json({
      success: true,
      data: seeded,
      message: 'Reset to default Pakistani e-commerce rules successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
