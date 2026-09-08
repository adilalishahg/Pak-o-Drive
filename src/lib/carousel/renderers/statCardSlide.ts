import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, electricBlue, vibrantPurple, textWhite, textLight } from '../constants';
import { cleanAscii } from '../utils';

export function renderStatCardSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // Headline
  const hClean = cleanAscii(slide.headline);
  const hW = fontBold.widthOfTextAtSize(hClean, 52);
  page.drawText(hClean, {
    x: SLIDE_WIDTH / 2 - hW / 2,
    y: SLIDE_HEIGHT - 170,
    size: 52,
    font: fontBold,
    color: textWhite,
  });

  // Subheadline
  if (slide.subheadline) {
    const sClean = cleanAscii(slide.subheadline);
    const sW = fontRegular.widthOfTextAtSize(sClean, 24);
    page.drawText(sClean, {
      x: SLIDE_WIDTH / 2 - sW / 2,
      y: SLIDE_HEIGHT - 220,
      size: 24,
      font: fontRegular,
      color: textLight,
    });
  }

  // Card Outer Frame
  const cardY = 320;
  const cardH = 740;
  page.drawRectangle({
    x: 70,
    y: cardY,
    width: 940,
    height: cardH,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 2,
  });

  const cardContent = slide.cardContent;
  if (cardContent) {
    if (cardContent.badge) {
      page.drawText(cleanAscii(cardContent.badge), {
        x: 120,
        y: cardY + cardH - 65,
        size: 28,
        font: fontBold,
        color: textWhite,
      });
    }

    if (cardContent.tagline) {
      page.drawText(cleanAscii(cardContent.tagline), {
        x: 120,
        y: cardY + cardH - 120,
        size: 20,
        font: fontRegular,
        color: electricBlue,
      });
    }

    if (cardContent.title) {
      page.drawText(cleanAscii(cardContent.title), {
        x: 120,
        y: cardY + cardH - 165,
        size: 38,
        font: fontBold,
        color: textWhite,
      });
    }

    if (cardContent.subtitle) {
      page.drawText(cleanAscii(cardContent.subtitle), {
        x: 120,
        y: cardY + cardH - 205,
        size: 22,
        font: fontRegular,
        color: textLight,
      });
    }

    // Divider
    page.drawLine({
      start: { x: 120, y: cardY + cardH - 245 },
      end: { x: 960, y: cardY + cardH - 245 },
      thickness: 1,
      color: rgb(0.15, 0.22, 0.35),
    });

    if (cardContent.highlightText) {
      page.drawText(cleanAscii(cardContent.highlightText), {
        x: 120,
        y: cardY + cardH - 300,
        size: 28,
        font: fontBold,
        color: vibrantPurple,
      });
    }

    if (cardContent.bodyLines) {
      let lY = cardY + cardH - 350;
      for (const line of cardContent.bodyLines) {
        page.drawText(cleanAscii(line), {
          x: 120,
          y: lY,
          size: 24,
          font: fontRegular,
          color: textLight,
        });
        lY -= 40;
      }
    }
  }

  // Bottom Takeaway Quote
  if (slide.takeawayQuote) {
    const qClean = cleanAscii(slide.takeawayQuote);
    const qW = fontRegular.widthOfTextAtSize(qClean, 24);
    page.drawText(qClean, {
      x: SLIDE_WIDTH / 2 - qW / 2,
      y: 240,
      size: 24,
      font: fontRegular,
      color: textLight,
    });
  }
}
