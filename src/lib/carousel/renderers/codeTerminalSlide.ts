import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, vibrantPurple, codeBg, textWhite, textLight, textMuted } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, wrapTextByWidth, drawTakeawayQuote } from '../utils';

export function renderCodeTerminalSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular, fontCode } = fonts;

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
  const cardH = Math.max(400, cardTop - cardBottom);
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

  const cardContent = slide.cardContent || {
    badge: slide.tag || 'ARCHITECTURE',
    title: slide.headline,
    bodyLines: slide.points || ['Key architectural takeaways for high-scale systems.'],
  };

  const maxInnerW = 840;
  let currY = cardY + cardH - 50;

  // Badge
  if (cardContent.badge) {
    page.drawText(cleanAscii(cardContent.badge), {
      x: 110,
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
      x: 110,
      y: currY,
      size: 18,
      font: fontRegular,
      color: electricBlue,
    });
    currY -= 28;
  }

  // Title (Wrapped)
  if (cardContent.title) {
    const titleLines = wrapTextByWidth(cleanAscii(cardContent.title), fontBold, 32, maxInnerW);
    for (const line of titleLines) {
      page.drawText(line, {
        x: 110,
        y: currY,
        size: 32,
        font: fontBold,
        color: textWhite,
      });
      currY -= 40;
    }
    currY -= 6;
  }

  // Divider Line
  page.drawLine({
    start: { x: 110, y: currY },
    end: { x: 970, y: currY },
    thickness: 1,
    color: rgb(0.15, 0.22, 0.35),
  });
  currY -= 30;

  // Highlight Text (Wrapped)
  if (cardContent.highlightText) {
    const hlLines = wrapTextByWidth(cleanAscii(cardContent.highlightText), fontBold, 24, maxInnerW);
    for (const line of hlLines) {
      page.drawText(line, {
        x: 110,
        y: currY,
        size: 24,
        font: fontBold,
        color: vibrantPurple,
      });
      currY -= 30;
    }
    currY -= 10;
  }

  // Body Lines (Wrapped)
  if (cardContent.bodyLines && cardContent.bodyLines.length > 0) {
    for (const bl of cardContent.bodyLines) {
      const wrapped = wrapTextByWidth(cleanAscii(bl), fontRegular, 22, maxInnerW);
      for (const line of wrapped) {
        page.drawText(line, {
          x: 110,
          y: currY,
          size: 22,
          font: fontRegular,
          color: textLight,
        });
        currY -= 28;
      }
      currY -= 6;
    }
  }

  // If codeSnippet present, draw bounded code terminal box
  if (slide.codeSnippet) {
    const rawLines = slide.codeSnippet.split('\n').slice(0, 4);
    const termH = 150;
    const termY = Math.max(cardY + 30, currY - termH - 10);

    page.drawRectangle({
      x: 110,
      y: termY,
      width: 860,
      height: termH,
      color: codeBg,
      borderColor: electricBlue,
      borderWidth: 1.5,
    });

    let codeY = termY + termH - 32;
    for (const cl of rawLines) {
      const cleanLine = cleanAscii(cl);
      // Ensure code doesn't overflow terminal width (820px)
      let displayLine = cleanLine;
      if (fontCode.widthOfTextAtSize(displayLine, 17) > 820) {
        while (displayLine.length > 10 && fontCode.widthOfTextAtSize(displayLine + '...', 17) > 820) {
          displayLine = displayLine.slice(0, -1);
        }
        displayLine += '...';
      }

      page.drawText(displayLine, {
        x: 130,
        y: codeY,
        size: 17,
        font: fontCode,
        color: displayLine.trim().startsWith('//') ? textMuted : neonCyan,
      });
      codeY -= 28;
    }
  }

  // 4. Bottom Takeaway Quote
  if (slide.takeawayQuote) {
    drawTakeawayQuote(page, fontRegular, slide.takeawayQuote, {
      startY: 175,
      maxWidth: 880,
      fontSize: 20,
    });
  }
}
