/**
 * AI Script Engine for Cinematic Deep-Dive Reel
 * Dynamically generates a 5-scene focused narrative on a single breakthrough AI tool
 */
import { callMultiProviderAI } from '@/lib/multiAiEngine';
import { CURATED_SINGLE_TOOLS } from './constants';
import { DeepDiveToolScript } from './types';

export async function generateCinematicScript(customToolName?: string): Promise<DeepDiveToolScript> {
  // Select a seed tool if not specified
  const chosenSeed = customToolName
    ? { name: customToolName, category: 'AI & Developer Tool', query: `${customToolName} official website` }
    : CURATED_SINGLE_TOOLS[Math.floor(Math.random() * CURATED_SINGLE_TOOLS.length)];

  console.log(`🤖 [AI Script Engine] Generating deep-dive script for: ${chosenSeed.name}...`);

  const systemPrompt = `You are a world-class viral tech creator and YouTube/Instagram short-form director.
Write a high-retention 40-second script for a single groundbreaking developer tool.
Format MUST strictly be valid JSON without any commentary or markdown wrapping.

The video has 5 distinct scenes:
1. presenter_hook: The presenter directly addresses the viewer with a shocking revelation or problem.
2. search_simulation: The presenter tells the viewer what to search and opens Google/URL.
3. dashboard_interactive: The presenter hovers over a revolutionary killer feature and explains the magic.
4. superpower_comparison: The presenter contrasts the old painful way vs the 10x new way with this tool.
5. presenter_cta: The presenter returns on screen, delivers closing energy, and tells viewers to comment for the secret template/prompts.

JSON Schema:
{
  "toolName": "${chosenSeed.name}",
  "tagline": "Short punchy tagline (e.g., Code Fullstack Apps in 60s)",
  "category": "${chosenSeed.category}",
  "problemHook": "Single sentence hook problem",
  "searchQuery": "${chosenSeed.query}",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "withoutVsWith": [
    { "withoutTool": "3 Days writing boilerplate React & CSS", "withTool": "Done in 45 seconds with 1 natural prompt" },
    { "withoutTool": "Debugging deployment & Docker containers", "withTool": "Instant live URL with zero cloud setup" }
  ],
  "callToAction": "Comment '${chosenSeed.name.split(' ')[0].toUpperCase()}' below and I'll DM you the master prompt guide!",
  "scenes": [
    {
      "id": "scene_1",
      "type": "presenter_hook",
      "title": "STOP BUILDING UI MANUALLY",
      "subtitle": "The game just changed forever.",
      "spokenScript": "Stop wasting hours coding frontend components from scratch. In 2026, the world's fastest developers are using this single secret tool.",
      "badgeText": "SECRET WORKFLOW",
      "highlightWords": ["Stop", "Frontend", "Secret Tool"]
    },
    {
      "id": "scene_2",
      "type": "search_simulation",
      "title": "STEP 1: GO TO YOUR BROWSER",
      "subtitle": "Search for the game changer",
      "searchQuery": "${chosenSeed.query}",
      "spokenScript": "Open your browser and search for ${chosenSeed.name}. Watch how clean this interface is when you land on their engine.",
      "badgeText": "BROWSER SEARCH",
      "highlightWords": ["Search", "${chosenSeed.name}", "Clean"]
    },
    {
      "id": "scene_3",
      "type": "dashboard_interactive",
      "title": "KILLER FEATURE UNLOCKED",
      "subtitle": "Interactive Prompt-to-Production Engine",
      "hoverFeatureName": "Live Component Synth",
      "hoverFeatureDescription": "Transforms rough wireframe sketch into production-ready Tailwind and React 19 in real-time.",
      "spokenScript": "Look right here. When you hover over this canvas and type your vision, it renders responsive, production-ready code with complete database logic.",
      "badgeText": "LIVE DEMO",
      "highlightWords": ["Hover", "Canvas", "Production-ready"]
    },
    {
      "id": "scene_4",
      "type": "superpower_comparison",
      "title": "THE 10X ADVANTAGE",
      "subtitle": "Old Workflow vs New Superpower",
      "comparisonPoints": [
        { "withoutTool": "3 Days writing boilerplate React & CSS", "withTool": "Done in 45 seconds with 1 natural prompt" },
        { "withoutTool": "Debugging deployment & Docker containers", "withTool": "Instant live URL with zero cloud setup" }
      ],
      "spokenScript": "Before, building this meant days of writing boilerplate and debugging CSS. Now? It is ready in forty-five seconds with zero cloud headache.",
      "badgeText": "BEFORE VS AFTER",
      "highlightWords": ["Before", "Now", "Zero headache"]
    },
    {
      "id": "scene_5",
      "type": "presenter_cta",
      "title": "WANT MY MASTER TEMPLATE?",
      "subtitle": "Drop a comment below right now",
      "ctaButtonText": "COMMENT '${chosenSeed.name.split(' ')[0].toUpperCase()}' FOR PROMPTS",
      "spokenScript": "If you want my exact prompt library for ${chosenSeed.name}, drop a comment below and I will send it straight to your inbox.",
      "badgeText": "FREE ACCESS",
      "highlightWords": ["Prompt Library", "Comment", "Inbox"]
    }
  ]
}`;

  const userPrompt = `Generate a dynamic cinematic deep-dive script for ${chosenSeed.name} (${chosenSeed.category}). Make spokenScript crisp, engaging, and perfectly timed for speech synthesis (around 8-10 seconds per scene).`;

  try {
    const { text } = await callMultiProviderAI(systemPrompt, userPrompt);
    if (text) {
      const cleaned = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(cleaned) as DeepDiveToolScript;
      if (parsed && parsed.scenes && parsed.scenes.length >= 5) {
        console.log(`✅ [AI Script Engine] Successfully generated dynamic deep-dive script!`);
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [AI Script Engine] AI Generation fallback: ${err.message}`);
  }

  // Graceful fallback script if API rate-limited
  console.log(`ℹ️ [AI Script Engine] Using high-retention fallback script for ${chosenSeed.name}`);
  return {
    toolName: chosenSeed.name,
    tagline: 'Build & Ship In Seconds',
    category: chosenSeed.category,
    problemHook: 'Stop building web applications the hard way in 2026.',
    searchQuery: chosenSeed.query,
    keyFeatures: ['Instant Live Preview', 'AI Component Synth', 'Fullstack Zero Config'],
    withoutVsWith: [
      { withoutTool: 'Days of tedious boilerplate & CSS layout', withTool: 'Instant code generation with 1 natural prompt' },
      { withoutTool: 'Manual cloud deployment & environment keys', withTool: '1-Click shareable production URL instantly' },
    ],
    callToAction: `Comment '${chosenSeed.name.split(' ')[0].toUpperCase()}' for full source code!`,
    scenes: [
      {
        id: 'scene_1',
        type: 'presenter_hook',
        title: 'STOP WASTING HOURS ON BOILERPLATE',
        subtitle: 'The game just changed forever in 2026',
        spokenScript: 'Stop wasting entire days writing boilerplate frontend code. Top engineers are using this single game-changing tool to build ten times faster.',
        badgeText: 'SECRET WEAPON',
        highlightWords: ['Stop', 'Boilerplate', 'Ten Times'],
      },
      {
        id: 'scene_2',
        type: 'search_simulation',
        title: 'STEP 1: GO TO YOUR BROWSER',
        subtitle: 'Search the tool that builds everything',
        searchQuery: chosenSeed.query,
        spokenScript: `Open your browser right now and search for ${chosenSeed.name}. Watch how insanely clean this engine is when you land on their workspace.`,
        badgeText: 'SEARCH & LAUNCH',
        highlightWords: ['Search', chosenSeed.name, 'Clean'],
      },
      {
        id: 'scene_3',
        type: 'dashboard_interactive',
        title: 'THE KILLER FEATURE',
        subtitle: 'Interactive AI Component Synthesis',
        hoverFeatureName: 'Live Interactive Canvas',
        hoverFeatureDescription: 'Turns plain English prompts into production-grade Next.js and Tailwind components in seconds.',
        spokenScript: 'Look right here at this canvas. When you hover over your prompt and hit run, it synthesizes fully functional code that you can copy or deploy immediately.',
        badgeText: 'LIVE DEMO',
        highlightWords: ['Canvas', 'Hover', 'Production code'],
      },
      {
        id: 'scene_4',
        type: 'superpower_comparison',
        title: 'OLD WAY VS NEW WAY',
        subtitle: 'The 10x Developer Transformation',
        comparisonPoints: [
          { withoutTool: 'Days of tedious boilerplate & CSS layout', withTool: 'Instant code generation with 1 natural prompt' },
          { withoutTool: 'Manual cloud deployment & environment keys', withTool: '1-Click shareable production URL instantly' },
        ],
        spokenScript: 'The old way took days of tedious layout and debugging. With this tool, your entire prototype is live and ready in under forty-five seconds.',
        badgeText: 'BEFORE VS AFTER',
        highlightWords: ['Old way', 'Forty-five seconds', 'Live'],
      },
      {
        id: 'scene_5',
        type: 'presenter_cta',
        title: 'WANT MY EXCLUSIVE PROMPT PACK?',
        subtitle: 'Drop a comment below right now',
        ctaButtonText: `COMMENT '${chosenSeed.name.split(' ')[0].toUpperCase()}' BELOW`,
        spokenScript: `If you want my exact prompt templates for ${chosenSeed.name}, drop a comment below and I will send the private guide straight to you.`,
        badgeText: 'FREE RESOURCE',
        highlightWords: ['Prompt Templates', 'Comment', 'Private Guide'],
      },
    ],
  };
}
