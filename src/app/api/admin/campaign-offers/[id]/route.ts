import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CampaignOffer from '@/models/CampaignOffer';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (body.isActive) {
      // Deactivate others so only 1 main campaign banner is active
      await CampaignOffer.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const updated = await CampaignOffer.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating campaign offer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update campaign offer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deleted = await CampaignOffer.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting campaign offer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete campaign offer' },
      { status: 500 }
    );
  }
}
