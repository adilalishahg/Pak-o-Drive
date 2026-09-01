import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../models/Category';
import Product from '../../../models/Product';

const DEFAULT_TAXONOMY = [

  // 1. Mobile & Smart Tech
  { name: 'Mobile & Smart Tech', slug: 'mobile-tech', icon: 'fas fa-mobile-alt', parentCategory: '' },
  { name: 'Fast Chargers & Cables', slug: 'fast-chargers-cables', icon: 'fas fa-bolt', parentCategory: 'mobile-tech' },
  { name: 'Power Banks & Battery Packs', slug: 'power-banks', icon: 'fas fa-battery-full', parentCategory: 'mobile-tech' },
  { name: 'Wireless Earbuds & Audio', slug: 'earbuds-audio', icon: 'fas fa-headphones', parentCategory: 'mobile-tech' },
  { name: 'Smartwatches & Bands', slug: 'smartwatches', icon: 'fas fa-clock', parentCategory: 'mobile-tech' },
  { name: 'Mobile Mounts & Tripods', slug: 'mounts-tripods', icon: 'fas fa-camera', parentCategory: 'mobile-tech' },

  // 2. Car & Automotive
  { name: 'Car Accessories', slug: 'car-accessories', icon: 'fas fa-car', parentCategory: '' },
  { name: 'Interior Styling & Ambient Lights', slug: 'car-interior-lights', icon: 'fas fa-lightbulb', parentCategory: 'car-accessories' },
  { name: 'Car Perfumes & Fresheners', slug: 'car-perfumes-fresheners', icon: 'fas fa-spray-can', parentCategory: 'car-accessories' },
  { name: 'Car Care & Detailing', slug: 'car-care-detailing', icon: 'fas fa-soap', parentCategory: 'car-accessories' },
  { name: 'Dash Cams & Car Electronics', slug: 'car-electronics-dashcams', icon: 'fas fa-video', parentCategory: 'car-accessories' },
  { name: 'Exterior Protection & Body Covers', slug: 'car-exterior-covers', icon: 'fas fa-shield-alt', parentCategory: 'car-accessories' },

  // 3. Bikes & Motorcycling
  { name: 'Bikes & Motorcycling', slug: 'bikes-motorcycling', icon: 'fas fa-motorcycle', parentCategory: '' },
  { name: 'Bike Mobile Mounts & Chargers', slug: 'bike-mounts-chargers', icon: 'fas fa-compass', parentCategory: 'bikes-motorcycling' },
  { name: 'Riding Gloves & Safety Gear', slug: 'riding-gloves-gear', icon: 'fas fa-mitten', parentCategory: 'bikes-motorcycling' },
  { name: 'Bike LED Lights & Horns', slug: 'bike-led-lights', icon: 'fas fa-sun', parentCategory: 'bikes-motorcycling' },
  { name: 'Security Locks & Alarms', slug: 'bike-security-locks', icon: 'fas fa-lock', parentCategory: 'bikes-motorcycling' },

  // 4. Home & Kitchen Smart Gadgets
  { name: 'Home & Kitchen Gadgets', slug: 'home-kitchen-gadgets', icon: 'fas fa-home', parentCategory: '' },
  { name: 'Smart LED & Sensor Lights', slug: 'smart-sensor-lights', icon: 'fas fa-magic', parentCategory: 'home-kitchen-gadgets' },
  { name: 'Portable Blenders & Mixers', slug: 'portable-blenders', icon: 'fas fa-blender', parentCategory: 'home-kitchen-gadgets' },
  { name: 'Mini Vacuums & Cleaning Tools', slug: 'mini-vacuums', icon: 'fas fa-broom', parentCategory: 'home-kitchen-gadgets' },
  { name: 'Kitchen & Wardrobe Organizers', slug: 'kitchen-organizers', icon: 'fas fa-boxes', parentCategory: 'home-kitchen-gadgets' },

  // 5. Personal Care & Daily Lifestyle
  { name: 'Personal Care & Lifestyle', slug: 'personal-care-lifestyle', icon: 'fas fa-user-check', parentCategory: '' },
  { name: 'Electric Shavers & Trimmers', slug: 'shavers-trimmers', icon: 'fas fa-cut', parentCategory: 'personal-care-lifestyle' },
  { name: 'Body Massagers & Health Aids', slug: 'body-massagers', icon: 'fas fa-heartbeat', parentCategory: 'personal-care-lifestyle' },
  { name: 'Thermal Bottles & Smart Mugs', slug: 'thermal-smart-bottles', icon: 'fas fa-mug-hot', parentCategory: 'personal-care-lifestyle' },
  { name: 'EDC Pocket Multi-Tools', slug: 'edc-multi-tools', icon: 'fas fa-tools', parentCategory: 'personal-care-lifestyle' },
];

export async function GET() {
  try {
    await dbConnect();

    const [categories, categoryCounts, subcategoryCounts] = await Promise.all([
      Category.find({}).sort({ parentCategory: 1, name: 1 }).lean(),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Product.aggregate([
        { $match: { subcategory: { $exists: true, $ne: '' } } },
        { $group: { _id: '$subcategory', count: { $sum: 1 } } }
      ])
    ]);

    const countMap: Record<string, number> = {};
    categoryCounts.forEach((c: any) => {
      if (c._id) {
        countMap[c._id] = (countMap[c._id] || 0) + c.count;
      }
    });
    subcategoryCounts.forEach((c: any) => {
      if (c._id) {
        countMap[c._id] = (countMap[c._id] || 0) + c.count;
      }
    });

    const populatedCategories = categories.map((cat: any) => ({
      ...cat,
      productCount: countMap[cat.slug] ?? countMap[cat.name] ?? cat.productCount ?? 0,
    }));

    // Build hierarchical tree
    const parentCats = populatedCategories.filter((c: any) => !c.parentCategory);
    const childCats = populatedCategories.filter((c: any) => Boolean(c.parentCategory));

    const tree = parentCats.map((parent: any) => {
      const children = childCats.filter(
        (child: any) => child.parentCategory === parent.slug || child.parentCategory === parent.name
      );
      const totalProducts = (parent.productCount || 0) + children.reduce((sum: number, ch: any) => sum + (ch.productCount || 0), 0);
      return {
        ...parent,
        totalProductCount: totalProducts,
        children,
        subcategories: children,
      };
    });

    return NextResponse.json({
      success: true,
      count: populatedCategories.length,
      data: populatedCategories,
      tree,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
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

    // Handle Seed action
    if (body.action === 'seed_defaults') {
      let createdCount = 0;
      for (const item of DEFAULT_TAXONOMY) {
        const exists = await Category.findOne({ slug: item.slug });
        if (!exists) {
          await Category.create({
            name: item.name,
            slug: item.slug,
            icon: item.icon,
            parentCategory: item.parentCategory,
            productCount: 0,
          });
          createdCount++;
        }
      }
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${createdCount} default categories & subcategories!`,
        createdCount,
      });
    }

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

    const productCount = await Product.countDocuments({
      $or: [{ category: cleanSlug }, { subcategory: cleanSlug }]
    });

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

