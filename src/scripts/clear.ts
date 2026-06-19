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

async function clearDatabase() {
  try {
    console.log('Connecting to database for cleanup...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB.');

    // Drop collections / clear documents
    const collections = ['products', 'categories', 'orders', 'contacts', 'promotions', 'analytics'];
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established.');
    }

    for (const name of collections) {
      try {
        await db.collection(name).deleteMany({});
        console.log(`✓ Cleared collection: ${name}`);
      } catch (err: any) {
        console.log(`- Collection ${name} could not be cleared or does not exist yet.`);
      }
    }

    console.log('Database reset successfully! All mock/dummy data has been removed.');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

clearDatabase();
