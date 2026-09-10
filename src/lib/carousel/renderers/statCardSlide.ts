import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, electricBlue, vibrantPurple, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, wrapTextByWidth, drawTakeawayQuote } from '../utils';

export function renderStatCardSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // 1. Headline
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: SLIDE_HEIGHT - 165,
    maxWidth: 920,
    maxFontSize: 44,
    minFontSize: 28,
    align: 'center',
    color: textWhite,
  });

  // 2. Subheadline
  let lowestY = headFit.bottomY;
  if (slide.subheadline) {
    const subFit = drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 14,
      maxWidth: 920,
      maxFontSize: 22,
      minFontSize: 16,
      align: 'center',
      color: textLight,
    });
    lowestY = subFit.bottomY;
  }

  // 3. Dynamic Card Frame Calculation
  const hasQuote = Boolean(slide.takeawayQuote);
  const cardBottom = hasQuote ? 210 : 130;
  const cardTop = lowestY - 25;
  const cardH = Math.max(380, cardTop - cardBottom);
  const cardY = cardBottom;

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
  const maxInnerW = 840;

  if (cardContent) {
    let currY = cardY + cardH - 50;

    // Badge
    if (cardContent.badge) {
      page.drawText(cleanAscii(cardContent.badge), {
        x: 120,
        y: currY,
        size: 24,
        font: fontBold,
        color: textWhite,
      });
      currY -= 32;
    }

    // Tagline
    if (cardContent.tagline) {
      page.drawText(cleanAscii(cardContent.tagline), {
        x: 120,
        y: currY,
        size: 18,
        font: fontRegular,
        color: electricBlue,
      });
      currY -= 28;
    }

    // Title (Wrapped to prevent overflow)
    if (cardContent.title) {
      const titleLines = wrapTextByWidth(cleanAscii(cardContent.title), fontBold, 34, maxInnerW);
      for (const line of titleLines) {
        page.drawText(line, {
          x: 120,
          y: currY,
          size: 34,
          font: fontBold,
          color: textWhite,
        });
        currY -= 42;
      }
      currY -= 6;
    }

    // Subtitle (Wrapped to prevent overflow)
    if (cardContent.subtitle) {
      const subLines = wrapTextByWidth(cleanAscii(cardContent.subtitle), fontRegular, 20, maxInnerW);
      for (const line of subLines) {
        page.drawText(line, {
          x: 120,
          y: currY,
          size: 20,
          font: fontRegular,
          color: textLight,
        });
        currY -= 26;
      }
      currY -= 6;
    }

    // Divider Line
    page.drawLine({
      start: { x: 120, y: currY },
      end: { x: 960, y: currY },
      thickness: 1,
      color: rgb(0.15, 0.22, 0.35),
    });
    currY -= 32;

    // Highlight Statement (Wrapped with high contrast accent)
    if (cardContent.highlightText) {
      const hlLines = wrapTextByWidth(cleanAscii(cardContent.highlightText), fontBold, 25, maxInnerW);
      for (const line of hlLines) {
        page.drawText(line, {
          x: 120,
          y: currY,
          size: 25,
          font: fontBold,
          color: vibrantPurple,
        });
        currY -= 32;
      }
      currY -= 12;
    }

    // Body Lines (Multi-line wrapped strictly within card boundary)
    if (cardContent.bodyLines && cardContent.bodyLines.length > 0) {
      for (const rawLine of cardContent.bodyLines) {
        const wrapped = wrapTextByWidth(cleanAscii(rawLine), fontRegular, 22, maxInnerW);
        for (const line of wrapped) {
          page.drawText(line, {
            x: 120,
            y: currY,
            size: 22,
            font: fontRegular,
            color: textLight,
          });
          currY -= 30;
        }
        currY -= 8;
      }
    }
  }

  // 4. Bottom Takeaway Quote (Safely wrapped and centered within bounds)
  if (slide.takeawayQuote) {
    drawTakeawayQuote(page, fontRegular, slide.takeawayQuote, {
      startY: 175,
      maxWidth: 880,
      fontSize: 20,
    });
  }
}
