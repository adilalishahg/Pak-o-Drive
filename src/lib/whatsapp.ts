import { IOrder } from '../types';
import { getCourierTrackingUrl } from './couriers';
import { CourierProvider } from './couriers/types';

const SITE_NAME = 'PAKODRIVE';

/**
 * Format Pakistani phone number to standard wa.me format (923XXXXXXXXX)
 */
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

/**
 * 1. Order Verification / Confirmation Template (Prevents Fake Orders & Drops RTO)
 */
export function generateOrderConfirmationWhatsAppLink(order: IOrder): string {
  const phone = formatWhatsAppPhone(order.customerDetails.phone);
  const itemsText = order.items
    .map(i => `• ${i.name}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity} (Rs. ${(i.price * i.quantity).toLocaleString()})`)
    .join('\n');

  const text = encodeURIComponent(
    `السلام علیکم ${order.customerDetails.name} صاحب!\n\n` +
    `Aapka *${SITE_NAME}* par Cash On Delivery order receive ho gaya hai.\n\n` +
    `*Order ID:* #${order._id?.toString().substring(18).toUpperCase()}\n` +
    `*Items:*\n${itemsText}\n\n` +
    `*Total Bill:* Rs. ${order.totalAmount.toLocaleString()} (Free Delivery)\n` +
    `*Address:* ${order.customerDetails.address}, ${order.customerDetails.city}\n\n` +
    `📦 *Parcel dispatch karne ke liye reply karein:*\n` +
    `👉 "CONFIRM" likh kar send karein taake parcel aaj hi dispatch ho sake.\n\n` +
    `Shukriya, ${SITE_NAME} Team.`
  );

  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * 2. Dispatch Tracking Notification Template
 */
export function generateDispatchTrackingWhatsAppLink(
  order: IOrder,
  courierName: CourierProvider,
  trackingNumber: string
): string {
  const phone = formatWhatsAppPhone(order.customerDetails.phone);
  const trackingUrl = getCourierTrackingUrl(courierName, trackingNumber);

  const text = encodeURIComponent(
    `السلام علیکم ${order.customerDetails.name}!\n\n` +
    `🎉 Mubarak ho! Aapka *${SITE_NAME}* order dispatch ho chuka hai.\n\n` +
    `*Courier:* ${courierName}\n` +
    `*Tracking / CN Number:* ${trackingNumber}\n` +
    `*Total COD Amount:* Rs. ${order.totalAmount.toLocaleString()}\n\n` +
    `🚚 *Live Parcel Tracking Link:*\n${trackingUrl}\n\n` +
    `Courier rider delivery se pehle aapko call karega. Baraye meharbani cash ready rakhein.\n\n` +
    `Kisi bhi maslay ki soorat me hamare WhatsApp Helpline par rabta karein.`
  );

  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * 3. Abandoned Cart Recovery Template (with 10% Discount)
 */
export function generateAbandonedCartRecoveryWhatsAppLink(
  phone: string,
  customerName: string,
  cartTotal: number,
  checkoutUrl: string
): string {
  const formattedPhone = formatWhatsAppPhone(phone);

  const text = encodeURIComponent(
    `السلام علیکم ${customerName || 'Dear Customer'}!\n\n` +
    `Aapka *${SITE_NAME}* cart checkout ke liye tayyar hai (Total: Rs. ${cartTotal.toLocaleString()}).\n\n` +
    `🔥 *Special Offer:* Abhi order complete karne par *10% OFF* hasil karein!\n` +
    `👉 Promo Code: *PAKO10*\n\n` +
    `Yahan click karke apna order complete karein:\n${checkoutUrl}\n\n` +
    `Nationwide Cash On Delivery & 7-Day Replacement Guarantee available.`
  );

  return `https://wa.me/${formattedPhone}?text=${text}`;
}
