import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteInfo {
  // Brand
  siteName: string;
  siteTagline: string;
  logoText: string;
  logoIcon: string;
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
  // Footer newsletter text
  newsletterText: string;
  // Misc
  copyrightText: string;
  updatedAt?: Date;
}

export interface ISiteInfoDocument extends ISiteInfo, Document {}

const SiteInfoSchema = new Schema<ISiteInfoDocument>(
  {
    siteName:       { type: String, default: 'PAKODRIVE' },
    siteTagline:    { type: String, default: "Pakistan's Trusted Electronics Store" },
    logoText:       { type: String, default: 'Electro' },
    logoIcon:       { type: String, default: 'shopping-bag' },
    favicon:        { type: String, default: '/favicon.ico' },
    seoTitle:       { type: String, default: 'PAKODRIVE Electronics — Best Electronics Store in Pakistan' },
    seoDescription: { type: String, default: "PAKODRIVE — Pakistan's trusted electronics store. Shop headphones, chargers, smartwatches, automotive electronics & more with free shipping and 30-day returns." },
    seoKeywords:    { type: String, default: 'electronics Pakistan, buy headphones Pakistan, smartwatches online, chargers cables Pakistan, automotive electronics, PAKODRIVE, online shopping Pakistan' },
    address:        { type: String, default: '123 Street Karachi, Pakistan' },
    city:           { type: String, default: 'Karachi' },
    country:        { type: String, default: 'Pakistan' },
    phone:          { type: String, default: '+0123 456 7890' },
    phone2:         { type: String, default: '' },
    email:          { type: String, default: 'support@pakodrive.com' },
    supportEmail:   { type: String, default: 'support@pakodrive.com' },
    website:        { type: String, default: 'pakodrive.com' },
    whatsapp:       { type: String, default: '+923001234567' },
    facebook:       { type: String, default: '#' },
    instagram:      { type: String, default: '#' },
    twitter:        { type: String, default: '#' },
    youtube:        { type: String, default: '#' },
    mapEmbedUrl: {
      type: String,
      default:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.137684698506!2d67.0601449!3d24.860965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUxJzM5LjUiTiA2N8KwMDMnMzYuNSJFCg!5e0!3m2!1sen!2s!4v1694259649153!5m2!1sen!2s',
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
      default: `## Shipping Policy\n\n### Delivery Areas\nWe deliver nationwide across Pakistan.\n\n### Delivery Time\n- Karachi: 1-2 business days\n- Major cities: 2-3 business days\n- Remote areas: 4-7 business days\n\n### Shipping Charges\n- Free shipping on orders above PKR 5,000\n- Standard shipping: PKR 200 for orders below PKR 5,000\n\n### Tracking\nYou will receive tracking information via WhatsApp once your order is dispatched.`,
    },
    aboutUs: {
      type: String,
      default: `## About PAKODRIVE\n\nPAKODRIVE is Pakistan's trusted electronics store, offering premium quality headphones, chargers, smartwatches, automotive electronics, and mobile accessories at competitive prices.\n\n### Our Mission\nTo make quality electronics accessible to every Pakistani household with honest pricing and excellent after-sales support.\n\n### Why Choose Us\n- 100% genuine products with warranty\n- Nationwide delivery\n- 30-day easy returns\n- 24/7 WhatsApp support\n- 15,000+ happy customers`,
    },
    newsletterText: {
      type: String,
      default: 'Subscribe to get notifications on headphones, chargers, and automotive electronic updates.',
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
