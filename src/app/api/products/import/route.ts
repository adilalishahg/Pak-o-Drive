import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export interface BulkImportProductInput {
  name: string;
  category: string;
  subcategory?: string;
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

// Icon auto-guesser for newly created categories
function guessCategoryIcon(nameOrSlug: string): string {
  const s = nameOrSlug.toLowerCase();
  if (s.includes('car') || s.includes('auto') || s.includes('drive')) return 'fas fa-car';
  if (s.includes('phone') || s.includes('mobile')) return 'fas fa-mobile-alt';
  if (s.includes('charge') || s.includes('cable') || s.includes('wire')) return 'fas fa-bolt';
  if (s.includes('perfume') || s.includes('scent') || s.includes('freshener')) return 'fas fa-spray-can';
  if (s.includes('light') || s.includes('led') || s.includes('ambient') || s.includes('lamp')) return 'fas fa-lightbulb';
  if (s.includes('watch') || s.includes('clock') || s.includes('band')) return 'fas fa-clock';
  if (s.includes('earbud') || s.includes('headphone') || s.includes('audio') || s.includes('speaker') || s.includes('sound')) return 'fas fa-headphones';
  if (s.includes('bike') || s.includes('motor') || s.includes('cycling') || s.includes('helmet') || s.includes('glove')) return 'fas fa-motorcycle';
  if (s.includes('home') || s.includes('kitchen') || s.includes('blender') || s.includes('clean') || s.includes('vacuum')) return 'fas fa-home';
  if (s.includes('trimmer') || s.includes('care') || s.includes('massag') || s.includes('beauty')) return 'fas fa-spa';
  if (s.includes('power') || s.includes('battery')) return 'fas fa-battery-full';
  return 'fas fa-tag';
}

/**
 * Ensures Main Category & Subcategory exist in DB.
 * If either is missing, it creates it on the fly!
 */
async function resolveAndEnsureCategories(catInput?: string, subcatInput?: string, fallbackImage?: string) {
  const catName = (catInput || 'General').trim();
  const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // 1. Find or create Main Category
  let mainCategory = await Category.findOne({
    $or: [{ slug: catSlug }, { name: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
  });

  if (!mainCategory) {
    mainCategory = await Category.create({
      name: catName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug: catSlug,
      icon: guessCategoryIcon(catName),
      image: fallbackImage || '',
      parentCategory: '',
      productCount: 1,
    });
  } else {
    await Category.updateOne({ _id: mainCategory._id }, { $inc: { productCount: 1 } });
  }

  // 2. Find or create Subcategory if provided
  let subCategorySlug = '';
  if (subcatInput && subcatInput.trim()) {
    const subName = subcatInput.trim();
    const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let subCategory = await Category.findOne({
      $or: [{ slug: subSlug }, { name: new RegExp(`^${subName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
    });

    if (!subCategory) {
      subCategory = await Category.create({
        name: subName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: subSlug,
        icon: guessCategoryIcon(subName),
        image: fallbackImage || '',
        parentCategory: mainCategory.slug,
        productCount: 1,
      });
    } else {
      // Ensure it points to this parent if it had no parent
      if (!subCategory.parentCategory) {
        await Category.updateOne({ _id: subCategory._id }, { parentCategory: mainCategory.slug, $inc: { productCount: 1 } });
      } else {
        await Category.updateOne({ _id: subCategory._id }, { $inc: { productCount: 1 } });
      }
    }
    subCategorySlug = subCategory.slug;
  }

  return {
    categorySlug: mainCategory.slug,
    subcategorySlug: subCategorySlug,
  };
}

/**
 * POST /api/products/import
 * Bulk imports products from a JSON array with auto category & subcategory creation.
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

      if (!item.name || item.price === undefined) {
        errors.push(`Row ${i + 1}: Name and Price are required.`);
        continue;
      }

      // Resolve and auto-create category + subcategory
      const { categorySlug, subcategorySlug } = await resolveAndEnsureCategories(
        item.category,
        item.subcategory,
        item.image
      );

      // Format images: ensure proper path resolution
      const resolveImagePath = (img?: string) => {
        if (!img) return '/img/product-1.png';
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
          return img;
        }
        return `/img/${img}`;
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
        category: categorySlug,
        subcategory: subcategorySlug,
        image: primaryImage,
        images: galleryImages,
        video: item.video || '',
        seoTitle: item.seoTitle || `${item.name} — Buy Online in Pakistan | PAKODRIVE`,
        seoDescription: item.seoDescription || item.description?.slice(0, 160) || `Buy ${item.name} at lowest price in Pakistan with Cash on Delivery at PAKODRIVE.`,
        seoKeywords: item.seoKeywords || `${item.name}, ${item.category || ''}, ${item.subcategory || ''}, buy in Pakistan, COD`,
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
      message: `Successfully imported ${createdOrUpdated.length} products with automatic categories!`,
      count: createdOrUpdated.length,
      data: createdOrUpdated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('POST /api/products/import error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

