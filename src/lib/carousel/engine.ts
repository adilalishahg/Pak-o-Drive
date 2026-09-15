import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import type { CarouselDeck, CarouselSlide } from './types';
import { SLIDE_WIDTH, SLIDE_HEIGHT } from './constants';
import { getTopicImage } from './utils';

const WIDTH = SLIDE_WIDTH || 1080;
const HEIGHT = SLIDE_HEIGHT || 1350;

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapHeadline(text: string, maxChars = 28): string[] {
  const clean = text.trim();
  if (clean.length <= maxChars) return [clean];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

function renderHeadlineSvg(lines: string[], subheadline: string): string {
  const sub = escapeXml(subheadline || '');
  if (lines.length <= 1) {
    return `
      <text x="540" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[0])}</text>
      ${sub ? `<text x="540" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400" fill="#E2E8F0" text-anchor="middle">${sub}</text>` : ''}
    `;
  }
  return `
    <text x="540" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[0])}</text>
    <text x="540" y="222" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[1])}</text>
    ${sub ? `<text x="540" y="275" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#E2E8F0" text-anchor="middle">${sub}</text>` : ''}
  `;
}

function toBase64Image(relativePath: string): string {
  try {
    const fullPath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) return '';
    const ext = path.extname(fullPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:${mime};base64,${data}`;
  } catch {
    return '';
  }
}

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

function renderBackground(): string {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgVignette)"/>
    <circle cx="540" cy="550" r="460" fill="url(#cyanCenterGlow)"/>
    <!-- 3D perspective floor grid lines -->
    <path d="M 0 1230 L 320 880 L 760 880 L 1080 1230" fill="none" stroke="#1E293B" stroke-width="1" opacity="0.4"/>
    <line x1="540" y1="880" x2="540" y2="1230" stroke="#1E293B" stroke-width="1" opacity="0.4"/>
  `;
}

function renderPageBadge(pageNum: number, totalSlides: number): string {
  return `
    <text x="${WIDTH - 80}" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" text-anchor="end">${pageNum} of ${totalSlides}</text>
  `;
}

function renderBottomBar(text = 'Subscribe for more'): string {
  return `
    <rect x="0" y="1230" width="${WIDTH}" height="120" fill="#000000"/>
    <line x1="0" y1="1230" x2="${WIDTH}" y2="1230" stroke="#1D4ED8" stroke-width="2.5"/>
    <text x="540" y="1302" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#FFFFFF" text-anchor="middle">${escapeXml(text)}</text>
  `;
}

/**
 * Slide 1: Cover Slide
 */
function renderCoverSvg(slide: CarouselSlide, coverBase64: string): string {
  const lines = wrapHeadline(slide.headline || 'Technical Masterclass', 24);
  const subheadline = escapeXml(slide.subheadline || 'Architecture & Engineering Deep Dive');

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}

    <!-- Centered Header -->
    <text x="540" y="${lines.length > 1 ? '150' : '180'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[0])}</text>
    ${lines.length > 1 ? `<text x="540" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[1])}</text>` : ''}
    <text x="540" y="${lines.length > 1 ? '270' : '240'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#E2E8F0" text-anchor="middle">${subheadline}</text>

    <!-- 3D Hero Artwork -->
    <g filter="url(#cardShadow)">
      <rect x="150" y="310" width="780" height="780" rx="36" fill="#070B14" stroke="#1E293B" stroke-width="2"/>
      ${coverBase64 ? `<image href="${coverBase64}" x="150" y="310" width="780" height="780" clip-path="url(#heroCoverClip)" preserveAspectRatio="xMidYMid slice"/>` : ''}
    </g>

    <!-- Bottom URL Pill -->
    <g transform="translate(540, 1160)">
      <rect x="-160" y="0" width="320" height="48" rx="24" fill="#0B132B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="0" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle" letter-spacing="0.5">pakodrive.pk // tech-systems</text>
    </g>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Slide: Slobodan Code Window
 */
function renderCodeSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
  const lines = wrapHeadline(slide.headline || 'Implementation Details');
  const quote = escapeXml(slide.takeawayQuote || "Code isn't complete when generated. It's complete when verified.");

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(pageNum, totalSlides)}

    ${renderHeadlineSvg(lines, slide.subheadline || 'Deterministic code patterns and architecture.')}

    <!-- Slobodan Big Centered Code Window -->
    <g transform="translate(100, 340)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="880" height="490" rx="20" fill="url(#codeWinBg)" stroke="#38BDF8" stroke-width="2"/>

      <!-- Header Bar -->
      <rect x="0" y="0" width="880" height="58" rx="20" fill="#131F37"/>
      <rect x="0" y="38" width="880" height="20" fill="#131F37"/>

      <!-- File Badge on Left -->
      <g transform="translate(24, 15)">
        <rect x="0" y="0" width="30" height="28" rx="6" fill="#F7DF1E"/>
        <text x="15" y="20" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">TS</text>
        <text x="42" y="20" font-family="'Fira Code', monospace" font-size="19" font-weight="700" fill="#E2E8F0">agentic_executor.ts</text>
      </g>

      <!-- Window Controls on Right (— □ ✕) -->
      <g transform="translate(790, 20)">
        <text x="0" y="16" font-family="monospace" font-size="20" fill="#64748B">—</text>
        <text x="26" y="16" font-family="monospace" font-size="18" fill="#64748B">□</text>
        <text x="52" y="17" font-family="monospace" font-size="20" fill="#64748B">✕</text>
      </g>

      <!-- Code Lines -->
      <g transform="translate(36, 125)">
        <text x="0" y="0" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">1  </tspan>
          <tspan fill="#38BDF8">const </tspan>
          <tspan fill="#FFFFFF">context </tspan>
          <tspan fill="#94A3B8">= </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#00F5D4">graft.ask</tspan>
          <tspan fill="#FBBF24">(task);</tspan>
        </text>
        <text x="0" y="52" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">2  </tspan>
          <tspan fill="#38BDF8">const </tspan>
          <tspan fill="#FFFFFF">diff </tspan>
          <tspan fill="#94A3B8">= </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#A855F7">coder.patch</tspan>
          <tspan fill="#FBBF24">(context);</tspan>
        </text>
        <text x="0" y="104" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">3  </tspan>
          <tspan fill="#38BDF8">const </tspan>
          <tspan fill="#FFFFFF">build </tspan>
          <tspan fill="#94A3B8">= </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#00F5D4">compiler.check</tspan>
          <tspan fill="#FBBF24">(diff);</tspan>
        </text>
        <text x="0" y="156" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">4  </tspan>
          <tspan fill="#F43F5E">if </tspan>
          <tspan fill="#CBD5E1">(!build.ok) </tspan>
          <tspan fill="#38BDF8">await </tspan>
          <tspan fill="#F59E0B">healer.resolve</tspan>
          <tspan fill="#FBBF24">(build.err);</tspan>
        </text>
        <text x="0" y="208" font-family="'Fira Code', 'JetBrains Mono', Consolas, monospace" font-size="24" font-weight="700">
          <tspan fill="#64748B">5  </tspan>
          <tspan fill="#38BDF8">return </tspan>
          <tspan fill="#10B981">build.verifiedResult;</tspan>
        </text>
      </g>

      <!-- Bottom Status Pill -->
      <rect x="24" y="415" width="832" height="50" rx="12" fill="#0A221C"/>
      <text x="440" y="447" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="#00F5D4" text-anchor="middle">⚡ Zero Silent Regressions • 100% Compiler Verified Code</text>
    </g>

    <text x="540" y="990" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Slide: Horizontal Bar Chart
 */
function renderBarChartSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
  const lines = wrapHeadline(slide.headline || 'The Benchmark');
  const quote = escapeXml(slide.takeawayQuote || '');
  const bars = slide.chartData || [];

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(pageNum, totalSlides)}

    ${renderHeadlineSvg(lines, slide.subheadline || '')}

    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="880" height="600" rx="22" fill="url(#cardBg)" stroke="#1E293B" stroke-width="2"/>
      ${bars
        .slice(0, 5)
        .map((b, idx) => {
          const y = 45 + idx * 105;
          const isHigh = b.isHighlight;
          const barColor = isHigh ? '#00F5D4' : '#38BDF8';
          const barW = Math.max(30, Math.round((b.pct / 100) * 440));
          return `
          <g transform="translate(40, ${y})">
            <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="${isHigh ? '800' : '600'}" fill="#FFFFFF">${escapeXml(b.name)}</text>
            <rect x="280" y="10" width="440" height="28" rx="14" fill="#0A1326"/>
            <rect x="280" y="10" width="${barW}" height="28" rx="14" fill="${barColor}"/>
            <text x="745" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="${barColor}">${b.pct}%</text>
          </g>
          `;
        })
        .join('')}
    </g>

    ${quote ? `<text x="540" y="1030" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>` : ''}
    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Slide: Vertical Column Chart (Dynamically sized for 3, 4, or 5 columns)
 */
function renderColumnChartSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
  const lines = wrapHeadline(slide.headline || 'Key Breakdown');
  const quote = escapeXml(slide.takeawayQuote || '');
  const cols = slide.columnData || [];

  const count = Math.max(1, cols.length);
  const spacing = Math.round(840 / count);
  const colWidth = count >= 5 ? 100 : 130;
  const startX = Math.round((880 - (count * spacing)) / 2) + Math.round((spacing - colWidth) / 2);

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(pageNum, totalSlides)}

    ${renderHeadlineSvg(lines, slide.subheadline || '')}

    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="880" height="600" rx="22" fill="url(#cardBg)" stroke="#1E293B" stroke-width="2"/>
      ${cols
        .map((c, idx) => {
          const x = startX + idx * spacing;
          const isHigh = c.isHighlight;
          const barColor = isHigh ? '#00F5D4' : '#38BDF8';
          const maxH = 280;
          const colH = Math.max(35, Math.round((c.pct / 45) * maxH));
          const barY = 420 - colH;
          return `
          <g transform="translate(${x}, 0)">
            <!-- Column Track -->
            <rect x="${(colWidth - 60) / 2}" y="140" width="60" height="280" rx="14" fill="#0A1326" stroke="#1E293B" stroke-width="1"/>
            <!-- Active Fill -->
            <rect x="${(colWidth - 60) / 2}" y="${barY}" width="60" height="${colH}" rx="14" fill="${barColor}"/>
            <!-- Top Percentage (Drawn on top, above track) -->
            <text x="${colWidth / 2}" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="${barColor}" text-anchor="middle">${c.pct}%</text>
            <!-- Bottom Label -->
            <text x="${colWidth / 2}" y="470" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">${escapeXml(c.label)}</text>
            ${c.sub ? `<text x="${colWidth / 2}" y="498" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="400" fill="#94A3B8" text-anchor="middle">${escapeXml(c.sub)}</text>` : ''}
          </g>
          `;
        })
        .join('')}
    </g>

    ${quote ? `<text x="540" y="1030" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>` : ''}
    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Slide: Architectural Diagram Stage
 */
function renderDiagramSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
  const lines = wrapHeadline(slide.headline || 'System Architecture');
  const quote = escapeXml(slide.takeawayQuote || '');
  const diag = slide.diagramData;
  const leftTasks = diag?.leftTasks || ['Input Streams', 'AST Parsing', 'Schema Validation'];
  const rightOutcomes = diag?.rightOutcomes || ['Compiler Feedback', 'Automated Verification', 'Safe Dispatch'];

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(pageNum, totalSlides)}

    ${renderHeadlineSvg(lines, slide.subheadline || 'Visual architectural workflow and division of responsibility.')}

    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="880" height="600" rx="22" fill="url(#cardBg)" stroke="#1E293B" stroke-width="2"/>

      <!-- Left Stage: Inputs -->
      <g transform="translate(35, 45)">
        <rect x="0" y="0" width="230" height="510" rx="16" fill="#0A1326" stroke="#1E293B" stroke-width="1.5"/>
        <text x="115" y="42" font-family="-apple-system, sans-serif" font-size="15" font-weight="900" fill="#38BDF8" text-anchor="middle" letter-spacing="1">TASKS // INPUTS</text>
        ${leftTasks.slice(0, 4).map((t, idx) => `
          <g transform="translate(15, ${65 + idx * 105})">
            <rect x="0" y="0" width="200" height="85" rx="12" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5"/>
            <text x="12" y="48" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">${escapeXml(t)}</text>
          </g>
        `).join('')}
      </g>

      <!-- Center Stage: Core Processor / Swarm -->
      <g transform="translate(295, 140)">
        <rect x="0" y="0" width="290" height="320" rx="20" fill="#091E2A" stroke="#00F5D4" stroke-width="2.5"/>
        <circle cx="145" cy="80" r="42" fill="#042F2E" stroke="#00F5D4" stroke-width="2"/>
        <text x="145" y="90" font-family="-apple-system, sans-serif" font-size="28" font-weight="900" fill="#00F5D4" text-anchor="middle">⚡</text>
        <text x="145" y="160" font-family="-apple-system, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">AGENT SWARM</text>
        <text x="145" y="195" font-family="-apple-system, sans-serif" font-size="16" font-weight="600" fill="#00F5D4" text-anchor="middle">Compiler Verified</text>
        <rect x="40" y="235" width="210" height="42" rx="21" fill="#042F2E" stroke="#00F5D4" stroke-width="1"/>
        <text x="145" y="261" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Zero Hallucinations</text>
      </g>

      <!-- Right Stage: Outcomes -->
      <g transform="translate(615, 45)">
        <rect x="0" y="0" width="230" height="510" rx="16" fill="#0A1326" stroke="#1E293B" stroke-width="1.5"/>
        <text x="115" y="42" font-family="-apple-system, sans-serif" font-size="15" font-weight="900" fill="#10B981" text-anchor="middle" letter-spacing="1">SYSTEM OUTCOMES</text>
        ${rightOutcomes.slice(0, 4).map((o, idx) => `
          <g transform="translate(15, ${65 + idx * 105})">
            <rect x="0" y="0" width="200" height="85" rx="12" fill="#0F172A" stroke="#10B981" stroke-width="1.5"/>
            <text x="12" y="48" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">${escapeXml(o)}</text>
          </g>
        `).join('')}
      </g>
    </g>

    ${quote ? `<text x="540" y="1030" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>` : ''}
    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Standard Multi-Card Slide (Supports 2, 3, or 4 points, 100% unique, zero duplicates)
 */
function renderCardListSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
  const lines = wrapHeadline(slide.headline || 'System Breakdown');
  const quote = escapeXml(slide.takeawayQuote || 'Reliability is built through explicit boundaries.');

  const rawItems: Array<{ title: string; desc: string }> = [];

  if (slide.points && slide.points.length > 0) {
    slide.points.forEach((p, pIdx) => {
      const parts = p.split(/:\s*|\s*-\s*|\s*—\s*/);
      if (parts.length > 1 && parts[0].length < 40) {
        rawItems.push({ title: parts[0].trim(), desc: parts.slice(1).join(' ').trim() });
      } else {
        const fallbackTitles = ['Architectural Foundation', 'Execution Mechanic', 'Deterministic Invariant', 'Operational Boundary'];
        rawItems.push({ title: fallbackTitles[pIdx % fallbackTitles.length], desc: p.trim() });
      }
    });
  } else if (slide.cardContent?.bodyLines && slide.cardContent.bodyLines.length > 0) {
    slide.cardContent.bodyLines.forEach((line, lIdx) => {
      const parts = line.split(/:\s*|\s*-\s*|\s*—\s*/);
      if (parts.length > 1 && parts[0].length < 40) {
        rawItems.push({ title: parts[0].trim(), desc: parts.slice(1).join(' ').trim() });
      } else {
        const fallbackTitles = ['Core Protocol', 'Runtime Invariant', 'Scale Multiplier', 'Defensive Boundary'];
        rawItems.push({ title: fallbackTitles[lIdx % fallbackTitles.length], desc: line.trim() });
      }
    });
  }

  // Fallback defaults if empty (never duplicate)
  if (rawItems.length === 0) {
    rawItems.push(
      { title: 'Deterministic Boundary Gates', desc: 'Isolate sensitive operations behind strict compile-time verification layers.' },
      { title: 'Zero-Allocation Invariants', desc: 'Prevent invalid domain states without incurring runtime memory allocation overhead.' },
      { title: 'Closed-Loop Self-Healing', desc: 'Pipe compiler diagnostics back into automated remediation workflows before deployment.' }
    );
  }

  // De-duplicate any identical titles
  const seenTitles = new Set<string>();
  rawItems.forEach((item, idx) => {
    if (seenTitles.has(item.title)) {
      const stepNames = ['Protocol Phase', 'Execution Vector', 'Resilience Layer', 'System Boundary'];
      item.title = `${stepNames[idx % stepNames.length]} 0${idx + 1}`;
    }
    seenTitles.add(item.title);
  });

  const items = rawItems.slice(0, 4);
  const colors = ['#00F5D4', '#38BDF8', '#A855F7', '#F59E0B'];
  const bgRings = ['#072024', '#0B1C30', '#200E30', '#2E1C0A'];

  const cardCount = items.length;
  const cardHeight = cardCount === 4 ? 135 : 160;
  const cardGap = cardCount === 4 ? 18 : 24;

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}
    ${renderPageBadge(pageNum, totalSlides)}

    ${renderHeadlineSvg(lines, slide.subheadline || 'Key architectural paradigms & mechanics.')}

    <g transform="translate(100, 330)" filter="url(#cardShadow)">
      ${items
        .map((item, idx) => {
          const y = idx * (cardHeight + cardGap);
          const color = colors[idx % colors.length];
          const ringBg = bgRings[idx % bgRings.length];
          const numStr = `0${idx + 1}`;
          const cy = cardHeight / 2;

          return `
          <g transform="translate(0, ${y})">
            <rect x="0" y="0" width="880" height="${cardHeight}" rx="18" fill="url(#cardBg)" stroke="${color}" stroke-width="2"/>
            <circle cx="70" cy="${cy}" r="32" fill="${ringBg}" stroke="${color}" stroke-width="2"/>
            <text x="70" y="${cy + 8}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="${color}" text-anchor="middle">${numStr}</text>
            <text x="135" y="${cardHeight === 135 ? '50' : '58'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">${escapeXml(item.title)}</text>
            <text x="135" y="${cardHeight === 135 ? '92' : '102'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#E2E8F0">${escapeXml(item.desc)}</text>
          </g>
          `;
        })
        .join('')}
    </g>

    <text x="540" y="${cardCount === 4 ? '1040' : '1030'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Slide 8: Outro & Syed Adil Ali Studio Profile
 */
function renderOutroSvg(slide: CarouselSlide, avatarBase64: string): string {
  const headline = escapeXml(slide.headline || 'Found this breakdown valuable?');
  const subheadline = escapeXml(slide.subheadline || 'Save this cheat sheet and follow for weekly production architectures.');

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}

    <!-- Header & Subtitle -->
    <text x="540" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${headline}</text>
    <text x="540" y="200" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">${subheadline}</text>

    <!-- Big Center Brand -->
    <g transform="translate(540, 335)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">Pak-o-Drive</text>
      <text x="0" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="58" font-weight="900" fill="#38BDF8" text-anchor="middle" letter-spacing="-1">AI Studio</text>
    </g>

    <!-- 3 Question Pills (Slobodan Exact Standard) -->
    <g transform="translate(540, 475)">
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

    <!-- Authentic Studio Circular Avatar (Syed Adil Ali) - Slobodan Exact Standard -->
    <g filter="url(#cardShadow)">
      <circle cx="540" cy="855" r="77" fill="#0B132B" stroke="#00F5D4" stroke-width="4"/>
      ${avatarBase64 ? `<image href="${avatarBase64}" x="465" y="780" width="150" height="150" clip-path="url(#avatarCircleClip)" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="540" cy="855" r="75" fill="#1E293B"/>`}
    </g>

    <!-- Author Name & Title -->
    <text x="540" y="975" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">Syed Adil Ali</text>
    <text x="540" y="1015" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="#00F5D4" text-anchor="middle">Senior Full-Stack &amp; AI Systems Architect</text>
    <text x="540" y="1050" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">Building high-performance production web &amp; autonomous agent architectures.</text>

    ${renderBottomBar('Follow for more insights')}
  </svg>
  `;
}

/**
 * High-performance 4:5 Vertical Portrait PDF Carousel Renderer
 * Matches Slobodan Gajić dark cyber aesthetics, rich infographics & personal authority branding.
 */
export async function renderSlobodanCarouselPdf(
  deck: CarouselDeck,
  customCoverGraphic?: Buffer | null
): Promise<Buffer> {
  const totalSlides = deck.slides.length;

  // Resolve cover image base64
  let coverBase64 = '';
  if (customCoverGraphic && customCoverGraphic.length > 1000) {
    coverBase64 = `data:image/jpeg;base64,${customCoverGraphic.toString('base64')}`;
  } else {
    coverBase64 =
      toBase64Image('public/img/agentic-ai-cover.jpg') ||
      toBase64Image('public/active-post-graphic.jpg');
    if (!coverBase64) {
      const topicBuf = getTopicImage(deck.topic);
      if (topicBuf && topicBuf.length > 1000) {
        coverBase64 = `data:image/jpeg;base64,${topicBuf.toString('base64')}`;
      }
    }
  }

  // Resolve avatar base64
  const avatarBase64 = toBase64Image('public/img/avatar.jpg');

  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < totalSlides; i++) {
    const rawSlide = deck.slides[i];
    const isFirst = i === 0 || rawSlide.isCover;
    const isLast = i === totalSlides - 1 || rawSlide.isSummary;
    const pageNum = i + 1;

    let svgContent = '';

    if (isFirst || rawSlide.slideType === 'cover') {
      svgContent = renderCoverSvg(rawSlide, coverBase64);
    } else if (isLast || rawSlide.slideType === 'outro') {
      svgContent = renderOutroSvg(rawSlide, avatarBase64);
    } else if (rawSlide.slideType === 'code_terminal' || rawSlide.codeSnippet) {
      svgContent = renderCodeSvg(rawSlide, pageNum, totalSlides);
    } else if (
      rawSlide.chartData &&
      rawSlide.chartData.length > 0 &&
      rawSlide.slideType === 'bar_chart'
    ) {
      svgContent = renderBarChartSvg(rawSlide, pageNum, totalSlides);
    } else if (
      rawSlide.columnData &&
      rawSlide.columnData.length > 0 &&
      rawSlide.slideType === 'column_chart'
    ) {
      svgContent = renderColumnChartSvg(rawSlide, pageNum, totalSlides);
    } else if (
      rawSlide.diagramData &&
      rawSlide.slideType === 'diagram'
    ) {
      svgContent = renderDiagramSvg(rawSlide, pageNum, totalSlides);
    } else {
      svgContent = renderCardListSvg(rawSlide, pageNum, totalSlides);
    }

    // Convert SVG to ultra-crisp JPEG Buffer via Sharp
    const jpgBuffer = await sharp(Buffer.from(svgContent)).jpeg({ quality: 95 }).toBuffer();

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
  return Buffer.from(pdfBytes);
}
