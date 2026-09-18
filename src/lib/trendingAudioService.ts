import fs from 'fs';
import path from 'path';
import { ReelCategory } from './reelCategoryLibrary';

export interface TrendingAudioItem {
  id: string;
  name: string;
  category: ReelCategory | 'all';
  localFileName: string;
  sourceUrl: string;
  mood: string;
  lastUpdated?: string;
}

const MANIFEST_PATH = path.resolve(process.cwd(), 'public/audio/audio-manifest.json');
const AUDIO_DIR = path.resolve(process.cwd(), 'public/audio');

// Curated weekly rotating pool of viral, royalty-free audio tracks
export const VIRAL_AUDIO_SOURCE_POOL: TrendingAudioItem[] = [
  {
    id: 'phonk-night-drive',
    name: 'Electronic Night Drive / Drift Bass',
    category: 'roads',
    localFileName: 'viral-electronic-night-drive.mp3',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=electronic-future-beats-117997.mp3',
    mood: 'High-speed adrenaline & night drive',
  },
  {
    id: 'synthwave-memory',
    name: '80s Synthwave Cyberpunk (Memory Reboot Vibe)',
    category: 'buildings',
    localFileName: 'viral-synthwave-memory.mp3',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=synthwave-80s-110045.mp3',
    mood: 'Skylines, empires & ambitious mindset',
  },
  {
    id: 'dark-ambient-nature',
    name: 'Dark Ambient Cinematic Atmosphere',
    category: 'rain',
    localFileName: 'viral-dark-ambient-mindset.mp3',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=the-beat-of-nature-122841.mp3',
    mood: 'Deep reflection & stoic focus',
  },
  {
    id: 'snowfall-chill',
    name: 'Snowfall Atmospheric Piano & Strings',
    category: 'sky',
    localFileName: 'viral-snowfall-atmospheric.mp3',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=chill-abstract-intention-12099.mp3',
    mood: 'Clouds, boundless horizons & calm consistency',
  },
  {
    id: 'lofi-chill-aesthetic',
    name: 'Chill Aesthetic Lo-Fi Hop',
    category: 'nature',
    localFileName: 'viral-lofi-chill.mp3',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-chill-medium-version-159456.mp3',
    mood: 'Solitude, quiet execution & peace',
  },
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Ensures the weekly audio pool is fresh and all tracks exist on disk.
 * Runs seamlessly inside the existing Instagram & TikTok cron job.
 */
export async function ensureTrendingAudioPoolFresh(): Promise<void> {
  try {
    if (!fs.existsSync(AUDIO_DIR)) {
      fs.mkdirSync(AUDIO_DIR, { recursive: true });
    }

    let manifest: { lastRefreshed: number; tracks: TrendingAudioItem[] } | null = null;
    if (fs.existsSync(MANIFEST_PATH)) {
      try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      } catch {}
    }

    const now = Date.now();
    const isDueForRefresh = !manifest || (now - manifest.lastRefreshed > SEVEN_DAYS_MS);

    // Check if any declared track is missing from disk
    const hasMissingTracks = VIRAL_AUDIO_SOURCE_POOL.some(
      (item) => !fs.existsSync(path.join(AUDIO_DIR, item.localFileName))
    );

    if (!isDueForRefresh && !hasMissingTracks) {
      const daysAgo = manifest ? ((now - manifest.lastRefreshed) / (1000 * 60 * 60 * 24)).toFixed(1) : '0';
      console.log(`🎵 [TrendingAudioService] Audio pool is up-to-date (refreshed ${daysAgo} days ago).`);
      return;
    }

    console.log('🔄 [TrendingAudioService] Weekly refresh triggered! Verifying & fetching trending viral audio tracks...');

    for (const track of VIRAL_AUDIO_SOURCE_POOL) {
      const dest = path.join(AUDIO_DIR, track.localFileName);
      if (!fs.existsSync(dest) || isDueForRefresh) {
        try {
          console.log(`⏳ [TrendingAudioService] Updating track: ${track.name}...`);
          const res = await fetch(track.sourceUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });

          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            if (buffer.length > 50000) {
              fs.writeFileSync(dest, buffer);
              track.lastUpdated = new Date().toISOString();
              console.log(`✓ [TrendingAudioService] Saved: ${track.localFileName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
            }
          }
        } catch (downloadErr: any) {
          console.warn(`⚠️ [TrendingAudioService] Track download skipped (${track.localFileName}): ${downloadErr.message}`);
        }
      }
    }

    // Save updated manifest
    fs.writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(
        {
          lastRefreshed: now,
          updatedDate: new Date().toISOString(),
          tracks: VIRAL_AUDIO_SOURCE_POOL,
        },
        null,
        2
      )
    );

    console.log('🎉 [TrendingAudioService] Weekly trending audio refresh completed successfully!');
  } catch (err: any) {
    console.warn(`⚠️ [TrendingAudioService] Audio refresh check encountered non-fatal error: ${err.message}`);
  }
}

/**
 * Returns the best viral audio path for a given category
 */
export function getActiveViralAudioForCategory(category: ReelCategory): string {
  const match = VIRAL_AUDIO_SOURCE_POOL.find((t) => t.category === category);
  if (match) {
    const fullPath = `public/audio/${match.localFileName}`;
    if (fs.existsSync(fullPath)) return fullPath;
  }

  // Fallback to any valid local track
  for (const t of VIRAL_AUDIO_SOURCE_POOL) {
    const p = `public/audio/${t.localFileName}`;
    if (fs.existsSync(p)) return p;
  }

  return 'public/audio/aesthetic-lofi-trending.mp3';
}
