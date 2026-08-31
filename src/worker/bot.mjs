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

let MONGODB_URI = process.env.MONGODB_URI || '';
if (MONGODB_URI && !MONGODB_URI.includes('/ecommerceStore') && !MONGODB_URI.includes('/pakodrive')) {
  MONGODB_URI = MONGODB_URI.replace('27017/?', '27017/ecommerceStore?');
}
const AUTH_DIR = path.join(process.cwd(), '.whatsapp_auth');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pakodrive.pk';
const EXCLUDED_NUMBERS = (process.env.WHATSAPP_EXCLUDED_NUMBERS || '')
  .split(',')
  .map((n) => n.trim().replace(/[^0-9]/g, ''))
  .filter(Boolean);

/**
 * Direct Zero-Dependency Google Gemini REST API Client with Multi-Model Fallback
 */
async function callGeminiDirect(prompt) {
  if (!GEMINI_API_KEY) {
    console.log('⚠️ [callGeminiDirect] No GEMINI_API_KEY provided in env.');
    return null;
  }
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-3.7-flash', 'gemini-pro-latest'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`✅ [Gemini Model ${model}] Generated response successfully.`);
          return text.trim();
        }
      } else {
        const errText = await res.text();
        console.log(`⚠️ [Gemini ${model} HTTP ${res.status}]:`, errText.slice(0, 120));
      }
    } catch (err) {
      console.log(`⚠️ [Gemini ${model} Network Error]:`, err.message);
    }
  }
  return null;
}

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
      '👉 Ya apna sawal direct type karein (e.g. "Mehran mirror" ya "Civic lights").',
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

const STORE_KEYWORDS = [
  'mehran', 'suzuki', 'civic', 'corolla', 'alto', 'yaris', 'cultus', 'city', 'wagonr', 'vitz', 'car', 'gari', 'bike',
  'mirror', 'mirro', 'sheesha', 'light', 'ambient', 'speaker', 'sound', 'panel', 'android', 'cover', 'seat', 'mat',
  'towel', 'microfiber', 'spray', 'paint', 'perfume', 'freshener', 'aseel', 'charger', 'cable', 'camera', 'led', 'cob',
  'product', 'price', 'kitne', 'rate', 'pkr', 'rs', 'rupay', 'cod', 'order', 'delivery', 'warranty', 'wapsi', 'buy', 'shop', 'pakodrive'
];

async function classifyMessageIntent(messageText) {
  const lower = messageText.toLowerCase();
  const hasStoreKeyword = STORE_KEYWORDS.some((k) => lower.includes(k));

  if (!GEMINI_API_KEY) {
    return {
      is_store_related: hasStoreKeyword,
      search_query: hasStoreKeyword ? messageText : '',
    };
  }

  try {
    const prompt = `You are a binary intent classifier for an e-commerce WhatsApp number used for BOTH personal family chats and an automotive store ("Pak-o-Drive").

Evaluate this incoming message: "${messageText}"

Rules:
1. Return is_store_related = false if the message is casual personal talk, family conversation, greeting between personal friends, asking where someone is, daily life chatter (e.g. "kahan ho", "ghar kab ao ge", "khana khaya", "call karo", "pic bhejo", "theek ho", "bhai kidhar ho").
2. Return is_store_related = true if the message asks about cars, bikes, accessories, mirrors, lights, speakers, parts, prices, purchasing, discounts, order tracking, shipping, Cash on Delivery, warranties, website.

Return ONLY a valid JSON object:
{
  "is_store_related": true or false,
  "search_query": "search query terms if store related, else empty"
}`;

    const text = await callGeminiDirect(prompt);
    if (text) {
      const cleanJson = text.replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        is_store_related: Boolean(parsed.is_store_related) || hasStoreKeyword,
        search_query: parsed.search_query || messageText,
      };
    }
  } catch (err) {
    console.error('[Gemini Intent Classifier Error]:', err.message);
  }

  // Fallback to store keywords
  return { is_store_related: hasStoreKeyword, search_query: hasStoreKeyword ? messageText : '' };
}

/**
 * 2. Smart MongoDB Product Search with Stop-Word Removal
 */
async function searchStoreProducts(query) {
  if (!query || !query.trim()) return [];
  try {
    const stopWords = new Set(['mujhy', 'mujhe', 'chahye', 'chahiye', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'bhai', 'karo', 'den', 'kya', 'kia', 'for', 'the', 'and', 'with']);
    const cleanQuery = query.replace(/[^\w\s]/gi, '').toLowerCase().trim();
    const rawTerms = cleanQuery.split(/\s+/).filter((t) => t.length >= 3 && !stopWords.has(t));
    const terms = rawTerms.length > 0 ? rawTerms : cleanQuery.split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      console.log(`🔎 [DB Search] No valid keyword terms extracted from: "${query}"`);
      return [];
    }

    console.log(`🔎 [DB Search] Query: "${query}" | Extracted Search Terms: [ ${terms.join(', ')} ]`);

    // Construct broad regex matches for each search term
    const regexArray = terms.map((t) => {
      const stem = t.length > 4 ? t.slice(0, 4) : t;
      return new RegExp(stem, 'i');
    });

    const products = await Product.find({
      $or: [
        { name: { $in: regexArray } },
        { description: { $in: regexArray } },
        { category: { $in: regexArray } },
      ],
      stock: { $gt: 0 },
    })
      .select('name price originalPrice slug category stock image')
      .limit(3)
      .lean();

    if (products.length > 0) {
      // Sort by relevance (products whose name matches the keyword come first)
      products.sort((a, b) => {
        const aMatches = terms.filter((t) => (a.name || '').toLowerCase().includes(t)).length;
        const bMatches = terms.filter((t) => (b.name || '').toLowerCase().includes(t)).length;
        return bMatches - aMatches;
      });

      console.log(`📦 [DB Search Result] Found ${products.length} matching in-stock products:`);
      products.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.name} | Rs. ${p.price} | Stock: ${p.stock} | ID: ${p._id}`);
      });
    } else {
      console.log(`⚠️ [DB Search Result] 0 products found matching terms: [ ${terms.join(', ')} ]`);
    }

    return products;
  } catch (err) {
    console.error('❌ [Product Search Error]:', err.message);
    return [];
  }
}

/**
 * 3. Gemini Conversational Sales & Support Generator
 */
async function generateGeminiStoreResponse(userMessage, senderPhone, searchQuery) {
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
              `• Name: ${p.name}\n  Price: Rs. ${p.price.toLocaleString()}${p.originalPrice ? ` (Original: Rs. ${p.originalPrice.toLocaleString()})` : ''}\n  Link: ${SITE_URL}/product/${p._id || p.slug}`
          )
          .join('\n\n');
    }

    const history = conversationHistories.get(senderPhone) || [];
    const formattedHistory = history.map((h) => `${h.role === 'user' ? 'Customer' : 'Ali (Pak-o-Drive)'}: ${h.text}`).join('\n');

    const systemInstruction = `You are "Ali", the friendly, knowledgeable senior sales executive at Pak-o-Drive (${SITE_URL}), Pakistan's top store for automotive electronics & car accessories.

Store Policies:
- 🚚 Nationwide Free Cash On Delivery (COD) on all orders.
- 🛡️ 7-Day Replacement & Checking Warranty on every single item.
- ⏱️ Delivery: 2-3 working days in major cities (Karachi, Lahore, Rawalpindi/Islamabad), 3-4 days in other areas.
- 📍 Base: Rawalpindi / Islamabad.
- 💳 Payment Methods: Cash on Delivery (COD), JazzCash & Easypaisa (0318-5205667), Bank Transfer.

Instructions:
1. Speak in friendly, respectful, natural Pakistani Roman Urdu ("Jee bilkul bhai!", "Assalam-o-Alaikum!").
2. ALWAYS recommend the matching in-stock products with their EXACT name, PKR price, and full clickable link (${SITE_URL}/product/...).
3. Keep the message clean, formatted with bullet points and friendly emojis.
4. Ask if they want to book Cash on Delivery order right now. If customer asks for live human or owner, say that their request is noted and an agent will call/reply soon.

${productCatalogContext ? `[CURRENT CATALOG CONTEXT]\n${productCatalogContext}\n` : ''}
${formattedHistory ? `[CONVERSATION HISTORY]\n${formattedHistory}\n` : ''}
[CURRENT CUSTOMER MESSAGE]
Customer: "${userMessage}"

Reply as Ali (Pak-o-Drive):`;

    console.log(`🤖 [Gemini AI] Generating sales response with ${products.length} products in context...`);
    const responseText = await callGeminiDirect(systemInstruction);
    if (!responseText) {
      console.log('⚠️ [Gemini AI] callGeminiDirect returned empty. Generating direct product card.');
      if (products.length > 0) {
        const list = products.map((p) => `• *${p.name}*\n  💰 *Price:* Rs. ${p.price.toLocaleString()}${p.originalPrice ? ` (Original: Rs. ${p.originalPrice.toLocaleString()})` : ''}\n  👉 *Order Link:* ${SITE_URL}/product/${p._id || p.slug}`).join('\n\n');
        return `وعلیکم السلام! Jee bilkul bhai, hamare pas yeh items in-stock available hain:\n\n${list}\n\n🚚 *Nationwide Free Cash On Delivery (COD)* & 🛡️ 7-Day Checking Warranty.\nKya aapko Cash on Delivery par order book karwana hai?`;
      }
      return 'Jee bhai! Pak-o-Drive par Free Cash On Delivery aur 7-Day Warranty available hai. Hamari team foran aapse rabta karegi ya aap pakodrive.pk par browse kar sakte hain.';
    }

    console.log(`💬 [Gemini AI Generated Reply]:\n${responseText}\n`);

    // Update conversation buffer
    const updatedHistory = [...history, { role: 'user', text: userMessage }, { role: 'model', text: responseText }].slice(-6);
    conversationHistories.set(senderPhone, updatedHistory);

    return responseText;
  } catch (err) {
    console.error('❌ [Gemini Gen Error]:', err.message);
    return 'Jee bhai! Pak-o-Drive par Free Cash On Delivery aur 7-Day Warranty available hai. Hamari team foran aapse rabta karegi ya aap pakodrive.pk par browse kar sakte hain.';
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
