import { NextResponse } from 'next/server';
import { generateAiProductSeo } from '@/lib/productSeoGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category, subcategory, description, brand } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required to generate AI SEO' },
        { status: 400 }
      );
    }

    const seoData = await generateAiProductSeo({
      name: name.trim(),
      price: typeof price === 'number' ? price : Number(price) || undefined,
      category,
      subcategory,
      description,
      brand,
    });

    return NextResponse.json({
      success: true,
      data: seoData,
    });
  } catch (error: any) {
    console.error('AI SEO generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate AI SEO' },
      { status: 500 }
    );
  }
}
