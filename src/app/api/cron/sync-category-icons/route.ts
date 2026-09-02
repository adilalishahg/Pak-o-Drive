import { NextResponse } from 'next/server';
import { purgeCacheTags } from '@/lib/cache';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { resolveCategoryIcon, isIconValidInActiveLibrary } from '@/lib/categoryIconService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Up to 60s for full AI database scan

/**
 * GET / POST /api/cron/sync-category-icons
 * Daily Automated AI Category & Icon Health Maintenance Cron Job
 * 
 * - Scans all categories & products in MongoDB.
 * - Detects missing, generic ('fas fa-tag', 'fas fa-box'), or invalid icons.
 * - Automatically selects and sets the accurate icon using 100+ semantic rules + Gemini AI.
 * - Auto-purges cache so changes are immediately live on the storefront.
 */
export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}

async function handleSync(request: Request) {
  const startTime = Date.now();
  try {
    // Optional secret verification for Vercel Cron or custom cron secret
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '') : '');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      // In development or if no secret configured, allow access
      if (process.env.NODE_ENV === 'production' && secret !== cronSecret) {
        return NextResponse.json({ success: false, error: 'Unauthorized cron request.' }, { status: 401 });
      }
    }

    await dbConnect();

    // 1. Fetch categories & products
    const categories = await Category.find({});
    const products = await Product.find({}).select('name category subcategory').lean();

    // Group product counts & sample names by category
    const productsByCat = new Map<string, string[]>();
    for (const p of products) {
      const catKey = (p.category || '').toLowerCase().trim();
      if (!productsByCat.has(catKey)) productsByCat.set(catKey, []);
      productsByCat.get(catKey)!.push(p.name);

      if (p.subcategory) {
        const subKey = p.subcategory.toLowerCase().trim();
        if (!productsByCat.has(subKey)) productsByCat.set(subKey, []);
        productsByCat.get(subKey)!.push(p.name);
      }
    }

    let updatedCount = 0;
    const updates: Array<{ category: string; oldIcon: string; newIcon: string; reason: string }> = [];

    for (const cat of categories) {
      const cleanName = cat.name.trim();
      const currentIcon = cat.icon || '';
      const sampleNames = (productsByCat.get(cat.slug.toLowerCase()) || []).slice(0, 3).join(' ');

      // Context text combining category name and its products
      const context = `${cleanName} ${cat.slug} ${sampleNames}`.trim();

      // Check if current icon is invalid or generic
      const isGeneric = !currentIcon || currentIcon === 'fas fa-tag' || currentIcon === 'fas fa-box';
      const isValid = isIconValidInActiveLibrary(currentIcon);

      // Resolve the optimal accurate icon
      const accurateIcon = await resolveCategoryIcon(cleanName || context, isGeneric ? undefined : currentIcon);

      let needsUpdate = false;
      let updateReason = '';

      if (cat.name !== cleanName) {
        cat.name = cleanName;
        needsUpdate = true;
        updateReason = 'Sanitized category name whitespace';
      }

      if (!isValid || isGeneric || (currentIcon !== accurateIcon && isGeneric)) {
        needsUpdate = true;
        updateReason = !isValid ? 'Icon not present in active library' : 'Replaced generic/mismatched icon with AI accurate match';
        cat.icon = accurateIcon;
      }

      if (needsUpdate) {
        await cat.save();
        updatedCount++;
        updates.push({
          category: cat.name,
          oldIcon: currentIcon,
          newIcon: cat.icon,
          reason: updateReason,
        });
      }
    }

    // Purge caches so storefront immediately reflects any changes
    purgeCacheTags(['categories', 'products']);

    const durationMs = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      message: `Daily category & icon sync completed in ${durationMs}ms. Updated ${updatedCount} / ${categories.length} categories.`,
      stats: {
        totalCategories: categories.length,
        updatedCategories: updatedCount,
        durationMs,
      },
      updates,
    });

  } catch (error: any) {
    console.error('❌ [Cron: sync-category-icons] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during category sync.' },
      { status: 500 }
    );
  }
}
