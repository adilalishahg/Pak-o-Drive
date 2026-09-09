import dbConnect from '@/lib/mongodb';
import LinkedInPostLog from '@/models/LinkedInPostLog';
import { callMultiProviderAI } from './multiAiEngine';
import { CURATED_DECKS } from './carouselGenerator';
import type { CarouselDeck, CarouselSlide } from './carousel/types';

export type TechTrack =
  | 'agentic-ai'
  | 'nextjs-react'
  | 'typescript'
  | 'cloud-architecture'
  | 'fullstack-performance';

export interface TechTrackInfo {
  id: TechTrack;
  title: string;
  description: string;
  focusKeywords: string[];
}

export const TECH_TRACKS: Record<TechTrack, TechTrackInfo> = {
  'agentic-ai': {
    id: 'agentic-ai',
    title: 'Agentic AI & Autonomous Coding',
    description: 'Autonomous Coding Agents, Tool Calling Loops, Model Context Protocol (MCP), Multi-Agent Orchestration',
    focusKeywords: ['AI Coding Agents', 'MCP Server', 'Autonomous Workflows', 'Tool Calling', 'Agentic Architecture'],
  },
  'nextjs-react': {
    id: 'nextjs-react',
    title: 'Next.js 16 & React 19 Architecture',
    description: 'React 19 Server Components, Next.js 16 App Router Caching, React Compiler, Server Actions, Hydration Guards',
    focusKeywords: ['React 19 Compiler', 'Next.js 16 Caching', 'Server Actions', 'SSR Hydration', 'PPR'],
  },
  'typescript': {
    id: 'typescript',
    title: 'Advanced TypeScript & Systems Typing',
    description: 'Type Narrowing, Discriminated Unions, Zero-Allocation Types, Advanced Generics, Compile-time Safety',
    focusKeywords: ['TypeScript 5', 'Inferred Type Predicates', 'Type Narrowing', 'Discriminated Unions', 'Generic Constraints'],
  },
  'cloud-architecture': {
    id: 'cloud-architecture',
    title: 'Cloud Systems & Resilient Architecture',
    description: 'Distributed Caching, Event-Driven Node.js, Modular Monoliths vs Microservices, Zero-Downtime Systems',
    focusKeywords: ['Distributed Systems', 'Event-Driven Architecture', 'Kafka / RabbitMQ', 'Zero-Downtime', 'Microservices'],
  },
  'fullstack-performance': {
    id: 'fullstack-performance',
    title: 'Full-Stack Web Vitals & DB Profiling',
    description: 'Core Web Vitals (INP/LCP), MongoDB Query Profiling & Indexes, Edge Computing, Tail Latency Optimization',
    focusKeywords: ['Core Web Vitals', 'INP Optimization', 'Database Execution Plans', 'MongoDB Indexes', 'Edge Latency'],
  },
};

/**
 * Fetch recently posted topics within the last 45 days to prevent duplicate posts
 */
export async function getRecentPostedTopics(days: number = 45): Promise<string[]> {
  try {
    await dbConnect();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const logs = await LinkedInPostLog.find({
      status: 'published',
      createdAt: { $gte: cutoffDate },
    })
      .select('topic')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return logs.map((l: any) => l.topic);
  } catch (err) {
    console.warn('⚠️ [DynamicCarouselAI] Could not fetch recent post history:', err);
    return [];
  }
}

/**
 * Select the track with the fewest recent posts or honor user manual selection
 */
export async function pickNextTrack(preferredTrack?: TechTrack | 'auto'): Promise<TechTrack> {
  if (preferredTrack && preferredTrack !== 'auto' && TECH_TRACKS[preferredTrack]) {
    return preferredTrack;
  }

  try {
    await dbConnect();
    const counts = await LinkedInPostLog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$track', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => {
      countMap[c._id] = c.count;
    });

    const trackKeys = Object.keys(TECH_TRACKS) as TechTrack[];
    // Sort tracks by ascending post frequency
    trackKeys.sort((a, b) => (countMap[a] || 0) - (countMap[b] || 0));
    return trackKeys[0] || 'agentic-ai';
  } catch {
    const trackKeys = Object.keys(TECH_TRACKS) as TechTrack[];
    return trackKeys[Math.floor(Math.random() * trackKeys.length)];
  }
}

/**
 * Robust JSON extraction from raw AI responses
 */
function extractJsonFromText(text: string | null | undefined): any {
  if (!text) return null;
  // First try direct parse
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Look for ```json ... ``` blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {}
  }

  // Look for outermost { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  return null;
}

/**
 * Validate and sanitize generated slides into standard CarouselDeck format
 */
function sanitizeGeneratedDeck(raw: any, track: TechTrack): CarouselDeck {
  const defaultTrack = TECH_TRACKS[track];
  const topic = (raw?.topic && typeof raw.topic === 'string' && raw.topic.trim()) || defaultTrack.title;
  let caption = (raw?.caption && typeof raw.caption === 'string' && raw.caption.trim()) || '';

  // Ensure high-reach hashtags in caption
  if (!caption.includes('#')) {
    const tags = defaultTrack.focusKeywords
      .map((k) => '#' + k.replace(/[^a-zA-Z0-9]/g, ''))
      .concat(['#SoftwareEngineering', '#TechArchitecture', '#WebDev', '#Programming'])
      .slice(0, 10)
      .join(' ');
    caption = `${caption || topic}\n\n👉 Swipe through the carousel document above for the complete visual breakdown! ➡️\n\n${tags}`;
  }

  const rawSlides = Array.isArray(raw?.slides) ? raw.slides : [];
  const sanitizedSlides: CarouselSlide[] = [];

  // 1. Cover slide
  const firstSlide = rawSlides[0];
  sanitizedSlides.push({
    isCover: true,
    slideType: 'cover',
    tag: firstSlide?.tag || defaultTrack.title.toUpperCase(),
    headline: firstSlide?.headline || topic,
    subheadline: firstSlide?.subheadline || 'Swipe to explore the complete visual breakdown',
    footer: 'SWIPE TO LEARN ->',
  });

  // 2. Middle slides (Slides 2 to N-1)
  for (let i = 1; i < rawSlides.length; i++) {
    const s = rawSlides[i];
    if (!s || typeof s !== 'object') continue;

    const isLast = i === rawSlides.length - 1;
    if (isLast) {
      // Outro slide
      sanitizedSlides.push({
        isSummary: true,
        slideType: 'outro',
        tag: s.tag || 'SUMMARY & ACTION',
        headline: s.headline || 'Key Takeaways & Next Steps',
        subheadline: s.subheadline || 'Implement these architectural principles in your production systems.',
        points: Array.isArray(s.points) && s.points.length > 0
          ? s.points.slice(0, 4)
          : [
              'Design for resilient failure boundaries.',
              'Profile memory and database bottlenecks before optimizing.',
              'Leverage automated workflows to maximize engineering leverage.',
            ],
        footer: 'Follow for more deep tech breakdowns',
      });
      break;
    }

    const slideType = s.slideType || (i % 2 === 0 ? 'stat_card' : 'intro');
    const slide: CarouselSlide = {
      slideType,
      tag: s.tag || `0${i} / ${defaultTrack.focusKeywords[i % defaultTrack.focusKeywords.length] || 'SYSTEM DESIGN'}`,
      headline: s.headline || `Key Architectural Insight ${i}`,
      subheadline: s.subheadline || '',
      footer: s.footer || 'Swipe to continue ->',
    };

    if (Array.isArray(s.points) && s.points.length > 0) {
      slide.points = s.points.slice(0, 4);
    }

    if (s.cardContent && typeof s.cardContent === 'object') {
      slide.cardContent = {
        badge: s.cardContent.badge || 'ARCHITECTURE',
        tagline: s.cardContent.tagline || 'Deep Dive /',
        title: s.cardContent.title || s.headline,
        subtitle: s.cardContent.subtitle,
        highlightText: s.cardContent.highlightText,
        bodyLines: Array.isArray(s.cardContent.bodyLines) ? s.cardContent.bodyLines : undefined,
      };
    }

    if (s.codeSnippet && typeof s.codeSnippet === 'string') {
      slide.codeSnippet = s.codeSnippet;
    }

    if (s.takeawayQuote && typeof s.takeawayQuote === 'string') {
      slide.takeawayQuote = s.takeawayQuote;
    }

    sanitizedSlides.push(slide);
  }

  // Ensure minimum 5 slides (Cover + 3 content + Outro)
  if (sanitizedSlides.length < 5) {
    const fillerTopics = defaultTrack.focusKeywords;
    while (sanitizedSlides.length < 5) {
      const idx = sanitizedSlides.length;
      sanitizedSlides.splice(sanitizedSlides.length - 1, 0, {
        slideType: 'stat_card',
        tag: `0${idx} / ${fillerTopics[idx % fillerTopics.length]}`,
        headline: `Production Insight: ${fillerTopics[idx % fillerTopics.length]}`,
        subheadline: 'Key architectural pattern for modern full-stack systems.',
        cardContent: {
          badge: 'BEST PRACTICE',
          title: `Optimizing ${fillerTopics[idx % fillerTopics.length]}`,
          highlightText: 'High throughput, zero downtime, and graceful degradation.',
          bodyLines: [
            'Separate compute boundaries from state stores.',
            'Maintain strict typing across API and network boundaries.',
          ],
        },
        footer: 'Swipe to continue ->',
      });
    }
  }

  return {
    topic,
    caption,
    slides: sanitizedSlides.slice(0, 8),
  };
}

/**
 * Master Generator: Generates a 100% dynamic, cutting-edge CarouselDeck with AI
 */
export async function generateDynamicTechCarouselDeck(
  preferredTrack?: TechTrack | 'auto'
): Promise<{ deck: CarouselDeck; track: TechTrack; isDynamic: boolean }> {
  const track = await pickNextTrack(preferredTrack);
  const trackInfo = TECH_TRACKS[track];
  const recentTopics = await getRecentPostedTopics(45);

  console.log(`🤖 [DynamicCarouselAI] Generating fresh technical carousel for track: "${trackInfo.title}"...`);
  if (recentTopics.length > 0) {
    console.log(`🛡️ [DynamicCarouselAI] Deduplicating against ${recentTopics.length} recent topics.`);
  }

  const systemPrompt = `You are a Principal Software Architect and elite Tech Content Creator who crafts viral, high-authority Slobodan Gajić-style technical carousels for LinkedIn.
Your audience: Senior Software Engineers, Tech Leads, CTOs, and Engineering Managers.
Domain: ${trackInfo.title} (${trackInfo.description}).
Tone: Authoritative, deeply technical, practical, zero fluff, concise.

Your goal is to generate a comprehensive, highly engaging 6-to-7 slide CarouselDeck formatted strictly as JSON.

Schema definition:
{
  "topic": "Catchy, high-impact headline (e.g. 'Why Server Actions Break Without Hydration Guards' or 'Agentic Loops: The 2026 Production Blueprint')",
  "caption": "A 5-paragraph LinkedIn post formatted for mobile feeds with strong 1-line hook, key technical insights formatted with emojis, clear CTA to swipe the attached PDF carousel, and 8-12 trending hashtags at the very bottom.",
  "slides": [
    {
      "slideType": "cover",
      "tag": "UPPERCASE CATEGORY BADGE",
      "headline": "Punchy Main Title (2-4 lines max)",
      "subheadline": "Compelling subtitle hooking the reader"
    },
    {
      "slideType": "intro",
      "tag": "01 / THE CORE PROBLEM",
      "headline": "Why traditional patterns fall short",
      "subheadline": "Real-world engineering bottlenecks in production",
      "points": [
        "Concise technical point 1",
        "Concise technical point 2",
        "Concise technical point 3"
      ]
    },
    {
      "slideType": "stat_card",
      "tag": "02 / THE ARCHITECTURE",
      "headline": "Key Architectural Shift",
      "cardContent": {
        "badge": "PRODUCTION METRIC",
        "title": "Clear system title",
        "highlightText": "Big prominent stat or focal statement",
        "bodyLines": [
          "Short concise sentence explaining the solution.",
          "Another concise sentence with concrete advice."
        ]
      },
      "takeawayQuote": "\\"Direct quotation or rule of thumb\\""
    },
    {
      "slideType": "stat_card",
      "tag": "03 / CODE & IMPLEMENTATION",
      "headline": "Production Hardening Pattern",
      "cardContent": {
        "badge": "BEST PRACTICE",
        "title": "Resilient Execution",
        "highlightText": "Zero-downtime, graceful degradation, and type safety",
        "bodyLines": [
          "Wrap state mutations in transactional boundaries.",
          "Use deterministic retries with exponential backoff."
        ]
      }
    },
    {
      "slideType": "stat_card",
      "tag": "04 / TRADE-OFF ANALYSIS",
      "headline": "Latency vs Complexity Trade-off",
      "cardContent": {
        "badge": "SYSTEM DESIGN",
        "title": "Evaluating the Architecture",
        "highlightText": "Every optimization incurs an operational cost",
        "bodyLines": [
          "Measure cache hit ratio before introducing secondary layers.",
          "Avoid premature abstraction when single-node suffices."
        ]
      }
    },
    {
      "slideType": "outro",
      "tag": "SUMMARY & TAKEAWAYS",
      "headline": "What to Implement Today",
      "subheadline": "Summary checklist for your team",
      "points": [
        "Actionable takeaway 1",
        "Actionable takeaway 2",
        "Actionable takeaway 3"
      ]
    }
  ]
}

CRITICAL RULES:
1. OUTPUT PURE JSON ONLY. No markdown wrapper outside the JSON if possible. No commentary before or after.
2. The topic must be FRESH, modern, and NOT mention any of these previously posted topics:
${recentTopics.slice(0, 15).map((t, idx) => `   ${idx + 1}. "${t}"`).join('\n') || '   None'}
3. Every slide headline must be impactful and concise (fits comfortably on 1080x1350 slide canvas).`;

  const userMessage = `Generate a fresh, cutting-edge LinkedIn carousel deck on: "${trackInfo.title}".
Keywords: ${trackInfo.focusKeywords.join(', ')}.
Make sure it represents modern 2026 software engineering reality. Return pure valid JSON matching the schema.`;

  try {
    const aiRes = await callMultiProviderAI(systemPrompt, userMessage);
    const parsedJson = extractJsonFromText(aiRes.text);

    if (parsedJson && parsedJson.topic && Array.isArray(parsedJson.slides)) {
      const sanitizedDeck = sanitizeGeneratedDeck(parsedJson, track);
      console.log(`✓ [DynamicCarouselAI] Successfully generated dynamic deck: "${sanitizedDeck.topic}" (${sanitizedDeck.slides.length} slides)`);
      return {
        deck: sanitizedDeck,
        track,
        isDynamic: true,
      };
    }
    console.warn('⚠️ [DynamicCarouselAI] AI returned invalid JSON structure, falling back to curated deck.');
  } catch (aiErr) {
    console.warn('⚠️ [DynamicCarouselAI] AI generation error:', aiErr);
  }

  // Graceful fallback to CURATED_DECKS to guarantee zero PDF breakage
  const fallbackIndex = Math.floor(Math.random() * CURATED_DECKS.length);
  const fallbackDeck = CURATED_DECKS[fallbackIndex];
  console.log(`🔄 [DynamicCarouselAI] Using curated deck fallback: "${fallbackDeck.topic}"`);

  return {
    deck: fallbackDeck,
    track,
    isDynamic: false,
  };
}
