import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  productId: mongoose.Types.ObjectId;
  orderId?: string;
  userName: string;
  userCity: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedBuyer: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 80,
    },
    userCity: {
      type: String,
      default: 'Pakistan',
      trim: true,
      maxlength: 60,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedBuyer: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);
