import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../models/Category';
import Product from '../../../models/Product';

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({}).sort({ name: 1 });

    // Refresh count dynamically to ensure consistency
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat.slug });
      if (cat.productCount !== count) {
        cat.productCount = count;
        await cat.save();
      }
    }

    return NextResponse.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    console.error('Error fetching categories API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, slug, icon, image } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Please provide category name and slug.' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

    // Check if slug already exists
    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Category with this slug already exists.' }, { status: 400 });
    }

    const productCount = await Product.countDocuments({ category: cleanSlug });

    const newCategory = new Category({
      name,
      slug: cleanSlug,
      icon: icon || 'fas fa-tag',
      image: image || '',
      productCount,
    });

    const saved = await newCategory.save();
    return NextResponse.json({ success: true, message: 'Category created successfully!', data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
