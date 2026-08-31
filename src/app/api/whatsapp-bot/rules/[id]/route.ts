import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WhatsAppRule from '@/models/WhatsAppRule';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatePayload: any = {};
    if (body.name !== undefined) updatePayload.name = body.name.trim();
    if (body.triggerType !== undefined) updatePayload.triggerType = body.triggerType;
    if (body.replyMessage !== undefined) updatePayload.replyMessage = body.replyMessage.trim();
    if (body.dynamicAction !== undefined) updatePayload.dynamicAction = body.dynamicAction;
    if (body.enabled !== undefined) updatePayload.enabled = !!body.enabled;
    if (body.priority !== undefined) updatePayload.priority = Number(body.priority);

    if (body.keywords !== undefined) {
      updatePayload.keywords = Array.isArray(body.keywords)
        ? body.keywords.map((k: string) => k.trim()).filter(Boolean)
        : (body.keywords || '')
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean);
    }

    const updated = await WhatsAppRule.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await WhatsAppRule.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Rule deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
