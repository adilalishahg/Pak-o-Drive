import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';
import { callMultiProviderAI } from './multiAiEngine';
import {
  getActiveReelCategory,
  selectUniqueVideoFromCategory,
  ReelCategory,
  CATEGORIES_CONFIG,
} from './reelCategoryLibrary';

// Direct path to ffmpeg
function getFfmpegPath(): string {
  try {
    const ffmpegInstaller = eval('require')('@ffmpeg-installer/ffmpeg');
    return ffmpegInstaller.path || 'ffmpeg';
  } catch {
    return 'ffmpeg';
  }
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
}

/**
 * Available audio tracks pool for dynamic daily music rotation
 */
export const AUDIO_TRACKS_POOL = [
  'public/audio/aesthetic-lofi-trending.mp3',
  'public/audio/aesthetic-lofi-282.mp3',
  'public/audio/dark-ambient-135.mp3',
  'public/audio/ambient-atmospheric-track.mp3',
];

/**
 * Dynamically generates viral quotes, hooks, captions, and hashtags via multi-provider AI matching the active category
 */
export async function generateViralAiContent(selectedCategory?: ReelCategory): Promise<ViralAiReelPackage> {
  const category = selectedCategory || getActiveReelCategory();
  const catConfig = CATEGORIES_CONFIG[category];

  const prompt = `You are the creative mastermind behind viral dark aesthetic automotive & mindset Instagram Reels for Pak-o-Drive (e.g. @digitalinspirer, @pakodrive.official, @pakwheels).
Generate 1 completely fresh, high-retention on-screen quote and viral caption designed to captivate car enthusiasts and convert them into customers for Pak-o-Drive (Pakistan's premium car accessories & styling store with Cash on Delivery).

Visual Background Theme for this Reel: "${catConfig.name}"
Category Tone & Concepts: ${catConfig.themePrompt}
Category Suggested Tags: ${catConfig.suggestedTags.join(', ')}

Requirements:
1. quoteLines: 3 to 4 short, punchy lines designed for vertical 9:16 text overlay (under 6 words per line). Must match the visual mood of ${catConfig.name} (e.g. stoic, ambitious, impossible mindset, consistency, or quiet discipline) in pure British/American English.
2. title: An intense 2-4 word hook title in ALL CAPS (e.g. "MOVE IN SILENCE", "THE UNSEEN GRIND", "ABOVE THE NOISE").
3. caption: A viral conversion caption structure:
   - First line: Thumb-stopping hook in ALL CAPS with lightning emoji.
   - 2-3 lines of deep, inspiring wisdom connecting the visual (${catConfig.name}) with ambition.
   - Save trigger: "Save this for the days you need a reminder 📌"
   - Comment question: "Drop a '🔥' in the comments if you agree."
   - Dual Monetization Call to Action (UK/Global Digital & Affiliate + Pakistan COD):
     "🇬🇧 UK & Global (Digital & Affiliate):\n✨ 4K Luxury Car Wallpapers & Presets 👉 Link in Bio\n🛒 Trending Car Interior Styling on Amazon UK 👉 Link in Bio\n\n🇵🇰 Pakistan (Physical Stock):\n🚗 Cash on Delivery (COD) All Over Pakistan\n📦 Tap Link in Bio or WhatsApp: +92 318 5205667"
   - Profile follow tag: "Follow @digitalinspirer & @pakodrive.official for daily drive & automotive luxury."
   - Geo-tag line: "📍 London, United Kingdom"
4. hashtags: 15-20 trending UK & global automotive tags combined with Pakistan (#ukcarscene, #supercarsoflondon, #londoncars, #uknightdrive, #birminghamcars, #carcultureuk, #supercarsuk, #reelsuk, #pakwheels, #pakodrive, #darkaesthetic, #nightdrive, #reelsviral, plus category tags like ${catConfig.suggestedTags.slice(0, 3).join(', ')}).

Output ONLY valid JSON with no markdown backticks:
{
  "title": "...",
  "quoteLines": ["...", "...", "..."],
  "caption": "...",
  "hashtags": ["#ukcarscene", "#londoncars", "..."],
  "theme": "${category}"
}`;

  try {
    const aiRes = await callMultiProviderAI('You are a viral Instagram growth director.', prompt);
    if (aiRes && typeof aiRes.text === 'string') {
      const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
      const cleaned = jsonMatch ? jsonMatch[0] : aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.quoteLines && Array.isArray(parsed.quoteLines) && parsed.quoteLines.length > 0) {
        return {
          title: parsed.title || parsed.quoteLines[0],
          quoteLines: parsed.quoteLines,
          caption: parsed.caption || `${parsed.title} ⚡\n\nSave this for when you need a reminder 📌\n\n#ukcarscene #londoncars #mindsetquotes #viralreels`,
          hashtags: parsed.hashtags || ['#ukcarscene', '#supercarsoflondon', '#londoncars', '#uknightdrive', '#carcultureuk', '#reelsuk', '#pakwheels', '#pakodrive', ...catConfig.suggestedTags],
          theme: category,
          category,
        };
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [ViralMotionReel] AI generation fallback: ${err.message}`);
  }

  // Dual Monetization CTA snippet
  const dualCta = `━━━━━━━━━━━━━━━━━\n🇬🇧 UK & Global (Digital & Affiliate):\n✨ 4K Luxury Car Wallpapers & Presets 👉 Link in Bio\n🛒 Trending Car Interior Styling on Amazon UK 👉 Link in Bio\n\n🇵🇰 Pakistan (Physical Stock):\n🚗 Cash on Delivery (COD) All Over Pakistan\n📦 Tap Link in Bio or WhatsApp: +92 318 5205667\n\n━━━━━━━━━━━━━━━━━\nFollow @digitalinspirer & @pakodrive.official for daily drive & automotive luxury.\n\n📍 London, United Kingdom`;

  // Curated category fallbacks
  const fallbacks: Record<ReelCategory, { title: string; quoteLines: string[]; caption: string }> = {
    nature: {
      title: 'BE UNTOUCHED',
      quoteLines: ['Rooted like mountains.', 'Untouched by storms.', '', 'Grow in silence.'],
      caption: `BE UNTOUCHED ⚡\n\nThe storm only affects what is shallow. When your roots are deep, turbulence cannot move you.\n\nSave this for the days you need a reminder 📌\n\nDrop a "🔥" if you agree.\n\n${dualCta}`,
    },
    roads: {
      title: 'MOVE IN SILENCE',
      quoteLines: ['Speed means nothing', 'if you are in the wrong lane.', '', 'Focus on direction.', 'Let results speak.'],
      caption: `MOVE IN SILENCE ⚡\n\nMost people tell everyone what they are going to do.\nThe top 1% just execute and let the scoreboard do the talking.\n\nSave this for the days you need a reminder 📌\n\nDrop a "🔥" if you agree.\n\n${dualCta}`,
    },
    beach: {
      title: 'RELENTLESS WAVES',
      quoteLines: ['The ocean never rushes,', 'yet it carves continents.', '', 'Relentless consistency.'],
      caption: `RELENTLESS WAVES ⚡\n\nPatience and consistency outperform intensity every single time. Keep showing up every day.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" in the comments.\n\n${dualCta}`,
    },
    buildings: {
      title: 'BUILD YOUR EMPIRE',
      quoteLines: ['From the ground, they see limits.', 'From the summit, you see empires.', '', 'Keep building.'],
      caption: `BUILD YOUR EMPIRE ⚡\n\nDon't let people with small visions talk you out of your big dreams. Keep building block by block.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you agree.\n\n${dualCta}`,
    },
    sky: {
      title: 'ABOVE THE NOISE',
      quoteLines: ['Fly above the storm.', 'The turbulence below', 'is temporary.', '', 'Stay high.'],
      caption: `ABOVE THE NOISE ⚡\n\nWhen you elevate your standards, small minds and daily drama can no longer reach you.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" in the comments.\n\n${dualCta}`,
    },
    rain: {
      title: 'CLARITY IN THE STORM',
      quoteLines: ['Comfort kills ambition.', 'Find your clarity', 'in the storm.', '', 'Keep moving.'],
      caption: `CLARITY IN THE STORM ⚡\n\nHard times reveal who you really are. Embrace the pressure; that's where diamonds are formed.\n\nSave this for when you need a reminder 📌\n\nDrop a "🔥" if you agree.\n\n${dualCta}`,
    },
  };

  const fb = fallbacks[category] || fallbacks.roads;
  return {
    title: fb.title,
    quoteLines: fb.quoteLines,
    caption: fb.caption,
    hashtags: ['#ukcarscene', '#supercarsoflondon', '#londoncars', '#uknightdrive', '#birminghamcars', '#carcultureuk', '#supercarsuk', '#reelsuk', '#pakwheels', '#pakodrive', '#darkaesthetic', '#nightdrive', ...catConfig.suggestedTags],
    theme: category,
    category,
  };
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
  if (!sourceVideo || !fs.existsSync(sourceVideo)) {
    const selected = selectUniqueVideoFromCategory(category);
    sourceVideo = selected.videoPath;
    console.log(`🎥 [ViralMotionReel] Selected unique video from ${category}: ${sourceVideo}`);
  }

  if (!fs.existsSync(sourceVideo)) {
    sourceVideo = 'public/img/viral-reels/raw/nissan-300zx.mp4';
  }

  // Dynamic Audio Selection from Pool (Rotated)
  const validAudio = AUDIO_TRACKS_POOL.filter(a => fs.existsSync(a));
  let audioFile = options?.audioFile;
  if (!audioFile || !fs.existsSync(audioFile)) {
    audioFile = validAudio.length > 0 
      ? validAudio[Math.floor(Math.random() * validAudio.length)] 
      : 'public/audio/aesthetic-lofi-trending.mp3';
  }

  // Load font base64 for crisp serverless rendering
  let fontBase64 = '';
  const fontPath = path.resolve(process.cwd(), 'src/lib/fonts/Inter-Bold.ttf');
  if (fs.existsSync(fontPath)) {
    fontBase64 = fs.readFileSync(fontPath).toString('base64');
  }

  // Generate SVG overlay
  const filteredLines = quoteLines.filter(l => l.trim().length > 0);
  const totalTextHeight = filteredLines.length * 48;
  const startY = Math.round((HEIGHT - totalTextHeight) / 2) + 20;

  const lineElements = filteredLines
    .map((line, idx) => {
      const y = startY + idx * 48;
      return `
        <text x="360" y="${y}" 
          font-family="'Inter', -apple-system, sans-serif" 
          font-size="34" 
          font-weight="700" 
          fill="#FFFFFF" 
          stroke="#000000" 
          stroke-width="3.2" 
          paint-order="stroke fill"
          text-anchor="middle"
          letter-spacing="-0.5">${line}</text>
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
      ${lineElements}
    </svg>
  `;

  const tempDir = path.resolve(process.cwd(), 'public/img/viral-reels/temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const overlayPath = path.join(tempDir, `overlay_${Date.now()}.png`);
  await sharp(Buffer.from(overlaySvg)).png().toFile(overlayPath);

  const outputPath = options?.outputFilePath || path.join(tempDir, `viral_reel_${Date.now()}.mp4`);
  const ffmpegBin = getFfmpegPath();

  console.log(`🎬 [ViralMotionReel] Rendering: [${category}] ${path.basename(sourceVideo)} + ${path.basename(audioFile)} -> ${path.basename(outputPath)}`);

  const filterComplex = `
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,eq=brightness=-0.08:contrast=1.15:saturation=1.1,setsar=1[bg];
    [bg][1:v]overlay=0:0[v]
  `.replace(/\s+/g, ' ').trim();

  const cmd = `"${ffmpegBin}" -y -stream_loop -1 -i "${sourceVideo}" -i "${overlayPath}" -i "${audioFile}" -filter_complex "${filterComplex}" -map "[v]" -map 2:a -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -t ${duration} "${outputPath}"`;

  execSync(cmd, { stdio: 'ignore' });

  // Clean up temporary overlay
  try {
    if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath);
  } catch {}

  return {
    success: true,
    videoPath: outputPath,
    durationSeconds: duration,
    quoteLines,
    title,
    caption,
    hashtags,
    category,
  };
}
