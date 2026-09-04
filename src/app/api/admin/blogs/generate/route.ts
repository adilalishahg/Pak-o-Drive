import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { generateMultiAiBlogDraft } from '@/lib/multiAiBlogGenerator';
import { resolveBlogCoverImage } from '@/lib/blogImageResolver';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, keywords = [], category } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid topic for the automotive blog guide.' },
        { status: 400 }
      );
    }

    // 1. Generate full draft with Multi-Model Waterfall
    const draft = await generateMultiAiBlogDraft(
      topic.trim(),
      Array.isArray(keywords) ? keywords : [keywords],
      category
    );

    // 2. Query store database to auto-match featured products
    let matchedProducts: any[] = [];
    try {
      await dbConnect();
      const searchTerms = [
        ...(draft.suggestedProductKeywords || []),
        ...(draft.tags || []),
        ...topic.toLowerCase().split(/\s+/),
      ]
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 2)
        .slice(0, 8);

      if (searchTerms.length > 0) {
        const regexQueries = searchTerms.map((term) => ({
          name: { $regex: term, $options: 'i' },
        }));

        matchedProducts = await Product.find({
          $or: regexQueries,
        })
          .select('name slug price originalPrice images image category stock')
          .limit(6)
          .lean();
      }

      // If no direct keyword match, grab top selling / active accessories as sensible fallback
      if (matchedProducts.length === 0) {
        matchedProducts = await Product.find({})
          .sort({ createdAt: -1 })
          .select('name slug price originalPrice images image category stock')
          .limit(3)
          .lean();
      }
    } catch (dbErr) {
      console.warn('Could not auto-match products:', dbErr);
    }

    // 3. Resolve topic-accurate cover photo
    const hub = body.hub === 'general' ? 'general' : 'auto';
    const suggestedCoverImage = resolveBlogCoverImage(
      draft.title,
      draft.category,
      hub,
      [...(draft.tags || []), ...(draft.seoKeywords || [])]
    );

    return NextResponse.json({
      success: true,
      data: {
        draft,
        matchedProducts,
        suggestedCoverImage,
        hub,
        providerUsed: draft.providerUsed,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/blogs/generate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'AI Generation failed across all providers. Check your API keys.',
      },
      { status: 500 }
    );
  }
}
