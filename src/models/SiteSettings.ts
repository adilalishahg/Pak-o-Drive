import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings {
  // Colors
  primaryColor: string;       // e.g. #ea580c
  secondaryColor: string;     // e.g. #0f172a
  accentColor: string;        // e.g. #3b82f6
  successColor: string;       // e.g. #10b981
  // Typography
  fontFamily: string;         // e.g. 'Inter'
  fontSizeBase: string;       // e.g. '16px'
  // Shape
  borderRadius: string;       // e.g. '16px'
  buttonRadius: string;       // e.g. '50px'
  cardRadius: string;         // e.g. '16px'
  // Effects
  animationsEnabled: boolean;
  glassmorphismEnabled: boolean;
  shadowIntensity: 'none' | 'light' | 'medium' | 'strong';
  // Layout
  navbarStyle: 'dark' | 'light' | 'gradient';
  footerStyle: 'dark' | 'light';
  // Gradients
  heroGradientStart: string;
  heroGradientEnd: string;
  // Icons
  iconLibrary: 'fontawesome' | 'material' | 'bootstrap' | 'remix' | 'phosphor';
  // Misc
  siteTagline: string;
  announcementBarText: string;
  announcementBarEnabled: boolean;
  updatedAt?: Date;
}

export interface ISiteSettingsDocument extends ISiteSettings, Document {}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    primaryColor: { type: String, default: '#ea580c' },
    secondaryColor: { type: String, default: '#0f172a' },
    accentColor: { type: String, default: '#3b82f6' },
    successColor: { type: String, default: '#10b981' },
    fontFamily: { type: String, default: 'Inter' },
    fontSizeBase: { type: String, default: '16px' },
    borderRadius: { type: String, default: '16px' },
    buttonRadius: { type: String, default: '50px' },
    cardRadius: { type: String, default: '16px' },
    animationsEnabled: { type: Boolean, default: true },
    glassmorphismEnabled: { type: Boolean, default: true },
    shadowIntensity: {
      type: String,
      enum: ['none', 'light', 'medium', 'strong'],
      default: 'medium',
    },
    navbarStyle: { type: String, enum: ['dark', 'light', 'gradient'], default: 'dark' },
    footerStyle: { type: String, enum: ['dark', 'light'], default: 'dark' },
    heroGradientStart: { type: String, default: '#fff7ed' },
    heroGradientEnd: { type: String, default: '#ffffff' },
    iconLibrary: {
      type: String,
      enum: ['fontawesome', 'material', 'bootstrap', 'remix', 'phosphor'],
      default: 'fontawesome',
    },
    siteTagline: { type: String, default: "Pakistan's Trusted Electronics Store" },
    announcementBarText: {
      type: String,
      default: '🎉 Free Shipping on orders above PKR 5,000 | 📦 30-Day Easy Returns | Shop Now →',
    },
    announcementBarEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);
