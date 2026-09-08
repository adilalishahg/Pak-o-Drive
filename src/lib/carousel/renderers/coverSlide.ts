import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, textWhite } from '../constants';
import { cleanAscii, drawFittedHeadline } from '../utils';

export function renderCoverSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide, embeddedCoverImage } = ctx;
  const { fontBold } = fonts;

  const fit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: SLIDE_HEIGHT - 170,
    maxWidth: 920,
    maxFontSize: 46,
    minFontSize: 30,
    align: 'center',
    color: textWhite,
  });

  // Center Graphic Frame positioned cleanly below the fitted headline
  const frameY = 320;
  const frameH = Math.min(640, Math.max(500, fit.bottomY - frameY - 40));

  page.drawRectangle({
    x: 70,
    y: frameY,
    width: 940,
    height: frameH,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 2,
  });

  if (embeddedCoverImage) {
    page.drawImage(embeddedCoverImage, {
      x: 72,
      y: frameY + 2,
      width: 936,
      height: frameH - 4,
    });
  } else {
    // Fallback Blueprint Graphic
    const fallbackTitle = 'AI ARCHITECTURE MATRIX 2026';
    page.drawText(fallbackTitle, {
      x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(fallbackTitle, 32) / 2,
      y: frameY + frameH / 2,
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
