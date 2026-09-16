import Order from '../../models/Order';

/**
 * Resolve dynamic placeholders in reply message
 */
export async function resolveReplyMessage(
  rule: any,
  incomingText: string,
  customerPhone: string
): Promise<string> {
  let reply = rule.replyMessage;

  // Handle dynamic order status lookup
  if (rule.dynamicAction === 'order_status_lookup') {
    try {
      // Search by phone or order ID in incoming text
      const cleanPhone = customerPhone.replace(/^92/, '0');
      const potentialId = incomingText.replace(/[^a-f0-9]/gi, '');
      const queryConditions: any[] = [
        { 'customerDetails.phone': { $regex: cleanPhone.slice(-9) } },
      ];
      if (potentialId.length === 24) {
        queryConditions.push({ _id: potentialId });
      }

      const order = await Order.findOne({
        $or: queryConditions,
      }).sort({ createdAt: -1 });

      if (order) {
        const shortId = order._id?.toString().slice(-8).toUpperCase();
        const itemsSummary = order.items
          .map((i: any) => `• ${i.name} x${i.quantity}`)
          .join('\n');

        reply =
          `Hello ${order.customerDetails.name || 'Valued Customer'}!\n\n` +
          `We found your order record:\n\n` +
          `📋 *Order ID:* #${shortId}\n` +
          `📦 *Status:* *${order.status}*\n` +
          `💰 *Total Amount:* Rs. ${order.totalAmount?.toLocaleString()} (COD)\n` +
          (order.trackingNumber ? `🚚 *Courier Tracking:* ${order.courierName || 'Courier'} (CN: ${order.trackingNumber})\n` : '') +
          `\n*Items:*\n${itemsSummary}\n\n` +
          `For any additional assistance, please reply to this chat.`;
      }
    } catch (err) {
      console.error('Error looking up order for WhatsApp reply:', err);
    }
  }

  return reply;
}
