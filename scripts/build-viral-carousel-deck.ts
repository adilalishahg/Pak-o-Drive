import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const WIDTH = 1080;
const HEIGHT = 1350;

function toBase64Image(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

const coverBase64 = toBase64Image('public/img/nextjs-cover.jpg');
const avatarBase64 = toBase64Image('public/img/avatar.jpg');

function getBaseSvgHeader(): string {
  return `
  <defs>
    <!-- Background Radial Gradients -->
    <radialGradient id="deepGlow" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#111827" stop-opacity="1"/>
      <stop offset="50%" stop-color="#090d16" stop-opacity="1"/>
      <stop offset="100%" stop-color="#030712" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#030712" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cyanGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e3a53" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#030712" stop-opacity="0"/>
    </radialGradient>

    <!-- Linear Gradients for Accents -->
    <linearGradient id="neonCyanBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00F5D4"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>
    <linearGradient id="purplePink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#111827" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0B1120" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="activeCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Glow Filters -->
    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="210" cy="850" r="75"/>
    </clipPath>
  </defs>
  `;
}

function renderTopNav(tag: string, pageNum: number, totalSlides: number): string {
  return `
    <!-- Top Bar -->
    <g transform="translate(70, 75)">
      <rect x="0" y="0" width="${tag.length * 12 + 36}" height="38" rx="19" fill="#0B132B" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="${(tag.length * 12 + 36) / 2}" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle" letter-spacing="1.5">${tag}</text>
    </g>
    <text x="${WIDTH - 70}" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#94A3B8" text-anchor="end">${pageNum} of ${totalSlides}</text>
  `;
}

function renderBottomFooter(text = 'Swipe for next breakdown ➔'): string {
  return `
    <!-- Bottom Footer -->
    <line x1="70" y1="${HEIGHT - 90}" x2="${WIDTH - 70}" y2="${HEIGHT - 90}" stroke="#1E293B" stroke-width="1.5"/>
    <text x="70" y="${HEIGHT - 50}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B">PAK-O-DRIVE // ENGINEERING INSIGHTS</text>
    <text x="${WIDTH - 70}" y="${HEIGHT - 50}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#00F5D4" text-anchor="end">${text}</text>
  `;
}

// SLIDE 1: COVER
function buildSlide1(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    <circle cx="540" cy="720" r="420" fill="url(#centerGlow)"/>

    <!-- Subtle Grid Dots -->
    <g opacity="0.15">
      ${Array.from({ length: 12 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) =>
          `<circle cx="${100 + c * 95}" cy="${180 + r * 95}" r="1.5" fill="#38BDF8"/>`
        ).join('')
      ).join('')}
    </g>

    <!-- Top Badge -->
    <g transform="translate(540, 95)">
      <rect x="-140" y="0" width="280" height="42" rx="21" fill="#0B132B" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="0" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#00F5D4" text-anchor="middle" letter-spacing="2">SYSTEMS ARCHITECTURE // 2026</text>
    </g>

    <!-- Massive Hook Title -->
    <text x="540" y="220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1.5">Next.js, Beyond React</text>
    <text x="540" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="500" fill="#94A3B8" text-anchor="middle">Why modern engineering teams are replacing legacy SPAs with full-stack runtimes.</text>

    <!-- 3D Hero Artwork -->
    <g filter="url(#dropShadow)">
      <rect x="150" y="320" width="780" height="780" rx="36" fill="#070B14" stroke="#1E293B" stroke-width="2"/>
      ${coverBase64 ? `<image href="${coverBase64}" x="152" y="322" width="776" height="776" preserveAspectRatio="xMidYMid slice" rx="34"/>` : ''}
    </g>

    <!-- Bottom Pill Badge -->
    <g transform="translate(540, 1220)">
      <rect x="-150" y="0" width="300" height="48" rx="24" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">pakodrive.pk // tech</text>
    </g>
  </svg>
  `;
}

// SLIDE 2: THE BOTTLENECK
function buildSlide2(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('THE CORE BOTTLENECK', 2, 8)}

    <!-- Headline -->
    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Heavy Cost of Client SPAs</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">You can optimize execution all day. But if the browser never needed that JS,</text>
    <text x="70" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#00F5D4">the best optimization is simply not sending it.</text>

    <!-- Diagram Box -->
    <rect x="70" y="360" width="940" height="480" rx="28" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="2" filter="url(#dropShadow)"/>

    <!-- Process Nodes -->
    <!-- Node 1 -->
    <g transform="translate(130, 480)">
      <circle cx="60" cy="60" r="50" fill="#1E293B" stroke="#EF4444" stroke-width="2.5"/>
      <text x="60" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#EF4444" text-anchor="middle">JS</text>
      <text x="60" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">2.4 MB</text>
      <text x="60" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle">Massive Bundle</text>
      <text x="60" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="400" fill="#94A3B8" text-anchor="middle">Network Congestion</text>
    </g>

    <!-- Arrow 1 -->
    <path d="M 280 540 L 350 540" stroke="#EF4444" stroke-width="3" stroke-dasharray="6,6"/>
    <polygon points="355,540 345,534 345,546" fill="#EF4444"/>

    <!-- Node 2 -->
    <g transform="translate(390, 480)">
      <circle cx="60" cy="60" r="50" fill="#1E293B" stroke="#F59E0B" stroke-width="2.5"/>
      <text x="60" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#F59E0B" text-anchor="middle">CPU</text>
      <text x="60" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">Parse+JIT</text>
      <text x="60" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle">Main Thread Freeze</text>
      <text x="60" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="400" fill="#94A3B8" text-anchor="middle">High CPU Load</text>
    </g>

    <!-- Arrow 2 -->
    <path d="M 540 540 L 610 540" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6,6"/>
    <polygon points="615,540 605,534 605,546" fill="#F59E0B"/>

    <!-- Node 3 -->
    <g transform="translate(650, 480)">
      <circle cx="60" cy="60" r="50" fill="#1E293B" stroke="#00F5D4" stroke-width="2.5"/>
      <text x="60" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#00F5D4" text-anchor="middle">UI</text>
      <text x="60" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">Interactive</text>
      <text x="60" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle">Delayed Hydration</text>
      <text x="60" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="400" fill="#94A3B8" text-anchor="middle">P99 Latency Spikes</text>
    </g>

    <!-- Bottom Takeaway Card -->
    <rect x="70" y="890" width="940" height="230" rx="24" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
    <text x="110" y="950" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8" letter-spacing="1">KEY TAKEAWAY</text>
    <text x="110" y="1000" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">JavaScript costs more than just execution time.</text>
    <text x="110" y="1045" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">It must be downloaded, decompressed, parsed, compiled, and hydrated before</text>
    <text x="110" y="1075" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">a single button becomes clickable for the user.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 3: SERVER PIPELINE TIMELINE
function buildSlide3(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('ARCHITECTURE FLOW', 3, 8)}

    <!-- Headline -->
    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Server-First Pipeline</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Moving data fetching and computation directly to the edge server.</text>

    <!-- Timeline Steps Container -->
    <g transform="translate(70, 320)">
      <!-- Step 1 -->
      <rect x="0" y="0" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="75" r="36" fill="#0B132B" stroke="#00F5D4" stroke-width="2"/>
      <text x="70" y="83" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="135" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Client Request Hits Edge</text>
      <text x="135" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Zero round-trips to distant microservices. Edge routing validates the session instantly.</text>

      <!-- Step 2 -->
      <rect x="0" y="180" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="255" r="36" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="70" y="263" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="135" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Direct Database Query (RSC)</text>
      <text x="135" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Direct Mongoose / Postgres call inside the component. No public API endpoints needed.</text>

      <!-- Step 3 -->
      <rect x="0" y="360" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="435" r="36" fill="#0B132B" stroke="#A855F7" stroke-width="2"/>
      <text x="70" y="443" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="135" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Streaming HTML Shell</text>
      <text x="135" y="455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">The browser receives pure HTML immediately. Zero client JS shipped for static content.</text>

      <!-- Step 4 -->
      <rect x="0" y="540" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="615" r="36" fill="#0B132B" stroke="#10B981" stroke-width="2"/>
      <text x="70" y="623" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981" text-anchor="middle">04</text>
      <text x="135" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Interactive Island Hydration</text>
      <text x="135" y="635" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Only interactive elements (e.g. cart button, search bar) hydrate on the client.</text>
    </g>

    <!-- Bottom Highlight -->
    <rect x="70" y="1040" width="940" height="90" rx="18" fill="#090D16" stroke="#00F5D4" stroke-width="1.5"/>
    <text x="540" y="1095" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#00F5D4" text-anchor="middle">⚡ Result: 0 KB of client JavaScript shipped for content rendering.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 4: DUAL CODE COMPARISON (MACOS CARDS)
function buildSlide4(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('CODE COMPARISON', 4, 8)}

    <!-- Headline -->
    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">Client State vs Server Component</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Eliminating useEffect watermarks with native async components.</text>

    <!-- Side by Side macOS Cards -->
    <!-- Left Card: Client (Waterfall) -->
    <g transform="translate(70, 310)">
      <rect x="0" y="0" width="450" height="660" rx="20" fill="#070B14" stroke="#EF4444" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Window header -->
      <rect x="0" y="0" width="450" height="48" rx="20" fill="#0F172A"/>
      <circle cx="28" cy="24" r="6" fill="#EF4444"/>
      <circle cx="48" cy="24" r="6" fill="#F59E0B"/>
      <circle cx="68" cy="24" r="6" fill="#10B981"/>
      <text x="225" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">❌ Client SPA (Waterfall)</text>

      <!-- Code lines -->
      <text x="24" y="90" font-family="'Fira Code', monospace" font-size="14" fill="#A855F7">'use client';</text>
      <text x="24" y="125" font-family="'Fira Code', monospace" font-size="14" fill="#38BDF8">export default function Feed() {</text>
      <text x="40" y="160" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">const [data, setData] = useState();</text>
      <text x="40" y="195" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">const [loading, setLoad] = useState(true);</text>
      <text x="40" y="240" font-family="'Fira Code', monospace" font-size="13" fill="#F59E0B">useEffect(() => {</text>
      <text x="56" y="275" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">fetch('/api/products')</text>
      <text x="72" y="310" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">.then(res => res.json())</text>
      <text x="72" y="345" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">.then(d => setData(d))</text>
      <text x="72" y="380" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">.finally(() => setLoad(false));</text>
      <text x="40" y="415" font-family="'Fira Code', monospace" font-size="13" fill="#F59E0B">}, []);</text>
      <text x="40" y="460" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">if (loading) return &lt;Spinner /&gt;;</text>
      <text x="40" y="495" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">return &lt;List items={data} /&gt;;</text>
      <text x="24" y="530" font-family="'Fira Code', monospace" font-size="14" fill="#38BDF8">}</text>

      <!-- Card footer metric -->
      <rect x="20" y="580" width="410" height="55" rx="12" fill="#1C1014"/>
      <text x="225" y="614" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">⚠️ Client Bundle: +180 KB | 3 Network Roundtrips</text>
    </g>

    <!-- Right Card: Next.js RSC -->
    <g transform="translate(560, 310)">
      <rect x="0" y="0" width="450" height="660" rx="20" fill="#070B14" stroke="#00F5D4" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Window header -->
      <rect x="0" y="0" width="450" height="48" rx="20" fill="#0F172A"/>
      <circle cx="28" cy="24" r="6" fill="#EF4444"/>
      <circle cx="48" cy="24" r="6" fill="#F59E0B"/>
      <circle cx="68" cy="24" r="6" fill="#10B981"/>
      <text x="225" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle">✅ Next.js 16 (Server Component)</text>

      <!-- Code lines -->
      <text x="24" y="90" font-family="'Fira Code', monospace" font-size="14" fill="#10B981">import db from '@/lib/db';</text>
      <text x="24" y="125" font-family="'Fira Code', monospace" font-size="14" fill="#10B981">import { Product } from '@/models';</text>
      <text x="24" y="180" font-family="'Fira Code', monospace" font-size="14" fill="#38BDF8">export default async function Feed() {</text>
      <text x="40" y="230" font-family="'Fira Code', monospace" font-size="13" fill="#A855F7">await dbConnect();</text>
      <text x="40" y="275" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">const data = await Product.find()</text>
      <text x="60" y="310" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">.limit(20)</text>
      <text x="60" y="345" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">.lean();</text>
      <text x="40" y="415" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">return &lt;List items={data} /&gt;;</text>
      <text x="24" y="470" font-family="'Fira Code', monospace" font-size="14" fill="#38BDF8">}</text>

      <!-- Card footer metric -->
      <rect x="20" y="580" width="410" height="55" rx="12" fill="#09221C"/>
      <text x="225" y="614" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle">⚡ Client Bundle: 0 KB | Sub-10ms DB Stream</text>
    </g>

    <!-- Bottom Insight -->
    <rect x="70" y="1010" width="940" height="120" rx="20" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
    <text x="540" y="1060" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">No useEffect. No loading state machines. Zero API waterfalls.</text>
    <text x="540" y="1095" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">The component runs directly on the server, reads from the database, and streams HTML.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 5: BENCHMARK STATS
function buildSlide5(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('PRODUCTION METRICS', 5, 8)}

    <!-- Headline -->
    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Production Benchmark</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Real-world results measured on high-traffic e-commerce and SaaS platforms.</text>

    <!-- 3 High Impact Stat Cards -->
    <g transform="translate(70, 320)">
      <!-- Stat 1 -->
      <rect x="0" y="0" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#00F5D4" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#00F5D4">-74%</text>
      <text x="350" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Client JavaScript Size</text>
      <text x="350" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Down from 1.8MB to 460KB total runtime footprint by moving data</text>
      <text x="350" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">fetching and heavy transformations into React Server Components.</text>

      <!-- Stat 2 -->
      <rect x="0" y="240" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="350" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#38BDF8">4.2x</text>
      <text x="350" y="315" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Faster Largest Contentful Paint</text>
      <text x="350" y="355" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Sub-800ms visual rendering across high-latency mobile networks.</text>
      <text x="350" y="385" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">HTML shells are painted instantly before hydration completes.</text>

      <!-- Stat 3 -->
      <rect x="0" y="480" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#A855F7" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="590" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#A855F7">99.8%</text>
      <text x="350" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Edge Cache Hit Ratio</text>
      <text x="350" y="595" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Incremental Static Regeneration (ISR) shields origin database clusters</text>
      <text x="350" y="625" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">from sudden traffic spikes and viral surges.</text>
    </g>

    <!-- Bottom Takeaway -->
    <rect x="70" y="1060" width="940" height="80" rx="16" fill="#090D16" stroke="#1E293B" stroke-width="1.5"/>
    <text x="540" y="1110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#F8FAFC" text-anchor="middle">"Speed is not just better syntax. Speed is shipping less work to the client."</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 6: 4 ARCHITECTURAL RULES
function buildSlide6(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('SYSTEM RULES', 6, 8)}

    <!-- Headline -->
    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">4 Rules for Production Next.js</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">How senior architects structure high-scale enterprise applications.</text>

    <!-- Rules List -->
    <g transform="translate(70, 320)">
      <!-- Rule 1 -->
      <rect x="0" y="0" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="35" width="70" height="70" rx="16" fill="#0B132B" stroke="#00F5D4" stroke-width="2"/>
      <text x="65" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="130" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Push 'use client' Down to Leaf Nodes</text>
      <text x="130" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Never make entire pages client components. Wrap only interactive buttons or modals.</text>

      <!-- Rule 2 -->
      <rect x="0" y="185" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="220" width="70" height="70" rx="16" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="65" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="130" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Colocate Data Inside Server Components</text>
      <text x="130" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Fetch directly at the component level with React cache() to deduplicate parallel queries.</text>

      <!-- Rule 3 -->
      <rect x="0" y="370" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="405" width="70" height="70" rx="16" fill="#0B132B" stroke="#A855F7" stroke-width="2"/>
      <text x="65" y="450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="130" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Mutate State with Server Actions</text>
      <text x="130" y="475" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Eliminate custom POST endpoints. Type-safe server actions validate with Zod and invalidate cache.</text>

      <!-- Rule 4 -->
      <rect x="0" y="555" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="590" width="70" height="70" rx="16" fill="#0B132B" stroke="#F59E0B" stroke-width="2"/>
      <text x="65" y="635" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#F59E0B" text-anchor="middle">04</text>
      <text x="130" y="620" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Stream Suspense Boundaries</text>
      <text x="130" y="660" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Show immediate skeleton UI shells while high-computation queries stream asynchronously.</text>
    </g>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 7: DECISION MATRIX
function buildSlide7(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('DECISION MATRIX', 7, 8)}

    <!-- Headline -->
    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">When to Use What</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">The architectural decision tree for 2026 systems.</text>

    <!-- Comparison Table Grid -->
    <g transform="translate(70, 320)">
      <!-- Header -->
      <rect x="0" y="0" width="940" height="60" rx="12" fill="#0B132B"/>
      <text x="40" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">USE CASE</text>
      <text x="460" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">RECOMMENDED PATTERN</text>
      <text x="800" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">CLIENT JS</text>

      <!-- Row 1 -->
      <rect x="0" y="80" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Marketing &amp; Blog Posts</text>
      <text x="40" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">High SEO, static read-only</text>
      <text x="460" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8">Static Generation (SSG / ISR)</text>
      <text x="800" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981">0 KB</text>

      <!-- Row 2 -->
      <rect x="0" y="210" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">E-Commerce Product Feeds</text>
      <text x="40" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Real-time inventory + SEO</text>
      <text x="460" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8">Server Component + Suspense</text>
      <text x="800" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981">&lt; 12 KB</text>

      <!-- Row 3 -->
      <rect x="0" y="340" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Authenticated Admin Portals</text>
      <text x="40" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Heavy CRUD, dynamic charts</text>
      <text x="460" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8">RSC Shell + Client Islands</text>
      <text x="800" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#F59E0B">~45 KB</text>

      <!-- Row 4 -->
      <rect x="0" y="470" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Checkout &amp; Form Mutations</text>
      <text x="40" y="550" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">High security, zero leaking keys</text>
      <text x="460" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8">Server Actions + Zod</text>
      <text x="800" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981">0 KB</text>
    </g>

    <!-- Bottom summary box -->
    <rect x="70" y="980" width="940" height="140" rx="24" fill="#090D16" stroke="#00F5D4" stroke-width="1.5"/>
    <text x="540" y="1035" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">Save this matrix for your team's next sprint planning.</text>
    <text x="540" y="1075" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">Architecture isn't about using the newest tool. It's about picking the right trade-off.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 8: THE MASTER OUTRO / FOLLOW SLIDE (SYED ADIL ALI)
function buildSlide8(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    <circle cx="540" cy="450" r="400" fill="url(#cyanGlow)"/>

    <!-- Top Tag Badge -->
    <g transform="translate(540, 75)">
      <rect x="-140" y="0" width="280" height="38" rx="19" fill="#0B132B" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle" letter-spacing="1.5">ENGINEERING LEADERSHIP</text>
    </g>

    <!-- Big Headline -->
    <text x="540" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1.5">Building High-Scale Systems</text>
    <text x="540" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#94A3B8" text-anchor="middle">Stand out with resilient architectures &amp; high-performance engineering.</text>

    <!-- Brand Emblem -->
    <text x="540" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="900" fill="#00F5D4" text-anchor="middle" letter-spacing="-0.5">PAK-O-DRIVE // LABS</text>

    <!-- 3 High-Intent Hook Pills (Slobodan Style) -->
    <g transform="translate(540, 320)">
      <!-- Pill 1 -->
      <rect x="-240" y="0" width="480" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">Why is my client bundle exploding?</text>

      <!-- Pill 2 -->
      <rect x="-250" y="56" width="500" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">How to achieve sub-100ms P99 latency?</text>

      <!-- Pill 3 -->
      <rect x="-260" y="112" width="520" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="141" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">Why does our state management feel fragile?</text>
    </g>

    <!-- Dotted Curved Pointer Arrow (Slobodan Style) -->
    <path d="M 230 430 Q 180 510 210 575" fill="none" stroke="#00F5D4" stroke-width="2.5" stroke-dasharray="6,6"/>
    <polygon points="212,580 203,568 217,572" fill="#00F5D4"/>

    <!-- Website & Link -->
    <text x="540" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8" text-anchor="middle" letter-spacing="1">pakodrive.pk • syedadilali.dev</text>

    <!-- GRAND AUTHOR PROFILE CARD -->
    <g transform="translate(70, 580)">
      <defs>
        <clipPath id="avatarCardClip">
          <circle cx="140" cy="115" r="68"/>
        </clipPath>
      </defs>
      <rect x="0" y="0" width="940" height="480" rx="32" fill="url(#cardGrad)" stroke="#00F5D4" stroke-width="2.5" filter="url(#dropShadow)"/>

      <!-- Profile Avatar with Glowing Cyan Ring -->
      <circle cx="140" cy="115" r="72" fill="#0B132B" stroke="#00F5D4" stroke-width="4"/>
      ${avatarBase64 ? `<image href="${avatarBase64}" x="52" y="27" width="176" height="176" clip-path="url(#avatarCardClip)" preserveAspectRatio="xMidYMid slice"/>` : `<text x="140" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#00F5D4" text-anchor="middle">SA</text>`}

      <!-- Author Bio Details -->
      <g transform="translate(245, 80)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">SYED ADIL ALI</text>
        <circle cx="280" cy="-12" r="10" fill="#00F5D4"/>
        <polyline points="275,-12 278,-9 285,-16" fill="none" stroke="#030712" stroke-width="2.5"/>

        <text x="0" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#00F5D4">Senior Full-Stack Engineer &amp; Systems Architect</text>
        <text x="0" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500" fill="#94A3B8">Next.js 16 • React 19 • Cloud Systems • Distributed Node.js</text>
      </g>

      <!-- HIGH CONTRAST FOLLOW BUTTON -->
      <g transform="translate(50, 225)">
        <rect x="0" y="0" width="840" height="74" rx="20" fill="#00F5D4" filter="url(#dropShadow)"/>
        <text x="420" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="#030712" text-anchor="middle" letter-spacing="0.5">+ Follow @Syed Adil Ali</text>
      </g>

      <!-- Divider line -->
      <line x1="50" y1="335" x2="890" y2="335" stroke="#1E293B" stroke-width="1.5"/>

      <!-- 3 Engagement Boxes -->
      <!-- Box 1: REPOST -->
      <g transform="translate(50, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4">[ REPOST ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Share with devs in your feed</text>
      </g>

      <!-- Box 2: SAVE -->
      <g transform="translate(340, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#38BDF8">[ SAVE ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Keep for architecture reviews</text>
      </g>

      <!-- Box 3: DISCUSS -->
      <g transform="translate(630, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#A855F7">[ DISCUSS ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Drop questions in comments</text>
      </g>
    </g>

    <!-- Bottom Tagline -->
    <text x="540" y="1180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">Follow Syed Adil Ali for daily production architecture &amp; high-scale engineering.</text>
    <text x="540" y="1220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#00F5D4" text-anchor="middle">See you in the next breakdown ➔</text>
  </svg>
  `;
}

async function main() {
  console.log('🚀 [ViralDeckBuilder] Rendering 8 Ultra-High-Fidelity Slides (1080x1350)...');
  const slideBuilders = [
    buildSlide1,
    buildSlide2,
    buildSlide3,
    buildSlide4,
    buildSlide5,
    buildSlide6,
    buildSlide7,
    buildSlide8,
  ];

  if (!fs.existsSync('public/carousel-renders')) {
    fs.mkdirSync('public/carousel-renders', { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < slideBuilders.length; i++) {
    const slideNum = i + 1;
    const svgStr = slideBuilders[i]();
    const jpgBuffer = await sharp(Buffer.from(svgStr)).jpeg({ quality: 95 }).toBuffer();

    const slidePath = `public/carousel-renders/slide_${slideNum}.jpg`;
    fs.writeFileSync(slidePath, jpgBuffer);
    console.log(`✓ Rendered Slide ${slideNum}/8 -> ${slidePath} (${Math.round(jpgBuffer.length / 1024)} KB)`);

    const embeddedJpg = await pdfDoc.embedJpg(jpgBuffer);
    const page = pdfDoc.addPage([WIDTH, HEIGHT]);
    page.drawImage(embeddedJpg, {
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('public/active-carousel.pdf', pdfBytes);
  fs.writeFileSync('public/test-carousel.pdf', pdfBytes);
  console.log(`\n🎉 [SUCCESS] Compiled Active LinkedIn Carousel PDF -> public/active-carousel.pdf (${Math.round(pdfBytes.length / 1024)} KB)`);

  // Update carousel-preview.html with rich slide gallery viewer
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Carousel Live Gallery | Syed Adil Ali</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #030712;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    header {
      width: 100%;
      background: #0B132B;
      border-bottom: 1px solid rgba(0, 245, 212, 0.25);
      padding: 16px 32px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      color: #00F5D4;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: rgba(0, 245, 212, 0.15);
      border: 1px solid #00F5D4;
      color: #00F5D4;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
    }
    .download-btn {
      background: #00F5D4;
      color: #030712;
      font-weight: 800;
      text-decoration: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }
    .download-btn:hover {
      background: #38BDF8;
      box-shadow: 0 0 15px rgba(0, 245, 212, 0.5);
    }
    .gallery-container {
      width: 90%;
      max-width: 1100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      margin: 32px auto;
    }
    .slide-card {
      width: 100%;
      max-width: 650px;
      background: #070B14;
      border: 1px solid #1E293B;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
      transition: transform 0.2s, border-color 0.2s;
    }
    .slide-card:hover {
      border-color: #00F5D4;
      transform: translateY(-4px);
    }
    .slide-card img {
      width: 100%;
      height: auto;
      display: block;
    }
    .slide-meta {
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0B1120;
      border-top: 1px solid #1E293B;
      font-size: 14px;
      color: #94A3B8;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <header>
    <h1>🚀 LinkedIn Viral Carousel Gallery <span class="badge">Slobodan Gajić Quality Standard</span></h1>
    <div style="display: flex; gap: 16px; align-items: center;">
      <span style="color: #94A3B8; font-size: 14px;">Next.js, Beyond React • 8 Slides</span>
      <a href="/active-carousel.pdf" download="Nextjs-Beyond-React-Carousel.pdf" class="download-btn">⬇ Download PDF</a>
    </div>
  </header>

  <div class="gallery-container">
    ${Array.from({ length: 8 }).map((_, idx) => `
    <div class="slide-card">
      <div class="slide-meta">
        <span>Slide ${idx + 1} of 8</span>
        <span style="color: #00F5D4;">1080 x 1350 (4:5 Portrait)</span>
      </div>
      <img src="/carousel-renders/slide_${idx + 1}.jpg" alt="Slide ${idx + 1}" />
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync('public/carousel-preview.html', previewHtml);
  console.log('✓ Updated public/carousel-preview.html with Full Slide Gallery Viewer!');
}

main().catch(err => {
  console.error('Fatal deck builder error:', err);
  process.exit(1);
});
