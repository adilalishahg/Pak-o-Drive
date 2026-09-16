import { VIDEO_CONFIG, DEFAULT_PRESENTER } from '../constants';
import { CinematicScene, DeepDiveToolScript } from '../types';
import { escapeXml, wrapText, renderTopHeader } from './common';

/**
 * Scene 5: Presenter Outro Call-To-Action Frame
 */
export function renderScene5PresenterCTA(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  presenterBase64: string
): string {
  const ctaButton = scene.ctaButtonText || `COMMENT '${script.toolName.split(' ')[0].toUpperCase()}' BELOW`;
  const titleLines = wrapText(scene.title, 22, 2);
  const spokenLines = wrapText(scene.spokenScript, 44, 3);

  return `
  <svg width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" viewBox="0 0 ${VIDEO_CONFIG.width} ${VIDEO_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ctaGlow" cx="50%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#1E293B" stop-opacity="1"/>
        <stop offset="60%" stop-color="#070913" stop-opacity="1"/>
        <stop offset="100%" stop-color="#020306" stop-opacity="1"/>
      </radialGradient>
      <clipPath id="avatarCircleCta">
        <circle cx="540" cy="520" r="200"/>
      </clipPath>
    </defs>

    <rect width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" fill="url(#ctaGlow)"/>
    
    <!-- Top Header -->
    ${renderTopHeader(scene.badgeText, script.category)}

    <!-- Presenter Frame -->
    <circle cx="540" cy="520" r="220" fill="none" stroke="#00F5D4" stroke-width="4"/>
    <circle cx="540" cy="520" r="240" fill="none" stroke="#38BDF8" stroke-width="2" stroke-dasharray="12 8" opacity="0.6"/>
    
    ${
      presenterBase64
        ? `<image href="${presenterBase64}" x="340" y="320" width="400" height="400" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarCircleCta)"/>`
        : `<circle cx="540" cy="520" r="200" fill="#1E293B"/>`
    }

    <!-- Closing Punchline (Properly wrapped) -->
    <g transform="translate(80, 800)">
      ${titleLines
        .map(
          (line, idx) => `
        <text x="460" y="${idx * 52}" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="900" letter-spacing="-0.5">
          ${escapeXml(line)}
        </text>
      `
        )
        .join('')}

      <text x="460" y="${titleLines.length * 52 + 45}" text-anchor="middle" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="700">
        ${escapeXml(scene.subtitle)}
      </text>
    </g>

    <!-- High-Converting Action Card -->
    <g transform="translate(70, 1020)">
      <rect x="0" y="0" width="940" height="320" rx="32" fill="#0F172A" stroke="#00F5D4" stroke-width="3"/>
      
      <!-- Action Button -->
      <rect x="50" y="50" width="840" height="100" rx="50" fill="#00F5D4"/>
      <text x="470" y="112" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="1">
        👇 ${escapeXml(ctaButton.slice(0, 38))}
      </text>

      <text x="470" y="210" text-anchor="middle" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700">
        I will DM you the exact Prompt Guide + Templates
      </text>

      <text x="470" y="260" text-anchor="middle" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">
        Save this Reel &amp; Share with a Developer Friend!
      </text>
    </g>

    <!-- Presenter Spoken Subtitle Box (Wrapped across 3 lines cleanly) -->
    <g transform="translate(80, 1420)">
      <rect x="0" y="0" width="920" height="230" rx="24" fill="rgba(15, 23, 42, 0.95)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
      <text x="50" y="52" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800">${DEFAULT_PRESENTER.name}:</text>
      ${spokenLines
        .map(
          (line, idx) => `
        <text x="50" y="${98 + idx * 38}" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700">
          ${idx === 0 ? '&quot;' : ''}${escapeXml(line)}${idx === spokenLines.length - 1 ? '&quot;' : ''}
        </text>
      `
        )
        .join('')}
    </g>

    <!-- Bottom Account Brand -->
    <g transform="translate(540, 1780)">
      <text x="0" y="0" text-anchor="middle" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800">
        FOLLOW @pakodrive.official FOR DAILY AI REELS
      </text>
    </g>
  </svg>
  `;
}
