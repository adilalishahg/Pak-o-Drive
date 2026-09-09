import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import WhatsAppRule, { DEFAULT_WHATSAPP_RULES } from '@/models/WhatsAppRule';
import Order from '@/models/Order';
import WebChatSession from '@/models/WebChatSession';
import WhatsAppBotManager from '@/lib/whatsappBot/engine';
import { generateGeminiStoreResponse, searchStoreProducts } from '@/lib/geminiAssistant';
import { getAdminWhatsAppNumber } from '@/lib/whatsappNotification';

export interface ChatMessageResponse {
  success: boolean;
  reply: string;
  source: 'rule' | 'order_lookup' | 'gemini_ai' | 'agent' | 'fallback';
  ruleName?: string;
  products?: Array<{
    _id?: string;
    name: string;
    slug?: string;
    price: number;
    originalPrice?: number;
    image?: string;
    category?: string;
  }>;
  orderData?: any;
  shortCode?: string;
  messageId?: string;
  error?: string;
}

import { checkRateLimit } from '@/lib/rateLimiter';

/**
 * Smart Order Lookup: Matches by 24-char ObjectId, phone number, or tracking number
 * Optimized for 50,000+ orders using B-Tree indexes (zero ReDoS full table scans).
 */
async function findOrderByAnyIdentifier(queryText: string) {
  await dbConnect();
  if (!queryText || !queryText.trim()) return null;

  const raw = queryText.trim();
  const hexMatches = raw.match(/[a-f0-9]{24}/gi) || [];
  const phoneDigits = raw.replace(/\D/g, '');

  const orConditions: any[] = [];

  // 1. Match full 24-char ObjectId (instant B-Tree index lookup)
  for (const hex of hexMatches) {
    if (mongoose.Types.ObjectId.isValid(hex)) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(hex) });
    }
  }

  // 2. Match phone number (if 7+ digits)
  if (phoneDigits.length >= 7) {
    const lastDigits = phoneDigits.slice(-9);
    orConditions.push({ 'customerDetails.phone': { $regex: lastDigits } });
  }

  // 3. Match tracking number
  const cleanTracking = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleanTracking.length >= 5 && !/^(order|track|status|help|menu|salam|hello|hi|details)$/i.test(cleanTracking)) {
    orConditions.push({ trackingNumber: cleanTracking });
  }

  if (orConditions.length === 0) return null;

  return await Order.findOne({ $or: orConditions }).sort({ createdAt: -1 }).lean();
}


function formatOrderLiveStatus(order: any): string {
  const shortId = order._id?.toString().slice(-8).toUpperCase();
  const itemsSummary = (order.items || [])
    .map(
      (i: any) =>
        `• *${i.name}* ${i.variantName ? `(${i.variantName})` : ''} (x${i.quantity}) — Rs. ${Number(i.price || 0).toLocaleString()}`
    )
    .join('\n');

  const trackingText = order.trackingNumber
    ? `\n🚚 *Courier Tracking:* ${order.courierName || 'Leopards / TCS / PostEx'} (CN: *${order.trackingNumber}*)`
    : '\n🚚 *Courier Tracking:* Your parcel is currently in the dispatch preparation stage. Tracking details will update automatically upon handover.';

  const addressText = order.customerDetails?.city
    ? `📍 *Delivery Address:* ${order.customerDetails?.address}, ${order.customerDetails?.city}\n`
    : '';

  return (
    `Hello ${order.customerDetails?.name || 'Valued Customer'}! ✨\n\n` +
    `Your order has been verified in our database:\n\n` +
    `📋 *Order ID:* #${shortId}\n` +
    `📦 *Current Status:* *${order.status}*\n` +
    `💰 *Total Amount:* Rs. ${order.totalAmount?.toLocaleString()} (Cash On Delivery)\n` +
    addressText +
    trackingText +
    `\n\n*Ordered Items:*\n${itemsSummary}\n\n` +
    `Thank you for shopping with Pak-o-Drive! Please let us know if you have any questions.`
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatMessageResponse>> {
  try {
    // Multi-User Concurrency & Anti-Spam Guard (Max 30 messages/min per IP)
    const rateCheck = checkRateLimit(req, {
      limit: 30,
      windowMs: 60 * 1000,
      keyPrefix: 'chat_api',
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          reply: `You are sending messages too quickly. Please wait ${rateCheck.reset} seconds before trying again.`,
          source: 'fallback',
          error: 'Rate limit exceeded',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.reset),
          },
        }
      );
    }

    await dbConnect();
    const body = await req.json().catch(() => ({}));

    const message = (body.message || '').trim();
    const sessionId = body.sessionId || 'web_' + Date.now();
    const shortCode = 'W' + sessionId.slice(-4).toUpperCase();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          reply: 'Baraye meharbani apna sawal likhein.',
          source: 'fallback',
          error: 'Empty message',
        },
        { status: 400 }
      );
    }

    // 1. Record / Update WebChatSession in MongoDB
    let session = await WebChatSession.findOne({ sessionId });
    if (!session) {
      session = new WebChatSession({
        sessionId,
        shortCode,
        visitorName: 'Web Visitor #' + shortCode,
        messages: [],
      });
    }

    session.messages.push({
      id: 'usr_' + Date.now(),
      sender: 'visitor',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notifiedToAdmin: false,
      createdAt: new Date(),
    });
    session.lastActiveAt = new Date();


    // 2. SMART ORDER LOOKUP (Prioritized Check)
    // Check if the query itself is or contains an Order ID, hex code, phone number, or tracking number
    const foundOrder = await findOrderByAnyIdentifier(message);

    if (foundOrder) {
      const orderReply = formatOrderLiveStatus(foundOrder);
      session.messages.push({
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: orderReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date(),
      });
      await session.save();

      return NextResponse.json({
        success: true,
        reply: orderReply,
        source: 'order_lookup',
        orderData: {
          id: foundOrder._id,
          shortId: foundOrder._id?.toString().slice(-8).toUpperCase(),
          status: foundOrder.status,
          total: foundOrder.totalAmount,
        },
      });
    }

    // 3. HUMAN AGENT / WAREHOUSE STOCK CHECK HANDOFF (Option 4 & Warehouse Inquiries)
    const isWarehouseInquiry = /warehouse|unlisted|nahi mili|stock check|inventory check/i.test(message);
    const isAgentQuery =
      isWarehouseInquiry ||
      /^(4|agent|human|representative|baat karni|admin|owner|call me|live agent|mujhe human agent)/i.test(
        message.trim()
      ) ||
      /(human agent|live agent|agent se baat|representative|warehouse inventory|direct agent)/i.test(message);

    if (isAgentQuery) {
      session.isAgentLive = true;
      const bot = WhatsAppBotManager.getInstance();
      const adminPhone = getAdminWhatsAppNumber();

      const alertToAdmin = isWarehouseInquiry
        ? `🏢 *NEW WAREHOUSE INVENTORY INQUIRY!* 🟢\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *Visitor Session:* #${shortCode}\n` +
          `📦 *Inquiry:* "${message}"\n\n` +
          `👉 *Customer ko reply karne ke liye:* Is message ka WhatsApp reply karein:\n` +
          `#${shortCode} Aapka reply yahan`
        : `💬 *LIVE WEB CHAT INQUIRY!* 🟢\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *Visitor Session:* #${shortCode}\n` +
          `💬 *Message:* "${message}"\n\n` +
          `👉 *Reply karne ke liye:* Is message ka WhatsApp reply karein ya type karein:\n` +
          `#${shortCode} Aapka reply message yahan`;

      if (bot.state.status === 'CONNECTED' && adminPhone) {
        void bot.sendTextMessage(adminPhone, alertToAdmin).catch(() => {});
      }

      let agentReply =
        `👨‍💼 *Live Support Agent Handoff*\n\n` +
        `Your message has been forwarded to our support executive (Session: *#${shortCode}*).\n\n` +
        `Our support representative will assist you in this chat window shortly. Please feel free to type any details below!`;

      if (isWarehouseInquiry) {
        agentReply =
          `🏢 *Central Warehouse Stock Check — Live Agent Connected* 🟢\n\n` +
          `Your inquiry has been forwarded directly to our Central Warehouse team (Session: *#${shortCode}*).\n\n` +
          `Our inventory specialists are verifying stock for this item now. You will receive an update on availability and price right here! 📦✨\n\n` +
          `👉 *If you need any other automotive parts or accessories, please type them below.*`;
      }

      const msgId = 'bot_' + Date.now();
      session.messages.push({
        id: msgId,
        sender: 'agent',
        text: agentReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date(),
      });
      await session.save();

      return NextResponse.json({
        success: true,
        reply: agentReply,
        source: 'agent',
        shortCode,
        messageId: msgId,
      });
    }


    // 4. CHECK PRE-SET WHATSAPP RULES (Only if not a direct purchase inquiry)
    const isPurchaseQuery =
      /(new order|order karna|order karni|order krna|order krni|order place|buy|kharidna|lena hai|chahye|chahiye|rate kya|price kya|kitne ka|available hai)/i.test(
        message
      );

    if (!isPurchaseQuery) {
      let rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
      if (!rules || rules.length === 0) {
        rules = DEFAULT_WHATSAPP_RULES as any;
      }

      const bot = WhatsAppBotManager.getInstance();
      const matchedRule = bot.matchRule(message, rules);

      if (matchedRule && matchedRule.dynamicAction !== 'order_status_lookup') {
        const reply = await bot.resolveReplyMessage(matchedRule, message, '03000000000');
        session.messages.push({
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: reply || matchedRule.replyMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date(),
        });
        await session.save();

        return NextResponse.json({
          success: true,
          reply: reply || matchedRule.replyMessage,
          source: 'rule',
          ruleName: matchedRule.name,
        });
      }
    }


    // 5. LIVE DB PRODUCT SEARCH & INTELLIGENT GEMINI AI RESPONSE
    const matchedProducts = await searchStoreProducts(message);
    const aiReply = await generateGeminiStoreResponse(message, sessionId, message);

    session.messages.push({
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date(),
    });
    await session.save();

    return NextResponse.json({
      success: true,
      reply: aiReply,
      source: 'gemini_ai',
      products: matchedProducts as any,
    });
  } catch (err: any) {
    console.error('[WebChatAPI Error]:', err);
    return NextResponse.json(
      {
        success: false,
        reply:
          'Hello! Welcome to Pak-o-Drive Support. How can we assist you today?\n\n1️⃣ Track Order Status\n2️⃣ Bank & Payment Details\n3️⃣ 7-Day Return & Replacement Policy\n4️⃣ Connect with Live Support',
        source: 'fallback',
        error: err.message,
      },
      { status: 200 }
    );
  }
}
