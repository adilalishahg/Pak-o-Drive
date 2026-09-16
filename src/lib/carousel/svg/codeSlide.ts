import type { CarouselSlide } from '../types';
import {
  WIDTH,
  HEIGHT,
  escapeXml,
  wrapHeadline,
  renderHeadlineSvg,
  getBaseSvgHeader,
  renderBackground,
  renderPageBadge,
  renderBottomBar,
} from './common';

/**
 * Slide: Slobodan Code Window
 */
export function renderCodeSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
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
        <text x="15" y="20" font-family="'Inter', sans-serif" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">TS</text>
        <text x="42" y="20" font-family="'Fira Code', monospace" font-size="19" font-weight="700" fill="#E2E8F0">agentic_executor.ts</text>
      </g>

      <!-- Window Controls on Right (Vector Minimize, Maximize, Close) -->
      <g transform="translate(780, 24)">
        <line x1="0" y1="8" x2="14" y2="8" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
        <rect x="26" y="1" width="12" height="12" rx="2" fill="none" stroke="#64748B" stroke-width="1.8"/>
        <path d="M 54 1 L 66 13 M 66 1 L 54 13" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
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
      <g transform="translate(195, 426)">
        <polygon points="8,4 2,16 9,16 5,26 18,12 11,12" fill="#00F5D4"/>
        <text x="26" y="21" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="#00F5D4">Zero Silent Regressions • 100% Compiler Verified Code</text>
      </g>
    </g>

    <text x="540" y="990" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}
