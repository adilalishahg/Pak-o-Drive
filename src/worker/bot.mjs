import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

// Prevent unexpected process crashes
process.on('uncaughtException', (err) => console.error('[Bot uncaughtException]', err));
process.on('unhandledRejection', (err) => console.error('[Bot unhandledRejection]', err));

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const AUTH_DIR = path.join(process.cwd(), '.whatsapp_auth');

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

// Fallback rules if database is empty or loading
const FALLBACK_RULES = [
  {
    name: 'Interactive Main Menu (Greeting)',
    triggerType: 'contains',
    keywords: ['hi', 'hello', 'salam', 'assalam', 'aoa', 'menu', 'help', 'start', 'hay', '0'],
    replyMessage:
      'وعلیکم السلام! *Pak-o-Drive Support* mein khush-amdeed 🛒✨\n\n' +
      'Hum aapki kia madad kar sakte hain? Number reply karein:\n\n' +
      '1️⃣ *Order Status Maloom Karein*\n' +
      '2️⃣ *Payment & Bank / JazzCash Details*\n' +
      '3️⃣ *7-Day Return Policy*\n' +
      '4️⃣ *Live Agent se Rabta Karein*\n\n' +
      '👉 Ya apna sawal direct type karein.',
    dynamicAction: 'interactive_menu',
    enabled: true,
    priority: 1,
  },
  {
    name: 'Order Status & Tracking',
    triggerType: 'contains',
    keywords: ['order', 'track', 'status', 'parcel', 'dispatch', '1'],
    replyMessage:
      '📦 *Order Verification & Tracking:*\n\n' +
      'Aap apna Order ID (e.g. #12345) ya phone number share karein taake hum live tracking check kar sakein.',
    dynamicAction: 'order_status_lookup',
    enabled: true,
    priority: 2,
  },
  {
    name: 'Payment Accounts',
    triggerType: 'contains',
    keywords: ['bank', 'jazzcash', 'easypaisa', 'payment', 'account', '2'],
    replyMessage:
      '💳 *Pak-o-Drive Payment Accounts*\n\n' +
      '• *Cash On Delivery (COD):* Parcel milne par payment karein.\n' +
      '• *JazzCash / EasyPaisa:* 0318-5205667 (Title: Pak-o-Drive)\n' +
      '• *Bank:* Meezan Bank (Title: PAKODRIVE OFFICIAL)',
    dynamicAction: 'bank_details',
    enabled: true,
    priority: 3,
  },
  {
    name: '7-Day Return Policy',
    triggerType: 'contains',
    keywords: ['return', 'refund', 'exchange', 'wapsi', 'kharab', '3'],
    replyMessage:
      '🛡️ *7-Day Return & Easy Replacement Policy*\n\n' +
      'Pak-o-Drive par har product par 100% peace-of-mind guarantee milti hai.\n' +
      'Parcel unboxing ki photo ya video share karein, hamari team foran replace karegi.',
    dynamicAction: 'returns_policy',
    enabled: true,
    priority: 4,
  },
  {
    name: 'Human Agent Handoff',
    triggerType: 'contains',
    keywords: ['agent', 'human', 'admin', 'call', 'talk', 'baat', '4'],
    replyMessage:
      '👨‍💼 *Live Support Agent*\n\n' +
      'Aapka message hamare support agent ko forward kar diya gaya hai. Thori der intezar karein, hum aapse rabta karenge.\n\n' +
      '*(Dobara menu dekhne ke liye kisi bhi waqt "Menu" ya "Hi" likhein)*',
    dynamicAction: 'agent_handoff',
    enabled: true,
    priority: 5,
  },
];

async function start() {
  if (MONGODB_URI && mongoose.connection.readyState === 0) {
    try {
      console.log('[DB] Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI);
      console.log('[DB] Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.error('[DB] Connection error:', err);
    }
  }

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  console.log('\n======================================================');
  console.log('   🚀 Pak-o-Drive 24/7 WhatsApp Auto-Responder Bot   ');
  console.log('======================================================\n');

  const socket = makeWASocket({
    version,
    auth: authState,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Pak-o-Drive Bot', 'Node.js', '1.0.0'],
    syncFullHistory: false,
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 Scan this QR Code with your WhatsApp:\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`[WhatsApp] Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(start, 4000);
      } else {
        console.log('[WhatsApp] Session logged out. Delete .whatsapp_auth and restart.');
      }
    } else if (connection === 'open') {
      const userJid = socket.user?.id || '';
      const phone = userJid.split(':')[0] || userJid.split('@')[0];
      console.log(`\n🟢 [WhatsApp Bot ONLINE & Active 24/7] Connected as: ${phone}\n`);
    }
  });

  socket.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') continue;

      try {
        const senderJid = msg.key.remoteJid;
        if (!senderJid) continue;

        const senderPhone = senderJid.split('@')[0];
        const messageText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          '';

        if (!messageText.trim()) continue;

        console.log(`[Incoming Message] From: ${senderPhone} | Text: "${messageText}"`);

        const clean = messageText.toLowerCase().trim();

        // Fetch dynamic rules from DB, fallback to built-in rules
        let rules = [];
        try {
          rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
        } catch (dbErr) {
          console.error('[DB Query Error]', dbErr);
        }
        if (!rules || rules.length === 0) {
          rules = FALLBACK_RULES;
        }

        let matchedRule = null;

        for (const r of rules) {
          if (!r.keywords || r.keywords.length === 0) continue;
          if (r.triggerType === 'exact' && r.keywords.some((k) => clean === k.toLowerCase().trim())) {
            matchedRule = r;
            break;
          }
          if (r.triggerType === 'contains' && r.keywords.some((k) => clean.includes(k.toLowerCase().trim()))) {
            matchedRule = r;
            break;
          }
          if (r.triggerType === 'regex') {
            for (const pattern of r.keywords) {
              try {
                if (new RegExp(pattern, 'i').test(clean)) {
                  matchedRule = r;
                  break;
                }
              } catch {}
            }
            if (matchedRule) break;
          }
        }

        if (!matchedRule) {
          matchedRule = rules.find((r) => r.triggerType === 'default');
        }

        // If still no rule matched, send polite fallback menu
        let reply = matchedRule?.replyMessage;
        if (!reply) {
          reply =
            'وعلیکم السلام! Pak-o-Drive mein khush-amdeed 🛒✨\n\n' +
            'Aapka message mil gaya hai. Menu dekhne ke liye *Hi* ya *Menu* reply karein.\n\n' +
            '1️⃣ Order Status\n' +
            '2️⃣ Bank & Payment Details\n' +
            '3️⃣ Return Policy\n' +
            '4️⃣ Live Support Agent';
        }

        // Dynamic Order lookup
        if (matchedRule?.dynamicAction === 'order_status_lookup') {
          try {
            const cleanPhone = senderPhone.replace(/^92/, '0');
            const potentialId = messageText.replace(/[^a-f0-9]/gi, '');
            const queryConditions = [
              { 'customerDetails.phone': { $regex: cleanPhone.slice(-9) } },
            ];
            if (potentialId.length === 24) {
              queryConditions.push({ _id: potentialId });
            }

            const order = await Order.findOne({ $or: queryConditions }).sort({ createdAt: -1 });

            if (order) {
              const shortId = order._id?.toString().slice(-8).toUpperCase();
              const itemsSummary = (order.items || [])
                .map((i) => `• ${i.name} x${i.quantity}`)
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
            console.error('[Bot] Order lookup error:', err);
          }
        }

        // Simulate typing (1.2s)
        try {
          await socket.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 1200));

        try {
          await socket.sendPresenceUpdate('paused', senderJid);
        } catch {}

        await socket.sendMessage(senderJid, { text: reply });
        console.log(`[Outgoing Reply] Sent to ${senderPhone} successfully!\n`);
      } catch (err) {
        console.error('[Bot] Error processing message:', err);
      }
    }
  });
}

start().catch(console.error);
