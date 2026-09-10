import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import { callMultiProviderAI } from '@/lib/multiAiEngine';

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

const STOP_WORDS = new Set([
  'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe', 'aur', 'or',
  'wala', 'wali', 'wale', 'chahiye', 'karna', 'karo', 'kahan', 'hai', 'hain',
  'the', 'for', 'in', 'of', 'and', 'with', 'to', 'a', 'an'
]);

// Pakistani Automotive Synonym & Intent Dictionary
const AUTOMOTIVE_SYNONYMS: Record<string, string[]> = {
  miror: ['mirror', 'side door mirror', 'side mirror'],
  sheesha: ['mirror', 'side door mirror', 'side mirror'],
  sheeshey: ['mirror', 'side door mirror', 'side mirror'],
  aaina: ['mirror', 'side door mirror'],
  mehran: ['suzuki mehran', 'replacement side door mirror', 'mehran mirror'],
  chargr: ['charger', 'fast charger', 'car charger', 'retractable'],
  cable: ['charging cable', 'usb', 'type c'],
  light: ['led', 'cob', 'ambient', 'parking lights', 'daytime running'],
  lights: ['led', 'cob', 'ambient', 'parking lights'],
  freshenr: ['freshener', 'air freshener', 'solar', 'perfume', 'fragrance'],
  khushbu: ['perfume', 'air freshener', 'solar freshener', 'fragrance'],
  khushboo: ['perfume', 'air freshener', 'solar freshener', 'fragrance'],
  tape: ['foam tape', 'double sided', '3m'],
  wax: ['car wax', 'polish', 'cleaning', 'cosmic'],
  dhoop: ['sun shade', 'solar', 'uv protection'],
  safai: ['cleaning', 'microfiber', 'car wash', 'foam gun'],
  kapra: ['microfiber', 'towel', 'cleaning cloth'],
};

async function getOrUpdateCatalog(): Promise<CachedProduct[]> {
  const now = Date.now();
  if (cachedCatalog.length > 0 && now - lastCatalogFetch < CATALOG_CACHE_TTL) {
    return cachedCatalog;
  }

  await dbConnect();
  const docs = await Product.find({ stock: { $gt: -1 } })
    .select('_id name slug price originalPrice image category subcategory seoTitle seoKeywords')
    .lean();

  cachedCatalog = docs.map((doc: any) => ({
    id: String(doc._id),
    name: doc.name || '',
    slug: doc.slug || String(doc._id),
    price: Number(doc.price) || 0,
    originalPrice: doc.originalPrice ? Number(doc.originalPrice) : undefined,
    image: doc.image || '/img/product-placeholder.png',
    category: doc.category || 'General',
    searchKeywords: `${doc.name} ${doc.category} ${doc.subcategory || ''} ${doc.seoTitle || ''} ${doc.seoKeywords || ''}`.toLowerCase(),
  }));

  lastCatalogFetch = now;
  return cachedCatalog;
}

function expandQueryTokens(query: string) {
  const cleanQ = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const rawWords = cleanQ.split(/\s+/).filter((w) => w.length > 0 && !STOP_WORDS.has(w));
  const expanded = new Set(rawWords);

  rawWords.forEach((w) => {
    if (AUTOMOTIVE_SYNONYMS[w]) {
      AUTOMOTIVE_SYNONYMS[w].forEach((syn) => {
        syn.split(/\s+/).forEach((sw) => expanded.add(sw));
      });
    }
  });

  return { originalQuery: cleanQ, rawWords, expandedTokens: Array.from(expanded) };
}

function scoreProduct(
  item: CachedProduct,
  cleanQ: string,
  rawWords: string[],
  expandedTokens: string[]
) {
  const nameLower = item.name.toLowerCase();
  const keywordsLower = item.searchKeywords;
  let score = 0;

  // 1. Exact phrase matches (Highest priority)
  if (nameLower.includes(cleanQ)) {
    score += 10000;
  }
  if (keywordsLower.includes(cleanQ)) {
    score += 4000;
  }

  // 2. Multi-word phrase matches from synonym dictionary
  for (const [key, synList] of Object.entries(AUTOMOTIVE_SYNONYMS)) {
    if (cleanQ.includes(key)) {
      for (const syn of synList) {
        if (nameLower.includes(syn)) {
          score += 3000;
        }
      }
    }
  }

  // 3. Raw word token matches (whole word boundary preferred)
  let rawMatchCount = 0;
  for (const w of rawWords) {
    const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
    if (wordRegex.test(nameLower)) {
      rawMatchCount += 1;
      score += 1000;
    } else if (nameLower.includes(w)) {
      rawMatchCount += 0.5;
      score += 400;
    } else if (keywordsLower.includes(w)) {
      rawMatchCount += 0.3;
      score += 150;
    }
  }

  // 4. Expanded synonym token matches
  for (const t of expandedTokens) {
    const tokenRegex = new RegExp(`\\b${t}\\b`, 'i');
    if (tokenRegex.test(nameLower)) {
      score += 500;
    } else if (keywordsLower.includes(t)) {
      score += 100;
    }
  }

  const coverage = rawWords.length > 0 ? rawMatchCount / rawWords.length : 0;
  return { item, score, coverage, rawMatchCount };
}

// Precision Relevance Matching (0 Tokens, 0ms)
function searchInMemoryCatalog(catalog: CachedProduct[], query: string) {
  const { originalQuery, rawWords, expandedTokens } = expandQueryTokens(query);
  if (rawWords.length === 0) {
    return { products: [], categories: [] };
  }

  const scored = catalog.map((p) => scoreProduct(p, originalQuery, rawWords, expandedTokens));

  // Determine if any product has high coverage (>= 0.7) on original words
  const maxCoverage = Math.max(0, ...scored.map((s) => s.coverage));
  const hasStrongMatch = maxCoverage >= 0.7;

  // Filter products: When multi-word query has strong matches, exclude weak single-word noise
  const filtered = scored.filter((s) => {
    if (rawWords.length >= 2 && hasStrongMatch) {
      return s.coverage >= 0.7 || s.score >= 3000;
    }
    return s.score > 300;
  });

  filtered.sort((a, b) => b.score - a.score);

  const matchedProducts = filtered.slice(0, 6).map((f) => f.item);
  const categories = Array.from(new Set(matchedProducts.map((p) => p.category))).slice(0, 3);

  return {
    products: matchedProducts,
    categories,
  };
}

// Tier 2: AI Smart Recovery with Multi-Provider Fallback (Gemini / Groq / OpenAI)
async function resolveIntentWithAI(query: string, catalog: CachedProduct[]): Promise<CachedProduct[]> {
  if (!catalog || catalog.length === 0) return [];

  const catalogSummary = catalog.slice(0, 25).map((p) => `ID: ${p.id} | Name: ${p.name} | Category: ${p.category}`).join('\n');

  const systemPrompt = `You are the chief intelligent search assistant for Pak-o-Drive, an automotive & gadgets e-commerce store in Pakistan.
A customer searched for an item in English or Roman Urdu, but exact database keyword matching returned 0 results.
Analyze the user's intent and select the 1 to 3 best matching products from our store catalog.

Output ONLY a JSON array of matching product ID strings, e.g. ["65a..."] or []. If no reasonable fit exists, return [].`;

  const userMessage = `Customer Search Query: "${query}"

Available Store Catalog:
${catalogSummary}`;

  try {
    const aiRes = await callMultiProviderAI(systemPrompt, userMessage);
    if (!aiRes.text) return [];

    const jsonMatch = aiRes.text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return [];

    const matchedIds: string[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(matchedIds) || matchedIds.length === 0) return [];

    const matchedProducts = catalog.filter((p) => matchedIds.includes(p.id));
    return matchedProducts.slice(0, 6);
  } catch (err) {
    console.warn('[SearchAI] Semantic AI recovery fallback error:', err);
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

    // ── Tier 2: AI Smart Recovery (Only if 0 matches & query length >= 3)
    if (products.length === 0 && cleanQuery.length >= 3) {
      const aiProducts = await resolveIntentWithAI(cleanQuery, catalog);
      if (aiProducts.length > 0) {
        products = aiProducts;
        categories = Array.from(new Set(aiProducts.map((p) => p.category))).slice(0, 3);
        isAiAssisted = true;
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
