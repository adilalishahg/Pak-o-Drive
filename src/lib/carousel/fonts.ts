import type { PDFDocument, PDFFont } from 'pdf-lib';
import { StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import type { FontBundle } from './types';

/**
 * Loads authentic TrueType fonts (Inter and FiraCode) into the PDFDocument.
 * Gracefully falls back to standard Helvetica/Courier if TrueType files are missing.
 */
export async function loadCarouselFonts(pdfDoc: PDFDocument): Promise<FontBundle> {
  let fontBold: PDFFont | null = null;
  let fontRegular: PDFFont | null = null;
  let fontCode: PDFFont | null = null;

  try {
    const fk = (fontkit as any).default || fontkit;
    pdfDoc.registerFontkit(fk);

    const fontsDir = path.join(process.cwd(), 'src/lib/fonts');
    const boldPath = path.join(fontsDir, 'Inter-Bold.ttf');
    const regPath = path.join(fontsDir, 'Inter-Regular.ttf');
    const codePath = path.join(fontsDir, 'FiraCode-SemiBold.ttf');

    if (fs.existsSync(boldPath) && fs.existsSync(regPath)) {
      fontBold = await pdfDoc.embedFont(fs.readFileSync(boldPath));
      fontRegular = await pdfDoc.embedFont(fs.readFileSync(regPath));
      fontCode = fs.existsSync(codePath)
        ? await pdfDoc.embedFont(fs.readFileSync(codePath))
        : fontBold;
      console.log('✓ [Carousel] Loaded Inter & FiraCode TrueType fonts into PDF');
    }
  } catch (fontErr) {
    console.warn('⚠️ Custom font embedding fallback to standard Helvetica:', fontErr);
  }

  // Graceful fallback to standard PDF fonts
  if (!fontBold) fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  if (!fontRegular) fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  if (!fontCode) fontCode = await pdfDoc.embedFont(StandardFonts.CourierBold);

  return { fontBold, fontRegular, fontCode };
}
