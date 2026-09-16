import { VIDEO_CONFIG, DEFAULT_PRESENTER } from '../constants';
import { CinematicScene, DeepDiveToolScript } from '../types';
import { escapeXml, wrapText, renderTopHeader } from './common';

/**
 * Scene 3: Interactive Dashboard Live Hover Frame
 */
export function renderScene3DashboardInteractive(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  presenterBase64: string
): string {
  const featureName = scene.hoverFeatureName || 'AI Component Synthesizer';
  const featureDesc = scene.hoverFeatureDescription || 'Compiles complex wireframe prompts into real production code.';
  const titleLines = wrapText(scene.title, 24, 2);
  const descLines = wrapText(featureDesc, 38, 2);
  const spokenLines = wrapText(scene.spokenScript, 44, 2);

  return `
  <svg width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" viewBox="0 0 ${VIDEO_CONFIG.width} ${VIDEO_CONFIG.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="dashGlow" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#0E2138" stop-opacity="1"/>
        <stop offset="100%" stop-color="#04060B" stop-opacity="1"/>
      </radialGradient>
      <clipPath id="avatarMiniDash">
        <circle cx="150" cy="1720" r="50"/>
      </clipPath>
    </defs>

    <rect width="${VIDEO_CONFIG.width}" height="${VIDEO_CONFIG.height}" fill="url(#dashGlow)"/>
    
    <!-- Top Header -->
    ${renderTopHeader(scene.badgeText, script.category)}

    <!-- Scene Headline -->
    <g transform="translate(80, 205)">
      <text x="460" y="30" text-anchor="middle" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" letter-spacing="3">KILLER FEATURE REVEALED</text>
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

    <!-- Simulated Futuristic Workspace Dashboard -->
    <g transform="translate(60, 380)">
      <rect x="0" y="0" width="960" height="1050" rx="32" fill="#0D1424" stroke="#1E293B" stroke-width="3"/>
      
      <!-- Top Navigation -->
      <rect x="0" y="0" width="960" height="74" rx="32" fill="#131D33"/>
      <circle cx="45" cy="37" r="10" fill="#00F5D4"/>
      <text x="70" y="44" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800">${escapeXml(script.toolName)} STUDIO</text>
      
      <rect x="740" y="16" width="180" height="42" rx="21" fill="#00F5D4"/>
      <text x="830" y="43" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800">⚡ LIVE CANVAS</text>

      <!-- Sidebar -->
      <rect x="25" y="95" width="220" height="925" rx="20" fill="#080D18"/>
      <text x="50" y="145" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700">EXPLORER</text>
      
      <rect x="40" y="175" width="190" height="48" rx="12" fill="rgba(0, 245, 212, 0.15)" stroke="#00F5D4" stroke-width="1.5"/>
      <text x="60" y="206" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700">App.tsx</text>

      <rect x="40" y="240" width="190" height="48" rx="12" fill="#131D33"/>
      <text x="60" y="271" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="18">styles.css</text>

      <rect x="40" y="305" width="190" height="48" rx="12" fill="#131D33"/>
      <text x="60" y="336" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="18">schema.prisma</text>

      <!-- Center Code Window -->
      <g transform="translate(270, 95)">
        <rect x="0" y="0" width="660" height="370" rx="20" fill="#050811" stroke="#1E293B" stroke-width="2"/>
        <text x="30" y="50" fill="#64748B" font-family="Courier, monospace" font-size="19">// 1. Generate fullstack schema &amp; logic</text>
        <text x="30" y="90" fill="#38BDF8" font-family="Courier, monospace" font-size="20">export default function SchemaSynth() {</text>
        <text x="60" y="130" fill="#E2E8F0" font-family="Courier, monospace" font-size="20">const { schema, optimize } = useAI();</text>
        <text x="60" y="170" fill="#00F5D4" font-family="Courier, monospace" font-size="20">return &lt;VectorDatabaseSync /&gt;;</text>
        <text x="30" y="210" fill="#38BDF8" font-family="Courier, monospace" font-size="20">}</text>

        <!-- Success Pill -->
        <rect x="30" y="265" width="520" height="60" rx="16" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" stroke-width="2"/>
        <circle cx="65" cy="295" r="10" fill="#10B981"/>
        <text x="95" y="302" fill="#10B981" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="800">SUCCESS: 0 Errors • Build Time: 1.2s</text>
      </g>

      <!-- ACTIVE HOVER CARD (Fixed spacing and isolated coordinate groups) -->
      <g transform="translate(270, 500)">
        <rect x="0" y="0" width="660" height="490" rx="24" fill="#141E33" stroke="#00F5D4" stroke-width="3"/>
        
        <!-- Glowing Pulse Badge on Top -->
        <g transform="translate(30, -22)">
          <rect x="0" y="0" width="220" height="44" rx="22" fill="#00F5D4"/>
          <text x="110" y="28" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900">🔥 HOVER ACTIVE</text>
        </g>

        <!-- Feature Header -->
        <text x="40" y="65" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="800">${escapeXml(featureName.slice(0, 26))}</text>
        
        <!-- Description Wrapped cleanly within boundary -->
        ${descLines
          .map(
            (line, idx) => `
          <text x="40" y="${110 + idx * 30}" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">
            ${escapeXml(line)}
          </text>
        `
          )
          .join('')}

        <!-- Discrete Metric Cards (Each in its own translated group) -->
        <g transform="translate(40, 190)">
          <!-- Metric Card 1 -->
          <g transform="translate(0, 0)">
            <rect x="0" y="0" width="275" height="110" rx="16" fill="#0A0F1D" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
            <text x="25" y="42" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600">Speed Boost</text>
            <text x="25" y="85" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900">10x Faster</text>
          </g>

          <!-- Metric Card 2 (Separated to prevent ANY text collision) -->
          <g transform="translate(295, 0)">
            <rect x="0" y="0" width="290" height="110" rx="16" fill="#0A0F1D" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
            <text x="25" y="42" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600">Code Quality</text>
            <text x="25" y="85" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900">100% TypeSafe</text>
          </g>
        </g>

        <!-- CTA Inside Hover Card -->
        <rect x="40" y="340" width="580" height="70" rx="20" fill="#00F5D4"/>
        <text x="310" y="384" text-anchor="middle" fill="#070913" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">TRY THIS FEATURE NOW →</text>

        <!-- Cursor Poised Over Button -->
        <g transform="translate(490, 370)">
          <path d="M 0 0 L 26 60 L 12 58 L 5 76 L -7 71 L 0 52 L -14 48 Z" fill="#00F5D4" stroke="#070913" stroke-width="3"/>
          <circle cx="0" cy="0" r="24" fill="none" stroke="#00F5D4" stroke-width="3" opacity="0.8"/>
        </g>
      </g>
    </g>

    <!-- Presenter Mini Circle Bottom -->
    <g transform="translate(0, 0)">
      <circle cx="150" cy="1720" r="54" fill="none" stroke="#00F5D4" stroke-width="4"/>
      ${
        presenterBase64
          ? `<image href="${presenterBase64}" x="100" y="1670" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarMiniDash)"/>`
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
