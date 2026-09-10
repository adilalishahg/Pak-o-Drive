import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, drawTakeawayQuote } from '../utils';

export function renderBarChartSlide(ctx: SlideRenderContext): void {
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

  const bars = slide.chartData || [];
  let barY = cardY + cardH - 85;
  const maxBarWidth = 500;
  const barStartX = 360;

  for (const item of bars) {
    const isHigh = item.isHighlight;
    const nameClean = cleanAscii(item.name);
    const activeFont = isHigh ? fontBold : fontRegular;

    // Scale label size so it never collides with bar track at barStartX
    let labelSize = 22;
    while (labelSize > 14 && activeFont.widthOfTextAtSize(nameClean, labelSize) > 220) {
      labelSize -= 1;
    }

    page.drawText(nameClean, {
      x: 120,
      y: barY + 8,
      size: labelSize,
      font: activeFont,
      color: isHigh ? neonCyan : textWhite,
    });

    // Background Track Bar
    page.drawRectangle({
      x: barStartX,
      y: barY + 4,
      width: maxBarWidth,
      height: 30,
      color: rgb(0.08, 0.12, 0.22),
    });

    // Filled Value Bar
    const fillWidth = (item.pct / 100) * maxBarWidth;
    page.drawRectangle({
      x: barStartX,
      y: barY + 4,
      width: Math.max(fillWidth, 8),
      height: 30,
      color: isHigh ? neonCyan : electricBlue,
    });

    // Percentage Label
    page.drawText(`${item.pct}%`, {
      x: barStartX + maxBarWidth + 18,
      y: barY + 8,
      size: 20,
      font: fontBold,
      color: isHigh ? neonCyan : textWhite,
    });

    barY -= 90;
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
