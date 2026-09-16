import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import type { CarouselDeck } from './types';
import { getTopicImage } from './utils';
import {
  WIDTH,
  HEIGHT,
  toBase64Image,
  renderCoverSvg,
  renderCodeSvg,
  renderBarChartSvg,
  renderColumnChartSvg,
  renderDiagramSvg,
  renderCardListSvg,
  renderOutroSvg,
} from './svg';

// Re-export all SVG builders and primitives for complete backwards compatibility
export * from './svg';

// Ensure FONTCONFIG_PATH is set before sharp/librsvg can load
try {
  const possibleFontDirs = [
    path.join(process.cwd(), 'src', 'lib', 'fonts'),
    path.join(process.cwd(), 'fonts'),
    '/var/task/src/lib/fonts',
    '/var/task/fonts',
  ];
  for (const d of possibleFontDirs) {
    if (fs.existsSync(path.join(d, 'fonts.conf'))) {
      process.env.FONTCONFIG_PATH = d;
      break;
    }
  }
} catch {}

let cachedFontPaths: { fontDirs: string[]; fontFiles: string[] } | null = null;
export function getFontPaths(): { fontDirs: string[]; fontFiles: string[] } {
  if (cachedFontPaths && cachedFontPaths.fontFiles.length > 0) {
    return cachedFontPaths;
  }
  const searchDirs = [
    path.join(process.cwd(), 'src', 'lib', 'fonts'),
    path.join(process.cwd(), 'fonts'),
    path.join(process.cwd(), 'public', 'fonts'),
    '/var/task/src/lib/fonts',
    '/var/task/fonts',
  ];

  const fontDirs: string[] = [];
  const fontFiles: string[] = [];
  const requiredFiles = ['Inter-Bold.ttf', 'Inter-Regular.ttf', 'FiraCode-SemiBold.ttf'];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      fontDirs.push(dir);
      for (const f of requiredFiles) {
        const fullPath = path.join(dir, f);
        if (fs.existsSync(fullPath) && !fontFiles.includes(fullPath)) {
          fontFiles.push(fullPath);
        }
      }
    }
  }

  // Graceful fallback to hydrate font files from embedded base64 if missing on disk
  if (fontFiles.length === 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { INTER_BOLD_BASE64, INTER_REGULAR_BASE64 } = require('../fonts/fontBase64');
      const tempDir = process.platform === 'win32'
        ? path.join(process.cwd(), 'scratch', 'temp-fonts')
        : '/tmp/fonts';
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const boldPath = path.join(tempDir, 'Inter-Bold.ttf');
      const regPath = path.join(tempDir, 'Inter-Regular.ttf');
      if (INTER_BOLD_BASE64 && !fs.existsSync(boldPath)) {
        fs.writeFileSync(boldPath, Buffer.from(INTER_BOLD_BASE64, 'base64'));
      }
      if (INTER_REGULAR_BASE64 && !fs.existsSync(regPath)) {
        fs.writeFileSync(regPath, Buffer.from(INTER_REGULAR_BASE64, 'base64'));
      }
      fontDirs.push(tempDir);
      if (fs.existsSync(boldPath)) fontFiles.push(boldPath);
      if (fs.existsSync(regPath)) fontFiles.push(regPath);
    } catch {}
  }

  cachedFontPaths = { fontDirs, fontFiles };
  return cachedFontPaths;
}

/**
 * High-performance 4:5 Vertical Portrait PDF Carousel Renderer
 * Matches Slobodan Gajić dark cyber aesthetics, rich infographics & personal authority branding.
 */
export async function renderSlobodanCarouselPdf(
  deck: CarouselDeck,
  customCoverGraphic?: Buffer | null
): Promise<Buffer> {
  const totalSlides = deck.slides.length;

  // Resolve cover image base64
  let coverBase64 = '';
  if (customCoverGraphic && customCoverGraphic.length > 1000) {
    coverBase64 = `data:image/jpeg;base64,${customCoverGraphic.toString('base64')}`;
  } else {
    coverBase64 =
      toBase64Image('public/img/agentic-ai-cover.jpg') ||
      toBase64Image('public/active-post-graphic.jpg');
    if (!coverBase64) {
      const topicBuf = getTopicImage(deck.topic);
      if (topicBuf && topicBuf.length > 1000) {
        coverBase64 = `data:image/jpeg;base64,${topicBuf.toString('base64')}`;
      }
    }
  }

  // Resolve avatar base64
  const avatarBase64 = toBase64Image('public/img/avatar.jpg');

  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < totalSlides; i++) {
    const rawSlide = deck.slides[i];
    const isFirst = i === 0 || rawSlide.isCover;
    const isLast = i === totalSlides - 1 || rawSlide.isSummary;
    const pageNum = i + 1;

    let svgContent = '';

    if (isFirst || rawSlide.slideType === 'cover') {
      svgContent = renderCoverSvg(rawSlide, coverBase64);
    } else if (isLast || rawSlide.slideType === 'outro') {
      svgContent = renderOutroSvg(rawSlide, avatarBase64);
    } else if (rawSlide.slideType === 'code_terminal' || rawSlide.codeSnippet) {
      svgContent = renderCodeSvg(rawSlide, pageNum, totalSlides);
    } else if (
      rawSlide.chartData &&
      rawSlide.chartData.length > 0 &&
      rawSlide.slideType === 'bar_chart'
    ) {
      svgContent = renderBarChartSvg(rawSlide, pageNum, totalSlides);
    } else if (
      rawSlide.columnData &&
      rawSlide.columnData.length > 0 &&
      rawSlide.slideType === 'column_chart'
    ) {
      svgContent = renderColumnChartSvg(rawSlide, pageNum, totalSlides);
    } else if (
      rawSlide.diagramData &&
      rawSlide.slideType === 'diagram'
    ) {
      svgContent = renderDiagramSvg(rawSlide, pageNum, totalSlides);
    } else {
      svgContent = renderCardListSvg(rawSlide, pageNum, totalSlides);
    }

    // Convert SVG to ultra-crisp JPEG Buffer via Resvg (with in-memory TrueType fonts) + Sharp
    let jpgBuffer: Buffer;
    try {
      const { Resvg } = await import('@resvg/resvg-js');
      const { fontDirs, fontFiles } = getFontPaths();
      const resvg = new Resvg(svgContent, {
        font: {
          fontDirs,
          fontFiles,
          defaultFontFamily: 'Inter',
          sansSerifFamily: 'Inter',
          monospaceFamily: 'Fira Code',
          loadSystemFonts: false, // 100% OS isolation: guarantees ZERO tofu / missing glyphs on Vercel Linux!
        },
        fitTo: {
          mode: 'width',
          value: WIDTH,
        },
      });
      const pngBuffer = Buffer.from(resvg.render().asPng());
      jpgBuffer = await sharp(pngBuffer).jpeg({ quality: 95 }).toBuffer();
    } catch (resvgErr) {
      console.warn('⚠️ [CarouselEngine] Resvg failed, falling back to sharp:', resvgErr);
      jpgBuffer = await sharp(Buffer.from(svgContent)).jpeg({ quality: 95 }).toBuffer();
    }

    if (process.env.DEBUG_CAROUSEL === 'true') {
      try {
        const renderDir = path.resolve('scratch/renders');
        if (!fs.existsSync(renderDir)) fs.mkdirSync(renderDir, { recursive: true });
        fs.writeFileSync(path.join(renderDir, `slide_${pageNum}.jpg`), jpgBuffer);
      } catch {}
    }

    const jpgImage = await pdfDoc.embedJpg(jpgBuffer);
    const page = pdfDoc.addPage([WIDTH, HEIGHT]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
