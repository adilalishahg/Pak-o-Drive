import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    rating: { type: Number, required: true, default: 5 },
    reviewsCount: { type: Number, required: true, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 10 },
    specifications: { type: Map, of: String, default: {} },
    variants: [
      {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        stock: { type: Number, default: 10 },
        image: { type: String, default: '' },
      }
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
