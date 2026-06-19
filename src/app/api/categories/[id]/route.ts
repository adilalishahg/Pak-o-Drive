import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Category from '../../../../models/Category';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category updated successfully!', data: updatedCategory });
  } catch (error: any) {
    console.error('Error updating category API:', error);
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
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully!', data: deletedCategory });
  } catch (error: any) {
    console.error('Error deleting category API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
