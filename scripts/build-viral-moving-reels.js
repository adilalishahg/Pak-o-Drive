const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');

const INTER_BOLD_BASE64 = fs.readFileSync('src/lib/fonts/Inter-Bold.ttf').toString('base64');

async function buildVideo(inputMp4, outputName, title, lines, duration = 7.0) {
  const WIDTH = 720;
  const HEIGHT = 1280;

  console.log(`\n🎬 [ViralReelEngine] Building: ${title} -> ${outputName}`);

  // 1. Generate Crisp Typographic Transparent PNG Overlay
  const lineElements = lines
    .map((line, idx) => {
      const y = 500 + idx * 48;
      return `
        <text x="360" y="${y}" 
          font-family="'Inter', -apple-system, sans-serif" 
          font-size="34" 
          font-weight="700" 
          fill="#FFFFFF" 
          stroke="#000000" 
          stroke-width="3" 
          paint-order="stroke fill"
          text-anchor="middle"
          letter-spacing="-0.5">${line}</text>
      `;
    })
    .join('');

  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: 'Inter';
            font-weight: 700;
            font-style: normal;
            src: url('data:font/ttf;base64,${INTER_BOLD_BASE64}') format('truetype');
          }
        </style>
      </defs>
      ${lineElements}
    </svg>
  `;

  const overlayPath = `public/img/viral-reels/overlay-${path.basename(outputName, '.mp4')}.png`;
  await sharp(Buffer.from(overlaySvg)).png().toFile(overlayPath);

  const audioFile = 'public/audio/aesthetic-lofi-trending.mp3';
  const outputPath = `public/${outputName}`;

  // Composite real moving video + overlay + audio
  // Darken video slightly (curves / eq) so white text stands out with intense cinematic mood
  const filterComplex = `
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,eq=brightness=-0.08:contrast=1.15:saturation=1.1,setsar=1[bg];
    [bg][1:v]overlay=0:0[v]
  `.replace(/\s+/g, ' ').trim();

  const cmd = `"${ffmpeg.path}" -y -stream_loop -1 -i "${inputMp4}" -i "${overlayPath}" -i "${audioFile}" -filter_complex "${filterComplex}" -map "[v]" -map 2:a -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -t ${duration} "${outputPath}"`;

  execSync(cmd, { stdio: 'inherit' });
  console.log(`✅ Output saved: ${outputPath} (${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB)`);
}

async function main() {
  const quote1 = [
    'My problem is...',
    'The more impossible',
    'something seems,',
    'The more it attracts me.',
  ];

  const quote2 = [
    'Silence is not weakness.',
    'It is the ultimate sign of',
    'Self-Control.',
    'Move in silence.',
  ];

  // 1. Nissan Pop-up Headlights Night Rain (Dark Aesthetic Real Video)
  if (fs.existsSync('public/img/viral-reels/raw/nissan-300zx.mp4')) {
    await buildVideo(
      'public/img/viral-reels/raw/nissan-300zx.mp4',
      'viral-moving-car-rain.mp4',
      'Nissan Pop-Up Headlights Dark Rain Aesthetic',
      quote1,
      7.5
    );
  }

  // 2. High Speed Mountain Curve Sports Car (Mixkit 52427)
  if (fs.existsSync('public/img/viral-reels/mixkit/52427.mp4')) {
    await buildVideo(
      'public/img/viral-reels/mixkit/52427.mp4',
      'viral-moving-sports-car-speed.mp4',
      'High Speed Sports Car Highway Drive',
      quote2,
      7.0
    );
  }

  // 3. Update HTML previewer with real moving videos
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pak-o-Drive Viral Moving Video Reels</title>
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
    h1 {
      margin: 0 0 8px;
      font-size: 26px;
      color: #00F5D4;
      text-align: center;
    }
    p.subtitle {
      margin: 0 0 28px;
      font-size: 14px;
      color: #94A3B8;
      text-align: center;
      max-width: 600px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 360px));
      gap: 24px;
      width: 100%;
      max-width: 1150px;
      justify-content: center;
    }
    .card {
      background: #0B132B;
      padding: 18px;
      border-radius: 16px;
      border: 1px solid rgba(0, 245, 212, 0.25);
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
    .badge.profile {
      background: rgba(236, 72, 153, 0.15);
      border-color: #EC4899;
      color: #F472B6;
    }
    .card h3 {
      margin: 0 0 6px;
      font-size: 16px;
      color: #F8FAFC;
      width: 100%;
    }
    .card p {
      margin: 0 0 14px;
      font-size: 12px;
      color: #94A3B8;
      width: 100%;
      line-height: 1.4;
    }
    video {
      width: 100%;
      aspect-ratio: 9/16;
      border-radius: 12px;
      border: 1px solid #1E293B;
      background: #000;
      outline: none;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
    }
  </style>
</head>
<body>
  <h1>🔥 Real Moving Video Reels (No Still Photos)</h1>
  <p class="subtitle">Generated with real 60fps moving B-roll video, auto-darkened aesthetic color grade, sharp Inter-Bold vector typography, and trending lofi audio.</p>

  <div class="grid">
    <!-- Card 1: Rain Night Headlights -->
    <div class="card">
      <span class="badge">🎬 Real Motion Video 1</span>
      <h3>Dark Night Rain + Pop-up Headlights</h3>
      <p>Moving rain & glowing pop-up headlights with the exact viral quote from your #1 reel.</p>
      <video controls autoplay loop muted playsinline>
        <source src="/viral-moving-car-rain.mp4" type="video/mp4">
      </video>
    </div>

    <!-- Card 2: High Speed Sports Car -->
    <div class="card">
      <span class="badge">🏎️ Real Motion Video 2</span>
      <h3>High-Speed Sports Car Curve</h3>
      <p>Real moving sports car speeding through mountain curves with mindset quote.</p>
      <video controls loop muted playsinline>
        <source src="/viral-moving-sports-car-speed.mp4" type="video/mp4">
      </video>
    </div>

    <!-- Card 3: Original Instagram Profile Reel #1 -->
    <div class="card">
      <span class="badge profile">📱 Your Actual Reel #1</span>
      <h3>DU1c9YUCAXy (261 Likes)</h3>
      <p>Fetched directly from your Instagram Graph API for exact visual & audio comparison.</p>
      <video controls loop muted playsinline>
        <source src="/img/viral-reels/profile-samples/top1-car-original.mp4" type="video/mp4">
      </video>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('public/viral-reel-preview.html', html);
  console.log('🌐 Updated public/viral-reel-preview.html');
}

main().catch(console.error);
