/**
 * UI Renderers for Cinematic AI Video Engine
 * Renders stunning 1080x1920 high-fidelity frames for 5 distinct scenes
 * using Sharp and high-retention SVG vector templates with automated
 * boundary wrapping and typography clipping prevention.
 */
import sharp from 'sharp';
import fs from 'fs';
import { VIDEO_CONFIG, DEFAULT_PRESENTER, THEME } from './constants';
import { CinematicScene, DeepDiveToolScript } from './types';

// Helper to escape XML characters
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper to wrap text into discrete lines based on character width
function wrapText(text: string, maxCharsPerLine: number = 30, maxLines: number = 3): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

// Helper to get base64 presenter image
function getPresenterBase64(): string {
  try {
    if (fs.existsSync(DEFAULT_PRESENTER.avatarLocalPath)) {
      const imgBuffer = fs.readFileSync(DEFAULT_PRESENTER.avatarLocalPath);
      return `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
    }
  } catch (err: any) {
    console.warn(`⚠️ [UI Renderer] Could not load presenter avatar: ${err.message}`);
  }
  return '';
}

/**
 * Common Top Brand Header Component
 */
function renderTopHeader(badge: string, toolCategory: string): string {
  return `
    <!-- Top Bar -->
    <g transform="translate(60, 90)">
      <!-- Badge -->
      <rect x="0" y="0" width="280" height="52" rx="26" fill="rgba(0, 245, 212, 0.15)" stroke="#00F5D4" stroke-width="2"/>
      <circle cx="28" cy="26" r="8" fill="#00F5D4" />
      <text x="50" y="34" fill="#00F5D4" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" letter-spacing="2">${escapeXml(badge.toUpperCase())}</text>
      
      <!-- Pak-o-Drive Watermark -->
      <text x="960" y="34" text-anchor="end" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">@pakodrive.official</text>
    </g>
  `;
}

/**
 * Scene 1: Presenter Hero Hook Frame
 */
function renderScene1PresenterHook(scene: CinematicScene, script: DeepDiveToolScript, presenterBase64: string): string {
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

/**
 * Scene 2: Browser Search Simulation Frame
 */
function renderScene2SearchSimulation(scene: CinematicScene, script: DeepDiveToolScript, presenterBase64: string): string {
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

/**
 * Scene 3: Interactive Dashboard Live Hover Frame
 */
function renderScene3DashboardInteractive(scene: CinematicScene, script: DeepDiveToolScript, presenterBase64: string): string {
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

/**
 * Scene 4: Superpower Comparison (Before vs After) Frame
 */
function renderScene4SuperpowerComparison(scene: CinematicScene, script: DeepDiveToolScript, presenterBase64: string): string {
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

/**
 * Scene 5: Presenter Outro Call-To-Action Frame
 */
function renderScene5PresenterCTA(scene: CinematicScene, script: DeepDiveToolScript, presenterBase64: string): string {
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

/**
 * Master UI Frame Renderer for any Scene
 */
export async function renderSceneFrame(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  outputImagePath: string
): Promise<void> {
  const presenterBase64 = getPresenterBase64();
  let svg = '';

  switch (scene.type) {
    case 'presenter_hook':
      svg = renderScene1PresenterHook(scene, script, presenterBase64);
      break;
    case 'search_simulation':
      svg = renderScene2SearchSimulation(scene, script, presenterBase64);
      break;
    case 'dashboard_interactive':
      svg = renderScene3DashboardInteractive(scene, script, presenterBase64);
      break;
    case 'superpower_comparison':
      svg = renderScene4SuperpowerComparison(scene, script, presenterBase64);
      break;
    case 'presenter_cta':
      svg = renderScene5PresenterCTA(scene, script, presenterBase64);
      break;
    default:
      svg = renderScene1PresenterHook(scene, script, presenterBase64);
  }

  // Render SVG to 1080x1920 high-quality JPEG using Sharp
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 95, progressive: true })
    .toFile(outputImagePath);

  console.log(`🖼️ [UI Renderer] Rendered frame for [${scene.id}] (${scene.type}) -> ${outputImagePath}`);
}
