import type { CarouselSlide } from '../types';
import {
  WIDTH,
  HEIGHT,
  escapeXml,
  wrapHeadline,
  wrapSvgTextLines,
  getBaseSvgHeader,
  renderBackground,
  renderBottomBar,
} from './common';

/**
 * Slide 1: Cover Slide
 */
export function renderCoverSvg(slide: CarouselSlide, coverBase64: string): string {
  const rawHeadline = (slide.headline || 'Technical Masterclass').replace(/\n+/g, ' ');
  const lines = wrapHeadline(rawHeadline, 24);
  const subLines = wrapSvgTextLines(slide.subheadline || 'Architecture & Engineering Deep Dive', 55, 2);

  const isThreeLines = lines.length >= 3;
  const isTwoLines = lines.length === 2;
  const startY = isThreeLines ? 115 : isTwoLines ? 140 : 175;
  const fontSize = isThreeLines ? 40 : isTwoLines ? 48 : 52;
  const lineGap = isThreeLines ? 46 : 54;
  const subStartY = startY + (lines.length - 1) * lineGap + 46;

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}

    <!-- Centered Header -->
    ${lines
      .map(
        (line, idx) => `
      <text x="540" y="${startY + idx * lineGap}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(line)}</text>
    `
      )
      .join('')}
    
    <!-- Subheadline -->
    ${subLines
      .map(
        (sl, idx) => `
      <text x="540" y="${subStartY + idx * 26}" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0" text-anchor="middle">${escapeXml(sl)}</text>
    `
      )
      .join('')}

    <!-- 3D Hero Artwork -->
    <g filter="url(#cardShadow)">
      <rect x="150" y="320" width="780" height="770" rx="36" fill="#070B14" stroke="#1E293B" stroke-width="2"/>
      ${coverBase64 ? `<image href="${coverBase64}" x="150" y="320" width="780" height="770" clip-path="url(#heroCoverClip)" preserveAspectRatio="xMidYMid slice"/>` : ''}
    </g>

    <!-- Bottom URL Pill -->
    <g transform="translate(540, 1160)">
      <rect x="-160" y="0" width="320" height="48" rx="24" fill="#0B132B" stroke="#38BDF8" stroke-width="1.5"/>
      <text x="0" y="31" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle" letter-spacing="0.5">pakodrive.pk // tech-systems</text>
    </g>

    ${renderBottomBar('Subscribe for more')}
  </svg>
  `;
}
