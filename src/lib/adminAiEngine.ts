import dbConnect from './mongodb';
import Product from '../models/Product';
import Order from '../models/Order';
import Category from '../models/Category';
import SiteInfo from '../models/SiteInfo';
import { callMultiProviderAI } from './multiAiEngine';

export interface AdminStoreSummary {
  totalProducts: number;
  outOfStockCount: number;
  lowStockItems: Array<{ name: string; stock: number; price: number; slug?: string }>;
  topSellingProducts: Array<{ name: string; price: number; stock: number; category: string }>;
  totalOrders: number;
  pendingOrdersCount: number;
  deliveredOrdersCount: number;
  totalRevenuePKR: number;
  recentOrdersCities: string[];
  categoriesList: string[];
}

export interface AdminAiChatPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Real-time Store Database Metrics Snapshot
 */
export async function getAdminStoreSnapshot(): Promise<AdminStoreSummary> {
  await dbConnect();

  try {
    const [
      totalProducts,
      outOfStockProducts,
      lowStockProducts,
      topProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      ordersAgg,
      categories,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Product.find({ stock: { $gt: 0, $lte: 5 } })
        .select('name stock price slug')
        .limit(8)
        .lean(),
      Product.find({ isTopSelling: true })
        .select('name price stock category')
        .limit(8)
        .lean(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            cities: { $push: '$customerDetails.city' },
          },
        },
      ]),
      Category.find().select('name').limit(15).lean(),
    ]);

    const revenue = ordersAgg[0]?.totalRevenue || 0;
    const rawCities: string[] = ordersAgg[0]?.cities || [];
    const recentCities = Array.from(new Set(rawCities.filter(Boolean))).slice(0, 10);

    return {
      totalProducts,
      outOfStockCount: outOfStockProducts,
      lowStockItems: (lowStockProducts || []).map((p: any) => ({
        name: p.name,
        stock: p.stock,
        price: p.price,
        slug: p.slug,
      })),
      topSellingProducts: (topProducts || []).map((p: any) => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
      })),
      totalOrders,
      pendingOrdersCount: pendingOrders,
      deliveredOrdersCount: deliveredOrders,
      totalRevenuePKR: revenue,
      recentOrdersCities: recentCities,
      categoriesList: (categories || []).map((c: any) => c.name),
    };
  } catch (error) {
    console.error('Error fetching admin store snapshot:', error);
    return {
      totalProducts: 0,
      outOfStockCount: 0,
      lowStockItems: [],
      topSellingProducts: [],
      totalOrders: 0,
      pendingOrdersCount: 0,
      deliveredOrdersCount: 0,
      totalRevenuePKR: 0,
      recentOrdersCities: [],
      categoriesList: [],
    };
  }
}

/**
 * SEO & Search Health Audit Data
 */
export async function getStoreSeoAuditSnapshot() {
  await dbConnect();
  try {
    const productsMissingSeo = await Product.find({
      $or: [
        { seoTitle: { $in: ['', null] } },
        { seoDescription: { $in: ['', null] } },
      ],
    })
      .select('name price category')
      .limit(6)
      .lean();

    const totalMissing = await Product.countDocuments({
      $or: [
        { seoTitle: { $in: ['', null] } },
        { seoDescription: { $in: ['', null] } },
      ],
    });

    return {
      totalMissingSeo: totalMissing,
      sampleUnoptimizedProducts: productsMissingSeo.map((p: any) => p.name),
    };
  } catch (e) {
    return { totalMissingSeo: 0, sampleUnoptimizedProducts: [] };
  }
}

/**
 * Live Page SEO Audit Scanner
 * Scrapes meta title, description, headings, OpenGraph tags, and schema for a path or full URL.
 */
export async function auditLivePageSeo(urlOrPath: string = '/'): Promise<{
  url: string;
  status: number;
  title: string;
  description: string;
  h1: string[];
  ogImage: string;
  hasCanonical: boolean;
  hasJsonLd: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let targetUrl = urlOrPath.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `${baseUrl.replace(/\/$/, '')}/${targetUrl.replace(/^\//, '')}`;
  }

  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'PakODrive-SEO-Bot/1.0 (+https://pakodrive.com)',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    const status = res.status;
    const html = await res.text();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (!title) {
      issues.push('Missing <title> tag on page.');
      recommendations.push('Add an engaging Title with local keywords (e.g., "Pak-o-Drive | Car Accessories in Islamabad & Rawalpindi").');
    } else if (title.length < 30 || title.length > 65) {
      issues.push(`Title length is ${title.length} chars (Recommended: 45-60 chars).`);
    }

    // Extract Meta Description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    if (!description) {
      issues.push('Missing Meta Description.');
      recommendations.push('Add a 140-160 character description mentioning Free Delivery, COD, and top brands.');
    } else if (description.length < 70) {
      issues.push(`Meta description too short (${description.length} chars).`);
    }

    // Extract H1 Headings
    const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
    if (h1Matches.length === 0) {
      issues.push('No <h1> tag found on page.');
      recommendations.push('Include a single clear <h1> with primary search keyword.');
    } else if (h1Matches.length > 1) {
      issues.push(`Multiple <h1> tags found (${h1Matches.length}). Best practice is exactly 1.`);
    }

    // Extract OpenGraph Image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const ogImage = ogMatch ? ogMatch[1].trim() : '';
    if (!ogImage) {
      issues.push('Missing og:image tag for WhatsApp / Facebook sharing previews.');
    }

    // Canonical & JSON-LD
    const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
    const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);

    if (!hasCanonical) {
      issues.push('Missing canonical tag (potential duplicate URL penalties).');
    }
    if (!hasJsonLd) {
      recommendations.push('Add JSON-LD Schema (Organization / Product Schema) for Google Rich Snippets.');
    }

    return {
      url: targetUrl,
      status,
      title,
      description,
      h1: h1Matches.slice(0, 3),
      ogImage,
      hasCanonical,
      hasJsonLd,
      issues,
      recommendations,
    };
  } catch (err: any) {
    return {
      url: targetUrl,
      status: 500,
      title: '',
      description: '',
      h1: [],
      ogImage: '',
      hasCanonical: false,
      hasJsonLd: false,
      issues: [`Unable to fetch live URL: ${err.message}`],
      recommendations: ['Check that local server or live domain is running.'],
    };
  }
}

/**
 * Dynamic Target Store Search (Products & Orders Lookup)
 */
export async function searchStoreItems(query: string) {
  await dbConnect();
  try {
    const clean = query.replace(/[^\w\s-]/gi, '').trim();
    if (!clean || clean.length < 2) return null;

    const words = clean.split(/\s+/).filter(w => w.length > 2);
    const regexPattern = words.length > 0 ? words.join('|') : clean;

    const [matchedProducts, matchedOrders] = await Promise.all([
      Product.find({
        $or: [
          { name: { $regex: regexPattern, $options: 'i' } },
          { category: { $regex: regexPattern, $options: 'i' } },
          { brand: { $regex: regexPattern, $options: 'i' } },
        ],
      })
        .select('name price originalPrice stock category isTopSelling slug')
        .limit(6)
        .lean(),

      Order.find({
        $or: [
          { orderId: { $regex: regexPattern, $options: 'i' } },
          { 'customerDetails.city': { $regex: regexPattern, $options: 'i' } },
          { 'customerDetails.fullName': { $regex: regexPattern, $options: 'i' } },
        ],
      })
        .select('orderId totalAmount status paymentMethod customerDetails.city createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      products: (matchedProducts || []).map((p: any) => ({
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        category: p.category,
        slug: p.slug,
      })),
      orders: (matchedOrders || []).map((o: any) => ({
        orderId: o.orderId,
        amount: o.totalAmount,
        status: o.status,
        city: o.customerDetails?.city || 'Unknown',
        payment: o.paymentMethod,
      })),
    };
  } catch (err) {
    console.error('Error in searchStoreItems:', err);
    return null;
  }
}

/**
 * Regional Market Intelligence Knowledge Base (Rawalpindi, Islamabad & Nationwide)
 */
export function getRegionalMarketKnowledge(): string {
  return `
### PAKISTAN & TWIN CITIES (RAWALPINDI / ISLAMABAD) AUTOMOTIVE MARKET CONTEXT:
- **Rawalpindi Auto Culture & Hotspots:**
  - Major Wholesale & Retail hubs: Sultan Ka Khoo (wholesale parts/body parts), Saddar Car Market / Kamran Market, Murree Road, College Road, Commercial Market.
  - Buyer Profile: Value-conscious, performance & aesthetics focused (Corolla, Civic Reborn/Rebirth, Alto, Swift, Mehran, Yaris).
  - High Demand Items: High-durability 7D floor mats, LED headlight bulbs (C6, Novsight, F3, Laser Projectors), loud air/electric horns, steering covers, microfibre cleaning packs, bumper lips/diffusers, carbon fiber wraps.
- **Islamabad Auto Culture & Hotspots:**
  - Major hubs: G-8 Markaz (premium detailing & audio), I-9 Automotive workshops, Blue Area, Bahria Town & DHA car communities.
  - Buyer Profile: Tech-forward, luxury-seeking, premium accessories (Civic RS, Vezel, Sportage, Tucson, Prado, EV/Hybrid cars, Haval Jolion/H6).
  - High Demand Items: Ambient fiber-optic interior lighting (app-controlled), solar rotating dashboard perfumes, 4K dual dashcams with 24/7 parking monitor, wireless Apple CarPlay/Android Auto dongles, ceramic spray coatings, OBD2 Bluetooth diagnostic scanners, smart air purifiers.
- **Seasonal Market Dynamics in Twin Cities:**
  - Winter / Smog Season (Nov - Feb): High-intensity 3000K yellow fog lamps, anti-fog glass treatment, interior defogger blowers, high-grade waterproof car covers.
  - Summer Season (Apr - Aug): Magnetic sunshades for specific car models, UV dashboard covers, 12V portable tire inflators, AC vent aroma fresheners, solar ventilation fans.
  - Monsoon Season (Jul - Sep): Frameless silicone wiper blades, rain-repellent hydrophobic sprays, mud guards.
- **Top Competitor Search Terms in Pakistan:**
  - "car accessories rawalpindi", "car decoration islamabad", "ambient light for car price in pakistan", "car perfume wholesale saddar", "cod car gadget store pakistan", "dash cam price in islamabad".
`;
}

/**
 * Generate Intelligent Executive AI Copilot Response
 */
export async function generateAdminAiExecutiveResponse(
  userQuery: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  targetSeoUrl?: string
): Promise<string> {
  const [storeData, seoData] = await Promise.all([
    getAdminStoreSnapshot(),
    getStoreSeoAuditSnapshot(),
  ]);

  // Dynamic search if user mentions a specific product, order, or city
  const searchResults = await searchStoreItems(userQuery);

  // Dynamic live SEO audit if user asks about SEO or provides a URL/path
  let liveSeoAudit: any = null;
  const isSeoQuery = /(seo|meta|ranking|rank|google|audit|keywords|search engine|crawl)/i.test(userQuery);
  if (targetSeoUrl || isSeoQuery) {
    const pathToAudit = targetSeoUrl || (userQuery.match(/(\/[\w\d\-_/]+)/)?.[1] || '/');
    liveSeoAudit = await auditLivePageSeo(pathToAudit);
  }

  const regionalKnowledge = getRegionalMarketKnowledge();

  const dynamicContext = `
${searchResults && (searchResults.products.length > 0 || searchResults.orders.length > 0) ? `
### DYNAMIC STORE SEARCH RESULTS FOR CURRENT QUERY:
- Matched Products: ${JSON.stringify(searchResults.products, null, 2)}
- Matched Orders: ${JSON.stringify(searchResults.orders, null, 2)}
` : ''}

${liveSeoAudit ? `
### LIVE PAGE SEO AUDIT RESULTS (${liveSeoAudit.url}):
- Status: ${liveSeoAudit.status}
- Title: "${liveSeoAudit.title}"
- Description: "${liveSeoAudit.description}"
- H1 Headings: ${JSON.stringify(liveSeoAudit.h1)}
- OG Image: ${liveSeoAudit.ogImage || 'None'}
- Canonical Present: ${liveSeoAudit.hasCanonical}
- JSON-LD Present: ${liveSeoAudit.hasJsonLd}
- Issues Identified: ${liveSeoAudit.issues.join(' | ') || 'None'}
- Key Recommendations: ${liveSeoAudit.recommendations.join(' | ') || 'None'}
` : ''}
`;

  const systemPrompt = `
You are the "Pak-o-Drive Executive AI Copilot & Market Brain" — the chief digital business advisor, inventory analyst, market intelligence specialist, and SEO strategist for the Pak-o-Drive automotive & gadget e-commerce store in Pakistan.

### YOUR EXPERTISE & CAPABILITIES:
1. **Store Data Analysis**: You have real-time MongoDB access (total products, out of stock, low stock warnings, orders, pending vs delivered, revenue, categories, and matching search items).
2. **Pakistan & Twin Cities (Rawalpindi / Islamabad) Market Mastery**: You know the exact trends, consumer behavior, seasonal demands, car models (Civic, Corolla, Alto, Yaris, Sportage), and sourcing/retail price dynamics in Rawalpindi (Saddar, Sultan Ka Khoo, Murree Rd) and Islamabad (G-8, Blue Area, Bahria/DHA).
3. **Live SEO & Google Ranking Strategy**: You inspect real meta structures, keywords, slug health, search intent in Pakistan, and recommend actionable fixes to rank #1 on Google.
4. **Language & Formatting**: Respond in crisp, professional, friendly **Roman Urdu** by default (e.g., "Aapke store par...", "Islamabad aur Rawalpindi me..."). Match English or Urdu script if the user switches. Format responses with clean Markdown: bullet points, bold key figures, and clean compact tables where helpful.

### LIVE STORE DATA SNAPSHOT (REAL-TIME MONGODB):
- Total Products: ${storeData.totalProducts}
- Out of Stock Products: ${storeData.outOfStockCount}
- Low Stock Items (≤ 5 in stock): ${JSON.stringify(storeData.lowStockItems)}
- Top Selling Items: ${JSON.stringify(storeData.topSellingProducts)}
- Total Orders Recorded: ${storeData.totalOrders}
- Pending Orders: ${storeData.pendingOrdersCount}
- Delivered Orders: ${storeData.deliveredOrdersCount}
- Total Store Revenue: PKR ${storeData.totalRevenuePKR.toLocaleString()}
- Recent Order Customer Cities: ${storeData.recentOrdersCities.join(', ') || 'Nationwide'}
- Store Categories: ${storeData.categoriesList.join(', ')}
- SEO Health: ${seoData.totalMissingSeo} products have missing SEO metadata. Sample unoptimized: ${seoData.sampleUnoptimizedProducts.join(', ') || 'None'}.

${dynamicContext}

${regionalKnowledge}

### GUIDELINES FOR YOUR ANSWERS:
- Be direct, specific, and grounded in Pakistani e-commerce reality (COD cash-on-delivery dynamics, courier delivery times via Trax/TCS/PostEx, PKR pricing).
- If the user asks about Rawalpindi/Islamabad trends, mention specific car models (Civic, Corolla, Alto, Yaris, Sportage) and popular accessories suitable for Twin Cities weather, roads, and car enthusiasts.
- If asked about low stock or products, quote actual real numbers from the data above.
- If asked about SEO, provide concrete Meta Titles, Meta Descriptions, and High-Volume Keywords for Pakistani searchers (e.g., "car accessories rawalpindi cod", "car gadgets islamabad").
- Keep the output well-formatted and easy to read on mobile screens (use concise bullet points, bold highlights).
`;

  // Build conversational context
  let conversationText = '';
  if (history && history.length > 0) {
    const recentHistory = history.slice(-6);
    conversationText = recentHistory
      .map((h) => `${h.role === 'user' ? 'Admin' : 'AI Copilot'}: ${h.content}`)
      .join('\n\n');
  }

  const promptMessage = conversationText
    ? `Previous Conversation:\n${conversationText}\n\nAdmin Current Question:\n${userQuery}`
    : userQuery;

  try {
    const aiResult = await callMultiProviderAI(systemPrompt, promptMessage);
    if (aiResult && aiResult.text && aiResult.text.trim()) {
      return aiResult.text.trim();
    }
  } catch (error) {
    console.error('Error generating AI Copilot response:', error);
  }

  // Fallback if AI providers are temporarily slow
  return `
### Pak-o-Drive Intelligence Update 🚀
Aapke store ka live data snapshot yeh hai:
- **Total Products:** ${storeData.totalProducts} (Out of stock: ${storeData.outOfStockCount})
- **Total Orders:** ${storeData.totalOrders} (Pending: ${storeData.pendingOrdersCount})
- **Total Revenue:** PKR ${storeData.totalRevenuePKR.toLocaleString()}
- **Top Twin Cities Demand:** Ambient lighting, Solar Perfumes, aur 4K Dashcams (Islamabad/Rawalpindi Saddar & G-8 auto hubs).

*AI Engine refresh ho raha hai, baraye meherbani 10 seconds baad dubara query karein.*
`.trim();
}
