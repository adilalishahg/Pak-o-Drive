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
  durationSeconds: number = 7.5
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
  'public/audio/viral-electronic-night-drive.mp3',
  'public/audio/viral-synthwave-memory.mp3',
  'public/audio/viral-dark-ambient-mindset.mp3',
  'public/audio/viral-snowfall-atmospheric.mp3',
  'public/audio/viral-lofi-chill.mp3',
  'public/audio/aesthetic-lofi-trending.mp3',
];

export const CATEGORY_VIRAL_AUDIO_MAP: Record<ReelCategory, string> = {
  roads: 'public/audio/viral-electronic-night-drive.mp3',
  buildings: 'public/audio/viral-synthwave-memory.mp3',
  sky: 'public/audio/viral-snowfall-atmospheric.mp3',
  beach: 'public/audio/viral-snowfall-atmospheric.mp3',
  rain: 'public/audio/viral-dark-ambient-mindset.mp3',
  nature: 'public/audio/viral-lofi-chill.mp3',
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

  const dualCta = `━━━━━━━━━━━━━━━━━
🇬🇧 UK & Global (Digital & Affiliate):
✨ 4K Luxury Car Wallpapers & Presets 👉 Link in Bio
🛒 Trending Car Interior Styling on Amazon UK 👉 Link in Bio

🇵🇰 Pakistan (Physical Stock):
🚗 Cash on Delivery (COD) All Over Pakistan
📦 Tap Link in Bio or WhatsApp: +92 318 5205667

━━━━━━━━━━━━━━━━━
Follow @digitalinspirer & @pakodrive.official for daily drive & automotive luxury.

📍 London, United Kingdom`;

  const prompt = `You are a viral short-form video creative director specializing in high-retention, psychology-driven motivational and dark aesthetic car reels (like top accounts with 500k+ views).

Visual Background Category: "${catConfig.name}"
Category Theme: ${catConfig.themePrompt}

IMPORTANT INSTAGRAM ALGORITHM RULES (2026):
- NEVER write abstract, poetic, or cryptic lines (e.g. NEVER write "Rain cloaks the road", "Reflections whisper", "Shadows guide"). Viewers swipe away in 0.5s.
- ALWAYS use psychological SCROLL-STOPPING HOOKS that trigger intense curiosity, relatability, or FOMO.
- Line 1 MUST be a pattern-interrupt hook that forces the viewer to stop scrolling (e.g. "Rule #1 of the top 1%:", "Most people realize this 10 years too late:", "If you are grinding in silence:", "They laughed at your sacrifice:").
- Lines 2 & 3 must deliver a hard-hitting, memorable truth or punchline.
- Maximum 3 lines total. Keep each line between 3 to 7 words. Easy to read in 3 seconds.

Requirements:
1. quoteLines: Exactly 3 punchy lines as an array of strings.
2. title: An intense 2-4 word hook in ALL CAPS (e.g. "STAY DANGEROUS", "SILENT DISCIPLINE", "OUTWORK EVERYONE").
3. captionHook: 1 powerful sentence on ONE single line.
4. hashtags: Exactly 4 to 5 hyper-targeted hashtags (e.g. ["#mindset", "#stoic", "#nightdrive", "#darkaesthetic", "#discipline"]).

Output ONLY valid JSON with no markdown backticks:
{
  "title": "...",
  "quoteLines": ["Hook line", "Truth line", "Punchline"],
  "captionHook": "...",
  "hashtags": ["#mindset", "#stoic", "#nightdrive", "#darkaesthetic"],
  "theme": "${category}"
}`;

  try {
    const aiRes = await callMultiProviderAI('You are a viral Instagram growth director.', prompt);
    if (aiRes && typeof aiRes.text === 'string') {
      const parsed = robustParseAiJson(aiRes.text);
      if (parsed?.quoteLines && Array.isArray(parsed.quoteLines) && parsed.quoteLines.length >= 2) {
        const title = (parsed.title || parsed.quoteLines[0]).toUpperCase();
        const quoteLines = parsed.quoteLines.filter((l: string) => typeof l === 'string' && l.trim().length > 0);
        const hook = parsed.captionHook || 'When you elevate your standards, daily noise can no longer reach you.';
        const hashtags = Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0
          ? parsed.hashtags
          : ['#ukcarscene', '#supercarsoflondon', '#londoncars', '#uknightdrive', '#carcultureuk', '#reelsuk', '#pakwheels', '#pakodrive', ...catConfig.suggestedTags];

        const caption = `${title} ⚡\n\n${hook}\n\nSave this for the days you need a reminder 📌\n\nDrop a "🔥" in the comments if you agree.\n\n${dualCta}\n\n${hashtags.join(' ')}`;

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

  // Curated category fallbacks (3 punchy high-retention lines, zero filler)
  const fallbacks: Record<ReelCategory, { title: string; quoteLines: string[]; caption: string }> = {
    nature: {
      title: 'RULE OF THE TOP 1%',
      quoteLines: ['Rule #1 of the top 1%:', 'Grow in complete silence.', 'Let the results shatter the room.'],
      caption: `RULE OF THE TOP 1% ⚡\n\nThe storm only shakes what is shallow. When your roots are deep, nothing can move you.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you are locked in.\n\n${dualCta}`,
    },
    roads: {
      title: 'MOVE IN SILENCE',
      quoteLines: ['If you are building in silence:', 'Never announce your moves.', 'Let the scoreboard speak for you.'],
      caption: `MOVE IN SILENCE ⚡\n\nMost people tell everyone what they are going to do. The top 1% execute and disappear.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you agree.\n\n${dualCta}`,
    },
    beach: {
      title: 'RELENTLESS WAVES',
      quoteLines: ['Most people realize too late:', 'Intensity starts the journey.', 'Consistency finishes it.'],
      caption: `RELENTLESS WAVES ⚡\n\nThe ocean never rushes, yet it carves mountains. Ruthless daily consistency beats talent every single time.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you are grinding today.\n\n${dualCta}`,
    },
    buildings: {
      title: 'BUILD YOUR EMPIRE',
      quoteLines: ['They laughed at your sacrifice:', 'Now they ask how you did it.', 'Stack every win in silence.'],
      caption: `BUILD YOUR EMPIRE ⚡\n\nNever let small-minded opinions talk you out of an empire. Brick by brick, quietly.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" in the comments.\n\n${dualCta}`,
    },
    sky: {
      title: 'ABOVE THE NOISE',
      quoteLines: ['When you elevate your standards:', 'Daily drama cannot reach you.', 'Stay untouchable at the top.'],
      caption: `ABOVE THE NOISE ⚡\n\nSmall minds create noise. High-level vision creates generational wealth. Fly above it.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you agree.\n\n${dualCta}`,
    },
    rain: {
      title: 'CLARITY IN THE STORM',
      quoteLines: ['Comfort destroys ambition:', 'Storms reveal your true strength.', 'Keep driving while they doubt.'],
      caption: `CLARITY IN THE STORM ⚡\n\nHard seasons reveal who you truly are. Don't wish it was easier, make sure you are stronger.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you are in your grind season.\n\n${dualCta}`,
    },
  };

  const fb = fallbacks[category] || fallbacks.roads;
  return {
    title: fb.title,
    quoteLines: fb.quoteLines,
    caption: fb.caption,
    hashtags: ['#mindset', '#stoic', '#nightdrive', '#darkaesthetic', '#discipline'],
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
  const duration = options?.durationSeconds || 7.5;

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
