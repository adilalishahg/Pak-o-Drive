/**
 * Intelligent SEO & Keyword Expansion Generator for Pak-o-Drive (Pak Drive)
 * Automatically derives keyword-rich slugs, SEO titles, descriptions, and comprehensive synonym keywords.
 */

import { callMultiProviderAI } from './multiAiEngine';

export interface ProductSeoData {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

// Synonyms and category-specific search terms for Pakistan automotive & e-commerce
const KEYWORD_SYNONYM_MAP: Record<string, string[]> = {
  spray: [
    'spray',
    'car spray',
    'room spray',
    'room and car spray',
    'air freshener spray',
    'car perfume spray',
    'fragrance spray',
    'aseel spray',
    'luxury car spray',
    'interior spray',
  ],
  freshener: [
    'air freshener',
    'air freshner',
    'car air freshener',
    'car freshener',
    'car perfume',
    'car scent',
    'car fragrance',
    'dashboard perfume',
    'car aroma',
  ],
  freshner: [
    'air freshener',
    'air freshner',
    'car air freshener',
    'car freshener',
    'car perfume',
    'car fragrance',
  ],
  perfume: [
    'car perfume',
    'car fragrance',
    'car air freshener',
    'dashboard perfume',
    'rotating car perfume',
    'car scent',
    'solar perfume',
  ],
  solar: [
    'solar air freshener',
    'solar car perfume',
    'solar rotating perfume',
    'solar energy car freshener',
    'solar dashboard freshener',
  ],
  ring: [
    'double ring',
    'dual ring',
    'solar double ring',
    'solar dual ring',
    'rotating double ring',
    'double ring car freshener',
    'dual ring car air freshener',
  ],
  led: [
    'car led lights',
    'led headlights',
    'car lights',
    'parking lights',
    'fog lights',
    'cob led',
    't10 led lights',
    'ambient led lighting',
    'car interior led',
  ],
  light: [
    'car lights',
    'car led lights',
    'daytime running lights',
    'drl lights',
    'parking lights',
  ],
  wax: [
    'car wax',
    'car polish',
    'car wax polish',
    'paint protection wax',
    'car shine polish',
  ],
  polish: [
    'car polish',
    'tyre polish',
    'leather polish',
    'car wax polish',
    'car shine polish spray',
  ],
  mirror: [
    'car mirror',
    'side mirror',
    'door mirror',
    'replacement side mirror',
    'car side view mirror',
  ],
  towel: [
    'microfiber towel',
    'car drying towel',
    'car cleaning cloth',
    'car detailing towel',
    'microfiber cloth',
  ],
  tape: [
    'double sided tape',
    '3m tape',
    'foam tape',
    'heavy duty tape',
    'car mounting tape',
  ],
  earbud: [
    'wireless earbuds',
    'wireless earbud',
    'earbuds',
    'earbud',
    'bluetooth earbuds',
    'bluetooth earphones',
    'handsfree',
    'tws earbuds',
    'airpods',
    'heavy battery earbuds',
    'long battery earbuds',
    'earbuds with power bank',
  ],
  earbuds: [
    'wireless earbuds',
    'bluetooth earbuds',
    'smart screen earbuds',
    'tws earbuds',
    'heavy battery earbuds',
    'long battery earbuds',
    'wireless earphones',
    'earbuds with power bank',
    'gaming earbuds',
    'handsfree',
  ],
  battery: [
    'heavy battery',
    'long battery life',
    'power bank',
    'battery backup',
    'high capacity battery',
    'long lasting battery',
  ],
};

/**
 * Generate a clean, keyword-rich slug from a product name
 */
export function generateSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-') // collapse whitespace into dashes
    .replace(/-+/g, '-'); // collapse multiple dashes
}

/**
 * Generate comprehensive keyword list matching user search intent
 */
export function generateExpandedKeywords(product: {
  name: string;
  category?: string;
  subcategory?: string;
  price?: number;
}): string[] {
  const name = product.name || '';
  const lowerName = name.toLowerCase();
  const keywordsSet = new Set<string>();

  // 1. Exact Name
  keywordsSet.add(name);

  // 2. Intent variations for exact name
  keywordsSet.add(`${name} Pakistan`);
  keywordsSet.add(`${name} price in Pakistan`);
  keywordsSet.add(`buy ${name} online`);

  // 3. Normalized double ring / dual ring / freshener variations
  if (lowerName.includes('dual ring') || lowerName.includes('double ring')) {
    keywordsSet.add('Solar Double Ring Rotating Car Air Freshener');
    keywordsSet.add('Solar Dual Ring Rotating Car Air Freshener');
    keywordsSet.add('Solar Double Ring Rotating Car Air Freshner');
    keywordsSet.add('Double Ring Car Air Freshener');
    keywordsSet.add('Dual Ring Car Air Freshener');
    keywordsSet.add('Solar Rotating Car Perfume');
    keywordsSet.add('Rotating Car Air Freshener');
  }

  if (lowerName.includes('blue ducks') || lowerName.includes('ducks')) {
    keywordsSet.add('Blue Ducks Car Air Freshener');
    keywordsSet.add('Blue Ducks Car Perfume');
    keywordsSet.add('Solar Blue Ducks Freshener');
  }

  if (lowerName.includes('aseel')) {
    keywordsSet.add('Al Arabia Aseel');
    keywordsSet.add('Aseel car spray');
    keywordsSet.add('Aseel room spray');
    keywordsSet.add('Aseel perfume spray');
    keywordsSet.add('Al Arabia Aseel Room & Car Spray');
  }

  // 4. Match terms from KEYWORD_SYNONYM_MAP
  const words = lowerName.split(/[\s,&/-]+/);
  for (const word of words) {
    for (const [key, synonyms] of Object.entries(KEYWORD_SYNONYM_MAP)) {
      if (word.includes(key) || key.includes(word)) {
        synonyms.forEach(syn => keywordsSet.add(syn));
      }
    }
  }

  // 5. Category & Subcategory keywords
  if (product.category) {
    const cleanCat = product.category.replace(/-/g, ' ');
    keywordsSet.add(cleanCat);
    keywordsSet.add(`${cleanCat} Pakistan`);
  }
  if (product.subcategory) {
    const cleanSub = product.subcategory.replace(/-/g, ' ');
    keywordsSet.add(cleanSub);
  }

  // 6. Universal brand and Pakistan e-commerce anchors
  keywordsSet.add('Pak-o-Drive');
  keywordsSet.add('pak drive');
  keywordsSet.add('pakdrive');
  keywordsSet.add('pakodrive');
  keywordsSet.add('pakdrives');
  keywordsSet.add('pakdrv');
  keywordsSet.add('pakdriv');
  keywordsSet.add('pkdrive');
  keywordsSet.add('pk drive');
  keywordsSet.add('pak o drive');
  keywordsSet.add('car accessories Pakistan');
  keywordsSet.add('auto accessories Pakistan');
  keywordsSet.add('buy online Pakistan');
  keywordsSet.add('cash on delivery Pakistan');
  keywordsSet.add('پاک او ڈرائیو');

  return Array.from(keywordsSet).filter(k => k && k.length > 1);
}

/**
 * Automatically derive optimal SEO metadata for a product
 */
export function generateAutoProductSeo(product: {
  name: string;
  price?: number;
  category?: string;
  subcategory?: string;
  description?: string;
}): ProductSeoData {
  const name = (product.name || '').trim();
  const slug = generateSlug(name);
  const priceFormatted = product.price ? `Rs. ${product.price.toLocaleString()}` : '';

  // Generate Meta Title: Ensure the product name, price, and Pak-o-Drive (Pak Drive) are present
  // Also append key synonym if missing (e.g. Air Freshener or Spray)
  let titleExtra = '';
  const lowerName = name.toLowerCase();
  if ((lowerName.includes('freshener') || lowerName.includes('freshner')) && !lowerName.includes('perfume')) {
    titleExtra = ' & Car Perfume';
  } else if (lowerName.includes('spray') && !lowerName.includes('fragrance')) {
    titleExtra = ' Fragrance Spray';
  }

  const pricePart = priceFormatted ? ` — ${priceFormatted}` : '';
  const seoTitle = `${name}${titleExtra}${pricePart} | Pak-o-Drive (Pak Drive) Pakistan`;

  // Generate Meta Description: High-converting, keyword-stuffed description for SERP
  const keywordsList = generateExpandedKeywords(product);
  const topKeywordsSample = keywordsList.slice(0, 6).join(', ');

  const seoDescription = `Buy original ${name} online in Pakistan at best price ${priceFormatted} from Pak-o-Drive (Pak Drive). Fast Cash on Delivery (COD) nationwide across Karachi, Lahore, Islamabad, Rawalpindi & all cities. Order now! (${topKeywordsSample})`;

  const seoKeywords = keywordsList.join(', ');

  return {
    slug,
    seoTitle,
    seoDescription,
    seoKeywords,
  };
}

/**
 * AI-Powered Dynamic SEO & Search Keyword Generator for any product across all categories.
 * Harnesses Multi-Provider AI (Gemini, Groq, HuggingFace) to generate:
 * - Keyword-optimized slug
 * - High-CTR SERP title with brand aliases & PKR price
 * - Buyer-intent meta description
 * - 30-45 synonyms, intent phrases, and Urdu Roman keywords
 * 
 * Includes 100% fail-safe fallback to generateAutoProductSeo() on any network/parsing issue.
 */
export async function generateAiProductSeo(product: {
  name: string;
  price?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  brand?: string;
}): Promise<ProductSeoData> {
  // Always prepare deterministic rule-based SEO as default fallback
  const fallback = generateAutoProductSeo(product);

  const name = (product.name || '').trim();
  if (!name) return fallback;

  try {
    const systemPrompt = `You are the Principal E-Commerce SEO Architect for Pak-o-Drive (Pak Drive), Pakistan's top online automotive accessories and lifestyle gadget store.
Your goal is to generate metadata that will rank this product #1 on Google Pakistan for both exact product title searches and broad intent searches (e.g. spray, car spray, room spray, air freshener, ambient lights, etc.).

Return ONLY a valid, raw JSON object (no markdown, no backticks, no explanatory text) with this exact schema:
{
  "slug": "url-friendly-lowercase-slug-with-high-intent-keywords",
  "seoTitle": "High-CTR Title (50-65 chars) with product name, category/intent synonyms, PKR price if given, and | Pak-o-Drive (Pak Drive)",
  "seoDescription": "Compelling SERP description (150-160 chars) highlighting quality, Cash on Delivery in Pakistan (Karachi, Lahore, Islamabad), and call to action.",
  "seoKeywords": ["array", "of", "30-40", "comprehensive", "search", "terms"]
}`;

    const userMessage = `Product Name: ${name}
Price: ${product.price ? `Rs. ${product.price}` : 'Not specified'}
Category: ${product.category || 'Automotive Accessories'}
Subcategory: ${product.subcategory || ''}
Description: ${(product.description || '').slice(0, 300)}
Brand: ${product.brand || 'Pak-o-Drive'}

Ensure seoKeywords contains:
1. Exact product name and slight variations
2. Common intent terms (e.g. if spray: spray, car spray, room spray; if freshener: air freshener, car perfume, car scent)
3. Pakistani buyer intent keywords (e.g. "cash on delivery", "Pakistan", "karachi", "lahore", "islamabad")
4. Brand aliases: "pakdrive", "pak drive", "pakodrive", "pak o drive"`;

    const aiRes = await callMultiProviderAI(systemPrompt, userMessage);
    if (!aiRes.text) {
      return fallback;
    }

    // Extract JSON from response
    const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallback;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate parsed output
    const slug = (parsed.slug && typeof parsed.slug === 'string' && parsed.slug.trim())
      ? generateSlug(parsed.slug)
      : fallback.slug;

    const seoTitle = (parsed.seoTitle && typeof parsed.seoTitle === 'string' && parsed.seoTitle.trim())
      ? parsed.seoTitle.trim()
      : fallback.seoTitle;

    const seoDescription = (parsed.seoDescription && typeof parsed.seoDescription === 'string' && parsed.seoDescription.trim())
      ? parsed.seoDescription.trim()
      : fallback.seoDescription;

    // Merge AI keywords with rule-based keywords to guarantee nothing is missed
    const baseKeywords = generateExpandedKeywords(product);
    const aiKeywordsList: string[] = Array.isArray(parsed.seoKeywords)
      ? parsed.seoKeywords
      : (typeof parsed.seoKeywords === 'string' ? (parsed.seoKeywords as string).split(',') : []);

    const combinedSet = new Set<string>();
    aiKeywordsList.forEach((k: string) => {
      const clean = k.trim().replace(/^["']|["']$/g, '');
      if (clean && clean.length > 1) combinedSet.add(clean);
    });
    baseKeywords.forEach(k => combinedSet.add(k));

    return {
      slug,
      seoTitle,
      seoDescription,
      seoKeywords: Array.from(combinedSet).join(', '),
    };
  } catch (err) {
    console.warn('⚠️ [AI SEO Generation] Falling back to deterministic rule-based SEO:', err);
    return fallback;
  }
}
