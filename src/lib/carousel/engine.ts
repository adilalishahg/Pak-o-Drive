import { PDFDocument, rgb, type PDFImage } from 'pdf-lib';
import type { CarouselDeck, SlideRenderContext } from './types';
import { SLIDE_WIDTH, SLIDE_HEIGHT, bgDeep, vibrantPurple, electricBlue, textMuted } from './constants';
import { getTopicImage } from './utils';
import { loadCarouselFonts } from './fonts';
import { renderCoverSlide } from './renderers/coverSlide';
import { renderIntroSlide } from './renderers/introSlide';
import { renderStatCardSlide } from './renderers/statCardSlide';
import { renderBarChartSlide } from './renderers/barChartSlide';
import { renderColumnChartSlide } from './renderers/columnChartSlide';
import { renderDiagramSlide } from './renderers/diagramSlide';
import { renderOutroSlide } from './renderers/outroSlide';
import { renderCodeTerminalSlide } from './renderers/codeTerminalSlide';

/**
 * High-performance 4:5 Vertical Portrait PDF Carousel Renderer
 * Matches Slobodan Gajic dark cyber aesthetics, rich infographics & personal authority branding.
 */
export async function renderSlobodanCarouselPdf(
  deck: CarouselDeck,
  customCoverGraphic?: Buffer | null
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadCarouselFonts(pdfDoc);
  const { fontBold } = fonts;

  // 1. Resolve 3D Topic Graphic
  const coverImageBuffer = customCoverGraphic || getTopicImage(deck.topic);
  let embeddedCoverImage: PDFImage | null = null;
  if (coverImageBuffer && coverImageBuffer.length > 2000) {
    try {
      embeddedCoverImage = await pdfDoc.embedJpg(coverImageBuffer);
    } catch {
      try {
        embeddedCoverImage = await pdfDoc.embedPng(coverImageBuffer);
      } catch (imgErr) {
        console.warn('⚠️ Could not embed cover image buffer in PDF:', imgErr);
      }
    }
  }

  const totalSlides = deck.slides.length;

  for (let i = 0; i < totalSlides; i++) {
    const rawSlide = deck.slides[i];
    const isFirst = i === 0 || rawSlide.isCover;
    const isLast = i === totalSlides - 1 || rawSlide.isSummary;
    const pageNum = i + 1;

    const page = pdfDoc.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);

    // 1. Deep Midnight Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      color: bgDeep,
    });

    // 1.5 Ambient 3D Graphic Blend on All Slides
    if (embeddedCoverImage) {
      page.drawImage(embeddedCoverImage, {
        x: 0,
        y: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        opacity: isFirst ? 0.20 : 0.12,
      });
      page.drawRectangle({
        x: 0,
        y: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        color: bgDeep,
        opacity: isFirst ? 0.45 : 0.65,
      });
    }

    // 2. Subtle Blueprint Grid Dots
    for (let gx = 60; gx < SLIDE_WIDTH; gx += 80) {
      for (let gy = 60; gy < SLIDE_HEIGHT; gy += 80) {
        page.drawCircle({
          x: gx,
          y: gy,
          size: 1.2,
          color: rgb(0.09, 0.15, 0.26),
        });
      }
    }

    // 3. Top Glowing Accent Line
    page.drawRectangle({
      x: 0,
      y: SLIDE_HEIGHT - 8,
      width: SLIDE_WIDTH,
      height: 8,
      color: i % 2 === 0 ? vibrantPurple : electricBlue,
    });

    // 4. Top Pagination ("2 of 8", "3 of 8", etc. - on all inner slides)
    if (!isFirst && !isLast) {
      const pageText = `${pageNum} of ${totalSlides}`;
      page.drawText(pageText, {
        x: SLIDE_WIDTH - 150,
        y: SLIDE_HEIGHT - 65,
        size: 22,
        font: fontBold,
        color: textMuted,
      });
    }

    // 5. Global Bottom Footer Line (on all inner slides)
    if (!isFirst && !isLast) {
      page.drawLine({
        start: { x: 70, y: 90 },
        end: { x: SLIDE_WIDTH - 70, y: 90 },
        thickness: 1,
        color: rgb(0.12, 0.18, 0.30),
      });

      const rawFooter = rawSlide.footer || '';
      const footerLabel = rawFooter && !rawFooter.toLowerCase().includes('pakodrive')
        ? rawFooter
        : 'Swipe to continue ->';
      let footerSize = 22;
      while (footerSize > 14 && fontBold.widthOfTextAtSize(footerLabel, footerSize) > 900) {
        footerSize -= 1;
      }
      const fW = fontBold.widthOfTextAtSize(footerLabel, footerSize);
      page.drawText(footerLabel, {
        x: SLIDE_WIDTH / 2 - fW / 2,
        y: 50,
        size: footerSize,
        font: fontBold,
        color: textMuted,
      });
    }

    // Context object passed to slide renderers
    const ctx: SlideRenderContext = {
      pdfDoc,
      page,
      fonts,
      slide: rawSlide,
      slideIndex: i,
      totalSlides,
      embeddedCoverImage,
    };

    // Dispatch by Slide Archetype
    if (isFirst || rawSlide.slideType === 'cover') {
      renderCoverSlide(ctx);
    } else if (rawSlide.slideType === 'intro') {
      renderIntroSlide(ctx);
    } else if (rawSlide.slideType === 'stat_card') {
      renderStatCardSlide(ctx);
    } else if (rawSlide.slideType === 'bar_chart') {
      renderBarChartSlide(ctx);
    } else if (rawSlide.slideType === 'column_chart') {
      renderColumnChartSlide(ctx);
    } else if (rawSlide.slideType === 'diagram') {
      renderDiagramSlide(ctx);
    } else if (isLast || rawSlide.slideType === 'outro') {
      renderOutroSlide(ctx);
    } else {
      renderCodeTerminalSlide(ctx);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
