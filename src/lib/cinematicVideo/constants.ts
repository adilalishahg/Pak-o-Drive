/**
 * Constants & Configuration for Cinematic AI Video Engine
 * Pak-o-Drive Reel Generator
 */
import path from 'path';
import { PresenterProfile, RenderTheme } from './types';

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  aspectRatio: '9:16',
  tempDir: path.join(process.cwd(), 'temp_cinematic_reel'),
  outputVideoPath: path.join(process.cwd(), 'public', 'cinematic-reel.mp4'),
  previewHtmlPath: path.join(process.cwd(), 'public', 'cinematic-preview.html'),
};

export const DEFAULT_PRESENTER: PresenterProfile = {
  name: 'Alex Rivera',
  title: 'Senior AI & Full-Stack Architect',
  avatarLocalPath: path.join(process.cwd(), 'public', 'assets', 'presenter_alex.jpg'),
  voiceName: 'en-US-ChristopherNeural', // Smooth, authoritative, charismatic male voice
  glowColor: '#00F5D4', // Electric Cyan
};

export const THEME: RenderTheme = {
  primaryColor: '#00F5D4', // Vibrant neon cyan
  secondaryColor: '#38BDF8', // Sky blue
  accentColor: '#818CF8', // Indigo / Purple
  bgColor: '#070913', // Deep midnight obsidian
  cardBg: '#0F172A', // Slate 900
  textColor: '#F8FAFC', // Slate 50
};

export const CURATED_SINGLE_TOOLS = [
  {
    name: 'v0 by Vercel',
    category: 'Generative UI & Full-Stack',
    query: 'v0.dev generative react ui',
  },
  {
    name: 'Bolt.new by StackBlitz',
    category: 'Full-Stack Web Container',
    query: 'bolt.new in-browser fullstack app builder',
  },
  {
    name: 'Cursor AI',
    category: 'Autonomous Code Editor',
    query: 'cursor.com ai code editor composer',
  },
  {
    name: 'Supabase AI',
    category: 'Backend & Database Architecture',
    query: 'supabase.com postgres vector ai backend',
  },
  {
    name: 'Lovable.dev',
    category: 'Full-Stack AI Software Engineer',
    query: 'lovable.dev build fullstack apps with prompt',
  },
];
