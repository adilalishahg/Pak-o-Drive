import dbConnect from './mongodb';
import SiteInfo from '../models/SiteInfo';
import Order from '../models/Order';
import WhatsAppBotManager from './whatsappBot/engine';
import { IntelligenceReportPayload } from './intelligenceEngine';

export function normalizePakistaniPhoneNumber(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('03')) {
    return '92' + clean.substring(1);
  }
  if (clean.startsWith('3')) {
    return '92' + clean;
  }
  if (clean.startsWith('923')) {
    return clean;
  }
  return clean;
}

export function getAdminWhatsAppNumber(): string {
  const envNum = process.env.ADMIN_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  return normalizePakistaniPhoneNumber(envNum);
}

/**
 * Format rich Pakistani WhatsApp alert message for new web order
 */
export function formatOrderWhatsAppMessage(order: any): string {
  const shortId = order._id?.toString().slice(-8).toUpperCase() || 'NEW';
  const total = Number(order.totalAmount || 0);

  const itemsList = (order.items || [])
    .map((item: any) => `• *${item.name}* ${item.variantName ? `(${item.variantName})` : ''} (x${item.quantity}) — Rs. ${Number(item.price || 0).toLocaleString()}`)
    .join('\n');

  const customer = order.customerDetails || {};

  return (
    `🛒 *NAYA ORDER RECEIVE HUA HAI!* 🚀\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Order ID:* #${shortId}\n` +
    `💰 *Total Amount:* Rs. ${total.toLocaleString()} (Cash On Delivery)\n` +
    `📦 *Total Items:* ${order.items?.length || 1}\n\n` +
    `👤 *Customer Details:*\n` +
    `• *Name:* ${customer.name || 'Customer'}\n` +
    `• *Phone:* ${customer.phone || 'N/A'}\n` +
    `• *City:* ${customer.city || 'N/A'}\n` +
    `• *Address:* ${customer.address || 'N/A'}\n` +
    (customer.notes ? `• *Note:* ${customer.notes}\n` : '') +
    `\n🛍️ *Ordered Products:*\n` +
    `${itemsList}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `🕒 *Time:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}\n` +
    `🌐 *Source:* Web Checkout (${order.utmSource || 'Direct'})\n` +
    `👉 *Admin Order Link:* https://pakodrive.com/admin/orders`
  );
}

/**
 * Format WhatsApp digest for Daily Viral Trends & Winning Products
 */
export function formatTrendsWhatsAppDigest(report: IntelligenceReportPayload): string {
  const trends = report.topTrends || [];
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  let trendsSummary = '';
  trends.slice(0, 4).forEach((t, idx) => {
    trendsSummary +=
      `\n${idx + 1}️⃣ *${t.productName}*\n` +
      `• 📈 *Platform:* ${t.platform} (Demand: ${t.estimatedDemandScore}%)\n` +
      `• 🎯 *Hook:* "${t.viralHook?.verbalHookUrdu || t.viralHook?.textOnScreen}"\n` +
      `• 💰 *Pricing:* Sell Rs. ${t.suggestedRetailPricePKR?.toLocaleString()} | Profit: *Rs. ${t.estimatedProfitMarginPKR?.toLocaleString()}/order*\n` +
      `• 🎬 *Angle:* ${t.competitorAdAngle}\n`;
  });

  return (
    `🔥 *PAK-O-DRIVE DAILY VIRAL TRENDS & AD BRIEF* 🚀\n` +
    `📅 *Date:* ${dateStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 *Market Insight:* ${report.marketSummary}\n\n` +
    `🏆 *TOP WINNING PRODUCTS & HOOKS TODAY:*` +
    trendsSummary +
    `\n━━━━━━━━━━━━━━━━━━━━━\n` +
    `📥 *Full Video Shot Lists & Scripts:* https://pakodrive.com/admin/trending-intelligence`
  );
}

/**
 * Instant dispatch of New Order alert to Admin's WhatsApp
 */
export async function sendAdminOrderNotification(order: any): Promise<boolean> {
  try {
    const adminPhone = getAdminWhatsAppNumber();
    if (!adminPhone) {
      console.warn('[WhatsAppNotification] No admin phone number found.');
      return false;
    }

    const message = formatOrderWhatsAppMessage(order);
    const bot = WhatsAppBotManager.getInstance();

    if (bot.state.status === 'CONNECTED') {
      const sent = await bot.sendTextMessage(adminPhone, message);
      if (sent && order._id) {
        await dbConnect();
        await Order.updateOne({ _id: order._id }, { $set: { whatsappSent: true } });
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[WhatsAppNotification] Failed to send admin order alert:', err);
    return false;
  }
}

/**
 * Dispatch Daily Trends Digest to Admin's WhatsApp
 */
export async function sendAdminDailyTrendsDigest(report: IntelligenceReportPayload): Promise<boolean> {
  try {
    const adminPhone = getAdminWhatsAppNumber();
    if (!adminPhone) return false;

    const message = formatTrendsWhatsAppDigest(report);
    const bot = WhatsAppBotManager.getInstance();

    if (bot.state.status === 'CONNECTED') {
      return await bot.sendTextMessage(adminPhone, message);
    }
    return false;
  } catch (err) {
    console.error('[WhatsAppNotification] Failed to send trends digest:', err);
    return false;
  }
}
