import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Parsing parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const isNewArrival = searchParams.get('isNewArrival');
    const isFeatured = searchParams.get('isFeatured');
    const isTopSelling = searchParams.get('isTopSelling');

    // Build query object
    const query: any = {};

    if (category) {
      const subcats = await Category.find({ parentCategory: category });
      if (subcats.length > 0) {
        const slugs = [category, ...subcats.map(c => c.slug)];
        query.category = { $in: slugs };
      } else {
        query.category = category;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (isTopSelling === 'true') {
      query.isTopSelling = true;
    }

    // Pagination parameters
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      success: true, 
      count: products.length, 
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit)
      },
      data: products 
    });
  } catch (error: any) {
    console.error('Error fetching products API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST trigger to create a product OR seed if body/parameters indicate seeding
export async function POST(request: Request) {
  try {
    await dbConnect();

    // Check if there is a JSON body or a seed query parameter
    const url = new URL(request.url);
    const shouldSeed = url.searchParams.get('seed') === 'true';

    let body: any = null;
    try {
      body = await request.json();
    } catch (e) {
      // Body is empty or not JSON, which is fine if we want to trigger seed
    }

    if (body && body.name && body.price !== undefined) {
      // Validate required fields
      const {
        name,
        description,
        price,
        originalPrice,
        category,
        image,
        images,
        video,
        seoTitle,
        seoDescription,
        seoKeywords,
        rating,
        reviewsCount,
        isNewArrival,
        isFeatured,
        isTopSelling,
        stock,
        specifications,
      } = body;

      if (!name || !description || price === undefined || !category || !image) {
        return NextResponse.json(
          { success: false, error: 'Please provide all required fields: name, description, price, category, image.' },
          { status: 400 }
        );
      }

      // Create new product
      const newProduct = new Product({
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : Number(price),
        category: category.toLowerCase().trim(),
        image,
        images: images || [],
        video: video || '',
        seoTitle: seoTitle || '',
        seoDescription: seoDescription || '',
        seoKeywords: seoKeywords || '',
        rating: rating !== undefined ? Number(rating) : 5,
        reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : 0,
        isNewArrival: !!isNewArrival,
        isFeatured: !!isFeatured,
        isTopSelling: !!isTopSelling,
        stock: stock !== undefined ? Number(stock) : 10,
        specifications: specifications || {},
      });

      const saved = await newProduct.save();
      return NextResponse.json({ success: true, message: 'Product created successfully!', data: saved }, { status: 201 });
    }

    // Default to seeding if requested or if no body provided
    const count = await Product.countDocuments();
    if (count > 0 && !shouldSeed) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded. To force seed, pass ?seed=true',
        count,
      });
    }

    const mockProducts = [
      {
        name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        description: 'Industry-leading noise canceling wireless headphones with Alexa built-in. Features auto noise canceling optimizer, crystal clear hands-free calling, and up to 30 hours of battery life.',
        price: 85000,
        originalPrice: 95000,
        category: 'headphones',
        image: '/img/product-3.png',
        rating: 5,
        reviewsCount: 124,
        isNewArrival: true,
        isFeatured: true,
        isTopSelling: true,
        stock: 15,
        specifications: {
          Brand: 'Sony',
          Model: 'WH-1000XM5',
          Color: 'Black',
          Battery: 'Up to 30 hours',
          Connection: 'Bluetooth 5.2',
        },
      },
      {
        name: 'Anker PowerPort III 65W Fast Charger',
        description: 'Compact 3-port wall charger with GaN technology. Charges smartphones, tablets, and USB-C notebooks at top speed. Features dynamic power allocation and safety systems.',
        price: 6800,
        originalPrice: 8500,
        category: 'chargers',
        image: '/img/product-4.png',
        rating: 4,
        reviewsCount: 88,
        isNewArrival: false,
        isFeatured: true,
        isTopSelling: true,
        stock: 40,
        specifications: {
          Brand: 'Anker',
          Ports: '2x USB-C, 1x USB-A',
          Wattage: '65W Max',
          Technology: 'GaN II Fast Charging',
        },
      },
      {
        name: 'Pioneer AVH-Z5250BT Double-DIN Car Media Receiver',
        description: 'High-performance car touchscreen receiver featuring Apple CarPlay, Android Auto, Bluetooth, WebLink, and Full HD playback from USB. Perfect for dashboard entertainment and navigation.',
        price: 49500,
        originalPrice: 55000,
        category: 'automotive',
        image: '/img/product-8.png',
        rating: 5,
        reviewsCount: 42,
        isNewArrival: true,
        isFeatured: true,
        isTopSelling: false,
        stock: 8,
        specifications: {
          Brand: 'Pioneer',
          Screen: '6.8-inch Touchscreen',
          Compatibility: 'Apple CarPlay, Android Auto',
          Features: 'Bluetooth, FLAC Support, Spotify control',
        },
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic',
        description: 'Premium smartwatch with rotation bezel, body composition analysis, sleep tracking, heart rate monitor, and custom workout coaching. Up to 40 hours battery life with fast charging.',
        price: 48000,
        originalPrice: 52000,
        category: 'smartwatches',
        image: '/img/product-2.png',
        rating: 4,
        reviewsCount: 65,
        isNewArrival: true,
        isFeatured: false,
        isTopSelling: true,
        stock: 22,
        specifications: {
          Brand: 'Samsung',
          Size: '43mm',
          OS: 'Wear OS 4',
          Connectivity: 'Bluetooth, Wi-Fi, NFC',
        },
      },
      {
        name: 'Premium USB-C to USB-C Braided Cable 2m',
        description: 'Ultra-durable nylon braided USB-C cable supporting up to 100W Power Delivery (PD) fast charging and 480Mbps data sync speed. Extended strain relief joints prevent fraying.',
        price: 1500,
        originalPrice: 2000,
        category: 'chargers',
        image: '/img/product-12.png',
        rating: 4,
        reviewsCount: 152,
        isNewArrival: false,
        isFeatured: false,
        isTopSelling: true,
        stock: 120,
        specifications: {
          Length: '2 Meters',
          Material: 'Nylon Braided',
          Capacity: '100W Power Delivery',
        },
      },
      {
        name: 'JBL Tune 760NC Over-Ear Wireless ANC Headphones',
        description: 'Active Noise Cancelling wireless over-ear headphones with JBL Pure Bass sound. Lightweight foldable design offers up to 35 hours of battery life with noise canceling on.',
        price: 24500,
        originalPrice: 28000,
        category: 'headphones',
        image: '/img/product-5.png',
        rating: 4,
        reviewsCount: 54,
        isNewArrival: false,
        isFeatured: false,
        isTopSelling: false,
        stock: 30,
        specifications: {
          Brand: 'JBL',
          Type: 'Over-Ear',
          Battery: 'Up to 35 hours ANC',
          Weight: '220g',
        },
      },
      {
        name: 'Xiaomi Mi 37W Dual Port Car Charger',
        description: 'High-speed metal car charger featuring dual USB outputs. Charging port 1 supports 10W and port 2 supports up to 27W fast charging. Compatible with all standard cigarette lighter outlets.',
        price: 2500,
        originalPrice: 3200,
        category: 'automotive',
        image: '/img/product-13.png',
        rating: 5,
        reviewsCount: 97,
        isNewArrival: false,
        isFeatured: true,
        isTopSelling: true,
        stock: 75,
        specifications: {
          Brand: 'Xiaomi',
          Input: '12V-24V',
          Outputs: 'Dual USB ports',
          MaxOutput: '37W Total',
        },
      },
      {
        name: 'SanDisk Ultra Dual Drive Luxe USB Type-C 128GB',
        description: 'All-metal 2-in-1 flash drive with reversible USB Type-C and traditional Type-A connectors. Move content seamlessly between smartphones, tablets, Macs, and computers.',
        price: 3500,
        originalPrice: 4500,
        category: 'accessories',
        image: '/img/product-10.png',
        rating: 4,
        reviewsCount: 201,
        isNewArrival: true,
        isFeatured: false,
        isTopSelling: true,
        stock: 90,
        specifications: {
          Brand: 'SanDisk',
          Capacity: '128GB',
          ReadSpeed: 'Up to 150MB/s',
          Material: 'Metal casing',
        },
      },
    ];

    // Delete existing products if forcing seed
    if (shouldSeed) {
      await Product.deleteMany({});
    }

    const inserted = await Product.insertMany(mockProducts);
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with default electronic products!',
      count: inserted.length,
      data: inserted,
    });
  } catch (error: any) {
    console.error('Error in products POST API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
