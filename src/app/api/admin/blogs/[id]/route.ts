import { NextResponse } from 'next/server';
import { purgeCacheTags } from '@/lib/cache';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import '@/models/Product';
import { generateSlug } from '@/lib/multiAiBlogGenerator';

export const dynamic = 'force-dynamic';

interface ParamsProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: ParamsProps) {
  try {
    await dbConnect();
    const { id } = await params;

    const post = await BlogPost.findById(id)
      .populate('featuredProducts', 'name price image images slug')
      .lean();

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error in GET /api/admin/blogs/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: ParamsProps) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

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

    if (title) post.title = title.trim();
    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt.trim();
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (author !== undefined) post.author = author.trim();
    if (category !== undefined) post.category = category.trim();
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : [];
    if (seoTitle !== undefined) post.seoTitle = seoTitle.trim();
    if (seoDescription !== undefined) post.seoDescription = seoDescription.trim();
    if (seoKeywords !== undefined) post.seoKeywords = Array.isArray(seoKeywords) ? seoKeywords : [];
    if (faqs !== undefined) post.faqs = Array.isArray(faqs) ? faqs : [];
    if (readTimeMinutes !== undefined) post.readTimeMinutes = Number(readTimeMinutes);
    if (featuredProducts !== undefined) post.featuredProducts = featuredProducts;

    // Handle slug update with uniqueness safeguard
    if (slug && slug !== post.slug) {
      const cleanNewSlug = generateSlug(slug);
      const collision = await BlogPost.findOne({ slug: cleanNewSlug, _id: { $ne: id } }).lean();
      post.slug = collision ? `${cleanNewSlug}-${Date.now().toString().slice(-4)}` : cleanNewSlug;
    }

    // Handle published status transition
    if (isPublished !== undefined) {
      if (isPublished && !post.isPublished && !post.publishedAt) {
        post.publishedAt = new Date();
      }
      post.isPublished = Boolean(isPublished);
    }

    await post.save();

    purgeCacheTags(['blog', `blog-${post.slug}`]);

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/blogs/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: ParamsProps) {
  try {
    await dbConnect();
    const { id } = await params;

    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    purgeCacheTags(['blog', `blog-${post.slug}`]);

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/blogs/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
