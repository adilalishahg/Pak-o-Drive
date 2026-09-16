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
 * Slide: Horizontal Bar Chart
 */
export function renderBarChartSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
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
            <text x="0" y="32" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="${isHigh ? '800' : '600'}" fill="#FFFFFF">${escapeXml(b.name)}</text>
            <rect x="280" y="10" width="440" height="28" rx="14" fill="#0A1326"/>
            <rect x="280" y="10" width="${barW}" height="28" rx="14" fill="${barColor}"/>
            <text x="745" y="32" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="${barColor}">${b.pct}%</text>
          </g>
          `;
        })
        .join('')}
    </g>

    ${quote ? `<text x="540" y="1030" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>` : ''}
    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}

/**
 * Slide: Vertical Column Chart (Dynamically sized for 3, 4, or 5 columns)
 */
export function renderColumnChartSvg(slide: CarouselSlide, pageNum: number, totalSlides: number): string {
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
            <text x="${colWidth / 2}" y="112" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="${barColor}" text-anchor="middle">${c.pct}%</text>
            <!-- Bottom Label -->
            <text x="${colWidth / 2}" y="470" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">${escapeXml(c.label)}</text>
            ${c.sub ? `<text x="${colWidth / 2}" y="498" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="400" fill="#94A3B8" text-anchor="middle">${escapeXml(c.sub)}</text>` : ''}
          </g>
          `;
        })
        .join('')}
    </g>

    ${quote ? `<text x="540" y="1030" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600" fill="#F1F5F9" text-anchor="middle">${quote}</text>` : ''}
    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}
