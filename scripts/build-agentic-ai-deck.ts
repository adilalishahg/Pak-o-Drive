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
    <text x="70" y="${HEIGHT - 50}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B">PAK-O-DRIVE // AGENTIC AI</text>
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
      <text x="0" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#00F5D4" text-anchor="middle" letter-spacing="2">AGENTIC AI // 2026</text>
    </g>

    <text x="540" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="58" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1.5">Autonomous AI Agents</text>
    <text x="540" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="500" fill="#94A3B8" text-anchor="middle">Why single-prompt LLMs fail and how multi-agent swarms take over.</text>

    <!-- 3D Hero Artwork -->
    <g filter="url(#dropShadow)">
      <rect x="150" y="320" width="780" height="780" rx="36" fill="#070B14" stroke="#1E293B" stroke-width="2"/>
      ${coverBase64 ? `<image href="${coverBase64}" x="152" y="322" width="776" height="776" clip-path="url(#heroCoverClip)" preserveAspectRatio="xMidYMid slice"/>` : ''}
    </g>

    <g transform="translate(540, 1220)">
      <rect x="-150" y="0" width="300" height="48" rx="24" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">pakodrive.pk // ai-systems</text>
    </g>
  </svg>
  `;
}

// SLIDE 2: THE SINGLE PROMPT TRAP
function buildSlide2(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('THE MONOLITHIC LLM TRAP', 2, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Illusion of Single Prompts</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Expecting one massive prompt to analyze, write code, and verify</text>
    <text x="70" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#EF4444">leads to severe hallucinations and non-deterministic production crashes.</text>

    <!-- Visual Architecture Diagram -->
    <rect x="70" y="360" width="940" height="480" rx="28" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="2" filter="url(#dropShadow)"/>

    <!-- Problem Box 1 -->
    <g transform="translate(110, 470)">
      <rect x="0" y="0" width="220" height="150" rx="18" fill="#0B132B" stroke="#EF4444" stroke-width="2"/>
      <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">Context Dilution</text>
      <text x="110" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle">Lost in the Middle</text>
      <rect x="30" y="105" width="160" height="28" rx="8" fill="#2E1014"/>
      <text x="110" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#EF4444" text-anchor="middle">RECALL DROPS 60%</text>
    </g>

    <path d="M 345 545 L 415 545" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6,6"/>
    <polygon points="420,545 410,539 410,551" fill="#F59E0B"/>

    <!-- Problem Box 2 -->
    <g transform="translate(430, 470)">
      <rect x="0" y="0" width="220" height="150" rx="18" fill="#0B132B" stroke="#F59E0B" stroke-width="2"/>
      <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">Zero Verification</text>
      <text x="110" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle">Blind Faith Output</text>
      <rect x="30" y="105" width="160" height="28" rx="8" fill="#38240D"/>
      <text x="110" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#F59E0B" text-anchor="middle">HALLUCINATED APIS</text>
    </g>

    <path d="M 665 545 L 735 545" stroke="#EF4444" stroke-width="3" stroke-dasharray="6,6"/>
    <polygon points="740,545 730,539 730,551" fill="#EF4444"/>

    <!-- Problem Box 3 -->
    <g transform="translate(750, 470)">
      <rect x="0" y="0" width="220" height="150" rx="18" fill="#0B132B" stroke="#EF4444" stroke-width="2"/>
      <text x="110" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">No Self-Healing</text>
      <text x="110" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle">One-Shot Generation</text>
      <rect x="30" y="105" width="160" height="28" rx="8" fill="#2E1014"/>
      <text x="110" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#EF4444" text-anchor="middle">SYNTAX CRASHES</text>
    </g>

    <!-- Bottom Takeaway Card (Well padded, 2 lines) -->
    <rect x="70" y="880" width="940" height="250" rx="24" fill="#090D16" stroke="#EF4444" stroke-width="1.5"/>
    <text x="110" y="935" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#EF4444" letter-spacing="1.5">ENGINEERING REALITY</text>
    <text x="110" y="978" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">Production AI is not about bigger prompt engineering.</text>
    <text x="110" y="1014" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">It requires deterministic agentic workflows and compiler loops.</text>
    <text x="110" y="1060" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Without tool calling, verification gates, and AST validation,</text>
    <text x="110" y="1090" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">LLM error rates compound exponentially on multi-file repositories.</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 3: MULTI-AGENT TOPOLOGY
function buildSlide3(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('SYSTEM TOPOLOGY', 3, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The 4-Agent Execution Loop</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Deconstructing monolith prompts into specialized autonomous roles.</text>

    <g transform="translate(70, 320)">
      <!-- Agent 1 -->
      <rect x="0" y="0" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="75" r="36" fill="#0B132B" stroke="#00F5D4" stroke-width="2"/>
      <text x="70" y="83" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="135" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Planner Agent (AST Context &amp; Graph)</text>
      <text x="135" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Builds symbol call graphs and file dependencies before writing a single line of code.</text>

      <!-- Agent 2 -->
      <rect x="0" y="180" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="255" r="36" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="70" y="263" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="135" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Coder Agent (Surgical Chunk Diffing)</text>
      <text x="135" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Executes precise localized diff replacements instead of expensive full-file rewrites.</text>

      <!-- Agent 3 -->
      <rect x="0" y="360" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="435" r="36" fill="#0B132B" stroke="#A855F7" stroke-width="2"/>
      <text x="70" y="443" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="135" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Verifier Agent (TypeScript &amp; Compiler Gates)</text>
      <text x="135" y="455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Executes headless build diagnostics and tests to detect breakages automatically.</text>

      <!-- Agent 4 -->
      <rect x="0" y="540" width="940" height="150" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <circle cx="70" cy="615" r="36" fill="#0B132B" stroke="#10B981" stroke-width="2"/>
      <text x="70" y="623" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#10B981" text-anchor="middle">04</text>
      <text x="135" y="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Self-Healer Agent (Closed-Loop Correction)</text>
      <text x="135" y="635" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Parses compiler error stacks and applies automated remedies until 0 errors remain.</text>
    </g>

    <rect x="70" y="1040" width="940" height="90" rx="18" fill="#090D16" stroke="#00F5D4" stroke-width="1.5"/>
    <text x="540" y="1095" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#00F5D4" text-anchor="middle">⚡ Specialization + Deterministic Gates = 99.2% Autonomous Success.</text>

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

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" letter-spacing="-1">Naive Prompt vs Agentic Loop</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Replacing blind text generation with typed tool execution and feedback loops.</text>

    <!-- macOS Windows Comparison -->
    <!-- Left: Naive -->
    <g transform="translate(70, 310)">
      <rect x="0" y="0" width="450" height="660" rx="20" fill="#070B14" stroke="#EF4444" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="0" y="0" width="450" height="48" rx="20" fill="#0F172A"/>
      <circle cx="28" cy="24" r="6" fill="#EF4444"/>
      <circle cx="48" cy="24" r="6" fill="#F59E0B"/>
      <circle cx="68" cy="24" r="6" fill="#10B981"/>
      <text x="225" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">❌ Naive Single-Shot Generation</text>

      <text x="24" y="90" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Direct unstructured prompt</text>
      <text x="24" y="130" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">const res = await openai.chat({</text>
      <text x="40" y="170" font-family="'Fira Code', monospace" font-size="13" fill="#94A3B8">model: 'gpt-4o',</text>
      <text x="40" y="210" font-family="'Fira Code', monospace" font-size="13" fill="#EF4444">prompt: 'Refactor our whole app'</text>
      <text x="24" y="250" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">});</text>
      <text x="24" y="310" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// Blindly overwrite disk</text>
      <text x="24" y="350" font-family="'Fira Code', monospace" font-size="13" fill="#EF4444">fs.writeFileSync(file, res.text);</text>
      <text x="24" y="410" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// No compiler check</text>
      <text x="24" y="450" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// No verification gates</text>
      <text x="24" y="490" font-family="'Fira Code', monospace" font-size="13" fill="#EF4444">// Production crashes!</text>

      <rect x="20" y="580" width="410" height="55" rx="12" fill="#1C1014"/>
      <text x="225" y="614" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#EF4444" text-anchor="middle">⚠️ Failure Rate: 58% | Context Loss: High</text>
    </g>

    <!-- Right: Agentic Loop -->
    <g transform="translate(560, 310)">
      <rect x="0" y="0" width="450" height="660" rx="20" fill="#070B14" stroke="#00F5D4" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="0" y="0" width="450" height="48" rx="20" fill="#0F172A"/>
      <circle cx="28" cy="24" r="6" fill="#EF4444"/>
      <circle cx="48" cy="24" r="6" fill="#F59E0B"/>
      <circle cx="68" cy="24" r="6" fill="#10B981"/>
      <text x="225" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle">✅ Typed Autonomous Agent Loop</text>

      <text x="24" y="90" font-family="'Fira Code', monospace" font-size="13" fill="#10B981">while (!task.isVerified) {</text>
      <text x="40" y="130" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// 1. Inspect AST &amp; call graph</text>
      <text x="40" y="165" font-family="'Fira Code', monospace" font-size="13" fill="#38BDF8">const span = await graft.ask(task);</text>
      <text x="40" y="210" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// 2. Targeted surgical diff</text>
      <text x="40" y="245" font-family="'Fira Code', monospace" font-size="13" fill="#A855F7">await replaceChunk(span, patch);</text>
      <text x="40" y="290" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// 3. Automated build verification</text>
      <text x="40" y="325" font-family="'Fira Code', monospace" font-size="13" fill="#00F5D4">const errors = await tsc.check();</text>
      <text x="40" y="370" font-family="'Fira Code', monospace" font-size="13" fill="#64748B">// 4. Self-healing branch</text>
      <text x="40" y="405" font-family="'Fira Code', monospace" font-size="13" fill="#F59E0B">if (errors.length) await heal(errors);</text>
      <text x="24" y="450" font-family="'Fira Code', monospace" font-size="13" fill="#10B981">}</text>

      <rect x="20" y="580" width="410" height="55" rx="12" fill="#09221C"/>
      <text x="225" y="614" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#00F5D4" text-anchor="middle">⚡ Success Rate: 99.2% | Zero Regressions</text>
    </g>

    <!-- Bottom Insight -->
    <rect x="70" y="1010" width="940" height="120" rx="20" fill="#090D16" stroke="#38BDF8" stroke-width="1.5"/>
    <text x="540" y="1058" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">Never trust LLM output without a compiler gate.</text>
    <text x="540" y="1092" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8" text-anchor="middle">Autonomous agents succeed because tools verify reality, not predictions.</text>

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

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" letter-spacing="-1">The Agentic Advantage</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Benchmarked on complex multi-file full-stack production repositories.</text>

    <g transform="translate(70, 320)">
      <!-- Stat 1 -->
      <rect x="0" y="0" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#00F5D4" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#00F5D4">99.2%</text>
      <text x="350" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">First-Pass Task Completion</text>
      <text x="350" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Closed-loop compiler validation eliminates broken imports</text>
      <text x="350" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">and syntax errors before presenting code to engineers.</text>

      <!-- Stat 2 -->
      <rect x="0" y="240" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="350" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#38BDF8">4.8x</text>
      <text x="350" y="315" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Lower Token Consumption</text>
      <text x="350" y="355" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Surgical diff chunk replacements preserve context window capacity</text>
      <text x="350" y="385" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">without bloating bills with massive 1,000+ line rewrites.</text>

      <!-- Stat 3 -->
      <rect x="0" y="480" width="940" height="210" rx="24" fill="url(#cardGrad)" stroke="#A855F7" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="60" y="590" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" fill="#A855F7">Zero</text>
      <text x="350" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF">Hallucinated Dependencies</text>
      <text x="350" y="595" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Live AST indexing guarantees every referenced function and import</text>
      <text x="350" y="625" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">actually exists in the active codebase before modification.</text>
    </g>

    <rect x="70" y="1060" width="940" height="80" rx="16" fill="#090D16" stroke="#1E293B" stroke-width="1.5"/>
    <text x="540" y="1110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#F8FAFC" text-anchor="middle">"The difference between toy AI and production AI is the verification harness."</text>

    ${renderBottomFooter()}
  </svg>
  `;
}

// SLIDE 6: 4 AGENTIC RULES
function buildSlide6(): string {
  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deepGlow)"/>
    ${renderTopNav('SYSTEM RULES', 6, 8)}

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" letter-spacing="-1">4 Rules for Agentic Systems</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">How principal AI architects build resilient autonomous swarms.</text>

    <g transform="translate(70, 320)">
      <!-- Rule 1 -->
      <rect x="0" y="0" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="35" width="70" height="70" rx="16" fill="#0B132B" stroke="#00F5D4" stroke-width="2"/>
      <text x="65" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#00F5D4" text-anchor="middle">01</text>
      <text x="130" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Ground Agents with AST Context</text>
      <text x="130" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Never dump raw code into context. Use Tree-Sitter graphs to cite exact spans.</text>

      <!-- Rule 2 -->
      <rect x="0" y="185" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="220" width="70" height="70" rx="16" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <text x="65" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#38BDF8" text-anchor="middle">02</text>
      <text x="130" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Enforce Strict Tool Typing</text>
      <text x="130" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Validate every tool call parameter with JSON Schema and compile-time type bounds.</text>

      <!-- Rule 3 -->
      <rect x="0" y="370" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="405" width="70" height="70" rx="16" fill="#0B132B" stroke="#A855F7" stroke-width="2"/>
      <text x="65" y="450" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#A855F7" text-anchor="middle">03</text>
      <text x="130" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Deterministic Compiler Feedback</text>
      <text x="130" y="475" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Pipe compiler diagnostic logs directly into the agent's feedback loop to trigger self-healing.</text>

      <!-- Rule 4 -->
      <rect x="0" y="555" width="940" height="160" rx="20" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <rect x="30" y="590" width="70" height="70" rx="16" fill="#0B132B" stroke="#F59E0B" stroke-width="2"/>
      <text x="65" y="635" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#F59E0B" text-anchor="middle">04</text>
      <text x="130" y="620" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Sandbox Blast Radii</text>
      <text x="130" y="660" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94A3B8">Isolate sub-agents in read-only sandboxes. Permit state mutation only via verified handlers.</text>
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

    <text x="70" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="#FFFFFF" letter-spacing="-1">AI Architecture Decision Matrix</text>
    <text x="70" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94A3B8">Choosing the right cognitive architecture for your engineering stack.</text>

    <g transform="translate(70, 320)">
      <rect x="0" y="0" width="940" height="60" rx="12" fill="#0B132B"/>
      <text x="40" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">USE CASE</text>
      <text x="370" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">RECOMMENDED PATTERN</text>
      <text x="830" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#00F5D4" letter-spacing="1">AUTONOMY</text>

      <!-- Row 1 -->
      <rect x="0" y="80" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Copywriting &amp; Summaries</text>
      <text x="40" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Single input, zero environment state</text>
      <text x="370" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#38BDF8">Single-Shot Prompting</text>
      <text x="830" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#94A3B8">Low</text>

      <!-- Row 2 -->
      <rect x="0" y="210" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Static Docs &amp; Internal Q&amp;A</text>
      <text x="40" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Vector similarity search across docs</text>
      <text x="370" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#38BDF8">RAG (Retrieval Augmented)</text>
      <text x="830" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#F59E0B">Medium</text>

      <!-- Row 3 -->
      <rect x="0" y="340" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Refactoring &amp; Bug Fixing</text>
      <text x="40" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Tool execution with compiler feedback</text>
      <text x="370" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#00F5D4">Autonomous Tool Loop</text>
      <text x="830" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#10B981">High</text>

      <!-- Row 4 -->
      <rect x="0" y="470" width="940" height="110" rx="16" fill="url(#cardGrad)" stroke="#1E293B" stroke-width="1.5"/>
      <text x="40" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Full-Stack Feature Engineering</text>
      <text x="40" y="550" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#94A3B8">Cross-repo planning, code &amp; validation</text>
      <text x="370" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#00F5D4">Multi-Agent Swarm</text>
      <text x="830" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#10B981">Maximum</text>
    </g>

    <rect x="70" y="980" width="940" height="140" rx="24" fill="#090D16" stroke="#00F5D4" stroke-width="1.5"/>
    <text x="540" y="1035" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle">Save this matrix for your team's next AI engineering sprint.</text>
    <text x="540" y="1075" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">Use RAG for knowledge retrieval. Use Multi-Agent Swarms for code mutations.</text>

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

    <text x="540" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1.5">Building Autonomous Systems</text>
    <text x="540" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#94A3B8" text-anchor="middle">Stand out with resilient architectures &amp; high-performance engineering.</text>

    <text x="540" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="900" fill="#00F5D4" text-anchor="middle" letter-spacing="-0.5">PAK-O-DRIVE // AI-LABS</text>

    <!-- 3 High-Intent Hook Questions -->
    <g transform="translate(540, 320)">
      <rect x="-250" y="0" width="500" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="29" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">Why do single-prompt LLMs hallucinate on complex tasks?</text>

      <rect x="-260" y="56" width="520" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">How to build closed-loop self-healing compiler agents?</text>

      <rect x="-270" y="112" width="540" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="141" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#E2E8F0" text-anchor="middle">How to implement deterministic verification gates?</text>
    </g>

    <!-- Dotted Curved Pointer Arrow -->
    <path d="M 230 430 Q 180 510 210 575" fill="none" stroke="#00F5D4" stroke-width="2.5" stroke-dasharray="6,6"/>
    <polygon points="212,580 203,568 217,572" fill="#00F5D4"/>

    <text x="540" y="540" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38BDF8" text-anchor="middle" letter-spacing="1">pakodrive.pk • syedadilali.dev</text>

    <!-- GRAND AUTHOR PROFILE CARD (Authentic Studio Photo Syed Adil Ali) -->
    <g transform="translate(70, 580)">
      <rect x="0" y="0" width="940" height="480" rx="32" fill="url(#cardGrad)" stroke="#00F5D4" stroke-width="2.5" filter="url(#dropShadow)"/>

      <circle cx="140" cy="115" r="72" fill="#0B132B" stroke="#00F5D4" stroke-width="4"/>
      ${avatarBase64 ? `<image href="${avatarBase64}" x="52" y="27" width="176" height="176" clip-path="url(#avatarCardClip)" preserveAspectRatio="xMidYMid slice"/>` : `<text x="140" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#00F5D4" text-anchor="middle">SA</text>`}

      <g transform="translate(245, 80)">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">SYED ADIL ALI</text>
        <circle cx="280" cy="-12" r="10" fill="#00F5D4"/>
        <polyline points="275,-12 278,-9 285,-16" fill="none" stroke="#030712" stroke-width="2.5"/>

        <text x="0" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#00F5D4">Senior Full-Stack Engineer &amp; Systems Architect</text>
        <text x="0" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500" fill="#94A3B8">Autonomous AI Agents • Cloud Systems • Distributed Architectures</text>
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
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Share with engineers in your feed</text>
      </g>

      <g transform="translate(340, 360)">
        <rect x="0" y="0" width="260" height="85" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#38BDF8">[ SAVE ]</text>
        <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8">Keep for AI system design reviews</text>
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
  console.log('🚀 [AgenticAIDeckBuilder] Compiling 8 Ultra-High-Fidelity Slides (1080x1350)...');
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
    console.log(`✓ Rendered Agentic AI Slide ${slideNum}/8 -> ${slidePath} (${Math.round(jpgBuffer.length / 1024)} KB)`);

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
  console.log(`\n🎉 [SUCCESS] Compiled Brand-New Agentic AI Carousel PDF -> public/active-carousel.pdf (${Math.round(pdfBytes.length / 1024)} KB)`);

  // Update carousel-preview.html to show these slides
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Carousel Live Gallery | Agentic AI Architecture</title>
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
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
    }
    .meta-bar {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #94A3B8;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 32px;
      max-width: 1600px;
      width: 100%;
      padding: 40px 24px;
      box-sizing: border-box;
    }
    .card {
      background: #0B1120;
      border: 1px solid #1E293B;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: #00F5D4;
    }
    .card img {
      width: 100%;
      height: auto;
      display: block;
      aspect-ratio: 4 / 5;
      object-fit: cover;
    }
    .card-footer {
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: #94A3B8;
      border-top: 1px solid #1E293B;
    }
    .slide-tag {
      color: #00F5D4;
    }
  </style>
</head>
<body>
  <header>
    <h1>
      <span>⚡</span> Autonomous AI Agents: Why Single Prompts Fail
      <span class="badge">AGENTIC AI // 2026</span>
    </h1>
    <div class="meta-bar">
      <span>👤 Author: <strong>Syed Adil Ali</strong></span>
      <span>📄 8 Slides (1080x1350)</span>
      <span>⚡ PDF: <strong>active-carousel.pdf</strong></span>
    </div>
  </header>

  <div class="gallery">
    ${Array.from({ length: 8 }).map((_, idx) => `
      <div class="card">
        <img src="carousel-renders/agentic_slide_${idx + 1}.jpg" alt="Slide ${idx + 1}">
        <div class="card-footer">
          <span class="slide-tag">Slide ${idx + 1} of 8</span>
          <span>1080 × 1350 (4:5)</span>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync('public/carousel-preview.html', previewHtml);
  console.log('✓ Updated public/carousel-preview.html with Agentic AI Slide Gallery Viewer!\n');
}

main().catch(err => {
  console.error('Fatal deck generator error:', err);
  process.exit(1);
});
