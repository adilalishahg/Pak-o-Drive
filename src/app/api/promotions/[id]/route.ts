import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Promotion from '../../../../models/Promotion';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updated = await Promotion.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Promotion updated successfully!', data: updated });
  } catch (error: any) {
    console.error('Error updating promotion API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Promotion.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Promotion deleted successfully!', data: deleted });
  } catch (error: any) {
    console.error('Error deleting promotion API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
