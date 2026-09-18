import fs from 'fs';
import path from 'path';

export type ReelCategory = 'nature' | 'roads' | 'beach' | 'buildings' | 'sky' | 'rain';

export interface CategoryMetadata {
  name: string;
  themePrompt: string;
  suggestedTags: string[];
}

export const CATEGORIES_CONFIG: Record<ReelCategory, CategoryMetadata> = {
  nature: {
    name: 'Nature & Solitude',
    themePrompt: 'deep resilience, rooted strength, inner peace amid chaos, silent growth, stoic nature',
    suggestedTags: ['#naturelovers', '#mountains', '#innerpeace', '#stoicism', '#resilience', '#solitude', '#deepthoughts'],
  },
  roads: {
    name: 'Highways & High Speed',
    themePrompt: 'speed, relentless drive, staying in your lane, outworking everyone in silence, automotive adrenaline',
    suggestedTags: ['#nightdrive', '#automotive', '#supercars', '#stayfocused', '#laneclosure', '#speedandstrength'],
  },
  beach: {
    name: 'Ocean & Endless Waves',
    themePrompt: 'relentless consistency (waves never stop), calmness in violent storms, emotional mastery, depth',
    suggestedTags: ['#oceanmindset', '#consistencyiskey', '#unshakable', '#calminthestorm', '#depth', '#mindsetreset'],
  },
  buildings: {
    name: 'Skyscrapers & City Empires',
    themePrompt: 'building generational empires, skyline ambition, high-level vision, wealth mindset, executive discipline',
    suggestedTags: ['#londoncity', '#skylineviews', '#wealthmindset', '#empirebuilder', '#highperformance', '#levelingup'],
  },
  sky: {
    name: 'Clouds & Aviation Perspective',
    themePrompt: 'rising above the noise, bird-eye perspective, flying higher than small drama, boundless vision',
    suggestedTags: ['#aviation', '#aboveclouds', '#perspectiveiseverything', '#flyhigh', '#visionary', '#unstoppable'],
  },
  rain: {
    name: 'Dark Rain & Moody Reflections',
    themePrompt: 'finding clarity in dark times, comfort kills ambition, beautiful pain, unstoppable will in storms',
    suggestedTags: ['#darkaesthetic', '#rainymood', '#comfortzonekills', '#clarity', '#grindseason', '#focusedmind'],
  },
};

const DAY_CATEGORY_MAP: Record<number, ReelCategory> = {
  0: 'rain',       // Sunday
  1: 'nature',     // Monday
  2: 'roads',      // Tuesday
  3: 'beach',      // Wednesday
  4: 'buildings',  // Thursday
  5: 'sky',        // Friday
  6: 'roads',      // Saturday
};

export const CATEGORY_VIDEOS: Record<ReelCategory, string[]> = {
  beach: [
    'public/img/viral-reels/library/beach/calm-ocean-waves.mp4',
    'public/img/viral-reels/library/beach/sunrise-beach-coast.mp4',
    'public/img/viral-reels/library/beach/waves-ocean-moody.mp4',
  ],
  buildings: [
    'public/img/viral-reels/library/buildings/houston-night-skyline.mp4',
    'public/img/viral-reels/library/buildings/manhattan-skyline.mp4',
    'public/img/viral-reels/library/buildings/timelapse-night-cityscape.mp4',
  ],
  nature: [
    'public/img/viral-reels/library/nature/above-misty-forest.mp4',
    'public/img/viral-reels/library/nature/misty-mountains.mp4',
    'public/img/viral-reels/library/nature/waterfall-near-road.mp4',
  ],
  rain: [
    'public/img/viral-reels/library/rain/misty-forest-drive.mp4',
    'public/img/viral-reels/library/rain/storm-city-rain.mp4',
  ],
  roads: [
    'public/img/viral-reels/library/roads/black-suv-road.mp4',
    'public/img/viral-reels/raw/nissan-300zx.mp4',
  ],
  sky: [
    'public/img/viral-reels/library/sky/airplane-window-clouds.mp4',
    'public/img/viral-reels/library/sky/pink-sunset-clouds.mp4',
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
      if (lastUsed.includes(`/${cat}/`)) {
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
 * Works seamlessly on Vercel Serverless (using static verified inventory) and local dev
 */
export function selectUniqueVideoFromCategory(category: ReelCategory): {
  videoPath: string;
  category: ReelCategory;
  config: CategoryMetadata;
} {
  const config = CATEGORIES_CONFIG[category];
  const staticPool = CATEGORY_VIDEOS[category] || CATEGORY_VIDEOS.roads;

  // 1. Try reading local directory if on disk
  const baseDir = path.join('public', 'img', 'viral-reels', 'library', category);
  let files: string[] = [];
  try {
    if (fs.existsSync(baseDir)) {
      files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.mp4')).map(f => `public/img/viral-reels/library/${category}/${f}`);
    }
  } catch {}

  // 2. If on serverless where public/ is hosted on CDN, use verified static library pool
  const candidatePool = files.length > 0 ? files : staticPool;
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
