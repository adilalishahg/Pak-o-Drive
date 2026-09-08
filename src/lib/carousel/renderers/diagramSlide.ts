import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, vibrantPurple, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderDiagramSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // Headline
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: SLIDE_HEIGHT - 170,
    maxWidth: 920,
    maxFontSize: 46,
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

  // Diagram Card Frame
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

  const diagram = slide.diagramData;
  if (diagram) {
    // Left Tasks List
    let lY = cardY + cardH - 120;
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
      page.drawText(tClean, {
        x: 125,
        y: lY + 18,
        size: 20,
        font: fontRegular,
        color: textWhite,
      });
      lY -= 76;
    }

    // Center Node 1: User / You
    page.drawRectangle({
      x: 460,
      y: cardY + cardH - 220,
      width: 160,
      height: 80,
      color: electricBlue,
      borderColor: neonCyan,
      borderWidth: 2,
    });
    page.drawText('YOU', {
      x: 510,
      y: cardY + cardH - 175,
      size: 26,
      font: fontBold,
      color: textWhite,
    });
    page.drawText('Decide & Delegate', {
      x: 470,
      y: cardY + cardH - 205,
      size: 16,
      font: fontRegular,
      color: textWhite,
    });

    // Arrow down
    page.drawText('|', {
      x: 535,
      y: cardY + cardH - 250,
      size: 24,
      font: fontBold,
      color: neonCyan,
    });
    page.drawText('v', {
      x: 533,
      y: cardY + cardH - 275,
      size: 24,
      font: fontBold,
      color: neonCyan,
    });

    // Center Node 2: AI Autonomous Agent
    page.drawRectangle({
      x: 460,
      y: cardY + cardH - 400,
      width: 160,
      height: 80,
      color: vibrantPurple,
      borderColor: rgb(0.8, 0.6, 1.0),
      borderWidth: 2,
    });
    page.drawText('AI AGENT', {
      x: 485,
      y: cardY + cardH - 355,
      size: 24,
      font: fontBold,
      color: textWhite,
    });
    page.drawText('Execute & Verify', {
      x: 475,
      y: cardY + cardH - 385,
      size: 16,
      font: fontRegular,
      color: textWhite,
    });

    // Right Outcomes List
    let rY = cardY + cardH - 120;
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
      page.drawText(oClean, {
        x: 675,
        y: rY + 18,
        size: 20,
        font: fontBold,
        color: neonCyan,
      });
      rY -= 76;
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
