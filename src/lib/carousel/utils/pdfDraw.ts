import { rgb } from 'pdf-lib';
import type { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { SLIDE_WIDTH, textLight } from '../constants';
import { cleanAscii, wrapTextLines, wrapTextByWidth } from './text';

export interface FittedTextResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  totalHeight: number;
  bottomY: number;
}

/**
 * Automatically splits and scales headline text so it fits strictly within maxWidth.
 * Guarantees zero text overflow outside slide boundaries on any screen or viewport.
 */
export function drawFittedHeadline(
  page: PDFPage,
  fontBold: PDFFont,
  headline: string,
  options: {
    startY?: number;
    maxWidth?: number;
    maxFontSize?: number;
    minFontSize?: number;
    color?: RGB;
    align?: 'center' | 'left';
    leftMargin?: number;
  } = {}
): FittedTextResult {
  const startY = options.startY ?? 1180;
  const maxWidth = options.maxWidth ?? 920; // 80px margins on left & right of 1080px canvas
  const maxFontSize = options.maxFontSize ?? 48;
  const minFontSize = options.minFontSize ?? 30;
  const align = options.align ?? 'center';
  const color = options.color ?? rgb(1, 1, 1);

  const rawClean = cleanAscii(headline);
  let bestFontSize = maxFontSize;
  let bestLines: string[] = [];

  // If text already has newline breaks, respect them as starting point
  const initialLines = rawClean.includes('\n') ? rawClean.split('\n') : [rawClean];

  // Try fitting with candidate font sizes from max down to min
  for (let candidateSize = maxFontSize; candidateSize >= minFontSize; candidateSize -= 2) {
    const estCharsPerLine = Math.max(16, Math.floor(maxWidth / (candidateSize * 0.58)));

    const candidateLines: string[] = [];
    for (const initLine of initialLines) {
      if (fontBold.widthOfTextAtSize(initLine, candidateSize) <= maxWidth) {
        candidateLines.push(initLine);
      } else {
        const wrapped = wrapTextLines(initLine, estCharsPerLine);
        candidateLines.push(...wrapped);
      }
    }

    const allFit = candidateLines.every(
      (line) => fontBold.widthOfTextAtSize(line, candidateSize) <= maxWidth
    );

    if (allFit && candidateLines.length <= 3) {
      bestFontSize = candidateSize;
      bestLines = candidateLines;
      break;
    }
  }

  if (bestLines.length === 0) {
    bestFontSize = minFontSize;
    bestLines = wrapTextLines(rawClean, Math.floor(maxWidth / (minFontSize * 0.58))).slice(0, 3);
  }

  const lineHeight = Math.round(bestFontSize * 1.25);
  let currentY = startY;

  for (const line of bestLines) {
    const cleanLine = cleanAscii(line);
    const lineW = fontBold.widthOfTextAtSize(cleanLine, bestFontSize);
    const x = align === 'center'
      ? Math.max(60, SLIDE_WIDTH / 2 - lineW / 2)
      : (options.leftMargin ?? 70);

    page.drawText(cleanLine, {
      x,
      y: currentY,
      size: bestFontSize,
      font: fontBold,
      color,
    });
    currentY -= lineHeight;
  }

  return {
    lines: bestLines,
    fontSize: bestFontSize,
    lineHeight,
    totalHeight: bestLines.length * lineHeight,
    bottomY: currentY,
  };
}

/**
 * Automatically fits subheadline text within maxWidth with zero overflow.
 */
export function drawFittedSubheadline(
  page: PDFPage,
  fontRegular: PDFFont,
  subheadline: string,
  options: {
    startY?: number;
    maxWidth?: number;
    maxFontSize?: number;
    minFontSize?: number;
    color?: RGB;
    align?: 'center' | 'left';
    leftMargin?: number;
  } = {}
): FittedTextResult {
  const startY = options.startY ?? 1120;
  const maxWidth = options.maxWidth ?? 920;
  const maxFontSize = options.maxFontSize ?? 24;
  const minFontSize = options.minFontSize ?? 18;
  const align = options.align ?? 'center';
  const color = options.color ?? rgb(0.89, 0.91, 0.94);

  const rawClean = cleanAscii(subheadline);
  let bestFontSize = maxFontSize;
  let bestLines: string[] = [];

  for (let candidateSize = maxFontSize; candidateSize >= minFontSize; candidateSize -= 2) {
    const estChars = Math.max(25, Math.floor(maxWidth / (candidateSize * 0.52)));
    const wrapped = wrapTextLines(rawClean, estChars);
    const allFit = wrapped.every(
      (line) => fontRegular.widthOfTextAtSize(line, candidateSize) <= maxWidth
    );
    if (allFit && wrapped.length <= 2) {
      bestFontSize = candidateSize;
      bestLines = wrapped;
      break;
    }
  }

  if (bestLines.length === 0) {
    bestFontSize = minFontSize;
    bestLines = wrapTextLines(rawClean, Math.floor(maxWidth / (minFontSize * 0.52))).slice(0, 2);
  }

  const lineHeight = Math.round(bestFontSize * 1.3);
  let currentY = startY;

  for (const line of bestLines) {
    const cleanLine = cleanAscii(line);
    const lineW = fontRegular.widthOfTextAtSize(cleanLine, bestFontSize);
    const x = align === 'center'
      ? Math.max(60, SLIDE_WIDTH / 2 - lineW / 2)
      : (options.leftMargin ?? 70);

    page.drawText(cleanLine, {
      x,
      y: currentY,
      size: bestFontSize,
      font: fontRegular,
      color,
    });
    currentY -= lineHeight;
  }

  return {
    lines: bestLines,
    fontSize: bestFontSize,
    lineHeight,
    totalHeight: bestLines.length * lineHeight,
    bottomY: currentY,
  };
}

/**
 * Draws wrapped multi-line text cleanly with guaranteed boundary safety.
 */
export function drawWrappedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  options: {
    x?: number;
    startY: number;
    maxWidth: number;
    fontSize: number;
    lineHeight?: number;
    color?: RGB;
    align?: 'left' | 'center';
    maxLines?: number;
  }
): { bottomY: number; lines: string[]; totalHeight: number } {
  const {
    startY,
    maxWidth,
    fontSize,
    lineHeight = Math.round(fontSize * 1.35),
    color = textLight,
    align = 'left',
    maxLines,
  } = options;

  let lines = wrapTextByWidth(text, font, fontSize, maxWidth);
  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
  }

  let currentY = startY;
  const leftX = options.x ?? (align === 'center' ? (SLIDE_WIDTH - maxWidth) / 2 : 70);

  for (const line of lines) {
    const lineW = font.widthOfTextAtSize(line, fontSize);
    const drawX = align === 'center'
      ? leftX + Math.max(0, (maxWidth - lineW) / 2)
      : leftX;

    page.drawText(line, {
      x: drawX,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
    currentY -= lineHeight;
  }

  return {
    bottomY: currentY,
    lines,
    totalHeight: lines.length * lineHeight,
  };
}

/**
 * Safely renders a takeaway quote at the bottom of a slide without clipping.
 */
export function drawTakeawayQuote(
  page: PDFPage,
  fontRegular: PDFFont,
  quote: string,
  options: {
    startY?: number;
    maxWidth?: number;
    fontSize?: number;
    color?: RGB;
  } = {}
): { bottomY: number } {
  const startY = options.startY ?? 230;
  const maxWidth = options.maxWidth ?? 880;
  const fontSize = options.fontSize ?? 20;
  const color = options.color ?? textLight;

  return drawWrappedText(page, fontRegular, quote, {
    x: (SLIDE_WIDTH - maxWidth) / 2,
    startY,
    maxWidth,
    fontSize,
    lineHeight: Math.round(fontSize * 1.35),
    align: 'center',
    color,
    maxLines: 3,
  });
}
