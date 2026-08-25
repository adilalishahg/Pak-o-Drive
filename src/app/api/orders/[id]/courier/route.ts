import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Order from '../../../../../models/Order';
import { bookCourierParcel } from '../../../../../lib/couriers';
import { CourierProvider } from '../../../../../lib/couriers/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const courier: CourierProvider = body.courier || 'Trax';

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const itemsSummary = order.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ');

    const bookingResult = await bookCourierParcel(courier, {
      orderId: order._id.toString(),
      customerName: order.customerDetails.name,
      customerPhone: order.customerDetails.phone,
      deliveryAddress: order.customerDetails.address,
      city: order.customerDetails.city,
      totalAmount: order.totalAmount,
      itemsCount: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      itemDescription: itemsSummary,
      orderNotes: order.customerDetails.notes,
    });

    if (!bookingResult.success) {
      return NextResponse.json({ success: false, error: 'Failed to book courier parcel' }, { status: 400 });
    }

    // Update order with courier details and set status to 'Shipped'
    order.courierName = bookingResult.courierName;
    order.trackingNumber = bookingResult.trackingNumber;
    order.trackingUrl = bookingResult.trackingUrl;
    order.status = 'Shipped';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'Shipped',
      changedAt: new Date(),
      note: `Parcel booked via ${bookingResult.courierName}. Tracking: ${bookingResult.trackingNumber}`,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      data: {
        courierName: bookingResult.courierName,
        trackingNumber: bookingResult.trackingNumber,
        trackingUrl: bookingResult.trackingUrl,
        orderStatus: order.status,
      },
      message: 'Courier booked successfully',
    });
  } catch (error: any) {
    console.error('Courier booking error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
