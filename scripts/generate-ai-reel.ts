import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const FFMPEG_PATH = ffmpegInstaller.path;

interface ReelScene {
  slideNumber: number;
  totalSlides: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  toolName?: string;
  points: string[];
  narrationText: string;
}

const REEL_SCENES: ReelScene[] = [
  {
    slideNumber: 1,
    totalSlides: 4,
    badge: 'SECRET AI WEAPONS',
    badgeColor: '#00F5D4',
    title: '3 AI Websites That Feel Illegal To Know in 2026',
    subtitle: 'Save this before it gets taken down ⚡',
    points: [
      '⚡ 10x faster developer output',
      '💸 Save $150/mo in software fees',
      '🤖 Silicon Valley automated workflows',
    ],
    narrationText: 'Stop scrolling! Here are three secret AI websites that feel completely illegal to know in 2026.',
  },
  {
    slideNumber: 2,
    totalSlides: 4,
    badge: 'TOOL #1 • GENERATIVE UI',
    badgeColor: '#38BDF8',
    title: 'v0.dev',
    subtitle: 'Generative Full-Stack UI in 30 Seconds',
    toolName: 'v0.dev',
    points: [
      '❌ Replaces: 5+ hours manually writing CSS & components',
      '⚡ Superpower: Prompt any app idea, get production React code',
      '💡 Pro Tip: Prototype entire client apps in 10 minutes',
    ],
    narrationText: 'First is v0.dev. Just describe any web app idea in plain English, and it builds production-ready responsive React and Tailwind code in thirty seconds.',
  },
  {
    slideNumber: 3,
    totalSlides: 4,
    badge: 'TOOL #2 • VOICE CLONING',
    badgeColor: '#A855F7',
    title: 'ElevenLabs',
    subtitle: 'Ultra-Realistic AI Voice Synthesis',
    toolName: 'ElevenLabs',
    points: [
      '❌ Replaces: Expensive voiceover artists and studio mics',
      '⚡ Superpower: Clones human voices with 100% emotional cadence',
      '💡 Pro Tip: Use speech-to-speech for instant faceless reels',
    ],
    narrationText: 'Second is ElevenLabs. It clones any human voice with complete emotional cadence, breathing pacing, and inflection in under three seconds.',
  },
  {
    slideNumber: 4,
    totalSlides: 4,
    badge: 'ACTION STEP • FREE ACCESS',
    badgeColor: '#FACC15',
    title: 'Get Free Access Links',
    subtitle: 'Comment "TOOL" Below 👇',
    points: [
      '🤖 Automated DM Bot sends direct links instantly',
      '🎁 Exclusive free trial credits included',
      '🚀 Follow @digitalinspirer for daily secret AI hacks',
    ],
    narrationText: 'Comment the word TOOL below and our automated bot will send you all direct access links and exclusive credits straight to your inbox!',
  },
];

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine = 24): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Render 1080x1920 (9:16 Vertical Reel) Slide as JPEG Buffer
 */
async function renderReelSlide(scene: ReelScene): Promise<Buffer> {
  const WIDTH = 1080;
  const HEIGHT = 1920;
  const accent = scene.badgeColor || '#00F5D4';

  const titleLines = wrapText(scene.title, 18);
  const subtitleLines = wrapText(scene.subtitle, 28);

  const pointsSvg = scene.points
    .map((point, idx) => {
      const boxY = 1060 + idx * 190;
      const wrapped = wrapText(point, 32);
      return `
        <rect x="80" y="${boxY}" width="920" height="160" rx="24" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <circle cx="125" cy="${boxY + 80}" r="16" fill="rgba(0, 245, 212, 0.15)" stroke="${accent}" stroke-width="2" />
        <text x="125" y="${boxY + 86}" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="${accent}" text-anchor="middle">${idx + 1}</text>
        <text x="165" y="${boxY + 68}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF">${escapeXml(wrapped[0] || '')}</text>
        ${wrapped[1] ? `<text x="165" y="${boxY + 110}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#94A3B8">${escapeXml(wrapped[1])}</text>` : ''}
      `;
    })
    .join('');

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#050811" />
          <stop offset="50%" stop-color="#0B132B" />
          <stop offset="100%" stop-color="#070A14" />
        </linearGradient>
        <radialGradient id="glowOrb1" cx="30%" cy="20%" r="40%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glowOrb2" cx="80%" cy="75%" r="45%">
          <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Background Canvas -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)" />
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowOrb1)" />
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowOrb2)" />

      <!-- Outer Frame Glow -->
      <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" rx="36" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />

      <!-- Top Branding Header -->
      <circle cx="120" cy="150" r="32" fill="#1E293B" stroke="${accent}" stroke-width="2.5" />
      <text x="120" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="${accent}" text-anchor="middle">DI</text>
      
      <text x="175" y="146" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF">@digitalinspirer</text>
      <text x="175" y="174" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#94A3B8">Daily Secret AI &amp; Tech</text>

      <!-- Top Badge Pill -->
      <rect x="680" y="125" width="320" height="50" rx="25" fill="rgba(255, 255, 255, 0.08)" stroke="${accent}" stroke-width="2" />
      <text x="840" y="157" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${accent}" text-anchor="middle">${escapeXml(scene.badge)}</text>

      <!-- Hero Title Container -->
      <rect x="80" y="240" width="920" height="420" rx="32" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
      
      ${titleLines
        .map(
          (line, i) =>
            `<text x="120" y="${340 + i * 80}" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="-1">${escapeXml(line)}</text>`
        )
        .join('')}

      <!-- Subtitle Pill / Hook -->
      <rect x="80" y="700" width="920" height="110" rx="24" fill="rgba(0, 245, 212, 0.08)" stroke="${accent}" stroke-width="1.5" />
      <text x="540" y="768" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold" fill="${accent}" text-anchor="middle">${escapeXml(scene.subtitle)}</text>

      <!-- Animated Waveform Visualizer Decorator -->
      <rect x="80" y="850" width="920" height="170" rx="24" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      <text x="120" y="900" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#64748B" letter-spacing="2">AUDIO NARRATION ACTIVE</text>
      
      <!-- Sound Wave Bars -->
      ${Array.from({ length: 24 })
        .map((_, i) => {
          const barH = 20 + Math.sin(i * 0.7 + scene.slideNumber) * 35 + 25;
          const barX = 120 + i * 36;
          const barY = 970 - barH;
          return `<rect x="${barX}" y="${barY}" width="16" height="${barH}" rx="8" fill="${accent}" opacity="${0.4 + (i % 3) * 0.25}" />`;
        })
        .join('')}

      <!-- Points Breakdown -->
      ${pointsSvg}

      <!-- Footer Bar -->
      <line x1="80" y1="1760" x2="1000" y2="1760" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
      <text x="80" y="1815" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#64748B">Scene ${scene.slideNumber} of ${scene.totalSlides}</text>
      <text x="1000" y="1815" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="${accent}" text-anchor="end">${scene.slideNumber === scene.totalSlides ? 'Drop a Comment 👇' : 'Watch Next ➔'}</text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
}

/**
 * Generate Audio Voiceover using Edge-TTS
 */
async function generateAudio(text: string, outputPath: string): Promise<void> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('en-US-ChristopherNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text);

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    audioStream.pipe(writer);
    writer.on('finish', () => resolve());
    writer.on('error', reject);
  });
}

/**
 * Main Video Generator Pipeline
 */
async function main() {
  console.log('🚀 [AI Reel Generator] Initializing Autonomous 9:16 Video Engine...');
  console.log(`🎬 Using FFmpeg Binary: ${FFMPEG_PATH}`);

  const workDir = path.resolve('public/reel_workspace');
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  const sceneClips: string[] = [];

  for (let i = 0; i < REEL_SCENES.length; i++) {
    const scene = REEL_SCENES[i];
    console.log(`\n🎨 [Scene ${i + 1}/${REEL_SCENES.length}] Processing "${scene.title}"...`);

    // 1. Render Visual Slide (1080x1920)
    const slideJpeg = await renderReelSlide(scene);
    const imagePath = path.join(workDir, `scene_${i + 1}.jpg`);
    fs.writeFileSync(imagePath, slideJpeg);
    console.log(`   ✓ Rendered 1080x1920 portrait slide: ${imagePath}`);

    // 2. Generate Audio Voiceover
    const audioPath = path.join(workDir, `scene_${i + 1}.mp3`);
    await generateAudio(scene.narrationText, audioPath);
    console.log(`   ✓ Generated AI Voiceover: ${audioPath}`);

    // 3. Compile Scene Clip via FFmpeg (Image + Audio)
    const clipPath = path.join(workDir, `scene_${i + 1}.mp4`);
    console.log(`   🎬 Compiling scene ${i + 1} video clip...`);
    
    // Command: loops the still image until the audio track finishes
    const cmd = `"${FFMPEG_PATH}" -y -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${clipPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`   ✓ Scene ${i + 1} MP4 rendered successfully!`);

    sceneClips.push(clipPath);
  }

  // 4. Concatenate all scene clips into the final Reel
  console.log('\n🎞️ [Assembler] Concatenating scenes into final vertical Reel...');
  const concatListPath = path.join(workDir, 'concat_list.txt');
  const concatContent = sceneClips.map((clip) => `file '${clip.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const finalOutput = path.resolve('public/generated-reel.mp4');
  const concatCmd = `"${FFMPEG_PATH}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${finalOutput}"`;
  execSync(concatCmd, { stdio: 'pipe' });

  const stats = fs.statSync(finalOutput);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  // 5. Generate Preview HTML player
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Autonomous AI Reel Player • @digitalinspirer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4">
      <div>
        <span class="text-xs font-bold text-teal-400 uppercase tracking-wider">AI Vertical Video</span>
        <h1 class="text-lg font-extrabold text-white">Generated Instagram Reel</h1>
      </div>
      <span class="bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full font-bold border border-teal-500/30">1080x1920</span>
    </div>

    <!-- Video Player Container (9:16 Aspect Ratio) -->
    <div class="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-inner border border-white/10">
      <video class="w-full h-full object-cover" controls autoplay loop playsinline>
        <source src="/generated-reel.mp4" type="video/mp4">
        Your browser does not support video playback.
      </video>
    </div>

    <div class="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
      <span>File: <b>generated-reel.mp4</b> (${sizeMb} MB)</span>
      <a href="/generated-reel.mp4" download class="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all">
        Download MP4
      </a>
    </div>
  </div>
</body>
</html>`;
  fs.writeFileSync('public/reel-preview.html', previewHtml);

  console.log('\n===============================================================');
  console.log('🎉 AI VIDEO REEL GENERATED SUCCESSFULLY!');
  console.log(`📁 Video Path:    ${finalOutput}`);
  console.log(`📊 File Size:     ${sizeMb} MB`);
  console.log(`🌐 HTML Preview:  public/reel-preview.html`);
  console.log(`🚀 Ready to post to Instagram Reels (@digitalinspirer)!`);
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('❌ Fatal error during video generation:', err);
  process.exit(1);
});
