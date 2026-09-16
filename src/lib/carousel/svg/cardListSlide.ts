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
 * Standard Multi-Card Slide (Supports 2, 3, or 4 points, 100% unique, zero duplicates)
 */
export function renderCardListSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
  const lines = wrapHeadline(slide.headline || 'System Breakdown');
  const quote = escapeXml(slide.takeawayQuote || 'Reliability is built through explicit boundaries.');

  const rawItems: Array<{ title: string; desc: string }> = [];

  if (slide.points && slide.points.length > 0) {
    slide.points.forEach((p, pIdx) => {
      const parts = p.split(/:\s+|\s+[—–]\s+|\s+-\s+/);
      if (parts.length > 1 && parts[0].length < 40) {
        rawItems.push({ title: parts[0].trim(), desc: parts.slice(1).join(' ').trim() });
      } else {
        const fallbackTitles = ['Architectural Foundation', 'Execution Mechanic', 'Deterministic Invariant', 'Operational Boundary'];
        rawItems.push({ title: fallbackTitles[pIdx % fallbackTitles.length], desc: p.trim() });
      }
    });
  } else if (slide.cardContent?.bodyLines && slide.cardContent.bodyLines.length > 0) {
    slide.cardContent.bodyLines.forEach((line, lIdx) => {
      const parts = line.split(/:\s+|\s+[—–]\s+|\s+-\s+/);
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

          const descLines = wrapSvgTextLines(item.desc, cardCount === 4 ? 52 : 58, 2);

          return `
          <g transform="translate(0, ${y})">
            <rect x="0" y="0" width="880" height="${cardHeight}" rx="18" fill="url(#cardBg)" stroke="${color}" stroke-width="2"/>
            <circle cx="70" cy="${cy}" r="32" fill="${ringBg}" stroke="${color}" stroke-width="2"/>
            <text x="70" y="${cy + 8}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="${color}" text-anchor="middle">${numStr}</text>
            <text x="135" y="${cardHeight === 135 ? '48' : '54'}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="800" fill="#FFFFFF">${escapeXml(item.title)}</text>
            ${
              descLines.length > 1
                ? `
                <text x="135" y="${cardHeight === 135 ? '82' : '90'}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${cardHeight === 135 ? '18' : '20'}" font-weight="400" fill="#E2E8F0">${escapeXml(descLines[0])}</text>
                <text x="135" y="${cardHeight === 135 ? '106' : '118'}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${cardHeight === 135 ? '18' : '20'}" font-weight="400" fill="#E2E8F0">${escapeXml(descLines[1])}</text>
                `
                : `
                <text x="135" y="${cardHeight === 135 ? '92' : '102'}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400" fill="#E2E8F0">${escapeXml(descLines[0] || '')}</text>
                `
            }
          </g>
          `;
        })
        .join('')}
    </g>

    <text x="540" y="${cardCount === 4 ? '1040' : '1030'}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}
