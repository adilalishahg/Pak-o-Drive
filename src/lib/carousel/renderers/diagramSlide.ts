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
  const boxCenterY = cardY + cardH / 2;

  // 1. Top Blueprint Tag inside Card
  const diagTag = '[ DECOUPLED EVENT STREAMING ARCHITECTURE ]';
  const dtW = fontBold.widthOfTextAtSize(diagTag, 15);
  page.drawText(diagTag, {
    x: SLIDE_WIDTH / 2 - dtW / 2,
    y: cardY + cardH - 38,
    size: 15,
    font: fontBold,
    color: electricBlue,
  });

  if (diagram) {
    // ── Custom Diagram Data (Mathematically Centered Vertically in Box) ──
    const itemH = 68;
    const itemGap = 28;
    const totalDiagH = 3 * itemH + 2 * itemGap; // 260px
    const startY = boxCenterY + totalDiagH / 2 - itemH;

    // Left Tasks List (Vertically Centered)
    let lY = startY;
    for (const t of diagram.leftTasks.slice(0, 3)) {
      const tClean = cleanAscii(t);
      page.drawRectangle({
        x: 95,
        y: lY,
        width: 320,
        height: itemH,
        color: rgb(0.06, 0.10, 0.18),
        borderColor: cardBorder,
        borderWidth: 1.5,
      });

      let fSize = 18;
      while (fSize > 12 && fontRegular.widthOfTextAtSize(tClean, fSize) > 280) {
        fSize -= 1;
      }

      page.drawText(tClean, {
        x: 115,
        y: lY + 24,
        size: fSize,
        font: fontRegular,
        color: textWhite,
      });
      lY -= itemH + itemGap;
    }

    // Center Hub Node (Centered at boxCenterY)
    const hubW = 180;
    const hubH = 110;
    const hubX = SLIDE_WIDTH / 2 - hubW / 2;
    const hubY = boxCenterY - hubH / 2;

    page.drawRectangle({
      x: hubX,
      y: hubY,
      width: hubW,
      height: hubH,
      color: electricBlue,
      borderColor: neonCyan,
      borderWidth: 2,
    });
    page.drawText('YOU', {
      x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize('YOU', 24) / 2,
      y: hubY + 68,
      size: 24,
      font: fontBold,
      color: textWhite,
    });
    page.drawText('Decide & Delegate', {
      x: SLIDE_WIDTH / 2 - fontRegular.widthOfTextAtSize('Decide & Delegate', 14) / 2,
      y: hubY + 36,
      size: 14,
      font: fontRegular,
      color: textWhite,
    });

    // Connecting Arrows to Left and Right
    page.drawText('->', {
      x: 425,
      y: boxCenterY - 8,
      size: 20,
      font: fontBold,
      color: neonCyan,
    });
    page.drawText('->', {
      x: 635,
      y: boxCenterY - 8,
      size: 20,
      font: fontBold,
      color: neonCyan,
    });

    // Right Outcomes List (Vertically Centered)
    let rY = startY;
    for (const o of diagram.rightOutcomes.slice(0, 3)) {
      const oClean = cleanAscii(o);
      page.drawRectangle({
        x: 665,
        y: rY,
        width: 320,
        height: itemH,
        color: rgb(0.06, 0.10, 0.18),
        borderColor: neonCyan,
        borderWidth: 1.5,
      });

      let fSize = 18;
      while (fSize > 12 && fontBold.widthOfTextAtSize(oClean, fSize) > 280) {
        fSize -= 1;
      }

      page.drawText(oClean, {
        x: 685,
        y: rY + 24,
        size: fSize,
        font: fontBold,
        color: neonCyan,
      });
      rY -= itemH + itemGap;
    }

  } else if (ctx.embeddedCoverImage) {
    page.drawImage(ctx.embeddedCoverImage, {
      x: 72,
      y: cardY + 2,
      width: 936,
      height: cardH - 4,
    });
  } else {
    // ── High-Aesthetic Architecture Flow Nodes (Mathematically Centered Vertically) ──
    const itemH = 68;
    const itemGap = 32;
    const totalDiagH = 3 * itemH + 2 * itemGap; // 268px
    const startY = boxCenterY + totalDiagH / 2 - itemH;

    // Left Producers List
    const fallbackTasks = ['Domain Events Emitted', 'Event Broker Queuing', 'Microservice Consumers'];
    let lY = startY;
    for (const t of fallbackTasks) {
      page.drawRectangle({
        x: 95,
        y: lY,
        width: 320,
        height: itemH,
        color: rgb(0.06, 0.10, 0.18),
        borderColor: cardBorder,
        borderWidth: 1.5,
      });
      page.drawText(t, {
        x: 115,
        y: lY + 24,
        size: 17,
        font: fontRegular,
        color: textWhite,
      });
      lY -= itemH + itemGap;
    }

    // Center Hub Node (EVENT BUS - Vertically Centered at boxCenterY)
    const hubW = 190;
    const hubH = 120;
    const hubX = SLIDE_WIDTH / 2 - hubW / 2;
    const hubY = boxCenterY - hubH / 2;

    page.drawRectangle({
      x: hubX,
      y: hubY,
      width: hubW,
      height: hubH,
      color: electricBlue,
      borderColor: neonCyan,
      borderWidth: 2,
    });
    page.drawText('EVENT BUS', {
      x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize('EVENT BUS', 22) / 2,
      y: hubY + 68,
      size: 22,
      font: fontBold,
      color: textWhite,
    });
    page.drawText('Asynchronous P99', {
      x: SLIDE_WIDTH / 2 - fontRegular.widthOfTextAtSize('Asynchronous P99', 14) / 2,
      y: hubY + 36,
      size: 14,
      font: fontRegular,
      color: textWhite,
    });

    // Connecting Arrows to Left and Right
    page.drawText('->', {
      x: 425,
      y: boxCenterY - 8,
      size: 20,
      font: fontBold,
      color: neonCyan,
    });
    page.drawText('->', {
      x: 635,
      y: boxCenterY - 8,
      size: 20,
      font: fontBold,
      color: neonCyan,
    });

    // Right Outcomes List (Vertically Centered)
    const fallbackOutcomes = ['Zero Data Loss SLA', 'Horizontal Auto-Scale', 'Strict Fault Isolation'];
    let rY = startY;
    for (const o of fallbackOutcomes) {
      page.drawRectangle({
        x: 665,
        y: rY,
        width: 320,
        height: itemH,
        color: rgb(0.06, 0.10, 0.18),
        borderColor: neonCyan,
        borderWidth: 1.5,
      });
      page.drawText(o, {
        x: 685,
        y: rY + 24,
        size: 17,
        font: fontBold,
        color: neonCyan,
      });
      rY -= itemH + itemGap;
    }
  }

  // 2. Bottom Flow Indicator inside Card
  const flowText = '[ PRODUCER SERVICES ]   ->   [ ASYNC BROKER ]   ->   [ CONSUMER WORKERS ]';
  const ftW = fontBold.widthOfTextAtSize(flowText, 14);
  page.drawText(flowText, {
    x: SLIDE_WIDTH / 2 - ftW / 2,
    y: cardY + 36,
    size: 14,
    font: fontBold,
    color: neonCyan,
  });

  // 3. Bottom Takeaway Quote Banner (Clean margin below card)
  if (slide.takeawayQuote) {
    drawTakeawayQuote(page, fontRegular, slide.takeawayQuote, {
      startY: cardY - 25,
      maxWidth: 880,
      fontSize: 20,
    });
  }
}
