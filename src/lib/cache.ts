import mongoose from 'mongoose';
import { cache } from 'react';
import dbConnect from './mongodb';
import SiteInfo from '../models/SiteInfo';
import SiteSettings from '../models/SiteSettings';
import Product from '../models/Product';
import Category from '../models/Category';


export const getCachedSiteInfo = cache(async () => {
  try {
    await dbConnect();
    const info = await SiteInfo.findOne({}).lean();
    return info ? JSON.parse(JSON.stringify(info)) : null;
  } catch (err) {
    console.error('Error in getCachedSiteInfo:', err);
    return null;
  }
});

export const getCachedSiteSettings = cache(async () => {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne({}).lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : null;
  } catch (err) {
    console.error('Error in getCachedSiteSettings:', err);
    return null;
  }
});

export const getCachedProduct = cache(async (idOrSlug: string) => {

  try {
    await dbConnect();
    if (!idOrSlug) return null;
    let p = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    if (isObjectId) {
      p = await Product.findById(idOrSlug).lean();
    }
    if (!p) {
      p = await Product.findOne({ slug: idOrSlug }).lean();
    }
    return p ? JSON.parse(JSON.stringify(p)) : null;
  } catch (err) {
    console.error('Error in getCachedProduct:', err);
    return null;
  }
});


export const getCachedRelatedProducts = cache(async (category: string, excludeId: string) => {
  try {
    await dbConnect();
    const relatedObj = await Product.find({ category, _id: { $ne: excludeId } }).limit(6).lean();
    return JSON.parse(JSON.stringify(relatedObj));
  } catch (err) {
    console.error('Error in getCachedRelatedProducts:', err);
    return [];
  }
});

export const getCachedAllProducts = cache(async () => {
  try {
    await dbConnect();
    const list = await Product.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(list));
  } catch (err) {
    console.error('Error in getCachedAllProducts:', err);
    return [];
  }
});

export const getCachedAllCategories = cache(async () => {
  try {
    await dbConnect();
    const list = await Category.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(list));
  } catch (err) {
    console.error('Error in getCachedAllCategories:', err);
    return [];
  }
});
