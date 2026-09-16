import type { CarouselSlide } from '../types';
import {
  WIDTH,
  HEIGHT,
  escapeXml,
  wrapHeadline,
  wrapSvgTextLines,
  renderHeadlineSvg,
  getBaseSvgHeader,
  renderBackground,
  renderPageBadge,
  renderBottomBar,
} from './common';

/**
 * Slide: Architectural Diagram Stage
 */
export function renderDiagramSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
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
        <text x="115" y="42" font-family="'Inter', sans-serif" font-size="15" font-weight="900" fill="#38BDF8" text-anchor="middle" letter-spacing="1">TASKS // INPUTS</text>
        ${leftTasks.slice(0, 4).map((t, idx) => {
          const tLines = wrapSvgTextLines(t, 18, 2);
          return `
          <g transform="translate(15, ${65 + idx * 105})">
            <rect x="0" y="0" width="200" height="85" rx="12" fill="#0F172A" stroke="#38BDF8" stroke-width="1.5"/>
            ${
              tLines.length > 1
                ? `
                <text x="14" y="38" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${escapeXml(tLines[0])}</text>
                <text x="14" y="58" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${escapeXml(tLines[1])}</text>
                `
                : `<text x="14" y="48" font-family="'Inter', sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">${escapeXml(tLines[0] || '')}</text>`
            }
          </g>
          `;
        }).join('')}
      </g>

      <!-- Center Stage: Core Processor / Swarm -->
      <g transform="translate(295, 140)">
        <rect x="0" y="0" width="290" height="320" rx="20" fill="#091E2A" stroke="#00F5D4" stroke-width="2.5"/>
        <circle cx="145" cy="80" r="42" fill="#042F2E" stroke="#00F5D4" stroke-width="2"/>
        <polygon points="145,63 134,83 143,83 137,99 156,79 146,79" fill="#00F5D4"/>
        <text x="145" y="160" font-family="'Inter', sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">AGENT SWARM</text>
        <text x="145" y="195" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#00F5D4" text-anchor="middle">Compiler Verified</text>
        <rect x="40" y="235" width="210" height="42" rx="21" fill="#042F2E" stroke="#00F5D4" stroke-width="1"/>
        <text x="145" y="261" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Zero Hallucinations</text>
      </g>

      <!-- Right Stage: Outcomes -->
      <g transform="translate(615, 45)">
        <rect x="0" y="0" width="230" height="510" rx="16" fill="#0A1326" stroke="#1E293B" stroke-width="1.5"/>
        <text x="115" y="42" font-family="'Inter', sans-serif" font-size="15" font-weight="900" fill="#10B981" text-anchor="middle" letter-spacing="1">SYSTEM OUTCOMES</text>
        ${rightOutcomes.slice(0, 4).map((o, idx) => {
          const oLines = wrapSvgTextLines(o, 18, 2);
          return `
          <g transform="translate(15, ${65 + idx * 105})">
            <rect x="0" y="0" width="200" height="85" rx="12" fill="#0F172A" stroke="#10B981" stroke-width="1.5"/>
            ${
              oLines.length > 1
                ? `
                <text x="14" y="38" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${escapeXml(oLines[0])}</text>
                <text x="14" y="58" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${escapeXml(oLines[1])}</text>
                `
                : `<text x="14" y="48" font-family="'Inter', sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">${escapeXml(oLines[0] || '')}</text>`
            }
          </g>
          `;
        }).join('')}
      </g>
    </g>

    ${quote ? `<text x="540" y="1030" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>` : ''}
    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}
