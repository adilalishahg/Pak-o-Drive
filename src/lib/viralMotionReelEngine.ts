import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { callMultiProviderAI } from './multiAiEngine';
import {
  getActiveReelCategory,
  selectUniqueVideoFromCategory,
  ReelCategory,
  CATEGORIES_CONFIG,
} from './reelCategoryLibrary';
import { resolveActiveViralAudio } from './trendingAudioService';
import { INTER_BOLD_BASE64 } from './fonts/fontBase64';

// Direct path to ffmpeg
export function getFfmpegPath(): string {
  try {
    const ffmpegInstaller = eval('require')('@ffmpeg-installer/ffmpeg');
    const origPath = ffmpegInstaller.path || 'ffmpeg';

    if (process.platform === 'linux' && origPath && fs.existsSync(origPath)) {
      const tmpFfmpeg = path.join(os.tmpdir(), 'ffmpeg');
      try {
        if (!fs.existsSync(tmpFfmpeg)) {
          fs.copyFileSync(origPath, tmpFfmpeg);
          fs.chmodSync(tmpFfmpeg, 0o755);
        }
        return tmpFfmpeg;
      } catch (e) {
        console.warn('⚠️ [ViralMotionReel] Could not prepare tmp ffmpeg:', e);
      }
    }
    return origPath;
  } catch {
    return 'ffmpeg';
  }
}

let _ffmpegAvailableCache: boolean | null = null;

export function isFfmpegAvailable(): boolean {
  if (_ffmpegAvailableCache !== null) return _ffmpegAvailableCache;
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.platform === 'linux');
    const ffmpegBin = getFfmpegPath();
    if (isServerless && ffmpegBin === 'ffmpeg') {
      _ffmpegAvailableCache = false;
      return false;
    }
    if (ffmpegBin && ffmpegBin !== 'ffmpeg' && fs.existsSync(ffmpegBin)) {
      _ffmpegAvailableCache = true;
      return true;
    }
    execSync('ffmpeg -version', { stdio: 'ignore' });
    _ffmpegAvailableCache = true;
    return true;
  } catch {
    _ffmpegAvailableCache = false;
    return false;
  }
}

/**
 * Fallback standalone overlay burn helper using Sharp & FFmpeg
 */
export async function burnOverlayWithSharpAndFfmpeg(
  sourceVideoPath: string,
  quoteLines: string[],
  durationSeconds: number = 6.0
): Promise<string> {
  if (!isFfmpegAvailable()) {
    return sourceVideoPath;
  }

  const WIDTH = 720;
  const HEIGHT = 1280;

  const filteredLines = quoteLines.filter(l => l && l.trim().length > 0);
  if (filteredLines.length === 0) return sourceVideoPath;

  const lineHeight = 58;
  const totalTextHeight = filteredLines.length * lineHeight;
  const startY = Math.round((HEIGHT - totalTextHeight) / 2) + 26;

  const lineElements = filteredLines
    .map((line, idx) => {
      const y = startY + idx * lineHeight;
      const clean = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const pillWidth = Math.min(WIDTH - 50, Math.max(200, Math.round(line.length * 19.5 + 44)));
      const pillHeight = 50;
      const pillX = Math.round(360 - pillWidth / 2);
      const pillY = Math.round(y - 35);

      const isEmphasis = idx === 1 || (filteredLines.length > 2 && idx === filteredLines.length - 1);
      const textColor = isEmphasis ? '#FDE047' : '#FFFFFF';

      return `
        <g>
          <!-- Dark Contrast Highlight Pill Backdrop -->
          <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="12" 
            fill="#090D16" 
            fill-opacity="0.85" 
            stroke="rgba(255, 255, 255, 0.22)" 
            stroke-width="1.2" />
          <!-- High Contrast Bold Text -->
          <text x="360" y="${y}" 
            font-family="'Inter', Arial, sans-serif" 
            font-size="32" 
            font-weight="800" 
            fill="${textColor}" 
            stroke="#000000" 
            stroke-width="1.2" 
            paint-order="stroke fill"
            text-anchor="middle"
            letter-spacing="-0.3">${clean}</text>
        </g>
      `;
    })
    .join('');

  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Full-Frame Cinematic Dark Tint Overlay -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000" fill-opacity="0.18" />
      ${lineElements}
    </svg>
  `;

  const tempDir = path.join(os.tmpdir(), 'viral_reels_temp');
  if (!fs.existsSync(tempDir)) {
    try { fs.mkdirSync(tempDir, { recursive: true }); } catch {}
  }

  const overlayPath = path.join(tempDir, `overlay_${Date.now()}.png`);
  await sharp(Buffer.from(overlaySvg)).png().toFile(overlayPath);

  const outputPath = path.join(tempDir, `burned_${Date.now()}.mp4`);
  const ffmpegBin = getFfmpegPath();

  const filterComplex = `
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,eq=brightness=-0.08:contrast=1.15:saturation=1.1,setsar=1[bg];
    [bg][1:v]overlay=0:0[v]
  `.replace(/\s+/g, ' ').trim();

  const absSource = path.isAbsolute(sourceVideoPath) ? sourceVideoPath : path.resolve(sourceVideoPath);
  const absOverlay = overlayPath;
  const absOutput = outputPath;

  const cmd = `"${ffmpegBin}" -y -i "${absSource}" -i "${absOverlay}" -filter_complex "${filterComplex}" -map "[v]" -map 0:a? -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -t ${durationSeconds} "${absOutput}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (err: any) {
    console.warn(`⚠️ [burnOverlayWithSharpAndFfmpeg] FFmpeg burn warning: ${err.message}`);
  }

  try { if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath); } catch {}

  if (fs.existsSync(absOutput) && fs.statSync(absOutput).size > 1000) {
    return absOutput;
  }
  return sourceVideoPath;
}

export interface ViralAiReelPackage {
  title: string;
  quoteLines: string[];
  caption: string;
  hashtags: string[];
  theme: string;
  category: ReelCategory;
}

export interface ViralMotionReelOptions {
  category?: ReelCategory;
  quoteLines?: string[];
  audioFile?: string;
  sourceVideoPath?: string;
  durationSeconds?: number;
  outputFilePath?: string;
}

export interface ViralMotionReelResult {
  success: boolean;
  videoPath: string;
  durationSeconds: number;
  quoteLines: string[];
  title: string;
  caption?: string;
  hashtags?: string[];
  category: ReelCategory;
  isBurnedWithFfmpeg?: boolean;
  audioPath?: string;
  audioRemoteUrl?: string;
  overlayPngPath?: string;
}

/**
 * Available viral audio tracks pool for dynamic daily music rotation
 */
export const AUDIO_TRACKS_POOL = [
  'public/audio/proven-viral-track-1-260likes.mp3',
  'public/audio/proven-viral-track-2-176likes.mp3',
  'public/audio/viral-electronic-night-drive.mp3',
  'public/audio/viral-synthwave-memory.mp3',
  'public/audio/viral-dark-ambient-mindset.mp3',
  'public/audio/viral-snowfall-atmospheric.mp3',
  'public/audio/viral-lofi-chill.mp3',
  'public/audio/aesthetic-lofi-trending.mp3',
];

export const CATEGORY_VIRAL_AUDIO_MAP: Record<ReelCategory, string> = {
  roads: 'public/audio/proven-viral-track-1-260likes.mp3',
  buildings: 'public/audio/proven-viral-track-2-176likes.mp3',
  sky: 'public/audio/proven-viral-track-1-260likes.mp3',
  beach: 'public/audio/proven-viral-track-2-176likes.mp3',
  rain: 'public/audio/proven-viral-track-1-260likes.mp3',
  nature: 'public/audio/proven-viral-track-2-176likes.mp3',
};

function robustParseAiJson(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const sanitized = cleaned.replace(/(:\s*")([^"\\]*(?:\\.[^"\\]*)*)(")/g, (_m, p1, p2, p3) => {
        return p1 + p2.replace(/\r?\n/g, ' ').replace(/\t/g, ' ') + p3;
      });
      return JSON.parse(sanitized);
    } catch {
      const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/i);
      const hookMatch = cleaned.match(/"captionHook"\s*:\s*"([^"]+)"/i);
      const quoteLinesMatch = cleaned.match(/"quoteLines"\s*:\s*\[([\s\S]*?)\]/);
      let quoteLines: string[] = [];
      if (quoteLinesMatch) {
        const lines = quoteLinesMatch[1].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
        if (lines) {
          quoteLines = lines.map(l => l.replace(/^"|"$/g, '').trim()).filter(Boolean);
        }
      }
      if (quoteLines.length > 0) {
        return {
          title: titleMatch ? titleMatch[1] : quoteLines[0],
          quoteLines,
          captionHook: hookMatch ? hookMatch[1] : undefined,
        };
      }
    }
  }
  return null;
}

/**
 * Dynamically generates viral quotes, hooks, captions, and hashtags via multi-provider AI matching the active category
 */
export async function generateViralAiContent(selectedCategory?: ReelCategory): Promise<ViralAiReelPackage> {
  const category = selectedCategory || getActiveReelCategory();
  const catConfig = CATEGORIES_CONFIG[category];

  const prompt = `You are the viral creative director behind @digitalinspirer's top-performing Instagram Reels (which generated 260+ likes and thousands of views).

YOUR GOAL: Generate a 3-line high-status psychological contrast reel and a rhythmic, deep-retention caption based on the proven Feb 2026 winning formula.

PROVEN WINNING FORMULA:
- Hook on video: "Most people [common mistake] / Smart people [high-status response] / [Punchline truth]"
- Theme: Emotional control, quiet discipline, mental power, restraint, strategic silence, self-mastery.
- NEVER write abstract, poetic slogans (NEVER write "Build skylines", "Empire builders", "Outwork everyone").
- ALWAYS write psychological truths that make viewers feel mature, wise, and superior so they share to their Instagram Story.

Requirements:
1. quoteLines: Exactly 3 punchy lines:
   - Line 1: Pattern-interrupt starting with "Most people..." (e.g. "Most people react instantly:", "Most people misunderstand intelligence:", "Most people argue to win:", "Most people fear being alone:")
   - Line 2: The intelligent contrast (e.g. "Smart people respond intentionally.", "Real intelligence observes quietly.", "Wise people observe to learn.", "The top 1% find power in solitude.")
   - Line 3: The philosophical punchline (e.g. "Speed is emotional. Control is intellectual.", "Sometimes the smartest move is staying calm.", "Restraint is the ultimate power.")
2. title: An intense 2-4 word title in ALL CAPS (e.g. "EMOTIONAL MASTERY", "QUIET INTELLIGENCE", "REAL POWER", "STRATEGIC SILENCE").
3. captionHook: 1 powerful hook sentence.
4. captionBody: A rhythmic, spaced 3-beat caption exactly matching this format:
   "[Line 1] ⚡👇\\n\\n[Line 2]\\n[Line 3] 🧠\\n\\nOne second ⏳\\nOne evaluation 🔍\\nOne measured reply 🤫\\n\\nOr none.\\nYou stay above the situation.\\n\\nEvery delay increases clarity 🧭\\nEvery restraint sharpens presence 📈\\nEvery quiet decision compounds 🌙\\n\\nFollow 👉 @digitalinspirer ✨"

Output ONLY valid JSON with no markdown backticks:
{
  "title": "...",
  "quoteLines": ["Most people...", "Smart people...", "Punchline"],
  "captionHook": "...",
  "caption": "Full formatted caption matching the 3-beat cadence above",
  "hashtags": ["#wisdom", "#stayfocused", "#mindset", "#emotionalcontrol", "#growth"],
  "theme": "${category}"
}`;

  try {
    const aiRes = await callMultiProviderAI('You are a viral Instagram growth director.', prompt);
    if (aiRes && typeof aiRes.text === 'string') {
      const parsed = robustParseAiJson(aiRes.text);
      if (parsed?.quoteLines && Array.isArray(parsed.quoteLines) && parsed.quoteLines.length >= 2) {
        const title = (parsed.title || parsed.quoteLines[0]).toUpperCase();
        const quoteLines = parsed.quoteLines.filter((l: string) => typeof l === 'string' && l.trim().length > 0);
        const hashtags = ['#wisdom', '#stayfocused', '#mindset', '#emotionalcontrol', '#growth'];

        let caption = parsed.caption;
        if (!caption || caption.length < 50) {
          caption = `${quoteLines[0]} ⚡👇\n\n${quoteLines[1]}\n${quoteLines[2] || 'Control is intellectual.'} 🧠\n\nOne second ⏳\nOne evaluation 🔍\nOne measured reply 🤫\n\nOr none.\nYou stay above the situation.\n\nEvery delay increases clarity 🧭\nEvery restraint sharpens presence 📈\nEvery quiet decision compounds 🌙\n\nFollow 👉 @digitalinspirer ✨\n\n${hashtags.join('\n')}`;
        }

        return {
          title,
          quoteLines,
          caption,
          hashtags,
          theme: category,
          category,
        };
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [ViralMotionReel] AI generation fallback: ${err.message}`);
  }

  // Proven historical fallbacks from the top-performing Feb 2026 reels (261 likes, 176 likes, 103 likes)
  const PROVEN_WINNING_DECK = [
    {
      title: 'EMOTIONAL CONTROL',
      quoteLines: ['Most people react instantly:', 'Smart people respond intentionally.', 'Speed is emotional. Control is intellectual.'],
      caption: `Most people react instantly ⚡👇\n\nSmart people respond intentionally.\nSpeed is emotional.\n\nControl is intellectual 🧠\nYou don't rush.\n\nOne second ⏳\nOne evaluation 🔍\nOne measured reply 🤫\n\nOr none.\nYou stay above the situation.\n\nEvery delay increases clarity 🧭\nEvery restraint sharpens presence 📈\nEvery quiet decision compounds 🌙\n\nFollow 👉 @digitalinspirer ✨\n\n#wisdom\n#stayfocused\n#mindset\n#emotionalcontrol\n#growth`,
    },
    {
      title: 'QUIET INTELLIGENCE',
      quoteLines: ['Most people misunderstand intelligence:', 'Real intelligence is never loud.', 'Sometimes the smartest move is staying calm.'],
      caption: `Most people misunderstand intelligence 🧠👇\n\nReal intelligence isn't loud.\nIt doesn't compete for attention.\n\nIt observes 👀\nIt listens 🤫\nIt understands.\n\nSometimes the smartest move\nis choosing not to prove you're smart.\n\nYou stay calm.\nYou let others talk.\n\nOne moment of patience ⏳\nOne decision to stay silent 🤐\nOne ego left in check.\n\nBecause wisdom doesn't argue.\nIt recognizes.\n\nEvery restraint shows strength 💪\nEvery pause protects energy ⚡\nEvery quiet choice compounds 📈\n\nFollow 👉 @digitalinspirer ✨\n\n#wisdom\n#mindsetshift\n#emotionalintelligence\n#staycalm\n#growth`,
    },
    {
      title: 'OBSERVE TO LEARN',
      quoteLines: ['Most people argue to win:', 'Wise people observe to learn.', 'You don’t need to prove intelligence.'],
      caption: `Most people argue to win 🥊👇\n\nWise people observe to learn.\nThere's a difference.\n\nYou don't need to prove intelligence.\nYou demonstrate it through restraint 🤫\n\nOne situation 🎯\nOne choice to stay quiet 🤐\nOne mind in control 🧠\n\nLet others feel superior.\nYou stay strategic.\n\nEvery controlled reaction builds respect 📈\nEvery pause saves peace 🕊️\nEvery silent observation wins ♟️\n\nFollow 👉 @digitalinspirer ✨\n\n#wisdom\n#stayfocused\n#mindset\n#emotionalcontrol\n#growth`,
    },
    {
      title: 'DISCIPLINE BEATS NOISE',
      quoteLines: ['Most people look for shortcuts:', 'The real path is boring and quiet.', 'Discipline always beats excitement.'],
      caption: `Most people look for shortcuts 🚧👇\n\nBut the real path is boring.\nAnd that's why it works 🔁\n\nSame effort 📆\nSame focus 🎯\nSame routine 🔄\n\nDiscipline beats excitement 🧠\n\nOne habit daily 👣\nOne improvement weekly 🔧\nOne system long-term ⚙️\n\nEvery repetition hardens mental grit 💪\nEvery early morning counts 🌅\nEvery silent effort compounds 📈\n\nFollow 👉 @digitalinspirer ✨\n\n#wisdom\n#stayfocused\n#mindset\n#discipline\n#growth`,
    },
  ];

  const candidate = PROVEN_WINNING_DECK[Math.floor(Math.random() * PROVEN_WINNING_DECK.length)];
  return {
    title: candidate.title,
    quoteLines: candidate.quoteLines,
    caption: candidate.caption,
    hashtags: ['#wisdom', '#stayfocused', '#mindset', '#emotionalcontrol', '#growth'],
    theme: category,
    category,
  };
}

/**
 * Ensures a video asset exists as a real file on the local filesystem.
 * Handles serverless read-only disk environments where public/ files are hosted on CDN.
 */
async function ensureLocalVideoFile(sourceVideoPath: string): Promise<string> {
  // 1. Direct local path in project
  const absDirect = path.isAbsolute(sourceVideoPath) ? sourceVideoPath : path.resolve(sourceVideoPath);
  if (fs.existsSync(absDirect) && fs.statSync(absDirect).size > 50000) {
    return absDirect;
  }

  // 2. Check writable /tmp cache
  const filename = sourceVideoPath.startsWith('http')
    ? (sourceVideoPath.split('/').filter(Boolean).slice(-2).join('-').replace(/[?#].*$/, '') || 'reel-source.mp4')
    : path.basename(sourceVideoPath);
  const tmpDir = path.join(os.tmpdir(), 'viral_video_cache');
  if (!fs.existsSync(tmpDir)) {
    try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {}
  }
  const tmpPath = path.join(tmpDir, filename);
  if (fs.existsSync(tmpPath) && fs.statSync(tmpPath).size > 50000) {
    return tmpPath;
  }

  // 3. Download from remote CDN / Cloudinary or site on-demand
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pakodrive.pk').replace(/\/$/, '');
  const cleanRelative = sourceVideoPath.replace(/^.*?public[/\\]/, '').replace(/\\/g, '/').replace(/^\//, '');
  const downloadUrl = sourceVideoPath.startsWith('http') ? sourceVideoPath : `${siteUrl}/${cleanRelative}`;

  try {
    console.log(`📥 [ViralMotionReel] Pre-caching video into serverless /tmp: ${downloadUrl}...`);
    const res = await fetch(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 50000) {
        fs.writeFileSync(tmpPath, buffer);
        console.log(`✓ [ViralMotionReel] Video cached locally in /tmp: ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        return tmpPath;
      }
    }
  } catch (e: any) {
    console.warn(`⚠️ [ViralMotionReel] Could not pre-cache video into /tmp: ${e.message}`);
  }

  return absDirect;
}

/**
 * Generates a viral 9:16 real moving video reel with automatic category & asset rotation
 */
export async function generateViralMotionReel(options?: ViralMotionReelOptions): Promise<ViralMotionReelResult> {
  const WIDTH = 720;
  const HEIGHT = 1280;
  const duration = options?.durationSeconds || 6.0;

  const category = options?.category || getActiveReelCategory();
  console.log(`🏷️ [ViralMotionReel] Active Category for today: [${category.toUpperCase()}]`);

  let quoteLines = options?.quoteLines;
  let title = 'Viral Mindset Reel';
  let caption = '';
  let hashtags: string[] = [];

  if (!quoteLines || quoteLines.length === 0) {
    const aiContent = await generateViralAiContent(category);
    quoteLines = aiContent.quoteLines;
    title = aiContent.title;
    caption = aiContent.caption;
    hashtags = aiContent.hashtags;
  } else {
    title = quoteLines.filter(Boolean)[0] || 'Viral Mindset Reel';
  }

  // Dynamic Video Selection from Category Library (Guaranteed non-repeating)
  let sourceVideo = options?.sourceVideoPath;
  if (!sourceVideo) {
    const selected = selectUniqueVideoFromCategory(category);
    sourceVideo = selected.videoPath;
    console.log(`🎥 [ViralMotionReel] Selected unique video from ${category}: ${sourceVideo}`);
  }

  // Resolve video into confirmed local file on disk (resilient to serverless)
  const absSource = await ensureLocalVideoFile(sourceVideo);

  // Dynamic Weekly Audio Selection from Trending Pool
  let localAudioPath = '';
  let audioRemoteUrl = '';
  let audioName = '';

  if (options?.audioFile && fs.existsSync(options.audioFile)) {
    localAudioPath = options.audioFile;
    audioName = path.basename(options.audioFile);
  } else {
    const resolvedAudio = await resolveActiveViralAudio(category);
    localAudioPath = resolvedAudio.localPath;
    audioRemoteUrl = resolvedAudio.sourceUrl;
    audioName = resolvedAudio.name;
  }

  console.log(`🎵 [ViralMotionReel] Active weekly trending audio for [${category}]: "${audioName}" (${path.basename(localAudioPath)})`);

  // Load font base64 for crisp serverless rendering
  const fontBase64 = INTER_BOLD_BASE64 || '';

  // Generate SVG overlay with contrast highlight pill backdrops
  const filteredLines = quoteLines.filter(l => l.trim().length > 0);
  const lineHeight = 58;
  const totalTextHeight = filteredLines.length * lineHeight;
  const startY = Math.round((HEIGHT - totalTextHeight) / 2) + 26;

  const lineElements = filteredLines
    .map((line, idx) => {
      const y = startY + idx * lineHeight;
      const clean = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const pillWidth = Math.min(WIDTH - 50, Math.max(200, Math.round(line.length * 19.5 + 44)));
      const pillHeight = 50;
      const pillX = Math.round(360 - pillWidth / 2);
      const pillY = Math.round(y - 35);

      const isEmphasis = idx === 1 || (filteredLines.length > 2 && idx === filteredLines.length - 1);
      const textColor = isEmphasis ? '#FDE047' : '#FFFFFF';

      return `
        <g>
          <!-- Dark Contrast Highlight Pill Backdrop -->
          <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="12" 
            fill="#090D16" 
            fill-opacity="0.85" 
            stroke="rgba(255, 255, 255, 0.22)" 
            stroke-width="1.2" />
          <!-- High Contrast Bold Text -->
          <text x="360" y="${y}" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="32" 
            font-weight="800" 
            fill="${textColor}" 
            stroke="#000000" 
            stroke-width="1.2" 
            paint-order="stroke fill"
            text-anchor="middle"
            letter-spacing="-0.3">${clean}</text>
        </g>
      `;
    })
    .join('');

  const fontStyle = fontBase64
    ? `
      @font-face {
        font-family: 'Inter';
        font-weight: 700;
        font-style: normal;
        src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
      }
    `
    : '';

  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          ${fontStyle}
        </style>
      </defs>
      <!-- Full-Frame Cinematic Dark Tint Overlay -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000" fill-opacity="0.18" />
      ${lineElements}
    </svg>
  `;

  const tempDir = path.join(os.tmpdir(), 'viral_reels_temp');
  if (!fs.existsSync(tempDir)) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch {}
  }

  const overlayPath = path.join(tempDir, `overlay_${Date.now()}.png`);
  try {
    await sharp(Buffer.from(overlaySvg)).png().toFile(overlayPath);
  } catch (sharpErr: any) {
    console.warn('⚠️ [ViralMotionReel] Sharp overlay render skipped:', sharpErr.message);
  }

  const outputPath = options?.outputFilePath || path.join(tempDir, `viral_reel_${Date.now()}.mp4`);
  const ffmpegBin = getFfmpegPath();

  console.log(`🎬 [ViralMotionReel] Rendering: [${category}] ${path.basename(absSource)} + ${path.basename(localAudioPath)} -> ${path.basename(outputPath)}`);

  const filterComplex = `
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,eq=brightness=-0.08:contrast=1.15:saturation=1.1,setsar=1[bg];
    [bg][1:v]overlay=0:0[v]
  `.replace(/\s+/g, ' ').trim();

  const absAudio = localAudioPath;
  const absOverlay = overlayPath;
  const absOutput = outputPath;
  const cmd = `"${ffmpegBin}" -y -stream_loop -1 -i "${absSource}" -i "${absOverlay}" -i "${absAudio}" -filter_complex "${filterComplex}" -map "[v]" -map 2:a -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -t ${duration} "${absOutput}"`;

  let finalVideoPath = absOutput;
  let isBurnedWithFfmpeg = false;

  if (!isFfmpegAvailable()) {
    console.log(`☁️ [ViralMotionReel] Serverless environment: routing video & overlay to Cloudinary synthesis: ${path.basename(absSource)}`);
    finalVideoPath = absSource;
    isBurnedWithFfmpeg = false;
  } else {
    try {
      execSync(cmd, { stdio: 'pipe' });
      if (fs.existsSync(absOutput) && fs.statSync(absOutput).size > 1000) {
        isBurnedWithFfmpeg = true;
        console.log(`✓ [ViralMotionReel] Video rendered successfully with FFmpeg overlay: ${absOutput}`);
      } else {
        finalVideoPath = absSource;
      }
    } catch (renderErr: any) {
      console.warn(`⚠️ [ViralMotionReel] Local FFmpeg execution failed: ${renderErr.message}. Falling back to Cloudinary synthesis.`);
      finalVideoPath = absSource;
      isBurnedWithFfmpeg = false;
    }
  }

  // Clean up temporary overlay ONLY if FFmpeg succeeded; if fallback to Cloudinary, keep it
  if (isBurnedWithFfmpeg) {
    try {
      if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath);
    } catch {}
  }

  return {
    success: true,
    videoPath: finalVideoPath,
    durationSeconds: duration,
    quoteLines,
    title,
    caption,
    hashtags,
    category,
    isBurnedWithFfmpeg,
    audioPath: localAudioPath,
    audioRemoteUrl,
    overlayPngPath: !isBurnedWithFfmpeg && fs.existsSync(overlayPath) ? overlayPath : undefined,
  };
}
