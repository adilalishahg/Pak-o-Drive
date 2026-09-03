import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignProduct {
  productId: string;
  name: string;
  slug: string;
  image: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent?: number;
}

export interface ICampaignOfferDocument extends Document {
  title: string;
  badge: string;
  subtitle?: string;
  offerType: 'flash_sale' | 'combo_bundle';
  products: ICampaignProduct[];
  bundlePrice?: number;
  bundleOriginalPrice?: number;
  expiryDate?: Date;
  isActive: boolean;
  bgTheme: 'dark_slate' | 'sunset_orange' | 'emerald_gold' | 'midnight_blue';
  ctaText?: string;
  placement: 'below_slider' | 'after_first_category' | 'after_specific_category' | 'middle_promotions' | 'before_why_us';
  targetCategorySlug?: string;
  // UI Display Controls (Admin Managed)
  showCountdownTimer?: boolean;
  showSubtitle?: boolean;
  showSavingsBadge?: boolean;
  showFloatingPrice?: boolean;
  showProductTitle?: boolean;
  showOriginalPrice?: boolean;
  compactMobile?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignProductSchema = new Schema<ICampaignProduct>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, default: '' },
    image: { type: String, default: '/img/product-placeholder.png' },
    originalPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const CampaignOfferSchema = new Schema<ICampaignOfferDocument>(
  {
    title: { type: String, required: true, trim: true },
    badge: { type: String, default: 'LIMITED TIME DEAL', trim: true },
    subtitle: { type: String, default: '', trim: true },
    offerType: {
      type: String,
      enum: ['flash_sale', 'combo_bundle'],
      default: 'flash_sale',
      required: true,
    },
    products: {
      type: [CampaignProductSchema],
      required: true,
      validate: [
        (val: ICampaignProduct[]) => val.length >= 2,
        'Offer must have at least 2 products selected',
      ],
    },
    bundlePrice: { type: Number, default: 0 },
    bundleOriginalPrice: { type: Number, default: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    bgTheme: {
      type: String,
      enum: ['dark_slate', 'sunset_orange', 'emerald_gold', 'midnight_blue'],
      default: 'dark_slate',
    },
    ctaText: { type: String, default: 'Claim Offer Now' },
    placement: {
      type: String,
      enum: ['below_slider', 'after_first_category', 'after_specific_category', 'middle_promotions', 'before_why_us'],
      default: 'below_slider',
    },
    targetCategorySlug: { type: String, default: '' },
    showCountdownTimer: { type: Boolean, default: true },
    showSubtitle: { type: Boolean, default: true },
    showSavingsBadge: { type: Boolean, default: true },
    showFloatingPrice: { type: Boolean, default: true },
    showProductTitle: { type: Boolean, default: true },
    showOriginalPrice: { type: Boolean, default: true },
    compactMobile: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CampaignOffer ||
  mongoose.model<ICampaignOfferDocument>('CampaignOffer', CampaignOfferSchema);
