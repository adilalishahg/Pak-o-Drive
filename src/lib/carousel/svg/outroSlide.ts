import type { CarouselSlide } from '../types';
import {
  WIDTH,
  HEIGHT,
  escapeXml,
  getBaseSvgHeader,
  renderBackground,
  renderBottomBar,
} from './common';

/**
 * Slide 8: Outro & Syed Adil Ali Studio Profile
 */
export function renderOutroSvg(slide: CarouselSlide, avatarBase64: string): string {
  const headline = escapeXml(slide.headline || 'Found this breakdown valuable?');
  const subheadline = escapeXml(slide.subheadline || 'Save this cheat sheet and follow for weekly production architectures.');

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${getBaseSvgHeader()}
    ${renderBackground()}

    <!-- Header & Subtitle -->
    <text x="540" y="145" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${headline}</text>
    <text x="540" y="200" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" fill="#E2E8F0" text-anchor="middle">${subheadline}</text>

    <!-- Big Center Brand -->
    <g transform="translate(540, 335)">
      <text x="0" y="0" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">Pak-o-Drive</text>
      <text x="0" y="60" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="58" font-weight="900" fill="#38BDF8" text-anchor="middle" letter-spacing="-1">AI Studio</text>
    </g>

    <!-- 3 Question Pills (Slobodan Exact Standard) -->
    <g transform="translate(540, 475)">
      <rect x="-240" y="0" width="480" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="29" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#E2E8F0" text-anchor="middle">Why do monolithic prompts hallucinate?</text>

      <rect x="-250" y="58" width="500" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="87" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#E2E8F0" text-anchor="middle">How do compiler loops self-heal code?</text>

      <rect x="-260" y="116" width="520" height="46" rx="23" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="0" y="145" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#E2E8F0" text-anchor="middle">Where does AST context beat raw text?</text>
    </g>

    <!-- Dotted Curved Arrow Pointing to Profile -->
    <path d="M 280 610 Q 230 680 270 725" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="5,5"/>
    <polygon points="274,730 262,720 276,717" fill="#38BDF8"/>

    <!-- URL Pill -->
    <text x="540" y="700" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">pakodrive.pk // ai-systems</text>

    <!-- Social Badges (in, github, web, ig) -->
    <g transform="translate(540, 730)">
      <circle cx="-90" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="-90" y="24" font-family="'Inter', sans-serif" font-size="16" font-weight="900" fill="#38BDF8" text-anchor="middle">in</text>

      <circle cx="-30" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="-30" y="24" font-family="'Inter', sans-serif" font-size="14" font-weight="900" fill="#00F5D4" text-anchor="middle">git</text>

      <circle cx="30" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="30" y="24" font-family="'Inter', sans-serif" font-size="14" font-weight="900" fill="#A855F7" text-anchor="middle">web</text>

      <circle cx="90" cy="18" r="22" fill="#0B132B" stroke="#1E293B" stroke-width="1.5"/>
      <text x="90" y="24" font-family="'Inter', sans-serif" font-size="14" font-weight="900" fill="#F43F5E" text-anchor="middle">ig</text>
    </g>

    <!-- Authentic Studio Circular Avatar (Syed Adil Ali) - Slobodan Exact Standard -->
    <g filter="url(#cardShadow)">
      <circle cx="540" cy="855" r="77" fill="#0B132B" stroke="#00F5D4" stroke-width="4"/>
      ${avatarBase64 ? `<image href="${avatarBase64}" x="465" y="780" width="150" height="150" clip-path="url(#avatarCircleClip)" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="540" cy="855" r="75" fill="#1E293B"/>`}
    </g>

    <!-- Author Name & Title -->
    <text x="540" y="975" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">Syed Adil Ali</text>
    <text x="540" y="1015" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="#00F5D4" text-anchor="middle">Senior Full-Stack &amp; AI Systems Architect</text>
    <text x="540" y="1050" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94A3B8" text-anchor="middle">Building high-performance production web &amp; autonomous agent architectures.</text>

    ${renderBottomBar('Follow for more insights')}
  </svg>
  `;
}
