/**
 * UI Renderers for Cinematic AI Video Engine
 * Modular scene renderers for 1080x1920 high-fidelity frames.
 */
import sharp from 'sharp';
import { CinematicScene, DeepDiveToolScript } from './types';
import {
  getPresenterBase64,
  renderScene1PresenterHook,
  renderScene2SearchSimulation,
  renderScene3DashboardInteractive,
  renderScene4SuperpowerComparison,
  renderScene5PresenterCTA,
} from './scenes';

export * from './scenes';

/**
 * Master UI Frame Renderer for any Scene
 */
export async function renderSceneFrame(
  scene: CinematicScene,
  script: DeepDiveToolScript,
  outputImagePath: string
): Promise<void> {
  const presenterBase64 = getPresenterBase64();
  let svg = '';

  switch (scene.type) {
    case 'presenter_hook':
      svg = renderScene1PresenterHook(scene, script, presenterBase64);
      break;
    case 'search_simulation':
      svg = renderScene2SearchSimulation(scene, script, presenterBase64);
      break;
    case 'dashboard_interactive':
      svg = renderScene3DashboardInteractive(scene, script, presenterBase64);
      break;
    case 'superpower_comparison':
      svg = renderScene4SuperpowerComparison(scene, script, presenterBase64);
      break;
    case 'presenter_cta':
      svg = renderScene5PresenterCTA(scene, script, presenterBase64);
      break;
    default:
      svg = renderScene1PresenterHook(scene, script, presenterBase64);
  }

  // Render SVG to 1080x1920 high-quality JPEG using Sharp
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 95, progressive: true })
    .toFile(outputImagePath);

  console.log(`🖼️ [UI Renderer] Rendered frame for [${scene.id}] (${scene.type}) -> ${outputImagePath}`);
}
