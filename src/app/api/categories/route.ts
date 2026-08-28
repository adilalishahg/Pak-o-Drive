import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../models/Category';
import Product from '../../../models/Product';

export async function GET() {
  try {
    await dbConnect();

    const [categories, counts] = await Promise.all([
      Category.find({}).sort({ name: 1 }).lean(),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => {
      if (c._id) countMap[c._id] = c.count;
    });

    const populatedCategories = categories.map((cat: any) => ({
      ...cat,
      productCount: countMap[cat.slug] ?? cat.productCount ?? 0,
    }));

    return NextResponse.json({ success: true, count: populatedCategories.length, data: populatedCategories }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error: any) {
    console.error('Error fetching categories API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, slug, icon, image, parentCategory } = body;

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
      parentCategory: parentCategory || '',
    });

    const saved = await newCategory.save();
    return NextResponse.json({ success: true, message: 'Category created successfully!', data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
