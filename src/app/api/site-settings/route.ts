import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { purgeCacheTags } from '@/lib/cache';
import dbConnect from '../../../lib/mongodb';
import SiteSettings from '../../../models/SiteSettings';

/**
 * GET /api/site-settings
 * Returns the current site settings (creates defaults if none exist).
 */
export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne({}).lean();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return NextResponse.json(
      { success: true, data: settings, settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('GET /api/site-settings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/site-settings
 * Updates site settings. Upserts if no document exists.
 * Body: Partial<ISiteSettings>
 */
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Remove keys we don't want overwritten accidentally
    delete body._id;
    delete body.__v;
    delete body.createdAt;

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, new: true, runValidators: true }
    );

    purgeCacheTags(['site-settings', 'site-settings-global']);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
    } catch (err) {
      console.warn('Revalidation warning for site-settings:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Theme settings saved successfully!',
      data: settings,
      settings,
    });
  } catch (error: any) {
    console.error('PUT /api/site-settings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
