import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratedBlogDraft {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
}

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';

/**
 * Autonomous Gemini blog generator tailored for Pakistani automotive landscape.
 * Uses gemini-2.5-flash to produce comprehensive, SEO-optimized, 1000+ word guides.
 */
export async function generateBlogDraft(
  topic: string,
  keywords: string[] = []
): Promise<GeneratedBlogDraft> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are a Principal Automotive Journalist & SEO Specialist in Pakistan writing for "Pak-o-Drive" (Pakistan's premier automotive accessories and car care platform).

Topic: "${topic}"
Target Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'car accessories Pakistan, car maintenance tips, auto care Rawalpindi Islamabad Lahore Karachi'}

Write an authoritative, highly comprehensive, engaging, and practical blog article specifically crafted for Pakistani drivers and car owners.

Key Requirements:
1. Content length: Minimum 1,000+ words of deep, practical advice.
2. Structure:
   - Catchy, punchy title.
   - Concise excerpt under 280 characters summarizing the article.
   - Comprehensive Markdown body with structured H2 and H3 headings, numbered checklists, comparative tables, and bullet points.
   - Local context: Mention Pakistani climate (extreme summer heat, monsoon rain, smog/fog in Punjab, dusty conditions), local fuel quality, common car models in Pakistan (e.g. Alto, Corolla, Civic, City, Yaris, Swift, Sportage), road conditions (potholes, highway vs city traffic), and genuine maintenance advice.
   - Actionable DIY tips and maintenance intervals.
   - Recommendations on practical automotive accessories (e.g., solar car perfumes, LED headlights, portable tire inflators, car interior vacuums, ambient lighting) without being overly salesy.
3. SEO:
   - seoTitle: High-CTR search title under 60 characters.
   - seoDescription: Click-worthy meta description under 155 characters mentioning Cash on Delivery / Pakistani driver context.

Return ONLY a valid JSON object with the following exact keys:
{
  "title": "String",
  "excerpt": "String",
  "seoTitle": "String",
  "seoDescription": "String",
  "content": "String (Full formatted Markdown with ##, ###, lists, bold text)"
}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    const parsed: GeneratedBlogDraft = JSON.parse(responseText);
    return {
      title: parsed.title || topic,
      excerpt: parsed.excerpt || '',
      seoTitle: parsed.seoTitle || parsed.title || topic,
      seoDescription: parsed.seoDescription || parsed.excerpt || '',
      content: parsed.content || '',
    };
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', responseText, err);
    throw new Error('Gemini response could not be parsed into valid blog draft JSON.');
  }
}
