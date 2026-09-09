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
    `Hello ${order.customerDetails.name}!\n\n` +
    `Thank you for shopping with *${SITE_NAME}*. We have received your Cash on Delivery (COD) order.\n\n` +
    `*Order ID:* #${order._id?.toString().substring(18).toUpperCase()}\n` +
    `*Items:*\n${itemsText}\n\n` +
    `*Total Bill:* Rs. ${order.totalAmount.toLocaleString()} (Free Nationwide Delivery)\n` +
    `*Delivery Address:* ${order.customerDetails.address}, ${order.customerDetails.city}\n\n` +
    `📦 *Order Confirmation:*\n` +
    `Please reply with *"CONFIRM"* to fast-track your dispatch today.\n\n` +
    `Best regards,\n*${SITE_NAME} Team*`
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
    `Hello ${order.customerDetails.name}!\n\n` +
    `Great news! Your *${SITE_NAME}* order has been dispatched.\n\n` +
    `*Courier:* ${courierName}\n` +
    `*Tracking / CN Number:* ${trackingNumber}\n` +
    `*Total COD Amount:* Rs. ${order.totalAmount.toLocaleString()}\n\n` +
    `🚚 *Live Parcel Tracking:*\n${trackingUrl}\n\n` +
    `The courier delivery rider will contact you prior to delivery. Please keep the exact cash amount ready.\n\n` +
    `If you have any questions, feel free to reply directly to our WhatsApp Helpline.`
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
    `Hello ${customerName || 'Valued Customer'}!\n\n` +
    `You left items in your shopping cart at *${SITE_NAME}* (Total: Rs. ${cartTotal.toLocaleString()}).\n\n` +
    `🔥 *Exclusive Offer:* Complete your order now and enjoy an extra *10% OFF*!\n` +
    `👉 Use Promo Code: *PAKO10*\n\n` +
    `Click here to complete your checkout:\n${checkoutUrl}\n\n` +
    `Nationwide Cash on Delivery & 7-Day Replacement Guarantee included.`
  );

  return `https://wa.me/${formattedPhone}?text=${text}`;
}
