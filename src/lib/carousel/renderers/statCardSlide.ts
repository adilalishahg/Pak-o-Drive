import { rgb } from 'pdf-lib';
import type { SlideRenderContext } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, cardBg, cardBorder, neonCyan, electricBlue, vibrantPurple, textWhite, textLight } from '../constants';
import { cleanAscii, drawFittedHeadline, drawFittedSubheadline, wrapTextByWidth, drawTakeawayQuote } from '../utils';

export function renderStatCardSlide(ctx: SlideRenderContext): void {
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

  // 3. Modular Glassmorphic Architecture Layout (Zero empty void, perfectly balanced vertical canvas)
  const cardContent = slide.cardContent || {
    badge: 'PRODUCTION METRIC',
    title: slide.headline,
    highlightText: 'Core architectural paradigm shift for resilient distributed systems',
    bodyLines: [
      'Services publish lightweight domain events to an asynchronous message backbone.',
      'Decoupled consumer workers handle processing independently, isolating failures and scaling horizontally.',
      'Strict message acknowledgments eliminate data loss during broker rebalancing.',
    ],
  };

  const maxInnerW = 820;
  const contentTop = lowestY - 35; // ~1040

  // ── BOX 1: HERO METRIC & FOCUS TILE (Height ~280px) ──────────────────
  const box1H = 270;
  const box1Y = contentTop - box1H;

  page.drawRectangle({
    x: 80,
    y: box1Y,
    width: 920,
    height: box1H,
    color: rgb(0.06, 0.10, 0.20),
    borderColor: rgb(0.35, 0.45, 0.70),
    borderWidth: 1.5,
  });

  // Badge Pill (Generous 24px padding from top)
  const badgeText = cleanAscii(cardContent.badge || 'PRODUCTION METRIC').toUpperCase();
  const bW = fontBold.widthOfTextAtSize(badgeText, 15) + 28;
  const badgeH = 28;
  const badgeBoxY = box1Y + box1H - 24 - badgeH;

  page.drawRectangle({
    x: 115,
    y: badgeBoxY,
    width: bW,
    height: badgeH,
    color: rgb(0.08, 0.15, 0.28),
    borderColor: electricBlue,
    borderWidth: 1.2,
  });
  page.drawText(badgeText, {
    x: 129,
    y: badgeBoxY + 7,
    size: 15,
    font: fontBold,
    color: electricBlue,
  });

  // Title (Commanding 38px Bold White with clean margin below badge)
  const titleText = cleanAscii(cardContent.title || slide.headline);
  const titleLines = wrapTextByWidth(titleText, fontBold, 38, maxInnerW);
  let titleY = badgeBoxY - 44;
  for (const line of titleLines.slice(0, 2)) {
    page.drawText(line, {
      x: 115,
      y: titleY,
      size: 38,
      font: fontBold,
      color: textWhite,
    });
    titleY -= 46;
  }

  // Divider Line
  page.drawLine({
    start: { x: 115, y: box1Y + 98 },
    end: { x: 965, y: box1Y + 98 },
    thickness: 1,
    color: rgb(0.18, 0.25, 0.40),
  });

  // Highlight Statement (Prominent 28px Bold Purple)
  const hlText = cleanAscii(cardContent.highlightText || 'Reduce MTTR by 40% with event-driven domain architecture');
  const hlLines = wrapTextByWidth(hlText, fontBold, 28, maxInnerW);
  let hlY = box1Y + 65;
  for (const line of hlLines.slice(0, 2)) {
    page.drawText(line, {
      x: 115,
      y: hlY,
      size: 28,
      font: fontBold,
      color: vibrantPurple,
    });
    hlY -= 36;
  }

  // ── BOX 2: PRODUCTION MECHANISM & DEEP DIVE (Height ~380px) ─────────
  const box2Gap = 28;
  const box2H = 370;
  const box2Y = box1Y - box2Gap - box2H;

  page.drawRectangle({
    x: 80,
    y: box2Y,
    width: 920,
    height: box2H,
    color: rgb(0.05, 0.08, 0.16),
    borderColor: cardBorder,
    borderWidth: 1.5,
  });

  // Tag Pill for Box 2 (Generous 24px padding from top)
  const mechTag = '⚡ ARCHITECTURAL MECHANICS';
  const mW = fontBold.widthOfTextAtSize(mechTag, 14) + 24;
  const mechTagH = 26;
  const mechTagBoxY = box2Y + box2H - 24 - mechTagH;

  page.drawRectangle({
    x: 115,
    y: mechTagBoxY,
    width: mW,
    height: mechTagH,
    color: rgb(0.06, 0.14, 0.24),
    borderColor: neonCyan,
    borderWidth: 1.2,
  });
  page.drawText(mechTag, {
    x: 127,
    y: mechTagBoxY + 7,
    size: 14,
    font: fontBold,
    color: neonCyan,
  });

  // Body Lines with Glowing Bullet Rings
  const rawBody = (cardContent.bodyLines && cardContent.bodyLines.length > 0)
    ? cardContent.bodyLines
    : [
        'Services publish lightweight domain events to an asynchronous message backbone.',
        'Decoupled consumer workers handle processing independently, isolating failures and scaling horizontally.',
        'Strict message acknowledgments eliminate data loss during broker rebalancing.',
      ];

  const effectiveBody = rawBody.length < 3
    ? [...rawBody, 'Strict message acknowledgments eliminate data loss during broker rebalancing and auto-scaling.']
    : rawBody;

  let bulletY = mechTagBoxY - 40;
  for (const rawLine of effectiveBody.slice(0, 3)) {
    // Glowing bullet aligned with text
    page.drawCircle({
      x: 135,
      y: bulletY + 7,
      size: 12,
      color: rgb(0.0, 0.94, 1.0),
      opacity: 0.20,
    });
    page.drawCircle({
      x: 135,
      y: bulletY + 7,
      size: 6,
      color: neonCyan,
    });

    const wrapped = wrapTextByWidth(cleanAscii(rawLine), fontRegular, 26, maxInnerW - 50);
    let lineY = bulletY;
    for (const line of wrapped) {
      page.drawText(line, {
        x: 165,
        y: lineY,
        size: 26,
        font: fontRegular,
        color: textLight,
      });
      lineY -= 36;
    }
    bulletY = lineY - 22;
  }

  // ── BOX 3: GOLDEN ARCHITECTURAL RULE / TAKEAWAY BANNER (Height ~145px) ─
  const box3Gap = 24;
  const box3H = 145;
  const box3Y = box2Y - box3Gap - box3H;

  page.drawRectangle({
    x: 80,
    y: box3Y,
    width: 920,
    height: box3H,
    color: rgb(0.04, 0.08, 0.16),
    borderColor: neonCyan,
    borderWidth: 2,
  });

  // Tag inside banner (Generous 22px top margin)
  const ruleTag = '💎 PRINCIPAL ARCHITECT RULE';
  const rW = fontBold.widthOfTextAtSize(ruleTag, 13);
  page.drawText(ruleTag, {
    x: SLIDE_WIDTH / 2 - rW / 2,
    y: box3Y + box3H - 28,
    size: 13,
    font: fontBold,
    color: electricBlue,
  });

  // Quote statement (Centered, with generous breathing room)
  const quoteRaw = slide.takeawayQuote || '"Events are immutable facts, not requests. Embrace the event-driven backbone."';
  const cleanQuote = cleanAscii(quoteRaw);
  const quoteLines = wrapTextByWidth(cleanQuote, fontBold, 22, 840);
  let qY = box3Y + 75;
  for (const ql of quoteLines.slice(0, 2)) {
    const qlW = fontBold.widthOfTextAtSize(ql, 22);
    page.drawText(ql, {
      x: SLIDE_WIDTH / 2 - qlW / 2,
      y: qY,
      size: 22,
      font: fontBold,
      color: neonCyan,
    });
    qY -= 32;
  }
}
