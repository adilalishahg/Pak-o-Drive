import mongoose, { Schema } from 'mongoose';
import { IBlogPostDocument } from '../types/blog';

const BlogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, required: true, maxlength: 300, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    author: { type: String, default: 'Pak-o-Drive Team', trim: true },
    category: { type: String, default: 'Car Maintenance', trim: true, index: true },
    hub: { type: String, enum: ['auto', 'general'], default: 'auto', index: true },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    readTimeMinutes: { type: Number, default: 5 },
    featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
BlogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
BlogPostSchema.index({ isPublished: 1, publishedAt: -1, createdAt: -1 });
BlogPostSchema.index({ hub: 1, isPublished: 1, publishedAt: -1 });

export default mongoose.models.BlogPost ||
  mongoose.model<IBlogPostDocument>('BlogPost', BlogPostSchema);
