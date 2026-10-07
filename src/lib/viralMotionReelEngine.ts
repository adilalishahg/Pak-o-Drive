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

  const lineHeight = filteredLines.length >= 4 ? 52 : 58;
  const pillHeight = filteredLines.length >= 4 ? 46 : 50;
  const fontSize = filteredLines.length >= 4 ? 27 : 32;
  const totalTextHeight = filteredLines.length * lineHeight;
  const startY = Math.round((HEIGHT - totalTextHeight) / 2) + 26;

  const lineElements = filteredLines
    .map((line, idx) => {
      const y = startY + idx * lineHeight;
      const clean = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const pillWidth = Math.min(WIDTH - 50, Math.max(200, Math.round(line.length * (filteredLines.length >= 4 ? 17 : 19.5) + 44)));
      const pillX = Math.round(360 - pillWidth / 2);
      const pillY = Math.round(y - (filteredLines.length >= 4 ? 32 : 35));

      const isEmphasis = idx === 0 || (filteredLines.length > 2 && idx === filteredLines.length - 1);
      const textColor = isEmphasis ? '#FDE047' : '#FFFFFF';

      return `
        <g>
          <!-- Dark Contrast Highlight Pill Backdrop -->
          <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="12" 
            fill="#050811" 
            fill-opacity="0.94" 
            stroke="rgba(255, 255, 255, 0.32)" 
            stroke-width="1.4" />
          <!-- High Contrast Bold Text -->
          <text x="360" y="${y}" 
            font-family="'Inter', Arial, sans-serif" 
            font-size="${fontSize}" 
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
      <!-- 50% Cinematic Dimmed Dark Overlay for 100% Mobile Text Readability -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000" fill-opacity="0.48" />
      ${lineElements}
      <!-- Persistent Bottom Comment Trigger Badge -->
      <g>
        <rect x="150" y="1020" width="420" height="48" rx="24" 
          fill="#050811" 
          fill-opacity="0.96" 
          stroke="#FDE047" 
          stroke-width="2" />
        <text x="360" y="1052" 
          font-family="'Inter', Arial, sans-serif" 
          font-size="20" 
          font-weight="800" 
          fill="#FDE047" 
          text-anchor="middle"
          letter-spacing="0.2">💬 Comment &quot;TOOLS&quot; for links 👇</text>
      </g>
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
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,boxblur=luma_radius=8:luma_power=1,eq=brightness=-0.14:contrast=1.22:saturation=1.0,setsar=1[bg];
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
  workspace: 'public/audio/proven-viral-track-1-260likes.mp3',
  luxury: 'public/audio/proven-viral-track-2-176likes.mp3',
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

  const prompt = `You are the viral creative director behind @digitalinspirer (rebuilding to 10K+ followers in the Digital Products, Faceless Creator, and AI Productivity niche).

YOUR GOAL: Generate a high-retention, high-save 3-line Instagram Reel overlay and an actionable value caption that triggers saves, shares, and ManyChat comment leads.

STRICT ALGORITHM RULES:
- NEVER use sensitive flagged words: "illegal", "cheat", "hack", "loophole", or "glitch" (these restrict Explore distribution in 2026).
- Hook Rule (Line 1): ALWAYS use first-person authority + explicit Save trigger (e.g., "3 AI Tools I use to make 30 Reels in 1 hour (Save this) 🚨", "3 AI Tools I use to save 15+ hours a week (Save this) 📌", "3 Digital Products I recommend to escape the 9-5 (Save this) 💸").
- Value Body (Line 2 & 3): Short outcome-driven syntax (e.g., "Opus Clip: Long video ➡️ 10 viral clips auto", "Gamma App: 1 prompt ➡️ 10-slide deck in 30s", "Stan Store: Launch free digital store in 5m").
- Caption Rule: Line 1 MUST be the comment trigger before the fold:
  'Comment "TOOLS" below and I\\'ll DM you all 3 links instantly! 📩👇'
- Hashtags: High-reach relevant tags: #aitools #contentcreator #artificialintelligence #productivity #digitaltools #reelsgrowth #facelessmarketing.

Requirements:
1. quoteLines: Exactly 4 punchy lines:
   - Line 0: First-person hook with (Save this) + emoji (max 38 chars)
   - Line 1: 1. Tool #1: Input ➡️ Outcome (max 38 chars)
   - Line 2: 2. Tool #2: Input ➡️ Outcome (max 38 chars)
   - Line 3: 3. Tool #3: Input ➡️ Outcome (max 38 chars)
2. title: An intense 2-4 word title in ALL CAPS (e.g. "AI TOOLS I USE", "PRODUCTIVITY STACK", "FACELESS WORKFLOW").
3. captionHook: 1 powerful hook sentence.
4. caption: Formatted caption starting IMMEDIATELY with the comment trigger line:
   "Comment \\"TOOLS\\" below and I\\'ll DM you all 3 links instantly! 📩👇\\n\\nHere are the 3 tools I use daily to save 15+ hours every week:\\n\\n1️⃣ [Tool 1 Name] — [Direct Benefit]\\n2️⃣ [Tool 2 Name] — [Direct Benefit]\\n3️⃣ [Tool 3 Name] — [Direct Benefit]\\n\\nSave this reel for later 📌\\nFollow 👉 @digitalinspirer for daily AI & digital income blueprints 📈\\n\\n#aitools #contentcreator #artificialintelligence #productivity #digitaltools #reelsgrowth"
5. hashtags: ["#aitools", "#contentcreator", "#artificialintelligence", "#productivity", "#digitaltools", "#reelsgrowth"]

Output ONLY valid JSON with no markdown backticks:
{
  "title": "...",
  "quoteLines": ["Hook line", "1. Tool 1 outcome", "2. Tool 2 outcome", "3. Tool 3 outcome"],
  "captionHook": "...",
  "caption": "Full formatted caption starting with Comment TOOLS",
  "hashtags": ["#aitools", "#contentcreator", "#artificialintelligence", "#productivity", "#digitaltools", "#reelsgrowth"],
  "theme": "${category}"
}`;

  try {
    const aiRes = await callMultiProviderAI('You are a viral Instagram growth director.', prompt);
    if (aiRes && typeof aiRes.text === 'string') {
      const parsed = robustParseAiJson(aiRes.text);
      if (parsed?.quoteLines && Array.isArray(parsed.quoteLines) && parsed.quoteLines.length >= 3) {
        const title = (parsed.title || parsed.quoteLines[0]).toUpperCase();
        const quoteLines = parsed.quoteLines.filter((l: string) => typeof l === 'string' && l.trim().length > 0);
        const hashtags = parsed.hashtags || ['#aitools', '#contentcreator', '#artificialintelligence', '#productivity', '#digitaltools', '#reelsgrowth'];

        let caption = parsed.caption;
        if (!caption || caption.length < 50) {
          caption = `Comment "TOOLS" below and I'll DM you all 3 links instantly! 📩👇\n\nHere are the 3 tools I use to save 15+ hours every week:\n\n1️⃣ ${quoteLines[1]}\n2️⃣ ${quoteLines[2] || 'Gamma App: 1 prompt ➡️ 10-slide deck in 30s'}\n3️⃣ ${quoteLines[3] || 'CapCut AI: Script ➡️ Captions + B-roll in 1 click'}\n\nSave this reel for later 📌\nFollow 👉 @digitalinspirer for daily AI & digital income blueprints.\n\n${hashtags.join(' ')}`;
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

  // Proven high-converting deck with strict algorithm safety & high-trust hooks (All 3 tools numbered on-screen)
  const PROVEN_WINNING_DECK = [
    {
      title: 'AI TOOLS I USE',
      quoteLines: [
        '3 AI Tools I use to make 30 Reels in 1h 🚨',
        '1. Opus Clip: Long video ➡️ 10 clips auto',
        '2. Gamma App: 1 prompt ➡️ 10-slide deck',
        '3. CapCut AI: Script ➡️ Captions in 1 click',
      ],
      caption: `Comment "TOOLS" below and I'll DM you all 3 links instantly! 📩👇\n\nHere are the 3 tools I use to save 15+ hours every week:\n\n1️⃣ Opus Clip — Turns 1 long video into 10 viral clips with animated captions on autopilot.\n2️⃣ Gamma App — Generates full presentations, pitch decks, and web pages from 1 single prompt in 30 seconds.\n3️⃣ CapCut AI — Transforms text scripts into auto-captioned reels with dynamic B-roll.\n\nSave this reel for later 📌\nFollow 👉 @digitalinspirer for daily AI & digital income blueprints 📈\n\n#aitools #contentcreator #artificialintelligence #productivity #digitaltools #reelsgrowth #facelessmarketing`,
    },
    {
      title: 'PRODUCTIVITY STACK',
      quoteLines: [
        '3 Free AI Websites I use daily (Save this) 📌',
        '1. ChatGPT: Instant content & scripts',
        '2. Leonardo AI: Free Midjourney alternative',
        '3. Gamma App: 1 prompt ➡️ 10-slide deck',
      ],
      caption: `Comment "TOOLS" below and I'll DM you all 3 links instantly! 📩👇\n\nStop wasting hours doing manual tasks. Here is my daily workflow stack:\n\n1️⃣ ChatGPT — Brainstorms unlimited hooks, outlines, and video scripts in seconds.\n2️⃣ Leonardo AI — The best free alternative to Midjourney for generating photorealistic visuals.\n3️⃣ Gamma App — Generates stunning presentation slides and websites in 30 seconds.\n\nSave this reel for later 📌\nFollow 👉 @digitalinspirer for daily AI tools and shortcuts ⚡\n\n#aitools #chatgpt #leonardoai #productivity #artificialintelligence #contentcreator #digitaltools #freewebsites #growthmindset`,
    },
    {
      title: 'CANVA INCOME SITES',
      quoteLines: [
        '3 Sites that pay for your Canva designs 💸',
        '1. Etsy: Sell digital planners & templates',
        '2. Creative Fabrica: Font & craft bundles',
        '3. Stan Store: Sell 1-page templates free',
      ],
      caption: `Comment "CANVA" below and I'll DM you the free Canva Monetization Blueprint! 📩👇\n\nYou don't need inventory or client calls to make money online. Here are 3 platforms where you can sell Canva templates:\n\n1️⃣ Etsy — Massive built-in search traffic for wedding invites, budget trackers, and social media templates.\n2️⃣ Creative Fabrica — Upload digital graphics, SVG bundles, and printable crafts for passive royalties.\n3️⃣ Stan Store — The highest converting bio-link store to sell digital products with 0% transaction friction.\n\nSave this reel for later 📌\nFollow 👉 @digitalinspirer for daily digital income blueprints 📈\n\n#canvatemplates #digitalproducts #sidehustle #onlineincome #makemoneyonline #passiveincome #canvadesign #creativefabrica #etsyseller`,
    },
    {
      title: 'DIGITAL ASSETS',
      quoteLines: [
        '3 Digital Products I recommend for 2026 💸',
        '1. Notion Planners: $15 each on autopilot',
        '2. Canva Templates: Build once, sell 24/7',
        '3. Prompt Packs: Zero inventory or shipping',
      ],
      caption: `Comment "START" below and I'll send you the free 7-Day Digital Product Starter Kit! 📩👇\n\nStop trading 40 hours a week for a fixed paycheck. Digital products have 95%+ profit margins:\n\n1️⃣ Notion Productivity Planners ($10–$25)\n2️⃣ Canva Social Media Templates ($15–$30)\n3️⃣ ChatGPT Prompt Packs for Creators ($9–$19)\n\nYou build them once, and they deliver automatically.\n\nSave this reel for later 📌\nFollow 👉 @digitalinspirer for daily digital income blueprints 🚀\n\n#digitalproducts #facelessmarketing #sidehustle #onlineincome #canvatemplates #notiontemplates #makemoneyonline #digitalwealth`,
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

  const localDefaultFallback = path.resolve('public/viral-preview-buildings.mp4');
  if (fs.existsSync(localDefaultFallback)) {
    console.log(`🎬 [ViralMotionReel] Using verified local video fallback: ${path.basename(localDefaultFallback)}`);
    return localDefaultFallback;
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
  let title = 'Digital Products & AI Growth';
  let caption = '';
  let hashtags: string[] = [];

  if (!quoteLines || quoteLines.length === 0) {
    const aiContent = await generateViralAiContent(category);
    quoteLines = aiContent.quoteLines;
    title = aiContent.title;
    caption = aiContent.caption;
    hashtags = aiContent.hashtags;
  } else {
    title = quoteLines.filter(Boolean)[0] || 'Digital Products & AI Growth';
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
  const lineHeight = filteredLines.length >= 4 ? 52 : 58;
  const pillHeight = filteredLines.length >= 4 ? 46 : 50;
  const fontSize = filteredLines.length >= 4 ? 27 : 32;
  const totalTextHeight = filteredLines.length * lineHeight;
  const startY = Math.round((HEIGHT - totalTextHeight) / 2) + 26;

  const lineElements = filteredLines
    .map((line, idx) => {
      const y = startY + idx * lineHeight;
      const clean = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const pillWidth = Math.min(WIDTH - 50, Math.max(200, Math.round(line.length * (filteredLines.length >= 4 ? 17 : 19.5) + 44)));
      const pillX = Math.round(360 - pillWidth / 2);
      const pillY = Math.round(y - (filteredLines.length >= 4 ? 32 : 35));

      const isEmphasis = idx === 0 || (filteredLines.length > 2 && idx === filteredLines.length - 1);
      const textColor = isEmphasis ? '#FDE047' : '#FFFFFF';

      return `
        <g>
          <!-- Dark Contrast Highlight Pill Backdrop -->
          <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="12" 
            fill="#050811" 
            fill-opacity="0.94" 
            stroke="rgba(255, 255, 255, 0.32)" 
            stroke-width="1.4" />
          <!-- High Contrast Bold Text -->
          <text x="360" y="${y}" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="${fontSize}" 
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
      <!-- 50% Cinematic Dimmed Dark Overlay for 100% Mobile Text Readability -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000" fill-opacity="0.48" />
      ${lineElements}
      <!-- Persistent Bottom Comment Trigger Badge -->
      <g>
        <rect x="150" y="1020" width="420" height="48" rx="24" 
          fill="#050811" 
          fill-opacity="0.96" 
          stroke="#FDE047" 
          stroke-width="2" />
        <text x="360" y="1052" 
          font-family="'Inter', -apple-system, sans-serif" 
          font-size="20" 
          font-weight="800" 
          fill="#FDE047" 
          text-anchor="middle"
          letter-spacing="0.2">💬 Comment &quot;TOOLS&quot; for links 👇</text>
      </g>
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
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,boxblur=luma_radius=8:luma_power=1,eq=brightness=-0.14:contrast=1.22:saturation=1.0,setsar=1[bg];
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
