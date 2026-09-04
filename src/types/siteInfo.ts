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
  // Dynamic Route & Knowledge Graph SEO
  brandAliases?: string[];
  h1Heading?: string;
  shopSeoTitle?: string;
  shopSeoDescription?: string;
  aboutSeoTitle?: string;
  aboutSeoDescription?: string;
  contactSeoTitle?: string;
  contactSeoDescription?: string;
  trackOrderSeoTitle?: string;
  trackOrderSeoDescription?: string;
  faqItems?: Array<{ question: string; answer: string }>;
}

export type SiteInfoActiveTab = 'general' | 'contact' | 'social' | 'policies' | 'seo';

export interface SiteInfoContextValue {
  info: SiteInfo;
  loading: boolean;
  error?: string | null;
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
  brandAliases: [
    'Pak Drive',
    'Pak-o-Drive',
    'PakODrive',
    'PakDrive',
    'Pak Drives',
    'pakdriv',
    'pakdrv',
    'Pak Drive Store',
    'Pak-o-Drive Pakistan',
    'پاک او ڈرائیو',
  ],
  h1Heading: "Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's #1 Car Accessories, Viral Auto Gadgets & LED Lights Store",
  shopSeoTitle: 'Shop Car Accessories & Auto Gadgets in Pakistan | Pak-o-Drive (Pak Drive)',
  shopSeoDescription: 'Browse all viral car accessories, LED headlights, ambient lighting, car perfumes, vacuum cleaners, and car care on Pak-o-Drive (Pak Drive). Cash on Delivery nationwide.',
  aboutSeoTitle: "About Pak-o-Drive (Pak Drive) | Pakistan's #1 Car Accessories Brand",
  aboutSeoDescription: "Learn about Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's leading automotive accessories and viral car gadgets brand. Nationwide Cash On Delivery, premium quality and 24/7 customer support.",
  contactSeoTitle: 'Contact Customer Support | Pak-o-Drive (Pak Drive)',
  contactSeoDescription: 'Need help with your car accessories order? Contact Pak-o-Drive (Pak Drive) customer support via WhatsApp, phone, or email. We are available 24/7.',
  trackOrderSeoTitle: 'Track Your Order Status | Pak-o-Drive (Pak Drive)',
  trackOrderSeoDescription: 'Track your Pak-o-Drive parcel in real time. Enter your Order ID and phone number to see live courier tracking and delivery status.',
};
