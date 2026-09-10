import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILinkedInPostLog extends Document {
  topic: string;
  topicNormalized?: string;
  keywords?: string[];
  track: 'agentic-ai' | 'nextjs-react' | 'typescript' | 'cloud-architecture' | 'fullstack-performance';
  caption: string;
  slidesCount: number;
  postId?: string;
  source: 'cron' | 'admin-manual' | 'cli-script';
  isCarousel: boolean;
  status: 'published' | 'failed';
  error?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInPostLogSchema = new Schema<ILinkedInPostLog>(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topicNormalized: {
      type: String,
      trim: true,
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    track: {
      type: String,
      enum: ['agentic-ai', 'nextjs-react', 'typescript', 'cloud-architecture', 'fullstack-performance'],
      default: 'agentic-ai',
      index: true,
    },
    caption: {
      type: String,
      required: true,
    },
    slidesCount: {
      type: Number,
      default: 0,
    },
    postId: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['cron', 'admin-manual', 'cli-script'],
      default: 'cron',
      index: true,
    },
    isCarousel: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['published', 'failed'],
      default: 'published',
      index: true,
    },
    error: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index to quickly query topics and history
LinkedInPostLogSchema.index({ createdAt: -1 });
LinkedInPostLogSchema.index({ status: 1, createdAt: -1 });

export const LinkedInPostLog: Model<ILinkedInPostLog> =
  mongoose.models.LinkedInPostLog || mongoose.model<ILinkedInPostLog>('LinkedInPostLog', LinkedInPostLogSchema);

export default LinkedInPostLog;
