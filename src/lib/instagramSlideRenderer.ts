import sharp from 'sharp';

export interface CarouselSlideData {
  slideNumber: number;
  totalSlides: number;
  type: 'cover' | 'tool' | 'cta';
  badge: string;
  badgeColor?: string;
  title: string;
  subtitle?: string;
  toolName?: string;
  replaces?: string;
  superpower?: string;
  proTip?: string;
  ctaText?: string;
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

/**
 * Escapes XML/SVG special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wraps text into lines that do not exceed maxCharsPerLine
 */
function wrapText(text: string, maxCharsPerLine = 32): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Renders a single 1080x1350 High-Aesthetic Carousel Slide as JPEG Buffer
 */
export async function renderInstagramSlideJpeg(slide: CarouselSlideData): Promise<Buffer> {
  const isCover = slide.type === 'cover';
  const isCta = slide.type === 'cta';
  const accentColor = slide.badgeColor || '#00F5D4'; // default neon cyan

  // ── 1. Top Header Bar (Fixed Y: 90 to 160) ─────────────────────────
  const headerSvg = `
    <!-- Top Header Group -->
    <circle cx="108" cy="120" r="28" fill="#1E293B" stroke="${accentColor}" stroke-width="2" />
    <text x="108" y="128" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="${accentColor}" text-anchor="middle">DI</text>
    
    <text x="152" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF">digitalinspirer</text>
    <text x="152" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#94A3B8">Future AI &amp; Tech Tools</text>

    <!-- Top Badge Pill -->
    <rect x="760" y="100" width="240" height="42" rx="21" fill="rgba(255, 255, 255, 0.08)" stroke="${accentColor}" stroke-width="1.5" />
    <text x="880" y="127" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${accentColor}" text-anchor="middle">${escapeXml(slide.badge)}</text>
  `;

  // ── 2. Bottom Footer Bar (Fixed Y: 1220 to 1290) ───────────────────
  const dotsSvg = Array.from({ length: slide.totalSlides })
    .map((_, i) => {
      const cx = 540 + (i - (slide.totalSlides - 1) / 2) * 26;
      const fill = i + 1 === slide.slideNumber ? accentColor : 'rgba(255,255,255,0.2)';
      const r = i + 1 === slide.slideNumber ? 6 : 4;
      return `<circle cx="${cx}" cy="1260" r="${r}" fill="${fill}" />`;
    })
    .join('');

  const footerSvg = `
    <!-- Bottom Footer Group -->
    <line x1="80" y1="1210" x2="1000" y2="1210" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="80" y="1265" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#64748B">Slide ${slide.slideNumber} of ${slide.totalSlides}</text>
    ${dotsSvg}
    <text x="1000" y="1265" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${accentColor}" text-anchor="end">${isCta ? 'Drop a Comment 👇' : 'Swipe Next ➔'}</text>
  `;

  // ── 3. Body Content (Safe Vertical Area: Y 190 to 1180) ────────────
  let bodySvg = '';

  if (isCover) {
    // ── COVER SLIDE ────────────────────────────────────────────────
    const titleLines = wrapText(slide.title, 20);
    const subtitleLines = wrapText(slide.subtitle || 'Save this before it gets taken down ⚡', 30);

    // 1. Category Pill (Y: 195 to 239)
    const catPillTop = 195;
    const catPillSvg = `
      <rect x="80" y="${catPillTop}" width="240" height="44" rx="12" fill="${accentColor}" opacity="0.18" stroke="${accentColor}" stroke-width="1.5" />
      <text x="100" y="${catPillTop + 29}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="${accentColor}" letter-spacing="0.5">⚡ 2026 EDITION</text>
    `;

    // 2. Title Lines (Start with generous 50px clearance at Y = 340)
    let curY = 340;
    const titleLineHeight = 78;
    const titleTextSvg = titleLines
      .map((line, idx) => {
        const lineY = curY + idx * titleLineHeight;
        return `<text x="80" y="${lineY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="-1">${escapeXml(line)}</text>`;
      })
      .join('');
    curY += titleLines.length * titleLineHeight + 20;

    // 3. Subtitle Lines (Crisp 32px font with high contrast)
    const subLineHeight = 46;
    const subtitleTextSvg = subtitleLines
      .map((line, idx) => {
        const lineY = curY + idx * subLineHeight;
        return `<text x="80" y="${lineY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="600" fill="#E2E8F0">${escapeXml(line)}</text>`;
      })
      .join('');
    curY += subtitleLines.length * subLineHeight + 40;

    // 4. Feature Summary Card (Anchored Y: 690 to 1170)
    const cardTop = Math.max(curY, 690);
    const cardHeight = 1170 - cardTop;
    const cardSvg = `
      <rect x="80" y="${cardTop}" width="920" height="${cardHeight}" rx="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.14)" stroke-width="1.5" />
      
      <!-- Card Header Tag -->
      <rect x="120" y="${cardTop + 35}" width="280" height="42" rx="10" fill="rgba(56, 189, 248, 0.18)" stroke="#38BDF8" stroke-width="1.2" />
      <text x="138" y="${cardTop + 62}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#38BDF8" letter-spacing="1">WHAT'S INSIDE THIS GUIDE</text>
      
      <!-- Bullet 1 -->
      <text x="120" y="${cardTop + 135}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">📌 3 Secret AI Websites saving you 20+ hrs/wk</text>
      
      <!-- Bullet 2 -->
      <text x="120" y="${cardTop + 205}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">⚡ Tested for speed, quality &amp; 100% free access</text>
      
      <!-- Bullet 3 -->
      <text x="120" y="${cardTop + 275}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">🌐 Direct links &amp; secret promo codes included</text>

      <!-- Bottom Hint -->
      <line x1="120" y1="${cardTop + 325}" x2="960" y2="${cardTop + 325}" stroke="rgba(255,255,255,0.10)" stroke-width="1" />
      <text x="120" y="${cardTop + 375}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="${accentColor}">Swipe left to discover Tool #1 ➔</text>
    `;

    bodySvg = catPillSvg + titleTextSvg + subtitleTextSvg + cardSvg;

  } else if (isCta) {
    // ── FINAL CTA SLIDE ─────────────────────────────────────────────
    const ctaLines = wrapText(slide.ctaText || 'Comment "TOOL" below and our automated bot will DM you direct access links + secret promo codes straight to your inbox!', 30);

    const ctaStart = 640;
    const ctaTextSvg = ctaLines
      .map((line, idx) => {
        const lineY = ctaStart + idx * 48;
        return `<text x="540" y="${lineY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" text-anchor="middle">${escapeXml(line)}</text>`;
      })
      .join('');

    const divY = ctaStart + ctaLines.length * 48 + 35;
    const iconsY = divY + 45;
    const cardHeight = Math.max(iconsY - 440 + 50, 520);
    const followY = Math.min(440 + cardHeight + 65, 1150);

    bodySvg = `
      <!-- Top Badge -->
      <rect x="430" y="210" width="220" height="46" rx="23" fill="rgba(250, 204, 21, 0.18)" stroke="#FACC15" stroke-width="1.5" />
      <text x="540" y="240" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FACC15" text-anchor="middle" letter-spacing="1">FINAL STEP</text>

      <!-- Main Headline -->
      <text x="540" y="330" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle">WANT THE DIRECT LINKS?</text>
      <text x="540" y="380" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#94A3B8" text-anchor="middle">Don't waste time searching on Google</text>

      <!-- Center Glow Card -->
      <rect x="80" y="440" width="920" height="${cardHeight}" rx="28" fill="rgba(15, 23, 42, 0.90)" stroke="${accentColor}" stroke-width="2" />
      
      <rect x="410" y="480" width="260" height="46" rx="23" fill="${accentColor}" opacity="0.18" stroke="${accentColor}" stroke-width="1.5" />
      <text x="540" y="511" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="${accentColor}" text-anchor="middle" letter-spacing="1">🤖 INSTANT DM BOT</text>

      <!-- Instruction Highlight Box -->
      <rect x="180" y="550" width="720" height="60" rx="16" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.15)" />
      <text x="540" y="590" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FACC15" text-anchor="middle">👇 COMMENT &quot;TOOL&quot; BELOW 👇</text>

      ${ctaTextSvg}

      <line x1="140" y1="${divY}" x2="940" y2="${divY}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
      <text x="540" y="${iconsY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#E2E8F0" text-anchor="middle">❤️ Like  •  💬 Comment &quot;TOOL&quot;  •  🔖 Save</text>

      <!-- Bottom Follow Handle -->
      <text x="540" y="${followY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#94A3B8" text-anchor="middle">Follow <tspan fill="${accentColor}">@digitalinspirer</tspan> for daily secret AI websites</text>
    `;

  } else {
    // ── TOOL SLIDE (High-Aesthetic 3-Box Design: Replaces + Superpower + Pro Tip) ──
    const replacesLines = wrapText(slide.replaces || '', 44);
    const superpowerLines = wrapText(slide.superpower || '', 38);
    const proTipLines = wrapText(slide.proTip || '', 44);

    // 1. Tool Header (Y: 190 to 315)
    const headerSvg = `
      <text x="80" y="248" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF">${escapeXml(slide.toolName || slide.title)}</text>
      <text x="80" y="294" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="${accentColor}">${escapeXml(slide.subtitle || 'Autonomous AI Software')}</text>
    `;

    // 2. Three Dedicated Feature Tiles (Y: 335 to 1175 = 840px total height)
    // Box 1: Replaces (Height ~215px)
    const box1Top = 335;
    const box1Height = 215;
    const box1TextSvg = replacesLines
      .slice(0, 3)
      .map((line, idx) => {
        const lineY = box1Top + 105 + idx * 40;
        return `<text x="120" y="${lineY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500" fill="#CBD5E1">${escapeXml(line)}</text>`;
      })
      .join('');

    const box1Svg = `
      <rect x="80" y="${box1Top}" width="920" height="${box1Height}" rx="22" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(239, 68, 68, 0.35)" stroke-width="1.5" />
      <rect x="120" y="${box1Top + 24}" width="180" height="38" rx="10" fill="rgba(239, 68, 68, 0.20)" stroke="#EF4444" stroke-width="1.5" />
      <text x="138" y="${box1Top + 50}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#F87171" letter-spacing="0.5">❌ REPLACES</text>
      ${box1TextSvg}
    `;

    // Box 2: Hero Superpower (Height ~295px with Glowing Accent Border)
    const box2Top = box1Top + box1Height + 25; // 575
    const box2Height = 295;
    const box2TextSvg = superpowerLines
      .slice(0, 4)
      .map((line, idx) => {
        const lineY = box2Top + 110 + idx * 44;
        return `<text x="120" y="${lineY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="700" fill="#FFFFFF">${escapeXml(line)}</text>`;
      })
      .join('');

    const box2Svg = `
      <rect x="80" y="${box2Top}" width="920" height="${box2Height}" rx="22" fill="rgba(15, 23, 42, 0.90)" stroke="${accentColor}" stroke-width="2" />
      <rect x="120" y="${box2Top + 26}" width="200" height="40" rx="10" fill="${accentColor}" opacity="0.22" stroke="${accentColor}" stroke-width="1.5" />
      <text x="138" y="${box2Top + 53}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="${accentColor}" letter-spacing="0.5">⚡ SUPERPOWER</text>
      ${box2TextSvg}
    `;

    // Box 3: Pro Tip (Height ~235px)
    const box3Top = box2Top + box2Height + 25; // 895
    const box3Height = 235;
    const box3TextSvg = proTipLines
      .slice(0, 3)
      .map((line, idx) => {
        const lineY = box3Top + 105 + idx * 40;
        return `<text x="120" y="${lineY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#7DD3FC">${escapeXml(line)}</text>`;
      })
      .join('');

    const box3Svg = `
      <rect x="80" y="${box3Top}" width="920" height="${box3Height}" rx="22" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5" />
      <rect x="120" y="${box3Top + 24}" width="160" height="38" rx="10" fill="rgba(56, 189, 248, 0.20)" stroke="#38BDF8" stroke-width="1.5" />
      <text x="138" y="${box3Top + 50}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#38BDF8" letter-spacing="0.5">💡 PRO TIP</text>
      ${box3TextSvg}
    `;

    bodySvg = headerSvg + box1Svg + box2Svg + box3Svg;
  }

  // ── 4. Full High-Res SVG Frame ──────────────────────────────────
  const fullSvg = `
    <svg width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" viewBox="0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Luxury Dark Gradient Background -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070A11" />
          <stop offset="50%" stop-color="#0B0F19" />
          <stop offset="100%" stop-color="#050810" />
        </linearGradient>

        <!-- Glow Orbs -->
        <radialGradient id="orb1" cx="20%" cy="15%" r="45%">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.18" />
          <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="orb2" cx="80%" cy="85%" r="50%">
          <stop offset="0%" stop-color="#7928CA" stop-opacity="0.14" />
          <stop offset="100%" stop-color="#7928CA" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Base Canvas -->
      <rect width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" fill="url(#bgGradient)" />
      
      <!-- Subtle Ambient Glow Orbs -->
      <rect width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" fill="url(#orb1)" />
      <rect width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" fill="url(#orb2)" />

      <!-- Corner Borders / Tech Accent Marks -->
      <rect x="30" y="30" width="${SLIDE_WIDTH - 60}" height="${SLIDE_HEIGHT - 60}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" rx="20" />

      <!-- Slide Components -->
      ${headerSvg}
      ${bodySvg}
      ${footerSvg}
    </svg>
  `;

  // Convert SVG string to high-quality 1080x1350 JPEG
  return await sharp(Buffer.from(fullSvg))
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
}

/**
 * Uploads a slide buffer to free CDN for Meta Graph API ingestion
 */
export async function uploadSlideToCdn(buffer: Buffer, slideIdx: number): Promise<string> {
  const formData = new FormData();
  formData.append('files[]', new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' }), `slide_${Date.now()}_${slideIdx}.jpg`);

  const res = await fetch('https://uguu.se/upload', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (json.success && json.files && json.files[0] && json.files[0].url) {
    return json.files[0].url;
  }
  throw new Error('Failed to upload slide to CDN: ' + JSON.stringify(json));
}
