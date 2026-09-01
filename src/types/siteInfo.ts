/**
 * SiteInfo & Branding Domain Types
 */

export interface SiteInfo {
  siteName: string;
  siteTagline: string;
  logoText: string;
  logoIcon: string;
  logoImage: string;
  showLogoImage: boolean;
  favicon: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  phone2: string;
  email: string;
  supportEmail: string;
  website: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;
  mapEmbedUrl: string;
  privacyPolicy: string;
  termsConditions: string;
  returnPolicy: string;
  shippingPolicy: string;
  aboutUs: string;
  newsletterText: string;
  trendingProductLimit: number;
  adminPhones: string;
  copyrightText: string;
}

export type SiteInfoActiveTab = 'general' | 'contact' | 'social' | 'policies' | 'seo';

export interface SiteInfoContextValue {
  info: SiteInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const DEFAULT_SITE_INFO: SiteInfo = {
  siteName: 'PAKODRIVE',
  siteTagline: "Pakistan's Trusted Electronics & Automotive Store",
  logoText: 'PAKODRIVE',
  logoIcon: 'shopping-bag',
  logoImage: '',
  showLogoImage: false,
  favicon: '/favicon.ico',
  seoTitle: 'Pak-o-Drive | Car Accessories & Smart Gadgets Store Pakistan',
  seoDescription: 'Shop premium car ambient lights, chargers, perfumes, and dash cams online in Pakistan with fast Cash on Delivery.',
  seoKeywords: 'car accessories pakistan, ambient light, fast charger, pak-o-drive, cash on delivery',
  address: 'Shop # 12, Main Auto Market, Montgomery Road, Lahore, Pakistan',
  city: 'Lahore',
  country: 'Pakistan',
  phone: '+92 312 3456789',
  phone2: '',
  email: 'support@pakodrive.com',
  supportEmail: 'support@pakodrive.com',
  website: 'https://pakodrive.com',
  whatsapp: '+92 312 3456789',
  facebook: 'https://facebook.com/pakodrive',
  instagram: 'https://instagram.com/pakodrive',
  tiktok: 'https://tiktok.com/@pakodrive',
  twitter: '',
  youtube: 'https://youtube.com/@pakodrive',
  mapEmbedUrl: '',
  privacyPolicy: 'We respect your privacy. Customer contact details are strictly used for delivery and order confirmation purposes.',
  termsConditions: 'By purchasing from Pak-o-Drive, you agree to our standard terms of service. All prices are in PKR including applicable taxes.',
  returnPolicy: 'Easy 7-day return and exchange policy for unused items in original packaging. Cash refund or replacement processed within 48 hours.',
  shippingPolicy: 'Free shipping on all orders above PKR 2,500 across Pakistan via reliable courier services (Leopards / Trax / TCS). Standard delivery time is 2-4 working days.',
  aboutUs: 'Pak-o-Drive is Pakistan’s leading direct-to-consumer store for high-performance automotive accessories, interior gadgets, and smart mobile essentials.',
  newsletterText: 'Subscribe to get special discounts and viral trending updates.',
  trendingProductLimit: 10,
  adminPhones: '03185205667, 03218827748',
  copyrightText: '© 2026 Pak-o-Drive. All rights reserved.',
};
