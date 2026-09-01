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

export interface IntentClassification {
  is_store_related: boolean;
  category: 'product_inquiry' | 'order_support' | 'general_store' | 'personal_chat';
  search_query: string;
}

const CANDIDATE_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-pro'];

async function executeGeminiWithFallback(prompt: string, genAI: GoogleGenerativeAI): Promise<string | null> {
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text()?.trim();
      if (text) return text;
    } catch (err: any) {
      // Continue to next candidate model
    }
  }
  return null;
}

/**
 * 1. Smart Intent Classifier:
 * Determines if a message is for Pak-o-Drive Store or personal/family conversation.
 */
export async function classifyMessageIntent(messageText: string): Promise<IntentClassification> {
  const genAI = getGenAI();
  const lower = messageText.toLowerCase();
  const storeKeywords = [
    'product', 'price', 'order', 'delivery', 'cost', 'buy', 'shop', 'sound', 'speaker',
    'light', 'ambient', 'panel', 'charger', 'camera', 'seat', 'cover', 'perfume', 'freshener',
    'warranty', 'wapsi', 'replace', 'civic', 'corolla', 'alto', 'yaris', 'car', 'gari', 'pakodrive',
    'rate', 'kitne', 'rupay', 'pkr', 'rs', 'cod', 'cash', 'jazzcash', 'easypaisa', 'track', 'parcel'
  ];
  const isStore = storeKeywords.some((k) => lower.includes(k));

  if (!genAI) {
    return {
      is_store_related: isStore,
      category: isStore ? 'product_inquiry' : 'personal_chat',
      search_query: isStore ? messageText : '',
    };
  }

  try {
    const prompt = `You are a binary intent classifier for an e-commerce WhatsApp number that is used for BOTH personal family chats and an automotive accessories store ("Pak-o-Drive").

Evaluate this incoming WhatsApp message: "${messageText}"

Rules:
1. Return is_store_related = false if the message is casual personal talk, family conversation, greeting between friends, asking where someone is, daily life chatter (e.g. "kahan ho", "ghar kab ao ge", "khana khaya", "call karo", "pic bhejo", "theek ho", "bhai kidhar ho", informal greetings with no store intent).
2. Return is_store_related = true ONLY if the message is asking about:
   - Cars, bikes, automobile accessories, sound systems, ambient lights, dash cams, chargers, seat covers, gadgets.
   - Prices, purchasing, discounts, order tracking, shipping, Cash on Delivery, warranties, website.

Return ONLY a valid JSON object with no markdown:
{
  "is_store_related": true or false,
  "category": "product_inquiry" | "order_support" | "general_store" | "personal_chat",
  "search_query": "search keywords if asking for item, else empty string"
}`;

    const text = await executeGeminiWithFallback(prompt, genAI);
    if (text) {
      const cleanJson = text.replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        is_store_related: Boolean(parsed.is_store_related),
        category: parsed.category || 'general_store',
        search_query: parsed.search_query || '',
      };
    }
  } catch (err) {
    console.error('[Gemini Classifier Error]:', err);
  }

  return {
    is_store_related: isStore,
    category: isStore ? 'product_inquiry' : 'personal_chat',
    search_query: isStore ? messageText : '',
  };
}

/**
 * 2. Real-Time MongoDB Product Search
 */
export async function searchStoreProducts(query: string) {
  if (!query || !query.trim()) return [];

  try {
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    const terms = cleanQuery.split(/\s+/).filter((t) => t.length > 2);

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
  const isOrderTracking = /(order|parcel|track|status|dispatch|deliver|order book|already|check order|mera order)/i.test(userMessage);

  // If customer is specifically asking to track or check an existing order without providing the ID yet:
  if (isOrderTracking && !/\b[a-f0-9]{4,24}\b|\b03\d{9}\b|\b923\d{9}\b/i.test(userMessage)) {
    return (
      `وعلیکم السلام! Jee bilkul bhai, aap apna *Order ID* (jaise #40F921) ya apna *11-digit Mobile Number* yahan share karein.\n\n` +
      `Main foran database check karke aapke parcel ka live status, courier tracking (TCS/Leopards) aur delivery time bata deta hoon! 😊📦`
    );
  }

  const query = searchQuery || userMessage;
  const products = isOrderTracking ? [] : await searchStoreProducts(query);

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

    const systemInstruction = `You are "Ali", the friendly, knowledgeable senior sales & customer support executive at Pak-o-Drive (pakodrive.pk), Pakistan's #1 automotive accessories and tech gadget store.

Store Policies to follow:
- 🚚 Nationwide Free Cash On Delivery (COD) on all orders.
- 🛡️ 7-Day Replacement & Checking Warranty on every single item.
- ⏱️ Delivery Time: 2-3 working days in major cities (Karachi, Lahore, Rawalpindi/Islamabad), 3-4 days in other areas.
- 📍 Base Warehouse: Rawalpindi / Islamabad.
- 💳 Payment Methods: Cash on Delivery (COD), JazzCash & Easypaisa (0318-5205667), Bank Transfer.

Guidelines:
1. Respond in natural, polite, respectful Pakistani Roman Urdu (e.g. "Jee bilkul bhai!", "Assalam-o-Alaikum!", "Aap befikr rahein").
2. If customer asks about order status or parcel tracking, ask for their Order ID (e.g. #40F921) or phone number.
3. If products were found in the database, present their exact names, PKR prices, and links naturally to help close the sale.
4. Keep responses concise, clear, and easy to read on mobile WhatsApp (use bullet points and emojis tastefully).
5. Never make up fake prices or invent imaginary products. If an item is not found, politely offer to check with the warehouse team or suggest browsing pakodrive.pk.
6. If customer asks for live human or owner, say that their request is noted and an agent will call/reply soon.

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

  if (isOrderTracking) {
    return `Jee bilkul bhai, apna Order ID (jaise #40F921) ya Mobile Number send karein, main foran order status check kar ke batata hoon! 📦`;
  }

  if (products.length > 0) {
    const list = products
      .map((p: any) => `• *${p.name}* — Rs. ${p.price.toLocaleString()} (https://pakodrive.pk/product/${p.slug || p._id})`)
      .join('\n');
    return `وعلیکم السلام! Jee bilkul hamare pas yeh items in-stock available hain:\n\n${list}\n\n🚚 Nationwide Free Cash On Delivery & 🛡️ 7-Day Warranty.`;
  }

  return 'وعلیکم السلام! Pak-o-Drive Support par khush-amdeed. Hum aapki kia madad kar sakte hain? (1. Order Status | 2. Payment Details | 3. Return Policy | 4. Live Agent)';
}

