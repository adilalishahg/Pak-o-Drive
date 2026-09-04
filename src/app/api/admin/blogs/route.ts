import { NextResponse } from 'next/server';
import { purgeCacheTags } from '@/lib/cache';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import '@/models/Product';
import { generateSlug } from '@/lib/multiAiBlogGenerator';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || ''; // 'published' | 'draft' | ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '20', 10)));

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('featuredProducts', 'name price image images slug')
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/blogs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch blogs' },
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
      slug,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
      isPublished,
      seoTitle,
      seoDescription,
      seoKeywords,
      faqs,
      readTimeMinutes,
      featuredProducts,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Article Title and Content are required.' },
        { status: 400 }
      );
    }

    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);

    // Check slug collision
    const existing = await BlogPost.findOne({ slug: finalSlug }).lean();
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const publishedAt = isPublished ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : undefined;

    const newPost = await BlogPost.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || title.trim(),
      content,
      coverImage: coverImage || '',
      author: author?.trim() || 'Pak-o-Drive Editorial',
      category: category?.trim() || 'Car Maintenance',
      tags: Array.isArray(tags) ? tags : [],
      isPublished: Boolean(isPublished),
      publishedAt,
      seoTitle: seoTitle?.trim() || title.trim(),
      seoDescription: seoDescription?.trim() || excerpt?.trim() || '',
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      readTimeMinutes: Number(readTimeMinutes) || Math.max(3, Math.round(content.split(/\s+/).length / 200)),
      featuredProducts: Array.isArray(featuredProducts) ? featuredProducts : [],
    });

    purgeCacheTags(['blog', `blog-${finalSlug}`]);

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/blogs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
