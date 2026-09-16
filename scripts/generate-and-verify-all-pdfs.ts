import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { CURATED_DECKS, renderSlobodanCarouselPdf, renderCoverSvg, renderCodeSvg, renderBarChartSvg, renderColumnChartSvg, renderDiagramSvg, renderCardListSvg, renderOutroSvg, WIDTH, HEIGHT, getFontPaths, toBase64Image } from '../src/lib/carousel';

async function main() {
  console.log(`🚀 [MultiPdfVerifier] Starting generation & visual verification for ${CURATED_DECKS.length} distinct technical decks...`);

  const outDir = path.join(process.cwd(), 'public', 'generated_test_pdfs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const { Resvg } = await import('@resvg/resvg-js');
  const { fontDirs, fontFiles } = getFontPaths();
  const avatarBase64 = toBase64Image('public/img/avatar.jpg');
  const coverBase64 = toBase64Image('public/img/agentic-ai-cover.jpg') || toBase64Image('public/active-post-graphic.jpg');

  const galleryItems: { deckIndex: number; title: string; slideCount: number; pdfName: string; slideImages: string[] }[] = [];

  for (let d = 0; d < CURATED_DECKS.length; d++) {
    const deck = CURATED_DECKS[d];
    const safeName = `deck_${d + 1}_${deck.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)}`;
    const pdfPath = path.join(outDir, `${safeName}.pdf`);
    const deckSlidesDir = path.join(outDir, `${safeName}_slides`);
    if (!fs.existsSync(deckSlidesDir)) {
      fs.mkdirSync(deckSlidesDir, { recursive: true });
    }

    console.log(`\n======================================================`);
    console.log(`📘 [Deck ${d + 1}/${CURATED_DECKS.length}] "${deck.topic}" (${deck.slides.length} slides)`);
    console.log(`======================================================`);

    const slideImages: string[] = [];

    // Render individual slides as JPEGs for direct visual verification
    for (let s = 0; s < deck.slides.length; s++) {
      const rawSlide = deck.slides[s];
      const pageNum = s + 1;
      const isFirst = s === 0 || rawSlide.isCover;
      const isLast = s === deck.slides.length - 1 || rawSlide.isSummary;

      let svg = '';
      if (isFirst || rawSlide.slideType === 'cover') {
        svg = renderCoverSvg(rawSlide, coverBase64);
      } else if (isLast || rawSlide.slideType === 'outro') {
        svg = renderOutroSvg(rawSlide, avatarBase64);
      } else if (rawSlide.slideType === 'code_terminal' || rawSlide.codeSnippet) {
        svg = renderCodeSvg(rawSlide, pageNum, deck.slides.length);
      } else if (rawSlide.chartData && rawSlide.chartData.length > 0 && rawSlide.slideType === 'bar_chart') {
        svg = renderBarChartSvg(rawSlide, pageNum, deck.slides.length);
      } else if (rawSlide.columnData && rawSlide.columnData.length > 0 && rawSlide.slideType === 'column_chart') {
        svg = renderColumnChartSvg(rawSlide, pageNum, deck.slides.length);
      } else if (rawSlide.diagramData && rawSlide.slideType === 'diagram') {
        svg = renderDiagramSvg(rawSlide, pageNum, deck.slides.length);
      } else {
        svg = renderCardListSvg(rawSlide, pageNum, deck.slides.length);
      }

      // Rasterize with Resvg TrueType in-memory font resolution
      const resvg = new Resvg(svg, {
        font: {
          fontDirs,
          fontFiles,
          defaultFontFamily: 'Inter',
          sansSerifFamily: 'Inter',
          monospaceFamily: 'Fira Code',
          loadSystemFonts: false,
        },
        fitTo: { mode: 'width', value: WIDTH },
      });
      const pngBuffer = Buffer.from(resvg.render().asPng());
      const jpgBuffer = await sharp(pngBuffer).jpeg({ quality: 95 }).toBuffer();

      const slideFilename = `slide_${pageNum}.jpg`;
      const slidePath = path.join(deckSlidesDir, slideFilename);
      fs.writeFileSync(slidePath, jpgBuffer);
      slideImages.push(`${safeName}_slides/${slideFilename}`);

      console.log(`  ✓ Slide ${pageNum}/${deck.slides.length} rendered -> ${slideFilename} (${(jpgBuffer.length / 1024).toFixed(1)} KB)`);
    }

    // Now compile the full multi-page PDF Document
    const pdfBuffer = await renderSlobodanCarouselPdf(deck);
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`📄 [Deck ${d + 1} PDF Compiled]: ${pdfPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

    galleryItems.push({
      deckIndex: d + 1,
      title: deck.topic,
      slideCount: deck.slides.length,
      pdfName: `${safeName}.pdf`,
      slideImages,
    });
  }

  // Generate Interactive HTML Inspection Gallery
  const galleryHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pak-o-Drive • 8 Multi-Topic PDF Carousel Quality Verification Gallery</title>
  <style>
    body {
      background: #070913;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px;
    }
    h1 {
      color: #00F5D4;
      font-size: 32px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #94A3B8;
      font-size: 18px;
      margin-bottom: 36px;
    }
    .deck-section {
      background: #0D1424;
      border: 1px solid #1E293B;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 40px;
    }
    .deck-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 14px;
    }
    .deck-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .badge {
      background: rgba(0, 245, 212, 0.15);
      color: #00F5D4;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }
    .pdf-link {
      color: #38BDF8;
      text-decoration: none;
      font-weight: 700;
      margin-left: 15px;
    }
    .slides-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    .slide-card {
      background: #070913;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #1E293B;
      transition: transform 0.2s, border-color 0.2s;
    }
    .slide-card:hover {
      transform: translateY(-4px);
      border-color: #00F5D4;
    }
    .slide-card img {
      width: 100%;
      height: auto;
      display: block;
    }
    .slide-label {
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 700;
      color: #94A3B8;
      background: #0A0F1D;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Pak-o-Drive • 8 Multi-Topic PDF Quality Verification Gallery</h1>
  <div class="subtitle">Complete visual inspection: TrueType typography, unclipped cards, code syntax, charts, and brand outro.</div>

  ${galleryItems
    .map(
      (item) => `
    <div class="deck-section">
      <div class="deck-header">
        <div>
          <span class="badge">Deck ${item.deckIndex} • ${item.slideCount} Slides</span>
          <span class="deck-title" style="margin-left: 12px;">${item.title}</span>
        </div>
        <div>
          <a class="pdf-link" href="generated_test_pdfs/${item.pdfName}" target="_blank">📥 Download PDF</a>
        </div>
      </div>
      <div class="slides-grid">
        ${item.slideImages
          .map(
            (img, sIdx) => `
          <div class="slide-card">
            <a href="generated_test_pdfs/${img}" target="_blank">
              <img src="generated_test_pdfs/${img}" alt="Slide ${sIdx + 1}" />
            </a>
            <div class="slide-label">Slide ${sIdx + 1} of ${item.slideCount}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>
  `;

  const galleryPath = path.join(process.cwd(), 'public', 'pdf-inspection-gallery.html');
  fs.writeFileSync(galleryPath, galleryHtml);
  console.log(`\n✨ [SUCCESS] Generated 8 complete PDFs & visual inspection gallery at:`);
  console.log(`   👉 file://${galleryPath}`);
}

main().catch((err) => {
  console.error('Fatal error during multi-PDF generation:', err);
  process.exit(1);
});
