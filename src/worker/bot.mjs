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

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Clean AI response from any chain-of-thought or markdown leaks
 */
function cleanAiResponse(text) {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^\*\*Reasoning:\*\*[\s\S]*?\n\n/gi, '')
    .replace(/^Reasoning:[\s\S]*?\n\n/gi, '')
    .trim();
}

/**
 * 1. Google Gemini Provider
 */
async function callGeminiDirect(prompt) {
  if (!GEMINI_API_KEY) return null;
  const versions = ['v1beta', 'v1'];
  const models = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-2.5-pro',
  ];

  for (const ver of versions) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
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
            const cleaned = cleanAiResponse(text);
            if (cleaned) {
              console.log(`✅ [Gemini Model ${model} (${ver})] Generated response successfully.`);
              return cleaned;
            }
          }
        }
      } catch (err) {
        // try next
      }
    }
  }
  return null;
}

/**
 * 2. Groq Cloud Ultra-Fast Provider
 */
async function callGroqDirect(prompt) {
  if (!GROQ_API_KEY) return null;
  const models = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'groq/compound-mini',
    'qwen/qwen3.6-27b',
  ];

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          const cleaned = cleanAiResponse(text);
          if (cleaned) {
            console.log(`✅ [Groq Model ${model}] Generated response successfully.`);
            return cleaned;
          }
        }
      }
    } catch (err) {}
  }
  return null;
}

/**
 * 3. Hugging Face Router Provider
 */
async function callHuggingFaceDirect(prompt) {
  if (!HUGGINGFACE_API_KEY) return null;
  const models = [
    process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'mistralai/Mistral-7B-Instruct-v0.3',
  ];

  for (const model of models) {
    try {
      const url = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          const cleaned = cleanAiResponse(text);
          if (cleaned) {
            console.log(`✅ [Hugging Face Model ${model}] Generated response successfully.`);
            return cleaned;
          }
        }
      }
    } catch (err) {}
  }
  return null;
}

/**
 * Master AI Dispatcher Waterfall
 */
async function callMultiAIWaterfall(prompt) {
  // 1. Try Gemini
  const gText = await callGeminiDirect(prompt);
  if (gText) return gText;

  // 2. Try Groq (Ultra-Fast 500ms response)
  const groqText = await callGroqDirect(prompt);
  if (groqText) return groqText;

  // 3. Try Hugging Face
  const hfText = await callHuggingFaceDirect(prompt);
  if (hfText) return hfText;

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
    whatsappSent: { type: Boolean, default: false },
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

const WebChatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    shortCode: { type: String, required: true },
    visitorPhone: String,
    visitorName: String,
    isAgentLive: { type: Boolean, default: false },
    messages: [
      {
        id: String,
        sender: String,
        text: String,
        timestamp: String,
        notifiedToAdmin: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SiteInfoSchema = new mongoose.Schema(
  {
    trendingProductLimit: { type: Number, default: 10 },
    adminPhones: { type: String, default: '03185205667, 03218827748' },
  },
  { strict: false }
);

const WhatsAppBotStatusSchema = new mongoose.Schema(
  {
    status: { type: String, default: 'DISCONNECTED' },
    phoneNumber: { type: String, default: null },
    platform: { type: String, default: 'Alwaysdata 24/7 Cloud Daemon' },
    qrCodeBase64: { type: String, default: null },
    lastPingAt: { type: Date, default: Date.now },
    lastConnectedAt: { type: Date, default: null },
    totalMessagesProcessed: { type: Number, default: 0 },
    totalAutoRepliesSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const WhatsAppRule = mongoose.models.WhatsAppRule || mongoose.model('WhatsAppRule', WhatsAppRuleSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const WebChatSession = mongoose.models.WebChatSession || mongoose.model('WebChatSession', WebChatSessionSchema);
const SiteInfo = mongoose.models.SiteInfo || mongoose.model('SiteInfo', SiteInfoSchema);
const WhatsAppBotStatus = mongoose.models.WhatsAppBotStatus || mongoose.model('WhatsAppBotStatus', WhatsAppBotStatusSchema);




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
  const lower = messageText.toLowerCase().trim();

  const isTracking =
    /(order status|mera order|order kia tha|already order|order book kiya|parcel kahan|track|tracking|kab pohanch|dispatch|delivery status)/i.test(
      lower
    ) && !/(order karna hai|order karni hai|buy karna|kharidna|price kya|chahiye|lena hai)/i.test(lower);

  const isBuy =
    /(order karna hai|order karni hai|buy karna|kharidna|lena hai|chahye|chahiye|rate kya|price kya|kitne ka|available hai|stock|perfume|mirror|camera|speaker|wax|tape|light|panel|earbuds)/i.test(
      lower
    );

  const isPayment = /(jazzcash|easypaisa|bank transfer|advance payment|account number|payment method|cod available)/i.test(
    lower
  );

  const isWarranty = /(warranty|guarantee|kharab nikla|return policy|wapsi|exchange|replace policy|check warranty)/i.test(
    lower
  );

  const isAgent = /(agent|human|representative|baat karni|admin|owner|call me|manager)/i.test(lower);

  const hexOrPhone = lower.match(/\b[a-f0-9]{4,24}\b|\b03\d{9}\b|\b923\d{9}\b/i);
  const identifier = hexOrPhone ? hexOrPhone[0] : '';

  if (isTracking) {
    return { is_store_related: true, scenario: 'track_order', search_query: '', order_identifier: identifier };
  }

  if (isBuy) {
    const cleanSearch = lower
      .replace(/(order karna hai|order karni hai|buy karna|kharidna|lena hai|chahye|chahiye|rate kya|price kya|kitne ka|available hai|hai|bhai|mujhe|mujhy)/gi, '')
      .trim();
    return { is_store_related: true, scenario: 'buy_products', search_query: cleanSearch || messageText, order_identifier: '' };
  }

  if (isPayment) {
    return { is_store_related: true, scenario: 'payment_info', search_query: '', order_identifier: '' };
  }

  if (isWarranty) {
    return { is_store_related: true, scenario: 'warranty_return', search_query: '', order_identifier: '' };
  }

  if (isAgent) {
    return { is_store_related: true, scenario: 'agent_handoff', search_query: '', order_identifier: '' };
  }

  const hasStoreKeyword = STORE_KEYWORDS.some((k) => lower.includes(k));

  try {
    const prompt = `You are a binary intent classifier for an e-commerce WhatsApp number used for BOTH personal family chats and an automotive store ("Pak-o-Drive").

Evaluate this incoming message: "${messageText}"

Rules:
1. Return is_store_related = false if the message is casual personal talk, family conversation, greeting between personal friends, asking where someone is, daily life chatter (e.g. "kahan ho", "ghar kab ao ge", "khana khaya", "call karo", "pic bhejo", "theek ho", "bhai kidhar ho").
2. Return is_store_related = true if asking about car products, prices, buying, discounts, order tracking, shipping, COD, warranties, store support.

Return ONLY a valid JSON:
{
  "is_store_related": true or false,
  "scenario": "buy_products" | "track_order" | "payment_info" | "warranty_return" | "agent_handoff" | "general_greeting" | "personal_chat",
  "search_query": "search query terms if store related, else empty"
}`;

    const text = await callMultiAIWaterfall(prompt);
    if (text) {
      const cleanJson = text.replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        is_store_related: Boolean(parsed.is_store_related) || hasStoreKeyword,
        scenario: parsed.scenario || (hasStoreKeyword ? 'buy_products' : 'personal_chat'),
        search_query: parsed.search_query || messageText,
        order_identifier: identifier,
      };
    }
  } catch (err) {
    console.error('[Gemini Intent Classifier Error]:', err.message);
  }

  return {
    is_store_related: hasStoreKeyword,
    scenario: hasStoreKeyword ? 'buy_products' : 'personal_chat',
    search_query: hasStoreKeyword ? messageText : '',
    order_identifier: identifier,
  };
}

/**
 * 2. Smart MongoDB Product Search with Stop-Word Removal
 */
async function searchStoreProducts(query) {
  if (!query || !query.trim()) return [];
  try {
    const stopWords = new Set(['mujhy', 'mujhe', 'chahye', 'chahiye', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'bhai', 'karo', 'den', 'kya', 'kia', 'for', 'the', 'and', 'with', 'order', 'karna']);
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
      products.sort((a, b) => {
        const aMatches = terms.filter((t) => (a.name || '').toLowerCase().includes(t)).length;
        const bMatches = terms.filter((t) => (b.name || '').toLowerCase().includes(t)).length;
        return bMatches - aMatches;
      });

      console.log(`📦 [DB Search Result] Found ${products.length} matching in-stock products:`);
      products.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.name} | Rs. ${p.price} | Stock: ${p.stock} | ID: ${p._id}`);
      });
    }

    return products;
  } catch (err) {
    console.error('❌ [Product Search Error]:', err.message);
    return [];
  }
}

/**
 * 3. Conversational Sales & Support Generator
 */
async function generateGeminiStoreResponse(userMessage, senderPhone, searchQuery) {
  try {
    const classification = await classifyMessageIntent(userMessage);

    // SCENARIO 1: EXISTING ORDER TRACKING
    if (classification.scenario === 'track_order') {
      if (!classification.order_identifier) {
        return {
          text:
            `وعلیکم السلام! Jee bilkul bhai, aap apna *Order ID* (jaise #40F921) ya apna *11-digit Mobile Number* yahan share karein.\n\n` +
            `Main foran database check karke aapke parcel ka live status, courier tracking (TCS/Leopards) aur delivery time bata deta hoon! 😊📦`,
          imageUrl: '',
        };
      }
    }

    // SCENARIO 2: PAYMENT DETAILS
    if (classification.scenario === 'payment_info') {
      return {
        text:
          `💳 *Pak-o-Drive Official Payment Options:*\n\n` +
          `1️⃣ *Cash On Delivery (COD):* Poore Pakistan mein parcel receive karte waqt payment karein.\n` +
          `2️⃣ *JazzCash / Easypaisa (0318-5205667):* Account Title: *Adil Ali Shah*\n` +
          `3️⃣ *Bank Transfer:* Available upon request.\n\n` +
          `Agar aapne advance payment ki hai tou screenshot yahan share kar dein! 👍`,
        imageUrl: '',
      };
    }

    // SCENARIO 3: WARRANTY & RETURNS
    if (classification.scenario === 'warranty_return') {
      return {
        text:
          `🛡️ *Pak-o-Drive 7-Day Checking & Replacement Warranty:*\n\n` +
          `Hamare har item par **7 Din Ki Free Checking Warranty** milti hai.\n` +
          `Agar parcel receive hone par item me koi defect ho, tou hum bina kisi extra charge ke exchange / replace kar dete hain! 🚚✨`,
        imageUrl: '',
      };
    }

    // SCENARIO 4: AGENT HANDOFF
    if (classification.scenario === 'agent_handoff') {
      return {
        text:
          `👨‍💼 *Live Support Executive Alert*\n\n` +
          `Aapka message hamari customer support team ko direct forward kar diya gaya hai.\n` +
          `Hamara representative jald aapse rabta karega! ✨`,
        imageUrl: '',
      };
    }

    // SCENARIO 5: BUYING PRODUCTS / GENERAL INQUIRY
    const query = classification.search_query || searchQuery || userMessage;
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

    const topProductImg = products.length > 0 && products[0].image ? products[0].image : '';

    console.log(`🤖 [Multi-AI Engine] Generating sales response with ${products.length} products in context...`);
    const responseText = await callMultiAIWaterfall(systemInstruction);
    if (!responseText) {
      console.log('⚠️ [Multi-AI Engine] AI generation returned empty. Generating direct product card.');

      if (products.length > 0) {
        const list = products.map((p) => `• *${p.name}*\n  💰 *Price:* Rs. ${p.price.toLocaleString()}${p.originalPrice ? ` (Original: Rs. ${p.originalPrice.toLocaleString()})` : ''}\n  👉 *Order Link:* ${SITE_URL}/product/${p._id || p.slug}`).join('\n\n');
        return {
          text: `وعلیکم السلام! Jee bilkul bhai, hamare pas yeh items in-stock available hain:\n\n${list}\n\n🚚 *Nationwide Free Cash On Delivery (COD)* & 🛡️ 7-Day Checking Warranty.\nKya aapko Cash on Delivery par order book karwana hai?`,
          imageUrl: topProductImg,
        };
      }
      return {
        text: 'Jee bhai! Pak-o-Drive par Free Cash On Delivery aur 7-Day Warranty available hai. Hamari team foran aapse rabta karegi ya aap pakodrive.pk par browse kar sakte hain.',
        imageUrl: '',
      };
    }

    console.log(`💬 [Multi-AI Generated Reply]:\n${responseText}\n`);

    // Update conversation buffer
    const updatedHistory = [...history, { role: 'user', text: userMessage }, { role: 'model', text: responseText }].slice(-6);
    conversationHistories.set(senderPhone, updatedHistory);

    return {
      text: responseText,
      imageUrl: topProductImg,
    };
  } catch (err) {
    console.error('❌ [AI Gen Error]:', err.message);
    return {
      text: 'Jee bhai! Pak-o-Drive par Free Cash On Delivery aur 7-Day Warranty available hai. Hamari team foran aapse rabta karegi ya aap pakodrive.pk par browse kar sakte hain.',
      imageUrl: '',
    };
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
      WhatsAppBotStatus.findOneAndUpdate(
        {},
        {
          status: 'DISCONNECTED',
          lastPingAt: new Date(),
        },
        { upsert: true }
      ).catch(() => {});

      if (shouldReconnect) {
        setTimeout(start, 4000);
      } else {
        console.log('[WhatsApp] Session logged out. Delete .whatsapp_auth and restart.');
      }
    } else if (connection === 'open') {
      const userJid = socket.user?.id || '';
      const phone = userJid.split(':')[0] || userJid.split('@')[0];
      const formattedPhone = phone ? (phone.startsWith('+') ? phone : `+${phone}`) : '+923185205667';
      console.log(`\n🟢 [WhatsApp Bot ONLINE & Active 24/7] Connected as: ${formattedPhone}\n`);

      // Sync connected status to MongoDB so web dashboard displays real-time connection info
      WhatsAppBotStatus.findOneAndUpdate(
        {},
        {
          status: 'CONNECTED',
          phoneNumber: formattedPhone,
          platform: 'Alwaysdata 24/7 Cloud Daemon',
          lastPingAt: new Date(),
          lastConnectedAt: new Date(),
        },
        { upsert: true, new: true }
      ).catch(() => {});

      // Heartbeat ping every 15 seconds to keep dashboard live
      setInterval(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await WhatsAppBotStatus.findOneAndUpdate(
              {},
              {
                status: 'CONNECTED',
                phoneNumber: formattedPhone,
                platform: 'Alwaysdata 24/7 Cloud Daemon',
                lastPingAt: new Date(),
              },
              { upsert: true }
            );
          }
        } catch (e) {}
      }, 15000);

      // Start automatic background watchers
      startOrderWatcher(socket);
      startDailyTrendsScheduler(socket);
      startWebChatWatcher(socket);
    }

  });



  socket.ev.on('messages.upsert', async (m) => {
    // 💡 Allow both 'notify' and 'append' so self-messages & mobile replies are captured
    if (m.type !== 'notify' && m.type !== 'append') return;

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

      // 👑 ADMIN HUMAN TAKEOVER: If store owner sends any message from their phone, pause bot for 5 minutes from last message
      const rawText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        '';

      // 🌐 2-WAY WEB AGENT BRIDGE: Support both explicit prefix (#W5243 ...) and WhatsApp native Swipe-to-Reply (Quoted Message)
      let targetShortCode = '';
      let agentReplyText = '';

      // A. Check for explicit #W tag in message (e.g. "#W5243 Salam bhai" or "W5243 Salam")
      const tagMatch = rawText.trim().match(/^#?(W[A-Z0-9]{3,8})[:\s-]+(.*)$/i);
      if (tagMatch) {
        targetShortCode = tagMatch[1].toUpperCase();
        agentReplyText = tagMatch[2].trim();
      }

      // B. If no tag in text, check if admin did a native WhatsApp Swipe-to-Reply on an alert
      if (!targetShortCode) {
        const quotedText =
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
          '';
        if (quotedText) {
          const quotedMatch = quotedText.match(/#(W[A-Z0-9]{3,8})/i);
          if (quotedMatch && rawText.trim()) {
            targetShortCode = quotedMatch[1].toUpperCase();
            agentReplyText = rawText.trim();
          }
        }
      }

      if (targetShortCode && agentReplyText) {
        try {
          const session = await WebChatSession.findOne({
            shortCode: { $regex: new RegExp(`^${targetShortCode}$`, 'i') },
          });

          if (session) {
            session.messages.push({
              id: 'agent_' + Date.now(),
              sender: 'agent',
              text: agentReplyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAt: new Date(),
            });
            session.isAgentLive = true;
            session.lastActiveAt = new Date();
            session.markModified('messages');
            await session.save();

            console.log(`✅ [Web Agent Bridge] Routed agent reply to Web Visitor #${targetShortCode}: "${agentReplyText}"`);
            const adminNotifyJid = getAdminJid(socket) || senderJid;
            await socket.sendMessage(adminNotifyJid, { text: `✅ Reply delivered to Web Visitor #${targetShortCode} screen!` });
            continue;
          } else {
            console.log(`[Web Agent Bridge] Session #${targetShortCode} not found in DB.`);
          }
        } catch (bridgeErr) {
          console.error('[Web Agent Bridge Error]', bridgeErr);
        }
      }



      if (msg.key.fromMe) {
        humanTakeover[senderPhone] = Date.now() + 5 * 60 * 1000;
        console.log(`[Admin Takeover] Store owner messaged ${senderPhone}. Bot paused for 5 minutes.`);
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

          console.log(`[Bot] Message classified as STORE RELATED (${classification.category || 'inquiry'}). Generating AI response...`);
          reply = await generateGeminiStoreResponse(messageText, senderPhone, classification.search_query);
        }


        let replyText = typeof reply === 'object' ? reply.text : reply;
        let replyImage = typeof reply === 'object' ? reply.imageUrl : '';


        // Simulate typing presence (1.2s)
        try {
          await socket.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 1200));

        try {
          await socket.sendPresenceUpdate('paused', senderJid);
        } catch {}

        if (replyImage && replyImage.startsWith('http')) {
          try {
            await socket.sendMessage(senderJid, {
              image: { url: replyImage },
              caption: replyText,
            });
            console.log(`[Outgoing Media Reply] Sent with product photo to ${senderPhone} successfully!\n`);
          } catch (imgSendErr) {
            console.warn('[Image Send Failed, fallback to text]:', imgSendErr.message);
            await socket.sendMessage(senderJid, { text: replyText });
            console.log(`[Outgoing Text Reply] Sent to ${senderPhone} successfully!\n`);
          }
        } else {
          await socket.sendMessage(senderJid, { text: replyText });
          console.log(`[Outgoing Reply] Sent to ${senderPhone} successfully!\n`);
        }


        if (matchedRule && matchedRule.dynamicAction === 'agent_handoff') {
          humanTakeover[senderPhone] = Date.now() + 5 * 60 * 1000;
          console.log(`[Bot] Agent Handoff active. Bot paused for ${senderPhone} for 5 minutes.`);
        }
      } catch (err) {
        console.error('[Bot] Error processing message:', err);
      }
    }
  });
}

let orderWatcherInterval = null;
let trendsSchedulerInterval = null;
let lastTrendsSentDate = '';

async function getAllAdminJids(socket) {
  const jids = new Set();

  // 1. Bot's own linked phone
  if (socket?.user?.id) {
    const selfNum = socket.user.id.split(':')[0].split('@')[0];
    if (selfNum) jids.add(`${selfNum}@s.whatsapp.net`);
  }

  // 2. Environment variable admin
  const adminEnv = process.env.ADMIN_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  if (adminEnv) {
    const clean = adminEnv.replace(/[^0-9]/g, '');
    let norm = clean;
    if (clean.startsWith('03')) norm = '92' + clean.substring(1);
    else if (clean.startsWith('3')) norm = '92' + clean;
    if (norm) jids.add(`${norm}@s.whatsapp.net`);
  }

  // 3. Database SiteInfo multi-admin phones
  try {
    const siteInfo = await SiteInfo.findOne().lean();
    if (siteInfo?.adminPhones) {
      const splitPhones = siteInfo.adminPhones.split(/[,;\n]+/);
      for (const raw of splitPhones) {
        const clean = raw.replace(/[^0-9]/g, '');
        if (!clean) continue;
        let norm = clean;
        if (clean.startsWith('03')) norm = '92' + clean.substring(1);
        else if (clean.startsWith('3')) norm = '92' + clean;
        if (norm) jids.add(`${norm}@s.whatsapp.net`);
      }
    }
  } catch (err) {}

  return Array.from(jids);
}

function getAdminJid(socket) {
  const adminEnv = process.env.ADMIN_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  if (adminEnv) {
    const clean = adminEnv.replace(/[^0-9]/g, '');
    let normalized = clean;
    if (clean.startsWith('03')) normalized = '92' + clean.substring(1);
    else if (clean.startsWith('3')) normalized = '92' + clean;
    return `${normalized}@s.whatsapp.net`;
  }
  if (socket?.user?.id) {
    const pureNumber = socket.user.id.split(':')[0].split('@')[0];
    return `${pureNumber}@s.whatsapp.net`;
  }
  return null;
}

function startOrderWatcher(socket) {
  if (orderWatcherInterval) clearInterval(orderWatcherInterval);

  console.log('⚡ [Order Watcher] Started background polling for new web orders...');
  orderWatcherInterval = setInterval(async () => {
    try {
      const unnotifiedOrders = await Order.find({
        whatsappSent: { $ne: true },
        status: { $ne: 'Cancelled' },
      }).sort({ createdAt: 1 }).limit(5);

      if (!unnotifiedOrders || unnotifiedOrders.length === 0) return;

      const adminJids = await getAllAdminJids(socket);
      if (adminJids.length === 0) return;

      for (const order of unnotifiedOrders) {
        const shortId = order._id?.toString().slice(-8).toUpperCase() || 'NEW';
        const total = Number(order.totalAmount || 0);
        const itemsList = (order.items || [])
          .map((item) => `• *${item.name}* (x${item.quantity}) — Rs. ${Number(item.price || 0).toLocaleString()}`)
          .join('\n');
        const customer = order.customerDetails || {};

        const message =
          `🛒 *NAYA ORDER RECEIVE HUA HAI!* 🚀\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `📋 *Order ID:* #${shortId}\n` +
          `💰 *Total Amount:* Rs. ${total.toLocaleString()} (Cash On Delivery)\n` +
          `📦 *Total Items:* ${order.items?.length || 1}\n\n` +
          `👤 *Customer Details:*\n` +
          `• *Name:* ${customer.name || 'Customer'}\n` +
          `• *Phone:* ${customer.phone || 'N/A'}\n` +
          `• *City:* ${customer.city || 'N/A'}\n` +
          `• *Address:* ${customer.address || 'N/A'}\n\n` +
          `🛍️ *Ordered Products:*\n` +
          `${itemsList}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `🕒 *Time:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}\n` +
          `🌐 *Source:* Web Checkout\n` +
          `👉 *Admin Orders:* ${SITE_URL}/admin/orders`;

        for (const targetJid of adminJids) {
          await socket.sendMessage(targetJid, { text: message }).catch(() => {});
        }
        await Order.updateOne({ _id: order._id }, { $set: { whatsappSent: true } });
        console.log(`✅ [Order Alert] Sent order #${shortId} notification to ${adminJids.length} admin numbers`);
      }
    } catch (err) {
      console.error('[Order Watcher Error]', err);
    }
  }, 5000);
}

function startDailyTrendsScheduler(socket) {
  if (trendsSchedulerInterval) clearInterval(trendsSchedulerInterval);

  console.log('⚡ [Daily Trends Scheduler] Active (Checks daily at 10:00 AM PKT)...');
  trendsSchedulerInterval = setInterval(async () => {
    try {
      const now = new Date();
      const pktDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); // YYYY-MM-DD
      const pktHour = parseInt(now.toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Karachi' }), 10);

      if (lastTrendsSentDate !== pktDateStr && pktHour >= 10) {
        console.log(`[Daily Trends Scheduler] Generating and dispatching daily intelligence digest for ${pktDateStr}...`);

        const adminJids = await getAllAdminJids(socket);
        if (adminJids.length === 0) return;

        let limit = 10;
        try {
          const siteInfo = await SiteInfo.findOne().lean();
          if (siteInfo?.trendingProductLimit) {
            limit = siteInfo.trendingProductLimit;
          }
        } catch (e) {}

        const storeProducts = await Product.find({ stock: { $gt: 0 } }).limit(limit).lean();
        const p1 = storeProducts[0]?.name || 'Universal Ambient LED Lights';
        const p2 = storeProducts[1]?.name || '3-in-1 Fast Retractable Car Charger';

        const digest =
          `🔥 *PAK-O-DRIVE DAILY VIRAL TRENDS & AD INTELLIGENCE (${storeProducts.length} Products)* 🚀\n` +
          `📅 *Date:* ${pktDateStr}\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 *Market Insight:* Pakistani TikTok & Meta feeds par interior luxury aesthetics aur problem-solving gadgets top converting hain with Cash On Delivery!\n\n` +
          `🏆 *TOP WINNING PRODUCTS TODAY:*\n\n` +
          `1️⃣ *${p1}*\n` +
          `• 📈 *Platform:* TikTok Viral (Demand: 96%)\n` +
          `• 🎯 *Hook:* "Bhai agar aapki gari me ambient lighting nahi lagi tou aap 2026 me nahi 2010 me travel kar rahe hain!"\n` +
          `• 💰 *Pricing:* Sell Rs. 2,850 | Profit: Rs. 1,450/order\n` +
          `• 🎬 *Video Angle:* Before vs After POV Night Drive Neon Transformation\n\n` +
          `2️⃣ *${p2}*\n` +
          `• 📈 *Platform:* Meta / Facebook Ads (Demand: 92%)\n` +
          `• 🎯 *Hook:* "Gari me phaili hui taaron se tang aa chuke hain? Ye 1-second retractable gadget dekhein!"\n` +
          `• 💰 *Pricing:* Sell Rs. 2,200 | Profit: Rs. 1,100/order\n` +
          `• 🎬 *Video Angle:* Problem vs Solution Satisfying Retract\n\n` +
          `3️⃣ *Solar Auto-Rotating Car Freshener*\n` +
          `• 📈 *Platform:* TikTok (Demand: 89%)\n` +
          `• 🎯 *Hook:* "Bina battery ya charging ke dhoop aate hi automatic ghoomne lagta hai!"\n` +
          `• 💰 *Pricing:* Sell Rs. 1,650 | Profit: Rs. 900/order\n` +
          `• 🎬 *Video Angle:* Sunlight Activation Visual ASMR\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `📥 *Full ${storeProducts.length} Product Video Shot Lists & Scripts:* ${SITE_URL}/admin/trending-intelligence`;

        for (const targetJid of adminJids) {
          await socket.sendMessage(targetJid, { text: digest }).catch(() => {});
        }
        lastTrendsSentDate = pktDateStr;
        console.log(`✅ [Daily Trends Alert] Dispatched daily intelligence brief to ${adminJids.length} admin numbers`);
      }
    } catch (err) {
      console.error('[Daily Trends Scheduler Error]', err);
    }
  }, 10 * 60 * 1000);
}

let webChatWatcherInterval = null;

function startWebChatWatcher(socket) {
  if (webChatWatcherInterval) clearInterval(webChatWatcherInterval);

  console.log('⚡ [Web Chat Watcher] Active (Polling live visitor inquiries every 3s)...');
  webChatWatcherInterval = setInterval(async () => {
    try {
      if (mongoose.connection.readyState !== 1) return;

      const sessions = await WebChatSession.find({ isAgentLive: true }).sort({ updatedAt: -1 }).limit(20);
      if (!sessions || sessions.length === 0) return;

      const adminJids = await getAllAdminJids(socket);
      if (adminJids.length === 0) return;

      for (const session of sessions) {
        let modified = false;
        for (const msg of session.messages) {
          if (msg.sender === 'visitor' && msg.notifiedToAdmin !== true) {
            const alert =
              `💬 *LIVE WEB CHAT INQUIRY!* 🟢\n` +
              `━━━━━━━━━━━━━━━━━━━━━\n` +
              `👤 *Visitor Session:* #${session.shortCode}\n` +
              `💬 *Message:* "${msg.text}"\n\n` +
              `👉 *Reply karne ke liye:* Is message ka WhatsApp reply karein ya type karein:\n` +
              `#${session.shortCode} Aapka reply yahan`;

            try {
              console.log(`[WebChat Watcher] Broadcasting live inquiry for Session #${session.shortCode} to ${adminJids.length} admin devices`);
              for (const targetJid of adminJids) {
                await socket.sendMessage(targetJid, { text: alert }).catch(() => {});
              }
              msg.notifiedToAdmin = true;
              modified = true;
            } catch (sendErr) {
              console.error('[WebChat Watcher] Failed to broadcast alert to WhatsApp:', sendErr.message);
            }
          }
        }
        if (modified) {
          session.markModified('messages');
          await session.save();
        }
      }
    } catch (err) {
      console.error('[WebChat Watcher Poll Error]:', err.message);
    }
  }, 3000);
}

start().catch(console.error);




