import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriberDocument extends Document {
  email: string;
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
      lowercase: true 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subscriber || mongoose.model<ISubscriberDocument>('Subscriber', SubscriberSchema);
