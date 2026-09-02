import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import Category from '../src/models/Category';
import Product from '../src/models/Product';
import { resolveCategoryIcon, isIconValidInActiveLibrary } from '../src/lib/categoryIconService';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment.');
  process.exit(1);
}

async function runDailySync() {
  console.log('⏰ Starting Daily Automated AI Category & Icon Health Routine...');
  const startTime = Date.now();

  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB.');

    const categories = await Category.find({});
    const products = await Product.find({}).select('name category subcategory').lean();

    console.log(`📊 Found ${categories.length} categories and ${products.length} products.`);

    let updatedCount = 0;
    for (const cat of categories) {
      const cleanName = cat.name.trim();
      const currentIcon = cat.icon || '';

      const isGeneric = !currentIcon || currentIcon === 'fas fa-tag' || currentIcon === 'fas fa-box';
      const isValid = isIconValidInActiveLibrary(currentIcon);

      const accurateIcon = await resolveCategoryIcon(cleanName, isGeneric ? undefined : currentIcon);

      let changed = false;
      if (cat.name !== cleanName) {
        cat.name = cleanName;
        changed = true;
      }

      if (!isValid || isGeneric) {
        cat.icon = accurateIcon;
        changed = true;
      }

      if (changed) {
        await cat.save();
        console.log(`   ✨ Updated "${cat.name}" -> Icon: "${cat.icon}" (was: "${currentIcon}")`);
        updatedCount++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n🎉 Daily icon sync finished in ${duration}ms. ${updatedCount} category records updated.`);

  } catch (err) {
    console.error('❌ Error during daily sync:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runDailySync();
