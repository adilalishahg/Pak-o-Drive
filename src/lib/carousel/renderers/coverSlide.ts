import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight, textMuted } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderCoverSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide, embeddedCoverImage } = ctx;
  const { fontBold, fontRegular } = fonts;

  // 1. Author Header Bar (Top Branding with User Name & Follow Button)
  const headerY = SLIDE_HEIGHT - 65;

  // 1A. Avatar Monogram Circle ("SA")
  const avatarX = 95;
  const avatarY = headerY - 5;
  page.drawCircle({
    x: avatarX,
    y: avatarY,
    size: 24,
    color: cardBg,
    borderColor: neonCyan,
    borderWidth: 2,
  });
  const saW = fontBold.widthOfTextAtSize('SA', 17);
  page.drawText('SA', {
    x: avatarX - saW / 2,
    y: avatarY - 6,
    size: 17,
    font: fontBold,
    color: neonCyan,
  });

  // 1B. Author Name & Handle
  page.drawText('Syed Adil Ali', {
    x: 135,
    y: headerY + 4,
    size: 22,
    font: fontBold,
    color: textWhite,
  });
  page.drawText('@Syed Adil Ali', {
    x: 135,
    y: headerY - 18,
    size: 15,
    font: fontRegular,
    color: neonCyan,
  });

  // 1C. High-Contrast "+ Follow" Action Pill Button
  const btnW = 135;
  const btnH = 38;
  const btnX = SLIDE_WIDTH - 70 - btnW;
  const btnY = headerY - 18;

  page.drawRectangle({
    x: btnX,
    y: btnY,
    width: btnW,
    height: btnH,
    color: neonCyan,
  });
  const btnText = '+ Follow';
  const btnTextW = fontBold.widthOfTextAtSize(btnText, 18);
  page.drawText(btnText, {
    x: btnX + btnW / 2 - btnTextW / 2,
    y: btnY + 11,
    size: 18,
    font: fontBold,
    color: rgb(0.02, 0.04, 0.08),
  });

  // 1D. Subtle Top Divider Line below header
  page.drawLine({
    start: { x: 70, y: headerY - 34 },
    end: { x: SLIDE_WIDTH - 70, y: headerY - 34 },
    thickness: 1,
    color: rgb(0.12, 0.18, 0.30),
  });

  // 2. Category Tag (Optional Badge)
  let contentStartY = headerY - 60;
  if (slide.tag) {
    const tagClean = cleanAscii(slide.tag);
    const tagW = fontBold.widthOfTextAtSize(tagClean, 18);
    page.drawText(tagClean, {
      x: SLIDE_WIDTH / 2 - tagW / 2,
      y: contentStartY,
      size: 18,
      font: fontBold,
      color: electricBlue,
    });
    contentStartY -= 35;
  }

  // 3. Main Headline (Auto-fitted, zero overflow)
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: contentStartY,
    maxWidth: 920,
    maxFontSize: 46,
    minFontSize: 28,
    align: 'center',
    color: textWhite,
  });

  // 4. Subheadline (if present)
  let lowestTextY = headFit.bottomY;
  if (slide.subheadline) {
    const subFit = drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 14,
      maxWidth: 900,
      maxFontSize: 24,
      minFontSize: 18,
      align: 'center',
      color: textLight,
    });
    lowestTextY = subFit.bottomY;
  }

  // 5. Center 3D Graphic Frame (Dynamically scaled between text and bottom pills)
  const frameBottom = 200;
  const frameTop = Math.max(frameBottom + 300, lowestTextY - 30);
  const frameH = frameTop - frameBottom;
  const frameY = frameBottom;

  page.drawRectangle({
    x: 70,
    y: frameY,
    width: 940,
    height: frameH,
    color: cardBg,
    borderColor: cardBorder,
    borderWidth: 2,
  });

  if (embeddedCoverImage) {
    page.drawImage(embeddedCoverImage, {
      x: 72,
      y: frameY + 2,
      width: 936,
      height: frameH - 4,
    });
  } else {
    // Fallback Blueprint Graphic
    const fallbackTitle = 'AI ARCHITECTURE MATRIX 2026';
    page.drawText(fallbackTitle, {
      x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(fallbackTitle, 32) / 2,
      y: frameY + frameH / 2,
      size: 32,
      font: fontBold,
      color: neonCyan,
    });
  }

  // 6. Bottom Tech Pill
  const rawFooter = slide.footer || '';
  const pillText = rawFooter && !rawFooter.toLowerCase().includes('pakodrive')
    ? rawFooter
    : 'ARCHITECTURE MASTERCLASS 2026';
  const pillW = fontBold.widthOfTextAtSize(pillText, 22) + 60;
  page.drawRectangle({
    x: SLIDE_WIDTH / 2 - pillW / 2,
    y: 110,
    width: pillW,
    height: 48,
    color: rgb(0.05, 0.09, 0.17),
    borderColor: cardBorder,
    borderWidth: 1.5,
  });
  page.drawText(pillText, {
    x: SLIDE_WIDTH / 2 - fontBold.widthOfTextAtSize(pillText, 22) / 2,
    y: 125,
    size: 22,
    font: fontBold,
    color: textWhite,
  });

  // 7. Bottom Swipe Indicator
  const swipeLabel = 'Swipe to continue ->';
  const swipeW = fontBold.widthOfTextAtSize(swipeLabel, 20);
  page.drawText(swipeLabel, {
    x: SLIDE_WIDTH / 2 - swipeW / 2,
    y: 55,
    size: 20,
    font: fontBold,
    color: textMuted,
  });
}
