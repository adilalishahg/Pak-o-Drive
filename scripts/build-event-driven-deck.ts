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

const coverBase64 = toBase64Image('public/img/event-driven-cover.jpg');
const avatarBase64 = toBase64Image('public/img/avatar.jpg');

function getBaseSvgHeader(): string {
  return `
  <defs>
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
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#111827" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0B1120" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <clipPath id="heroCoverClip">
      <rect x="152" y="322" width="776" height="776" rx="34"/>
    </clipPath>
    <clipPath id="avatarCardClip">
      <circle cx="140" cy="115" r="70"/>
    </clipPath>
  </defs>
  `;
}

function renderTopNav(tag: string, pageNum: number, totalSlides: number): string {
  return `
    <g transform="translate(70, 75)">
      <rect x="0" y="0" width="${tag.length * 12 + 36}" height="38" rx="19" fill="#0B132B" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="${(tag.length * 12 + 36) / 2}" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle" letter-spacing="1.5">${tag}</text>
    </g>
    <text x="${WIDTH - 70}" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#94A3B8" text-anchor="end">${pageNum} of ${totalSlides}</text>
  `;
}

function renderBottomFooter(text = 'Swipe for next breakdown ➔'): string {
  return `
    <line x1="70" y1="${HEIGHT - 90}" x2="${WIDTH - 70}" y2="${HEIGHT - 90}" stroke="#1E293B" stroke-width="1.5"/>
    <text x="70" y="${HEIGHT - 50}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B">PAK-O-DRIVE // CLOUD SYSTEMS</text>
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

    <g opacity="0.15">
      ${Array.from({ length: 12 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) =>
          `<circle cx="${100 + c * 95}" cy="${180 + r * 95}" r="1.5" fill="#38BDF8"/>`
        ).join('')
      ).join('')}
    </g>

    <g transform="translate(540, 95)">
      <rect x="-140" y="0" width="280" height="42" rx="21" fill="#0B132B" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="0" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#00F5D4" text-anchor="middle" letter-spacing="2">CLOUD ARCHITECTURE // 2026</text>
    </g>

    <text x="540" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="60" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1.5">Event-Driven Architecture</text>
    <text x="540" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="500" fill="#94A3B8" text-anchor="middle">Why high-scale engineering teams abandoned synchronous REST APIs.</text>

    <!-- 3D Hero Artwork (Properly Rounded & Clipped) -->
    <g filter="url(#dropShadow)">
      <rect x="150" y="320" width="780" height="780" rx="36" fill="#070B14" stroke="#1E293B" stroke-width="2"/>
      ${coverBase64 ? `<image href="${coverBase64}" x="152" y="322" width="776" height="776" clip-path="url(#heroCoverClip)" preserveAspectRatio="xMidYMid slice"/>` : ''}
    </g>

    <g transform="translate(540, 1220)">
      <rect x="-150" y="0" width="300" height="48" rx="24" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">pakodrive.pk // cloud</text>
    </g>
  </svg>
  `;
}

// SLIDE 2: THE DISTRIBUTED TRAP
function buildSlide2(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('THE DISTRIBUTED TRAP', 2, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Fragility of REST Chains</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">When services execute tight synchronous HTTP request chains,</text>
    <text x="70" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#EF4444">the platform is only as reliable as its slowest downstream dependency.</text>

    <!-- Visual Diagram -->
    <rect x="70" y="360" width="940" height="480" rx="28" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="2" filter="url(#dropShadow)"/>

    <!-- Service A -->
    <g transform="translate(110, 470)">
      <rect x="0" y="0" width="220" height="150" rx="18" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">Order Service</text>
      <text x="110" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle">HTTP Client Await</text>
      <rect x="30" y="105" width="160" height="28" rx="8" fill="#0E2F44"/>
      <text x="110" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">BLOCKED THREAD</text>
    </g>

    <!-- Arrow 1 -->
    <path d="M 345 545 L 415 545" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6,6"/>
    <polygon points="420,545 410,539 410,551" fill="#F59E0B"/>

    <!-- Service B -->
    <g transform="translate(430, 470)">
      <rect x="0" y="0" width="220" height="150" rx="18" fill="#0B132B" stroke="#F59E0B" stroke-width="2"/>
      <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">Payment Gateway</text>
      <text x="110" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle">Slow 3rd-Party API</text>
      <rect x="30" y="105" width="160" height="28" rx="8" fill="#38240D"/>
      <text x="110" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#F59E0B" text-anchor="middle">2,400ms LATENCY</text>
    </g>

    <!-- Arrow 2 -->
    <path d="M 665 545 L 735 545" stroke="#EF4444" stroke-width="3" stroke-dasharray="6,6"/>
    <polygon points="740,545 730,539 730,551" fill="#EF4444"/>

    <!-- Service C -->
    <g transform="translate(750, 470)">
      <rect x="0" y="0" width="220" height="150" rx="18" fill="#0B132B" stroke="#EF4444" stroke-width="2"/>
      <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">Inventory Service</text>
      <text x="110" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle">DB Connection Pool</text>
      <rect x="30" y="105" width="160" height="28" rx="8" fill="#2E1014"/>
      <text x="110" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#EF4444" text-anchor="middle">504 TIMEOUT CRASH</text>
    </g>

    <!-- Bottom Takeaway Card (Multi-line cleanly wrapped, safe 80px+ padding) -->
    <rect x="70" y="880" width="940" height="250" rx="24" fill="#090D16" stroke="#EF4444" stroke-width="1.5"/>
    <text x="110" y="935" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#EF4444" letter-spacing="1.5">ARCHITECTURAL BOTTLENECK</text>
    <text x="110" y="978" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Synchronous RPC chains turn decoupled services</text>
    <text x="110" y="1014" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">into an unmaintainable distributed monolith.</text>
    <text x="110" y="1060" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">A single downstream timeout cascades backwards through the stack,</text>
    <text x="110" y="1090" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">exhausting socket pools and crashing checkout for 100% of end users.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 3: THE EVENT-DRIVEN PARADIGM
function buildSlide3(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('ARCHITECTURE FLOW', 3, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">Events Are Immutable Facts</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Decoupling write operations from background worker execution.</text>

    <g transform="translate(70, 320)">
      <!-- Step 1 -->
      <rect x="0" y="0" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="75" r="36" fill="#0B132B" stroke="#00F5D4" stroke-width="2"/>
      <text x="70" y="83" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="135" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Client Submits Order (12ms)</text>
      <text x="135" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">The user receives an instant 202 Accepted response. Zero waiting on external payment APIs.</text>

      <!-- Step 2 -->
      <rect x="0" y="180" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="255" r="36" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="70" y="263" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="135" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Event Emitted to Message Backbone</text>
      <text x="135" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">An immutable event 'ORDER_CREATED' is published to Kafka / RabbitMQ with payload data.</text>

      <!-- Step 3 -->
      <rect x="0" y="360" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="435" r="36" fill="#0B132B" stroke="#A855F7" stroke-width="2"/>
      <text x="70" y="443" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="135" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Independent Parallel Consumers</text>
      <text x="135" y="455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Payment Worker, Inventory Deductor, and Email Notifier process at their own speeds.</text>

      <!-- Step 4 -->
      <rect x="0" y="540" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="615" r="36" fill="#0B132B" stroke="#10B981" stroke-width="2"/>
      <text x="70" y="623" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981" text-anchor="middle">04</text>
      <text x="135" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">100% Failure Blast Isolation</text>
      <text x="135" y="635" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">If Email service goes down, messages buffer safely in queue. Checkout is completely unaffected.</text>
    </g>

    <rect x="70" y="1040" width="940" height="90" rx="18" fill="#090D16" stroke="#00F5D4" stroke-width="1.5"/>
    <text x="540" y="1095" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#00F5D4" text-anchor="middle">⚡ Producers emit facts. Consumers subscribe. Zero runtime coupling.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 4: CODE COMPARISON
function buildSlide4(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('CODE COMPARISON', 4, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">Synchronous REST vs Event Bus</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Replacing brittle nested fetch waterfalls with fire-and-forget domain events.</text>

    <!-- Side by Side macOS Windows -->
    <!-- Left: REST -->
    <g transform="translate(70, 310)">
      <rect x="0" y="0" width="450" height="660" rx="20" fill="#070B14" stroke="#EF4444" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="0" y="0" width="450" height="48" rx="20" fill="#0F172A"/>
      <circle cx="28" cy="24" r="6" fill="#EF4444"/>
      <circle cx="48" cy="24" r="6" fill="#F59E0B"/>
      <circle cx="68" cy="24" r="6" fill="#10B981"/>
      <text x="225" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">❌ Synchronous REST (Brittle)</text>

      <text x="24" y="90" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">async function handleCheckout(order) {</text>
      <text x="40" y="130" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Direct HTTP Call 1</text>
      <text x="40" y="165" font-family="'Fira Code', monospace" font-size="13" fill="#F59E0B">const pay = await fetch('/api/pay');</text>
      <text x="40" y="200" font-family="'Fira Code', monospace" font-size="13" fill="#EF4444">if (!pay.ok) throw new Error();</text>
      <text x="40" y="250" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Direct HTTP Call 2 (Blocked)</text>
      <text x="40" y="285" font-family="'Fira Code', monospace" font-size="13" fill="#F59E0B">const stock = await fetch('/api/stock');</text>
      <text x="40" y="320" font-family="'Fira Code', monospace" font-size="13" fill="#EF4444">if (!stock.ok) throw new Error();</text>
      <text x="40" y="370" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Direct HTTP Call 3 (Blocked)</text>
      <text x="40" y="405" font-family="'Fira Code', monospace" font-size="13" fill="#F59E0B">await fetch('/api/email');</text>
      <text x="40" y="460" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">return { success: true };</text>
      <text x="24" y="500" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">}</text>

      <rect x="20" y="580" width="410" height="55" rx="12" fill="#1C1014"/>
      <text x="225" y="614" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">⚠️ Latency: 1,840ms | Cascading Crash Risk: HIGH</text>
    </g>

    <!-- Right: Event Bus -->
    <g transform="translate(560, 310)">
      <rect x="0" y="0" width="450" height="660" rx="20" fill="#070B14" stroke="#00F5D4" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="0" y="0" width="450" height="48" rx="20" fill="#0F172A"/>
      <circle cx="28" cy="24" r="6" fill="#EF4444"/>
      <circle cx="48" cy="24" r="6" fill="#F59E0B"/>
      <circle cx="68" cy="24" r="6" fill="#10B981"/>
      <text x="225" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle">✅ Event-Driven Publisher</text>

      <text x="24" y="90" font-family="'Fira Code', monospace" font-size="13" fill="#10B981">import { eventBus } from '@/lib/bus';</text>
      <text x="24" y="140" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">async function handleCheckout(order) {</text>
      <text x="40" y="190" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Fast Local DB Write</text>
      <text x="40" y="225" font-family="'Fira Code', monospace" font-size="13" fill="#A855F7">await Order.create(order);</text>
      <text x="40" y="280" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Emit Fire-and-Forget Domain Event</text>
      <text x="40" y="315" font-family="'Fira Code', monospace" font-size="13" fill="#00F5D4">await eventBus.publish('order.placed', {</text>
      <text x="60" y="350" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">orderId: order.id,</text>
      <text x="60" y="385" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">amount: order.total</text>
      <text x="40" y="420" font-family="'Fira Code', monospace" font-size="13" fill="#00F5D4">});</text>
      <text x="40" y="475" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">return { status: 202, orderId };</text>
      <text x="24" y="515" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">}</text>

      <rect x="20" y="580" width="410" height="55" rx="12" fill="#09221C"/>
      <text x="225" y="614" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle">⚡ Latency: 18ms | Downstream Resilience: 100%</text>
    </g>

    <!-- Bottom Insight -->
    <rect x="70" y="1010" width="940" height="120" rx="20" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
    <text x="540" y="1060" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">Producers never know or care who is listening.</text>
    <text x="540" y="1095" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">New microservices can subscribe to 'order.placed' without modifying a single line of checkout code.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 5: BENCHMARKS
function buildSlide5(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('PRODUCTION METRICS', 5, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Resilience Metrics</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Measured on high-throughput cloud clusters under 50,000 req/sec traffic bursts.</text>

    <g transform="translate(70, 320)">
      <!-- Stat 1 -->
      <rect x="0" y="0" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#00F5D4" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#00F5D4">-85%</text>
      <text x="350" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Mean Time To Recovery (MTTR)</text>
      <text x="350" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Downstream crashes are isolated to consumer dead-letter queues</text>
      <text x="350" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">without impacting core customer purchase journeys.</text>

      <!-- Stat 2 -->
      <rect x="0" y="240" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="350" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#38BDF8">9.4x</text>
      <text x="350" y="315" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Faster Checkout Throughput</text>
      <text x="350" y="355" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Average P99 latency dropped from 1,840ms down to 18ms by</text>
      <text x="350" y="385" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">eliminating synchronous third-party HTTP round-trips.</text>

      <!-- Stat 3 -->
      <rect x="0" y="480" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#A855F7" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="590" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#A855F7">99.999%</text>
      <text x="350" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Core Ingestion Uptime</text>
      <text x="350" y="595" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Even during major downstream provider outages, incoming orders</text>
      <text x="350" y="625" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">are safely buffered and processed automatically upon recovery.</text>
    </g>

    <rect x="70" y="1060" width="940" height="80" rx="16" fill="#090D16" stroke="#1E293B" stroke-width="1.5"/>
    <text x="540" y="1110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#F8FAFC" text-anchor="middle">"Resilience is not about preventing errors. It's about containing the blast radius."</text>

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

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">4 Rules for Event-Driven Systems</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">How principal cloud architects build unbreakable message backbones.</text>

    <g transform="translate(70, 320)">
      <!-- Rule 1 -->
      <rect x="0" y="0" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="35" width="70" height="70" rx="16" fill="#0B132B" stroke="#00F5D4" stroke-width="2"/>
      <text x="65" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="130" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Enforce Strict Idempotency Keys</text>
      <text x="130" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Network retries happen. Every consumer must check if an event ID was already executed.</text>

      <!-- Rule 2 -->
      <rect x="0" y="185" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="220" width="70" height="70" rx="16" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="65" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="130" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Use the Transactional Outbox Pattern</text>
      <text x="130" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Never write to DB and publish message in two separate steps. Store in Outbox table first.</text>

      <!-- Rule 3 -->
      <rect x="0" y="370" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="405" width="70" height="70" rx="16" fill="#0B132B" stroke="#A855F7" stroke-width="2"/>
      <text x="65" y="450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="130" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Dead Letter Queue (DLQ) Isolation</text>
      <text x="130" y="475" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Poison pill payloads must be routed to a DLQ after 3 retries without blocking the pipeline.</text>

      <!-- Rule 4 -->
      <rect x="0" y="555" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="590" width="70" height="70" rx="16" fill="#0B132B" stroke="#F59E0B" stroke-width="2"/>
      <text x="65" y="635" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#F59E0B" text-anchor="middle">04</text>
      <text x="130" y="620" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Treat Events as Immutable Public APIs</text>
      <text x="130" y="660" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Enforce Schema Registries (JSON Schema / Protobuf). Never introduce breaking payload changes.</text>
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

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">Synchronous vs Asynchronous</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">The architectural decision matrix for distributed architectures.</text>

    <g transform="translate(70, 320)">
      <rect x="0" y="0" width="940" height="60" rx="12" fill="#0B132B"/>
      <text x="40" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">SYSTEM WORKFLOW</text>
      <text x="370" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">OPTIMAL ARCHITECTURE</text>
      <text x="830" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">COUPLING</text>

      <!-- Row 1 -->
      <rect x="0" y="80" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">User Authentication / JWT</text>
      <text x="40" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Client waiting directly for credentials</text>
      <text x="370" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#38BDF8">Synchronous REST / RPC</text>
      <text x="830" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#F59E0B">Direct</text>

      <!-- Row 2 -->
      <rect x="0" y="210" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Checkout &amp; Order Intake</text>
      <text x="40" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">High throughput, multi-step pipeline</text>
      <text x="370" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#00F5D4">Event Streaming (Kafka / RabbitMQ)</text>
      <text x="830" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#10B981">Zero</text>

      <!-- Row 3 -->
      <rect x="0" y="340" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Notifications &amp; Webhooks</text>
      <text x="40" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Email, WhatsApp, Push notifications</text>
      <text x="370" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#00F5D4">Background Queue Worker</text>
      <text x="830" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#10B981">Zero</text>

      <!-- Row 4 -->
      <rect x="0" y="470" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Inventory Audit &amp; Analytics</text>
      <text x="40" y="550" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Read models, clickhouse sync</text>
      <text x="370" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#00F5D4">Change Data Capture (CDC)</text>
      <text x="830" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#10B981">Zero</text>
    </g>

    <rect x="70" y="980" width="940" height="140" rx="24" fill="#090D16" stroke="#00F5D4" stroke-width="1.5"/>
    <text x="540" y="1035" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">Save this matrix for your team's next system design session.</text>
    <text x="540" y="1075" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">Use synchronous calls for queries. Use asynchronous events for everything else.</text>

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

    <g transform="translate(540, 75)">
      <rect x="-140" y="0" width="280" height="38" rx="19" fill="#0B132B" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle" letter-spacing="1.5">ENGINEERING LEADERSHIP</text>
    </g>

    <text x="540" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1.5">Building High-Scale Systems</text>
    <text x="540" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#94A3B8" text-anchor="middle">Stand out with resilient architectures &amp; high-performance engineering.</text>

    <text x="540" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="900" fill="#00F5D4" text-anchor="middle" letter-spacing="-0.5">PAK-O-DRIVE // CLOUD</text>

    <!-- 3 High-Intent Hook Pills (Slobodan Style) -->
    <g transform="translate(540, 320)">
      <rect x="-250" y="0" width="500" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">Why are our microservices crashing under spikes?</text>

      <rect x="-260" y="56" width="520" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">How to eliminate cascading distributed failures?</text>

      <rect x="-270" y="112" width="540" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="141" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">How to implement idempotent consumers with DLQ?</text>
    </g>

    <!-- Dotted Curved Pointer Arrow -->
    <path d="M 230 430 Q 180 510 210 575" fill="none" stroke="#00F5D4" stroke-width="2.5" stroke-dasharray="6,6"/>
    <polygon points="212,580 203,568 217,572" fill="#00F5D4"/>

    <text x="540" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8" text-anchor="middle" letter-spacing="1">pakodrive.pk • syedadilali.dev</text>

    <!-- GRAND AUTHOR PROFILE CARD -->
    <g transform="translate(70, 580)">
      <rect x="0" y="0" width="940" height="480" rx="32" fill="url(#cardGrad)" stroke="#00F5D4" stroke-width="2.5" filter="url(#dropShadow)"/>

      <circle cx="140" cy="115" r="72" fill="#0B132B" stroke="#00F5D4" stroke-width="4"/>
      ${avatarBase64 ? `<image href="${avatarBase64}" x="52" y="27" width="176" height="176" clip-path="url(#avatarCardClip)" preserveAspectRatio="xMidYMid slice"/>` : `<text x="140" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#00F5D4" text-anchor="middle">SA</text>`}

      <g transform="translate(245, 80)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">SYED ADIL ALI</text>
        <circle cx="280" cy="-12" r="10" fill="#00F5D4"/>
        <polyline points="275,-12 278,-9 285,-16" fill="none" stroke="#030712" stroke-width="2.5"/>

        <text x="0" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#00F5D4">Senior Full-Stack Engineer &amp; Systems Architect</text>
        <text x="0" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500" fill="#94A3B8">Event-Driven Architecture • Distributed Node.js • Cloud Systems</text>
      </g>

      <g transform="translate(50, 225)">
        <rect x="0" y="0" width="840" height="74" rx="20" fill="#00F5D4" filter="url(#dropShadow)"/>
        <text x="420" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="#030712" text-anchor="middle" letter-spacing="0.5">+ Follow @Syed Adil Ali</text>
      </g>

      <line x1="50" y1="335" x2="890" y2="335" stroke="#1E293B" stroke-width="1.5"/>

      <!-- 3 Engagement Boxes -->
      <g transform="translate(50, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4">[ REPOST ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Share with devs in your feed</text>
      </g>

      <g transform="translate(340, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#38BDF8">[ SAVE ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Keep for architecture reviews</text>
      </g>

      <g transform="translate(630, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#A855F7">[ DISCUSS ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Drop questions in comments</text>
      </g>
    </g>

    <text x="540" y="1180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">Follow Syed Adil Ali for daily production architecture &amp; high-scale engineering.</text>
    <text x="540" y="1220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#00F5D4" text-anchor="middle">See you in the next breakdown ➔</text>
  </svg>
  `;
}

async function main() {
  console.log('🚀 [EventDrivenDeckBuilder] Compiling 8 Ultra-High-Fidelity Slides (1080x1350)...');
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

    const slidePath = `public/carousel-renders/event_slide_${slideNum}.jpg`;
    fs.writeFileSync(slidePath, jpgBuffer);
    console.log(`✓ Rendered Event Slide ${slideNum}/8 -> ${slidePath} (${Math.round(jpgBuffer.length / 1024)} KB)`);

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
  console.log(`\n🎉 [SUCCESS] Compiled Brand-New Event-Driven Carousel PDF -> public/active-carousel.pdf (${Math.round(pdfBytes.length / 1024)} KB)`);

  // Update carousel-preview.html
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Carousel Live Gallery | Event-Driven Architecture</title>
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
    <h1>🚀 LinkedIn Viral Carousel <span class="badge">Event-Driven Architecture</span></h1>
    <div style="display: flex; gap: 16px; align-items: center;">
      <span style="color: #94A3B8; font-size: 14px;">Why Top Teams Abandoned REST • 8 Slides</span>
      <a href="/active-carousel.pdf" download="Event-Driven-Architecture-Masterclass.pdf" class="download-btn">⬇ Download PDF</a>
    </div>
  </header>

  <div class="gallery-container">
    ${Array.from({ length: 8 }).map((_, idx) => `
    <div class="slide-card">
      <div class="slide-meta">
        <span>Slide ${idx + 1} of 8</span>
        <span style="color: #00F5D4;">1080 x 1350 (4:5 Portrait)</span>
      </div>
      <img src="/carousel-renders/event_slide_${idx + 1}.jpg" alt="Slide ${idx + 1}" />
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync('public/carousel-preview.html', previewHtml);
  console.log('✓ Updated public/carousel-preview.html with Event-Driven Slide Gallery Viewer!');
}

main().catch(err => {
  console.error('Fatal builder error:', err);
  process.exit(1);
});
