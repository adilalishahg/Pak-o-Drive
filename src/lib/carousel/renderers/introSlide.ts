import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, wrapTextByWidth } from '../utils';

export function renderIntroSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // 1. Glowing Robot / AI Avatar Icon (Positioned cleanly at upper third)
  const iconY = SLIDE_HEIGHT - 230;
  page.drawCircle({
    x: SLIDE_WIDTH / 2,
    y: iconY,
    size: 48,
    color: cardBg,
    borderColor: neonCyan,
    borderWidth: 2,
  });
  const aiW = fontBold.widthOfTextAtSize('AI', 32);
  page.drawText('AI', {
    x: SLIDE_WIDTH / 2 - aiW / 2,
    y: iconY - 11,
    size: 32,
    font: fontBold,
    color: neonCyan,
  });

  // 2. Tag
  const tagClean = cleanAscii(slide.tag || 'SURVEY DATA');
  const tW = fontBold.widthOfTextAtSize(tagClean, 18);
  const tagY = iconY - 70;
  page.drawText(tagClean, {
    x: SLIDE_WIDTH / 2 - tW / 2,
    y: tagY,
    size: 18,
    font: fontBold,
    color: electricBlue,
  });

  // 3. Headline
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: tagY - 35,
    maxWidth: 900,
    maxFontSize: 42,
    minFontSize: 26,
    align: 'center',
    color: textWhite,
  });

  // 4. Subheadline (Positioned strictly below headline)
  let lowestY = headFit.bottomY;
  if (slide.subheadline) {
    const subFit = drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 14,
      maxWidth: 900,
      maxFontSize: 22,
      minFontSize: 16,
      align: 'center',
      color: textLight,
    });
    lowestY = subFit.bottomY;
  }

  // 5. Bullet Points (Positioned strictly below subheadline with dynamic height & text wrapping)
  if (slide.points && slide.points.length > 0) {
    let currentY = lowestY - 35;
    const maxTextWidth = 780;

    for (const pt of slide.points) {
      const pClean = cleanAscii(pt);
      const wrappedLines = wrapTextByWidth(pClean, fontRegular, 22, maxTextWidth);
      const lineCount = Math.max(1, wrappedLines.length);
      const boxH = Math.max(64, 20 + lineCount * 28);
      const boxY = currentY - boxH;

      // Card Background
      page.drawRectangle({
        x: 100,
        y: boxY,
        width: 880,
        height: boxH,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 1.5,
      });

      // Neon Cyan Bullet Dot
      page.drawCircle({
        x: 135,
        y: boxY + boxH / 2,
        size: 6,
        color: neonCyan,
      });

      // Wrapped Text Lines
      let textY = boxY + boxH - (lineCount === 1 ? 38 : 26);
      for (const line of wrappedLines) {
        page.drawText(line, {
          x: 165,
          y: textY,
          size: 22,
          font: fontRegular,
          color: textWhite,
        });
        textY -= 28;
      }

      currentY = boxY - 18;
    }
  }
}
