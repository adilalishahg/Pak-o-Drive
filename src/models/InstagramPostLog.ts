import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstagramPostLog extends Document {
  topic: string;
  topicNormalized?: string;
  category: 'viral-ai-tools' | 'tech-hacks' | 'developer-shortcuts' | 'dollar-earning-workflows' | 'future-tech';
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'CAROUSEL' | 'REEL';
  postId?: string;
  permalink?: string;
  source: 'cron' | 'admin-manual' | 'cli-script';
  status: 'published' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramPostLogSchema = new Schema<IInstagramPostLog>(
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
    category: {
      type: String,
      enum: ['viral-ai-tools', 'tech-hacks', 'developer-shortcuts', 'dollar-earning-workflows', 'future-tech'],
      default: 'viral-ai-tools',
      index: true,
    },
    caption: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['IMAGE', 'CAROUSEL', 'REEL'],
      default: 'IMAGE',
    },
    postId: {
      type: String,
      trim: true,
    },
    permalink: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['cron', 'admin-manual', 'cli-script'],
      default: 'cli-script',
      index: true,
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
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during hot reload
const InstagramPostLog: Model<IInstagramPostLog> =
  mongoose.models.InstagramPostLog ||
  mongoose.model<IInstagramPostLog>('InstagramPostLog', InstagramPostLogSchema);

export default InstagramPostLog;
