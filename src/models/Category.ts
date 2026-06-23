import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '../types';

export interface ICategoryDocument extends Omit<ICategory, 'id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: 'fas fa-tag' },
    image: { type: String, default: '' },
    productCount: { type: Number, default: 0 },
    parentCategory: { type: String, default: '', index: true },
  },
  {
    timestamps: true,
  }
);

// Map virtual id to _id
CategorySchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

CategorySchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);
