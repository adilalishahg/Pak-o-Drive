import fs from 'fs';
import { CURATED_DECKS, renderSlobodanCarouselPdf } from '../src/lib/carouselGenerator';

async function main() {
  for (let i = 0; i < CURATED_DECKS.length; i++) {
    const deck = CURATED_DECKS[i];
    console.log(`[Deck ${i + 1}/${CURATED_DECKS.length}] Testing: "${deck.topic}"`);
    const pdfBuffer = await renderSlobodanCarouselPdf(deck);
    console.log(`✓ Deck ${i + 1} compiled: ${pdfBuffer.length} bytes`);
    if (i === 2) {
      fs.writeFileSync('public/active-carousel.pdf', pdfBuffer);
    }
  }
}

main().catch(console.error);
