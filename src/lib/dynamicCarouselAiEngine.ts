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

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'in', 'on', 'at', 'to', 'from',
  'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'against', 'during', 'without', 'before', 'under', 'around', 'among', 'vs', 'versus',
  'how', 'why', 'what', 'when', 'explained', 'strategies', 'guide', 'complete', 'deep',
  'dive', 'breakdown', 'masterclass', 'cheat', 'sheet', 'part', 'production', 'modern',
  'architectures', 'systems', 'design'
]);

/**
 * Tokenizes and normalizes topic string into meaningful technical keywords
 */
export function normalizeTopicTokens(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Calculates Jaccard token overlap between two technical topics
 */
export function calculateTopicSimilarity(topicA: string, topicB: string): {
  score: number;
  sharedTokens: string[];
} {
  const tokensA = new Set(normalizeTopicTokens(topicA));
  const tokensB = new Set(normalizeTopicTokens(topicB));
  if (tokensA.size === 0 || tokensB.size === 0) return { score: 0, sharedTokens: [] };

  const intersection: string[] = [];
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersection.push(token);
    }
  });

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  const score = unionSize > 0 ? intersection.length / unionSize : 0;
  return { score, sharedTokens: intersection };
}

/**
 * Strict verification gate: Checks if a candidate topic or content is duplicate or overly similar to past posts
 */
export function isTopicDuplicate(
  candidateTopic: string,
  candidateCaption: string = '',
  pastTopics: string[]
): { isDuplicate: boolean; reason?: string; matchedTopic?: string } {
  if (!candidateTopic) return { isDuplicate: false };
  const normCandidate = candidateTopic.toLowerCase().trim();

  // 1. Exact match or candidate contains full past topic
  for (const past of pastTopics) {
    const normPast = past.toLowerCase().trim();
    if (!normPast) continue;

    if (normCandidate === normPast) {
      return { isDuplicate: true, reason: 'Exact match with previous post', matchedTopic: past };
    }
    if (normCandidate.includes(normPast) || normPast.includes(normCandidate)) {
      return { isDuplicate: true, reason: 'Direct substring match with previous post', matchedTopic: past };
    }

    // 2. Token Jaccard overlap (> 30% overlap with 2+ shared keywords)
    const { score, sharedTokens } = calculateTopicSimilarity(candidateTopic, past);
    if (score >= 0.30 && sharedTokens.length >= 2) {
      return {
        isDuplicate: true,
        reason: `High semantic overlap (${Math.round(score * 100)}%): shared keywords [${sharedTokens.join(', ')}]`,
        matchedTopic: past,
      };
    }
  }

  // 3. Specific domain keyword collision check (e.g. CSR vs SSR vs SSG vs ISR / Rendering)
  for (const past of pastTopics) {
    const normPast = past.toLowerCase();
    const isPastRendering = normPast.includes('render') || normPast.includes('csr') || normPast.includes('ssr');
    const isCandidateRendering = normCandidate.includes('render') || normCandidate.includes('csr') || normCandidate.includes('ssr');
    if (isPastRendering && isCandidateRendering) {
      return {
        isDuplicate: true,
        reason: 'Rendering (CSR/SSR/SSG/ISR) topic already published previously',
        matchedTopic: past,
      };
    }

    const isPastIndex = normPast.includes('index') && normPast.includes('database');
    const isCandidateIndex = normCandidate.includes('index') && normCandidate.includes('database');
    if (isPastIndex && isCandidateIndex) {
      return {
        isDuplicate: true,
        reason: 'Database Indexing topic already published previously',
        matchedTopic: past,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Fetch ALL previously published topics to guarantee zero duplication across all time
 */
export async function getRecentPostedTopics(days: number = 365): Promise<string[]> {
  try {
    await dbConnect();
    // Query published posts across history to prevent repeats
    const logs = await LinkedInPostLog.find({
      status: 'published',
    })
      .select('topic')
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    return logs.map((l: any) => l.topic).filter(Boolean);
  } catch (err) {
    console.warn('⚠️ [DynamicCarouselAI] Could not fetch post history:', err);
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
 * Strips markdown asterisks (* and **), hashes, backticks, and leading bullets/dashes
 */
function cleanSlideText(text?: any): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[*#`~]/g, '') // Strip markdown asterisks, hashes, backticks, tildes
    .replace(/^[•●\-\*\>\s]+/, '') // Strip redundant leading bullets, dashes, asterisks
    .replace(/[•●]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate and sanitize generated slides into standard CarouselDeck format
 */
function sanitizeGeneratedDeck(raw: any, track: TechTrack): CarouselDeck {
  const defaultTrack = TECH_TRACKS[track];
  const topic = cleanSlideText(raw?.topic) || defaultTrack.title;
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
    tag: cleanSlideText(firstSlide?.tag) || defaultTrack.title.toUpperCase(),
    headline: cleanSlideText(firstSlide?.headline) || topic,
    subheadline: cleanSlideText(firstSlide?.subheadline) || 'Swipe to explore the complete visual breakdown',
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
        tag: cleanSlideText(s.tag) || 'SUMMARY & ACTION',
        headline: cleanSlideText(s.headline) || 'Key Takeaways & Next Steps',
        subheadline: cleanSlideText(s.subheadline) || 'Implement these architectural principles in your production systems.',
        points: Array.isArray(s.points) && s.points.length > 0
          ? s.points.slice(0, 4).map(cleanSlideText).filter(Boolean)
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
      tag: cleanSlideText(s.tag) || `0${i} / ${defaultTrack.focusKeywords[i % defaultTrack.focusKeywords.length] || 'SYSTEM DESIGN'}`,
      headline: cleanSlideText(s.headline) || `Key Architectural Insight ${i}`,
      subheadline: cleanSlideText(s.subheadline) || '',
      footer: s.footer || 'Swipe to continue ->',
    };

    if (Array.isArray(s.points) && s.points.length > 0) {
      slide.points = s.points.slice(0, 4).map(cleanSlideText).filter(Boolean);
    } else if (slideType === 'intro') {
      slide.points = [
        `Tight coupling across ${defaultTrack.title} creates cascading failure loops under production load.`,
        'Synchronous request-reply chains amplify tail latency and exhaust thread connection pools.',
        'Unmonitored state mutations without strict transaction boundaries risk silent data corruption.',
      ];
    }

    if (s.cardContent && typeof s.cardContent === 'object') {
      const rawLines = Array.isArray(s.cardContent.bodyLines) ? s.cardContent.bodyLines : [];
      const cleanedLines = rawLines.map(cleanSlideText).filter(Boolean);
      const bodyLines = cleanedLines.length >= 2
        ? cleanedLines.slice(0, 3)
        : [
            cleanedLines[0] || 'Services publish lightweight domain events to an asynchronous message backbone.',
            'Decoupled consumer workers handle processing independently, isolating failures under high concurrency.',
          ];

      slide.cardContent = {
        badge: cleanSlideText(s.cardContent.badge) || 'ARCHITECTURE',
        tagline: s.cardContent.tagline || 'Deep Dive /',
        title: cleanSlideText(s.cardContent.title) || slide.headline,
        subtitle: cleanSlideText(s.cardContent.subtitle),
        highlightText: cleanSlideText(s.cardContent.highlightText) || 'Zero-downtime, strict fault isolation, and resilient degradation.',
        bodyLines,
      };
    } else if (slideType === 'stat_card') {
      slide.cardContent = {
        badge: 'ARCHITECTURE',
        tagline: 'Deep Dive /',
        title: slide.headline,
        highlightText: 'Zero-downtime, strict fault isolation, and resilient degradation.',
        bodyLines: [
          'Services publish lightweight domain events to an asynchronous message backbone.',
          'Decoupled consumer workers handle processing independently, isolating failures under high concurrency.',
        ],
      };
    }

    if (s.codeSnippet && typeof s.codeSnippet === 'string') {
      slide.codeSnippet = s.codeSnippet;
    }

    if (s.takeawayQuote && typeof s.takeawayQuote === 'string') {
      slide.takeawayQuote = cleanSlideText(s.takeawayQuote);
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
 * Enforces strict anti-duplication against all past posts in LinkedInPostLog
 */
export async function generateDynamicTechCarouselDeck(
  preferredTrack?: TechTrack | 'auto'
): Promise<{ deck: CarouselDeck; track: TechTrack; isDynamic: boolean }> {
  const track = await pickNextTrack(preferredTrack);
  const trackInfo = TECH_TRACKS[track];
  const recentTopics = await getRecentPostedTopics(365);

  console.log(`🤖 [DynamicCarouselAI] Generating fresh technical carousel for track: "${trackInfo.title}"...`);
  if (recentTopics.length > 0) {
    console.log(`🛡️ [DynamicCarouselAI] Active Anti-Duplication Shield: Guarding against ${recentTopics.length} previously published topics.`);
  }

  const bannedList = [...recentTopics];

  // Try up to 2 generation attempts with AI to guarantee uniqueness
  for (let attempt = 1; attempt <= 2; attempt++) {
    const formattedBannedList = bannedList.slice(0, 30).map((t, idx) => `   ${idx + 1}. "${t}"`).join('\n') || '   None';

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
        "Concrete architectural failure mode 1 explaining why traditional systems fail under peak load.",
        "Concrete architectural failure mode 2 explaining latency spikes, thread pool exhaustion, or memory leaks.",
        "Concrete architectural failure mode 3 explaining data consistency or distributed state hazards."
      ]
    },
    {
      "slideType": "stat_card",
      "tag": "02 / THE ARCHITECTURE",
      "headline": "Key Architectural Shift",
      "cardContent": {
        "badge": "PRODUCTION METRIC",
        "title": "Clear system title",
        "highlightText": "Big prominent stat or focal statement (e.g. 'Reduce MTTR by 40% with event sourcing')",
        "bodyLines": [
          "Services publish lightweight domain events to an asynchronous message broker rather than invoking RPCs.",
          "Decoupled consumer workers process events independently, isolating faults and scaling horizontally."
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

CRITICAL ANTI-DUPLICATION & FORMATTING RULES:
1. OUTPUT PURE JSON ONLY. No markdown wrapper outside the JSON. No commentary before or after.
2. ABSOLUTELY FORBIDDEN: You must NEVER generate a post on or related to any of the following previously published topics:
${formattedBannedList}
3. If your candidate topic touches the same concept or domain as any topic in the list above, choose a completely different, fresh 2026 engineering topic instead.
4. Every slide headline must be impactful and concise (fits comfortably on 1080x1350 slide canvas).
5. ZERO MARKDOWN FORMATTING IN SLIDE STRINGS: NEVER use asterisks (* or **), backticks, hashes, or bullet characters (•, -) inside JSON strings for headline, title, bodyLines, points, highlightText, or takeawayQuote. Use pure clean plain English words only.`;

    const userMessage = `Generate a fresh, cutting-edge LinkedIn carousel deck on: "${trackInfo.title}".
Keywords: ${trackInfo.focusKeywords.join(', ')}.
Make sure it represents modern 2026 software engineering reality. Return pure valid JSON matching the schema.`;

    try {
      const aiRes = await callMultiProviderAI(systemPrompt, userMessage);
      const parsedJson = extractJsonFromText(aiRes.text);

      if (parsedJson && parsedJson.topic && Array.isArray(parsedJson.slides)) {
        const sanitizedDeck = sanitizeGeneratedDeck(parsedJson, track);

        // Deduplication Verification Gate
        const dupCheck = isTopicDuplicate(sanitizedDeck.topic, sanitizedDeck.caption, recentTopics);
        if (dupCheck.isDuplicate) {
          console.warn(`⚠️ [DynamicCarouselAI] Deduplication gate blocked candidate topic (Attempt ${attempt}): "${sanitizedDeck.topic}" - Reason: ${dupCheck.reason}`);
          bannedList.push(sanitizedDeck.topic);
          continue; // Retry with updated ban list
        }

        console.log(`✓ [DynamicCarouselAI] Successfully generated fresh dynamic deck: "${sanitizedDeck.topic}" (${sanitizedDeck.slides.length} slides)`);
        return {
          deck: sanitizedDeck,
          track,
          isDynamic: true,
        };
      }
      console.warn(`⚠️ [DynamicCarouselAI] AI returned invalid JSON structure on attempt ${attempt}.`);
    } catch (aiErr) {
      console.warn(`⚠️ [DynamicCarouselAI] AI generation error on attempt ${attempt}:`, aiErr);
    }
  }

  // Graceful Fallback: Filter CURATED_DECKS to ONLY those that have NEVER been posted
  const eligibleCuratedDecks = CURATED_DECKS.filter(
    (deck) => !isTopicDuplicate(deck.topic, deck.caption, recentTopics).isDuplicate
  );

  if (eligibleCuratedDecks.length > 0) {
    const fallbackIndex = Math.floor(Math.random() * eligibleCuratedDecks.length);
    const fallbackDeck = eligibleCuratedDecks[fallbackIndex];
    console.log(`🔄 [DynamicCarouselAI] Using unposted curated deck fallback: "${fallbackDeck.topic}"`);
    return {
      deck: fallbackDeck,
      track,
      isDynamic: false,
    };
  }

  // Emergency Fallback: If all curated decks have been posted, generate a guaranteed-fresh architecture deck
  console.log('🔄 [DynamicCarouselAI] All standard curated decks were previously posted. Generating emergency fresh architecture deck...');
  const emergencyDeck = createEmergencyUniqueDeck(track, recentTopics);
  return {
    deck: emergencyDeck,
    track,
    isDynamic: false,
  };
}

/**
 * Creates a clean unique fallback deck if every standard curated deck has already been posted
 */
function createEmergencyUniqueDeck(track: TechTrack, pastTopics: string[]): CarouselDeck {
  const EMERGENCY_TOPICS = [
    {
      topic: 'Distributed Locks in Node.js: Preventing Double-Spend & Race Conditions',
      tag: 'DISTRIBUTED SYSTEMS',
      caption: `Concurrency bugs in production don't announce themselves — they silently corrupt state during traffic spikes. ⚡\n\nWhen scaling distributed web applications:\n📌 Never rely on in-memory single-process locks across scaled instances.\n📌 Use distributed leases with strict fencing tokens to prevent zombie process overwrites.\n📌 Profile end-to-end latency before introducing distributed state.\n\n👉 Swipe through this visual architectural breakdown above! ➡️\n\n#SoftwareEngineering #DistributedSystems #NodeJS #SystemDesign #BackendEngineering #TechArchitecture`,
      points: [
        'Why in-memory state fails across multiple scaled containers',
        'Redis Redlock algorithm and TTL lease management patterns',
        'Fencing tokens to prevent stale zombie process writes',
      ],
    },
    {
      topic: 'Edge Runtime vs Node.js Serverless: Cold Starts, Limits & TTFB',
      tag: 'CLOUD ARCHITECTURE',
      caption: `Choosing Edge vs Node.js serverless isn't about hype — it's an engineering trade-off between cold starts and runtime capabilities. ⚡\n\nKey production criteria:\n📌 V8 Isolates boot in <5ms but lack full Node.js POSIX APIs.\n📌 Regional lambdas handle heavy compute but suffer from 200ms+ cold starts.\n📌 Smart hybrid architectures keep dynamic auth at the edge while streaming heavy DB calls.\n\n👉 Swipe through the complete comparative breakdown! ➡️\n\n#CloudArchitecture #Nextjs #Serverless #EdgeComputing #WebPerformance #SoftwareArchitecture`,
      points: [
        'V8 Isolate micro-runtimes vs full container initialization',
        'Global edge propagation vs database connection pooling limits',
        'Architectural decision matrix for sub-50ms TTFB in 2026',
      ],
    },
    {
      topic: 'PostgreSQL Connection Pooling: PgBouncer vs Direct Serverless Connections',
      tag: 'DATABASE PERFORMANCE',
      caption: `The quickest way to bring down a production database during a traffic spike? Exhausting your connection pool. ⚡\n\nWhy connection management matters in serverless:\n📌 Every Postgres connection consumes 5-10MB backend RAM.\n📌 Hundreds of concurrent Lambdas will instantly trigger "too many connections" errors.\n📌 Transaction pooling via PgBouncer or Supabase Pooler maintains steady p99 latency.\n\n👉 Swipe to master high-concurrency database pooling! ➡️\n\n#PostgreSQL #DatabaseArchitecture #BackendEngineering #PgBouncer #DevOps #SystemDesign`,
      points: [
        'Why each Postgres connection consumes 5-10MB backend RAM',
        'Transaction pooling vs Session pooling in serverless environments',
        'Eliminating connection exhaustion under peak traffic spikes',
      ],
    },
    {
      topic: 'Zero-Copy Streaming in Node.js: Processing Multi-Gigabyte Payloads',
      tag: 'SYSTEMS PROGRAMMING',
      caption: `Buffering entire files in RAM is a ticking time bomb in production Node.js services. ⚡\n\nHow senior engineers handle massive payloads:\n📌 High-watermark backpressure ensures writers don't overwhelm readers.\n📌 Use stream.pipeline for safe automatic resource cleanup and error propagation.\n📌 Transform streams parse NDJSON or CSV chunks on the fly with <50MB RAM.\n\n👉 Swipe through the visual stream architecture guide! ➡️\n\n#NodeJS #BackendArchitecture #MemoryOptimization #Streams #SoftwareEngineering #Performance`,
      points: [
        'Backpressure handling with Readable and Writable streams',
        'Avoiding high-watermark memory exhaustion during bulk transfers',
        'Stream pipeline utilities for fail-safe error propagation',
      ],
    },
    {
      topic: 'Next.js 16 Partial Prerendering: The Architecture of Instant Page Loads',
      tag: 'NEXTJS ARCHITECTURE',
      caption: `The debate between static site generation (SSG) and dynamic server rendering (SSR) is officially over. ⚡\n\nPartial Prerendering (PPR) combines the best of both worlds:\n📌 Static shell delivers instant TTFB directly from edge CDN cache.\n📌 Dynamic micro-holes stream in parallel without blocking the initial paint.\n📌 React 19 Suspense boundaries isolate slow microservice queries.\n\n👉 Swipe through this visual walkthrough of modern rendering! ➡️\n\n#Nextjs #React19 #WebDevelopment #FrontendArchitecture #CoreWebVitals #Performance`,
      points: [
        'Static edge shell delivery with dynamic parallel streaming',
        'React 19 Suspense boundaries isolating database latency',
        'Eliminating client waterfall requests on e-commerce product pages',
      ],
    },
    {
      topic: 'Event-Driven Microservices: Preventing Deadlocks & Consumer Lag',
      tag: 'EVENT DRIVEN ARCHITECTURE',
      caption: `Decoupled event architectures are great until consumer lag triggers memory exhaustion across your cluster. ⚡\n\nHow to design resilient event pipelines:\n📌 Implement dead-letter queues with exponential backoff and jitter.\n📌 Decouple state mutations using the transactional outbox pattern.\n📌 Monitor partition rebalancing overhead in Kafka and RabbitMQ.\n\n👉 Swipe through the complete event-driven resiliency blueprint! ➡️\n\n#Microservices #EventDriven #Kafka #SystemDesign #CloudArchitecture #BackendEngineering`,
      points: [
        'Dead-letter queues with exponential backoff and jitter retry loops',
        'Transactional Outbox Pattern guaranteeing zero dropped events',
        'Partition balancing and consumer backpressure monitoring',
      ],
    },
    {
      topic: 'Zero-Runtime Type Validation in TypeScript: Narrowing vs Schema Overhead',
      tag: 'TYPESCRIPT ARCHITECTURE',
      caption: `Validating every internal function call with heavy runtime schemas wastes significant CPU cycles at scale. ⚡\n\nSmart typing strategies:\n📌 Validate strictly at untrusted trust boundaries (APIs, webhooks, user input).\n📌 Use discriminated unions and exhaustive type narrowing across internal layers.\n📌 Leverage const type parameters for zero-allocation inference.\n\n👉 Swipe to optimize your TypeScript architecture! ➡️\n\n#TypeScript #JavaScript #CleanCode #SoftwareArchitecture #PerformanceOptimization #WebDev`,
      points: [
        'Validating strictly at network ingress boundaries vs internal paths',
        'Exhaustive pattern matching with discriminated unions',
        'Const type parameters for zero-overhead compile-time inference',
      ],
    },
    {
      topic: 'MongoDB WiredTiger Storage Engine: Profiling Query Latency & Compound Indexes',
      tag: 'DATABASE ARCHITECTURE',
      caption: `If your MongoDB queries are scanning more documents than they return, your database CPU is burning money. ⚡\n\nMastering MongoDB index performance:\n📌 Equality, Sort, Range (ESR) rule for zero-in-memory sorting.\n📌 Covered queries that resolve entirely from the index tree without document lookups.\n📌 Monitoring cache eviction rates and ticket exhaustion in WiredTiger.\n\n👉 Swipe to master database indexing architecture! ➡️\n\n#MongoDB #DatabaseOptimization #BackendEngineering #QueryTuning #SystemDesign #FullStack`,
      points: [
        'Applying the ESR (Equality, Sort, Range) rule to eliminate in-memory sorts',
        'Designing covered index trees to bypass document storage engine lookups',
        'Profiling cache evictions and read/write execution tickets',
      ],
    },
  ];

  // Pick first topic not in pastTopics
  let candidate = EMERGENCY_TOPICS.find(
    (item) => !isTopicDuplicate(item.topic, '', pastTopics).isDuplicate
  );

  // If every static emergency topic was previously posted, dynamically synthesize a unique topic with week discriminator
  if (!candidate) {
    const fallbackBase = EMERGENCY_TOPICS[Math.floor(Math.random() * EMERGENCY_TOPICS.length)];
    const dateStamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    candidate = {
      ...fallbackBase,
      topic: `${fallbackBase.topic} (Masterclass Edition • ${dateStamp})`,
    };
  }

  return {
    topic: candidate.topic,
    caption: candidate.caption,
    slides: [
      {
        isCover: true,
        slideType: 'cover',
        tag: candidate.tag,
        headline: candidate.topic,
        subheadline: 'Swipe to explore the complete visual breakdown',
        footer: 'SWIPE TO LEARN ->',
      },
      {
        slideType: 'intro',
        tag: '01 / CORE BOTTLENECK',
        headline: 'Why standard approaches fail under production load',
        subheadline: 'Real-world engineering challenges at high concurrency',
        points: candidate.points,
        footer: 'Swipe to continue ->',
      },
      {
        slideType: 'stat_card',
        tag: '02 / PRODUCTION ARCHITECTURE',
        headline: 'Resilient Scalability Pattern',
        cardContent: {
          badge: 'PRODUCTION ARCHITECTURE',
          title: 'Deterministic State Management',
          highlightText: 'Zero race conditions, zero orphaned resources',
          bodyLines: [
            'Maintain strict TTL expiration on distributed resources.',
            'Validate fencing tokens before committing persistent writes.',
          ],
        },
        footer: 'Swipe to continue ->',
      },
      {
        isSummary: true,
        slideType: 'outro',
        tag: 'SUMMARY & ACTION',
        headline: 'Key Architectural Takeaways',
        subheadline: 'Apply these resilient patterns in your production infrastructure.',
        points: [
          'Design with network partition awareness from day one.',
          'Isolate state stores behind connection pools and circuit breakers.',
          'Enforce strict lease expirations across all asynchronous handlers.',
        ],
        footer: 'Follow for weekly deep tech breakdowns',
      },
    ],
  };
}
