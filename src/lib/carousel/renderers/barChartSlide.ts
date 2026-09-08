import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderBarChartSlide(ctx: SlideRenderContext): void {
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

  const bars = slide.chartData || [];
  let barY = chartY + chartH - 90;
  const maxBarWidth = 520;

  for (const item of bars) {
    const isHigh = item.isHighlight;
    const nameClean = cleanAscii(item.name);

    page.drawText(nameClean, {
      x: 120,
      y: barY + 10,
      size: 24,
      font: isHigh ? fontBold : fontRegular,
      color: isHigh ? neonCyan : textWhite,
    });

    // Background Track Bar
    page.drawRectangle({
      x: 340,
      y: barY + 4,
      width: maxBarWidth,
      height: 32,
      color: rgb(0.08, 0.12, 0.22),
    });

    // Filled Value Bar
    const fillWidth = (item.pct / 100) * maxBarWidth;
    page.drawRectangle({
      x: 340,
      y: barY + 4,
      width: Math.max(fillWidth, 8),
      height: 32,
      color: isHigh ? neonCyan : electricBlue,
    });

    // Percentage Label
    page.drawText(`${item.pct}%`, {
      x: 340 + maxBarWidth + 20,
      y: barY + 10,
      size: 22,
      font: fontBold,
      color: isHigh ? neonCyan : textWhite,
    });

    barY -= 95;
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
