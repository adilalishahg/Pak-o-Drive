import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteInfo {
  // Brand
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
  // Contact
  address: string;
  city: string;
  country: string;
  phone: string;
  phone2: string;
  email: string;
  supportEmail: string;
  website: string;
  whatsapp: string;
  // Social
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;

  // Map
  mapEmbedUrl: string;
  // Legal content (rich text / markdown)
  privacyPolicy: string;
  termsConditions: string;
  returnPolicy: string;
  shippingPolicy: string;
  aboutUs: string;
  // Misc & Automations
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
  updatedAt?: Date;
}



export interface ISiteInfoDocument extends ISiteInfo, Document { }

const SiteInfoSchema = new Schema<ISiteInfoDocument>(
  {
    siteName: { type: String, default: 'Pak-o-Drive (Pak Drive)' },
    siteTagline: { type: String, default: "Pakistan's #1 Car Accessories, Auto Gadgets & LED Lights Store" },
    logoText: { type: String, default: 'Pak-o-Drive' },
    logoIcon: { type: String, default: 'car' },
    logoImage: { type: String, default: '' },
    showLogoImage: { type: Boolean, default: false },
    favicon: { type: String, default: '/favicon.ico' },
    seoTitle: { type: String, default: "Pak-o-Drive™ (PakDrive) | Pakistan's #1 Car Accessories & Auto Gadgets Store" },
    seoDescription: { type: String, default: "Pak-o-Drive (Pak Drive / PakDrive) is Pakistan's premier online store for car accessories, viral automotive gadgets, LED headlights, ambient lights, solar car perfumes & car care. Fast Cash on Delivery nationwide." },
    seoKeywords: { type: String, default: 'pakdrive, pak drive, pakodrive, pak o drive, pakdrives, pakdrv, car accessories pakistan, car gadgets pakistan, auto accessories pakistan, car lights, car perfume pakistan, automotive store pakistan, پاک او ڈرائیو' },
    brandAliases: {
      type: [String],
      default: [
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
    },
    h1Heading: {
      type: String,
      default: "Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's #1 Car Accessories, Viral Auto Gadgets & LED Lights Store",
    },
    shopSeoTitle: {
      type: String,
      default: "Shop All Car Accessories & Auto Gadgets in Pakistan | Pak-o-Drive (Pak Drive)",
    },
    shopSeoDescription: {
      type: String,
      default: "Browse viral automotive accessories, car LED headlights, interior ambient lighting, solar perfumes, vacuum cleaners & car care on Pak-o-Drive. Cash on Delivery nationwide.",
    },
    aboutSeoTitle: {
      type: String,
      default: "About Pak-o-Drive (Pak Drive) | Pakistan's #1 Car Accessories Brand",
    },
    aboutSeoDescription: {
      type: String,
      default: "Learn about Pak-o-Drive (Pak Drive) — Pakistan's leading automotive accessories and viral car gadgets store. 100% verified quality with nationwide Cash on Delivery.",
    },
    contactSeoTitle: {
      type: String,
      default: "Contact Customer Support | Pak-o-Drive (Pak Drive)",
    },
    contactSeoDescription: {
      type: String,
      default: "Need help with your car accessories order? Contact Pak-o-Drive customer support via WhatsApp or phone 24/7.",
    },
    trackOrderSeoTitle: {
      type: String,
      default: "Track Your Order Status | Pak-o-Drive (Pak Drive)",
    },
    trackOrderSeoDescription: {
      type: String,
      default: "Track your Pak-o-Drive parcel live with real-time courier updates across Pakistan.",
    },
    faqItems: {
      type: [
        {
          question: { type: String, default: '' },
          answer: { type: String, default: '' },
        },
      ],
      default: [
        {
          question: 'What is Pak-o-Drive (Pak Drive)?',
          answer: "Pak-o-Drive (also known as Pak Drive / PakDrive / PakODrive) is Pakistan's premier online automotive accessories & viral car gadgets store, offering premium car accessories, LED lights, ambient lighting, solar perfumes, and car care with fast Cash on Delivery (COD) nationwide.",
        },
        {
          question: 'Does Pak-o-Drive offer Cash on Delivery across Pakistan?',
          answer: 'Yes, Pak-o-Drive offers Cash on Delivery (COD) nationwide across all Pakistani cities including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar.',
        },
        {
          question: 'What products does Pak-o-Drive sell?',
          answer: 'Pak-o-Drive sells viral car gadgets, LED headlights and fog lights, interior ambient RGB lighting, solar rotating car perfumes, wireless car chargers, high-power car vacuums, and car detailing accessories.',
        },
        {
          question: 'How can I contact Pak-o-Drive or order via WhatsApp?',
          answer: 'You can order online directly or contact customer support on WhatsApp at +92 318 5205667 for fast 1-click ordering.',
        },
      ],
    },
    address: { type: String, default: 'Main Muslim Town, Sadiqabad, Rawalpindi, Punjab, Pakistan' },
    city: { type: String, default: 'Rawalpindi' },
    country: { type: String, default: 'Pakistan' },
    phone: { type: String, default: '03185205667' },
    phone2: { type: String, default: '03218827748' },
    email: { type: String, default: 'support@pakodrive.pk' },
    supportEmail: { type: String, default: 'support@pakodrive.pk' },
    website: { type: String, default: 'https://www.pakodrive.pk' },
    whatsapp: { type: String, default: '03185205667' },
    facebook: { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    tiktok: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    youtube: { type: String, default: '#' },

    mapEmbedUrl: {
      type: String,
      default:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13284.629471168434!2d73.0735!3d33.6268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df952136e4f3a7%3A0xb35a09c2dbad7d72!2sMuslim%20Town%2C%20Rawalpindi%2C%20Punjab!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s',
    },
    privacyPolicy: {
      type: String,
      default: `## Privacy Policy\n\nYour privacy is important to us. PAKODRIVE collects only the information necessary to process your orders and improve your shopping experience.\n\n### Information We Collect\n- Name, email, phone number and delivery address when placing orders\n- Browsing data to improve site performance\n\n### How We Use It\n- To process and deliver your orders\n- To send order updates via WhatsApp\n- To improve our products and services\n\n### Data Security\nAll data is stored securely. We do not sell or share your personal information with third parties.\n\n### Contact\nFor privacy concerns, email us at support@pakodrive.com`,
    },
    termsConditions: {
      type: String,
      default: `## Terms & Conditions\n\nBy using PAKODRIVE, you agree to the following terms:\n\n### Orders\n- All orders are subject to product availability\n- Prices are in PKR and inclusive of applicable taxes\n- We reserve the right to cancel orders if payment issues arise\n\n### Cash on Delivery\n- COD orders must be paid in full upon delivery\n- Refusing delivery without valid reason may result in account suspension\n\n### Returns\n- 30-day return policy on all products\n- Items must be in original condition and packaging\n\n### Limitation of Liability\nPAKODRIVE is not liable for indirect or consequential damages arising from use of our products.`,
    },
    returnPolicy: {
      type: String,
      default: `## Return Policy\n\nWe offer a hassle-free **30-day return policy**.\n\n### Eligible Returns\n- Defective or damaged products\n- Wrong item delivered\n- Product not as described\n\n### How to Return\n1. Contact us via WhatsApp or email within 30 days\n2. Share your order ID and reason for return\n3. We will arrange pickup or ask you to ship the item back\n4. Refund or replacement processed within 3-5 business days\n\n### Non-Returnable Items\n- Products damaged due to misuse\n- Items without original packaging after 7 days`,
    },
    shippingPolicy: {
      type: String,
      default: `## Shipping Policy\n\n### Delivery Areas\nWe deliver nationwide across Pakistan with priority fast dispatch from our Rawalpindi fulfillment hub.\n\n### Delivery Timeline\n- **Rawalpindi & Islamabad (Twin Cities):** Same-day / 24 hours (1 business day)\n- **Lahore, Peshawar, Gujranwala, Faisalabad:** 1-2 business days\n- **Karachi, Multan, Sialkot, Quetta & Major Cities:** 2-3 business days\n- **Remote Areas & AJK / Gilgit-Baltistan:** 3-5 business days\n\n### Shipping Charges\n- **Free Shipping** on all orders above PKR 5,000\n- **Standard Flat Delivery:** PKR 199 for orders below PKR 5,000\n\n### Real-Time Tracking\nYou will receive real-time courier tracking via WhatsApp and SMS immediately once your parcel is dispatched from Rawalpindi.`,
    },
    aboutUs: {
      type: String,
      default: `## About Pak-o-Drive (Pak Drive)\n\nPak-o-Drive (Pak Drive / PakODrive) is Pakistan's premier destination for viral automotive accessories, car gadgets, LED headlights, ambient lighting, solar car perfumes, and car care essentials.\n\n### Our Mission\nTo bring the world's most innovative, practical, and viral car gadgets directly to Pakistani car enthusiasts at unbeatable direct-to-consumer prices.\n\n### Why Pakistani Drivers Trust Pak-o-Drive\n- 100% Inspected, premium automotive accessories\n- Reliable Cash on Delivery (COD) across Pakistan\n- Fast Dispatch from Rawalpindi / Twin Cities Hub\n- 24/7 Dedicated WhatsApp Support\n- 25,000+ Satisfied Drivers Nationwide`,
    },
    newsletterText: {
      type: String,
      default: 'Subscribe to get VIP alerts on viral car gadgets, LED lighting deals, and exclusive automotive discounts.',
    },
    trendingProductLimit: {
      type: Number,
      default: 10,
    },
    adminPhones: {
      type: String,
      default: '03185205667, 03218827748',
    },
    copyrightText: {
      type: String,
      default: '© 2026 PAKODRIVE. All rights reserved.',
    },
  },

  { timestamps: true }
);

if (mongoose.models && mongoose.models.SiteInfo) {
  delete mongoose.models.SiteInfo;
}

export default mongoose.models.SiteInfo ||
  mongoose.model<ISiteInfoDocument>('SiteInfo', SiteInfoSchema);
