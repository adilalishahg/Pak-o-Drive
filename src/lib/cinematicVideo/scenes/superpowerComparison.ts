import { VIDEO_CONFIG, DEFAULT_PRESENTER } from '../constants';
import { CinematicScene, DeepDiveToolScript } from '../types';
import { escapeXml, wrapText, renderTopHeader } from './common';

/**
 * Scene 4: Superpower Comparison (Before vs After) Frame
 */
export function renderScene4SuperpowerComparison(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  presenterBase64: string
): string {
  const points = scene.comparisonPoints || script.withoutVsWith || [
    { withoutTool: '3 Days writing boilerplate React & CSS', withTool: 'Done in 45 seconds with 1 natural prompt' },
    { withoutTool: 'Debugging deployment & Docker containers', withTool: 'Instant live URL with zero cloud setup' },
  ];
  const titleLines = wrapText(scene.title, 24, 2);
  const spokenLines = wrapText(scene.spokenScript, 44, 2);

  const p1Without = wrapText(points[0]?.withoutTool || 'Tedious boilerplate manual code', 36, 2);
  const p2Without = wrapText(points[1]?.withoutTool || 'Slow manual server configuration', 36, 2);

  const p1With = wrapText(points[0]?.withTool || 'Live functional app in 45 seconds', 36, 2);
  const p2With = wrapText(points[1]?.withTool || 'Production live URL ready to share immediately', 36, 2);

  return `
  <svg width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" viewBox="0 0 ${VIDEO_CONFIG.width} ${VIDEO_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="compGlow" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="#1E1B4B" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#070913" stop-opacity="1"/>
      </radialGradient>
      <clipPath id="avatarMiniComp">
        <circle cx="150" cy="1720" r="50"/>
      </clipPath>
    </defs>

    <rect width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" fill="url(#compGlow)"/>
    
    <!-- Top Header -->
    ${renderTopHeader(scene.badgeText, script.category)}

    <!-- Scene Headline -->
    <g transform="translate(80, 205)">
      <text x="460" y="30" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" letter-spacing="3">THE REAL DIFFERENCE</text>
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

    <!-- Comparison Cards Container -->
    <g transform="translate(70, 390)">
      <!-- Card 1: WITHOUT THIS TOOL -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="940" height="430" rx="28" fill="rgba(239, 68, 68, 0.08)" stroke="#EF4444" stroke-width="2.5"/>
        
        <rect x="40" y="32" width="300" height="48" rx="24" fill="#EF4444"/>
        <text x="190" y="64" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900">❌ THE OLD PAINFUL WAY</text>

        <!-- Pain Point 1 -->
        <g transform="translate(40, 115)">
          <circle cx="20" cy="20" r="14" fill="#EF4444" opacity="0.2"/>
          <text x="20" y="27" text-anchor="middle" fill="#EF4444" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">✕</text>
          ${p1Without
            .map(
              (l, i) => `
            <text x="55" y="${25 + i * 32}" fill="#FCA5A5" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="600">${escapeXml(l)}</text>
          `
            )
            .join('')}
        </g>

        <!-- Pain Point 2 -->
        <g transform="translate(40, 225)">
          <circle cx="20" cy="20" r="14" fill="#EF4444" opacity="0.2"/>
          <text x="20" y="27" text-anchor="middle" fill="#EF4444" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">✕</text>
          ${p2Without
            .map(
              (l, i) => `
            <text x="55" y="${25 + i * 32}" fill="#FCA5A5" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="600">${escapeXml(l)}</text>
          `
            )
            .join('')}
        </g>

        <rect x="40" y="340" width="860" height="50" rx="12" fill="rgba(239, 68, 68, 0.12)"/>
        <text x="470" y="373" text-anchor="middle" fill="#F87171" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">Average Time: 3 to 5 Days • High Stress</text>
      </g>

      <!-- Card 2: WITH THIS TOOL -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="940" height="490" rx="28" fill="rgba(0, 245, 212, 0.08)" stroke="#00F5D4" stroke-width="3"/>
        
        <rect x="40" y="32" width="360" height="48" rx="24" fill="#00F5D4"/>
        <text x="220" y="64" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900">✨ WITH ${escapeXml(script.toolName.toUpperCase().slice(0, 16))}</text>

        <!-- Win Point 1 -->
        <g transform="translate(40, 115)">
          <circle cx="20" cy="20" r="14" fill="#00F5D4" opacity="0.2"/>
          <text x="20" y="27" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">✓</text>
          ${p1With
            .map(
              (l, i) => `
            <text x="55" y="${25 + i * 32}" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700">${escapeXml(l)}</text>
          `
            )
            .join('')}
        </g>

        <!-- Win Point 2 -->
        <g transform="translate(40, 225)">
          <circle cx="20" cy="20" r="14" fill="#00F5D4" opacity="0.2"/>
          <text x="20" y="27" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">✓</text>
          ${p2With
            .map(
              (l, i) => `
            <text x="55" y="${25 + i * 32}" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700">${escapeXml(l)}</text>
          `
            )
            .join('')}
        </g>

        <!-- Highlight Pill -->
        <g transform="translate(40, 335)">
          <rect x="0" y="0" width="860" height="115" rx="20" fill="#0F172A" stroke="#00F5D4" stroke-width="2"/>
          <text x="430" y="48" text-anchor="middle" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">SUPERPOWER UNLOCKED</text>
          <text x="430" y="90" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900">Speed Boost: 10x • Stress: Zero</text>
        </g>
      </g>
    </g>

    <!-- Presenter Mini Circle Bottom -->
    <g transform="translate(0, 0)">
      <circle cx="150" cy="1720" r="54" fill="none" stroke="#00F5D4" stroke-width="4"/>
      ${
        presenterBase64
          ? `<image href="${presenterBase64}" x="100" y="1670" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarMiniComp)"/>`
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
