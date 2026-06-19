import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Promotion from '../../../models/Promotion';

export async function GET() {
  try {
    await dbConnect();
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: promotions.length, data: promotions });
  } catch (error: any) {
    console.error('Error fetching promotions API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { code, discountPercent, isActive, expiryDate } = body;

    if (!code || discountPercent === undefined || !expiryDate) {
      return NextResponse.json({ success: false, error: 'Please provide coupon code, discount percentage, and expiry date.' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check if code exists
    const existing = await Promotion.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Promo code already exists.' }, { status: 400 });
    }

    const newPromotion = new Promotion({
      code: cleanCode,
      discountPercent: Number(discountPercent),
      isActive: isActive !== undefined ? !!isActive : true,
      expiryDate: new Date(expiryDate),
    });

    const saved = await newPromotion.save();
    return NextResponse.json({ success: true, message: 'Promotion created successfully!', data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating promotion API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
