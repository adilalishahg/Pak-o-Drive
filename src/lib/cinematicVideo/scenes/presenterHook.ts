import { VIDEO_CONFIG, DEFAULT_PRESENTER } from '../constants';
import { CinematicScene, DeepDiveToolScript } from '../types';
import { escapeXml, wrapText, renderTopHeader } from './common';

/**
 * Scene 1: Presenter Hero Hook Frame
 */
export function renderScene1PresenterHook(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  presenterBase64: string
): string {
  const titleLines = wrapText(scene.title, 22, 2);
  const spokenLines = wrapText(scene.spokenScript, 42, 2);

  return `
  <svg width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" viewBox="0 0 ${VIDEO_CONFIG.width} ${VIDEO_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="heroGlow" cx="50%" cy="36%" r="60%">
        <stop offset="0%" stop-color="#0F2B48" stop-opacity="0.85"/>
        <stop offset="60%" stop-color="#070913" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#030408" stop-opacity="1"/>
      </radialGradient>
      
      <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="24" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      
      <clipPath id="avatarCircle">
        <circle cx="540" cy="560" r="210"/>
      </clipPath>
    </defs>

    <!-- Canvas Background -->
    <rect width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" fill="url(#heroGlow)"/>
    
    <!-- Top Header -->
    ${renderTopHeader(scene.badgeText, script.category)}

    <!-- Presenter HUD Rings -->
    <circle cx="540" cy="560" r="235" fill="none" stroke="#00F5D4" stroke-width="3" stroke-dasharray="16 10" opacity="0.8"/>
    <circle cx="540" cy="560" r="255" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.5"/>
    <circle cx="540" cy="560" r="220" fill="none" stroke="#00F5D4" stroke-width="5" filter="url(#glowEffect)"/>

    <!-- Presenter Avatar Image -->
    ${
      presenterBase64
        ? `<image href="${presenterBase64}" x="330" y="350" width="420" height="420" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarCircle)"/>`
        : `<circle cx="540" cy="560" r="210" fill="#1E293B"/>`
    }

    <!-- Presenter Name & Role Capsule -->
    <g transform="translate(340, 805)">
      <rect x="0" y="0" width="400" height="54" rx="27" fill="rgba(15, 23, 42, 0.95)" stroke="#00F5D4" stroke-width="2" />
      <circle cx="30" cy="27" r="7" fill="#10B981" />
      <text x="52" y="34" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800">${DEFAULT_PRESENTER.name}</text>
      <text x="195" y="34" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600">| Live AI Host</text>
    </g>

    <!-- Main Dramatic Catchphrase (Properly wrapped to prevent overflow) -->
    <g transform="translate(80, 920)">
      ${titleLines
        .map(
          (line, idx) => `
        <text x="460" y="${idx * 56}" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="-0.5">
          ${escapeXml(line)}
        </text>
      `
        )
        .join('')}

      <text x="460" y="${titleLines.length * 56 + 50}" text-anchor="middle" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="800">
        ${escapeXml(script.toolName)}
      </text>
      <text x="460" y="${titleLines.length * 56 + 105}" text-anchor="middle" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="500">
        ${escapeXml(scene.subtitle)}
      </text>
    </g>

    <!-- Spoken Caption Bubble with Waveform -->
    <g transform="translate(80, 1340)">
      <rect x="0" y="0" width="920" height="250" rx="28" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      
      <!-- Audio Waveform Visualizer -->
      <g transform="translate(50, 42)">
        <rect x="0" y="12" width="6" height="24" rx="3" fill="#00F5D4"/>
        <rect x="14" y="4" width="6" height="40" rx="3" fill="#00F5D4"/>
        <rect x="28" y="0" width="6" height="48" rx="3" fill="#38BDF8"/>
        <rect x="42" y="8" width="6" height="32" rx="3" fill="#00F5D4"/>
        <rect x="56" y="16" width="6" height="16" rx="3" fill="#00F5D4"/>
        <text x="80" y="32" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">AI VOICE STREAMING</text>
      </g>

      <!-- Subtitle Text (Wrapped across multiple lines) -->
      ${spokenLines
        .map(
          (line, idx) => `
        <text x="50" y="${120 + idx * 42}" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700">
          ${idx === 0 ? '&quot;' : ''}${escapeXml(line)}${idx === spokenLines.length - 1 ? '...&quot;' : ''}
        </text>
      `
        )
        .join('')}

      <text x="50" y="215" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700">
        ⚡ ${escapeXml(script.tagline)}
      </text>
    </g>

    <!-- Bottom Audio Pulse Bar -->
    <rect x="180" y="1810" width="720" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
    <rect x="180" y="1810" width="340" height="8" rx="4" fill="#00F5D4"/>
  </svg>
  `;
}
