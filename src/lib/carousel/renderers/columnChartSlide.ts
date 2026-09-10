import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, drawTakeawayQuote } from '../utils';

export function renderColumnChartSlide(ctx: SlideRenderContext): void {
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

  // 3. Chart Container Card (Dynamic Sizing)
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

  const columns = slide.columnData || [];
  const totalCols = Math.max(1, columns.length);
  const colBaseY = cardY + 110;
  const availW = 740;
  const colSpacing = availW / totalCols;
  const colWidth = Math.min(95, Math.max(60, colSpacing * 0.7));
  const startX = 70 + (940 - totalCols * colSpacing) / 2 + (colSpacing - colWidth) / 2;
  const maxAvailableH = cardH - 220;

  for (let cIdx = 0; cIdx < columns.length; cIdx++) {
    const cItem = columns[cIdx];
    const isHigh = cItem.isHighlight;
    const cX = startX + cIdx * colSpacing;
    const barHeight = Math.max(25, Math.min(maxAvailableH, (cItem.pct / 50) * maxAvailableH));

    // Percentage Label above column
    const pctStr = `${cItem.pct}%`;
    const pctW = fontBold.widthOfTextAtSize(pctStr, 20);
    page.drawText(pctStr, {
      x: cX + colWidth / 2 - pctW / 2,
      y: colBaseY + barHeight + 12,
      size: 20,
      font: fontBold,
      color: isHigh ? neonCyan : textWhite,
    });

    // Vertical Column
    page.drawRectangle({
      x: cX,
      y: colBaseY,
      width: colWidth,
      height: barHeight,
      color: isHigh ? neonCyan : electricBlue,
      borderColor: isHigh ? rgb(0.5, 0.95, 1.0) : cardBorder,
      borderWidth: 1.5,
    });

    // Label below column
    const lClean = cleanAscii(cItem.label);
    let lSize = 19;
    while (lSize > 12 && fontBold.widthOfTextAtSize(lClean, lSize) > colSpacing - 10) {
      lSize -= 1;
    }
    const lW = fontBold.widthOfTextAtSize(lClean, lSize);
    page.drawText(lClean, {
      x: cX + colWidth / 2 - lW / 2,
      y: colBaseY - 32,
      size: lSize,
      font: fontBold,
      color: isHigh ? neonCyan : textWhite,
    });

    if (cItem.sub) {
      const subClean = cleanAscii(cItem.sub);
      let sSize = 15;
      while (sSize > 10 && fontRegular.widthOfTextAtSize(subClean, sSize) > colSpacing - 10) {
        sSize -= 1;
      }
      const subW = fontRegular.widthOfTextAtSize(subClean, sSize);
      page.drawText(subClean, {
        x: cX + colWidth / 2 - subW / 2,
        y: colBaseY - 54,
        size: sSize,
        font: fontRegular,
        color: textLight,
      });
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
