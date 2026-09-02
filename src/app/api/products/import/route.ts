import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { purgeCacheTags } from '@/lib/cache';
import dbConnect from '@/lib/mongodb';

import Product from '@/models/Product';
import Category from '@/models/Category';
import { BulkImportProductInput } from '@/types';
import { resolveCategoryIcon, inferCategoryFromProduct, isIconValidInActiveLibrary } from '@/lib/categoryIconService';

/**
 * Ensures Main Category & Subcategory exist in DB.
 * If category is missing in JSON, infers it using product name & AI rules.
 * If category exists but has a generic or invalid icon, auto-heals it to the accurate icon!
 */
async function resolveAndEnsureCategories(
  productName: string,
  productDesc?: string,
  catInput?: string,
  subcatInput?: string,
  fallbackImage?: string
) {
  let catName = (catInput || '').trim();
  let catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let defaultInferredIcon = '';

  // 1. If category is omitted in JSON, infer intelligently from product
  if (!catName || catName.toLowerCase() === 'general' || catName.toLowerCase() === 'all') {
    const inferred = inferCategoryFromProduct(productName, productDesc);
    catName = inferred.name;
    catSlug = inferred.slug;
    defaultInferredIcon = inferred.icon;
  }

  // 2. Find or create Main Category
  let mainCategory = await Category.findOne({
    $or: [{ slug: catSlug }, { name: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
  });

  if (!mainCategory) {
    const verifiedIcon = defaultInferredIcon || (await resolveCategoryIcon(catName));
    mainCategory = await Category.create({
      name: catName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      slug: catSlug,
      icon: verifiedIcon,
      image: fallbackImage || '',
      parentCategory: '',
      productCount: 1,
    });
  } else {
    // Auto-heal existing icon if it's generic ('fas fa-tag', 'fas fa-box') or not in active library
    const currIcon = mainCategory.icon || '';
    if (!isIconValidInActiveLibrary(currIcon) || currIcon === 'fas fa-tag' || currIcon === 'fas fa-box') {
      const accurateIcon = await resolveCategoryIcon(mainCategory.name);
      await Category.updateOne({ _id: mainCategory._id }, { icon: accurateIcon, $inc: { productCount: 1 } });
      mainCategory.icon = accurateIcon;
    } else {
      await Category.updateOne({ _id: mainCategory._id }, { $inc: { productCount: 1 } });
    }
  }

  // 3. Find or create Subcategory if provided
  let subCategorySlug = '';
  if (subcatInput && subcatInput.trim()) {
    const subName = subcatInput.trim();
    const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let subCategory = await Category.findOne({
      $or: [{ slug: subSlug }, { name: new RegExp(`^${subName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
    });

    if (!subCategory) {
      const verifiedSubIcon = await resolveCategoryIcon(subName);
      subCategory = await Category.create({
        name: subName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: subSlug,
        icon: verifiedSubIcon,
        image: fallbackImage || '',
        parentCategory: mainCategory.slug,
        productCount: 1,
      });
    } else {
      const currSubIcon = subCategory.icon || '';
      const accurateSubIcon = (!isIconValidInActiveLibrary(currSubIcon) || currSubIcon === 'fas fa-tag' || currSubIcon === 'fas fa-box')
        ? await resolveCategoryIcon(subCategory.name)
        : currSubIcon;

      await Category.updateOne(
        { _id: subCategory._id },
        {
          parentCategory: subCategory.parentCategory || mainCategory.slug,
          icon: accurateSubIcon,
          $inc: { productCount: 1 },
        }
      );
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

      // Resolve and auto-create or auto-heal category + subcategory
      const { categorySlug, subcategorySlug } = await resolveAndEnsureCategories(
        item.name,
        item.description,
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

    purgeCacheTags(['products', 'categories']);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
    } catch (err) {
      console.warn('Revalidation warning on import:', err);
    }



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

