/**
 * Video Compiler for Cinematic AI Video Engine
 * Uses FFmpeg to assemble scene frames and neural audio into high-quality 1080x1920 MP4
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { VIDEO_CONFIG } from './constants';
import { CinematicScene, DeepDiveToolScript, VideoCompilationResult } from './types';

function getFfmpegPath(): string {
  try {
    // Dynamic runtime resolution prevents bundlers (Webpack/Turbopack) from attempting to resolve binary executables
    const ffmpegInstaller = (eval('require'))('@ffmpeg-installer/ffmpeg');
    if (ffmpegInstaller?.path && fs.existsSync(ffmpegInstaller.path)) {
      return ffmpegInstaller.path;
    }
  } catch {
    // Fallback to system ffmpeg binary
  }
  return 'ffmpeg';
}

const ffmpegPath = getFfmpegPath();

export async function compileCinematicVideo(
  script: DeepDiveToolScript,
  scenes: CinematicScene[],
  outputVideoPath: string = VIDEO_CONFIG.outputVideoPath
): Promise<VideoCompilationResult> {
  const tempDir = VIDEO_CONFIG.tempDir;
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Ensure public directory exists
  const publicDir = path.dirname(outputVideoPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log(`🎬 [Video Compiler] Compiling ${scenes.length} scenes into cinematic reel...`);

  const sceneClips: string[] = [];

  // Step 1: Render each scene into a standalone synced MP4 clip
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const framePath = scene.frameImagePath;
    const audioPath = scene.audioPath;
    const clipOut = path.join(tempDir, `clip_${i}_${scene.id}.mp4`);

    if (!framePath || !fs.existsSync(framePath)) {
      throw new Error(`Missing frame image for scene ${scene.id} at ${framePath}`);
    }
    if (!audioPath || !fs.existsSync(audioPath)) {
      throw new Error(`Missing audio voiceover for scene ${scene.id} at ${audioPath}`);
    }

    console.log(`🔨 [Video Compiler] Building clip ${i + 1}/${scenes.length} (${scene.type})...`);

    // FFmpeg command to loop still image over audio stream with standard Instagram Reel specs:
    // H.264 video, AAC audio, 1080x1920, 30fps, yuv420p
    const cmd = `"${ffmpegPath}" -y -loop 1 -framerate ${VIDEO_CONFIG.fps} -i "${framePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${clipOut}"`;

    execSync(cmd, { stdio: 'pipe' });
    sceneClips.push(clipOut);
  }

  // Step 2: Concatenate all clips using concat demuxer
  console.log(`🔗 [Video Compiler] Merging ${sceneClips.length} clips into final master reel...`);
  const concatListPath = path.join(tempDir, 'concat_list.txt');
  const fileLines = sceneClips
    .map((clip) => `file '${clip.replace(/\\/g, '/')}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, fileLines, 'utf-8');

  const concatCmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${outputVideoPath}"`;
  execSync(concatCmd, { stdio: 'pipe' });

  // Step 3: Verify output video and calculate total size and duration
  const fileStats = fs.statSync(outputVideoPath);
  const totalDuration = scenes.reduce((sum, s) => sum + (s.audioDurationSeconds || 0), 0);

  console.log(`✅ [Video Compiler] Master Video Ready!`);
  console.log(`   Path: ${outputVideoPath}`);
  console.log(`   Size: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   Est. Duration: ${totalDuration.toFixed(1)}s`);

  // Step 4: Generate HTML preview page for instant verification
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cinematic AI Reel Preview — ${script.toolName}</title>
  <style>
    body {
      background-color: #070913;
      color: #F8FAFC;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(0, 245, 212, 0.15);
      border: 1px solid #00F5D4;
      color: #00F5D4;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      margin: 0 0 8px 0;
      color: #F8FAFC;
    }
    p.subtitle {
      font-size: 15px;
      color: #94A3B8;
      margin: 0 0 20px 0;
    }
    video {
      width: 100%;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0, 245, 212, 0.2);
      border: 2px solid #1E293B;
      background: #000;
      aspect-ratio: 9/16;
    }
    .meta {
      margin-top: 18px;
      padding: 16px;
      border-radius: 16px;
      background: #0F172A;
      border: 1px solid #1E293B;
      display: flex;
      justify-content: space-around;
      font-size: 14px;
    }
    .meta div span {
      display: block;
      color: #94A3B8;
      font-size: 11px;
      text-transform: uppercase;
    }
    .meta div strong {
      color: #00F5D4;
      font-size: 16px;
    }
    .scenes-list {
      margin-top: 20px;
      text-align: left;
      background: #0F172A;
      border-radius: 16px;
      padding: 16px;
      border: 1px solid #1E293B;
    }
    .scene-item {
      padding: 8px 0;
      border-bottom: 1px solid #1E293B;
      font-size: 13px;
    }
    .scene-item:last-child {
      border-bottom: none;
    }
    .scene-item strong {
      color: #38BDF8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">CINEMATIC AI REEL PREVIEW</div>
    <h1>${script.toolName}</h1>
    <p class="subtitle">${script.tagline}</p>
    
    <video controls autoplay loop playsinline>
      <source src="./cinematic-reel.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <div class="meta">
      <div>
        <span>Duration</span>
        <strong>${totalDuration.toFixed(1)}s</strong>
      </div>
      <div>
        <span>File Size</span>
        <strong>${(fileStats.size / (1024 * 1024)).toFixed(2)} MB</strong>
      </div>
      <div>
        <span>Resolution</span>
        <strong>1080x1920 (9:16)</strong>
      </div>
      <div>
        <span>Scenes</span>
        <strong>${scenes.length} Scenes</strong>
      </div>
    </div>

    <div class="scenes-list">
      <div style="font-weight: 700; color: #F8FAFC; margin-bottom: 8px;">Story Arc Breakdown:</div>
      ${scenes
        .map(
          (s, idx) => `
        <div class="scene-item">
          <strong>Scene ${idx + 1} (${s.type}):</strong> ${s.title}<br>
          <span style="color: #94A3B8; font-size: 12px;">"${s.spokenScript}" (${s.audioDurationSeconds}s)</span>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(VIDEO_CONFIG.previewHtmlPath, previewHtml, 'utf-8');
  console.log(`🌐 [Video Compiler] Preview HTML written to: ${VIDEO_CONFIG.previewHtmlPath}`);

  return {
    success: true,
    videoPath: outputVideoPath,
    videoDurationSeconds: totalDuration,
    fileSizeBytes: fileStats.size,
    scenesCount: scenes.length,
    toolName: script.toolName,
    previewHtmlPath: VIDEO_CONFIG.previewHtmlPath,
  };
}
