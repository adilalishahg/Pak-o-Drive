import type { CarouselDeck } from './types';

export const CURATED_DECKS: CarouselDeck[] = [
  {
    topic: 'AI Coding Agents Are Becoming Standard: 2026 Developer Survey Insights',
    caption: `AI coding agents are officially mainstream. 🤖⚡
#AICoding #SoftwareEngineering #DeveloperTools #TechArchitecture #FutureOfCode #FullStack

According to the latest 2026 Developer Ecosystem data, coding agents have rapidly graduated from experimental tools into everyday software engineering infrastructure.

Here are the key takeaways from the 8-slide masterclass:

📌 90% of professional developers now use AI coding agents at least weekly.
📌 68% use them daily, making agentic workflows an essential part of daily standups and sprint cycles.
📌 The tool race is heating up: Claude Code leads work adoption at 39%, followed by GitHub Copilot (21%), Codex (16%), and Cursor (12%).
📌 Only 22% of engineers let agents write >80% of their code — meaning developers are acting as system architects and orchestrators, not just manual typers.

The most valuable skill in 2026 is no longer fast keystrokes — it's knowing how to delegate architectural tasks effectively.

Swipe through the 8-slide carousel above for the complete visual breakdown! ➡️

#AICoding #SoftwareEngineering #DeveloperTools #TechArchitecture #FutureOfCode #FullStack #WebDevelopment #Programming #ArtificialIntelligence #NextJS`,
    slides: [
      {
        isCover: true,
        slideType: 'cover',
        tag: '2026 DEV ECOSYSTEM SURVEY',
        headline: 'AI Coding Agents\nAre Becoming Standard',
        footer: 'SWIPE TO LEARN ->',
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
          { name: 'OpenAI Codex', pct: 16 },
          { name: 'Cursor', pct: 12 },
          { name: 'Others', pct: 12 },
        ],
        takeawayQuote: '"Claude Code leads work adoption at 39%."',
        footer: 'Subscribe for more',
      },
      {
        slideType: 'column_chart',
        tag: '04 / CODE VOLUME DELEGATED',
        headline: 'Delegation sweet spot',
        subheadline: 'Only 22% let AI write >80% of code. Most engineers keep human-in-the-loop review.',
        columnData: [
          { label: '<20%', pct: 15, h: 150 },
          { label: '21-40%', pct: 24, h: 240 },
          { label: '41-60%', pct: 23, h: 230 },
          { label: '61-80%', pct: 16, h: 160 },
          { label: '>80%', pct: 22, h: 220, isHighlight: true },
        ],
        takeawayQuote: '"Only 22% let agents write >80% of code."',
        footer: 'Subscribe for more',
      },
      {
        slideType: 'diagram',
        tag: '05 / AGENT ARCHITECTURE',
        headline: 'What agents do best',
        subheadline: 'From routine tasks to architectural scaffolding, here is where AI excels.',
        diagramData: {
          leftTasks: ['Writing unit tests', 'Code refactoring', 'Boilerplate gen', 'API exploration'],
          centerUserText: 'YOU\nDecide & Guide',
          centerAgentText: 'AI\nExecutes & Tests',
          rightOutcomes: ['Frees time for systems', 'Runs build & tests', 'Drafts documentation'],
        },
        takeawayQuote: '"Humans architect. Agents implement and test."',
        footer: 'Subscribe for more',
      },
      {
        isSummary: true,
        slideType: 'outro',
        tag: 'DECISION MATRIX',
        headline: 'Found this breakdown valuable?',
        subheadline: 'Save this cheat sheet and follow for weekly production architectures.',
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'Rendering Strategies Explained: CSR vs SSR vs SSG vs ISR',
    caption: `Stop choosing rendering paradigms on guesswork. 🛑
#WebPerformance #NextJS #React19 #SystemDesign #FullStack #SoftwareArchitecture

In production, picking the wrong rendering strategy can silently sabotage your Core Web Vitals (LCP/TTFB), tank SEO rankings, or spike cloud compute 10x:

⚡ CSR: Instant CDN delivery, but slower First Contentful Paint.
⚡ SSR: Fresh HTML per request, with server compute overhead.
⚡ SSG: Extreme edge speed, but requires full redeployments.
⚡ ISR: The sweet spot — static edge speed + background revalidation.

Swipe through this 6-slide architecture cheat sheet above! ➡️

#WebPerformance #NextJS #React19 #WebDevelopment #SystemDesign #FullStack #Frontend #SoftwareArchitecture #CleanCode #CloudComputing`,
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
        footer: 'SWIPE TO COMPARE ->',
      },
      {
        tag: '01 / CLIENT-SIDE RENDERING',
        headline: 'HTML is empty. Browser builds everything.',
        codeSnippet: `// Browser downloads minimal HTML & bundle\nconst Dashboard = () => <div>Interactive App</div>;\n// Fast initial CDN delivery, slower FCP`,
        points: [
          'Best for: Private SaaS portals, logged-in dashboards',
          'Trade-off: Weak SEO and slower First Contentful Paint',
          'Execution: 100% computed inside the client browser',
        ],
      },
      {
        tag: '02 / SERVER-SIDE RENDERING',
        headline: 'HTML rendered fresh on every single hit.',
        codeSnippet: `// Fresh compute per incoming request\nexport default async function FeedPage() {\n  const liveData = await getRealtimeData();\n  return <Feed items={liveData} />;\n}`,
        points: [
          'Best for: Real-time feeds, personalized user views',
          'Trade-off: Server compute overhead under traffic spikes',
          'Execution: Server crafts fresh HTML before response',
        ],
      },
      {
        tag: '03 / STATIC SITE GENERATION',
        headline: 'Compiled once at build time. Instant edge CDN.',
        codeSnippet: `// Pre-rendered during build phase\nexport async function generateStaticParams() {\n  return articles.map(a => ({ slug: a.slug }));\n}`,
        points: [
          'Best for: Documentation, marketing pages, blogs',
          'Trade-off: Requires full deployment to update content',
          'Execution: Statically served directly from Edge CDN',
        ],
      },
      {
        tag: '04 / INCREMENTAL STATIC REGENERATION',
        headline: 'Static edge speed + periodic background revalidation.',
        codeSnippet: `// Stale-while-revalidate every 60 seconds\nexport const revalidate = 60;\nexport default async function Catalog() { ... }`,
        points: [
          'Best for: E-commerce stores, product directories',
          'Trade-off: Eventual consistency caching edge cases',
          'Execution: Zero-downtime background regeneration',
        ],
      },
      {
        isSummary: true,
        slideType: 'outro',
        tag: 'DECISION MATRIX',
        headline: 'Found this breakdown valuable?',
        subheadline: 'Save this cheat sheet and follow for weekly production architectures.',
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'Database Indexing: Why Your SQL and MongoDB Queries Crawl',
    caption: `90% of backend latency spikes aren't caused by slow CPU or RAM shortages. 🐢
#Databases #MongoDB #PostgreSQL #SQL #SystemDesign #BackendEngineering #DatabaseOptimization #FullStack

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
        footer: 'SWIPE TO OPTIMIZE ->',
      },
      {
        tag: '01 / THE HIDDEN COST OF SCAN',
        headline: 'Without an index, the DB scans every row.',
        codeSnippet: `// Slow query without index: COLLSCAN\ndb.orders.find({ status: "Pending", user: id });\n// 1M rows = 1,000,000 disk page reads!`,
        points: [
          'COLLSCAN reads every block from disk into memory',
          'Consumes DB RAM buffer pool and spikes CPU to 100%',
          'Symptoms: Connection timeouts & API latency spikes',
        ],
      },
      {
        tag: '02 / HOW B-TREE INDEXES WORK',
        headline: 'O(log N) lookup instead of O(N) linear scan.',
        codeSnippet: `// Create index on lookup key\ndb.orders.createIndex({ user: 1 });\n// 1,000,000 rows lookup takes ~20 comparisons!`,
        points: [
          'B-Trees keep keys sorted in self-balancing pages',
          'Point lookups jump directly to leaf nodes',
          'Range queries traverse linked sibling leaves instantly',
        ],
      },
      {
        tag: '03 / THE ESR RULE FOR COMPOUND INDEXES',
        headline: 'Equality, Sort, Range: The golden index order.',
        codeSnippet: `// Query: find status="Paid", sort by createdAt, filter total > 100\ndb.orders.createIndex({\n  status: 1,     // E: Equality\n  createdAt: -1, // S: Sort\n  total: 1       // R: Range\n});`,
        points: [
          'E (Equality): Put exact match fields first',
          'S (Sort): Put sorting fields second to avoid in-memory sort',
          'R (Range): Put inequality / ranges (<, >, between) last',
        ],
      },
      {
        tag: '04 / COVERED QUERIES: ZERO HEAP READS',
        headline: 'The fastest query never touches the table heap.',
        codeSnippet: `// Query only fields present in the index\ndb.users.find({ email: "dev@test.com" }, { _id: 0, email: 1 });\n// Result returned 100% from RAM index!`,
        points: [
          'Index contains all requested projection fields',
          'Database skips secondary table/heap lookups completely',
          'Delivers sub-millisecond API response times',
        ],
      },
      {
        isSummary: true,
        slideType: 'outro',
        tag: 'DECISION MATRIX',
        headline: 'Found this breakdown valuable?',
        subheadline: 'Save this cheat sheet and follow for weekly production architectures.',
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'Microservices vs Modular Monolith: The Real Architectural Trade-Offs',
    caption: `Microservices solve team organization problems — NOT technical scaling problems. ⚠️
#SoftwareEngineering #SystemDesign #Microservices #CloudArchitecture #Backend #SoftwareArchitecture

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
        footer: 'SWIPE TO COMPARE ->',
      },
      {
        tag: '01 / THE MODULAR MONOLITH ADVANTAGE',
        headline: 'In-memory function calls are 10,000x faster.',
        codeSnippet: `// In-process domain module call\nconst invoice = await billingService.createInvoice(order);\n// 0.05ms execution, zero network hops!`,
        points: [
          'Strict domain boundaries inside a single deployable unit',
          'Zero network serialization / JSON marshaling latency',
          'Refactoring across boundaries takes seconds with TypeScript',
        ],
      },
      {
        tag: '02 / THE HIDDEN "MICROSERVICES TAX"',
        headline: 'Distributed systems introduce distributed failures.',
        codeSnippet: `// 1 user request = 14 RPC calls\n// Service A -> Service B (timeout) -> 504 Gateway Error\n// Requires: OpenTelemetry, Envoy, Sagas, Retry budgets`,
        points: [
          'Requires complex observability (distributed tracing, metrics)',
          'Network partitions force eventual consistency compromises',
          'Debugging production bugs spans across multiple repositories',
        ],
      },
      {
        tag: '03 / DATA INTEGRITY: ACID VS SAGAS',
        headline: 'Say goodbye to simple database transactions.',
        codeSnippet: `// Monolith: Atomic ACID transaction\nawait session.withTransaction(async () => {\n  await debit(); await credit();\n});\n// Microservices: 2-Phase Commit or complex Sagas`,
        points: [
          'Database transactions are trivial in a single database',
          'Microservices require orchestrator or choreography sagas',
          'Compensating actions must handle partial distributed failure',
        ],
      },
      {
        tag: '04 / THE EVOLUTIONARY ROADMAP',
        headline: 'Start modular. Extract only when proven.',
        codeSnippet: `// 1. Build clear module boundaries in Monolith\n// 2. If Order processing CPU spikes 100x ->\n// 3. Extract JUST OrderWorker into standalone service`,
        points: [
          'Well-designed modules make extraction straightforward',
          'Premature distribution creates distributed monoliths',
          'Optimize for business validation and rapid delivery first',
        ],
      },
      {
        isSummary: true,
        slideType: 'outro',
        tag: 'DECISION MATRIX',
        headline: 'Found this breakdown valuable?',
        subheadline: 'Save this cheat sheet and follow for weekly production architectures.',
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
  {
    topic: 'React 19 & Next.js 16: Complete Mental Model for Senior Engineers',
    caption: `React 19 isn't just an incremental update — it resets how we architect modern full-stack web applications. ⚡
#React19 #NextJS #ReactJS #WebDevelopment #Frontend #JavaScript #TypeScript #FullStack

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
        footer: 'SWIPE TO MASTER ->',
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
        slideType: 'outro',
        tag: 'DECISION MATRIX',
        headline: 'Found this breakdown valuable?',
        subheadline: 'Save this cheat sheet and follow for weekly production architectures.',
        footer: 'Follow @Syed Adil Ali & Repost',
      },
    ],
  },
];
