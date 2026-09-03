import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CampaignOffer from '@/models/CampaignOffer';

export async function GET() {
  try {
    await dbConnect();
    const offers = await CampaignOffer.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: offers });
  } catch (error: any) {
    console.error('Error fetching campaign offers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaign offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      title,
      badge,
      subtitle,
      offerType,
      products,
      bundlePrice,
      bundleOriginalPrice,
      expiryDate,
      isActive,
      bgTheme,
      ctaText,
      placement,
      targetCategorySlug,
    } = body;

    if (!title || !products || !Array.isArray(products) || products.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Offer title and at least 2 products are required' },
        { status: 400 }
      );
    }

    // If this offer is set to active, optionally deactivate other offers or keep only one active
    if (isActive) {
      await CampaignOffer.updateMany({}, { isActive: false });
    }

    const newOffer = await CampaignOffer.create({
      title,
      badge: badge || 'LIMITED TIME DEAL',
      subtitle: subtitle || '',
      offerType: offerType || 'flash_sale',
      products,
      bundlePrice: Number(bundlePrice) || 0,
      bundleOriginalPrice: Number(bundleOriginalPrice) || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive: isActive ?? true,
      bgTheme: bgTheme || 'dark_slate',
      ctaText: ctaText || 'Claim Offer Now',
      placement: placement || 'below_slider',
      targetCategorySlug: targetCategorySlug || '',
    });

    return NextResponse.json({ success: true, data: newOffer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating campaign offer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign offer' },
      { status: 500 }
    );
  }
}
