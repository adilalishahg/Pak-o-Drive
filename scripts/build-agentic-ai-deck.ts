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

const coverBase64 = toBase64Image('public/img/agentic-ai-cover.jpg');
const avatarBase64 = toBase64Image('public/img/avatar.jpg');

function getBaseSvgHeader(): string {
  return `
  <defs>
    <!-- Slobodan Deep Space Radial Vignette -->
    <radialGradient id="bgVignette" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="1"/>
      <stop offset="55%" stop-color="#0A0F1D" stop-opacity="1"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="cyanCenterGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#0284C7" stop-opacity="0.25"/>
      <stop offset="70%" stop-color="#0F172A" stop-opacity="0"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#111827" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0B1120" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="codeWinBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="1"/>
      <stop offset="100%" stop-color="#070D18" stop-opacity="1"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
    <clipPath id="heroCoverClip">
      <rect x="150" y="310" width="780" height="780" rx="36"/>
    </clipPath>
    <clipPath id="avatarCircleClip">
      <circle cx="540" cy="855" r="75"/>
    </clipPath>
  </defs>
  `;
}

// Background with Slobodan 3D floor perspective
function renderBackground(): string {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgVignette)"/>
    <circle cx="540" cy="550" r="460" fill="url(#cyanCenterGlow)"/>
    <!-- 3D perspective floor grid lines -->
    <path d="M 0 1230 L 320 880 L 760 880 L 1080 1230" fill="none" stroke="#1E293B" stroke-width="1" opacity="0.4"/>
    <line x1="540" y1="880" x2="540" y2="1230" stroke="#1E293B" stroke-width="1" opacity="0.4"/>
  `;
}

// Top Right Page Badge (Slobodan Exact Standard: "3 of 8")
function renderPageBadge(pageNum: number, totalSlides = 8): string {
  return `
    <text x="${WIDTH - 80}" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" text-anchor="end">${pageNum} of ${totalSlides}</text>
  `;
}

// Bottom Bar (Slobodan Exact Standard: Black footer bar with blue accent line and centered "Subscribe for more")
function renderBottomBar(text = 'Subscribe for more'): string {
  return `
    <rect x="0" y="1230" width="${WIDTH}" height="120" fill="#000000"/>
    <line x1="0" y1="1230" x2="${WIDTH}" y2="1230" stroke="#1D4ED8" stroke-width="2.5"/>
    <text x="540" y="1302" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#FFFFFF" text-anchor="middle">${text}</text>
  `;
}

// SLIDE 1: COVER
function buildSlide1(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}

    <!-- Centered Header -->
    <text x="540" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">Autonomous AI Agents</text>
    <text x="540" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Beyond single-prompt engineering: the multi-agent architecture.</text>

    <!-- 3D Hero Artwork -->
    <g filter="url(#cardShadow)">
      <rect x="150" y="310" width="780" height="780" rx="36" fill="#070B14" stroke="#1E293B" stroke-width="2"/>
      ${coverBase64 ? `<image href="${coverBase64}" x="150" y="310" width="780" height="780" clip-path="url(#heroCoverClip)" preserveAspectRatio="xMidYMid slice"/>` : ''}
    </g>

    <!-- Bottom URL Pill -->
    <g transform="translate(540, 1160)">
      <rect x="-160" y="0" width="320" height="48" rx="24" fill="#0B132B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="0" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle" letter-spacing="0.5">pakodrive.pk // ai-systems</text>
    </g>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 2: THE SINGLE PROMPT ILLUSION (Slobodan Slide 2 / 3 Style)
function buildSlide2(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(2)}

    <!-- Centered Title & Description -->
    <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">The Single Prompt Illusion</text>
    <text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Expecting one prompt to write and verify entire codebases</text>
    <text x="540" y="300" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">inevitably creates cascading production errors.</text>

    <!-- Center Hero Diagram: 3 High-Impact Cards with Glow Connectors -->
    <g transform="translate(100, 390)" filter="url(#cardShadow)">
      <!-- Card 1 -->
      <rect x="0" y="0" width="880" height="150" rx="20" fill="url(#cardBg)" stroke="#EF4444" stroke-width="2"/>
      <circle cx="75" cy="75" r="34" fill="#1C1014" stroke="#EF4444" stroke-width="2"/>
      <text x="75" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#EF4444" text-anchor="middle">01</text>
      <text x="145" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Context Window Dilution</text>
      <text x="145" y="102" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Retrieval precision drops over 60% in monolithic 100k prompts.</text>

      <!-- Card 2 -->
      <rect x="0" y="180" width="880" height="150" rx="20" fill="url(#cardBg)" stroke="#F59E0B" stroke-width="2"/>
      <circle cx="75" cy="255" r="34" fill="#2E1C0A" stroke="#F59E0B" stroke-width="2"/>
      <text x="75" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#F59E0B" text-anchor="middle">02</text>
      <text x="145" y="238" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Zero Verification Feedback</text>
      <text x="145" y="282" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">LLMs produce hallucinated imports without compiler gates.</text>

      <!-- Card 3 -->
      <rect x="0" y="360" width="880" height="150" rx="20" fill="url(#cardBg)" stroke="#38BDF8" stroke-width="2"/>
      <circle cx="75" cy="435" r="34" fill="#0C2030" stroke="#38BDF8" stroke-width="2"/>
      <text x="75" y="445" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#38BDF8" text-anchor="middle">03</text>
      <text x="145" y="418" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Destructive File Overwrites</text>
      <text x="145" y="462" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Rewriting entire files destroys untouched production code.</text>
    </g>

    <!-- Punchline -->
    <text x="540" y="1030" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">Without compiler loops, LLMs guess instead of solve.</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 3: THE 4-AGENT EXECUTION LOOP (Slobodan Architecture Style)
function buildSlide3(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(3)}

    <!-- Centered Title & Description -->
    <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">The 4-Agent Execution Loop</text>
    <text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Deconstructing monolithic prompts into specialized roles.</text>

    <!-- Visual Architecture: 4 Connected High-Legibility Blocks -->
    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      <!-- 01 Planner -->
      <rect x="0" y="0" width="880" height="135" rx="18" fill="url(#cardBg)" stroke="#00F5D4" stroke-width="2"/>
      <circle cx="70" cy="68" r="32" fill="#072024" stroke="#00F5D4" stroke-width="2"/>
      <text x="70" y="77" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="135" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Planner Agent // Graph &amp; AST</text>
      <text x="135" y="94" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#E2E8F0">Builds symbol call graphs and file dependencies first.</text>

      <!-- 02 Coder -->
      <rect x="0" y="155" width="880" height="135" rx="18" fill="url(#cardBg)" stroke="#38BDF8" stroke-width="2"/>
      <circle cx="70" cy="223" r="32" fill="#0B1C30" stroke="#38BDF8" stroke-width="2"/>
      <text x="70" y="232" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="135" y="207" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Coder Agent // Surgical Chunk Diffing</text>
      <text x="135" y="249" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#E2E8F0">Applies localized line replacements without full rewrites.</text>

      <!-- 03 Verifier -->
      <rect x="0" y="310" width="880" height="135" rx="18" fill="url(#cardBg)" stroke="#A855F7" stroke-width="2"/>
      <circle cx="70" cy="378" r="32" fill="#200E30" stroke="#A855F7" stroke-width="2"/>
      <text x="70" y="387" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="135" y="362" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Verifier Agent // Compiler Gates</text>
      <text x="135" y="404" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#E2E8F0">Executes headless TypeScript &amp; test suites automatically.</text>

      <!-- 04 Self-Healer -->
      <rect x="0" y="465" width="880" height="135" rx="18" fill="url(#cardBg)" stroke="#10B981" stroke-width="2"/>
      <circle cx="70" cy="533" r="32" fill="#09261C" stroke="#10B981" stroke-width="2"/>
      <text x="70" y="542" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981" text-anchor="middle">04</text>
      <text x="135" y="517" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Self-Healer Agent // Closed-Loop Recovery</text>
      <text x="135" y="559" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#E2E8F0">Feeds compiler stack traces back to resolve errors in place.</text>
    </g>

    <!-- Punchline -->
    <text x="540" y="1050" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">Specialization + compiler gates = 99.2% autonomous success.</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 4: THE BIG CRISP CODE BLOCK (Slobodan Exact Standard: 1789200014139-3 Style)
function buildSlide4(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(4)}

    <!-- Centered Title & Description -->
    <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">The Deterministic Agent Loop</text>
    <text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Replace blind text output with typed compiler verification.</text>

    <!-- Slobodan Big Centered Code Window -->
    <g transform="translate(100, 340)" filter="url(#cardShadow)">
      <!-- Window Background -->
      <rect x="0" y="0" width="880" height="490" rx="20" fill="url(#codeWinBg)" stroke="#38BDF8" stroke-width="2"/>

      <!-- Window Header Bar -->
      <rect x="0" y="0" width="880" height="58" rx="20" fill="#131F37"/>
      <rect x="0" y="38" width="880" height="20" fill="#131F37"/>

      <!-- File Badge on Left -->
      <g transform="translate(24, 15)">
        <rect x="0" y="0" width="30" height="28" rx="6" fill="#F7DF1E"/>
        <text x="15" y="20" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">TS</text>
        <text x="42" y="20" font-family="'Fira Code', monospace" font-size="19" font-weight="700" fill="#E2E8F0">agentic_executor.ts</text>
      </g>

      <!-- Window Controls on Right (Slobodan Style: — □ ✕) -->
      <g transform="translate(790, 20)">
        <text x="0" y="16" font-family="monospace" font-size="20" fill="#64748B">—</text>
        <text x="26" y="16" font-family="monospace" font-size="18" fill="#64748B">□</text>
        <text x="52" y="17" font-family="monospace" font-size="20" fill="#64748B">✕</text>
      </g>

      <!-- Crisp Large Code Lines with natural tspan kerning -->
      <g transform="translate(36, 125)">
        <!-- Line 1 -->
        <text x="0" y="0" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">1  </tspan>
          <tspan fill="#38BDF8">const </tspan>
          <tspan fill="#FFFFFF">context </tspan>
          <tspan fill="#94A3B8">= </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#00F5D4">graft.ask</tspan>
          <tspan fill="#FBBF24">(task);</tspan>
        </text>

        <!-- Line 2 -->
        <text x="0" y="52" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">2  </tspan>
          <tspan fill="#38BDF8">const </tspan>
          <tspan fill="#FFFFFF">diff </tspan>
          <tspan fill="#94A3B8">= </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#A855F7">coder.patch</tspan>
          <tspan fill="#FBBF24">(context);</tspan>
        </text>

        <!-- Line 3 -->
        <text x="0" y="104" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">3  </tspan>
          <tspan fill="#38BDF8">const </tspan>
          <tspan fill="#FFFFFF">build </tspan>
          <tspan fill="#94A3B8">= </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#00F5D4">compiler.check</tspan>
          <tspan fill="#FBBF24">(diff);</tspan>
        </text>

        <!-- Line 4 -->
        <text x="0" y="156" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">4  </tspan>
          <tspan fill="#F43F5E">if </tspan>
          <tspan fill="#CBD5E1">(!build.ok) </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#F59E0B">healer.resolve</tspan>
          <tspan fill="#FBBF24">(build.err);</tspan>
        </text>

        <!-- Line 5 -->
        <text x="0" y="208" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">5  </tspan>
          <tspan fill="#38BDF8">return </tspan>
          <tspan fill="#10B981">build.verifiedResult;</tspan>
        </text>
      </g>

      <!-- Bottom Status Pill inside Window -->
      <rect x="24" y="415" width="832" height="50" rx="12" fill="#0A221C"/>
      <text x="440" y="447" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="#00F5D4" text-anchor="middle">⚡ Zero Silent Regressions • 100% Compiler Verified Code</text>
    </g>

    <!-- Punchline -->
    <text x="540" y="990" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">Code isn't complete when generated. It's complete when verified.</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 5: BENCHMARKS & METRICS (Slobodan Slide 5 Style: Big Numbers & Cards)
function buildSlide5(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(5)}

    <!-- Centered Title & Description -->
    <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">The Production Metrics</text>
    <text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Benchmarked across multi-file full-stack production repositories.</text>

    <!-- 3 Big Metric Cards -->
    <g transform="translate(100, 340)" filter="url(#cardShadow)">
      <!-- Metric 1 -->
      <rect x="0" y="0" width="880" height="175" rx="22" fill="url(#cardBg)" stroke="#00F5D4" stroke-width="2"/>
      <text x="60" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="82" font-weight="900" fill="#00F5D4">99.2%</text>
      <text x="360" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">First-Pass Completion</text>
      <text x="360" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Compiler feedback loops catch syntax breakages</text>
      <text x="360" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">before code is presented to engineers.</text>

      <!-- Metric 2 -->
      <rect x="0" y="205" width="880" height="175" rx="22" fill="url(#cardBg)" stroke="#38BDF8" stroke-width="2"/>
      <text x="60" y="317" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="82" font-weight="900" fill="#38BDF8">4.8x</text>
      <text x="360" y="273" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Token Cost Efficiency</text>
      <text x="360" y="315" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Surgical line-chunk edits save 80-90% context</text>
      <text x="360" y="347" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">compared to full-file rewrites.</text>

      <!-- Metric 3 -->
      <rect x="0" y="410" width="880" height="175" rx="22" fill="url(#cardBg)" stroke="#A855F7" stroke-width="2"/>
      <text x="60" y="522" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="78" font-weight="900" fill="#A855F7">ZERO</text>
      <text x="360" y="478" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Hallucinated Symbols</text>
      <text x="360" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Live AST graphs guarantee every cited function</text>
      <text x="360" y="552" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">actually exists in the active workspace.</text>
    </g>

    <!-- Punchline -->
    <text x="540" y="1070" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">Verification turns probabilistic models into deterministic tools.</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 6: 4 CORE ENGINEERING RULES (Slobodan Large Card Hierarchy)
function buildSlide6(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(6)}

    <!-- Centered Title & Description -->
    <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">4 Rules for Agentic Systems</text>
    <text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">How principal AI architects build resilient autonomous swarms.</text>

    <!-- 4 High-Legibility Rule Cards with Generous Padding -->
    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      <!-- Rule 1 -->
      <rect x="0" y="0" width="880" height="140" rx="18" fill="url(#cardBg)" stroke="#00F5D4" stroke-width="2"/>
      <circle cx="70" cy="70" r="32" fill="#092026" stroke="#00F5D4" stroke-width="2"/>
      <text x="70" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="135" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Ground Agents with AST Context</text>
      <text x="135" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Tree-Sitter syntax graphs cite exact line spans. Never dump raw text.</text>

      <!-- Rule 2 -->
      <rect x="0" y="160" width="880" height="140" rx="18" fill="url(#cardBg)" stroke="#38BDF8" stroke-width="2"/>
      <circle cx="70" cy="230" r="32" fill="#0B1C30" stroke="#38BDF8" stroke-width="2"/>
      <text x="70" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="135" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Enforce Strict Tool Typing</text>
      <text x="135" y="258" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Validate all tool parameters with compile-time JSON schemas.</text>

      <!-- Rule 3 -->
      <rect x="0" y="320" width="880" height="140" rx="18" fill="url(#cardBg)" stroke="#A855F7" stroke-width="2"/>
      <circle cx="70" cy="390" r="32" fill="#200E30" stroke="#A855F7" stroke-width="2"/>
      <text x="70" y="400" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="135" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Deterministic Compiler Feedback</text>
      <text x="135" y="418" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Pipe compiler diagnostic logs directly into agent self-healing loops.</text>

      <!-- Rule 4 -->
      <rect x="0" y="480" width="880" height="140" rx="18" fill="url(#cardBg)" stroke="#F59E0B" stroke-width="2"/>
      <circle cx="70" cy="550" r="32" fill="#2E1C0A" stroke="#F59E0B" stroke-width="2"/>
      <text x="70" y="560" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#F59E0B" text-anchor="middle">04</text>
      <text x="135" y="535" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Sandbox Blast Radii</text>
      <text x="135" y="578" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0">Isolate sub-agents in sandboxes to prevent uncontrolled state mutation.</text>
    </g>

    <!-- Punchline -->
    <text x="540" y="1070" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">Clean boundaries create autonomous dependability.</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 7: ARCHITECTURAL DECISION MATRIX (High Legibility & Clean Bounds)
function buildSlide7(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(7)}

    <!-- Centered Title & Description -->
    <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">When to Use What</text>
    <text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Choosing the right cognitive architecture for your engineering stack.</text>

    <!-- 4 Clean Rows -->
    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      <!-- Header -->
      <rect x="0" y="0" width="880" height="52" rx="12" fill="#0F172A"/>
      <text x="40" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1.5">TASK TYPE</text>
      <text x="390" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1.5">ARCHITECTURE</text>
      <text x="760" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1.5">AUTONOMY</text>

      <!-- Row 1 -->
      <rect x="0" y="70" width="880" height="120" rx="16" fill="url(#cardBg)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Copy &amp; Summaries</text>
      <text x="40" y="156" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">Stateless text generation</text>
      <text x="390" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#38BDF8">Single-Shot Prompt</text>
      <text x="760" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#64748B">Low</text>

      <!-- Row 2 -->
      <rect x="0" y="205" width="880" height="120" rx="16" fill="url(#cardBg)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="255" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Knowledge &amp; Docs</text>
      <text x="40" y="291" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">Semantic vector retrieval</text>
      <text x="390" y="267" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#38BDF8">RAG (Vector Index)</text>
      <text x="760" y="267" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#F59E0B">Medium</text>

      <!-- Row 3 -->
      <rect x="0" y="340" width="880" height="120" rx="16" fill="url(#cardBg)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Refactoring &amp; Fixes</text>
      <text x="40" y="426" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">Tool calls &amp; compiler gates</text>
      <text x="390" y="402" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#00F5D4">Autonomous Tool Loop</text>
      <text x="760" y="402" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981">High</text>

      <!-- Row 4 -->
      <rect x="0" y="475" width="880" height="120" rx="16" fill="url(#cardBg)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="525" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Production Features</text>
      <text x="40" y="561" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">Multi-file planning &amp; healing</text>
      <text x="390" y="537" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#00F5D4">Multi-Agent Swarm</text>
      <text x="760" y="537" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981">Maximum</text>
    </g>

    <!-- Punchline -->
    <text x="540" y="1050" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">Use RAG for knowledge retrieval. Use agent swarms for code mutations.</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

// SLIDE 8: SLOBODAN EXACT CALL-TO-ACTION & SYED ADIL ALI PROFILE (Exact Match to media_1789468333605)
function buildSlide8(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}

    <!-- Header & Subtitle (Slobodan Exact Style) -->
    <text x="540" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">Building Modern AI Systems</text>
    <text x="540" y="200" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">Stand out with clean, deterministic architectures</text>
    <text x="540" y="235" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">that deliver real enterprise value.</text>

    <!-- Big Center Brand (Slobodan "2MWebStudio" Equivalent) -->
    <g transform="translate(540, 340)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">Pak-o-Drive</text>
      <text x="0" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="58" font-weight="900" fill="#38BDF8" text-anchor="middle" letter-spacing="-1">AI Studio</text>
    </g>

    <!-- 3 Question Pills (Slobodan Exact Match) -->
    <g transform="translate(540, 480)">
      <rect x="-240" y="0" width="480" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#E2E8F0" text-anchor="middle">Why do monolithic prompts hallucinate?</text>

      <rect x="-250" y="58" width="500" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="87" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#E2E8F0" text-anchor="middle">How do compiler loops self-heal code?</text>

      <rect x="-260" y="116" width="520" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#E2E8F0" text-anchor="middle">Where does AST context beat raw text?</text>
    </g>

    <!-- Dotted Curved Arrow Pointing to Profile -->
    <path d="M 280 610 Q 230 680 270 725" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="5,5"/>
    <polygon points="274,730 262,720 276,717" fill="#38BDF8"/>

    <!-- URL Pill -->
    <text x="540" y="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">pakodrive.pk // ai-systems</text>

    <!-- Social Badges (in, github, web, ig) -->
    <g transform="translate(540, 730)">
      <circle cx="-90" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="-90" y="24" font-family="-apple-system, sans-serif" font-size="16" font-weight="900" fill="#38BDF8" text-anchor="middle">in</text>

      <circle cx="-30" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="-30" y="24" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" fill="#00F5D4" text-anchor="middle">git</text>

      <circle cx="30" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="30" y="24" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" fill="#A855F7" text-anchor="middle">web</text>

      <circle cx="90" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="90" y="24" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" fill="#F43F5E" text-anchor="middle">ig</text>
    </g>

    <!-- Authentic Studio Circular Avatar (Syed Adil Ali) - Slobodan Exact Match -->
    <g filter="url(#cardShadow)">
      <circle cx="540" cy="855" r="77" fill="#0B132B" stroke="#00F5D4" stroke-width="4"/>
      ${avatarBase64 ? `<image href="${avatarBase64}" x="465" y="780" width="150" height="150" clip-path="url(#avatarCircleClip)" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="540" cy="855" r="75" fill="#1E293B"/>`}
    </g>

    <!-- Author Name & Title (Slobodan Exact Standard) -->
    <text x="540" y="975" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">Syed Adil Ali</text>
    <text x="540" y="1015" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="#00F5D4" text-anchor="middle">Senior Full-Stack &amp; AI Systems Architect</text>
    <text x="540" y="1050" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">Building high-performance production web &amp; autonomous agent architectures.</text>

    ${renderBottomBar('Follow for more insights')}
  </svg>
  `;
}

async function main() {
  console.log('🚀 [AgenticAIDeckBuilder] Compiling 8 Ultra-High-Fidelity Slides matching Slobodan Gajić standard...');
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

    const slidePath = `public/carousel-renders/agentic_slide_${slideNum}.jpg`;
    fs.writeFileSync(slidePath, jpgBuffer);
    console.log(`  ✓ Rendered slide ${slideNum}/8: ${slidePath}`);

    const jpgImage = await pdfDoc.embedJpg(jpgBuffer);
    const page = pdfDoc.addPage([WIDTH, HEIGHT]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('public/agentic-ai-carousel.pdf', pdfBytes);
  fs.writeFileSync('public/active-carousel.pdf', pdfBytes);
  console.log('✅ Generated public/agentic-ai-carousel.pdf & public/active-carousel.pdf');

  // Update HTML carousel preview
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agentic AI Carousel - Slobodan Standard</title>
  <style>
    body { background: #030712; color: #fff; font-family: -apple-system, sans-serif; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
    h1 { font-size: 28px; margin-bottom: 20px; color: #00F5D4; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; max-width: 1400px; width: 100%; }
    .card { background: #0B132B; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; }
    .card img { width: 100%; display: block; }
    .footer { margin-top: 40px; color: #64748B; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Autonomous AI Agents - Slobodan Gajić Design Standard</h1>
  <div class="grid">
    ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `
      <div class="card">
        <img src="/carousel-renders/agentic_slide_${n}.jpg" alt="Slide ${n}">
      </div>
    `).join('')}
  </div>
  <div class="footer">Pak-o-Drive LinkedIn Carousel Suite</div>
</body>
</html>`;

  fs.writeFileSync('public/carousel-preview.html', previewHtml);
  console.log('✅ Updated public/carousel-preview.html');
}

main().catch(console.error);
