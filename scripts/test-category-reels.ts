import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { generateViralMotionReel } from '../src/lib/viralMotionReelEngine';
import { ReelCategory } from '../src/lib/reelCategoryLibrary';

async function main() {
  console.log('🌟 Testing Multi-Category Reel Generation Engine...\n');

  const categories: ReelCategory[] = ['nature', 'beach', 'buildings', 'sky'];
  const generated: Array<{ category: string; title: string; videoPath: string; duration: number }> = [];

  for (const cat of categories) {
    console.log(`\n========================================`);
    console.log(`🎬 Generating Reel for Category: [${cat.toUpperCase()}]`);
    const res = await generateViralMotionReel({
      category: cat,
      outputFilePath: `public/viral-preview-${cat}.mp4`,
      durationSeconds: 6.5,
    });

    console.log(`✓ Title: ${res.title}`);
    console.log(`✓ Lines: ${res.quoteLines.join(' | ')}`);
    console.log(`✓ Video File: ${res.videoPath}`);
    generated.push({
      category: cat,
      title: res.title,
      videoPath: `/viral-preview-${cat}.mp4`,
      duration: res.durationSeconds,
    });
  }

  // Update viral-reel-preview.html with category tabs/cards
  const cardsHtml = generated
    .map((g) => {
      return `
      <div class="card">
        <span class="badge ${g.category}">🏷️ Category: ${g.category.toUpperCase()}</span>
        <h3>${g.title}</h3>
        <p>100% real moving ${g.category} B-roll + AI dynamic quote + trending lofi audio.</p>
        <video controls loop muted playsinline>
          <source src="${g.videoPath}" type="video/mp4">
        </video>
      </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pak-o-Drive Multi-Category Reel Showcase</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 30px 20px;
      background: #030712;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    h1 { margin: 0 0 8px; font-size: 26px; color: #00F5D4; text-align: center; }
    p.subtitle { margin: 0 0 28px; font-size: 14px; color: #94A3B8; text-align: center; max-width: 650px; line-height: 1.5; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 320px));
      gap: 22px;
      width: 100%;
      max-width: 1350px;
      justify-content: center;
    }
    .card {
      background: #0B132B;
      padding: 16px;
      border-radius: 16px;
      border: 1px solid rgba(0, 245, 212, 0.2);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .badge {
      align-self: flex-start;
      background: rgba(0, 245, 212, 0.15);
      border: 1px solid #00F5D4;
      color: #00F5D4;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge.nature { border-color: #10B981; color: #10B981; background: rgba(16, 185, 129, 0.15); }
    .badge.beach { border-color: #06B6D4; color: #06B6D4; background: rgba(6, 182, 212, 0.15); }
    .badge.buildings { border-color: #F59E0B; color: #F59E0B; background: rgba(245, 158, 11, 0.15); }
    .badge.sky { border-color: #8B5CF6; color: #8B5CF6; background: rgba(139, 92, 246, 0.15); }
    .card h3 { margin: 0 0 6px; font-size: 15px; color: #F8FAFC; width: 100%; }
    .card p { margin: 0 0 12px; font-size: 12px; color: #94A3B8; width: 100%; line-height: 1.4; }
    video {
      width: 100%;
      aspect-ratio: 9/16;
      border-radius: 12px;
      border: 1px solid #1E293B;
      background: #000;
      outline: none;
    }
  </style>
</head>
<body>
  <h1>🔥 Multi-Category Moving Video Showcase</h1>
  <p class="subtitle">Rotating automatically across 7 weekly categories (Nature, Roads, Beach, Buildings, Sky, Rain, Fire) with AI customized quotes, trending audio, and 0 video repetition.</p>

  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

  fs.writeFileSync('public/viral-reel-preview.html', html);
  console.log('\n🌐 Updated public/viral-reel-preview.html with all 4 multi-category video cards!');
}

main().catch(console.error);
