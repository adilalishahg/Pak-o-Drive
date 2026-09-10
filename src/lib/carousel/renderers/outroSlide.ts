import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, neonCyan, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline } from '../utils';

export function renderOutroSlide(ctx: SlideRenderContext): void {
  const { page, fonts, slide, slideIndex, totalSlides } = ctx;
  const { fontBold, fontRegular } = fonts;
  const pageNum = slideIndex + 1;

  // 1. Top Left Tag Badge (e.g. [ DECISION MATRIX ])
  const tagText = cleanAscii(slide.tag || 'DECISION MATRIX');
  const tagW = fontBold.widthOfTextAtSize(tagText, 20) + 36;
  page.drawRectangle({
    x: 70,
    y: SLIDE_HEIGHT - 95,
    width: tagW,
    height: 40,
    color: rgb(0.04, 0.08, 0.16),
    borderColor: neonCyan,
    borderWidth: 1.5,
  });
  page.drawText(tagText, {
    x: 70 + 18,
    y: SLIDE_HEIGHT - 95 + 12,
    size: 20,
    font: fontBold,
    color: neonCyan,
  });

  // 2. Top Right Slide Counter (e.g. 06 / 06 or 08 / 08)
  const pageStr = `${String(pageNum).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
  const pageW = fontBold.widthOfTextAtSize(pageStr, 26);
  page.drawText(pageStr, {
    x: SLIDE_WIDTH - 70 - pageW,
    y: SLIDE_HEIGHT - 85,
    size: 26,
    font: fontBold,
    color: textWhite,
  });

  // 3. Headline & Subheadline (Fitted to prevent horizontal clipping)
  const headFit = drawFittedHeadline(page, fontBold, slide.headline || 'Found this breakdown valuable?', {
    startY: SLIDE_HEIGHT - 165,
    maxWidth: 940,
    maxFontSize: 46,
    minFontSize: 28,
    align: 'left',
    leftMargin: 70,
    color: textWhite,
  });

  const subFit = drawFittedSubheadline(
    page,
    fontRegular,
    slide.subheadline || 'Save this cheat sheet and follow for weekly production architectures.',
    {
      startY: headFit.bottomY - 14,
      maxWidth: 940,
      maxFontSize: 22,
      minFontSize: 16,
      align: 'left',
      leftMargin: 70,
      color: textLight,
    }
  );

  // 4. Large Framed Profile Card (Cyan Border)
  const cardY = 160;
  const cardH = 880;
  page.drawRectangle({
    x: 70,
    y: cardY,
    width: 940,
    height: cardH,
    color: rgb(0.04, 0.07, 0.13),
    borderColor: neonCyan,
    borderWidth: 2,
  });

  // 4A. Monogram Avatar Circle (Left)
  const avatarCenterX = 185;
  const avatarCenterY = cardY + cardH - 125;
  const avatarRadius = 65;
  page.drawCircle({
    x: avatarCenterX,
    y: avatarCenterY,
    size: avatarRadius,
    color: rgb(0.03, 0.06, 0.12),
    borderColor: neonCyan,
    borderWidth: 3,
  });
  const saW = fontBold.widthOfTextAtSize('SA', 44);
  page.drawText('SA', {
    x: avatarCenterX - saW / 2,
    y: avatarCenterY - 15,
    size: 44,
    font: fontBold,
    color: neonCyan,
  });

  // 4B. Author Details (Right of Avatar)
  const bioX = 275;
  page.drawText('SYED ADIL ALI', {
    x: bioX,
    y: avatarCenterY + 22,
    size: 40,
    font: fontBold,
    color: textWhite,
  });
  page.drawText('Senior Full-Stack Engineer & Systems Architect', {
    x: bioX,
    y: avatarCenterY - 14,
    size: 24,
    font: fontBold,
    color: neonCyan,
  });
  page.drawText('Next.js 16 - React 19 - High-Scale Node.js - Distributed Systems', {
    x: bioX,
    y: avatarCenterY - 48,
    size: 20,
    font: fontRegular,
    color: textLight,
  });

  // 4C. Neon Cyan Action Button: + Follow @Syed Adil Ali
  const btnX = 110;
  const btnW = 860;
  const btnY = cardY + cardH - 280;
  const btnH = 72;
  page.drawRectangle({
    x: btnX,
    y: btnY,
    width: btnW,
    height: btnH,
    color: neonCyan,
  });
  const btnStr = '+ Follow @Syed Adil Ali';
  const btnWText = fontBold.widthOfTextAtSize(btnStr, 28);
  page.drawText(btnStr, {
    x: btnX + btnW / 2 - btnWText / 2,
    y: btnY + 24,
    size: 28,
    font: fontBold,
    color: rgb(0.02, 0.04, 0.08),
  });

  // 4D. Thin Horizontal Divider Line
  const divY = cardY + cardH - 335;
  page.drawLine({
    start: { x: btnX, y: divY },
    end: { x: btnX + btnW, y: divY },
    thickness: 1.5,
    color: rgb(0.12, 0.20, 0.35),
  });

  // 4E. Three Action Boxes ([ REPOST ], [ SAVE ], [ DISCUSS ])
  const boxGap = 24;
  const boxW = 270;
  const boxH = 210;
  const boxY = cardY + 55;

  // Box 1: [ REPOST ]
  page.drawRectangle({
    x: btnX,
    y: boxY,
    width: boxW,
    height: boxH,
    color: rgb(0.03, 0.055, 0.11),
    borderColor: rgb(0.15, 0.25, 0.42),
    borderWidth: 1.5,
  });
  page.drawText('[ REPOST ]', {
    x: btnX + 24,
    y: boxY + boxH - 45,
    size: 22,
    font: fontBold,
    color: neonCyan,
  });
  page.drawText('Share with peers &', {
    x: btnX + 24,
    y: boxY + boxH - 95,
    size: 20,
    font: fontRegular,
    color: textLight,
  });
  page.drawText('devs in your feed', {
    x: btnX + 24,
    y: boxY + boxH - 130,
    size: 20,
    font: fontRegular,
    color: textLight,
  });

  // Box 2: [ SAVE ]
  const b2X = btnX + boxW + boxGap;
  page.drawRectangle({
    x: b2X,
    y: boxY,
    width: boxW,
    height: boxH,
    color: rgb(0.03, 0.055, 0.11),
    borderColor: rgb(0.15, 0.25, 0.42),
    borderWidth: 1.5,
  });
  page.drawText('[ SAVE ]', {
    x: b2X + 24,
    y: boxY + boxH - 45,
    size: 22,
    font: fontBold,
    color: neonCyan,
  });
  page.drawText('Bookmark for your', {
    x: b2X + 24,
    y: boxY + boxH - 95,
    size: 20,
    font: fontRegular,
    color: textLight,
  });
  page.drawText('next sprint review', {
    x: b2X + 24,
    y: boxY + boxH - 130,
    size: 20,
    font: fontRegular,
    color: textLight,
  });

  // Box 3: [ DISCUSS ]
  const b3X = b2X + boxW + boxGap;
  page.drawRectangle({
    x: b3X,
    y: boxY,
    width: boxW,
    height: boxH,
    color: rgb(0.03, 0.055, 0.11),
    borderColor: rgb(0.15, 0.25, 0.42),
    borderWidth: 1.5,
  });
  page.drawText('[ DISCUSS ]', {
    x: b3X + 24,
    y: boxY + boxH - 45,
    size: 22,
    font: fontBold,
    color: neonCyan,
  });
  page.drawText('Drop your thoughts', {
    x: b3X + 24,
    y: boxY + boxH - 95,
    size: 20,
    font: fontRegular,
    color: textLight,
  });
  page.drawText('& questions below', {
    x: b3X + 24,
    y: boxY + boxH - 130,
    size: 20,
    font: fontRegular,
    color: textLight,
  });
}
