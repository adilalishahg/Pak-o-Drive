import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { callMultiProviderAI } from './multiAiEngine';


const getApiKey = () => process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
const getGenAI = () => {
  const key = getApiKey();
  return key ? new GoogleGenerativeAI(key) : null;
};

// Product schema for MongoDB query
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

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// In-memory conversation history buffer (last 6 messages per phone)
const conversationHistories = new Map<string, Array<{ role: 'user' | 'model'; text: string }>>();

export type CustomerScenario =
  | 'buy_products'
  | 'track_order'
  | 'payment_info'
  | 'warranty_return'
  | 'agent_handoff'
  | 'general_greeting'
  | 'personal_chat';

export interface IntentClassification {
  is_store_related: boolean;
  scenario: CustomerScenario;
  search_query: string;
  order_identifier: string;
}

/**
 * 1. Smart Multi-Scenario Classifier
 * Accurately differentiates "Want to Buy" vs "Existing Order Tracking" vs "Payment" vs "Warranty" vs "Personal Talk"
 */
export async function classifyMessageIntent(messageText: string): Promise<IntentClassification> {
  const lower = messageText.toLowerCase().trim();

  // Explicit Regex Heuristics for Zero-Latency Decisions
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
    return {
      is_store_related: true,
      scenario: 'track_order',
      search_query: '',
      order_identifier: identifier,
    };
  }

  if (isBuy) {
    const cleanSearch = lower
      .replace(/(order karna hai|order karni hai|buy karna|kharidna|lena hai|chahye|chahiye|rate kya|price kya|kitne ka|available hai|hai|bhai|mujhe|mujhy)/gi, '')
      .trim();
    return {
      is_store_related: true,
      scenario: 'buy_products',
      search_query: cleanSearch || messageText,
      order_identifier: '',
    };
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

  // Fallback to Multi-Provider AI classification if ambiguous
  try {
    const classifierPrompt = `You are a strict conversational intent classifier for "Pak-o-Drive" e-commerce store in Pakistan.

Message: "${messageText}"

Classify into exactly one scenario:
- "buy_products": Wants to purchase, asks about car/tech products, prices, stock, items to buy.
- "track_order": Wants to check existing order status, parcel delivery, past order inquiry.
- "payment_info": Asks about JazzCash, Easypaisa, Bank details, COD methods.
- "warranty_return": Asks about 7-day replacement, warranty, defective item policy.
- "agent_handoff": Asks for live owner, human agent, phone call.
- "general_greeting": Casual greeting like Salam, Hello, Hi, what is this store.
- "personal_chat": Personal talk with family/friends (unrelated to shopping).

Return ONLY valid JSON:
{
  "is_store_related": true or false,
  "scenario": "buy_products" | "track_order" | "payment_info" | "warranty_return" | "agent_handoff" | "general_greeting" | "personal_chat",
  "search_query": "product keywords if buying, else empty string"
}`;

    const { text } = await callMultiProviderAI(classifierPrompt, messageText);
    if (text) {
      const cleanJson = text.replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        is_store_related: Boolean(parsed.is_store_related),
        scenario: parsed.scenario || 'general_greeting',
        search_query: parsed.search_query || '',
        order_identifier: identifier,
      };
    }
  } catch (err) {
    // Continue with default
  }

  return {
    is_store_related: true,
    scenario: 'general_greeting',
    search_query: '',
    order_identifier: identifier,
  };
}

/**
 * 2. Real-Time MongoDB Product Search
 */
export async function searchStoreProducts(query: string) {
  if (!query || !query.trim()) return [];

  try {
    const stopWords = new Set(['mujhy', 'mujhe', 'chahye', 'chahiye', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'bhai', 'karo', 'den', 'kya', 'kia', 'for', 'the', 'and', 'with', 'order', 'karna']);
    const cleanQuery = query.replace(/[^\w\s]/gi, '').toLowerCase().trim();
    const terms = cleanQuery.split(/\s+/).filter((t) => t.length >= 3 && !stopWords.has(t));

    if (terms.length === 0) return [];

    const regexArray = terms.map((t) => new RegExp(t, 'i'));

    const products = await Product.find({
      $or: [
        { name: { $in: regexArray } },
        { description: { $in: regexArray } },
        { category: { $in: regexArray } },
      ],
      stock: { $gt: 0 },
    })
      .select('name slug price originalPrice image category stock')
      .limit(3)
      .lean();

    return products;
  } catch (err) {
    console.error('[Product Search Error]:', err);
    return [];
  }
}

/**
 * 3. Conversational Sales & Support Generator (Multi-Provider AI Waterfall)
 */
export async function generateGeminiStoreResponse(
  userMessage: string,
  senderPhone: string,
  searchQuery?: string
): Promise<string> {
  const classification = await classifyMessageIntent(userMessage);

  // SCENARIO 1: EXISTING ORDER TRACKING
  if (classification.scenario === 'track_order') {
    if (!classification.order_identifier) {
      return (
        `وعلیکم السلام! Jee bilkul bhai, aap apna *Order ID* (jaise #40F921) ya apna *11-digit Mobile Number* yahan share karein.\n\n` +
        `Main foran database check karke aapke parcel ka live status, courier tracking (TCS/Leopards) aur delivery time bata deta hoon! 😊📦`
      );
    }
  }

  // SCENARIO 2: PAYMENT DETAILS INQUIRY
  if (classification.scenario === 'payment_info') {
    return (
      `💳 *Pak-o-Drive Official Payment Options:*\n\n` +
      `1️⃣ *Cash On Delivery (COD):* Poore Pakistan mein parcel receive karte waqt payment karein (Sab se aasan!).\n` +
      `2️⃣ *JazzCash / Easypaisa (0318-5205667):* Account Title: *Adil Ali Shah*\n` +
      `3️⃣ *Bank Transfer:* Available upon request.\n\n` +
      `Agar aapne advance payment ki hai tou transaction screenshot yahan share kar dein! 👍`
    );
  }

  // SCENARIO 3: WARRANTY & RETURNS INQUIRY
  if (classification.scenario === 'warranty_return') {
    return (
      `🛡️ *Pak-o-Drive 7-Day Replacement & Checking Warranty:*\n\n` +
      `Hamare har product par **7 Din Ki Hassle-Free Checking Warranty** milti hai.\n` +
      `Agar parcel receive hone ke baad item me koi issue ya defect ho, tou hum bina kisi extra charge ke piece exchange / replace kar dete hain.\n\n` +
      `Aap befikr ho kar shopping kar sakte hain! 🚚✨`
    );
  }

  // SCENARIO 4: LIVE AGENT REQUEST
  if (classification.scenario === 'agent_handoff') {
    return (
      `👨‍💼 *Live Support Executive Alert*\n\n` +
      `Aapka message hamari customer support team ko direct forward kar diya gaya hai.\n` +
      `Hamara representative jald aapse rabta karega. Aap apna sawal ya requirement yahan detail me likh sakte hain! ✨`
    );
  }

  // SCENARIO 5: BUYING PRODUCTS / GENERAL SALES
  const query = classification.search_query || searchQuery || userMessage;
  const products = await searchStoreProducts(query);

  try {
    let productCatalogContext = '';
    if (products.length > 0) {
      productCatalogContext =
        'Live In-Stock Matching Products from Database:\n' +
        products
          .map(
            (p: any) =>
              `• Name: ${p.name} | Price: Rs. ${p.price.toLocaleString()} ${
                p.originalPrice ? `(Discounted from Rs. ${p.originalPrice.toLocaleString()})` : ''
              } | Link: https://pakodrive.pk/product/${p.slug || p._id}`
          )
          .join('\n');
    }

    const history = conversationHistories.get(senderPhone) || [];
    const formattedHistory = history.map((h) => `${h.role === 'user' ? 'Customer' : 'Ali (Pak-o-Drive)'}: ${h.text}`).join('\n');

    const systemInstruction = `You are "Ali", the friendly, knowledgeable senior sales executive at Pak-o-Drive (pakodrive.pk), Pakistan's top store for automotive accessories & tech gadgets.

Store Policies:
- 🚚 Nationwide Free Cash On Delivery (COD) on all orders.
- 🛡️ 7-Day Replacement & Checking Warranty on every single item.
- ⏱️ Delivery Time: 2-3 working days in major cities (Karachi, Lahore, Rawalpindi/Islamabad), 3-4 days in other areas.
- 📍 Base Warehouse: Rawalpindi / Islamabad.
- 💳 Payment Methods: Cash on Delivery (COD), JazzCash & Easypaisa (0318-5205667), Bank Transfer.

Guidelines:
1. Respond in natural, polite, respectful Pakistani Roman Urdu (e.g. "Jee bilkul bhai!", "Assalam-o-Alaikum!", "Aap befikr rahein").
2. If the customer wants to buy or asked for an item, recommend matching in-stock products with exact names, PKR prices, and full links.
3. If the customer asked a general greeting, give a warm welcome and mention that Cash On Delivery and 7-Day Warranty are available across Pakistan.
4. Keep responses concise, clear, and easy to read on mobile (use bullet points and emojis tastefully).

${productCatalogContext ? `[CURRENT CATALOG CONTEXT]\n${productCatalogContext}\n` : ''}
${formattedHistory ? `[CONVERSATION HISTORY]\n${formattedHistory}\n` : ''}
Customer: "${userMessage}"

Reply as Ali (Pak-o-Drive):`;

    const { text: responseText, provider } = await callMultiProviderAI(systemInstruction, userMessage);

    if (responseText) {
      console.log(`[Store AI Response via Provider: ${provider}]`);
      const updatedHistory = [...history, { role: 'user' as const, text: userMessage }, { role: 'model' as const, text: responseText }].slice(-6);
      conversationHistories.set(senderPhone, updatedHistory);
      return responseText;
    }
  } catch (err: any) {
    console.error('[Multi-AI Generation Error]:', err?.message);
  }

  if (products.length > 0) {
    const list = products
      .map((p: any) => `• *${p.name}* — Rs. ${p.price.toLocaleString()} (https://pakodrive.pk/product/${p.slug || p._id})`)
      .join('\n');
    return `وعلیکم السلام! Jee bilkul hamare pas yeh items in-stock available hain:\n\n${list}\n\n🚚 Nationwide Free Cash On Delivery & 🛡️ 7-Day Warranty.\nKya aapko Cash on Delivery par order book karwana hai?`;
  }

  return 'وعلیکم السلام! Pak-o-Drive par khush-amdeed. Hamare pas Car Accessories, Gadgets aur Detailing items Free Cash On Delivery aur 7-Day Warranty ke sath available hain! Aapko kis item ki talash hai?';
}


