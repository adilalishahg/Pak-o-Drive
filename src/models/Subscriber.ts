import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriberDocument extends Document {
  email: string;
  source: string;          // e.g. 'footer', 'popup', 'checkout', 'manual'
  status: 'active' | 'unsubscribed';
  isCustomer: boolean;     // true once the same email places an order
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriberDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      default: 'footer',   // override at call-site: 'popup' | 'checkout' | etc.
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
    },
    isCustomer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subscriber ||
  mongoose.model<ISubscriberDocument>('Subscriber', SubscriberSchema);
