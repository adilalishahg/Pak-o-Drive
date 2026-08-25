import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export interface BulkImportProductInput {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  shortDescription?: string;
  video?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  isTopSelling?: boolean;
  isNewArrival?: boolean;
  specifications?: Record<string, string>;
  variants?: Array<{
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    stock?: number;
    image?: string;
  }>;
}

/**
 * POST /api/products/import
 * Bulk imports products from a JSON array with auto-category creation and image path resolution.
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const rawProducts: BulkImportProductInput[] = Array.isArray(body)
      ? body
      : body.products && Array.isArray(body.products)
      ? body.products
      : [body];

    if (!rawProducts || rawProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No product data provided for import.' },
        { status: 400 }
      );
    }

    const createdOrUpdated: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawProducts.length; i++) {
      const item = rawProducts[i];

      if (!item.name || !item.price) {
        errors.push(`Row ${i + 1}: Name and Price are required.`);
        continue;
      }

      const categoryName = (item.category || 'General').trim();
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Ensure category exists
      let existingCategory = await Category.findOne({
        $or: [{ slug: categorySlug }, { name: new RegExp(`^${categoryName}$`, 'i') }],
      });

      if (!existingCategory) {
        existingCategory = await Category.create({
          name: categoryName,
          slug: categorySlug,
          icon: 'fas fa-box',
          image: item.image || '',
          productCount: 1,
        });
      } else {
        await Category.updateOne({ _id: existingCategory._id }, { $inc: { productCount: 1 } });
      }

      // Format images: ensure proper path resolution if relative filename provided
      const resolveImagePath = (img?: string) => {
        if (!img) return '/img/product-placeholder.png';
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
          return img;
        }
        return `/product-imports/${img}`;
      };

      const primaryImage = resolveImagePath(item.image);
      const galleryImages = (item.images || []).map(resolveImagePath);
      if (galleryImages.length === 0 && primaryImage) {
        galleryImages.push(primaryImage);
      }

      const originalPrice = item.originalPrice && item.originalPrice > item.price
        ? item.originalPrice
        : Math.round(item.price * 1.35); // Default 35% mark up if omitted

      const productPayload = {
        name: item.name.trim(),
        description: item.description || item.name,
        price: Number(item.price),
        originalPrice: Number(originalPrice),
        category: existingCategory.slug,
        image: primaryImage,
        images: galleryImages,
        video: item.video || '',
        seoTitle: item.seoTitle || `${item.name} — Buy Online in Pakistan | PAKODRIVE`,
        seoDescription: item.seoDescription || item.description?.slice(0, 160) || `Buy ${item.name} at lowest price in Pakistan with Cash on Delivery at PAKODRIVE.`,
        seoKeywords: item.seoKeywords || `${item.name}, ${categoryName}, buy in Pakistan, COD`,
        rating: Number(item.rating || 5),
        reviewsCount: Number(item.reviewsCount || Math.floor(Math.random() * 20) + 5),
        isNewArrival: item.isNewArrival ?? true,
        isFeatured: item.isFeatured ?? true,
        isTopSelling: item.isTopSelling ?? false,
        stock: Number(item.stock ?? 25),
        specifications: item.specifications || {},
        variants: item.variants || [],
      };

      // Upsert: Match by name (case-insensitive) or create new
      const saved = await Product.findOneAndUpdate(
        { name: new RegExp(`^${item.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { $set: productPayload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      createdOrUpdated.push(saved);
    }

    revalidatePath('/', 'layout');
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdOrUpdated.length} products!`,
      count: createdOrUpdated.length,
      data: createdOrUpdated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('POST /api/products/import error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
