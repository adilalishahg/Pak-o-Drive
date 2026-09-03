import { GoogleGenerativeAI } from '@google/generative-ai';
import { ICompetitorAd } from '../types/productAds';

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';

export interface ProductAdAiResult {
  coreMarketTerm: string;
  marketKeywords: string[];
  topCompetitorAds: ICompetitorAd[];
  isAiGenerated: boolean;
}

// Extract core consumer search term using smart rules if AI is offline
export function extractFallbackMarketTerm(productName: string): { coreTerm: string; keywords: string[] } {
  const clean = (productName || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\b(single|pair|heavy duty|extra large|large|high gloss|super fast|multi purpose|17cm|200g|set of \d+)\b/gi, '')
    .trim();

  // Normalize specific automotive & tech items
  let coreTerm = clean;
  if (/mehran/i.test(clean) && /mirror/i.test(clean)) coreTerm = 'Mehran side mirror';
  else if (/wax|polish/i.test(clean)) coreTerm = 'Car wax polish';
  else if (/earbuds|tws/i.test(clean)) coreTerm = 'Wireless screen earbuds';
  else if (/tape/i.test(clean)) coreTerm = 'Double sided foam tape';
  else if (/led|drl/i.test(clean)) coreTerm = 'Car DRL LED lights';
  else if (/spray paint/i.test(clean)) coreTerm = 'Car spray paint';
  else if (/towel|microfiber/i.test(clean)) coreTerm = 'Microfiber car towel';
  else if (/freshner|freshener/i.test(clean)) coreTerm = 'Solar car air freshener';
  else if (/charger/i.test(clean)) coreTerm = 'Retractable car charger';

  const keywords = [
    `${coreTerm} pakistan`,
    `${coreTerm} online shopping`,
    `${coreTerm} daraz price`,
    `best ${coreTerm} cash on delivery`,
    `viral ${coreTerm} tiktok`,
  ];

  return { coreTerm, keywords };
}

// Generate at least 5 realistic, high-converting competitor ads for the Pakistani market
export function generate5CompetitorAds(productName: string, coreTerm: string, price: number): ICompetitorAd[] {
  const encTerm = encodeURIComponent(coreTerm);
  const encTermPk = encodeURIComponent(`${coreTerm} pakistan`);

  return [
    {
      id: `ad_tiktok_1_${Date.now()}`,
      platform: 'TikTok',
      adTitle: `Viral 9:16 TikTok Hook: "${coreTerm} in Action"`,
      adAngle: 'Problem-Solution / High Curiosity UGC format',
      format: '9:16 Vertical Video (Reels/TikTok)',
      adSearchQuery: `${coreTerm} pakistan`,
      directAdUrl: `https://www.tiktok.com/search?q=${encTermPk}`,
      estimatedSpendPKR: 42000,
      activeDays: 24,
      hookUrdu: `Agar aap bhi is maslay se tang hain tou yeh choti si cheez aapke rozana ke hazaron rupay bacha sakti hai!`,
      performanceRating: '🔥 Scaling Campaign',
    },
    {
      id: `ad_meta_2_${Date.now()}`,
      platform: 'Meta',
      adTitle: `Facebook Video Feed: "OEM Quality ${coreTerm} with COD"`,
      adAngle: 'Direct Response / Price Comparison vs Local Market',
      format: '1:1 Square Video Post + Shop Now Button',
      adSearchQuery: coreTerm,
      directAdUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encTerm}&search_type=keyword_unordered&media_type=all`,
      estimatedSpendPKR: 35000,
      activeDays: 19,
      hookUrdu: `Market mein yeh Rs. ${Math.round(price * 1.35)} ka bik raha hai jabkay hum direct importer rate par de rahay hain. Cash on delivery available!`,
      performanceRating: '⭐ Top Performer',
    },
    {
      id: `ad_insta_3_${Date.now()}`,
      platform: 'Instagram',
      adTitle: `Instagram Reels: "Aesthetic Unboxing & Fitment Test"`,
      adAngle: 'Visual Satisfaction & Quality Build Check',
      format: 'Instagram 9:16 Reel with Trending Audio',
      adSearchQuery: `${coreTerm}`,
      directAdUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encTerm}&search_type=keyword_unordered&media_type=video`,
      estimatedSpendPKR: 28000,
      activeDays: 15,
      hookUrdu: `Check karein iski unboxing aur finishing! 7-days check guarantee ke sath apne ghar mangwayein.`,
      performanceRating: '⚡ High CTR Creative',
    },
    {
      id: `ad_tiktok_4_${Date.now()}`,
      platform: 'TikTok',
      adTitle: `TikTok Creator Review: "Honest Testing of ${coreTerm}"`,
      adAngle: 'Social Proof / Influencer Demonstration',
      format: '9:16 Creator Review with Voiceover',
      adSearchQuery: `${coreTerm} review`,
      directAdUrl: `https://www.tiktok.com/search?q=${encodeURIComponent(coreTerm + ' testing pakistan')}`,
      estimatedSpendPKR: 31000,
      activeDays: 11,
      hookUrdu: `Maine Daraz aur Hall Road se mangwaya tha par yeh wala best nikla. Dekhein live test!`,
      performanceRating: '🔥 Scaling Campaign',
    },
    {
      id: `ad_facebook_5_${Date.now()}`,
      platform: 'Facebook',
      adTitle: `Meta Retargeting: "Limited Stock 3-Day Discount Offer"`,
      adAngle: 'Urgency & Scarcity / Free Gift Bundle',
      format: 'Carousel Ad (Features & Customer Proof)',
      adSearchQuery: `${coreTerm} deal`,
      directAdUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encTerm}&search_type=keyword_unordered&media_type=all`,
      estimatedSpendPKR: 22000,
      activeDays: 8,
      hookUrdu: `Stock bohot limited hai! Pehle 50 customers ke liye Cash on Delivery par special discount rate.`,
      performanceRating: '⭐ Top Performer',
    },
  ];
}

// Master Function: AI Semantic Resolution with Resilient Fallback
export async function resolveProductAdIntelligence(
  productName: string,
  category: string,
  price: number
): Promise<ProductAdAiResult> {
  const fallback = extractFallbackMarketTerm(productName);
  const fallbackAds = generate5CompetitorAds(productName, fallback.coreTerm, price);

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      coreMarketTerm: fallback.coreTerm,
      marketKeywords: fallback.keywords,
      topCompetitorAds: fallbackAds,
      isAiGenerated: false,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.2,
      },
    });

    const prompt = `You are a top Pakistani E-Commerce & TikTok/Meta Ads Specialist.
Our store product title is: "${productName}" (Category: "${category}", Price: PKR ${price}).

Pakistani competitors do NOT run ads using long raw titles; they run ads using common colloquial consumer search phrases (e.g. for "Suzuki Mehran Replacement Side Door Mirror Single", competitors search "Mehran side mirror").

Respond in valid JSON only with this structure:
{
  "coreMarketTerm": "colloquial 2-4 word product search term used in Pakistan",
  "marketKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"],
  "topCompetitorAds": [
    {
      "platform": "TikTok" or "Meta" or "Instagram" or "Facebook",
      "adTitle": "realistic creative title in Pakistan",
      "adAngle": "angle (e.g. Problem-Solution, Viral Curiosity)",
      "format": "e.g. 9:16 UGC Reel or 1:1 Video",
      "estimatedSpendPKR": number between 20000 and 50000,
      "activeDays": number between 5 and 30,
      "hookUrdu": "viral hook in Roman Urdu spoken in the ad",
      "performanceRating": "🔥 Scaling Campaign" or "⭐ Top Performer" or "⚡ High CTR Creative"
    }
  ]
}
Include at least 5 ads across TikTok, Meta, and Instagram. Return ONLY raw JSON, no markdown fences.`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawText);

    if (parsed.coreMarketTerm && Array.isArray(parsed.topCompetitorAds) && parsed.topCompetitorAds.length >= 5) {
      const coreTerm = parsed.coreMarketTerm;
      const formattedAds: ICompetitorAd[] = parsed.topCompetitorAds.map((ad: any, idx: number) => {
        const query = ad.adSearchQuery || coreTerm;
        let directAdUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query + ' pakistan')}`;
        if (ad.platform === 'Meta' || ad.platform === 'Facebook') {
          directAdUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(query)}&search_type=keyword_unordered&media_type=all`;
        } else if (ad.platform === 'Instagram') {
          directAdUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(query)}&search_type=keyword_unordered&media_type=video`;
        }

        return {
          id: `ai_ad_${idx}_${Date.now()}`,
          platform: ad.platform || (idx % 2 === 0 ? 'TikTok' : 'Meta'),
          adTitle: ad.adTitle || `Ad Creative for ${coreTerm}`,
          adAngle: ad.adAngle || 'Viral Problem/Solution Hook',
          format: ad.format || '9:16 Vertical Video',
          adSearchQuery: query,
          directAdUrl,
          estimatedSpendPKR: Number(ad.estimatedSpendPKR) || 30000,
          activeDays: Number(ad.activeDays) || 12,
          hookUrdu: ad.hookUrdu || 'Check karein iski unboxing aur quality!',
          performanceRating: ad.performanceRating || '🔥 Scaling Campaign',
        };
      });

      return {
        coreMarketTerm: parsed.coreMarketTerm,
        marketKeywords: parsed.marketKeywords || fallback.keywords,
        topCompetitorAds: formattedAds,
        isAiGenerated: true,
      };
    }

    return {
      coreMarketTerm: fallback.coreTerm,
      marketKeywords: fallback.keywords,
      topCompetitorAds: fallbackAds,
      isAiGenerated: false,
    };
  } catch (err) {
    console.warn('[AdIntelligenceAi] Fallback applied:', err);
    return {
      coreMarketTerm: fallback.coreTerm,
      marketKeywords: fallback.keywords,
      topCompetitorAds: fallbackAds,
      isAiGenerated: false,
    };
  }
}
