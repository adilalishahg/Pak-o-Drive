import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocialAccount extends Document {
  platform: 'linkedin' | 'instagram';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  accountUrn: string; // e.g. "urn:li:person:abcdef" or Instagram Page ID
  accountName?: string;
  isActive: boolean;
  lastPostedAt?: Date;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialAccountSchema = new Schema<ISocialAccount>(
  {
    platform: {
      type: String,
      enum: ['linkedin', 'instagram'],
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    accountUrn: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastPostedAt: {
      type: Date,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const SocialAccount: Model<ISocialAccount> =
  mongoose.models.SocialAccount || mongoose.model<ISocialAccount>('SocialAccount', SocialAccountSchema);

export default SocialAccount;
