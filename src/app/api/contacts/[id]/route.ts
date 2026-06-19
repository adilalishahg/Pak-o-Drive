import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Contact from '../../../../models/Contact';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['Read', 'Unread'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Contact message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated successfully!', data: updated });
  } catch (error: any) {
    console.error('Error updating contact status API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
