import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CachedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  searchKeywords: string;
}

// In-Memory Catalog Cache to save database & AI calls (0 tokens, 0ms latency)
let cachedCatalog: CachedProduct[] = [];
let lastCatalogFetch = 0;
const CATALOG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-Memory LRU Query Cache (stores previous 500 search results across all users)
const queryCache = new Map<string, { products: any[]; categories: string[]; isAiAssisted: boolean }>();

// Pakistani Automotive Synonym & Intent Dictionary (0 AI tokens fallback)
const AUTOMOTIVE_SYNONYMS: Record<string, string[]> = {
  miror: ['mirror', 'side door mirror', 'side mirror'],
  mehran: ['suzuki mehran', 'replacement side door mirror', 'mehran mirror'],
  chargr: ['charger', 'fast charger', 'car charger', 'retractable'],
  cable: ['charging cable', 'usb', 'type c'],
  light: ['led', 'cob', 'ambient', 'parking lights', 'daytime running'],
  lights: ['led', 'cob', 'ambient', 'parking lights'],
  freshenr: ['freshener', 'air freshener', 'solar', 'perfume', 'fragrance'],
  khushbu: ['freshener', 'fragrance', 'perfume', 'solar freshener'],
  tape: ['foam tape', 'double sided', '3m'],
  wax: ['car wax', 'polish', 'cleaning', 'cosmic'],
  dhoop: ['sun shade', 'solar', 'uv protection'],
  safai: ['cleaning', 'microfiber', 'car wash', 'foam gun'],
  sheesha: ['side mirror', 'glass', 'mirror'],
};

async function getOrUpdateCatalog(): Promise<CachedProduct[]> {
  const now = Date.now();
  if (cachedCatalog.length > 0 && now - lastCatalogFetch < CATALOG_CACHE_TTL) {
    return cachedCatalog;
  }

  await dbConnect();
  const docs = await Product.find({ stock: { $gt: -1 } })
    .select('_id name slug price originalPrice image category subcategory')
    .lean();

  cachedCatalog = docs.map((doc: any) => ({
    id: String(doc._id),
    name: doc.name || '',
    slug: doc.slug || String(doc._id),
    price: Number(doc.price) || 0,
    originalPrice: doc.originalPrice ? Number(doc.originalPrice) : undefined,
    image: doc.image || '/img/product-placeholder.png',
    category: doc.category || 'General',
    searchKeywords: `${doc.name} ${doc.category} ${doc.subcategory || ''}`.toLowerCase(),
  }));

  lastCatalogFetch = now;
  return cachedCatalog;
}

// Fast Fuzzy/Substring Matching in Memory (0 Tokens)
function searchInMemoryCatalog(catalog: CachedProduct[], query: string) {
  const cleanQ = query.toLowerCase().trim();
  const words = cleanQ.split(/\s+/).filter(Boolean);

  // Check dictionary expansion
  const expandedWords = [...words];
  words.forEach((w) => {
    if (AUTOMOTIVE_SYNONYMS[w]) {
      expandedWords.push(...AUTOMOTIVE_SYNONYMS[w]);
    }
  });

  const matched = catalog.filter((item) => {
    // Direct exact or substring match
    if (item.searchKeywords.includes(cleanQ)) return true;

    // Word match
    return expandedWords.some((w) => item.searchKeywords.includes(w));
  });

  // Extract matched categories
  const categories = Array.from(new Set(matched.map((item) => item.category))).slice(0, 3);

  return {
    products: matched.slice(0, 6),
    categories,
  };
}

// Tier 3: Ultra-Lightweight Gemini Call with Strict 50-Token Cap & Failover
async function resolveIntentWithGemini(query: string, catalogSummary: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
  if (!apiKey) return [];

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for fastest, cheapest inference
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.2,
      },
    });

    const prompt = `A Pakistani shopper searched for "${query}" on an auto accessories & tech store.
Available categories & products: ${catalogSummary}.
Return comma-separated 2-3 matching English product/category keywords from the store. If no fit, return NONE.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text || text.includes('NONE')) return [];

    return text.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
  } catch (err) {
    console.warn('[SearchAI] Gemini fallback error, skipping AI gracefully:', err);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get('q') || searchParams.get('search') || '').trim();

    if (!rawQuery) {
      return NextResponse.json({
        success: true,
        query: '',
        products: [],
        categories: [],
        hasMatches: false,
        isAiAssisted: false,
      });
    }

    const cleanQuery = rawQuery.toLowerCase();

    // ── Tier 2: Check LRU Query Cache (0 Tokens, 0ms) ─────────────
    if (queryCache.has(cleanQuery)) {
      const cached = queryCache.get(cleanQuery)!;
      return NextResponse.json({
        success: true,
        query: rawQuery,
        ...cached,
        hasMatches: cached.products.length > 0,
        cached: true,
      });
    }

    const catalog = await getOrUpdateCatalog();

    // ── Tier 1: In-Memory Fast Match (0 Tokens) ───────────────────
    let { products, categories } = searchInMemoryCatalog(catalog, cleanQuery);
    let isAiAssisted = false;

    // ── Tier 3: AI Smart Recovery (Only if 0 matches & query length >= 3)
    if (products.length === 0 && cleanQuery.length >= 3) {
      const catalogSummary = catalog.slice(0, 15).map((p) => p.name).join(', ');
      const suggestedKeywords = await resolveIntentWithGemini(cleanQuery, catalogSummary);

      if (suggestedKeywords.length > 0) {
        for (const kw of suggestedKeywords) {
          const aiMatches = searchInMemoryCatalog(catalog, kw);
          if (aiMatches.products.length > 0) {
            products = aiMatches.products;
            categories = aiMatches.categories;
            isAiAssisted = true;
            break;
          }
        }
      }
    }

    const resultPayload = {
      products,
      categories,
      isAiAssisted,
    };

    // Store in query cache (cap cache size at 500 items)
    if (queryCache.size > 500) {
      const firstKey = queryCache.keys().next().value;
      if (firstKey) queryCache.delete(firstKey);
    }
    queryCache.set(cleanQuery, resultPayload);

    return NextResponse.json({
      success: true,
      query: rawQuery,
      ...resultPayload,
      hasMatches: products.length > 0,
    });
  } catch (error: any) {
    console.error('Error in search suggestions API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed', products: [], categories: [] },
      { status: 500 }
    );
  }
}
