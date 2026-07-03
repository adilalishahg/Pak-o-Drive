import { cacheLife } from 'next/cache';
import dbConnect from './mongodb';
import SiteInfo from '../models/SiteInfo';
import SiteSettings from '../models/SiteSettings';
import Product from '../models/Product';

export async function getCachedSiteInfo() {
  'use cache';
  cacheLife('hours'); // stale: 5m, revalidate: 1h, expire: 1d
  try {
    await dbConnect();
    const info = await SiteInfo.findOne({}).lean();
    return info ? JSON.parse(JSON.stringify(info)) : null;
  } catch (err) {
    console.error('Error in getCachedSiteInfo:', err);
    return null;
  }
}

export async function getCachedSiteSettings() {
  'use cache';
  cacheLife('hours');
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne({}).lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
  } catch (err) {
    console.error('Error in getCachedSiteSettings:', err);
    return null;
  }
}

export async function getCachedProduct(id: string) {
  'use cache';
  cacheLife('minutes'); // stale: 5m, revalidate: 1m, expire: 1h
  try {
    await dbConnect();
    const p = await Product.findById(id).lean();
    return p ? JSON.parse(JSON.stringify(p)) : null;
  } catch (err) {
    console.error('Error in getCachedProduct:', err);
    return null;
  }
}

export async function getCachedRelatedProducts(category: string, excludeId: string) {
  'use cache';
  cacheLife('minutes');
  try {
    await dbConnect();
    const relatedObj = await Product.find({ category, _id: { $ne: excludeId } }).limit(6).lean();
    return JSON.parse(JSON.stringify(relatedObj));
  } catch (err) {
    console.error('Error in getCachedRelatedProducts:', err);
    return [];
  }
}
