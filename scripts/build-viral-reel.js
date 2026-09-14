const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const INTER_BOLD_BASE64 = fs.readFileSync('src/lib/fonts/Inter-Bold.ttf').toString('base64');

async function buildViralReel() {
  const WIDTH = 720;
  const HEIGHT = 1280;
  const DURATION = 6.4;

  console.log('🚀 [ViralReelEngine] Starting viral aesthetic reel compilation...');

  // 1. Generate Crisp Typographic Transparent PNG Overlay
  const lines = [
    'My problem is...',
    'The more impossible',
    'something seems,',
    'The more it attracts me.',
  ];

  const lineElements = lines
    .map((line, idx) => {
      const y = 490 + idx * 48;
      // White text with subtle black shadow and strong contrast
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
      
      <!-- Center Text Group -->
      ${lineElements}
    </svg>
  `;

  const overlayPath = 'public/img/viral-reels/text-overlay.png';
  await sharp(Buffer.from(overlaySvg)).png().toFile(overlayPath);
  console.log('✓ [ViralReelEngine] Generated text overlay PNG:', overlayPath);

  // 2. Composite Background Image with Smooth Slow Motion Zoom + Overlay + Audio via FFmpeg
  const bgImage = 'public/img/viral-reels/supercar-flames.jpg';
  const audioFile = 'public/audio/aesthetic-lofi-trending.mp3';
  const outputVideo = 'public/viral-aesthetic-reel-test.mp4';

  console.log('🎬 [ViralReelEngine] Rendering 9:16 Cinematic Video via FFmpeg...');

  // Zoompan filter creates a subtle 1.0 -> 1.06 slow breathing zoom into the flame exhaust
  const filterComplex = `
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,zoompan=z='min(zoom+0.00035,1.06)':d=${Math.round(DURATION * 30)}:s=720x1280:fps=30[bg];
    [bg][1:v]overlay=0:0[v]
  `.replace(/\s+/g, ' ').trim();

  const cmd = `"${ffmpeg.path}" -y -loop 1 -i "${bgImage}" -i "${overlayPath}" -i "${audioFile}" -filter_complex "${filterComplex}" -map "[v]" -map 2:a -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -t ${DURATION} "${outputVideo}"`;

  execSync(cmd, { stdio: 'inherit' });
  console.log('🎉 [ViralReelEngine] Video compiled successfully to:', outputVideo);
  console.log('💾 File size:', (fs.statSync(outputVideo).size / (1024 * 1024)).toFixed(2), 'MB');

  // 3. Generate HTML Previewer
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Viral Aesthetic Reel Preview | Pak-o-Drive</title>
  <style>
    body {
      margin: 0;
      background: #030712;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #0B132B;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(0, 245, 212, 0.2);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      text-align: center;
      max-width: 420px;
    }
    video {
      width: 100%;
      max-height: 650px;
      border-radius: 12px;
      border: 1px solid #1E293B;
      outline: none;
    }
    h2 { margin: 10px 0 5px; font-size: 18px; color: #00F5D4; }
    p { margin: 0 0 15px; font-size: 13px; color: #94A3B8; }
    .badge {
      display: inline-block;
      background: rgba(0, 245, 212, 0.15);
      border: 1px solid #00F5D4;
      color: #00F5D4;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">🔥 Viral Reel Generator Prototype</span>
    <h2>Dark Aesthetic Motivation Reel</h2>
    <p>Matching @digitalinspirer #1 Top Performing Format (269 Engagement)</p>
    <video controls autoplay loop playsinline>
      <source src="/viral-aesthetic-reel-test.mp4" type="video/mp4">
      Your browser does not support video.
    </video>
  </div>
</body>
</html>`;

  fs.writeFileSync('public/viral-reel-preview.html', htmlContent);
  console.log('🌐 HTML Previewer created at: public/viral-reel-preview.html');
}

buildViralReel().catch(console.error);
