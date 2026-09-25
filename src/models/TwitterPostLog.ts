import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITwitterPostLog extends Document {
  topic: string;
  topicNormalized?: string;
  keywords?: string[];
  track: 'agentic-ai' | 'nextjs-react' | 'typescript' | 'cloud-architecture' | 'fullstack-performance' | 'fullstack-architecture' | 'trading-tech';
  tweets: string[];
  tweetId?: string;
  tweetUrl?: string;
  source: 'cron' | 'admin-manual' | 'cli-script';
  isThread: boolean;
  status: 'published' | 'failed' | 'simulated';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TwitterPostLogSchema = new Schema<ITwitterPostLog>(
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
      enum: ['agentic-ai', 'nextjs-react', 'typescript', 'cloud-architecture', 'fullstack-performance', 'fullstack-architecture', 'trading-tech'],
      default: 'nextjs-react',
      index: true,
    },
    tweets: {
      type: [String],
      required: true,
    },
    tweetId: {
      type: String,
      trim: true,
    },
    tweetUrl: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['cron', 'admin-manual', 'cli-script'],
      default: 'cron',
      index: true,
    },
    isThread: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'failed', 'simulated'],
      default: 'published',
      index: true,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

TwitterPostLogSchema.index({ createdAt: -1 });
TwitterPostLogSchema.index({ status: 1, createdAt: -1 });

export const TwitterPostLog: Model<ITwitterPostLog> =
  mongoose.models.TwitterPostLog || mongoose.model<ITwitterPostLog>('TwitterPostLog', TwitterPostLogSchema);

export default TwitterPostLog;
