/**
 * Pak-o-Drive Standalone 24/7 WhatsApp Auto-Responder Bot Worker
 * Runs as an always-on background process (Local PC, VPS, Render.com, Railway)
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';

// Load environment variables (.env / .env.local)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakodrive';
const AUTH_DIR = path.join(process.cwd(), '.whatsapp_auth');

// Schema definitions for standalone worker
const WhatsAppRuleSchema = new mongoose.Schema(
  {
    name: String,
    triggerType: { type: String, default: 'contains' },
    keywords: [String],
    replyMessage: String,
    dynamicAction: { type: String, default: 'none' },
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: Number,
    paymentMethod: String,
    status: String,
    courierName: String,
    trackingNumber: String,
  },
  { timestamps: true }
);

const WhatsAppRule = mongoose.models.WhatsAppRule || mongoose.model('WhatsAppRule', WhatsAppRuleSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Paused contacts (Human Agent Handoff)
const pausedContacts: Record<string, number> = {};

async function connectDatabase() {
  try {
    console.log('[DB] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('[DB] Connected to MongoDB successfully.');
  } catch (err) {
    console.error('[DB] Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

function matchRule(text: string, rules: any[]) {
  const clean = text.toLowerCase().trim();
  const words = clean.split(/[\s,?.!#@_+\-:]+/).filter(Boolean);

  for (const rule of rules) {
    if (!rule.keywords || rule.keywords.length === 0) continue;

    const hasMatch = rule.keywords.some((rawK: string) => {
      if (!rawK) return false;
      const k = rawK.toLowerCase().trim();
      if (!k) return false;

      if (k.length <= 2) {
        return clean === k || words.includes(k);
      }
      if (rule.triggerType === 'exact') {
        return clean === k;
      }
      if (rule.triggerType === 'contains') {
        return clean === k || words.includes(k) || (k.length >= 4 && clean.includes(k));
      }
      if (rule.triggerType === 'regex') {
        try {
          return new RegExp(k, 'i').test(clean);
        } catch {
          return false;
        }
      }
      return false;
    });

    if (hasMatch) return rule;
  }

  return rules.find((r) => r.triggerType === 'default');
}

async function resolveReplyMessage(rule: any, incomingText: string, customerPhone: string): Promise<string> {
  let reply = rule.replyMessage;

  if (rule.dynamicAction === 'order_status_lookup') {
    try {
      const cleanPhone = customerPhone.replace(/^92/, '0');
      const potentialId = incomingText.replace(/[^a-f0-9]/gi, '');
      const queryConditions: any[] = [
        { 'customerDetails.phone': { $regex: cleanPhone.slice(-9) } },
      ];
      if (potentialId.length === 24) {
        queryConditions.push({ _id: potentialId });
      }

      const order = await Order.findOne({ $or: queryConditions }).sort({ createdAt: -1 });

      if (order) {
        const shortId = order._id?.toString().slice(-8).toUpperCase();
        const itemsSummary = (order.items || [])
          .map((i: any) => `• ${i.name} x${i.quantity}`)
          .join('\n');

        reply =
          `السلام علیکم ${order.customerDetails?.name || ''}!\n\n` +
          `Aapka order record mil gaya hai:\n\n` +
          `📋 *Order ID:* #${shortId}\n` +
          `📦 *Status:* *${order.status}*\n` +
          `💰 *Total Amount:* Rs. ${order.totalAmount?.toLocaleString()} (COD)\n` +
          (order.trackingNumber ? `🚚 *Courier Tracking:* ${order.courierName || 'Courier'} (CN: ${order.trackingNumber})\n` : '') +
          `\n*Items:*\n${itemsSummary}\n\n` +
          `Kisi bhi mazeed maloomat ke liye hum se rabta karein.`;
      }
    } catch (err) {
      console.error('[Worker] Error looking up order:', err);
    }
  }

  return reply;
}

async function startWhatsAppWorker() {
  await connectDatabase();

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] as any }));

  console.log('====================================================');
  console.log('  🚀 Pak-o-Drive 24/7 WhatsApp Auto-Responder Bot  ');
  console.log('====================================================');

  const socket = makeWASocket({
    version,
    auth: authState,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Pak-o-Drive Bot', 'Node.js', '1.0.0'],
    syncFullHistory: false,
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', (update: any) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 Scan this QR Code with your WhatsApp (Linked Devices):\n');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('Waiting for scan...\n');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`[WhatsApp] Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startWhatsAppWorker, 4000);
      } else {
        console.log('[WhatsApp] Logged out. Delete .whatsapp_auth folder and restart to re-scan.');
      }
    } else if (connection === 'open') {
      const userJid = socket.user?.id || '';
      const phone = userJid.split(':')[0] || userJid.split('@')[0];
      console.log(`\n🟢 [WhatsApp Bot is ONLINE & Active 24/7] Connected as: ${phone}\n`);
    }
  });

  socket.ev.on('messages.upsert', async (m: any) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid?.endsWith('@g.us')) continue;

      try {
        const senderJid = msg.key.remoteJid;
        if (!senderJid) continue;

        const senderPhone = senderJid.split('@')[0];

        // 🛑 Whitelist check: Ignore personal / family excluded numbers
        const excludedNumbers = (process.env.WHATSAPP_EXCLUDED_NUMBERS || '')
          .split(',')
          .map((s) => s.trim().replace(/[^0-9]/g, ''))
          .filter(Boolean);
        if (excludedNumbers.some((n) => senderPhone.includes(n))) {
          continue;
        }

        const messageText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          '';

        if (!messageText.trim()) continue;

        // 🛑 Store intent guard: protect personal / family chats
        const clean = messageText.toLowerCase().trim();
        const storeKeywords = [
          'pakodrive', 'pak-o-drive', 'order', 'parcel', 'delivery', 'dispatch', 'tracking',
          'cod', 'jazzcash', 'easypaisa', 'wapsi', 'return', 'guarantee', 'warranty', 'rs.', 'pkr',
          'price', 'kitne', 'chahiye', 'lena hai', 'buy karna', 'mehran', 'civic', 'corolla', 'alto',
          'cultus', 'yaris', 'city', 'car', 'gari', 'mirror', 'sheesha', 'light', 'speaker', 'panel',
          'android', 'cover', 'seat', 'mat', 'microfiber', 'spray', 'perfume', 'charger', 'led'
        ];

        const hasStoreSignal =
          storeKeywords.some((k) => clean.includes(k)) ||
          /^(1|2|3|4|0|#menu|menu|start)$/i.test(clean) ||
          clean.includes('http://') ||
          clean.includes('https://');

        let isStoreCustomer = false;
        if (!hasStoreSignal) {
          try {
            const cleanDigits = senderPhone.replace(/^92/, '0');
            const existingOrder = await Order.findOne({ 'customerDetails.phone': { $regex: cleanDigits.slice(-9) } }).lean();
            if (existingOrder) isStoreCustomer = true;
          } catch {}
        }

        if (!hasStoreSignal && !isStoreCustomer) {
          // Purely personal / casual conversation -> Stay 100% silent!
          continue;
        }

        console.log(`[Incoming Message] From: ${senderPhone} | Text: "${messageText}"`);

        // Check if paused for human agent handoff
        const pausedUntil = pausedContacts[senderPhone];
        if (pausedUntil && Date.now() < pausedUntil) {
          console.log(`[Worker] Bot is paused for ${senderPhone} (Human Agent Mode).`);
          continue;
        }

        const rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
        const matchedRule = matchRule(messageText, rules);

        if (!matchedRule) {
          console.log(`[Worker] No rule matched for "${messageText}".`);
          continue;
        }

        console.log(`[Worker] Matched Rule: "${matchedRule.name}" (Action: ${matchedRule.dynamicAction})`);

        const replyContent = await resolveReplyMessage(matchedRule, messageText, senderPhone);
        if (!replyContent) continue;

        // Simulate human typing presence (1.8s)
        try {
          await socket.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 1800));

        try {
          await socket.sendPresenceUpdate('paused', senderJid);
        } catch {}

        // Dispatch reply
        await socket.sendMessage(senderJid, { text: replyContent });
        console.log(`[Outgoing Reply] Sent to ${senderPhone} successfully!\n`);

        if (matchedRule.dynamicAction === 'agent_handoff') {
          pausedContacts[senderPhone] = Date.now() + 24 * 60 * 60 * 1000;
          console.log(`[Worker] Paused bot replies for ${senderPhone} for 24 hours.`);
        }
      } catch (err) {
        console.error('[Worker] Error processing message:', err);
      }
    }
  });
}

// Start worker
startWhatsAppWorker().catch(console.error);
