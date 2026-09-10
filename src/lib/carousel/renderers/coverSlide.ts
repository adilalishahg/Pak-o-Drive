import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, textWhite, textLight, textMuted } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderCoverSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide } = ctx;
  const { fontBold, fontRegular } = fonts;

  // 1. Top Category Tag Pill (Centered at upper canvas)
  const tagClean = cleanAscii(slide.tag || 'SYSTEM ARCHITECTURE // 2026');
  const tagW = fontBold.widthOfTextAtSize(tagClean, 17);
  const pillW = tagW + 48;
  const pillH = 40;
  const pillX = SLIDE_WIDTH / 2 - pillW / 2;
  const pillY = SLIDE_HEIGHT - 120;

  page.drawRectangle({
    x: pillX,
    y: pillY,
    width: pillW,
    height: pillH,
    color: rgb(0.06, 0.12, 0.22),
    borderColor: neonCyan,
    borderWidth: 1.5,
  });
  page.drawText(tagClean, {
    x: SLIDE_WIDTH / 2 - tagW / 2,
    y: pillY + 12,
    size: 17,
    font: fontBold,
    color: neonCyan,
  });

  // 2. Main Headline (Massive, Bold, Centered, High Impact)
  const headFit = drawFittedHeadline(page, fontBold, slide.headline, {
    startY: pillY - 55,
    maxWidth: 940,
    maxFontSize: 56,
    minFontSize: 38,
    align: 'center',
    color: textWhite,
  });

  // 3. Subheadline (Clean Light Cyan/Slate, Centered)
  let lowestTextY = headFit.bottomY;
  if (slide.subheadline) {
    const subFit = drawFittedSubheadline(page, fontRegular, slide.subheadline, {
      startY: headFit.bottomY - 20,
      maxWidth: 900,
      maxFontSize: 26,
      minFontSize: 20,
      align: 'center',
      color: textLight,
    });
    lowestTextY = subFit.bottomY;
  }

  // 4. Subtle Glowing Cyan Divider Line
  const divY = lowestTextY - 35;
  const divW = 320;
  page.drawLine({
    start: { x: SLIDE_WIDTH / 2 - divW / 2, y: divY },
    end: { x: SLIDE_WIDTH / 2 + divW / 2, y: divY },
    thickness: 1.5,
    color: electricBlue,
  });

  // 5. PROMINENT CENTER CREATOR & FOLLOW SPOTLIGHT CARD
  // Dynamically centered in the prime vertical reading area
  const cardW = 840;
  const cardH = 340;
  const cardX = SLIDE_WIDTH / 2 - cardW / 2;
  const cardY = Math.max(210, divY - cardH - 45);

  // Card Outer Glow & Background
  page.drawRectangle({
    x: cardX,
    y: cardY,
    width: cardW,
    height: cardH,
    color: rgb(0.05, 0.09, 0.18),
    borderColor: neonCyan,
    borderWidth: 2,
  });

  // Inner Accent Tag
  const roleTag = 'AUTHOR & TECH ARCHITECT';
  const roleW = fontBold.widthOfTextAtSize(roleTag, 14);
  page.drawText(roleTag, {
    x: SLIDE_WIDTH / 2 - roleW / 2,
    y: cardY + cardH - 35,
    size: 14,
    font: fontBold,
    color: electricBlue,
  });

  // Large Monogram Avatar Circle ("SA")
  const avatarCenterX = SLIDE_WIDTH / 2;
  const avatarCenterY = cardY + cardH - 95;
  const avatarRadius = 38;

  page.drawCircle({
    x: avatarCenterX,
    y: avatarCenterY,
    size: avatarRadius,
    color: cardBg,
    borderColor: neonCyan,
    borderWidth: 2.5,
  });

  const saW = fontBold.widthOfTextAtSize('SA', 28);
  page.drawText('SA', {
    x: avatarCenterX - saW / 2,
    y: avatarCenterY - 10,
    size: 28,
    font: fontBold,
    color: neonCyan,
  });

  // Author Full Name (Large 34px Bold White)
  const nameText = 'Syed Adil Ali';
  const nameW = fontBold.widthOfTextAtSize(nameText, 34);
  page.drawText(nameText, {
    x: SLIDE_WIDTH / 2 - nameW / 2,
    y: cardY + 140,
    size: 34,
    font: fontBold,
    color: textWhite,
  });

  // Creator Handle & Discipline
  const handleText = '@Syed Adil Ali  •  Cloud Systems & Full-Stack';
  const handleW = fontRegular.widthOfTextAtSize(handleText, 18);
  page.drawText(handleText, {
    x: SLIDE_WIDTH / 2 - handleW / 2,
    y: cardY + 108,
    size: 18,
    font: fontRegular,
    color: neonCyan,
  });

  // High-Contrast Solid "+ Follow" Action Button
  const btnW = 260;
  const btnH = 54;
  const btnX = SLIDE_WIDTH / 2 - btnW / 2;
  const btnY = cardY + 36;

  page.drawRectangle({
    x: btnX,
    y: btnY,
    width: btnW,
    height: btnH,
    color: neonCyan,
  });

  const btnText = '+ Follow';
  const btnTextW = fontBold.widthOfTextAtSize(btnText, 22);
  page.drawText(btnText, {
    x: btnX + btnW / 2 - btnTextW / 2,
    y: btnY + 16,
    size: 22,
    font: fontBold,
    color: rgb(0.02, 0.04, 0.10),
  });

  // 6. Unified High-Contrast Bottom Action Pill
  const swipeText = 'SWIPE TO EXPLORE ➔';
  const swipeW = fontBold.widthOfTextAtSize(swipeText, 22) + 64;
  const swipeH = 54;
  const swipeX = SLIDE_WIDTH / 2 - swipeW / 2;
  const swipeY = 95;

  page.drawRectangle({
    x: swipeX,
    y: swipeY,
    width: swipeW,
    height: swipeH,
    color: rgb(0.04, 0.08, 0.16),
    borderColor: neonCyan,
    borderWidth: 2,
  });
  page.drawText(swipeText, {
    x: swipeX + swipeW / 2 - fontBold.widthOfTextAtSize(swipeText, 22) / 2,
    y: swipeY + 17,
    size: 22,
    font: fontBold,
    color: neonCyan,
  });

  // Subtle Sub-Hint
  const hintText = 'Swipe left for complete architectural breakdown ➔';
  const hintW = fontRegular.widthOfTextAtSize(hintText, 16);
  page.drawText(hintText, {
    x: SLIDE_WIDTH / 2 - hintW / 2,
    y: 56,
    size: 16,
    font: fontRegular,
    color: textMuted,
  });
}
