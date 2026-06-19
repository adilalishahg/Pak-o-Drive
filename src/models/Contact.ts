import mongoose, { Schema, Document } from 'mongoose';

export interface IContactDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read';
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContactDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Read'], default: 'Unread', required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contact || mongoose.model<IContactDocument>('Contact', ContactSchema);
