import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Prevent unexpected process crashes
process.on('uncaughtException', (err) => console.error('[Bot uncaughtException]', err));
process.on('unhandledRejection', (err) => console.error('[Bot unhandledRejection]', err));

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const AUTH_DIR = path.join(process.cwd(), '.whatsapp_auth');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const EXCLUDED_NUMBERS = (process.env.WHATSAPP_EXCLUDED_NUMBERS || '')
  .split(',')
  .map((n) => n.trim().replace(/[^0-9]/g, ''))
  .filter(Boolean);

// Initialize Gemini Client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    price: Number,
    originalPrice: Number,
    category: String,
    description: String,
    stock: Number,
    image: String,
  },
  { timestamps: true }
);

const WhatsAppRule = mongoose.models.WhatsAppRule || mongoose.model('WhatsAppRule', WhatsAppRuleSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// In-memory Conversation History Buffer per Phone
const conversationHistories = new Map();
const humanTakeover = {};

// Fallback rules if database is empty or loading
const FALLBACK_RULES = [
  {
    name: 'Interactive Main Menu (Greeting)',
    triggerType: 'contains',
    keywords: ['hi', 'hello', 'salam', 'assalam', 'aoa', 'menu', 'help', 'start', 'hay', '0', '#menu'],
    replyMessage:
      'وعلیکم السلام! *Pak-o-Drive Support* mein khush-amdeed 🛒✨\n\n' +
      'Hum aapki kia madad kar sakte hain? Number reply karein:\n\n' +
      '1️⃣ *Order Status Maloom Karein*\n' +
      '2️⃣ *Payment & Bank / JazzCash Details*\n' +
      '3️⃣ *7-Day Return Policy*\n' +
      '4️⃣ *Live Agent se Rabta Karein*\n\n' +
      '👉 Ya apna sawal direct type karein (e.g. "Civic ke liye ambient lights hain?").',
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

/**
 * 1. Smart Intent Classifier using Gemini 1.5 Flash
 */
async function classifyMessageIntent(messageText) {
  if (!genAI) {
    const lower = messageText.toLowerCase();
    const storeKeywords = [
      'product', 'price', 'order', 'delivery', 'cost', 'buy', 'shop', 'sound', 'speaker',
      'light', 'ambient', 'panel', 'charger', 'camera', 'seat', 'cover', 'perfume', 'freshener',
      'warranty', 'wapsi', 'replace', 'civic', 'corolla', 'alto', 'yaris', 'car', 'gari', 'pakodrive',
      'rate', 'kitne', 'rupay', 'pkr', 'rs', 'cod', 'cash', 'jazzcash', 'easypaisa', 'track', 'parcel'
    ];
    const isStore = storeKeywords.some((k) => lower.includes(k));
    return {
      is_store_related: isStore,
      search_query: isStore ? messageText : '',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a binary intent classifier for an e-commerce WhatsApp number used for BOTH personal family chats and an automotive store ("Pak-o-Drive").

Evaluate this incoming message: "${messageText}"

Rules:
1. Return is_store_related = false if the message is casual personal talk, family conversation, greeting between personal friends, asking where someone is, daily life chatter (e.g. "kahan ho", "ghar kab ao ge", "khana khaya", "call karo", "pic bhejo", "theek ho", "bhai kidhar ho").
2. Return is_store_related = true ONLY if the message asks about:
   - Cars, bikes, automobile accessories, sound systems, ambient lights, dash cams, chargers, seat covers, gadgets.
   - Prices, purchasing, discounts, order tracking, shipping, Cash on Delivery, warranties, website.

Return ONLY a valid JSON object:
{
  "is_store_related": true or false,
  "search_query": "search query terms if store related, else empty"
}`;

    const res = await model.generateContent(prompt);
    const text = res.response.text().trim();
    const cleanJson = text.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      is_store_related: Boolean(parsed.is_store_related),
      search_query: parsed.search_query || '',
    };
  } catch (err) {
    console.error('[Gemini Intent Classifier Error]:', err.message);
    return { is_store_related: false, search_query: '' };
  }
}

/**
 * 2. Live MongoDB Product Search
 */
async function searchStoreProducts(query) {
  if (!query || !query.trim()) return [];

  try {
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    const terms = cleanQuery.split(/\s+/).filter((t) => t.length > 2);
    if (terms.length === 0) return [];

    const regexArray = terms.map((t) => new RegExp(t, 'i'));

    const products = await Product.find({
      $or: [
        { name: { $in: regexArray } },
        { category: { $in: regexArray } },
        { description: { $in: regexArray } },
      ],
      stock: { $gt: 0 },
    })
      .select('name price originalPrice slug category stock image')
      .limit(3)
      .lean();

    return products;
  } catch (err) {
    console.error('[Product Search Error]:', err.message);
    return [];
  }
}

/**
 * 3. Gemini Conversational Sales & Support Generator
 */
async function generateGeminiStoreResponse(userMessage, senderPhone, searchQuery) {
  if (!genAI) {
    return 'وعلیکم السلام! Pak-o-Drive Support par khush-amdeed. Hum aapki kia madad kar sakte hain? (1. Order Status | 2. Payment Details | 3. Return Policy | 4. Live Agent)';
  }

  try {
    const query = searchQuery || userMessage;
    const products = await searchStoreProducts(query);

    let productCatalogContext = '';
    if (products.length > 0) {
      productCatalogContext =
        'Live In-Stock Matching Products from Database:\n' +
        products
          .map(
            (p) =>
              `• Name: ${p.name} | Price: Rs. ${p.price.toLocaleString()} ${
                p.originalPrice ? `(Discounted from Rs. ${p.originalPrice.toLocaleString()})` : ''
              } | Link: https://pakodrive.com/product/${p.slug || p._id}`
          )
          .join('\n');
    }

    const history = conversationHistories.get(senderPhone) || [];
    const formattedHistory = history.map((h) => `${h.role === 'user' ? 'Customer' : 'Ali (Pak-o-Drive)'}: ${h.text}`).join('\n');

    const systemInstruction = `You are "Ali", the friendly, knowledgeable senior sales & customer support executive at Pak-o-Drive (pakodrive.com), Pakistan's #1 automotive accessories and tech gadget store.

Store Policies:
- 🚚 Nationwide Free Cash On Delivery (COD) on all orders.
- 🛡️ 7-Day Replacement & Checking Warranty on every single item.
- ⏱️ Delivery Time: 2-3 working days in major cities (Karachi, Lahore, Rawalpindi/Islamabad), 3-4 days in other areas.
- 📍 Base Warehouse: Rawalpindi / Islamabad.
- 💳 Payment Methods: Cash on Delivery (COD), JazzCash & Easypaisa (0318-5205667), Bank Transfer.

Guidelines:
1. Respond in natural, polite, respectful Pakistani Roman Urdu (e.g. "Jee bilkul bhai!", "Assalam-o-Alaikum!", "Aap befikr rahein").
2. If products were found in the database, present their exact names, PKR prices, and links naturally to help close the sale.
3. Keep responses concise, clear, and easy to read on mobile WhatsApp (use bullet points and emojis tastefully).
4. Never make up fake prices or invent imaginary products. If an item is not found, politely offer to check with the warehouse team or suggest browsing pakodrive.com.
5. If customer asks for live human or owner, say that their request is noted and an agent will call/reply soon.

${productCatalogContext ? `[CURRENT CATALOG CONTEXT]\n${productCatalogContext}\n` : ''}
${formattedHistory ? `[CONVERSATION HISTORY]\n${formattedHistory}\n` : ''}
[CURRENT CUSTOMER MESSAGE]
Customer: "${userMessage}"

Reply as Ali (Pak-o-Drive):`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text().trim();

    // Update conversation buffer
    const updatedHistory = [...history, { role: 'user', text: userMessage }, { role: 'model', text: responseText }].slice(-6);
    conversationHistories.set(senderPhone, updatedHistory);

    return responseText;
  } catch (err) {
    console.error('[Gemini Gen Error]:', err.message);
    return 'Jee bhai! Pak-o-Drive par Free Cash On Delivery aur 7-Day Warranty available hai. Hamari team foran aapse rabta karegi ya aap pakodrive.com par browse kar sakte hain.';
  }
}

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
  console.log('   🚀 Pak-o-Drive 24/7 WhatsApp Gemini AI Bot        ');
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
      const senderJid = msg.key.remoteJid;
      // 🛑 Ignore group chats and status broadcasts
      if (!senderJid || senderJid === 'status@broadcast' || senderJid.includes('@g.us')) continue;

      const senderPhone = senderJid.split('@')[0];

      // 🛑 Whitelist check: Ignore personal / family excluded numbers
      if (EXCLUDED_NUMBERS.some((n) => senderPhone.includes(n))) {
        console.log(`[Whitelist] Phone ${senderPhone} is in personal excluded list. Staying 100% silent.`);
        continue;
      }

      // 👑 ADMIN HUMAN TAKEOVER: If store owner sends any message from their phone, pause bot for 24 hours
      if (msg.key.fromMe) {
        humanTakeover[senderPhone] = Date.now() + 24 * 60 * 60 * 1000;
        console.log(`[Admin Takeover] Store owner messaged ${senderPhone}. Bot muted for 24 hours.`);
        continue;
      }

      try {
        const messageText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          '';

        if (!messageText.trim()) continue;

        const clean = messageText.toLowerCase().trim();
        const words = clean.split(/[\s,?.!#@_+\-:]+/).filter(Boolean);

        // 🔄 WAKE UP: If customer explicitly asks for Menu or Greeting, cancel human pause
        const wakeUpKeywords = ['hi', 'hello', 'salam', 'assalam', 'aoa', 'menu', 'start', '0', '#menu'];
        const isWakeUp = wakeUpKeywords.some((k) => clean === k || words.includes(k));

        if (isWakeUp) {
          delete humanTakeover[senderPhone];
        } else if (humanTakeover[senderPhone] && Date.now() < humanTakeover[senderPhone]) {
          console.log(`[Bot] In Human Agent Mode for ${senderPhone}. Staying silent so admin can chat.`);
          continue;
        }

        // 1. Fetch dynamic rules from DB, fallback to built-in rules
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

          const hasMatch = r.keywords.some((rawK) => {
            if (!rawK) return false;
            const k = rawK.toLowerCase().trim();
            if (k.length === 0) return false;

            if (k.length <= 2) {
              return clean === k || words.includes(k);
            }
            if (r.triggerType === 'exact') {
              return clean === k;
            }
            if (r.triggerType === 'contains') {
              return clean === k || words.includes(k) || clean.includes(k);
            }
            if (r.triggerType === 'regex') {
              try {
                return new RegExp(k, 'i').test(clean);
              } catch {
                return false;
              }
            }
            return false;
          });

          if (hasMatch) {
            matchedRule = r;
            break;
          }
        }

        let reply = '';

        if (matchedRule) {
          console.log(`[Bot] Matched Pre-Set Rule: "${matchedRule.name}" for ${senderPhone}`);
          reply = matchedRule.replyMessage;

          // Dynamic Order lookup
          if (matchedRule.dynamicAction === 'order_status_lookup') {
            try {
              const cleanPhone = senderPhone.replace(/^92/, '0');
              const potentialId = messageText.replace(/[^a-f0-9]/gi, '');
              const queryConditions = [{ 'customerDetails.phone': { $regex: cleanPhone.slice(-9) } }];
              if (potentialId.length === 24) {
                queryConditions.push({ _id: potentialId });
              }

              const order = await Order.findOne({ $or: queryConditions }).sort({ createdAt: -1 });

              if (order) {
                const shortId = order._id?.toString().slice(-8).toUpperCase();
                const itemsSummary = (order.items || []).map((i) => `• ${i.name} x${i.quantity}`).join('\n');

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
        } else {
          // 🧠 2. SMART AI INTENT CLASSIFICATION (Dual Personal vs Store Check)
          console.log(`[Bot] No pre-set rule matched. Checking Gemini intent for: "${messageText}"`);
          const classification = await classifyMessageIntent(messageText);

          if (!classification.is_store_related) {
            console.log(`[Bot] Message classified as PERSONAL / CASUAL. Staying 100% silent.`);
            continue; // 🛑 STAY SILENT for Friends / Family!
          }

          console.log(`[Bot] Message classified as STORE RELATED (${classification.category}). Generating AI response...`);
          reply = await generateGeminiStoreResponse(messageText, senderPhone, classification.search_query);
        }

        // Simulate typing presence (1.2s)
        try {
          await socket.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 1200));

        try {
          await socket.sendPresenceUpdate('paused', senderJid);
        } catch {}

        await socket.sendMessage(senderJid, { text: reply });
        console.log(`[Outgoing Reply] Sent to ${senderPhone} successfully!\n`);

        if (matchedRule && matchedRule.dynamicAction === 'agent_handoff') {
          humanTakeover[senderPhone] = Date.now() + 24 * 60 * 60 * 1000;
          console.log(`[Bot] Agent Handoff active. Bot paused for ${senderPhone} for 24 hours.`);
        }
      } catch (err) {
        console.error('[Bot] Error processing message:', err);
      }
    }
  });
}

start().catch(console.error);
