/**
 * Voice Engine for Cinematic Reel
 * Generates natural neural speech for each scene using Edge-TTS
 * and accurately measures audio durations via ffprobe
 */
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { execSync } from 'child_process';
import ffprobeStatic from '@ffprobe-installer/ffprobe';
import fs from 'fs';
import path from 'path';
import { DEFAULT_PRESENTER } from './constants';
import { CinematicScene } from './types';

function getFfprobePath(): string {
  if (ffprobeStatic?.path && fs.existsSync(ffprobeStatic.path)) {
    return ffprobeStatic.path;
  }
  return 'ffprobe';
}

const ffprobePath = getFfprobePath();

export async function generateSceneVoiceover(
  scene: CinematicScene,
  outputAudioPath: string,
  voiceName: string = DEFAULT_PRESENTER.voiceName
): Promise<number> {
  // Ensure output directory exists
  const dir = path.dirname(outputAudioPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`🎙️ [Voice Engine] Generating voice for [${scene.id}] (${scene.type})...`);

  // Initialize Edge TTS
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(scene.spokenScript);
  const writeStream = fs.createWriteStream(outputAudioPath);

  await new Promise<void>((resolve, reject) => {
    audioStream.pipe(writeStream);
    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
  });

  // Calculate exact audio duration using ffprobe
  let duration = 8.0; // fallback default
  try {
    const cmd = `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputAudioPath}"`;
    const output = execSync(cmd, { encoding: 'utf-8' }).trim();
    const parsedDuration = parseFloat(output);
    if (!isNaN(parsedDuration) && parsedDuration > 0) {
      // Add a slight 0.4s breathing room buffer for smooth video pacing
      duration = Math.round((parsedDuration + 0.4) * 10) / 10;
    }
  } catch (err: any) {
    console.warn(`⚠️ [Voice Engine] Could not probe audio duration for ${scene.id}: ${err.message}. Using 8s default.`);
  }

  console.log(`✅ [Voice Engine] Audio generated: ${outputAudioPath} (${duration}s)`);
  return duration;
}
