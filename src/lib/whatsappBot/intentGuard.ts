import Order from '../../models/Order';

export const STORE_KEYWORDS = [
  'pakodrive', 'pak-o-Drive', 'order', 'parcel', 'delivery', 'dispatch', 'tracking',
  'cod', 'jazzcash', 'easypaisa', 'wapsi', 'return', 'guarantee', 'warranty', 'rs.', 'pkr',
  'price', 'kitne', 'chahiye', 'lena hai', 'buy karna', 'mehran', 'civic', 'corolla', 'alto',
  'cultus', 'yaris', 'city', 'car', 'gari', 'mirror', 'sheesha', 'light', 'speaker', 'panel',
  'android', 'cover', 'seat', 'mat', 'microfiber', 'spray', 'perfume', 'charger', 'led'
];

/**
 * Check if the sender phone number belongs to excluded personal/family numbers
 */
export function isExcludedNumber(senderPhone: string): boolean {
  const excludedNumbers = (process.env.WHATSAPP_EXCLUDED_NUMBERS || '')
    .split(',')
    .map((s) => s.trim().replace(/[^0-9]/g, ''))
    .filter(Boolean);

  return excludedNumbers.some((n) => senderPhone.includes(n));
}

/**
 * STORE INTENT GUARD (Protect personal chats from bot intervention)
 * Returns true if message or sender indicates store relevance.
 */
export async function checkStoreIntent(messageText: string, senderPhone: string): Promise<boolean> {
  const clean = messageText.toLowerCase().trim();

  const hasStoreSignal =
    STORE_KEYWORDS.some((k) => clean.includes(k.toLowerCase())) ||
    /^(1|2|3|4|0|#menu|menu|start)$/i.test(clean) ||
    clean.includes('http://') ||
    clean.includes('https://');

  if (hasStoreSignal) return true;

  try {
    const cleanPhoneDigits = senderPhone.replace(/^92/, '0');
    const existingOrder = await Order.findOne({
      'customerDetails.phone': { $regex: cleanPhoneDigits.slice(-9) },
    }).lean();

    if (existingOrder) return true;
  } catch {
    // If order lookup fails, fail safely
  }

  return false;
}
