import { Document, Types } from 'mongoose';
import { IProduct } from './product';

export type BlogHubType = 'auto' | 'general';

export interface IBlogPost {
  _id?: string | Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  hub?: BlogHubType;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date | string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  faqs?: { question: string; answer: string }[];
  readTimeMinutes?: number;
  featuredProducts?: (Types.ObjectId | IProduct | any)[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IBlogPostDocument extends Omit<IBlogPost, '_id'>, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogListResult {
  posts: IBlogPost[];
  total: number;
  page: number;
  totalPages: number;
  hub?: BlogHubType | 'all';
}
