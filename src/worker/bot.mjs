import path from 'path';
import fs from 'fs';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const AUTH_DIR = path.join(process.cwd(), '.whatsapp_auth');
const PORT = process.env.PORT || 3001;

let botStatus = 'Initializing';
let connectedPhone = null;

// Start tiny HTTP server for Render health checks and keep-alive pings
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    botStatus,
    connectedPhone,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`[HTTP Server] Listening on port ${PORT} (Render Health Check Ready)`);
});

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

const pausedContacts = {};

async function start() {
  if (MONGODB_URI) {
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
      console.log('\n📲 Scan this QR Code with your WhatsApp (Linked Devices):\n');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('Waiting for scan...\n');
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

        // Check if paused
        if (pausedContacts[senderPhone] && Date.now() < pausedContacts[senderPhone]) {
          console.log(`[Bot] Paused for ${senderPhone} (Human Agent Mode).`);
          continue;
        }

        const rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
        const clean = messageText.toLowerCase().trim();
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

        if (!matchedRule) {
          console.log(`[Bot] No matching rule found for "${messageText}".`);
          continue;
        }

        console.log(`[Bot] Matched Rule: "${matchedRule.name}"`);

        let reply = matchedRule.replyMessage;

        // Dynamic Order lookup
        if (matchedRule.dynamicAction === 'order_status_lookup') {
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

        // Simulate typing (1.8s)
        try {
          await socket.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 1800));

        try {
          await socket.sendPresenceUpdate('paused', senderJid);
        } catch {}

        await socket.sendMessage(senderJid, { text: reply });
        console.log(`[Outgoing Reply] Sent to ${senderPhone} successfully!\n`);

        if (matchedRule.dynamicAction === 'agent_handoff') {
          pausedContacts[senderPhone] = Date.now() + 24 * 60 * 60 * 1000;
          console.log(`[Bot] Paused replies for ${senderPhone} for 24 hours.`);
        }
      } catch (err) {
        console.error('[Bot] Error processing message:', err);
      }
    }
  });
}

start().catch(console.error);
