import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, wrapTextByWidth } from '../utils';

export function renderIntroSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // 1. Glowing AI Avatar Icon (Positioned cleanly with generous top breathing room)
  const iconY = SLIDE_HEIGHT - 120;
  const avatarRadius = 36;
  page.drawCircle({
    x: SLIDE_WIDTH / 2,
    y: iconY,
    size: avatarRadius,
    color: cardBg,
    borderColor: neonCyan,
    borderWidth: 2,
  });
  const aiW = fontBold.widthOfTextAtSize('AI', 24);
  page.drawText('AI', {
    x: SLIDE_WIDTH / 2 - aiW / 2,
    y: iconY - 8,
    size: 24,
    font: fontBold,
    color: neonCyan,
  });

  // 2. Category Tag Pill (Clear 50px gap below AI circle, inside dedicated badge)
  const tagClean = cleanAscii(slide.tag || 'THE CORE BOTTLENECK');
  const tW = fontBold.widthOfTextAtSize(tagClean, 15);
  const pillW = tW + 36;
  const pillH = 32;
  const pillY = iconY - avatarRadius - 42; // Generous 42px clearance below circle bottom

  page.drawRectangle({
    x: SLIDE_WIDTH / 2 - pillW / 2,
    y: pillY,
    width: pillW,
    height: pillH,
    color: rgb(0.06, 0.12, 0.22),
    borderColor: electricBlue,
    borderWidth: 1.2,
  });
  page.drawText(tagClean, {
    x: SLIDE_WIDTH / 2 - tW / 2,
    y: pillY + 9,
    size: 15,
    font: fontBold,
    color: electricBlue,
  });

  // 3. Headline (Generous 45px clearance below category tag pill)
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: pillY - 45,
    maxWidth: 920,
    maxFontSize: 38,
    minFontSize: 26,
    align: 'center',
    color: textWhite,
  });

  // 4. Subheadline (Generous 26px gap below headline)
  let lowestY = headFit.bottomY;
  if (slide.subheadline) {
    const subFit = drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 26,
      maxWidth: 900,
      maxFontSize: 22,
      minFontSize: 16,
      align: 'center',
      color: textLight,
    });
    lowestY = subFit.bottomY;
  }

  // 5. Evenly Distributed Failure Mode Cards (Filling vertical canvas with zero empty void)
  const effectivePoints = (slide.points && slide.points.length > 0)
    ? slide.points
    : [
        'Tight coupling across distributed services creates cascading failure loops under traffic spikes.',
        'Synchronous request-reply chains amplify P99 latency and exhaust connection pools.',
        'Unbounded state mutations without strict transaction boundaries risk silent data corruption.',
      ];

  const pointsToRender = effectivePoints.slice(0, 3);
  const cardCount = pointsToRender.length;
  
  // Available vertical canvas from lowestTextY down to footer safe zone (Y=140)
  const availableTop = lowestY - 45;
  const bottomLimit = 140;
  const totalAvailH = availableTop - bottomLimit; // ~760px

  const cardH = 190;
  const totalCardH = cardCount * cardH;
  const cardGap = Math.max(30, Math.floor((totalAvailH - totalCardH) / Math.max(1, cardCount - 1)));

  let currY = availableTop;
  const maxInnerW = 750;

  for (let idx = 0; idx < cardCount; idx++) {
    const pt = pointsToRender[idx];
    const pClean = cleanAscii(pt);
    const boxY = currY - cardH;

    // Card Background & Neon Glowing Border
    page.drawRectangle({
      x: 80,
      y: boxY,
      width: 920,
      height: cardH,
      color: rgb(0.06, 0.10, 0.19),
      borderColor: cardBorder,
      borderWidth: 1.5,
    });

    // Top Identifier Tag inside card (Placed with generous 24px top padding)
    const stepLabel = `FAILURE MODE 0${idx + 1}`;
    const stepW = fontBold.widthOfTextAtSize(stepLabel, 13) + 24;
    const tagH = 26;
    const tagBoxY = boxY + cardH - 24 - tagH;

    page.drawRectangle({
      x: 120,
      y: tagBoxY,
      width: stepW,
      height: tagH,
      color: rgb(0.08, 0.15, 0.28),
      borderColor: electricBlue,
      borderWidth: 1,
    });
    page.drawText(stepLabel, {
      x: 132,
      y: tagBoxY + 7,
      size: 13,
      font: fontBold,
      color: electricBlue,
    });

    // Text Lines (Starting with clean 22px margin below tag)
    const textStartY = tagBoxY - 36;
    const wrappedLines = wrapTextByWidth(pClean, fontRegular, 26, maxInnerW);

    // Glowing Neon Cyan Bullet Dot (PERFECTLY ALIGNED with first line of text!)
    const bulletDotY = textStartY + 8;
    page.drawCircle({
      x: 135,
      y: bulletDotY,
      size: 13,
      color: rgb(0.0, 0.94, 1.0),
      opacity: 0.22,
    });
    page.drawCircle({
      x: 135,
      y: bulletDotY,
      size: 6,
      color: neonCyan,
    });

    let lineY = textStartY;
    for (const line of wrappedLines) {
      page.drawText(line, {
        x: 175,
        y: lineY,
        size: 26,
        font: fontRegular,
        color: textLight,
      });
      lineY -= 36;
    }

    currY = boxY - cardGap;
  }
}
