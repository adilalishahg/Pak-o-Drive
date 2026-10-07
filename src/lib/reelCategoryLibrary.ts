import fs from 'fs';
import path from 'path';

export type ReelCategory = 'workspace' | 'luxury' | 'buildings' | 'roads' | 'sky' | 'nature' | 'beach' | 'rain';

export interface CategoryMetadata {
  name: string;
  themePrompt: string;
  suggestedTags: string[];
}

export const CATEGORIES_CONFIG: Record<ReelCategory, CategoryMetadata> = {
  workspace: {
    name: 'Modern Tech & Creator Workspace',
    themePrompt: 'Minimalist desk setup, MacBook workflow, coffee cup, sleek dark ambient desk lights, typing on keyboard, high-focus remote builder lifestyle',
    suggestedTags: ['#digitalproducts', '#workspace', '#remotework', '#sidehustle', '#buildinpublic', '#canvatemplates'],
  },
  luxury: {
    name: 'Luxury Penthouse & High-Income Lifestyle',
    themePrompt: 'High-rise glass office, luxury city view, financial freedom, late night founder focus, minimalist modern aesthetic',
    suggestedTags: ['#financialfreedom', '#digitalwealth', '#passiveincome', '#onlinebusiness', '#growthmindset', '#solopreneur'],
  },
  buildings: {
    name: 'Metropolis Skyline & Ambient Glow',
    themePrompt: 'Tokyo/Manhattan night skyline, neon highway reflections, cyber modern cityscape, high status executive aesthetic',
    suggestedTags: ['#aitools', '#techstack', '#digitalnomad', '#creatorlife', '#makemoneyonline'],
  },
  roads: {
    name: 'Late Night High-Speed Cruising',
    themePrompt: 'Clean cockpit night drive, focused perspective, smooth highway lights, intentional execution and momentum',
    suggestedTags: ['#nightdrive', '#focusmode', '#escapethe9to5', '#entrepreneur', '#momentum'],
  },
  sky: {
    name: 'Golden Hour & Horizon Focus',
    themePrompt: 'Golden hour city flight, airplane wing over clouds, broad perspective, timeless wealth building',
    suggestedTags: ['#timelesswealth', '#digitalproducts', '#onlineincome', '#freedomlifestyle'],
  },
  nature: {
    name: 'Scenic Moody Mountains & Focus',
    themePrompt: 'Peaceful misty valley, evergreen pines, calm unhurried determination, mental clarity for high-output creators',
    suggestedTags: ['#clarity', '#deepwork', '#creatorjourney', '#mindsetshift'],
  },
  beach: {
    name: 'Ocean Waves & Remote Freedom',
    themePrompt: 'Pacific ocean calm waves, sunset coastline, true location freedom, working from anywhere in the world',
    suggestedTags: ['#locationfreedom', '#digitalnomad', '#laptoplifestyle', '#passiveincome'],
  },
  rain: {
    name: 'Moody Rain & Quiet Execution',
    themePrompt: 'Rain streaks on dark glass, ambient city lights, cozy deep work session, building silent assets',
    suggestedTags: ['#deepwork', '#buildinpublic', '#focused', '#digitalcreator'],
  },
};

const DAY_CATEGORY_MAP: Record<number, ReelCategory> = {
  0: 'luxury',     // Sunday
  1: 'workspace',  // Monday
  2: 'buildings',  // Tuesday
  3: 'workspace',  // Wednesday
  4: 'luxury',     // Thursday
  5: 'roads',      // Friday
  6: 'workspace',  // Saturday
};

export const CATEGORY_VIDEOS: Record<ReelCategory, string[]> = {
  workspace: [
    'https://cdn.coverr.co/videos/coverr-manhattan-skyline-7479/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-houston-texas-at-night-4130/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-temp-zna6gen-3-alpha-2777358279-a-dynamic-time-lapse-mp4-5453/1080p.mp4',
  ],
  luxury: [
    'https://cdn.coverr.co/videos/coverr-modern-apartment-living-room-with-city-view-9122/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-manhattan-skyline-7479/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-temp-zna6gen-3-alpha-2777358279-a-dynamic-time-lapse-mp4-5453/1080p.mp4',
  ],
  buildings: [
    'https://cdn.coverr.co/videos/coverr-houston-texas-at-night-4130/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-manhattan-skyline-7479/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-temp-zna6gen-3-alpha-2777358279-a-dynamic-time-lapse-mp4-5453/1080p.mp4',
  ],
  beach: [
    'https://cdn.coverr.co/videos/coverr-calm-waves-in-an-ocean-gulf-4513/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-waves-in-the-ocean-9488/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-sunrise-on-the-beach-9704/1080p.mp4',
  ],
  nature: [
    'https://cdn.coverr.co/videos/coverr-above-a-misty-forest-518/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-misty-mountains-in-sao-vicente-portugal-3617/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-waterfall-near-a-road-6235/1080p.mp4',
  ],
  rain: [
    'https://cdn.coverr.co/videos/coverr-woman-driving-through-a-misty-forest-7158/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-storm-in-vilnius-lithuania-5273/1080p.mp4',
  ],
  roads: [
    'https://cdn.coverr.co/videos/coverr-black-suv-on-the-road-4297/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-woman-driving-through-a-misty-forest-7158/1080p.mp4',
  ],
  sky: [
    'https://cdn.coverr.co/videos/coverr-view-of-a-city-from-plane-window-6971/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-pink-sunset-timelapse-4178/1080p.mp4',
  ],
};

import os from 'os';

function getHistoryFilePath(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.platform === 'linux');
  if (isServerless) {
    return path.join(os.tmpdir(), 'viral_video_usage_history.json');
  }
  return path.join('public', 'img', 'viral-reels', 'library', 'usage-history.json');
}

function getUsageHistory(): string[] {
  try {
    const file = getHistoryFilePath();
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch {}
  return [];
}

function recordUsage(videoRelativePath: string) {
  try {
    const file = getHistoryFilePath();
    const history = getUsageHistory();
    history.push(videoRelativePath);
    // Keep last 60 entries
    const trimmed = history.slice(-60);
    fs.writeFileSync(file, JSON.stringify(trimmed, null, 2));
  } catch (err: any) {
    console.warn('⚠️ Failed to save video usage history:', err.message);
  }
}

/**
 * Returns today's active category or rotates dynamically on consecutive manual triggers
 */
export function getActiveReelCategory(customCategory?: string): ReelCategory {
  if (customCategory && customCategory in CATEGORIES_CONFIG) {
    return customCategory as ReelCategory;
  }

  const allCategories: ReelCategory[] = ['roads', 'sky', 'buildings', 'rain', 'nature', 'beach'];
  const history = getUsageHistory();
  const lastUsed = history[history.length - 1];

  let lastCategory: ReelCategory | null = null;
  if (lastUsed) {
    for (const cat of allCategories) {
      const pool = CATEGORY_VIDEOS[cat] || [];
      if (lastUsed.includes(`/${cat}/`) || pool.includes(lastUsed)) {
        lastCategory = cat;
        break;
      }
    }
  }

  const day = new Date().getDay();
  const scheduledToday = DAY_CATEGORY_MAP[day] || 'roads';

  // If today's category was literally just used in the last run (consecutive manual test/cron), rotate to keep reels fresh!
  if (lastCategory === scheduledToday) {
    const nextCategories = allCategories.filter((c) => c !== lastCategory);
    return nextCategories[Math.floor(Math.random() * nextCategories.length)];
  }

  return scheduledToday;
}

/**
 * Selects an unrepeated video from the given category library
 * Works seamlessly on Vercel Serverless (using static verified CDN inventory) and local dev
 */
export function selectUniqueVideoFromCategory(category: ReelCategory): {
  videoPath: string;
  category: ReelCategory;
  config: CategoryMetadata;
} {
  const config = CATEGORIES_CONFIG[category];
  const staticPool = CATEGORY_VIDEOS[category] || CATEGORY_VIDEOS.roads;

  // 1. Try reading local directory if on disk (local development override)
  const baseDir = path.join('public', 'img', 'viral-reels', 'library', category);
  let files: string[] = [];
  try {
    if (fs.existsSync(baseDir)) {
      files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.mp4')).map(f => `public/img/viral-reels/library/${category}/${f}`);
    }
  } catch {}

  // 2. Prioritize staticPool (high-speed CDN/Cloudinary) so Vercel deployment remains super light
  const candidatePool = staticPool && staticPool.length > 0 ? staticPool : (files.length > 0 ? files : ['https://cdn.coverr.co/videos/coverr-black-suv-on-the-road-4297/1080p.mp4']);
  const history = getUsageHistory();

  // Find videos not used recently
  const unUsedFiles = candidatePool.filter((f) => !history.includes(f));
  const chosenVideo =
    unUsedFiles.length > 0
      ? unUsedFiles[Math.floor(Math.random() * unUsedFiles.length)]
      : candidatePool[Math.floor(Math.random() * candidatePool.length)];

  recordUsage(chosenVideo);

  return {
    videoPath: chosenVideo,
    category,
    config,
  };
}
