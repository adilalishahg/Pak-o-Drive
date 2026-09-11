/**
 * Master Facade for Cinematic AI Video Engine
 * Orchestrates Script -> Voiceover -> UI Frame -> Video Compilation
 */
import fs from 'fs';
import path from 'path';
import { VIDEO_CONFIG } from './constants';
import { DeepDiveToolScript, VideoCompilationResult } from './types';
import { generateCinematicScript } from './aiScriptEngine';
import { generateSceneVoiceover } from './voiceEngine';
import { renderSceneFrame } from './uiRenderers';
import { compileCinematicVideo } from './videoCompiler';

export * from './types';
export * from './constants';
export * from './aiScriptEngine';
export * from './voiceEngine';
export * from './uiRenderers';
export * from './videoCompiler';

export async function generateCinematicVideo(options?: {
  customToolName?: string;
  outputVideoPath?: string;
}): Promise<VideoCompilationResult> {
  const startTime = Date.now();
  console.log(`🚀 [Cinematic Engine] Initiating high-impact AI reel generation...`);

  // Ensure workspace temp directory is prepared
  const tempDir = VIDEO_CONFIG.tempDir;
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Step 1: AI Script Generation (Dynamic content via MultiProvider AI)
  console.log(`\n--- Step 1: Dynamic AI Script Generation ---`);
  const script: DeepDiveToolScript = await generateCinematicScript(options?.customToolName);
  console.log(`🎯 Tool Selected: ${script.toolName} (${script.category})`);
  console.log(`📝 Total Scenes: ${script.scenes.length}`);

  // Step 2 & 3: Generate Voiceover & Render UI Frames for each scene
  console.log(`\n--- Step 2 & 3: Voiceover & UI Frame Rendering ---`);
  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    const audioOut = path.join(tempDir, `audio_${i}_${scene.id}.mp3`);
    const frameOut = path.join(tempDir, `frame_${i}_${scene.id}.jpg`);

    // Generate Edge-TTS neural speech & measure exact duration
    const duration = await generateSceneVoiceover(scene, audioOut);
    scene.audioPath = audioOut;
    scene.audioDurationSeconds = duration;

    // Render Sharp 1080x1920 high-resolution frame
    await renderSceneFrame(scene, script, frameOut);
    scene.frameImagePath = frameOut;
  }

  // Step 4: Assemble and Compile Video via FFmpeg
  console.log(`\n--- Step 4: Master Video Assembly via FFmpeg ---`);
  const finalVideoOut = options?.outputVideoPath || VIDEO_CONFIG.outputVideoPath;
  const result = await compileCinematicVideo(script, script.scenes, finalVideoOut);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 [Cinematic Engine] Complete pipeline finished in ${totalTimeSec}s!`);
  console.log(`📹 Output Video: ${result.videoPath}`);
  console.log(`🌐 Preview Webpage: ${result.previewHtmlPath}\n`);

  return result;
}
