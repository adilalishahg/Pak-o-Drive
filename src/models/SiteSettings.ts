import mongoose, { Schema, Document } from 'mongoose';

/* ── Homepage section interfaces ─────────────────────────────── */
export interface IHeroBigSection {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

export interface IHeroSmallSection {
  enabled: boolean;
  badge: string;
  title: string;
  highlight: string;
  imageUrl: string;
}

export interface IProductSection {
  enabled: boolean;
  title: string;
  limit: number;
}

export interface IWeeklyDealSection {
  enabled: boolean;
  label: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

export interface IHomepageSections {
  heroBig: IHeroBigSection;
  heroSmall: IHeroSmallSection;
  trendingProducts: IProductSection;
  collections: { enabled: boolean; title: string };
  weeklyDeal: IWeeklyDealSection;
  moreDeals: IProductSection;
  featuredSection: IProductSection;
  valueProps: { enabled: boolean };
}

/* ── Main settings interface ─────────────────────────────────── */
export interface ISiteSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  fontFamily: string;
  fontSizeBase: string;
  borderRadius: string;
  buttonRadius: string;
  cardRadius: string;
  animationsEnabled: boolean;
  glassmorphismEnabled: boolean;
  shadowIntensity: 'none' | 'light' | 'medium' | 'strong';
  navbarStyle: 'dark' | 'light' | 'gradient';
  footerStyle: 'dark' | 'light';
  heroGradientStart: string;
  heroGradientEnd: string;
  iconLibrary: 'fontawesome' | 'material' | 'bootstrap' | 'remix' | 'phosphor';
  siteTagline: string;
  announcementBarText: string;
  announcementBarEnabled: boolean;
  layoutTheme: 'classic' | 'modern-green' | 'theme1';
  homepageSections: IHomepageSections;
  updatedAt?: Date;
}

export interface ISiteSettingsDocument extends ISiteSettings, Document {}

/* ── Sub-schemas ─────────────────────────────────────────────── */
const HeroBigSchema = new Schema({
  enabled:    { type: Boolean, default: true },
  badge:      { type: String,  default: 'Featured Product' },
  title:      { type: String,  default: 'Smart Speakers With Google Assistant' },
  subtitle:   { type: String,  default: 'Experience room-filling sound and intelligent voice assistance. Control your smart home with ease.' },
  buttonText: { type: String,  default: 'Shop Now' },
  buttonLink: { type: String,  default: '/shop' },
  imageUrl:   { type: String,  default: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80' },
}, { _id: false });

const HeroSmallSchema = new Schema({
  enabled:   { type: Boolean, default: true },
  badge:     { type: String,  default: 'Special Discount' },
  title:     { type: String,  default: 'TWS Earbuds' },
  highlight: { type: String,  default: '50% Off' },
  imageUrl:  { type: String,  default: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80' },
}, { _id: false });

const ProductSectionSchema = new Schema({
  enabled: { type: Boolean, default: true },
  title:   { type: String,  default: 'Products' },
  limit:   { type: Number,  default: 4 },
}, { _id: false });

const CollectionsSchema = new Schema({
  enabled: { type: Boolean, default: true },
  title:   { type: String,  default: 'The Top Collections' },
}, { _id: false });

const WeeklyDealSchema = new Schema({
  enabled:     { type: Boolean, default: true },
  label:       { type: String,  default: 'The Big Deal This Week' },
  title:       { type: String,  default: 'Apple iPhone 12 Pro Max 128GB Blue Edition' },
  description: { type: String,  default: 'Get the ultimate photography and performance package. Limited stock available at a special discount.' },
  buttonText:  { type: String,  default: 'Shop Now' },
  buttonLink:  { type: String,  default: '/shop' },
  imageUrl:    { type: String,  default: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=500&q=80' },
}, { _id: false });

const ValuePropsSchema = new Schema({
  enabled: { type: Boolean, default: true },
}, { _id: false });

/* ── Main schema ─────────────────────────────────────────────── */
const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    primaryColor:          { type: String, default: '#ea580c' },
    secondaryColor:        { type: String, default: '#0f172a' },
    accentColor:           { type: String, default: '#3b82f6' },
    successColor:          { type: String, default: '#10b981' },
    fontFamily:            { type: String, default: 'Inter' },
    fontSizeBase:          { type: String, default: '16px' },
    borderRadius:          { type: String, default: '16px' },
    buttonRadius:          { type: String, default: '50px' },
    cardRadius:            { type: String, default: '16px' },
    animationsEnabled:     { type: Boolean, default: true },
    glassmorphismEnabled:  { type: Boolean, default: true },
    shadowIntensity:       { type: String, enum: ['none', 'light', 'medium', 'strong'], default: 'medium' },
    navbarStyle:           { type: String, enum: ['dark', 'light', 'gradient'], default: 'dark' },
    footerStyle:           { type: String, enum: ['dark', 'light'], default: 'dark' },
    heroGradientStart:     { type: String, default: '#fff7ed' },
    heroGradientEnd:       { type: String, default: '#ffffff' },
    iconLibrary:           { type: String, enum: ['fontawesome', 'material', 'bootstrap', 'remix', 'phosphor'], default: 'fontawesome' },
    siteTagline:           { type: String, default: "Pakistan's Trusted Electronics Store" },
    announcementBarText:   { type: String, default: '🎉 Free Shipping on orders above PKR 5,000 | 📦 30-Day Easy Returns | Shop Now →' },
    announcementBarEnabled:{ type: Boolean, default: true },
    layoutTheme:           { type: String, enum: ['classic', 'modern-green', 'theme1'], default: 'classic' },
    homepageSections: {
      heroBig:          { type: HeroBigSchema,       default: () => ({}) },
      heroSmall:        { type: HeroSmallSchema,     default: () => ({}) },
      trendingProducts: { type: ProductSectionSchema, default: () => ({ title: 'Trending Products', limit: 4 }) },
      collections:      { type: CollectionsSchema,   default: () => ({}) },
      weeklyDeal:       { type: WeeklyDealSchema,    default: () => ({}) },
      moreDeals:        { type: ProductSectionSchema, default: () => ({ title: 'More Active Deals', limit: 4 }) },
      featuredSection:  { type: ProductSectionSchema, default: () => ({ title: 'Featured Products', limit: 8, enabled: true }) },
      valueProps:       { type: ValuePropsSchema,    default: () => ({}) },
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);
