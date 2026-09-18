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

import os from 'os';

function getHistoryFilePath(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.platform === 'linux');
  if (isServerless) {
    return path.join(os.tmpdir(), 'viral_video_usage_history.json');
  }
  return path.resolve(process.cwd(), 'public/img/viral-reels/library/usage-history.json');
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
 * Returns today's active category or selects one dynamically
 */
export function getActiveReelCategory(customCategory?: string): ReelCategory {
  if (customCategory && customCategory in CATEGORIES_CONFIG) {
    return customCategory as ReelCategory;
  }
  const day = new Date().getDay();
  return DAY_CATEGORY_MAP[day] || 'roads';
}

/**
 * Selects an unrepeated video from the given category library
 */
export function selectUniqueVideoFromCategory(category: ReelCategory): {
  videoPath: string;
  category: ReelCategory;
  config: CategoryMetadata;
} {
  const baseDir = path.resolve(process.cwd(), `public/img/viral-reels/library/${category}`);
  const config = CATEGORIES_CONFIG[category];

  let files: string[] = [];
  try {
    if (fs.existsSync(baseDir)) {
      files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.mp4'));
    }
  } catch (err: any) {
    console.warn(`⚠️ [ReelCategoryLibrary] Cannot read category dir ${category}:`, err.message);
  }

  // Fallback: If category directory does not exist or has no videos, pick from raw pool or default asset
  if (files.length === 0) {
    const rawDir = path.resolve(process.cwd(), 'public/img/viral-reels/raw');
    try {
      if (fs.existsSync(rawDir)) {
        const rawFiles = fs.readdirSync(rawDir).filter((f) => f.endsWith('.mp4'));
        if (rawFiles.length > 0) {
          const chosen = rawFiles[Math.floor(Math.random() * rawFiles.length)];
          return {
            videoPath: `public/img/viral-reels/raw/${chosen}`,
            category,
            config,
          };
        }
      }
    } catch {}

    return {
      videoPath: 'public/img/viral-reels/raw/nissan-300zx.mp4',
      category,
      config,
    };
  }

  const history = getUsageHistory();

  // Find files not used recently
  const unUsedFiles = files.filter((f) => !history.includes(`${category}/${f}`));
  const chosenFile =
    unUsedFiles.length > 0
      ? unUsedFiles[Math.floor(Math.random() * unUsedFiles.length)]
      : files[Math.floor(Math.random() * files.length)];

  const relativePath = `public/img/viral-reels/library/${category}/${chosenFile}`;
  recordUsage(`${category}/${chosenFile}`);

  return {
    videoPath: relativePath,
    category,
    config,
  };
}
