import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return '92' + digits.slice(1);
  return '92' + digits;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPhone = (searchParams.get('phone') || '').trim();

    if (!rawPhone || rawPhone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ success: true, found: false });
    }

    await dbConnect();

    const digitsOnly = rawPhone.replace(/\D/g, '');
    const normalized = normalizePhone(rawPhone);
    const local03 = digitsOnly.startsWith('92') ? '0' + digitsOnly.slice(2) : digitsOnly.startsWith('0') ? digitsOnly : '0' + digitsOnly;
    const intl92 = normalized;

    // Search for the latest order matching this phone number across common Pakistani formats
    const order = await Order.findOne({
      $or: [
        { 'customerDetails.phone': rawPhone },
        { 'customerDetails.phone': local03 },
        { 'customerDetails.phone': intl92 },
        { 'customerDetails.phone': `+${intl92}` },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!order || !order.customerDetails) {
      return NextResponse.json({ success: true, found: false });
    }

    const { name, city, address, email } = order.customerDetails;

    // Return the latest successful delivery profile
    return NextResponse.json({
      success: true,
      found: true,
      profile: {
        fullName: name || '',
        city: city || '',
        address: address || '',
        email: email || '',
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer saved address:', error);
    return NextResponse.json({ success: false, found: false, error: error.message }, { status: 500 });
  }
}
