import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'Please provide email or phone number.' },
        { status: 400 }
      );
    }

    const query: any = {};
    if (email && email.trim()) {
      query['customerDetails.email'] = { $regex: new RegExp(`^${email.trim()}$`, 'i') };
    } else if (phone && phone.trim()) {
      query['customerDetails.phone'] = phone.trim();
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders found with the provided details.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Error tracking orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
