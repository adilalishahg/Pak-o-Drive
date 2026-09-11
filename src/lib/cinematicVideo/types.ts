/**
 * Types and Interfaces for the Cinematic AI Video Engine
 * Pak-o-Drive Reel Generator
 */

export type SceneType =
  | 'presenter_hook'
  | 'search_simulation'
  | 'dashboard_interactive'
  | 'superpower_comparison'
  | 'presenter_cta';

export interface CinematicScene {
  id: string;
  type: SceneType;
  title: string;
  subtitle: string;
  spokenScript: string;
  badgeText: string;
  highlightWords: string[];
  // Interactive metadata
  searchQuery?: string;
  hoverFeatureName?: string;
  hoverFeatureDescription?: string;
  comparisonPoints?: {
    withoutTool: string;
    withTool: string;
  }[];
  ctaButtonText?: string;
  // Generated audio metadata
  audioPath?: string;
  audioDurationSeconds?: number;
  frameImagePath?: string;
}

export interface DeepDiveToolScript {
  toolName: string;
  tagline: string;
  category: string;
  problemHook: string;
  searchQuery: string;
  keyFeatures: string[];
  withoutVsWith: {
    withoutTool: string;
    withTool: string;
  }[];
  callToAction: string;
  scenes: CinematicScene[];
}

export interface PresenterProfile {
  name: string;
  title: string;
  avatarLocalPath: string;
  voiceName: string;
  glowColor: string;
}

export interface RenderTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
}

export interface VideoCompilationResult {
  success: boolean;
  videoPath: string;
  videoDurationSeconds: number;
  fileSizeBytes: number;
  scenesCount: number;
  toolName: string;
  previewHtmlPath?: string;
  error?: string;
}
