import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CampaignOffer from '@/models/CampaignOffer';

export const revalidate = 30; // 30-second ISR cache for fast storefront loading

export async function GET() {
  try {
    await dbConnect();
    const activeOffer = await CampaignOffer.findOne({ isActive: true }).lean();

    if (!activeOffer) {
      return NextResponse.json({ success: true, data: null });
    }

    // Check if expired
    if (activeOffer.expiryDate && new Date(activeOffer.expiryDate) < new Date()) {
      return NextResponse.json({ success: true, data: null, expired: true });
    }

    return NextResponse.json({ success: true, data: activeOffer });
  } catch (error: any) {
    console.error('Error fetching active campaign offer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch active offer' },
      { status: 500 }
    );
  }
}
