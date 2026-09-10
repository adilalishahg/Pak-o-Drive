import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, vibrantPurple, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, drawTakeawayQuote } from '../utils';

export function renderDiagramSlide(ctx: SlideRenderContext): void {
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
  const cardH = Math.max(420, cardTop - cardBottom);
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

  const diagram = slide.diagramData;
  if (diagram) {
    // Left Tasks List
    let lY = cardY + cardH - 100;
    for (const t of diagram.leftTasks) {
      const tClean = cleanAscii(t);
      page.drawRectangle({
        x: 105,
        y: lY,
        width: 320,
        height: 54,
        color: rgb(0.06, 0.10, 0.18),
        borderColor: cardBorder,
        borderWidth: 1.5,
      });

      // Fit text size cleanly inside 290px available box width
      let fSize = 19;
      while (fSize > 13 && fontRegular.widthOfTextAtSize(tClean, fSize) > 285) {
        fSize -= 1;
      }

      page.drawText(tClean, {
        x: 125,
        y: lY + 18,
        size: fSize,
        font: fontRegular,
        color: textWhite,
      });
      lY -= 72;
    }

    // Center Node 1: User / You
    page.drawRectangle({
      x: 460,
      y: cardY + cardH - 180,
      width: 160,
      height: 80,
      color: electricBlue,
      borderColor: neonCyan,
      borderWidth: 2,
    });
    page.drawText('YOU', {
      x: 510,
      y: cardY + cardH - 135,
      size: 26,
      font: fontBold,
      color: textWhite,
    });
    page.drawText('Decide & Delegate', {
      x: 470,
      y: cardY + cardH - 165,
      size: 15,
      font: fontRegular,
      color: textWhite,
    });

    // Arrow down
    page.drawText('|', {
      x: 535,
      y: cardY + cardH - 208,
      size: 24,
      font: fontBold,
      color: neonCyan,
    });
    page.drawText('v', {
      x: 533,
      y: cardY + cardH - 232,
      size: 24,
      font: fontBold,
      color: neonCyan,
    });

    // Center Node 2: AI Autonomous Agent
    page.drawRectangle({
      x: 460,
      y: cardY + cardH - 345,
      width: 160,
      height: 80,
      color: vibrantPurple,
      borderColor: rgb(0.8, 0.6, 1.0),
      borderWidth: 2,
    });
    page.drawText('AI AGENT', {
      x: 485,
      y: cardY + cardH - 300,
      size: 24,
      font: fontBold,
      color: textWhite,
    });
    page.drawText('Execute & Verify', {
      x: 475,
      y: cardY + cardH - 330,
      size: 15,
      font: fontRegular,
      color: textWhite,
    });

    // Right Outcomes List
    let rY = cardY + cardH - 100;
    for (const o of diagram.rightOutcomes) {
      const oClean = cleanAscii(o);
      page.drawRectangle({
        x: 655,
        y: rY,
        width: 320,
        height: 54,
        color: rgb(0.06, 0.10, 0.18),
        borderColor: neonCyan,
        borderWidth: 1.5,
      });

      let fSize = 19;
      while (fSize > 13 && fontBold.widthOfTextAtSize(oClean, fSize) > 285) {
        fSize -= 1;
      }

      page.drawText(oClean, {
        x: 675,
        y: rY + 18,
        size: fSize,
        font: fontBold,
        color: neonCyan,
      });
      rY -= 72;
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
