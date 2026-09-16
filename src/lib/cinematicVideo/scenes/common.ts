import fs from 'fs';
import { DEFAULT_PRESENTER } from '../constants';

// Helper to escape XML characters
export function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper to wrap text into discrete lines based on character width
export function wrapText(text: string, maxCharsPerLine: number = 30, maxLines: number = 3): string[] {
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
export function getPresenterBase64(): string {
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
export function renderTopHeader(badge: string, toolCategory: string): string {
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
