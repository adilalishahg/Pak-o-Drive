import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, textWhite } from '../constants';
import { cleanAscii } from '../utils';

export function renderCoverSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide, embeddedCoverImage } = ctx;
  const { fontBold } = fonts;

  const headlineLines = slide.headline.split('\n');
  let tY = SLIDE_HEIGHT - 220;
  for (const line of headlineLines) {
    const clean = cleanAscii(line);
    const lW = fontBold.widthOfTextAtSize(clean, 56);
    page.drawText(clean, {
      x: SLIDE_WIDTH / 2 - lW / 2,
      y: tY,
      size: 56,
      font: fontBold,
      color: textWhite,
    });
    tY -= 70;
  }

  // Center Graphic Frame
  page.drawRectangle({
    x: 70,
    y: 360,
    width: 940,
    height: 620,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 2,
  });

  if (embeddedCoverImage) {
    page.drawImage(embeddedCoverImage, {
      x: 72,
      y: 362,
      width: 936,
      height: 616,
    });
  } else {
    // Fallback Blueprint Graphic
    const fallbackTitle = 'AI ARCHITECTURE MATRIX 2026';
    page.drawText(fallbackTitle, {
      x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(fallbackTitle, 32) / 2,
      y: 660,
      size: 32,
      font: fontBold,
      color: neonCyan,
    });
  }

  // Bottom Tech Pill
  const rawFooter = slide.footer || '';
  const pillText = rawFooter && !rawFooter.toLowerCase().includes('pakodrive')
    ? rawFooter
    : 'ARCHITECTURE MASTERCLASS 2026';
  const pillW = fontBold.widthOfTextAtSize(pillText, 24) + 60;
  page.drawRectangle({
    x: SLIDE_WIDTH / 2 - pillW / 2,
    y: 180,
    width: pillW,
    height: 52,
    color: rgb(0.05, 0.09, 0.17),
    borderColor: cardBorder,
    borderWidth: 1.5,
  });
  page.drawText(pillText, {
    x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(pillText, 24) / 2,
    y: 197,
    size: 24,
    font: fontBold,
    color: textWhite,
  });
}
