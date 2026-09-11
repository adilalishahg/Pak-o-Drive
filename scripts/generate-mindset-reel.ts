import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const FFMPEG_PATH = ffmpegInstaller.path;
const FFPROBE_PATH = ffprobeInstaller.path;

interface MindsetReelData {
  hook: string;
  lines: string[];
  affirmation: string;
  narration: string;
  caption: string;
}

const SAMPLE_CONTENT: MindsetReelData = {
  hook: 'Read this slowly..',
  lines: [
    'Real winning is quiet.',
    'No debates.',
    'No proving.',
    'Just control.',
    'One measured response,',
    'or no response at all.',
    'Silence is leverage.'
  ],
  affirmation: "Type 'YES' to claim your clarity ⚡",
  narration: "Read this slowly. Real winning is quiet. No debates. No proving. Just control. One measured response, or no response at all. Silence is leverage.",
  caption: `Most people think winning is loud 🏆👇

Real winning is quiet.

No debates.
No proving.

Just control.
One measured reply 🗣️
or
no reply 🤐
Both are strength 💪

You don't expose depth to shallow minds.

Every controlled reaction builds status 📈
Every restraint protects clarity 🧭
Every silent choice compounds 🌙

Follow 👉 @digitalinspirer ✨

#wisdom
#strategy
#mindsetshift
#focus
#consistency
#stoicism
#growth`
};

const VISUAL_THEMES = {
  car: {
    name: 'Luxury Car Night Highway',
    imagePath: 'public/car_night.jpg',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1440&q=80'
  },
  nature: {
    name: 'Ocean Waves Aerial',
    imagePath: 'public/ocean_moody.jpg',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1440&q=80'
  },
  city: {
    name: 'Skyline Cityscape',
    imagePath: 'public/city_night.jpg',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1440&q=80'
  }
};

async function ensureThemeVisual(themeKey: 'car' | 'nature' | 'city', targetPath: string): Promise<void> {
  const theme = VISUAL_THEMES[themeKey] || VISUAL_THEMES.car;
  if (fs.existsSync(theme.imagePath) && fs.statSync(theme.imagePath).size > 10000) {
    fs.copyFileSync(theme.imagePath, targetPath);
    console.log(`✓ Loaded visual theme: "${theme.name}"`);
    return;
  }
  console.log(`📥 Downloading high-res visual: "${theme.name}"...`);
  const res = await fetch(theme.url);
  if (!res.ok) throw new Error(`Failed to fetch visual: ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(buf));
  console.log('✓ Visual downloaded successfully.');
}

async function ensureBackgroundMusic(targetPath: string): Promise<void> {
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 100000) {
    return;
  }
  console.log('🎵 Downloading viral royalty-free ambient piano track...');
  const url = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Failed to fetch BGM: ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(buf));
  console.log('✓ Background music downloaded successfully.');
}

async function generateVoiceover(text: string, outputPath: string): Promise<number> {
  console.log('🎙️ Generating calm Stoic neural voiceover (en-US-ChristopherNeural)...');
  const tts = new MsEdgeTTS();
  // Using ChristopherNeural with slightly deliberate, deep pacing
  await tts.setMetadata('en-US-ChristopherNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  
  const { audioStream } = tts.toStream(text);
  const writeStream = fs.createWriteStream(outputPath);
  
  await new Promise<void>((resolve, reject) => {
    audioStream.pipe(writeStream);
    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
  });

  // Calculate audio duration
  const cmd = `"${FFPROBE_PATH}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`;
  const output = execSync(cmd, { encoding: 'utf-8' }).trim();
  const parsed = parseFloat(output);
  const duration = (!isNaN(parsed) && parsed > 0) ? Math.round((parsed + 0.8) * 10) / 10 : 8.0;
  console.log(`✓ Voiceover generated: ${duration}s`);
  return duration;
}

function renderTextOverlaySvg(data: MindsetReelData): Buffer {
  const lineElements = data.lines
    .map((line, idx) => {
      const isEmphasis = idx === 0 || idx === 3 || idx === 6;
      const fontSize = isEmphasis ? 44 : 38;
      const fontWeight = isEmphasis ? '700' : '400';
      const color = isEmphasis ? '#F8FAFC' : '#E2E8F0';
      const yPos = 840 + (idx * 64);
      return `<text x="540" y="${yPos}" text-anchor="middle" font-family="Georgia, serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" filter="url(#shadow)">${line}</text>`;
    })
    .join('\n');

  const svg = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Cinematic Text Drop Shadow -->
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.95"/>
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.90"/>
      </filter>
      <!-- Subtle Dark Cinematic Gradient to make white text pop without obscuring video -->
      <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
        <stop offset="35%" stop-color="#000000" stop-opacity="0.55"/>
        <stop offset="65%" stop-color="#000000" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.75"/>
      </linearGradient>
    </defs>

    <!-- Semi-transparent overlay backdrop for high readability -->
    <rect width="1080" height="1920" fill="url(#vignette)"/>

    <!-- Subtle Brand Tag at Top Center -->
    <text x="540" y="320" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" letter-spacing="6" fill="#94A3B8" opacity="0.9" filter="url(#shadow)">
      • DIGITAL INSPIRER •
    </text>

    <!-- Hook (Read this slowly..) -->
    <text x="540" y="740" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-style="italic" font-weight="400" fill="#CBD5E1" filter="url(#shadow)">
      ${data.hook}
    </text>

    <!-- Main Message Lines -->
    ${lineElements}

    <!-- Call to Action (Type YES..) -->
    <text x="540" y="1360" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" letter-spacing="1" fill="#F8FAFC" filter="url(#shadow)">
      ${data.affirmation}
    </text>

    <!-- Subtle Follow Watermark -->
    <text x="540" y="1420" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" letter-spacing="2" fill="#38BDF8" opacity="0.9" filter="url(#shadow)">
      Follow 👉 @digitalinspirer
    </text>
  </svg>`;

  return Buffer.from(svg);
}

async function main() {
  const chosenTheme = (process.argv[2]?.toLowerCase() || 'car') as 'car' | 'nature' | 'city';
  const themeConfig = VISUAL_THEMES[chosenTheme] || VISUAL_THEMES.car;

  console.log('===============================================================');
  console.log(`🚀 [Digital Inspirer] Generating Pure Aesthetic Reel [Theme: ${themeConfig.name}]`);
  console.log('===============================================================');

  const workDir = path.resolve('temp_mindset_reel');
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  const rawImagePath = path.join(workDir, `raw_${chosenTheme}.jpg`);
  const bgCroppedPath = path.join(workDir, `bg_${chosenTheme}_1080x1920.jpg`);
  const bgmPath = path.join(workDir, 'bgm.mp3');
  const overlayPngPath = path.join(workDir, 'text_overlay.png');
  const finalVideoOutput = path.resolve('public/mindset-reel.mp4');

  // Step 1: Ensure Theme Visual & Viral BGM
  await ensureThemeVisual(chosenTheme, rawImagePath);
  await ensureBackgroundMusic(bgmPath);

  // Step 2: Use Sharp to produce high-res 1080x1920 portrait base with subtle cinematic vignette
  console.log(`🖼️ Preparing 1080x1920 portrait background for "${themeConfig.name}"...`);
  await sharp(rawImagePath)
    .resize(1080, 1920, { fit: 'cover', position: 'center' })
    .toFile(bgCroppedPath);
  console.log('✓ Background image ready.');

  // Step 3: Render Clean Text Overlay Image via Sharp
  console.log('🎨 Rendering crisp 1080x1920 typography overlay...');
  const svgBuffer = renderTextOverlaySvg(SAMPLE_CONTENT);
  await sharp(svgBuffer).png().toFile(overlayPngPath);
  console.log('✓ Text overlay image rendered.');

  // Step 4: Compile Master Video with subtle cinematic camera push (Ken Burns) + Viral Music
  const targetDuration = 7.5;
  const fadeOutStart = (targetDuration - 0.8).toFixed(1);

  console.log(`🎬 Compiling master video with FFmpeg (${targetDuration}s slow cinematic drift + viral music)...`);

  // Using zoompan to give a slow 4K camera glide (1.0 -> 1.06 zoom) over 225 frames (7.5s @ 30fps)
  const totalFrames = Math.round(targetDuration * 30);
  const ffmpegCmd = `"${FFMPEG_PATH}" -y ` +
    `-loop 1 -framerate 30 -i "${bgCroppedPath}" ` +
    `-i "${overlayPngPath}" ` +
    `-stream_loop -1 -i "${bgmPath}" ` +
    `-filter_complex "` +
    `[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0003,1.06)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30[camera];` +
    `[camera][1:v]overlay=0:0[v];` +
    `[2:a]volume=0.95,afade=t=in:st=0:d=0.3,afade=t=out:st=${fadeOutStart}:d=0.8[a]` +
    `" ` +
    `-map "[v]" -map "[a]" ` +
    `-t ${targetDuration} ` +
    `-c:v libx264 -preset fast -pix_fmt yuv420p -b:v 5000k ` +
    `-c:a aac -b:a 192k ` +
    `"${finalVideoOutput}"`;

  execSync(ffmpegCmd, { stdio: 'pipe' });

  const stats = fs.statSync(finalVideoOutput);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  // Step 5: Generate Browser Preview HTML
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Viral Mindset Reel (${themeConfig.name}) • @digitalinspirer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4">
      <div>
        <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">${themeConfig.name}</span>
        <h1 class="text-lg font-extrabold text-white">@digitalinspirer</h1>
      </div>
      <span class="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/30">${targetDuration}s Loop</span>
    </div>

    <!-- Video Player Container (9:16 Aspect Ratio) -->
    <div class="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
      <video class="w-full h-full object-cover" controls autoplay loop playsinline>
        <source src="/mindset-reel.mp4" type="video/mp4">
        Your browser does not support video playback.
      </video>
    </div>

    <div class="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
      <div class="flex justify-between items-center">
        <span>File: <b>mindset-reel.mp4</b> (${sizeMb} MB)</span>
        <a href="/mindset-reel.mp4" download class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all">
          Download MP4
        </a>
      </div>
      <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] leading-relaxed">
        <p class="font-bold text-slate-300 mb-1">📝 Instagram Caption:</p>
        <pre class="whitespace-pre-wrap font-sans text-slate-400">${SAMPLE_CONTENT.caption}</pre>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('public/mindset-reel-preview.html', previewHtml);

  console.log('\n===============================================================');
  console.log(`🎉 PURE MUSIC + TEXT REEL [${themeConfig.name}] GENERATED!`);
  console.log(`📁 Video File:    ${finalVideoOutput}`);
  console.log(`⏱️ Duration:      ${targetDuration} seconds (High Retention Loop)`);
  console.log(`📊 File Size:     ${sizeMb} MB`);
  console.log(`🌐 HTML Preview:  public/mindset-reel-preview.html`);
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('❌ Error during mindset reel generation:', err);
  process.exit(1);
});
