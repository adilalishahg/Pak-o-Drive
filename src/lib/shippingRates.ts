/**
 * Pakistan Courier & Zone-Based Delivery Fee Engine
 * Hub: Rawalpindi / Islamabad Fulfillment Center
 * Dynamic rates with Smart Subsidies:
 * - Twin Cities: FREE
 * - Punjab / KPK: Rs. 200 (100% FREE on Rs. 5,000+)
 * - Sindh (Karachi, Sukkur): Rs. 300 (50% OFF = Rs. 150 on Rs. 5,000+, 100% FREE on Rs. 8,000+)
 * - Balochistan & Remote: Rs. 350 (50% OFF = Rs. 175 on Rs. 5,000+, 100% FREE on Rs. 8,000+)
 */

export interface ShippingZoneInfo {
  zone: string;
  originalRate: number;
  rate: number;
  discountApplied: boolean;
  discountMessage?: string;
  deliveryTime: string;
  courier: string;
  amountNeededForDiscount?: number;
}

// Normalized city groups
export const TWIN_CITIES = ['rawalpindi', 'islamabad', 'wah cantt', 'taxila'];

export const SINDH_CITIES = [
  'karachi',
  'sukkur',
  'hyderabad',
  'larkana',
  'shikarpur',
  'jacobabad',
  'dadu',
  'tando adam',
  'nawabshah',
  'nawabshah (shaheed benazirabad)',
  'mirpur khas',
  'khairpur',
];

export const PUNJAB_KPK_CITIES = [
  'lahore',
  'faisalabad',
  'peshawar',
  'multan',
  'gujranwala',
  'sialkot',
  'gujrat',
  'abbottabad',
  'sargodha',
  'sheikhupura',
  'jhang',
  'rahim yar khan',
  'mardan',
  'kasur',
  'sahiwal',
  'okara',
  'attock',
  'jhelum',
  'dera ghazi khan',
  'dera ismail khan',
  'chiniot',
  'kamoke',
  'mandi bahauddin',
  'khanewal',
  'hafizabad',
  'kohat',
  'muzaffargarh',
  'khanpur',
  'gojra',
  'bahawalnagar',
  'muridke',
  'pakpattan',
  'chakwal',
  'nowshera',
  'swabi',
  'mansehra',
  'vehari',
  'burewala',
  'bannu',
  'charsadda',
  'haripur',
  'bhakkar',
  'layyah',
];

export const REMOTE_BALOCHISTAN_AJK_CITIES = [
  'quetta',
  'khuzdar',
  'chaman',
  'turbat',
  'gwadar',
  'hub',
  'zhob',
  'mirpur (ajk)',
  'muzaffarabad (ajk)',
  'kotli (ajk)',
  'rawalakot (ajk)',
  'mingora (swat)',
  'gilgit',
  'skardu',
];

export const BASE_SHIPPING_RATES = {
  TWIN_CITIES: 0,        // Free (Local Hub Dispatch)
  PUNJAB_KPK: 200,       // Rs. 200 (Standard TCS / Leopard)
  SINDH: 300,            // Rs. 300 (Sindh - Sukkur, Karachi, Hyderabad via TCS/Trax)
  REMOTE: 350,           // Rs. 350 (Balochistan / AJK / Northern Areas)
  DEFAULT: 250,          // Rs. 250 (Fallback for other cities)
};

export function calculateDeliveryFee(cityName?: string | null, cartTotal: number = 0): ShippingZoneInfo {
  if (!cityName || !cityName.trim()) {
    return {
      zone: 'Select City',
      originalRate: 0,
      rate: 0,
      discountApplied: false,
      deliveryTime: '2-4 business days',
      courier: 'TCS / Leopards / Trax',
    };
  }

  const clean = cityName.trim().toLowerCase();

  // 1. Twin Cities (Always Free)
  if (TWIN_CITIES.some((c) => clean.includes(c) || c.includes(clean))) {
    return {
      zone: 'Twin Cities (Local Hub)',
      originalRate: 0,
      rate: 0,
      discountApplied: false,
      deliveryTime: 'Same-day / 24 hours',
      courier: 'Pak-o-Drive Rider / Local Dispatch',
    };
  }

  // 2. Sindh (Karachi, Sukkur, Hyderabad)
  if (SINDH_CITIES.some((c) => clean.includes(c) || c.includes(clean))) {
    const base = BASE_SHIPPING_RATES.SINDH;
    if (cartTotal >= 8000) {
      return {
        zone: 'Sindh (South Zone)',
        originalRate: base,
        rate: 0,
        discountApplied: true,
        discountMessage: '🎉 VIP Offer (Rs. 8,000+): 100% FREE Delivery across Sindh!',
        deliveryTime: '2-3 business days',
        courier: 'TCS / Trax Express COD',
      };
    }
    if (cartTotal >= 5000) {
      return {
        zone: 'Sindh (South Zone)',
        originalRate: base,
        rate: 150,
        discountApplied: true,
        discountMessage: '🎉 Rs. 5,000+ Special: 50% OFF Courier Delivery (Saved Rs. 150)',
        deliveryTime: '2-3 business days',
        courier: 'TCS / Trax Express COD',
      };
    }
    const needed = 5000 - cartTotal;
    return {
      zone: 'Sindh (South Zone)',
      originalRate: base,
      rate: base,
      discountApplied: false,
      discountMessage: needed > 0 ? `Add Rs. ${needed.toLocaleString()} more to get 50% OFF Delivery!` : undefined,
      amountNeededForDiscount: needed > 0 ? needed : undefined,
      deliveryTime: '2-3 business days',
      courier: 'TCS / Trax Express COD',
    };
  }

  // 3. Punjab & KPK Hubs
  if (PUNJAB_KPK_CITIES.some((c) => clean.includes(c) || c.includes(clean))) {
    const base = BASE_SHIPPING_RATES.PUNJAB_KPK;
    if (cartTotal >= 5000) {
      return {
        zone: 'Punjab & KPK Hubs',
        originalRate: base,
        rate: 0,
        discountApplied: true,
        discountMessage: '🎉 Rs. 5,000+ Order: 100% FREE Nationwide Delivery!',
        deliveryTime: '1-2 business days',
        courier: 'TCS / Leopards Courier',
      };
    }
    const needed = 5000 - cartTotal;
    return {
      zone: 'Punjab & KPK Hubs',
      originalRate: base,
      rate: base,
      discountApplied: false,
      discountMessage: needed > 0 ? `Add Rs. ${needed.toLocaleString()} more for 100% FREE Delivery!` : undefined,
      amountNeededForDiscount: needed > 0 ? needed : undefined,
      deliveryTime: '1-2 business days',
      courier: 'TCS / Leopards Courier',
    };
  }

  // 4. Balochistan & Remote / AJK
  if (REMOTE_BALOCHISTAN_AJK_CITIES.some((c) => clean.includes(c) || c.includes(clean))) {
    const base = BASE_SHIPPING_RATES.REMOTE;
    if (cartTotal >= 8000) {
      return {
        zone: 'Balochistan & Remote / AJK',
        originalRate: base,
        rate: 0,
        discountApplied: true,
        discountMessage: '🎉 VIP Offer (Rs. 8,000+): 100% FREE Delivery!',
        deliveryTime: '3-5 business days',
        courier: 'TCS / Leopards Air Cargo',
      };
    }
    if (cartTotal >= 5000) {
      return {
        zone: 'Balochistan & Remote / AJK',
        originalRate: base,
        rate: 175,
        discountApplied: true,
        discountMessage: '🎉 Rs. 5,000+ Special: 50% OFF Air Courier (Saved Rs. 175)',
        deliveryTime: '3-5 business days',
        courier: 'TCS / Leopards Air Cargo',
      };
    }
    const needed = 5000 - cartTotal;
    return {
      zone: 'Balochistan & Remote / AJK',
      originalRate: base,
      rate: base,
      discountApplied: false,
      discountMessage: needed > 0 ? `Add Rs. ${needed.toLocaleString()} more to get 50% OFF Delivery!` : undefined,
      amountNeededForDiscount: needed > 0 ? needed : undefined,
      deliveryTime: '3-5 business days',
      courier: 'TCS / Leopards Air Cargo',
    };
  }

  // 5. Fallback Default
  const base = BASE_SHIPPING_RATES.DEFAULT;
  if (cartTotal >= 8000) {
    return {
      zone: 'Standard Nationwide Delivery',
      originalRate: base,
      rate: 0,
      discountApplied: true,
      discountMessage: '🎉 VIP Offer: 100% FREE Delivery!',
      deliveryTime: '2-4 business days',
      courier: 'TCS / Trax Express',
    };
  }
  if (cartTotal >= 5000) {
    return {
      zone: 'Standard Nationwide Delivery',
      originalRate: base,
      rate: 125,
      discountApplied: true,
      discountMessage: '🎉 Rs. 5,000+ Special: 50% OFF Delivery',
      deliveryTime: '2-4 business days',
      courier: 'TCS / Trax Express',
    };
  }
  const needed = 5000 - cartTotal;
  return {
    zone: 'Standard Nationwide Delivery',
    originalRate: base,
    rate: base,
    discountApplied: false,
    discountMessage: needed > 0 ? `Add Rs. ${needed.toLocaleString()} more for 50% OFF Delivery!` : undefined,
    amountNeededForDiscount: needed > 0 ? needed : undefined,
    deliveryTime: '2-4 business days',
    courier: 'TCS / Trax Express',
  };
}
