import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { renderSlobodanCarouselPdf } from '../src/lib/carouselGenerator.js';
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const coll = mongoose.connection.collection('socialaccounts');
  const doc = await coll.findOne({ platform: 'linkedin' });
  const token = doc.accessToken;
  const author = doc.accountUrn;

  console.log('1. Building 6-Slide Carousel Deck (Slobodan Gajic Style)...');
  const deck = {
    topic: 'Rendering Strategies Explained: CSR vs SSR vs SSG vs ISR',
    caption: `Stop choosing rendering strategies based on guesswork.\n\nIn modern web engineering (especially with Next.js and React 19), choosing the wrong rendering paradigm can sabotage your TTFB, SEO, or server infrastructure bills.\n\nHere is the complete architectural breakdown across 6 slides:\n\n• CSR: Client-Side Rendering\n• SSR: Server-Side Rendering\n• SSG: Static Site Generation\n• ISR: Incremental Static Regeneration\n\nSwipe through the carousel to master the trade-offs!\n\nWhich rendering strategy powers your core production application? Let's discuss below!\n\n#softwareengineering #webdevelopment #nextjs #react #systemdesign #architecture`,
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
        footer: 'Swipe to compare ➔',
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
        tag: 'DECISION MATRIX',
        headline: 'Which should you choose in production?',
        points: [
          'Interactive Dashboards ➔ CSR / Client Components',
          'Real-time & Personalized ➔ SSR (Dynamic Rendering)',
          'High-traffic Content & Docs ➔ SSG (Static Export)',
          'Product Catalogs & Stores ➔ ISR (Revalidated Static)',
        ],
        footer: 'Follow @Syed Adil Ali & Repost 🔁',
      },
    ],
  };

  const pdfBuffer = await renderSlobodanCarouselPdf(deck);
  console.log('✓ Rendered PDF Buffer bytes:', pdfBuffer.length);

  console.log('2. Initializing Document Upload on LinkedIn API...');
  const initRes = await fetch('https://api.linkedin.com/rest/documents?action=initializeUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': '202608',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: author,
      },
    }),
  });

  const initData = await initRes.json();
  const uploadUrl = initData.value?.uploadUrl;
  const documentUrn = initData.value?.document;

  if (!uploadUrl || !documentUrn) {
    throw new Error(`Failed to initialize document: ${JSON.stringify(initData)}`);
  }

  console.log('3. Uploading PDF binary buffer to LinkedIn...');
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/pdf',
    },
    body: new Uint8Array(pdfBuffer),
  });

  console.log('Upload Status:', uploadRes.status);

  console.log('4. Publishing Document Carousel Post on /rest/posts...');
  const postPayload = {
    author: author,
    commentary: deck.caption,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: {
      media: {
        title: deck.topic,
        id: documentUrn,
      },
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': '202608',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postPayload),
  });

  console.log('Post Status:', postRes.status);
  console.log('Post ID (x-restli-id):', postRes.headers.get('x-restli-id'));
  const postBody = await postRes.text();
  console.log('Post Body:', postBody);

  await mongoose.disconnect();
}

main().catch(console.error);
