import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratedBlogResponse {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  suggestedProductKeywords: string[];
  readTimeMinutes: number;
  providerUsed: string;
}

/**
 * Generate a clean URL slug from any title
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strip Markdown code fences and cleanup JSON strings
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  // Remove any deep thinking blocks if returned by DeepSeek/reasoning models
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  return cleaned;
}

/**
 * Adapt journalist persona and editorial guidelines based on topic category
 */
function getCategoryPersona(category?: string): { persona: string; focusGuidelines: string } {
  const cat = (category || '').toLowerCase();

  if (cat.includes('tech') || cat.includes('ai') || cat.includes('it')) {
    return {
      persona: "You are a world-class Technology Journalist, AI Researcher, and Digital Gadgets Analyst writing for an authoritative digital publication.",
      focusGuidelines: `
- Deep-dive into technical clarity without overwhelming general readers.
- Cover cutting-edge AI breakthroughs, software tools, smart gadgets, cybersecurity, and future trends.
- Include actionable productivity tips, software setups, or gadget buying criteria.
- Present specifications or tool comparisons in a structured Markdown comparison table.`
    };
  }

  if (cat.includes('health') || cat.includes('wellness') || cat.includes('care')) {
    return {
      persona: "You are an experienced Health & Wellness Research Writer and Preventive Healthcare Specialist.",
      focusGuidelines: `
- Provide scientifically grounded, safe, and actionable health, nutrition, and wellness advice.
- Emphasize daily physical and mental habits, sleep hygiene, natural immunity, and stress reduction.
- Present a daily routine schedule, meal plan, or symptom-vs-solution in a Markdown comparison table.
- Maintain an encouraging, empathetic, and medically responsible tone.`
    };
  }

  if (cat.includes('fashion') || cat.includes('style') || cat.includes('lifestyle')) {
    return {
      persona: "You are an elite Fashion Editor, Wardrobe Stylist, and Modern Lifestyle Trend Forecaster.",
      focusGuidelines: `
- Offer timeless styling advice, fabric quality knowledge, seasonal aesthetics, and personal grooming.
- Explain how to build a high-impact wardrobe on any budget, pairing versatile essentials with bold statements.
- Provide a styling matrix or seasonal wardrobe checklist in a Markdown comparison table.
- Focus on confidence, fragrance layering, accessories, and sustainable style.`
    };
  }

  if (cat.includes('global') || cat.includes('world') || cat.includes('news') || cat.includes('trend')) {
    return {
      persona: "You are a Senior Global Affairs, Modern Economics, and Viral Culture Investigative Journalist.",
      focusGuidelines: `
- Deliver engaging storytelling, global milestones, mega-infrastructure projects, and economic trends.
- Explain the 'Why it matters to everyday people' behind world events, emerging markets, and viral phenomena.
- Include a breakdown table of global trends, key metrics, or comparative milestones.
- Keep the tone fascinating, objective, and thought-provoking.`
    };
  }

  // Default / Automotive & Gadgets
  return {
    persona: "You are an Automotive Journalist, Smart Mobility Expert, and Senior Technical Advisor.",
    focusGuidelines: `
- Ground in real-world driving realities (extreme weather, highway safety, fuel economy hacks, vehicle maintenance).
- Mention popular vehicles, smart road safety tips, and DIY vehicle care.
- Include practical checklists and a Markdown comparison table of maintenance schedules or solutions.`
  };
}

/**
 * Universal Master Prompt for High-Ranking, Viral & AdSense-Compliant Blog Guides
 */
function buildBlogPrompt(topic: string, keywords: string[] = [], categoryHint?: string): string {
  const keywordStr = keywords.length > 0 
    ? keywords.join(', ') 
    : 'trending insights, viral guide, practical tips, high-value advice';

  const { persona, focusGuidelines } = getCategoryPersona(categoryHint);
  const resolvedCategory = categoryHint || 'Trending & Viral News';

  return `
${persona}

TOPIC: "${topic}"
TARGET KEYWORDS: ${keywordStr}
CATEGORY: "${resolvedCategory}"

MISSION:
Produce an authoritative, deeply engaging, and comprehensive 1,200+ word viral guide engineered to rank #1 on Google Search, attract thousands of social shares, and comply 100% with Google AdSense and Helpful Content E-E-A-T guidelines.

KEY EDITORIAL CRITERIA:
1. Category-Specific Expertise:
${focusGuidelines}

2. Actionable & Human-Like Structure:
   - Catchy, high-CTR H1 Title (compelling, no generic clickbait).
   - Strong narrative hook in the introduction that immediately captivates the reader.
   - Structured H2 (##) and H3 (###) subheadings delivering practical, step-by-step value.
   - At least ONE rich Markdown comparison table (e.g., Pros vs Cons, Specifications, Symptoms vs Solutions, or Routine Checklist).
   - Bulleted takeaway checklists or actionable frameworks.
   - ZERO robotic fluff or repetitive phrases (avoid starting paragraphs with "In today's fast-paced world..."). Write with authentic journalistic flair.

3. Interactive Google-Schema FAQ Section:
   - 4 to 5 high-intent, direct Questions and Answers that people frequently search on Google regarding this topic.

4. Smart Product / Gadget Linking:
   - Provide 3 to 5 generic product search terms (e.g., ["wireless charger", "smart watch", "car vacuum", "air purifier", "ergonomic pillow"]) that can naturally relate to modern lifestyle or accessories.

RETURN ONLY VALID JSON (no explanation, no markdown wrap outside JSON):
{
  "title": "String (Compelling H1 Title)",
  "slug": "String (URL friendly kebab-case)",
  "excerpt": "String (Under 260 characters summarizing the core value)",
  "category": "${resolvedCategory}",
  "tags": ["String", "String", "String", "String"],
  "content": "String (Complete Markdown text with ##, ###, tables, bullet points, and practical advice)",
  "faqs": [
    { "question": "String", "answer": "String" },
    { "question": "String", "answer": "String" },
    { "question": "String", "answer": "String" },
    { "question": "String", "answer": "String" }
  ],
  "seoTitle": "String (Under 60 chars with high click-through intent)",
  "seoDescription": "String (Under 155 chars highlighting practical reader benefits)",
  "seoKeywords": ["String", "String", "String"],
  "suggestedProductKeywords": ["String", "String", "String"],
  "readTimeMinutes": 6
}
`;
}

/**
 * 1. Primary Model: Google Gemini (2.5-flash / pro)
 */
async function generateWithGemini(prompt: string): Promise<GeneratedBlogResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
  if (!apiKey) return null;

  const models = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
  ];

  for (const modelName of models) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleaned = cleanJsonString(rawText);
      const parsed = JSON.parse(cleaned);

      if (parsed.title && parsed.content) {
        return {
          title: parsed.title,
          slug: parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.title),
          excerpt: parsed.excerpt || '',
          content: parsed.content,
          category: parsed.category || 'Car Maintenance',
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['Car Care', 'Pakistan', 'Pak-o-Drive'],
          faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
          seoTitle: parsed.seoTitle || parsed.title,
          seoDescription: parsed.seoDescription || parsed.excerpt || '',
          seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
          suggestedProductKeywords: Array.isArray(parsed.suggestedProductKeywords) ? parsed.suggestedProductKeywords : [],
          readTimeMinutes: Number(parsed.readTimeMinutes) || Math.max(3, Math.round(parsed.content.split(/\s+/).length / 200)),
          providerUsed: `Gemini (${modelName})`,
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini Blog Gen Failed with ${modelName}]:`, err?.message || err);
    }
  }

  return null;
}

/**
 * 2. Secondary Fast Fallback: Groq Cloud (Llama-3.3-70B)
 */
async function generateWithGroq(prompt: string): Promise<GeneratedBlogResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const models = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'groq/compound',
  ];

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an elite automotive SEO writer and JSON generator. Always return strictly valid JSON matching the user schema.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
          max_tokens: 4096,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (rawContent) {
          const cleaned = cleanJsonString(rawContent);
          const parsed = JSON.parse(cleaned);

          if (parsed.title && parsed.content) {
            return {
              title: parsed.title,
              slug: parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.title),
              excerpt: parsed.excerpt || '',
              content: parsed.content,
              category: parsed.category || 'Car Maintenance',
              tags: Array.isArray(parsed.tags) ? parsed.tags : ['Car Care', 'Pakistan'],
              faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
              seoTitle: parsed.seoTitle || parsed.title,
              seoDescription: parsed.seoDescription || parsed.excerpt || '',
              seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
              suggestedProductKeywords: Array.isArray(parsed.suggestedProductKeywords) ? parsed.suggestedProductKeywords : [],
              readTimeMinutes: Number(parsed.readTimeMinutes) || Math.max(3, Math.round(parsed.content.split(/\s+/).length / 200)),
              providerUsed: `Groq (${model})`,
            };
          }
        }
      } else {
        const errText = await res.text();
        console.warn(`[Groq ${model} Error ${res.status}]:`, errText);
      }
    } catch (err: any) {
      console.warn(`[Groq Blog Gen Failed with ${model}]:`, err?.message || err);
    }
  }

  return null;
}

/**
 * 3. Tertiary Fallback: Hugging Face Router
 */
async function generateWithHuggingFace(prompt: string): Promise<GeneratedBlogResponse | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!apiKey) return null;

  const models = [
    'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
  ];

  for (const model of models) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an automotive journalist. Output strictly valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.6,
          max_tokens: 3800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (rawContent) {
          const cleaned = cleanJsonString(rawContent);
          const parsed = JSON.parse(cleaned);

          if (parsed.title && parsed.content) {
            return {
              title: parsed.title,
              slug: parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.title),
              excerpt: parsed.excerpt || '',
              content: parsed.content,
              category: parsed.category || 'Car Maintenance',
              tags: Array.isArray(parsed.tags) ? parsed.tags : ['Automotive'],
              faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
              seoTitle: parsed.seoTitle || parsed.title,
              seoDescription: parsed.seoDescription || parsed.excerpt || '',
              seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [],
              suggestedProductKeywords: Array.isArray(parsed.suggestedProductKeywords) ? parsed.suggestedProductKeywords : [],
              readTimeMinutes: Number(parsed.readTimeMinutes) || 5,
              providerUsed: `Hugging Face (${model})`,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn(`[HuggingFace Blog Gen Failed]:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Master Multi-Model Blog Generator with Auto-Fallback
 */
export async function generateMultiAiBlogDraft(
  topic: string,
  keywords: string[] = [],
  categoryHint?: string
): Promise<GeneratedBlogResponse> {
  const prompt = buildBlogPrompt(topic, keywords, categoryHint);

  // 1. First Priority: Gemini (Google ecosystem & localized expertise)
  const geminiResult = await generateWithGemini(prompt);
  if (geminiResult) return geminiResult;

  // 2. Second Priority: Groq (Ultra-fast Llama-3.3-70B)
  const groqResult = await generateWithGroq(prompt);
  if (groqResult) return groqResult;

  // 3. Third Priority: Hugging Face
  const hfResult = await generateWithHuggingFace(prompt);
  if (hfResult) return hfResult;

  throw new Error('All AI providers (Gemini, Groq, Hugging Face) failed or their API keys are missing/exhausted.');
}
