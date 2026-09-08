import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, vibrantPurple, codeBg, textWhite, textLight, textMuted } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderCodeTerminalSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular, fontCode } = fonts;

  // Headline
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: SLIDE_HEIGHT - 170,
    maxWidth: 920,
    maxFontSize: 44,
    minFontSize: 28,
    align: 'center',
    color: textWhite,
  });

  // Subheadline
  if (slide.subheadline) {
    drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 15,
      maxWidth: 920,
      maxFontSize: 24,
      minFontSize: 18,
      align: 'center',
      color: textLight,
    });
  }

  const cardY = 380;
  const cardH = 640;
  page.drawRectangle({
    x: 70,
    y: cardY,
    width: 940,
    height: cardH,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 2,
  });

  const cardContent = slide.cardContent || {
    badge: slide.tag || 'ARCHITECTURE',
    title: slide.headline,
    bodyLines: slide.points || ['Key architectural takeaways for high-scale systems.'],
  };

  if (cardContent.badge) {
    page.drawText(cleanAscii(cardContent.badge), {
      x: 110,
      y: cardY + cardH - 60,
      size: 26,
      font: fontBold,
      color: textWhite,
    });
  }

  if (cardContent.tagline) {
    page.drawText(cleanAscii(cardContent.tagline), {
      x: 110,
      y: cardY + cardH - 120,
      size: 20,
      font: fontRegular,
      color: electricBlue,
    });
  }

  if (cardContent.title) {
    page.drawText(cleanAscii(cardContent.title), {
      x: 110,
      y: cardY + cardH - 165,
      size: 36,
      font: fontBold,
      color: textWhite,
    });
  }

  page.drawLine({
    start: { x: 110, y: cardY + cardH - 240 },
    end: { x: 970, y: cardY + cardH - 240 },
    thickness: 1,
    color: rgb(0.15, 0.22, 0.35),
  });

  if (cardContent.highlightText) {
    page.drawText(cleanAscii(cardContent.highlightText), {
      x: 110,
      y: cardY + cardH - 290,
      size: 26,
      font: fontBold,
      color: vibrantPurple,
    });
  }

  let lineY = cardY + cardH - (cardContent.highlightText ? 335 : 290);
  if (cardContent.bodyLines) {
    for (const bl of cardContent.bodyLines) {
      page.drawText(cleanAscii(bl), {
        x: 110,
        y: lineY,
        size: 24,
        font: fontRegular,
        color: textLight,
      });
      lineY -= 36;
    }
  }

  // If codeSnippet present, draw clean terminal box
  if (slide.codeSnippet) {
    const rawLines = slide.codeSnippet.split('\n').slice(0, 4);
    page.drawRectangle({
      x: 110,
      y: cardY + 50,
      width: 860,
      height: 160,
      color: codeBg,
      borderColor: electricBlue,
      borderWidth: 1.5,
    });

    let codeY = cardY + 160;
    for (const cl of rawLines) {
      page.drawText(cleanAscii(cl), {
        x: 130,
        y: codeY,
        size: 18,
        font: fontCode,
        color: cl.trim().startsWith('//') ? textMuted : neonCyan,
      });
      codeY -= 30;
    }
  }

  if (slide.takeawayQuote) {
    const qClean = cleanAscii(slide.takeawayQuote);
    const qW = fontRegular.widthOfTextAtSize(qClean, 24);
    page.drawText(qClean, {
      x: SLIDE_WIDTH / 2 - qW / 2,
      y: 260,
      size: 24,
      font: fontRegular,
      color: textLight,
    });
  }
}
