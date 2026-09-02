/**
 * Centralized Constants for Pak-o-Drive E-Commerce Platform
 * Rules: Never hardcode constants inside TSX components/pages. Always import from this file.
 */

export const ORDER_STATUSES = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export type OrderStatusType = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export const PAYMENT_METHODS = {
  COD: 'Cash on Delivery (COD)',
  BANK_TRANSFER: 'Direct Bank Transfer',
  EASYPAISA: 'Easypaisa',
  JAZZCASH: 'JazzCash',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAKISTAN_MAJOR_CITIES = [
  'Rawalpindi',
  'Islamabad',
  'Lahore',
  'Karachi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Gujranwala',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Rahim Yar Khan',
  'Gujrat',
  'Mardan',
  'Kasur',
  'Sahiwal',
  'Okara',
  'Wah Cantt',
  'Attock',
  'Jhelum',
  'Dera Ghazi Khan',
  'Dera Ismail Khan',
  'Mirpur (AJK)',
  'Muzaffarabad (AJK)',
  'Mingora (Swat)',
  'Chiniot',
  'Kamoke',
  'Mandi Bahauddin',
  'Khanewal',
  'Hafizabad',
  'Kohat',
  'Jacobabad',
  'Shikarpur',
  'Muzaffargarh',
  'Khanpur',
  'Gojra',
  'Bahawalnagar',
  'Muridke',
  'Pakpattan',
  'Khuzdar',
  'Dadu',
  'Chaman',
  'Turbat',
  'Gilgit',
  'Skardu',
  'Taxila',
  'Chakwal',
  'Nowshera',
  'Swabi',
  'Mansehra',
  'Kotli (AJK)',
  'Rawalakot (AJK)',
  'Vehari',
  'Burewala',
  'Gwadar',
  'Hub',
  'Zhob',
  'Bannu',
  'Charsadda',
  'Haripur',
  'Bhakkar',
  'Layyah',
  'Tando Adam',
  'Nawabshah (Shaheed Benazirabad)',
  'Mirpur Khas',
  'Khairpur',
  'Other City',
] as const;

export const DEFAULT_SHIPPING_RATES = {
  FREE_SHIPPING_THRESHOLD: 2500, // Free shipping on PKR 2,500+
  STANDARD_DELIVERY_FEE: 199,
  MAJOR_CITIES_ESTIMATE_DAYS: '24-48 Hours',
  OTHER_CITIES_ESTIMATE_DAYS: '2-4 Business Days',
} as const;

export const PAKISTAN_PHONE_REGEX = /^((\+92)|(0092)|(92)|(0))?3[0-9]{2}[-]?[0-9]{7}$/;

export const WHATSAPP_CONFIG = {
  DEFAULT_SUPPORT_NUMBER: '923185205667', // Override in DB / .env
  GREETING_TEMPLATE: (productName?: string, sku?: string, price?: number) => {
    if (productName) {
      return encodeURIComponent(
        `Assalam-o-Alaikum! I am interested in buying *${productName}*${sku ? ` (SKU: ${sku})` : ''}${price ? ` priced at Rs. ${price.toLocaleString()}` : ''}. Please guide me on how to proceed with the order.`
      );
    }
    return encodeURIComponent(
      `Assalam-o-Alaikum! I need assistance regarding an order on Pak-o-Drive.`
    );
  },
};

export const TRUST_BADGES = [
  {
    icon: 'ShieldCheck',
    title: 'Cash on Delivery Available',
    subtitle: 'Pay cash when your parcel arrives at your doorstep',
  },
  {
    icon: 'RotateCcw',
    title: '7-Day Easy Replacement',
    subtitle: 'Hassle-free exchange policy for any issues',
  },
  {
    icon: 'Truck',
    title: 'Nationwide Express Shipping',
    subtitle: 'Fast 24-48 hour delivery to major cities across Pakistan',
  },
  {
    icon: 'MessageCircle',
    title: '24/7 WhatsApp Support',
    subtitle: 'Real human support for tracking and queries',
  },
] as const;

export const RECENT_SALES_NOTIFICATIONS = [
  { customer: 'Hamza K.', city: 'Lahore', product: 'Wireless Earbuds Pro', timeAgo: '2 minutes ago' },
  { customer: 'Ayesha M.', city: 'Karachi', product: '65W GaN Fast Charger', timeAgo: '5 minutes ago' },
  { customer: 'Zeeshan A.', city: 'Islamabad', product: 'Smart Calling Watch', timeAgo: '9 minutes ago' },
  { customer: 'Bilal T.', city: 'Rawalpindi', product: 'Magnetic Car Phone Holder', timeAgo: '14 minutes ago' },
  { customer: 'Usman S.', city: 'Faisalabad', product: 'PD Type-C Fast Cable', timeAgo: '18 minutes ago' },
  { customer: 'Faizan R.', city: 'Multan', product: 'Gaming Bluetooth Headphones', timeAgo: '24 minutes ago' },
  { customer: 'Danish N.', city: 'Peshawar', product: 'Car Dashboard Camera HD', timeAgo: '31 minutes ago' },
  { customer: 'Saad M.', city: 'Sialkot', product: 'Portable Wireless Powerbank', timeAgo: '42 minutes ago' },
];

export const ANALYTICS_TABS = [
  { key: 'revenue', label: 'Revenue & Sales', icon: 'fas fa-chart-line' },
  { key: 'traffic', label: 'Traffic & Devices', icon: 'fas fa-users' },
  { key: 'cities', label: 'City Logistics Map', icon: 'fas fa-map-marker-alt' },
  { key: 'funnel', label: 'Conversion Funnel', icon: 'fas fa-filter' },
  { key: 'market', label: 'Market Intelligence', icon: 'fas fa-brain' },
] as const;

import { SidebarCategory } from '../types/product';

export const DEFAULT_CATEGORIES: SidebarCategory[] = [
  { name: 'Headphones', slug: 'headphones', icon: 'fas fa-headphones-alt', parentCategory: '' },
  { name: 'Chargers & Cables', slug: 'chargers', icon: 'fas fa-bolt', parentCategory: '' },
  { name: 'Automotive', slug: 'automotive', icon: 'fas fa-car', parentCategory: '' },
  { name: 'Smartwatches', slug: 'smartwatches', icon: 'fas fa-clock', parentCategory: '' },
  { name: 'Mobile Accessories', slug: 'accessories', icon: 'fas fa-mobile-alt', parentCategory: '' },
];

export const PAKISTANI_CUSTOMERS = [
  { name: 'Hamza K.', city: 'Lahore' },
  { name: 'Usman A.', city: 'Karachi' },
  { name: 'Zainab B.', city: 'Islamabad' },
  { name: 'Bilal M.', city: 'Rawalpindi' },
  { name: 'Ahmad R.', city: 'Faisalabad' },
  { name: 'Fatima S.', city: 'Multan' },
  { name: 'Ali Raza', city: 'Sialkot' },
  { name: 'Saad N.', city: 'Peshawar' },
  { name: 'Hassan T.', city: 'Gujranwala' },
  { name: 'Ayesha D.', city: 'Hyderabad' },
  { name: 'Kashif M.', city: 'Quetta' },
  { name: 'Zeeshan J.', city: 'Sargodha' },
  { name: 'Mariam E.', city: 'Bahawalpur' },
  { name: 'Danial S.', city: 'Sukkur' },
  { name: 'Shahmeer A.', city: 'Abbottabad' },
];

export const DEFAULT_POPULAR_CITIES: string[] = [
  'Rawalpindi',
  'Islamabad',
  'Lahore',
  'Karachi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Sialkot',
  'Gujranwala',
  'Quetta',
];

export const ORDER_TRACKING_STEPS = ['Pending', 'Processing', 'On the Way', 'Shipped', 'Delivered'] as const;

export const ORDER_STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  Pending:      { color: '#d97706', bg: '#fef3c7', icon: 'fas fa-clock',           label: 'Pending'      },
  Processing:   { color: '#2563eb', bg: '#dbeafe', icon: 'fas fa-cog fa-spin',     label: 'Processing'   },
  'On the Way': { color: '#7c3aed', bg: '#ede9fe', icon: 'fas fa-truck',           label: 'On the Way'   },
  Shipped:      { color: '#0891b2', bg: '#cffafe', icon: 'fas fa-shipping-fast',   label: 'Shipped'      },
  Delivered:    { color: '#16a34a', bg: '#dcfce7', icon: 'fas fa-check-circle',    label: 'Delivered'    },
  Cancelled:    { color: '#dc2626', bg: '#fee2e2', icon: 'fas fa-times-circle',    label: 'Cancelled'    },
};

export function getOrderStepIndex(status: string): number {
  const idx = (ORDER_TRACKING_STEPS as readonly string[]).indexOf(status);
  return idx === -1 ? 0 : idx;
}

export const FLOATING_CART_EXCLUDED_PREFIXES = [
  '/cart',
  '/checkout',
  '/order-confirmation',
  '/product/',
] as const;







