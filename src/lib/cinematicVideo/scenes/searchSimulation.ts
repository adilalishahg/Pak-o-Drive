import { VIDEO_CONFIG, DEFAULT_PRESENTER } from '../constants';
import { CinematicScene, DeepDiveToolScript } from '../types';
import { escapeXml, wrapText, renderTopHeader } from './common';

/**
 * Scene 2: Browser Search Simulation Frame
 */
export function renderScene2SearchSimulation(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  presenterBase64: string
): string {
  const query = scene.searchQuery || script.searchQuery || `${script.toolName} online`;
  const titleLines = wrapText(scene.title, 24, 2);
  const spokenLines = wrapText(scene.spokenScript, 44, 2);

  return `
  <svg width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" viewBox="0 0 ${VIDEO_CONFIG.width} ${VIDEO_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="searchGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#141E33" stop-opacity="1"/>
        <stop offset="100%" stop-color="#070913" stop-opacity="1"/>
      </radialGradient>
      <clipPath id="avatarMini">
        <circle cx="150" cy="1720" r="50"/>
      </clipPath>
    </defs>

    <rect width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" fill="url(#searchGlow)"/>
    
    <!-- Top Header -->
    ${renderTopHeader(scene.badgeText, script.category)}

    <!-- Scene Headline -->
    <g transform="translate(80, 210)">
      <text x="460" y="30" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" letter-spacing="3">STEP 1: THE SEARCH</text>
      ${titleLines
        .map(
          (line, idx) => `
        <text x="460" y="${85 + idx * 52}" text-anchor="middle" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900">
          ${escapeXml(line)}
        </text>
      `
        )
        .join('')}
    </g>

    <!-- Mock Modern Browser Window -->
    <g transform="translate(70, 390)">
      <rect x="0" y="0" width="940" height="1000" rx="32" fill="#0B1120" stroke="#1E293B" stroke-width="3"/>
      
      <!-- Window Title Bar -->
      <rect x="0" y="0" width="940" height="84" rx="32" fill="#0F172A"/>
      <circle cx="45" cy="42" r="11" fill="#EF4444"/>
      <circle cx="80" cy="42" r="11" fill="#F59E0B"/>
      <circle cx="115" cy="42" r="11" fill="#10B981"/>
      
      <!-- Browser Tab -->
      <rect x="170" y="18" width="340" height="54" rx="14" fill="#1E293B"/>
      <text x="200" y="52" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="600">🔍 Search: ${escapeXml(script.toolName.slice(0, 18))}</text>

      <!-- URL / Search Bar -->
      <g transform="translate(45, 120)">
        <rect x="0" y="0" width="850" height="80" rx="40" fill="#1E293B" stroke="#00F5D4" stroke-width="3"/>
        <text x="40" y="50" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="26">https://</text>
        <text x="135" y="50" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800">${escapeXml(query.slice(0, 36))}</text>
        <rect x="720" y="24" width="4" height="36" fill="#00F5D4" />
      </g>

      <!-- Search Results Area -->
      <g transform="translate(45, 250)">
        <rect x="0" y="0" width="850" height="250" rx="24" fill="rgba(0, 245, 212, 0.08)" stroke="#00F5D4" stroke-width="2"/>
        <rect x="30" y="30" width="110" height="34" rx="17" fill="#00F5D4"/>
        <text x="85" y="53" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900">OFFICIAL</text>
        <text x="160" y="54" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600">verified developer tool</text>
        
        <text x="30" y="120" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="800">${escapeXml(script.toolName)} — Official Engine</text>
        <text x="30" y="168" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500">${escapeXml(script.tagline.slice(0, 48))}</text>
        <text x="30" y="210" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">★ 4.9/5 Rating (50,000+ Active Builders)</text>
        
        <!-- Glowing Neon Cursor Clicking the Link -->
        <g transform="translate(680, 140)">
          <path d="M 0 0 L 28 65 L 14 62 L 6 82 L -8 76 L 0 56 L -16 52 Z" fill="#00F5D4" stroke="#070913" stroke-width="4"/>
          <circle cx="0" cy="0" r="30" fill="none" stroke="#00F5D4" stroke-width="3" opacity="0.6"/>
          <rect x="35" y="-10" width="84" height="36" rx="18" fill="#00F5D4"/>
          <text x="77" y="14" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900">CLICK</text>
        </g>
      </g>

      <!-- Secondary Mock Results -->
      <g transform="translate(45, 535)">
        <rect x="0" y="0" width="850" height="145" rx="20" fill="#131C31" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
        <text x="30" y="55" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700">Documentation &amp; Quickstart Guide</text>
        <text x="30" y="98" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="20">Get started in 30 seconds with instant templates...</text>
      </g>

      <g transform="translate(45, 715)">
        <rect x="0" y="0" width="850" height="145" rx="20" fill="#131C31" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
        <text x="30" y="55" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700">GitHub Community &amp; Architecture</text>
        <text x="30" y="98" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="20">10,000+ Stars • Open source integrations...</text>
      </g>
    </g>

    <!-- Presenter Mini Circle Bottom -->
    <g transform="translate(0, 0)">
      <circle cx="150" cy="1720" r="54" fill="none" stroke="#00F5D4" stroke-width="4"/>
      ${
        presenterBase64
          ? `<image href="${presenterBase64}" x="100" y="1670" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarMini)"/>`
          : `<circle cx="150" cy="1720" r="50" fill="#1E293B"/>`
      }
      <g transform="translate(225, 1665)">
        <rect x="0" y="0" width="775" height="110" rx="20" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
        <text x="25" y="36" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800">${DEFAULT_PRESENTER.name}:</text>
        ${spokenLines
          .map(
            (line, idx) => `
          <text x="25" y="${68 + idx * 28}" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600">
            ${escapeXml(line)}
          </text>
        `
          )
          .join('')}
      </g>
    </g>
  </svg>
  `;
}
