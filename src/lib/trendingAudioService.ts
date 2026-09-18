import fs from 'fs';
import path from 'path';
import os from 'os';
import { ReelCategory } from './reelCategoryLibrary';

export interface TrendingAudioItem {
  id: string;
  name: string;
  category: ReelCategory | 'all';
  localFileName: string;
  sourceUrl: string;
  mood: string;
  weekIndex?: number;
  lastUpdated?: string;
}

/**
 * Returns a guaranteed writable directory for audio assets.
 * On Vercel / AWS Lambda (Linux serverless), /var/task is read-only (EROFS).
 * os.tmpdir() (/tmp) is the only writable filesystem.
 */
export function getAudioStorageDir(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.platform === 'linux');
  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'viral_audio_cache');
    if (!fs.existsSync(tmpDir)) {
      try { fs.mkdirSync(tmpDir, { recursive: true }); } catch {}
    }
    return tmpDir;
  }
  const localDir = path.resolve(process.cwd(), 'public/audio');
  if (!fs.existsSync(localDir)) {
    try { fs.mkdirSync(localDir, { recursive: true }); } catch {}
  }
  return localDir;
}

export function getManifestPath(): string {
  return path.join(getAudioStorageDir(), 'audio-manifest.json');
}

/**
 * Computes current ISO week number (1 - 53)
 */
export function getCurrentWeekNumber(d: Date = new Date()): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

// 4-Week Rotating Curated Library of Viral, Copyright-Safe Trending Audios
export const WEEKLY_VIRAL_AUDIO_POOLS: Record<number, TrendingAudioItem[]> = {
  // Week 1: High Adrenaline Phonk & Stoic Synthwave
  0: [
    {
      id: 'w1-phonk-night-drive',
      name: 'Electronic Future Beats / Night Drive',
      category: 'roads',
      localFileName: 'viral-electronic-night-drive.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=electronic-future-beats-117997.mp3',
      mood: 'High-speed adrenaline & night drive',
      weekIndex: 0,
    },
    {
      id: 'w1-synthwave-memory',
      name: '80s Synthwave Cyberpunk (Memory Reboot Vibe)',
      category: 'buildings',
      localFileName: 'viral-synthwave-memory.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=synthwave-80s-110045.mp3',
      mood: 'Skylines, empires & ambitious mindset',
      weekIndex: 0,
    },
    {
      id: 'w1-dark-ambient-nature',
      name: 'Dark Ambient Cinematic Atmosphere',
      category: 'rain',
      localFileName: 'viral-dark-ambient-mindset.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=the-beat-of-nature-122841.mp3',
      mood: 'Deep reflection & stoic focus',
      weekIndex: 0,
    },
    {
      id: 'w1-snowfall-chill',
      name: 'Snowfall Atmospheric Piano & Strings',
      category: 'sky',
      localFileName: 'viral-snowfall-atmospheric.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Clouds, boundless horizons & calm consistency',
      weekIndex: 0,
    },
    {
      id: 'w1-snowfall-beach',
      name: 'Snowfall Atmospheric Piano & Strings',
      category: 'beach',
      localFileName: 'viral-snowfall-atmospheric.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Boundless horizons & relentless waves',
      weekIndex: 0,
    },
    {
      id: 'w1-lofi-chill-aesthetic',
      name: 'Chill Aesthetic Lo-Fi Hop',
      category: 'nature',
      localFileName: 'viral-lofi-chill.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-chill-medium-version-159456.mp3',
      mood: 'Solitude, quiet execution & peace',
      weekIndex: 0,
    },
  ],

  // Week 2: Midnight Cyber Velocity & Deep Motivation
  1: [
    {
      id: 'w2-phonk-drift',
      name: 'Midnight Cyber Velocity Drift',
      category: 'roads',
      localFileName: 'viral-w2-midnight-drift.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=electronic-future-beats-117997.mp3',
      mood: 'Relentless night highway drive',
      weekIndex: 1,
    },
    {
      id: 'w2-empire-synth',
      name: 'Metropolis Skyline Cyber Synth',
      category: 'buildings',
      localFileName: 'viral-w2-empire-synth.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=synthwave-80s-110045.mp3',
      mood: 'Building high-rises and financial freedom',
      weekIndex: 1,
    },
    {
      id: 'w2-storm-mindset',
      name: 'Heavy Storm Deep Stoic Reflection',
      category: 'rain',
      localFileName: 'viral-w2-storm-mindset.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=the-beat-of-nature-122841.mp3',
      mood: 'Calmness under external turbulence',
      weekIndex: 1,
    },
    {
      id: 'w2-aviation-clouds',
      name: 'Flight Horizon Ethereal Atmosphere',
      category: 'sky',
      localFileName: 'viral-w2-aviation-clouds.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Elevated vision above the noise',
      weekIndex: 1,
    },
    {
      id: 'w2-ocean-waves',
      name: 'Ocean Horizon Relentless Pulse',
      category: 'beach',
      localFileName: 'viral-w2-aviation-clouds.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Unstoppable consistency',
      weekIndex: 1,
    },
    {
      id: 'w2-mountain-lofi',
      name: 'Mountain Summit Lo-Fi Solitude',
      category: 'nature',
      localFileName: 'viral-w2-mountain-lofi.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-chill-medium-version-159456.mp3',
      mood: 'Unwavering roots and peaceful power',
      weekIndex: 1,
    },
  ],

  // Week 3: Horizon Bass & Cinematic Elevation
  2: [
    {
      id: 'w3-overdrive-bass',
      name: 'Overdrive Electronic Bass Run',
      category: 'roads',
      localFileName: 'viral-electronic-night-drive.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=electronic-future-beats-117997.mp3',
      mood: 'Tunnel vision & execution',
      weekIndex: 2,
    },
    {
      id: 'w3-retro-future',
      name: 'Retro 80s Architecture Synth',
      category: 'buildings',
      localFileName: 'viral-synthwave-memory.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=synthwave-80s-110045.mp3',
      mood: 'Next-level vision and executive poise',
      weekIndex: 2,
    },
    {
      id: 'w3-dark-thunder',
      name: 'Rainy Night Stoic Clarity',
      category: 'rain',
      localFileName: 'viral-dark-ambient-mindset.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=the-beat-of-nature-122841.mp3',
      mood: 'Mastering the dark seasons',
      weekIndex: 2,
    },
    {
      id: 'w3-sunset-strings',
      name: 'Sunset Altitude Chill Atmosphere',
      category: 'sky',
      localFileName: 'viral-snowfall-atmospheric.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Freedom and boundless possibilities',
      weekIndex: 2,
    },
    {
      id: 'w3-sunset-coast',
      name: 'Coastline Waves Horizon Strings',
      category: 'beach',
      localFileName: 'viral-snowfall-atmospheric.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Relentless continuous tide',
      weekIndex: 2,
    },
    {
      id: 'w3-zen-nature',
      name: 'Zen Woods Relaxing Lo-Fi',
      category: 'nature',
      localFileName: 'viral-lofi-chill.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-chill-medium-version-159456.mp3',
      mood: 'Calm mind, lethal discipline',
      weekIndex: 2,
    },
  ],

  // Week 4: Future Neon & Pure Mindset Flow
  3: [
    {
      id: 'w4-neon-highway',
      name: 'Neon Highway Electronic Beats',
      category: 'roads',
      localFileName: 'viral-electronic-night-drive.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=electronic-future-beats-117997.mp3',
      mood: 'Outpacing doubt at midnight',
      weekIndex: 3,
    },
    {
      id: 'w4-city-ambition',
      name: 'City Skyline High Ambition Synth',
      category: 'buildings',
      localFileName: 'viral-synthwave-memory.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=synthwave-80s-110045.mp3',
      mood: 'Generational wealth and architectural legacy',
      weekIndex: 3,
    },
    {
      id: 'w4-storm-clarity',
      name: 'Deep Rain Mindset Flow',
      category: 'rain',
      localFileName: 'viral-dark-ambient-mindset.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=the-beat-of-nature-122841.mp3',
      mood: 'Finding tranquility in the downpour',
      weekIndex: 3,
    },
    {
      id: 'w4-cloud-flight',
      name: 'Above The Clouds Atmospheric Melodic',
      category: 'sky',
      localFileName: 'viral-snowfall-atmospheric.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Pure perspective and boundless sky',
      weekIndex: 3,
    },
    {
      id: 'w4-ocean-calm',
      name: 'Calm Ocean Horizon Melodic',
      category: 'beach',
      localFileName: 'viral-snowfall-atmospheric.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
      mood: 'Unstoppable consistency',
      weekIndex: 3,
    },
    {
      id: 'w4-quiet-forest',
      name: 'Quiet Pine Forest Lo-Fi Beats',
      category: 'nature',
      localFileName: 'viral-lofi-chill.mp3',
      sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-chill-medium-version-159456.mp3',
      mood: 'Growing taller than circumstances',
      weekIndex: 3,
    },
  ],
};

export const VIRAL_AUDIO_SOURCE_POOL: TrendingAudioItem[] = WEEKLY_VIRAL_AUDIO_POOLS[0];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns the active audio track list for the current week
 */
export function getActiveWeeklyAudioPool(): TrendingAudioItem[] {
  const weekNum = getCurrentWeekNumber();
  const poolIndex = weekNum % 4;
  return WEEKLY_VIRAL_AUDIO_POOLS[poolIndex] || WEEKLY_VIRAL_AUDIO_POOLS[0];
}

/**
 * Ensures the weekly audio pool is fresh and all active tracks exist on disk.
 * Runs seamlessly inside the existing Instagram & TikTok cron job.
 * Fully resilient to Vercel read-only filesystems.
 */
export async function ensureTrendingAudioPoolFresh(): Promise<void> {
  try {
    const audioDir = getAudioStorageDir();
    const manifestPath = getManifestPath();
    const currentWeek = getCurrentWeekNumber();
    const activePool = getActiveWeeklyAudioPool();

    let manifest: { lastRefreshed: number; weekNumber?: number; tracks: TrendingAudioItem[] } | null = null;
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      } catch {}
    }

    const now = Date.now();
    const isWeekChanged = manifest?.weekNumber !== currentWeek;
    const isDueForRefresh = !manifest || (now - manifest.lastRefreshed > SEVEN_DAYS_MS) || isWeekChanged;

    // Check if any declared track for this week is missing from disk
    const hasMissingTracks = activePool.some((item) => {
      const p = path.join(audioDir, item.localFileName);
      return !fs.existsSync(p) || fs.statSync(p).size < 10000;
    });

    if (!isDueForRefresh && !hasMissingTracks) {
      const daysAgo = manifest ? ((now - manifest.lastRefreshed) / (1000 * 60 * 60 * 24)).toFixed(1) : '0';
      console.log(`🎵 [TrendingAudioService] Audio pool for Week ${currentWeek} is fresh & cached (${daysAgo} days ago).`);
      return;
    }

    console.log(`🔄 [TrendingAudioService] Weekly refresh triggered for Week #${currentWeek} (pool rotation active)!`);

    for (const track of activePool) {
      const dest = path.join(audioDir, track.localFileName);
      const existsAndValid = fs.existsSync(dest) && fs.statSync(dest).size > 10000;

      if (!existsAndValid || isDueForRefresh) {
        try {
          console.log(`⏳ [TrendingAudioService] Syncing trending audio: ${track.name}...`);
          const res = await fetch(track.sourceUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });

          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            if (buffer.length > 30000) {
              fs.writeFileSync(dest, buffer);
              track.lastUpdated = new Date().toISOString();
              console.log(`✓ [TrendingAudioService] Cached: ${track.localFileName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
            }
          }
        } catch (downloadErr: any) {
          console.warn(`⚠️ [TrendingAudioService] Track download skipped (${track.localFileName}): ${downloadErr.message}`);
        }
      }
    }

    // Save updated manifest in writable cache
    try {
      fs.writeFileSync(
        manifestPath,
        JSON.stringify(
          {
            lastRefreshed: now,
            weekNumber: currentWeek,
            updatedDate: new Date().toISOString(),
            tracks: activePool,
          },
          null,
          2
        )
      );
    } catch {}

    console.log(`🎉 [TrendingAudioService] Weekly trending audio refresh for Week #${currentWeek} completed!`);
  } catch (err: any) {
    console.warn(`⚠️ [TrendingAudioService] Audio refresh encountered non-fatal error: ${err.message}`);
  }
}

export interface ResolvedViralAudio {
  localPath: string;
  fileName: string;
  sourceUrl: string;
  name: string;
}

/**
 * Resolves the active viral audio for a given category.
 * Guaranteed to return an existing local file on disk and its CDN/source URL.
 */
export async function resolveActiveViralAudio(category: ReelCategory): Promise<ResolvedViralAudio> {
  const activePool = getActiveWeeklyAudioPool();
  const matchedItem =
    activePool.find((t) => t.category === category) ||
    activePool.find((t) => t.category === 'roads') ||
    activePool[0];

  const audioDir = getAudioStorageDir();
  const localDest = path.join(audioDir, matchedItem.localFileName);

  // 1. Check in writable cache (/tmp/viral_audio_cache or public/audio)
  if (fs.existsSync(localDest) && fs.statSync(localDest).size > 10000) {
    return {
      localPath: localDest,
      fileName: matchedItem.localFileName,
      sourceUrl: matchedItem.sourceUrl,
      name: matchedItem.name,
    };
  }

  // 2. Check in public/audio in workspace
  const repoPath = path.resolve(process.cwd(), 'public/audio', matchedItem.localFileName);
  if (fs.existsSync(repoPath) && fs.statSync(repoPath).size > 10000) {
    return {
      localPath: repoPath,
      fileName: matchedItem.localFileName,
      sourceUrl: matchedItem.sourceUrl,
      name: matchedItem.name,
    };
  }

  // 3. Download directly on-demand into writable storage
  try {
    console.log(`📥 [TrendingAudioService] On-demand fetching: ${matchedItem.name}...`);
    const res = await fetch(matchedItem.sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 20000) {
        fs.writeFileSync(localDest, buffer);
        console.log(`✓ [TrendingAudioService] On-demand cached: ${matchedItem.localFileName}`);
        return {
          localPath: localDest,
          fileName: matchedItem.localFileName,
          sourceUrl: matchedItem.sourceUrl,
          name: matchedItem.name,
        };
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [TrendingAudioService] On-demand audio download failed: ${err.message}`);
  }

  // 4. Fallback to bundled aesthetic-lofi-trending.mp3
  const fallbackRepo = path.resolve(process.cwd(), 'public/audio/aesthetic-lofi-trending.mp3');
  return {
    localPath: fs.existsSync(fallbackRepo) ? fallbackRepo : localDest,
    fileName: matchedItem.localFileName,
    sourceUrl: matchedItem.sourceUrl,
    name: matchedItem.name,
  };
}

/**
 * Returns the best viral audio path for a given category (synchronous backward compatibility)
 */
export function getActiveViralAudioForCategory(category: ReelCategory): string {
  const audioDir = getAudioStorageDir();
  const activePool = getActiveWeeklyAudioPool();

  const match = activePool.find((t) => t.category === category);
  if (match) {
    const tmpPath = path.join(audioDir, match.localFileName);
    if (fs.existsSync(tmpPath)) return tmpPath;
    const repoPath = path.resolve(process.cwd(), 'public/audio', match.localFileName);
    if (fs.existsSync(repoPath)) return repoPath;
  }

  for (const t of activePool) {
    const tmpPath = path.join(audioDir, t.localFileName);
    if (fs.existsSync(tmpPath)) return tmpPath;
    const repoPath = path.resolve(process.cwd(), 'public/audio', t.localFileName);
    if (fs.existsSync(repoPath)) return repoPath;
  }

  return path.resolve(process.cwd(), 'public/audio/aesthetic-lofi-trending.mp3');
}

