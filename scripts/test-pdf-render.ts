import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import { CURATED_DECKS, renderSlobodanCarouselPdf } from '../src/lib/carouselGenerator';
import { generateTechGraphic } from '../src/lib/socialAutoPostService';

async function main() {
  const deck = CURATED_DECKS[1]; // Rendering Strategies
  console.log(`Testing Deck 1: "${deck.topic}" (${deck.slides.length} slides)`);
  const graphic = await generateTechGraphic(deck.topic);
  const pdfBuffer = await renderSlobodanCarouselPdf(deck, graphic);
  console.log(`✓ Deck 1 compiled: ${pdfBuffer.length} bytes`);
  fs.writeFileSync('public/active-carousel.pdf', pdfBuffer);
  console.log('✓ Successfully saved to public/active-carousel.pdf');
}

main().catch(console.error);

