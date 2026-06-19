import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

// Product Schema Definition for the script
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, required: true, default: 5 },
  reviewsCount: { type: Number, required: true, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isTopSelling: { type: Boolean, default: false },
  stock: { type: Number, required: true, default: 10 },
  specifications: { type: Map, of: String, default: {} },
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const productsToSeed = [
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

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB.');

    // Clear existing products to ensure clean seed
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const result = await Product.insertMany(productsToSeed);
    console.log(`Successfully seeded ${result.length} electronic products.`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
