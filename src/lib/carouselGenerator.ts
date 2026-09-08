import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export interface ChartBarItem {
  name: string;
  pct: number;
  isHighlight?: boolean;
}

export interface ColumnChartItem {
  label: string;
  sub?: string;
  pct: number;
  h?: number;
  isHighlight?: boolean;
}

export interface DiagramFlow {
  leftTasks: string[];
  centerUserText?: string;
  centerAgentText?: string;
  rightOutcomes: string[];
}

export interface CardContentBlock {
  badge?: string;
  tagline?: string;
  title?: string;
  subtitle?: string;
  highlightText?: string;
  bodyLines?: string[];
}

export interface CarouselSlide {
  tag?: string;
  headline: string;
  subheadline?: string;
  slideType?: 'cover' | 'intro' | 'stat_card' | 'bar_chart' | 'column_chart' | 'diagram' | 'code_terminal' | 'outro';
  chartData?: ChartBarItem[];
  columnData?: ColumnChartItem[];
  diagramData?: DiagramFlow;
  cardContent?: CardContentBlock;
  codeSnippet?: string;
  points?: string[];
  takeawayQuote?: string;
  footer?: string;
  isCover?: boolean;
  isSummary?: boolean;
}

export interface CarouselDeck {
  topic: string;
  caption: string;
  slides: CarouselSlide[];
}

function cleanAscii(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[➔➜➝]/g, '->')
    .replace(/[•●]/g, '-')
    .replace(/[⚡★☆]/g, '>')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const CURATED_DECKS: CarouselDeck[] = [
  {
    topic: 'AI Coding Agents Are Becoming Standard: 2026 Developer Survey Insights',
    caption: `AI coding agents are officially mainstream. 🤖⚡

According to the latest 2026 Developer Ecosystem data, coding agents have rapidly graduated from experimental tools into everyday software engineering infrastructure.

Here are the key takeaways from the 8-slide masterclass:

📌 90% of professional developers now use AI coding agents at least weekly.
📌 68% use them daily, making agentic workflows an essential part of daily standups and sprint cycles.
📌 The tool race is heating up: Claude Code leads work adoption at 39%, followed by GitHub Copilot (21%), Codex (16%), and Cursor (12%).
📌 Only 22% of engineers let agents write >80% of their code — meaning developers are acting as system architects and orchestrators, not just manual typers.

The most valuable skill in 2026 is no longer fast keystrokes — it's knowing how to delegate architectural tasks effectively.

Swipe through the 8-slide carousel above for the complete visual breakdown! ➡️

#AICoding #SoftwareEngineering #DeveloperTools #TechArchitecture #FutureOfCode #FullStack #WebDevelopment #Programming #ArtificialIntelligence #NextJS #PakODrive`,
    slides: [
      {
        isCover: true,
        slideType: 'cover',
        tag: '2026 DEV ECOSYSTEM SURVEY',
        headline: 'AI Coding Agents\nAre Becoming Standard',
        footer: 'pakodrive.pk',
      },
      {
        slideType: 'intro',
        tag: 'THE ADOPTION SHIFT',
        headline: 'AI coding agents are no longer experimental.',
        subheadline: 'JetBrains latest survey reveals how engineering workflows changed in 2026.',
        points: [
          '90% of professional developers use them weekly.',
          '68% use them daily in production routines.',
          'The question is no longer "if" they work, but what becomes standard.',
        ],
        footer: 'Subscribe for more',
      },
      {
        slideType: 'stat_card',
        tag: '01 / WEEKLY ADOPTION',
        headline: '90% use agents weekly',
        subheadline: '90% of professional developers now use coding agents every week.',
        cardContent: {
          badge: 'JETBRAINS',
          tagline: 'Research /',
          title: 'AI coding agent adoption in 2026',
          subtitle: 'Key takeaways from our latest Developer Ecosystem Survey',
          highlightText: '90% of professional developers now use AI coding agents',
          bodyLines: [
            'at least weekly in their work. What started as an experiment',
            'has become part of everyday engineering practice.',
          ],
        },
        takeawayQuote: '"AI agents have moved from experiments into everyday development."',
        footer: 'Subscribe for more',
      },
      {
        slideType: 'stat_card',
        tag: '02 / DAILY WORKFLOW',
        headline: '68% use them daily',
        subheadline: '68% use coding agents daily, making agentic workflows increasingly routine.',
        cardContent: {
          badge: 'JETBRAINS',
          title: 'AI coding agents are now mainstream',
          highlightText: 'with 68% using them daily in production code.',
          bodyLines: [
            '90% of professional developers use agents weekly, with 68% using',
            'them daily. What started as an experiment has become routine.',
            'This marks a sharp increase from our 2024 survey, where 59% used',
            'assistants weekly and only 24% daily.',
          ],
        },
        takeawayQuote: '"Daily usage changes the question from \'if\' to \'how\'."',
        footer: 'Subscribe for more',
      },
      {
        slideType: 'bar_chart',
        tag: '03 / TOOL RACE',
        headline: 'The tool race is changing',
        subheadline: 'Claude Code leads adoption, while competitors are rapidly catching up.',
        chartData: [
          { name: 'Claude Code', pct: 39, isHighlight: true },
          { name: 'GitHub Copilot', pct: 21 },
          { name: 'Codex / OpenAI', pct: 16 },
          { name: 'Cursor', pct: 12 },
          { name: 'Gemini Code Assist', pct: 9 },
          { name: 'Windsurf Editor', pct: 6 },
        ],
        takeawayQuote: '"The standard AI coding tool hasn\'t been decided yet."',
        footer: 'Subscribe for more',
      },
      {
        slideType: 'column_chart',
        tag: '04 / CODE AUTONOMY',
        headline: 'Most aren\'t fully agentic',
        subheadline: 'Only 22% rely on agents for over 80% of code.',
        columnData: [
          { label: '0%', sub: '(none)', pct: 4, h: 40 },
          { label: '1-20%', pct: 7, h: 70 },
          { label: '21-40%', pct: 20, h: 200 },
          { label: '41-60%', pct: 19, h: 190 },
          { label: '61-80%', pct: 18, h: 180 },
          { label: '81-100%', sub: '(almost all)', pct: 22, h: 230, isHighlight: true },
        ],
        takeawayQuote: '"Adoption doesn\'t mean developers have stopped writing code themselves."',
        footer: 'Subscribe for more',
      },
      {
        slideType: 'diagram',
        tag: '05 / FUTURE SKILLS',
        headline: 'So what happens next?',
        subheadline: 'The next advantage may be knowing what to delegate well.',
        diagramData: {
          leftTasks: [
            'Write boilerplate code',
            'Generate unit tests',
            'Refactor legacy code',
            'Explore complex APIs',
            'Design system schemas',
          ],
          centerUserText: 'You\nDecide what to delegate',
          centerAgentText: 'AI\nAutonomous Agent',
          rightOutcomes: [
            'Handles repetitive tasks',
            'Runs build & lint checks',
            'Writes documentation',
            'Frees time for systems',
            'Accelerates velocity 3x',
          ],
        },
        takeawayQuote: '"The valuable skill may become managing the agent, not typing."',
        footer: 'Subscribe for more',
      },
      {
        isSummary: true,
        slideType: 'outro',
        tag: 'CREATOR & COMMUNITY',
        headline: 'Helping businesses grow',
        subheadline: 'Stand out with clean, high-performance web architecture.',
        points: [
          'Why is my site performance lagging?',
          'Why isn\'t my web application converting?',
          'How do I integrate autonomous AI agents safely?',
        ],
        footer: 'pakodrive.pk',
      },
    ],
  },
  {
    topic: 'Rendering Strategies Explained: CSR vs SSR vs SSG vs ISR',
    caption: `Stop choosing rendering strategies based on guesswork. 🛑

In modern web engineering, choosing the wrong rendering paradigm can silently sabotage your Core Web Vitals (LCP/TTFB), tank SEO rankings, or spike cloud compute bills by 10x.

Swipe through this 6-slide masterclass to master the production trade-offs:

📌 CSR (Client-Side Rendering) — Fast initial CDN hit, but heavy JS bundles and slow First Contentful Paint.
📌 SSR (Server-Side Rendering) — Fresh real-time HTML on every request, at the cost of server compute overhead.
📌 SSG (Static Site Generation) — Instant edge caching, but requires full deployments to update dynamic content.
📌 ISR (Incremental Static Regeneration) — The sweet spot: static edge delivery with background background revalidation.

Which rendering strategy powers the core flows of your production application? Let's discuss in the comments below! 💬

#SoftwareEngineering #WebDevelopment #NextJS #ReactJS #SystemDesign #FullStack #Frontend #Programming #WebPerformance #CloudArchitecture

---
📌 Save this post for your next architectural review.
🔄 Repost to help a fellow engineer build faster web apps.
➕ Follow Syed Adil Ali for daily deep-dives on full-stack architecture & systems design.`,
    slides: [
      {
        isCover: true,
        tag: 'ARCHITECTURE MASTERCLASS',
        headline: 'Rendering Strategies Explained: CSR vs SSR vs SSG vs ISR',
        points: [
          'Performance trade-offs & TTFB impacts',
          'SEO vs server cost considerations',
          'Production decision matrix for 2026',
        ],
        footer: 'Swipe to compare ->',
      },
      {
        tag: '01 / CLIENT-SIDE RENDERING',
        headline: 'HTML is empty. Browser builds everything.',
        codeSnippet: `// Browser downloads minimal HTML & bundle
const Dashboard = () => <div>Interactive App</div>;
// Fast initial CDN delivery, slower FCP`,
        points: [
          'Best for: Private SaaS portals, logged-in dashboards',
          'Trade-off: Weak SEO and slower First Contentful Paint',
          'Execution: 100% computed inside the client browser',
        ],
      },
      {
        tag: '02 / SERVER-SIDE RENDERING',
        headline: 'HTML rendered fresh on every single hit.',
        codeSnippet: `// Fresh compute per incoming request
export default async function FeedPage() {
  const liveData = await getRealtimeData();
  return <Feed items={liveData} />;
}`,
        points: [
          'Best for: Real-time feeds, personalized user views',
          'Trade-off: Server compute overhead under traffic spikes',
          'Execution: Server crafts fresh HTML before response',
        ],
      },
      {
        tag: '03 / STATIC SITE GENERATION',
        headline: 'Compiled once at build time. Instant edge CDN.',
        codeSnippet: `// Pre-rendered during build phase
export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }));
}`,
        points: [
          'Best for: Documentation, marketing pages, blogs',
          'Trade-off: Requires full deployment to update content',
          'Execution: Statically served directly from Edge CDN',
        ],
      },
      {
        tag: '04 / INCREMENTAL STATIC REGENERATION',
        headline: 'Static edge speed + periodic background revalidation.',
        codeSnippet: `// Stale-while-revalidate every 60 seconds
export const revalidate = 60;
export default async function Catalog() { ... }`,
        points: [
          'Best for: E-commerce stores, product directories',
          'Trade-off: Eventual consistency caching edge cases',
          'Execution: Zero-downtime background regeneration',
        ],
      },
      {
        isSummary: true,
        tag: 'DECISION MATRIX',
        headline: 'Which should you choose in production?',
        points: [
          'Interactive Dashboards -> CSR / Client Components',
          'Real-time & Personalized -> SSR (Dynamic Rendering)',
          'High-traffic Content & Docs -> SSG (Static Export)',
          'Product Catalogs & Stores -> ISR (Revalidated Static)',
        ],
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'Database Indexing: Why Your SQL and MongoDB Queries Crawl',
    caption: `90% of backend latency spikes aren't caused by slow CPU or RAM shortages. 🐢

They are caused by unindexed database table scans and runaway query execution plans.

When your table or collection crosses 1 million rows, an unindexed query forces the engine to read every single disk page into memory — causing COLLSCAN hell, locking rows, and crashing connection pools.

Swipe through this 6-slide architectural guide to eliminate slow queries:

📌 How B-Tree indexes search in O(log N) instead of O(N) linear scans
📌 The hidden memory & CPU cost of COLLSCAN on production clusters
📌 Compound Indexing & the ESR Rule (Equality, Sort, Range)
📌 Covering Indexes that skip secondary heap lookups completely

What single database optimization gave your team the highest latency ROI recently? Share your war stories below! 💬

#Databases #MongoDB #PostgreSQL #SQL #SystemDesign #BackendEngineering #SoftwareArchitecture #DevOps #DatabaseOptimization #FullStack

---
📌 Save this post for your next database tuning session.
🔄 Repost to save an engineer from a midnight production outage.
➕ Follow Syed Adil Ali for daily insights on backend scalability & distributed systems.`,
    slides: [
      {
        isCover: true,
        tag: 'DATABASE OPTIMIZATION',
        headline: 'Database Indexing: Why Your Queries Crawl in Production',
        points: [
          'How B-Tree indexes search in O(log N)',
          'The danger of full table / collection scans',
          'Compound index ordering rules (ESR Rule)',
        ],
        footer: 'Swipe to optimize ->',
      },
      {
        tag: '01 / THE HIDDEN COST OF SCAN',
        headline: 'Without an index, the DB scans every row.',
        codeSnippet: `// Slow query without index: COLLSCAN
db.orders.find({ status: "Pending", user: id });
// 1M rows = 1,000,000 disk page reads!`,
        points: [
          'COLLSCAN reads every block from disk into memory',
          'Consumes DB RAM buffer pool and spikes CPU to 100%',
          'Symptoms: Connection timeouts & API latency spikes',
        ],
      },
      {
        tag: '02 / HOW B-TREE INDEXES WORK',
        headline: 'O(log N) lookup instead of O(N) linear scan.',
        codeSnippet: `// Create index on lookup key
db.orders.createIndex({ user: 1 });
// 1,000,000 rows lookup takes ~20 comparisons!`,
        points: [
          'B-Trees keep keys sorted in self-balancing pages',
          'Point lookups jump directly to leaf nodes',
          'Range queries traverse linked sibling leaves instantly',
        ],
      },
      {
        tag: '03 / THE ESR RULE FOR COMPOUND INDEXES',
        headline: 'Equality, Sort, Range: The golden index order.',
        codeSnippet: `// Query: find status="Paid", sort by createdAt, filter total > 100
db.orders.createIndex({
  status: 1,     // E: Equality
  createdAt: -1, // S: Sort
  total: 1       // R: Range
});`,
        points: [
          'E (Equality): Put exact match fields first',
          'S (Sort): Put sorting fields second to avoid in-memory sort',
          'R (Range): Put inequality / ranges (<, >, between) last',
        ],
      },
      {
        tag: '04 / COVERED QUERIES: ZERO HEAP READS',
        headline: 'The fastest query never touches the table heap.',
        codeSnippet: `// Query only fields present in the index
db.users.find({ email: "dev@test.com" }, { _id: 0, email: 1 });
// Result returned 100% from RAM index!`,
        points: [
          'Index contains all requested projection fields',
          'Database skips secondary table/heap lookups completely',
          'Delivers sub-millisecond API response times',
        ],
      },
      {
        isSummary: true,
        tag: 'INDEXING CHECKLIST',
        headline: 'Production database rules to live by',
        points: [
          'Never deploy new endpoints without checking explain() plan',
          'Apply the ESR rule for multi-column queries',
          'Remove unused indexes (they slow down write/insert throughput)',
          'Monitor slow query logs (>100ms) with automated alerts',
        ],
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'Microservices vs Modular Monolith: The Real Architectural Trade-Offs',
    caption: `Microservices solve team organization problems — NOT technical scaling problems. ⚠️

Too many startups adopt distributed microservices prematurely, trading clean in-process code for distributed systems nightmare: network latency, cascading timeouts, distributed transaction locks, and complex Kubernetes overhead.

A well-designed Modular Monolith is almost always the faster, more resilient architecture until team headcount forces organizational splitting.

Swipe through this 6-slide breakdown to navigate the architectural trade-offs:

📌 Why in-memory domain boundaries beat premature HTTP/RPC network hops
📌 The hidden "Microservices Tax" (distributed tracing, circuit breakers, 2PC sagas)
📌 Team sizing heuristics: When to stay monolithic vs when to split
📌 The Evolutionary Architecture roadmap: Start modular, extract when proven

What architecture does your team currently run in production? If you could restart from scratch, would you split or stay monolithic? 💬

#SoftwareEngineering #SystemDesign #Microservices #SoftwareArchitecture #CloudArchitecture #Backend #DevOps #TechLeadership #CleanArchitecture #Programming

---
📌 Save this post for your next team architecture debate.
🔄 Repost to share with fellow software architects and tech leads.
➕ Follow Syed Adil Ali for real-world engineering architecture & scalability patterns.`,
    slides: [
      {
        isCover: true,
        tag: 'SYSTEMS ARCHITECTURE',
        headline: 'Microservices vs Modular Monolith: The Real Trade-Offs',
        points: [
          'The myth of microservice simplicity',
          'How modular monoliths preserve velocity',
          'When microservices are genuinely warranted',
        ],
        footer: 'Swipe to compare ->',
      },
      {
        tag: '01 / THE MODULAR MONOLITH',
        headline: 'Single deployment with strict domain boundaries.',
        codeSnippet: `// In-memory module communication
// src/modules/billing/ -> src/modules/orders/
const invoice = await billingService.createInvoice(order);
// Zero network latency, single transaction boundary`,
        points: [
          'Code is organized into isolated domain modules',
          'Communication is in-process (fast function calls, no HTTP)',
          'Single database deployment, easy local developer setup',
        ],
      },
      {
        tag: '02 / THE HIDDEN MICROSERVICES TAX',
        headline: 'Distributed systems introduce network failure modes.',
        codeSnippet: `// Distributed RPC call over HTTP/gRPC
try {
  await http.post('http://billing-svc/invoices', payload);
} catch (networkTimeout) {
  // Saga rollback? Eventual consistency? DLQ?
}`,
        points: [
          'Every call now faces latency, timeouts, and network jitter',
          'Requires distributed tracing, circuit breakers, and retries',
          'Transactions require complex 2PC or Saga patterns',
        ],
      },
      {
        tag: '03 / TEAM SCALING & OWNERSHIP',
        headline: 'Microservices are for teams, not for tech.',
        codeSnippet: `// Team Order-Squad owns order-service repo
// Team Billing-Squad owns billing-service repo
// Independent CI/CD pipelines and deployment cadences`,
        points: [
          '1-10 engineers -> Modular Monolith gives 10x faster shipping',
          '50+ engineers -> Microservices prevent code merge collisions',
          'Independent deploys without stepping on other teams',
        ],
      },
      {
        tag: '04 / THE EVOLUTIONARY PATH',
        headline: 'Start with a Modular Monolith. Extract when proven.',
        codeSnippet: `// 1. Keep module interfaces clean
export interface IOrderModule { ... }
// 2. Extract into worker service when CPU spikes`,
        points: [
          'Well-designed modules make extraction straightforward',
          'Premature distribution creates distributed monoliths',
          'Optimize for business validation and rapid delivery first',
        ],
      },
      {
        isSummary: true,
        tag: 'DECISION MATRIX',
        headline: 'How to choose for your next project',
        points: [
          'Early-stage startup / <20 devs -> Modular Monolith',
          'High throughput localized scaling -> Extract specific worker',
          'Multiple autonomous cross-functional teams -> Microservices',
          'Rule: Do not distribute until business scale forces it',
        ],
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'React 19 & Next.js 16: Complete Mental Model for Senior Engineers',
    caption: `React 19 isn't just an incremental update — it resets how we architect modern full-stack web applications. ⚡

The era of sprawling client-side state, messy useEffect chains, and manual useMemo/useCallback boilerplate is officially coming to an end.

Swipe through this 6-slide masterclass to update your production mental model:

📌 Server Components by Default — Ship 0KB JavaScript to the client for static views
📌 Server Actions — Direct backend mutations from JSX without manual API route boilerplate
📌 useOptimistic — Instant 0ms perceived latency with automatic rollback safety
📌 The React Compiler — Automatic fine-grained reactivity without manual memoization

Which React 19 feature has made the biggest difference in your daily production workflow? Let's discuss in the comments! 💬

#React19 #NextJS #ReactJS #WebDevelopment #Frontend #JavaScript #TypeScript #FullStack #SoftwareEngineering #WebDev

---
📌 Save this post to reference during your Next.js 16 / React 19 migration.
🔄 Repost to keep your developer network ahead of the curve.
➕ Follow Syed Adil Ali for cutting-edge React, Next.js, and TypeScript engineering insights.`,
    slides: [
      {
        isCover: true,
        tag: 'REACT 19 MASTERCLASS',
        headline: 'React 19 & Next.js 16: Complete Modern Mental Model',
        points: [
          'Server Components by default paradigm',
          'Eliminating useEffect with Server Actions',
          'Optimistic UI updates without heavy Redux',
        ],
        footer: 'Swipe to master ->',
      },
      {
        tag: '01 / SERVER-FIRST BY DEFAULT',
        headline: 'Components run on the server unless you opt-out.',
        codeSnippet: `// Server Component: zero JS bundle to client!\nexport default async function ProductPage({ params }) {\n  const product = await db.products.findById(params.id);\n  return <ProductCard item={product} />;\n}`,
        points: [
          'Zero JavaScript footprint shipped to client browser',
          'Direct backend access (DB queries, private API keys)',
          'Solves client-side waterfall network requests',
        ],
      },
      {
        tag: '02 / SERVER ACTIONS REPLACE BOILERPLATE',
        headline: 'Call server mutations directly from JSX forms.',
        codeSnippet: `// Server Action\nasync function updateProfile(formData: FormData) {\n  'use server';\n  await db.users.update({ bio: formData.get('bio') });\n}\n<form action={updateProfile}><button>Save</button></form>`,
        points: [
          'No need to write manual fetch() or API route handlers',
          'Progressive enhancement: works even before JS hydrates',
          'Automatic revalidation of affected page caches',
        ],
      },
      {
        tag: '03 / INSTANT UI WITH useOptimistic',
        headline: 'Update the screen instantly before server confirms.',
        codeSnippet: `// React 19 useOptimistic\nconst [optimisticLikes, setOptimisticLikes] = useOptimistic(\n  likes,\n  (state, delta) => state + delta\n);\n// User sees immediate reaction, rolls back on error`,
        points: [
          'Delivers 0ms perceived latency for user interactions',
          'Automatically rolls back to actual state if mutation fails',
          'Eliminates tons of custom optimistic state code',
        ],
      },
      {
        tag: '04 / THE REACT COMPILER',
        headline: 'Forget manual useMemo and useCallback.',
        codeSnippet: `// Old React:\nconst memoizedValue = useMemo(() => compute(), [deps]);\n// React 19 Compiler:\nconst value = compute(); // Auto-memoized by compiler!`,
        points: [
          'Compiler automatically tracks reactive dependencies',
          'Prevents unnecessary component re-renders',
          'Cleaner, more maintainable standard JavaScript code',
        ],
      },
      {
        isSummary: true,
        tag: 'REACT 19 SUMMARY',
        headline: 'The Senior Engineer Checklist for 2026',
        points: [
          'Default to Server Components; use "use client" only for events',
          'Replace custom mutation endpoints with typed Server Actions',
          'Use useOptimistic for buttery-smooth interactive UX',
          'Remove boilerplate memoization and trust the compiler',
        ],
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
];

/**
/**
 * Helper to wrap text into multiple lines given max characters per line
 */
function wrapTextLines(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Loads a curated high-res topic visual from public/img/tech-carousel/ if available
 */
function getTopicImage(topic: string): Buffer | null {
  try {
    const topicLower = topic.toLowerCase();
    let fileName = 'microservices.jpg';
    if (
      topicLower.includes('render') ||
      topicLower.includes('ssr') ||
      topicLower.includes('csr') ||
      topicLower.includes('ssg') ||
      topicLower.includes('isr')
    ) {
      fileName = 'rendering.jpg';
    } else if (
      topicLower.includes('database') ||
      topicLower.includes('index') ||
      topicLower.includes('sql') ||
      topicLower.includes('mongo') ||
      topicLower.includes('query')
    ) {
      fileName = 'database.jpg';
    } else if (
      topicLower.includes('react') ||
      topicLower.includes('next') ||
      topicLower.includes('compiler') ||
      topicLower.includes('component')
    ) {
      fileName = 'react19.jpg';
    }
    const fullPath = path.join(process.cwd(), 'public/img/tech-carousel', fileName);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
  } catch (err) {
    console.warn('⚠️ Could not load local topic image:', err);
  }
  return null;
}

/**
 * Renders an authentic Slobodan Gajić-style dark-mode multi-slide PDF document (1080x1080 square format)
 * - Large high-contrast typography with Inter & FiraCode TrueType font embedding
 * - Atmospheric 3D tech background on EVERY slide (no flat empty voids)
 * - Embedded 3D AI Tech Graphic on cover slide
 * - Glassmorphic numbered feature cards with bold 28px/26px readable text
 * - High-impact Creator Profile & Follow / Repost CTA final slide
 */
export async function renderSlobodanCarouselPdf(
  deck: CarouselDeck,
  coverImageBuffer?: Buffer | null
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // 1. Embed Modern High-Legibility TrueType Fonts (Inter + FiraCode)
  let fontBold: any = null;
  let fontRegular: any = null;
  let fontCode: any = null;

  try {
    const fk = (fontkit as any).default || fontkit;
    pdfDoc.registerFontkit(fk);

    const fontsDir = path.join(process.cwd(), 'src/lib/fonts');
    const boldPath = path.join(fontsDir, 'Inter-Bold.ttf');
    const regPath = path.join(fontsDir, 'Inter-Regular.ttf');
    const codePath = path.join(fontsDir, 'FiraCode-SemiBold.ttf');

    if (fs.existsSync(boldPath) && fs.existsSync(regPath)) {
      fontBold = await pdfDoc.embedFont(fs.readFileSync(boldPath));
      fontRegular = await pdfDoc.embedFont(fs.readFileSync(regPath));
      fontCode = fs.existsSync(codePath)
        ? await pdfDoc.embedFont(fs.readFileSync(codePath))
        : fontBold;
      console.log('✓ [Carousel] Loaded Inter & FiraCode TrueType fonts into PDF');
    }
  } catch (fontErr) {
    console.warn('⚠️ Custom font embedding fallback to standard Helvetica:', fontErr);
  }

  // Graceful fallback to standard PDF fonts
  if (!fontBold) fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  if (!fontRegular) fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  if (!fontCode) fontCode = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // 2. Ensure We Always Have a Gorgeous Topic-Related 3D Graphic
  if (!coverImageBuffer || coverImageBuffer.length < 2000) {
    coverImageBuffer = getTopicImage(deck.topic);
  }

  let embeddedCoverImage: any = null;
```
  if (coverImageBuffer && coverImageBuffer.length > 2000) {
    try {
      embeddedCoverImage = await pdfDoc.embedJpg(coverImageBuffer);
    } catch {
      try {
        embeddedCoverImage = await pdfDoc.embedPng(coverImageBuffer);
      } catch (imgErr) {
        console.warn('⚠️ Could not embed cover image buffer in PDF:', imgErr);
      }
    }
  }

  const SLIDE_WIDTH = 1080;
  const SLIDE_HEIGHT = 1350; // Standard 4:5 Portrait format for LinkedIn Carousels
  const totalSlides = deck.slides.length;

  // Curated High-Contrast Dark Palette matching 1788854427653.pdf
  const bgDeep = rgb(0.027, 0.043, 0.082);       // #070b15 Deep Midnight
  const cardBg = rgb(0.047, 0.075, 0.133);       // #0c1322 Glass card background
  const cardBorder = rgb(0.18, 0.28, 0.45);       // #2e4773 Glass card border
  const neonCyan = rgb(0.0, 0.94, 1.0);           // #00F0FF Electric Cyan
  const electricBlue = rgb(0.23, 0.51, 0.96);      // #3b82f6 Blue Accent
  const vibrantPurple = rgb(0.55, 0.36, 0.96);     // #8b5cf6 Purple Accent
  const textWhite = rgb(1.0, 1.0, 1.0);           // Pure White
  const textLight = rgb(0.89, 0.91, 0.94);        // #e2e8f0 Ice Slate
  const textMuted = rgb(0.58, 0.64, 0.72);        // #94a3b8 Slate Muted
  const codeBg = rgb(0.035, 0.055, 0.11);         // #090E1C

  for (let i = 0; i < totalSlides; i++) {
    const rawSlide = deck.slides[i];
    const isFirst = i === 0 || rawSlide.isCover;
    const isLast = i === totalSlides - 1 || rawSlide.isSummary;
    const pageNum = i + 1;

    const page = pdfDoc.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);

    // 1. Deep Midnight Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      color: bgDeep,
    });

    // 1.5 Ambient 3D Graphic Blend on Cover
    if (isFirst && embeddedCoverImage) {
      page.drawImage(embeddedCoverImage, {
        x: 0,
        y: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        opacity: 0.18,
      });
      page.drawRectangle({
        x: 0,
        y: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        color: bgDeep,
        opacity: 0.45,
      });
    }

    // 2. Subtle Blueprint Grid Dots
    for (let gx = 60; gx < SLIDE_WIDTH; gx += 80) {
      for (let gy = 60; gy < SLIDE_HEIGHT; gy += 80) {
        page.drawCircle({
          x: gx,
          y: gy,
          size: 1.2,
          color: rgb(0.09, 0.15, 0.26),
        });
      }
    }

    // 3. Top Glowing Accent Line
    page.drawRectangle({
      x: 0,
      y: SLIDE_HEIGHT - 8,
      width: SLIDE_WIDTH,
      height: 8,
      color: i % 2 === 0 ? vibrantPurple : electricBlue,
    });

    // 4. Top Pagination ("2 of 8", "3 of 8", etc. - on all inner slides)
    if (!isFirst && !isLast) {
      const pageText = `${pageNum} of ${totalSlides}`;
      page.drawText(pageText, {
        x: SLIDE_WIDTH - 150,
        y: SLIDE_HEIGHT - 65,
        size: 22,
        font: fontBold,
        color: textMuted,
      });
    }

    // 5. Global Bottom Footer Line (on all inner slides)
    if (!isFirst && !isLast) {
      page.drawLine({
        start: { x: 70, y: 90 },
        end: { x: SLIDE_WIDTH - 70, y: 90 },
        thickness: 1,
        color: rgb(0.12, 0.18, 0.30),
      });

      const footerLabel = rawSlide.footer || 'Subscribe for more';
      const fW = fontBold.widthOfTextAtSize(footerLabel, 22);
      page.drawText(footerLabel, {
        x: SLIDE_WIDTH / 2 - fW / 2,
        y: 50,
        size: 22,
        font: fontBold,
        color: textMuted,
      });
    }

    // ========================================================
    // SLIDE CONTENT DISPATCH BY ARCHETYPE
    // ========================================================

    if (isFirst || rawSlide.slideType === 'cover') {
      // ──────── COVER SLIDE ────────
      const headlineLines = rawSlide.headline.split('\n');
      let tY = SLIDE_HEIGHT - 220;
      for (const line of headlineLines) {
        const clean = cleanAscii(line);
        const lW = fontBold.widthOfTextAtSize(clean, 56);
        page.drawText(clean, {
          x: SLIDE_WIDTH / 2 - lW / 2,
          y: tY,
          size: 56,
          font: fontBold,
          color: textWhite,
        });
        tY -= 70;
      }

      // Center Graphic Frame
      page.drawRectangle({
        x: 70,
        y: 360,
        width: 940,
        height: 620,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });

      if (embeddedCoverImage) {
        page.drawImage(embeddedCoverImage, {
          x: 72,
          y: 362,
          width: 936,
          height: 616,
        });
      } else {
        // Fallback Blueprint Graphic
        page.drawText('AI ARCHITECTURE MATRIX 2026', {
          x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize('AI ARCHITECTURE MATRIX 2026', 32) / 2,
          y: 660,
          size: 32,
          font: fontBold,
          color: neonCyan,
        });
      }

      // Bottom Brand Pill
      const pillText = rawSlide.footer || 'pakodrive.pk';
      const pillW = fontBold.widthOfTextAtSize(pillText, 24) + 60;
      page.drawRectangle({
        x: SLIDE_WIDTH / 2 - pillW / 2,
        y: 180,
        width: pillW,
        height: 52,
        color: rgb(0.05, 0.09, 0.17),
        borderColor: cardBorder,
        borderWidth: 1.5,
      });
      page.drawText(pillText, {
        x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(pillText, 24) / 2,
        y: 197,
        size: 24,
        font: fontBold,
        color: textWhite,
      });

    } else if (rawSlide.slideType === 'intro') {
      // ──────── INTRO / CONTEXT SLIDE ────────
      // Glowing Robot / AI Avatar Icon
      page.drawCircle({
        x: SLIDE_WIDTH / 2,
        y: SLIDE_HEIGHT - 380,
        size: 60,
        color: cardBg,
        borderColor: neonCyan,
        borderWidth: 3,
      });
      page.drawText('AI', {
        x: SLIDE_WIDTH / 2 - 20,
        y: SLIDE_HEIGHT - 395,
        size: 40,
        font: fontBold,
        color: neonCyan,
      });

      const introLines = rawSlide.points && rawSlide.points.length > 0
        ? rawSlide.points
        : [
            rawSlide.headline,
            rawSlide.subheadline || 'Key findings from the 2026 Developer Survey',
          ];

      let tY = SLIDE_HEIGHT - 540;
      for (const line of introLines) {
        const wrapped = wrapTextLines(cleanAscii(line), 42);
        for (const wl of wrapped) {
          const lW = fontRegular.widthOfTextAtSize(wl, 32);
          page.drawText(wl, {
            x: SLIDE_WIDTH / 2 - lW / 2,
            y: tY,
            size: 32,
            font: fontRegular,
            color: textWhite,
          });
          tY -= 52;
        }
        tY -= 20;
      }

    } else if (rawSlide.slideType === 'bar_chart') {
      // ──────── HORIZONTAL BAR CHART SLIDE ────────
      // Headline & Subheadline
      const hClean = cleanAscii(rawSlide.headline);
      const hW = fontBold.widthOfTextAtSize(hClean, 50);
      page.drawText(hClean, {
        x: SLIDE_WIDTH / 2 - hW / 2,
        y: SLIDE_HEIGHT - 170,
        size: 50,
        font: fontBold,
        color: textWhite,
      });

      if (rawSlide.subheadline) {
        const sClean = cleanAscii(rawSlide.subheadline);
        const sW = fontRegular.widthOfTextAtSize(sClean, 24);
        page.drawText(sClean, {
          x: SLIDE_WIDTH / 2 - sW / 2,
          y: SLIDE_HEIGHT - 220,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

      // Glass Card
      const cardY = 360;
      const cardH = 660;
      page.drawRectangle({
        x: 70,
        y: cardY,
        width: 940,
        height: cardH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });

      page.drawText('AI coding tools: Use at work', {
        x: 110,
        y: cardY + cardH - 60,
        size: 28,
        font: fontBold,
        color: textWhite,
      });
      page.drawText('% of developers using each tool at work', {
        x: 110,
        y: cardY + cardH - 95,
        size: 20,
        font: fontRegular,
        color: textMuted,
      });

      const bars = rawSlide.chartData || [
        { name: 'Claude Code', pct: 39, isHighlight: true },
        { name: 'GitHub Copilot', pct: 21 },
        { name: 'Codex / OpenAI', pct: 16 },
        { name: 'Cursor', pct: 12 },
        { name: 'Gemini Code Assist', pct: 9 },
        { name: 'Windsurf Editor', pct: 6 },
      ];

      let barY = cardY + cardH - 160;
      const maxBarW = 460;
      const maxVal = Math.max(...bars.map(b => b.pct), 45);

      for (const bar of bars) {
        page.drawText(bar.name, {
          x: 110,
          y: barY + 4,
          size: 22,
          font: fontBold,
          color: textWhite,
        });

        const barWidth = Math.max(15, (bar.pct / maxVal) * maxBarW);
        page.drawRectangle({
          x: 380,
          y: barY,
          width: barWidth,
          height: 28,
          color: bar.isHighlight ? vibrantPurple : electricBlue,
        });

        page.drawText(`${bar.pct}%`, {
          x: 390 + barWidth + 15,
          y: barY + 5,
          size: 22,
          font: fontBold,
          color: bar.isHighlight ? vibrantPurple : textWhite,
        });

        barY -= 70;
      }

      // Takeaway quote
      if (rawSlide.takeawayQuote) {
        const qClean = cleanAscii(rawSlide.takeawayQuote);
        const qW = fontRegular.widthOfTextAtSize(qClean, 24);
        page.drawText(qClean, {
          x: SLIDE_WIDTH / 2 - qW / 2,
          y: 250,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

    } else if (rawSlide.slideType === 'column_chart') {
      // ──────── VERTICAL COLUMN DISTRIBUTION SLIDE ────────
      const hClean = cleanAscii(rawSlide.headline);
      const hW = fontBold.widthOfTextAtSize(hClean, 50);
      page.drawText(hClean, {
        x: SLIDE_WIDTH / 2 - hW / 2,
        y: SLIDE_HEIGHT - 170,
        size: 50,
        font: fontBold,
        color: textWhite,
      });

      if (rawSlide.subheadline) {
        const sClean = cleanAscii(rawSlide.subheadline);
        const sW = fontRegular.widthOfTextAtSize(sClean, 24);
        page.drawText(sClean, {
          x: SLIDE_WIDTH / 2 - sW / 2,
          y: SLIDE_HEIGHT - 220,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

      const cardY = 360;
      const cardH = 660;
      page.drawRectangle({
        x: 70,
        y: cardY,
        width: 940,
        height: cardH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });

      page.drawText('How much code do developers really let agents write?', {
        x: 110,
        y: cardY + cardH - 60,
        size: 28,
        font: fontBold,
        color: textWhite,
      });
      page.drawText('Share of code written by AI agents, according to survey', {
        x: 110,
        y: cardY + cardH - 95,
        size: 20,
        font: fontRegular,
        color: textMuted,
      });

      const cols = rawSlide.columnData || [
        { label: '0%', sub: '(none)', pct: 4, h: 40 },
        { label: '1-20%', pct: 7, h: 70 },
        { label: '21-40%', pct: 20, h: 200 },
        { label: '41-60%', pct: 19, h: 190 },
        { label: '61-80%', pct: 18, h: 180 },
        { label: '81-100%', sub: '(almost all)', pct: 22, h: 230, isHighlight: true },
      ];

      const colW = 100;
      const startX = 130;
      const gap = 36;
      const baseY = cardY + 150;

      for (let cIdx = 0; cIdx < cols.length; cIdx++) {
        const col = cols[cIdx];
        const cx = startX + cIdx * (colW + gap);
        const colHeight = col.h || Math.max(30, (col.pct / 25) * 230);

        page.drawText(`${col.pct}%`, {
          x: cx + colW / 2 - fontBold.widthOfTextAtSize(`${col.pct}%`, 24) / 2,
          y: baseY + colHeight + 15,
          size: 24,
          font: fontBold,
          color: col.isHighlight ? textWhite : textLight,
        });

        page.drawRectangle({
          x: cx,
          y: baseY,
          width: colW,
          height: colHeight,
          color: col.isHighlight ? vibrantPurple : electricBlue,
        });

        page.drawText(col.label, {
          x: cx + colW / 2 - fontBold.widthOfTextAtSize(col.label, 18) / 2,
          y: baseY - 30,
          size: 18,
          font: fontBold,
          color: textWhite,
        });
      }

      if (rawSlide.takeawayQuote) {
        const qClean = cleanAscii(rawSlide.takeawayQuote);
        const qW = fontRegular.widthOfTextAtSize(qClean, 24);
        page.drawText(qClean, {
          x: SLIDE_WIDTH / 2 - qW / 2,
          y: 250,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

    } else if (rawSlide.slideType === 'diagram') {
      // ──────── SYSTEM WORKFLOW DIAGRAM SLIDE ────────
      const hClean = cleanAscii(rawSlide.headline);
      const hW = fontBold.widthOfTextAtSize(hClean, 50);
      page.drawText(hClean, {
        x: SLIDE_WIDTH / 2 - hW / 2,
        y: SLIDE_HEIGHT - 170,
        size: 50,
        font: fontBold,
        color: textWhite,
      });

      if (rawSlide.subheadline) {
        const sClean = cleanAscii(rawSlide.subheadline);
        const sW = fontRegular.widthOfTextAtSize(sClean, 24);
        page.drawText(sClean, {
          x: SLIDE_WIDTH / 2 - sW / 2,
          y: SLIDE_HEIGHT - 220,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

      const cardY = 360;
      const cardH = 660;
      page.drawRectangle({
        x: 70,
        y: cardY,
        width: 940,
        height: cardH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });

      page.drawText('JETBRAINS', {
        x: 110,
        y: cardY + cardH - 60,
        size: 26,
        font: fontBold,
        color: textWhite,
      });
      page.drawText('So what happens next?', {
        x: 110,
        y: cardY + cardH - 110,
        size: 32,
        font: fontBold,
        color: textWhite,
      });

      const dData = rawSlide.diagramData || {
        leftTasks: ['Write boilerplate code', 'Generate unit tests', 'Refactor legacy code', 'Explore complex APIs', 'Design system schemas'],
        rightOutcomes: ['Handles repetitive tasks', 'Runs build & lint checks', 'Writes documentation', 'Frees time for systems', 'Accelerates velocity 3x'],
      };

      // Left Tasks Box
      let tBoxY = cardY + cardH - 180;
      for (const t of dData.leftTasks) {
        page.drawRectangle({
          x: 110,
          y: tBoxY,
          width: 250,
          height: 52,
          color: rgb(0.06, 0.10, 0.18),
          borderColor: cardBorder,
          borderWidth: 1.5,
        });
        page.drawText(cleanAscii(t), {
          x: 125,
          y: tBoxY + 18,
          size: 16,
          font: fontBold,
          color: textLight,
        });
        tBoxY -= 68;
      }

      // Middle: You Node
      page.drawCircle({
        x: 460,
        y: cardY + cardH - 320,
        size: 45,
        color: rgb(0.08, 0.14, 0.26),
        borderColor: neonCyan,
        borderWidth: 2.5,
      });
      page.drawText('You', {
        x: 442,
        y: cardY + cardH - 328,
        size: 22,
        font: fontBold,
        color: textWhite,
      });
      page.drawText('Decide what to delegate', {
        x: 395,
        y: cardY + cardH - 380,
        size: 14,
        font: fontRegular,
        color: textMuted,
      });

      // Arrow ->
      page.drawText('->', {
        x: 530,
        y: cardY + cardH - 328,
        size: 28,
        font: fontBold,
        color: neonCyan,
      });

      // Middle: AI Agent Node
      page.drawCircle({
        x: 610,
        y: cardY + cardH - 320,
        size: 45,
        color: vibrantPurple,
        borderColor: textWhite,
        borderWidth: 2.5,
      });
      page.drawText('AI', {
        x: 598,
        y: cardY + cardH - 328,
        size: 22,
        font: fontBold,
        color: textWhite,
      });
      page.drawText('Autonomous Agent', {
        x: 550,
        y: cardY + cardH - 380,
        size: 14,
        font: fontRegular,
        color: textMuted,
      });

      // Right Outcomes Box
      let oBoxY = cardY + cardH - 180;
      for (const o of dData.rightOutcomes) {
        page.drawRectangle({
          x: 710,
          y: oBoxY,
          width: 260,
          height: 52,
          color: rgb(0.06, 0.10, 0.18),
          borderColor: cardBorder,
          borderWidth: 1.5,
        });
        page.drawText(cleanAscii(o), {
          x: 725,
          y: oBoxY + 18,
          size: 16,
          font: fontBold,
          color: neonCyan,
        });
        oBoxY -= 68;
      }

      if (rawSlide.takeawayQuote) {
        const qClean = cleanAscii(rawSlide.takeawayQuote);
        const qW = fontRegular.widthOfTextAtSize(qClean, 24);
        page.drawText(qClean, {
          x: SLIDE_WIDTH / 2 - qW / 2,
          y: 250,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

    } else if (isLast || rawSlide.slideType === 'outro') {
      // ──────── OUTRO / PROFILE CONVERSION SLIDE ────────
      const hClean = cleanAscii(rawSlide.headline);
      const hW = fontBold.widthOfTextAtSize(hClean, 52);
      page.drawText(hClean, {
        x: SLIDE_WIDTH / 2 - hW / 2,
        y: SLIDE_HEIGHT - 170,
        size: 52,
        font: fontBold,
        color: textWhite,
      });

      const sClean = cleanAscii(rawSlide.subheadline || 'Stand out with clean, high-performance web architecture.');
      const sW = fontRegular.widthOfTextAtSize(sClean, 24);
      page.drawText(sClean, {
        x: SLIDE_WIDTH / 2 - sW / 2,
        y: SLIDE_HEIGHT - 220,
        size: 24,
        font: fontRegular,
        color: textLight,
      });

      const cardY = 240;
      const cardH = 820;
      page.drawRectangle({
        x: 70,
        y: cardY,
        width: 940,
        height: cardH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });

      page.drawText('Pak-o-Drive Engineering', {
        x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize('Pak-o-Drive Engineering', 48) / 2,
        y: cardY + cardH - 110,
        size: 48,
        font: fontBold,
        color: textWhite,
      });

      const questions = rawSlide.points && rawSlide.points.length > 0
        ? rawSlide.points
        : [
            'Why is my site performance lagging?',
            'Why isn\'t my web application converting?',
            'How do I integrate autonomous AI agents safely?',
          ];

      let qY = cardY + cardH - 210;
      for (const q of questions) {
        const qClean = cleanAscii(q);
        const qW = fontRegular.widthOfTextAtSize(qClean, 22) + 60;
        page.drawRectangle({
          x: SLIDE_WIDTH / 2 - qW / 2,
          y: qY,
          width: qW,
          height: 50,
          color: rgb(0.06, 0.10, 0.19),
          borderColor: cardBorder,
          borderWidth: 1.5,
        });
        page.drawText(qClean, {
          x: SLIDE_WIDTH / 2 - fontRegular.widthOfTextAtSize(qClean, 22) / 2,
          y: qY + 16,
          size: 22,
          font: fontRegular,
          color: textLight,
        });
        qY -= 75;
      }

      const urlText = rawSlide.footer || 'pakodrive.pk';
      page.drawText(urlText, {
        x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(urlText, 26) / 2,
        y: qY - 30,
        size: 26,
        font: fontBold,
        color: neonCyan,
      });

      // Creator Avatar Circle
      page.drawCircle({
        x: SLIDE_WIDTH / 2,
        y: cardY + 180,
        size: 65,
        color: rgb(0.04, 0.08, 0.16),
        borderColor: neonCyan,
        borderWidth: 3,
      });
      page.drawText('SA', {
        x: SLIDE_WIDTH / 2 - 28,
        y: cardY + 165,
        size: 42,
        font: fontBold,
        color: neonCyan,
      });

      page.drawText('Syed Adil Ali', {
        x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize('Syed Adil Ali', 32) / 2,
        y: cardY + 80,
        size: 32,
        font: fontBold,
        color: textWhite,
      });
      page.drawText('Senior Full-Stack & Systems Architect', {
        x: SLIDE_WIDTH / 2 - fontRegular.widthOfTextAtSize('Senior Full-Stack & Systems Architect', 22) / 2,
        y: cardY + 45,
        size: 22,
        font: fontRegular,
        color: textMuted,
      });

    } else {
      // ──────── DEFAULT / STAT_CARD / CODE_TERMINAL SLIDE ────────
      const hClean = cleanAscii(rawSlide.headline);
      const hW = fontBold.widthOfTextAtSize(hClean, 50);
      page.drawText(hClean, {
        x: SLIDE_WIDTH / 2 - hW / 2,
        y: SLIDE_HEIGHT - 170,
        size: 50,
        font: fontBold,
        color: textWhite,
      });

      if (rawSlide.subheadline) {
        const sClean = cleanAscii(rawSlide.subheadline);
        const sW = fontRegular.widthOfTextAtSize(sClean, 24);
        page.drawText(sClean, {
          x: SLIDE_WIDTH / 2 - sW / 2,
          y: SLIDE_HEIGHT - 220,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }

      const cardY = 380;
      const cardH = 640;
      page.drawRectangle({
        x: 70,
        y: cardY,
        width: 940,
        height: cardH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });

      const cardContent = rawSlide.cardContent || {
        badge: rawSlide.tag || 'ARCHITECTURE',
        title: rawSlide.headline,
        bodyLines: rawSlide.points || ['Key architectural takeaways for high-scale systems.'],
      };

      if (cardContent.badge) {
        page.drawText(cleanAscii(cardContent.badge), {
          x: 110,
          y: cardY + cardH - 60,
          size: 26,
          font: fontBold,
          color: textWhite,
        });
      }

      if (cardContent.tagline) {
        page.drawText(cleanAscii(cardContent.tagline), {
          x: 110,
          y: cardY + cardH - 120,
          size: 20,
          font: fontRegular,
          color: electricBlue,
        });
      }

      if (cardContent.title) {
        page.drawText(cleanAscii(cardContent.title), {
          x: 110,
          y: cardY + cardH - 165,
          size: 36,
          font: fontBold,
          color: textWhite,
        });
      }

      page.drawLine({
        start: { x: 110, y: cardY + cardH - 240 },
        end: { x: 970, y: cardY + cardH - 240 },
        thickness: 1,
        color: rgb(0.15, 0.22, 0.35),
      });

      if (cardContent.highlightText) {
        page.drawText(cleanAscii(cardContent.highlightText), {
          x: 110,
          y: cardY + cardH - 290,
          size: 26,
          font: fontBold,
          color: vibrantPurple,
        });
      }

      let lineY = cardY + cardH - (cardContent.highlightText ? 335 : 290);
      if (cardContent.bodyLines) {
        for (const bl of cardContent.bodyLines) {
          page.drawText(cleanAscii(bl), {
            x: 110,
            y: lineY,
            size: 24,
            font: fontRegular,
            color: textLight,
          });
          lineY -= 36;
        }
      }

      // If codeSnippet present, draw clean code box
      if (rawSlide.codeSnippet) {
        const rawLines = rawSlide.codeSnippet.split('\n').slice(0, 4);
        page.drawRectangle({
          x: 110,
          y: cardY + 50,
          width: 860,
          height: 160,
          color: codeBg,
          borderColor: electricBlue,
          borderWidth: 1.5,
        });

        let codeY = cardY + 160;
        for (const cl of rawLines) {
          page.drawText(cleanAscii(cl), {
            x: 130,
            y: codeY,
            size: 18,
            font: fontCode,
            color: cl.trim().startsWith('//') ? textMuted : neonCyan,
          });
          codeY -= 30;
        }
      }

      if (rawSlide.takeawayQuote) {
        const qClean = cleanAscii(rawSlide.takeawayQuote);
        const qW = fontRegular.widthOfTextAtSize(qClean, 24);
        page.drawText(qClean, {
          x: SLIDE_WIDTH / 2 - qW / 2,
          y: 260,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
