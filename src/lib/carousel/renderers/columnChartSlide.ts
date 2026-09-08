import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii } from '../utils';

export function renderColumnChartSlide(ctx: SlideRenderContext): void {
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

  // Chart Container Card
  const chartY = 320;
  const chartH = 740;
  page.drawRectangle({
    x: 70,
    y: chartY,
    width: 940,
    height: chartH,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 2,
  });

  const columns = slide.columnData || [];
  const colBaseY = chartY + 120;
  const colWidth = 100;
  const startX = 130;
  const colSpacing = 140;

  for (let cIdx = 0; cIdx < columns.length; cIdx++) {
    const cItem = columns[cIdx];
    const isHigh = cItem.isHighlight;
    const cX = startX + cIdx * colSpacing;
    const barHeight = Math.max((cItem.pct / 30) * 420, 30);

    // Percentage Label above column
    const pctStr = `${cItem.pct}%`;
    const pctW = fontBold.widthOfTextAtSize(pctStr, 22);
    page.drawText(pctStr, {
      x: cX + colWidth / 2 - pctW / 2,
      y: colBaseY + barHeight + 14,
      size: 22,
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
    const lW = fontBold.widthOfTextAtSize(lClean, 20);
    page.drawText(lClean, {
      x: cX + colWidth / 2 - lW / 2,
      y: colBaseY - 35,
      size: 20,
      font: fontBold,
      color: isHigh ? neonCyan : textWhite,
    });

    if (cItem.sub) {
      const subClean = cleanAscii(cItem.sub);
      const subW = fontRegular.widthOfTextAtSize(subClean, 16);
      page.drawText(subClean, {
        x: cX + colWidth / 2 - subW / 2,
        y: colBaseY - 60,
        size: 16,
        font: fontRegular,
        color: textLight,
      });
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
