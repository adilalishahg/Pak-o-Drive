import fs from 'fs';
import path from 'path';
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../constants';

export const WIDTH = SLIDE_WIDTH || 1080;
export const HEIGHT = SLIDE_HEIGHT || 1350;

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function wrapHeadline(text: string, maxChars = 28): string[] {
  const clean = text.trim();
  if (clean.length <= maxChars) return [clean];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

export function wrapSvgTextLines(text: string, maxChars = 55, maxLines = 2): string[] {
  const clean = text.trim();
  if (clean.length <= maxChars) return [clean];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

export function renderHeadlineSvg(lines: string[], subheadline: string): string {
  const sub = escapeXml(subheadline || '');
  if (lines.length <= 1) {
    return `
      <text x="540" y="195" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[0])}</text>
      ${sub ? `<text x="540" y="260" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400" fill="#E2E8F0" text-anchor="middle">${sub}</text>` : ''}
    `;
  }
  if (lines.length === 2) {
    return `
      <text x="540" y="165" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[0])}</text>
      <text x="540" y="222" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[1])}</text>
      ${sub ? `<text x="540" y="275" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#E2E8F0" text-anchor="middle">${sub}</text>` : ''}
    `;
  }
  return `
    <text x="540" y="145" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[0])}</text>
    <text x="540" y="192" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[1])}</text>
    <text x="540" y="239" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">${escapeXml(lines[2])}</text>
    ${sub ? `<text x="540" y="285" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#E2E8F0" text-anchor="middle">${sub}</text>` : ''}
  `;
}

export function toBase64Image(relativePath: string): string {
  try {
    const fullPath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) return '';
    const ext = path.extname(fullPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:${mime};base64,${data}`;
  } catch {
    return '';
  }
}

export function getBaseSvgHeader(): string {
  return `
  <defs>
    <style>
      text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .code-font {
        font-family: 'Fira Code', 'FiraCode', monospace;
      }
    </style>
    <!-- Slobodan Deep Space Radial Vignette -->
    <radialGradient id="bgVignette" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="1"/>
      <stop offset="55%" stop-color="#0A0F1D" stop-opacity="1"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="cyanCenterGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#0284C7" stop-opacity="0.25"/>
      <stop offset="70%" stop-color="#0F172A" stop-opacity="0"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#111827" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0B1120" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="codeWinBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="1"/>
      <stop offset="100%" stop-color="#070D18" stop-opacity="1"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
    <clipPath id="heroCoverClip">
      <rect x="150" y="320" width="780" height="770" rx="36"/>
    </clipPath>
    <clipPath id="avatarCircleClip">
      <circle cx="540" cy="855" r="75"/>
    </clipPath>
  </defs>
  `;
}

export function renderBackground(): string {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgVignette)"/>
    <circle cx="540" cy="550" r="460" fill="url(#cyanCenterGlow)"/>
    <!-- 3D perspective floor grid lines -->
    <path d="M 0 1230 L 320 880 L 760 880 L 1080 1230" fill="none" stroke="#1E293B" stroke-width="1" opacity="0.4"/>
    <line x1="540" y1="880" x2="540" y2="1230" stroke="#1E293B" stroke-width="1" opacity="0.4"/>
  `;
}

export function renderPageBadge(pageNum: number, totalSlides: number): string {
  return `
    <text x="${WIDTH - 80}" y="75" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" text-anchor="end">${pageNum} of ${totalSlides}</text>
  `;
}

export function renderBottomBar(text = 'Subscribe for more'): string {
  return `
    <rect x="0" y="1230" width="${WIDTH}" height="120" fill="#000000"/>
    <line x1="0" y1="1230" x2="${WIDTH}" y2="1230" stroke="#1D4ED8" stroke-width="2.5"/>
    <text x="540" y="1302" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#FFFFFF" text-anchor="middle">${escapeXml(text)}</text>
  `;
}
