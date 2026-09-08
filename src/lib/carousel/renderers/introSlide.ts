import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderIntroSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // Glowing Robot / AI Avatar Icon
  page.drawCircle({
    x: SLIDE_WIDTH / 2,
    y: SLIDE_HEIGHT - 380,
    size: 60,
    color: cardBg,
    borderColor: neonCyan,
    borderWidth: 2,
  });
  page.drawText('AI', {
    x: SLIDE_WIDTH / 2 - 20,
    y: SLIDE_HEIGHT - 395,
    size: 40,
    font: fontBold,
    color: neonCyan,
  });

  // Tag
  const tagClean = cleanAscii(slide.tag || 'SURVEY DATA');
  const tW = fontBold.widthOfTextAtSize(tagClean, 22);
  page.drawText(tagClean, {
    x: SLIDE_WIDTH / 2 - tW / 2,
    y: SLIDE_HEIGHT - 500,
    size: 22,
    font: fontBold,
    color: electricBlue,
  });

  // Headline
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: SLIDE_HEIGHT - 560,
    maxWidth: 920,
    maxFontSize: 44,
    minFontSize: 28,
    align: 'center',
    color: textWhite,
  });

  // Subheadline
  if (slide.subheadline) {
    drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 15,
      maxWidth: 920,
      maxFontSize: 26,
      minFontSize: 18,
      align: 'center',
      color: textLight,
    });
  }

  // Bullet Points
  if (slide.points && slide.points.length > 0) {
    let pY = SLIDE_HEIGHT - 740;
    for (const pt of slide.points) {
      const pClean = cleanAscii(pt);
      page.drawRectangle({
        x: 100,
        y: pY,
        width: 880,
        height: 64,
        color: cardBg,
        borderColor: cardBorder,
        borderWidth: 1.5,
      });
      page.drawCircle({
        x: 140,
        y: pY + 32,
        size: 8,
        color: neonCyan,
      });
      page.drawText(pClean, {
        x: 170,
        y: pY + 22,
        size: 24,
        font: fontRegular,
        color: textWhite,
      });
      pY -= 88;
    }
  }
}
