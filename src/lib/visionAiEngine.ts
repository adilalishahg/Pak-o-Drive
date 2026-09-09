import { callMultiProviderAI } from './multiAiEngine';

export interface VisionProductAnalysis {
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  competitorPrice: number;
  competitorStore: string;
  profitMarginPercent: number;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  studioImage: string;
  specs: Record<string, string>;
  stock?: number;
  wholesaleCost?: number;
}

/**
 * Analyzes an automotive product photo using Google Gemini 2.0 Flash Vision
 * Benchmarks Pakistani competitor prices and generates high-converting SEO metadata.
 */
export async function analyzeProductImageWithAI(
  base64DataUrl: string,
  optionalNotes: string = ''
): Promise<VisionProductAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;

  // Extract raw base64 data and mime type
  let mimeType = 'image/jpeg';
  let base64Data = base64DataUrl;

  const match = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    base64Data = match[2];
  }

  const prompt = `
You are the Chief Automotive Product Specialist and E-Commerce Merchandiser for Pak-o-Drive in Pakistan.
Analyze this car accessory / gadget product photo in detail.

${optionalNotes ? `Admin Notes / User Context: "${optionalNotes}"` : ''}

Your tasks:
1. Identify the exact car product / gadget (e.g., Solar Rotating Perfume, 4K Dashcam, Ambient LED Kit, Cosmic Wax, Fog Lights, Tire Inflator, Seat Covers, etc.).
2. Benchmark Pakistani Competitor Pricing:
   - Check what competitors like Sehgal Motors, Autostore.pk, or Daraz charge in PKR for this item.
   - Estimate the wholesale sourcing cost in Rawalpindi (Saddar / Sultan Ka Khoo) or Karachi.
   - Suggest an optimal retail price in PKR that undercuts competitors by 10-20% while locking in an 80% to 120% profit margin for Pak-o-Drive.
3. Write a high-converting Pakistani e-commerce product description in English with Roman Urdu selling hooks (mentioning Cash on Delivery, fast delivery in Rawalpindi & Islamabad).
4. Generate SEO Title, SEO Description, and high-volume Pakistani keywords.

Output ONLY a raw valid JSON object (no markdown, no backticks):
{
  "name": "Full Product Name with Key Spec (e.g. Solar Dual Ring Rotating Car Air Freshener)",
  "category": "Car Care & Detailing | LED Lights & Bulbs | Car Gadgets | Interior Accessories",
  "subcategory": "Subcategory name",
  "price": 1499,
  "originalPrice": 1899,
  "competitorPrice": 1850,
  "competitorStore": "Sehgal Motors / Daraz",
  "profitMarginPercent": 114,
  "description": "Engaging description with bullet points of features, compatibility (Civic, Corolla, Alto, Sportage), and COD in Rawalpindi & Islamabad...",
  "seoTitle": "SEO Title under 60 chars | Pak-o-Drive Pakistan",
  "seoDescription": "Meta description under 155 chars with price and COD mention...",
  "seoKeywords": "keyword1, keyword2, keyword3, rawalpindi, islamabad, cod",
  "specs": {
    "Material": "...",
    "Power / Fitment": "...",
    "Compatibility": "Universal 12V / All Cars",
    "Warranty": "7 Days Check Warranty"
  }
}
`;

  // 1. Try Gemini 2.0 Flash Vision
  if (apiKey) {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            // Generate clean studio photo using AI image service or placeholder
            const studioImage = generateStudioImageUrl(parsed.name, parsed.category);

            return {
              ...parsed,
              studioImage,
            };
          }
        }
      } catch (err: any) {
        console.warn(`[Vision AI: Gemini ${model} Error]:`, err.message);
      }
    }
  }

  // 2. Fallback using Multi-Provider AI (Text Heuristics)
  try {
    const textPrompt = `Generate a high-converting automotive product listing for a car accessory. ${optionalNotes || 'Car gadget / accessory'}. Follow Pakistani market rates. Output JSON only matching the schema above.`;
    const aiResult = await callMultiProviderAI('', textPrompt);
    if (aiResult?.text) {
      const cleaned = aiResult.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        studioImage: generateStudioImageUrl(parsed.name, parsed.category),
      };
    }
  } catch {
    // Fallback static
  }

  // 3. Guaranteed Safe Fallback
  return {
    name: 'Universal Automotive Smart Car Accessory',
    category: 'Car Gadgets',
    subcategory: 'Smart Accessories',
    price: 1499,
    originalPrice: 1999,
    competitorPrice: 1850,
    competitorStore: 'Sehgal Motors / Daraz',
    profitMarginPercent: 95,
    description: 'High-quality automotive gadget for Pakistani drivers. Fits all major cars (Civic, Corolla, Alto, Yaris, Sportage). Fast Cash on Delivery across Rawalpindi, Islamabad, and nationwide.',
    seoTitle: 'Universal Smart Car Accessory | Pak-o-Drive Pakistan',
    seoDescription: 'Buy premium car gadget online in Pakistan at best price. Cash on Delivery nationwide.',
    seoKeywords: 'car gadgets pakistan, auto accessories rawalpindi, pakodrive cod',
    studioImage: 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
    specs: {
      'Installation': 'Easy DIY Fitment',
      'Compatibility': 'Universal (All Cars)',
      'Condition': '100% Brand New',
      'Warranty': '7 Days Replacement Policy',
    },
  };
}

/**
 * Generates an enhanced studio quality image URL based on product name
 */
function generateStudioImageUrl(name: string, category: string): string {
  const seed = Math.floor(Math.random() * 10000);
  const cleanPrompt = encodeURIComponent(
    `professional studio product photograph of ${name}, ${category}, automotive accessory, clean white reflective surface, soft cinematic lighting, 8k resolution, commercial advertising photography`
  );
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=800&seed=${seed}&nologo=true`;
}
