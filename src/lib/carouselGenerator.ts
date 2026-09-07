import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export interface CarouselSlide {
  tag?: string;
  headline: string;
  codeSnippet?: string;
  points?: string[];
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

  const SLIDE_SIZE = 1080;
  const totalSlides = deck.slides.length;

  // Curated High-Contrast Dark Palette
  const bgDeep = rgb(0.024, 0.035, 0.063);       // #060910
  const cardBg = rgb(0.047, 0.078, 0.141);       // #0C1424
  const cardBorder = rgb(0.20, 0.38, 0.65);       // #3361A6 - High-Contrast crisp border
  const neonCyan = rgb(0.0, 0.94, 1.0);           // #00F0FF - High-Vibrancy Cyan
  const electricBlue = rgb(0.24, 0.55, 1.0);      // #3D8CFF
  const textWhite = rgb(1.0, 1.0, 1.0);           // Pure 100% White
  const textLight = rgb(0.92, 0.95, 0.99);        // #EBF2FC - Ultra crisp text
  const textMuted = rgb(0.74, 0.82, 0.92);        // #BDD1EB - Clean readable slate
  const codeBg = rgb(0.035, 0.055, 0.11);         // #090E1C
  const codeBorder = rgb(0.18, 0.45, 0.82);       // #2E73D1

  for (let i = 0; i < totalSlides; i++) {
    const rawSlide = deck.slides[i];
    const slide: CarouselSlide = {
      ...rawSlide,
      tag: cleanAscii(rawSlide.tag),
      headline: cleanAscii(rawSlide.headline),
      codeSnippet: rawSlide.codeSnippet ? cleanAscii(rawSlide.codeSnippet) : undefined,
      points: rawSlide.points?.map(p => cleanAscii(p)),
      footer: rawSlide.footer ? cleanAscii(rawSlide.footer) : undefined,
    };

    const page = pdfDoc.addPage([SLIDE_SIZE, SLIDE_SIZE]);

    // 1. Deep Tech Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: SLIDE_SIZE,
      height: SLIDE_SIZE,
      color: bgDeep,
    });

    // 1.5 Visible Topic-Related 3D Graphic Background on EVERY Slide
    if (embeddedCoverImage) {
      page.drawImage(embeddedCoverImage, {
        x: 0,
        y: 0,
        width: SLIDE_SIZE,
        height: SLIDE_SIZE,
        opacity: i === 0 ? 0.30 : (slide.isSummary || i === totalSlides - 1 ? 0.32 : 0.28),
      });

      // Atmospheric Dark Translucent Veil to guarantee maximum text contrast
      page.drawRectangle({
        x: 0,
        y: 0,
        width: SLIDE_SIZE,
        height: SLIDE_SIZE,
        color: bgDeep,
        opacity: i === 0 ? 0.35 : 0.45,
      });
    }

    // 2. Subtle Tech Blueprint Grid Dots
    for (let gx = 60; gx < SLIDE_SIZE; gx += 80) {
      for (let gy = 60; gy < SLIDE_SIZE; gy += 80) {
        page.drawCircle({
          x: gx,
          y: gy,
          size: 1.5,
          color: rgb(0.12, 0.22, 0.38),
        });
      }
    }

    // 3. Top Glowing Neon Gradient Line
    page.drawRectangle({
      x: 0,
      y: SLIDE_SIZE - 10,
      width: SLIDE_SIZE,
      height: 10,
      color: i % 2 === 0 ? neonCyan : electricBlue,
    });

    // 4. Header Bar: Tag Badge & Slide Counter
    const pageNumText = `${String(i + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    page.drawText(pageNumText, {
      x: SLIDE_SIZE - 180,
      y: SLIDE_SIZE - 72,
      size: 26,
      font: fontBold,
      color: textLight,
    });

    const tagText = (slide.tag || (slide.isCover ? 'TECH MASTERCLASS' : 'SYSTEM ARCHITECTURE')).toUpperCase();
    const tagTextW = fontBold.widthOfTextAtSize(tagText, 19);
    const tagBadgeWidth = Math.min(tagTextW + 36, 680);
    page.drawRectangle({
      x: 70,
      y: SLIDE_SIZE - 85,
      width: tagBadgeWidth,
      height: 42,
      color: cardBg,
      borderColor: neonCyan,
      borderWidth: 2,
    });
    page.drawText(tagText, {
      x: 88,
      y: SLIDE_SIZE - 70,
      size: 19,
      font: fontBold,
      color: neonCyan,
    });

    if (slide.isCover) {
      // ================= 1. COVER SLIDE =================
      // Headline (Prominent 52px Bold, high contrast)
      const headlineLines = wrapTextLines(slide.headline, 28).slice(0, 3);
      let textY = SLIDE_SIZE - 160;

      for (let lineIdx = 0; lineIdx < headlineLines.length; lineIdx++) {
        page.drawText(headlineLines[lineIdx], {
          x: 70,
          y: textY,
          size: 52,
          font: fontBold,
          color: lineIdx === 1 ? neonCyan : textWhite,
        });
        textY -= 64;
      }

      // Center Visual Hero Frame: High-Res 3D Isometric Tech Graphic
      const imgCardY = 240;
      const imgCardHeight = 450;
      page.drawRectangle({
        x: 68,
        y: imgCardY - 2,
        width: 944,
        height: imgCardHeight + 4,
        color: rgb(0.02, 0.04, 0.09),
        borderColor: neonCyan,
        borderWidth: 2.5,
      });

      if (embeddedCoverImage) {
        page.drawImage(embeddedCoverImage, {
          x: 70,
          y: imgCardY,
          width: 940,
          height: imgCardHeight,
        });
      } else {
        // Fallback Blueprint Box
        page.drawRectangle({
          x: 70,
          y: imgCardY,
          width: 940,
          height: imgCardHeight,
          color: codeBg,
        });
        page.drawText('SYSTEM ARCHITECTURE MATRIX', {
          x: 240,
          y: imgCardY + 220,
          size: 32,
          font: fontBold,
          color: neonCyan,
        });
      }

      // Swipe prompt button on Cover
      page.drawRectangle({
        x: 70,
        y: 135,
        width: 420,
        height: 68,
        color: neonCyan,
      });
      page.drawText('SWIPE TO EXPLORE  ->', {
        x: 100,
        y: 158,
        size: 26,
        font: fontBold,
        color: rgb(0.02, 0.05, 0.10),
      });

      page.drawText('6-Slide Architectural Guide', {
        x: 520,
        y: 160,
        size: 24,
        font: fontBold,
        color: textLight,
      });
    } else if (slide.isSummary || i === totalSlides - 1) {
      // ================= 2. FINAL SLIDE: CREATOR & FOLLOW CTA =================
      // Top Headline (Large, High Contrast)
      page.drawText('Found this breakdown valuable?', {
        x: 70,
        y: SLIDE_SIZE - 145,
        size: 50,
        font: fontBold,
        color: textWhite,
      });

      page.drawText('Save this cheat sheet and follow for weekly production architectures.', {
        x: 70,
        y: SLIDE_SIZE - 192,
        size: 24,
        font: fontRegular,
        color: textLight,
      });

      // Master Profile Card (Crystal Clear, High Legibility)
      const profileCardY = 200;
      const profileCardHeight = 520;

      page.drawRectangle({
        x: 70,
        y: profileCardY,
        width: 940,
        height: profileCardHeight,
        color: cardBg,
        borderColor: neonCyan,
        borderWidth: 2.5,
      });

      // Stylized Avatar Ring with glowing Cyan border
      page.drawCircle({
        x: 175,
        y: profileCardY + 415,
        size: 62,
        color: rgb(0.03, 0.06, 0.13),
        borderColor: neonCyan,
        borderWidth: 3.5,
      });
      page.drawText('SA', {
        x: 146,
        y: profileCardY + 398,
        size: 44,
        font: fontBold,
        color: neonCyan,
      });

      // Creator Identity
      page.drawText('SYED ADIL ALI', {
        x: 260,
        y: profileCardY + 432,
        size: 46,
        font: fontBold,
        color: textWhite,
      });

      page.drawText('Senior Full-Stack Engineer & Systems Architect', {
        x: 260,
        y: profileCardY + 394,
        size: 28,
        font: fontBold,
        color: neonCyan,
      });

      const stackText = 'Next.js 16  •  React 19  •  High-Scale Node.js  •  Distributed Systems';
      let stackSize = 22;
      const stackWidth = fontBold.widthOfTextAtSize(stackText, stackSize);
      if (stackWidth > 710) {
        stackSize = Math.floor(stackSize * (710 / stackWidth));
      }
      page.drawText(stackText, {
        x: 260,
        y: profileCardY + 358,
        size: stackSize,
        font: fontBold,
        color: textWhite,
      });

      // Prominent Follow Button Mockup
      page.drawRectangle({
        x: 260,
        y: profileCardY + 258,
        width: 480,
        height: 70,
        color: neonCyan,
      });
      page.drawText('+ Follow @Syed Adil Ali', {
        x: 310,
        y: profileCardY + 282,
        size: 30,
        font: fontBold,
        color: rgb(0.02, 0.05, 0.10),
      });

      // Divider line
      page.drawLine({
        start: { x: 100, y: profileCardY + 225 },
        end: { x: 980, y: profileCardY + 225 },
        thickness: 1.5,
        color: electricBlue,
      });

      // 3 Action Pillars: Repost, Save, Discuss
      const pillarWidth = 280;

      // 1. Repost
      page.drawRectangle({
        x: 95,
        y: profileCardY + 45,
        width: pillarWidth,
        height: 145,
        color: codeBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });
      page.drawText('[ REPOST ]', { x: 115, y: profileCardY + 145, size: 24, font: fontBold, color: neonCyan });
      page.drawText('Share with peers &', { x: 115, y: profileCardY + 110, size: 22, font: fontBold, color: textWhite });
      page.drawText('devs in your feed', { x: 115, y: profileCardY + 80, size: 20, font: fontRegular, color: textLight });

      // 2. Save
      page.drawRectangle({
        x: 400,
        y: profileCardY + 45,
        width: pillarWidth,
        height: 145,
        color: codeBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });
      page.drawText('[ SAVE ]', { x: 420, y: profileCardY + 145, size: 24, font: fontBold, color: neonCyan });
      page.drawText('Bookmark for your', { x: 420, y: profileCardY + 110, size: 22, font: fontBold, color: textWhite });
      page.drawText('next sprint review', { x: 420, y: profileCardY + 80, size: 20, font: fontRegular, color: textLight });

      // 3. Discuss
      page.drawRectangle({
        x: 705,
        y: profileCardY + 45,
        width: pillarWidth,
        height: 145,
        color: codeBg,
        borderColor: cardBorder,
        borderWidth: 2,
      });
      page.drawText('[ DISCUSS ]', { x: 725, y: profileCardY + 145, size: 24, font: fontBold, color: neonCyan });
      page.drawText('Drop your thoughts', { x: 725, y: profileCardY + 110, size: 22, font: fontBold, color: textWhite });
      page.drawText('& questions below', { x: 725, y: profileCardY + 80, size: 20, font: fontRegular, color: textLight });
    } else {
      // ================= 3. CONTENT SLIDES (SLIDES 02 TO 05) =================
      // Headline (High Contrast, safely wrapped and fitted)
      const headlineLines = wrapTextLines(slide.headline, 28).slice(0, 2);
      let headY = SLIDE_SIZE - 150;
      for (let hIdx = 0; hIdx < headlineLines.length; hIdx++) {
        let lineHeadSize = 48;
        const lineW = fontBold.widthOfTextAtSize(headlineLines[hIdx], lineHeadSize);
        if (lineW > 920) {
          lineHeadSize = Math.max(32, Math.floor(lineHeadSize * (920 / lineW)));
        }
        page.drawText(headlineLines[hIdx], {
          x: 70,
          y: headY,
          size: lineHeadSize,
          font: fontBold,
          color: hIdx === 0 ? textWhite : neonCyan,
        });
        headY -= 58;
      }

      let currentY = headY - 15;

      // Visual Code Terminal (if codeSnippet present)
      if (rawSlide.codeSnippet) {
        const rawLines = rawSlide.codeSnippet.split('\n').slice(0, 5);
        const codeBoxHeight = rawLines.length * 42 + 65;

        page.drawRectangle({
          x: 70,
          y: currentY - codeBoxHeight,
          width: 940,
          height: codeBoxHeight,
          color: codeBg,
          borderColor: codeBorder,
          borderWidth: 2,
        });

        // Window controls (Red, Yellow, Green mac dots)
        page.drawCircle({ x: 100, y: currentY - 25, size: 8, color: rgb(0.95, 0.28, 0.28) });
        page.drawCircle({ x: 126, y: currentY - 25, size: 8, color: rgb(0.96, 0.77, 0.18) });
        page.drawCircle({ x: 152, y: currentY - 25, size: 8, color: rgb(0.20, 0.80, 0.40) });

        // Terminal file tab title
        page.drawText('architecture.ts', {
          x: 185,
          y: currentY - 33,
          size: 20,
          font: fontBold,
          color: textLight,
        });

        // Guard against code overflowing terminal box: max available width is 840px
        const MAX_CODE_WIDTH = 840;
        let codeFontSize = 23;
        for (const line of rawLines) {
          const cleaned = cleanAscii(line);
          if (cleaned.length > 0) {
            const lineWidth = fontCode.widthOfTextAtSize(cleaned, codeFontSize);
            if (lineWidth > MAX_CODE_WIDTH) {
              const fitted = Math.floor(codeFontSize * (MAX_CODE_WIDTH / lineWidth));
              if (fitted < codeFontSize) {
                codeFontSize = fitted;
              }
            }
          }
        }
        codeFontSize = Math.max(17, Math.min(23, codeFontSize));

        let codeY = currentY - 72;
        for (const line of rawLines) {
          const isComment = line.trim().startsWith('//');
          let cleanLine = cleanAscii(line);

          // Hard safety limit: clamp if still wider than MAX_CODE_WIDTH
          let lineWidth = fontCode.widthOfTextAtSize(cleanLine, codeFontSize);
          if (lineWidth > MAX_CODE_WIDTH) {
            while (cleanLine.length > 10 && fontCode.widthOfTextAtSize(cleanLine + '...', codeFontSize) > MAX_CODE_WIDTH) {
              cleanLine = cleanLine.slice(0, -1);
            }
            cleanLine = cleanLine + '...';
          }

          page.drawText(cleanLine, {
            x: 100,
            y: codeY,
            size: codeFontSize,
            font: fontCode,
            color: isComment ? rgb(0.60, 0.70, 0.82) : rgb(0.40, 0.90, 1.0),
          });
          codeY -= 40;
        }

        currentY -= codeBoxHeight + 35;
      }

      // Feature Takeaway Cards (Roomy, High Contrast, Guaranteed No Overflow)
      if (slide.points && slide.points.length > 0) {
        const cardHeight = 96;
        const totalPoints = slide.points.slice(0, 3);
        const MAX_POINT_TEXT_WIDTH = 810; // Card is 940px, text starts at 165px -> ends at 975px (35px safety margin)

        for (let ptIdx = 0; ptIdx < totalPoints.length; ptIdx++) {
          const pt = totalPoints[ptIdx];
          const cardY = currentY - (ptIdx * (cardHeight + 18)) - cardHeight;

          // Card Background & Glowing Border
          page.drawRectangle({
            x: 70,
            y: cardY,
            width: 940,
            height: cardHeight,
            color: cardBg,
            borderColor: cardBorder,
            borderWidth: 2,
          });

          // Number Badge Square
          page.drawRectangle({
            x: 90,
            y: cardY + 22,
            width: 52,
            height: 52,
            color: codeBg,
            borderColor: neonCyan,
            borderWidth: 2,
          });
          page.drawText(`0${ptIdx + 1}`, {
            x: 101,
            y: cardY + 37,
            size: 24,
            font: fontBold,
            color: neonCyan,
          });

          // Parse point text: e.g. "Best for: Description text"
          const colonIndex = pt.indexOf(':');
          if (colonIndex > 0 && colonIndex < 25) {
            const prefix = pt.slice(0, colonIndex + 1);
            const rest = pt.slice(colonIndex + 1).trim();

            const prefixSize = 25;
            const prefixWidth = fontBold.widthOfTextAtSize(prefix, prefixSize);
            const maxRestWidth = MAX_POINT_TEXT_WIDTH - prefixWidth - 12;

            let restSize = 24;
            let restWidth = fontRegular.widthOfTextAtSize(rest, restSize);

            if (restWidth > maxRestWidth) {
              const scaled = Math.floor(restSize * (maxRestWidth / restWidth));
              if (scaled >= 19) {
                restSize = scaled;
                restWidth = fontRegular.widthOfTextAtSize(rest, restSize);
              }
            }

            if (restWidth <= maxRestWidth) {
              // Fits on single line
              page.drawText(prefix, {
                x: 165,
                y: cardY + 36,
                size: prefixSize,
                font: fontBold,
                color: neonCyan,
              });
              page.drawText(rest, {
                x: 165 + prefixWidth + 10,
                y: cardY + 36,
                size: restSize,
                font: fontRegular,
                color: textWhite,
              });
            } else {
              // 2-line layout for longer descriptions
              const wrappedRest = wrapTextLines(rest, 38).slice(0, 2);
              page.drawText(prefix, {
                x: 165,
                y: cardY + 52,
                size: 23,
                font: fontBold,
                color: neonCyan,
              });
              page.drawText(wrappedRest[0] || '', {
                x: 165 + prefixWidth + 10,
                y: cardY + 52,
                size: 21,
                font: fontRegular,
                color: textWhite,
              });
              if (wrappedRest[1]) {
                page.drawText(wrappedRest[1], {
                  x: 165,
                  y: cardY + 22,
                  size: 21,
                  font: fontRegular,
                  color: textWhite,
                });
              }
            }
          } else {
            // Point without colon
            let ptSize = 25;
            let ptWidth = fontRegular.widthOfTextAtSize(pt, ptSize);

            if (ptWidth > MAX_POINT_TEXT_WIDTH) {
              const scaled = Math.floor(ptSize * (MAX_POINT_TEXT_WIDTH / ptWidth));
              if (scaled >= 20) {
                ptSize = scaled;
                ptWidth = fontRegular.widthOfTextAtSize(pt, ptSize);
              }
            }

            if (ptWidth <= MAX_POINT_TEXT_WIDTH) {
              page.drawText(pt, {
                x: 165,
                y: cardY + 36,
                size: ptSize,
                font: fontRegular,
                color: textWhite,
              });
            } else {
              // 2-line layout
              const wrappedLines = wrapTextLines(pt, 48).slice(0, 2);
              page.drawText(wrappedLines[0] || '', {
                x: 165,
                y: cardY + 52,
                size: 21,
                font: fontRegular,
                color: textWhite,
              });
              if (wrappedLines[1]) {
                page.drawText(wrappedLines[1], {
                  x: 165,
                  y: cardY + 22,
                  size: 21,
                  font: fontRegular,
                  color: textWhite,
                });
              }
            }
          }
        }
      }
    }

    // 5. Global Bottom Footer Bar on Every Slide
    page.drawLine({
      start: { x: 70, y: 95 },
      end: { x: SLIDE_SIZE - 70, y: 95 },
      thickness: 1.5,
      color: electricBlue,
    });

    page.drawText('SYED ADIL ALI  |  Senior Full-Stack Architect', {
      x: 70,
      y: 62,
      size: 22,
      font: fontBold,
      color: neonCyan,
    });

    const rightFooterText = slide.footer || (i === totalSlides - 1 ? 'Save & Repost 🔁' : 'Swipe ->');
    page.drawText(rightFooterText, {
      x: SLIDE_SIZE - rightFooterText.length * 14 - 70,
      y: 62,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
