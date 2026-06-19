import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotionDocument extends Document {
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotionDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    isActive: { type: Boolean, default: true, required: true },
    expiryDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Promotion || mongoose.model<IPromotionDocument>('Promotion', PromotionSchema);
