import dbConnect from '@/lib/mongodb';
import InstagramPostLog from '@/models/InstagramPostLog';
import { callMultiProviderAI } from './multiAiEngine';
import {
  renderInstagramSlideJpeg,
  uploadSlideToCdn,
  CarouselSlideData,
} from './instagramSlideRenderer';

export interface InstagramPostResult {
  success: boolean;
  topic: string;
  category: 'viral-ai-tools' | 'tech-hacks' | 'developer-shortcuts' | 'dollar-earning-workflows' | 'future-tech';
  postId?: string;
  permalink?: string;
  caption?: string;
  mediaUrl?: string;
  isCarousel?: boolean;
  slidesCount?: number;
  error?: string;
}

export interface ViralTechTopic {
  topic: string;
  category: 'viral-ai-tools' | 'tech-hacks' | 'developer-shortcuts' | 'dollar-earning-workflows' | 'future-tech';
  badge: string;
  badgeColor: string;
  subtitle: string;
  tools: Array<{
    name: string;
    subtitle: string;
    badgeColor: string;
    replaces: string;
    superpower: string;
    proTip: string;
  }>;
}

// ── Curated Global Viral Tech & AI Carousel Decks ──────────────────────────
export const VIRAL_TECH_TOPICS: ViralTechTopic[] = [
  {
    topic: '3 AI Websites That Feel Illegal To Know in 2026',
    category: 'viral-ai-tools',
    badge: 'TOP SECRET AI',
    badgeColor: '#00F5D4',
    subtitle: 'Save this before it gets taken down ⚡',
    tools: [
      {
        name: 'v0.dev',
        subtitle: 'Generative Full-Stack UI & Code',
        badgeColor: '#00F5D4',
        replaces: 'Spending 5+ hours manually writing CSS, responsive layouts and frontend components.',
        superpower: 'Describe any app idea in simple English, and it builds production-ready Next.js & Tailwind UI in 30 seconds.',
        proTip: 'Use it to prototype entire client websites in 10 minutes instead of 3 days.',
      },
      {
        name: 'ElevenLabs',
        subtitle: 'Ultra-Realistic AI Voice Cloning',
        badgeColor: '#A855F7',
        replaces: 'Expensive voiceover artists, studio equipment and microphones.',
        superpower: 'Clone any human voice with 100% emotional accuracy, breathing cadence and inflection in under 3 seconds.',
        proTip: 'Use their speech-to-speech feature to create viral faceless video voiceovers instantly.',
      },
      {
        name: 'Gamma.app',
        subtitle: 'Autonomous Presentation Generator',
        badgeColor: '#10B981',
        replaces: 'Wasting entire evenings designing PowerPoint or Google Slides presentations.',
        superpower: 'Type a one-sentence topic prompt, and it generates a stunning 15-slide pitch deck complete with layouts, cards and images.',
        proTip: 'Export directly to PowerPoint (PPTX) or share via custom live interactive web link.',
      },
    ],
  },
  {
    topic: 'Stop Paying for Expensive Software: 3 Free AI Alternatives in 2026',
    category: 'tech-hacks',
    badge: 'ZERO COST STACK',
    badgeColor: '#38BDF8',
    subtitle: 'Cut $120/mo in software subscriptions 💸',
    tools: [
      {
        name: 'Photopea.com',
        subtitle: 'Free Browser Photoshop Replacement',
        badgeColor: '#38BDF8',
        replaces: 'Adobe Photoshop subscription ($35/month).',
        superpower: 'Full PSD, RAW and vector editor inside any browser with layers, masks, smart filters and zero installation.',
        proTip: 'Works seamlessly on Chromebooks, tablets and low-end laptops with 0 lag.',
      },
      {
        name: 'Ideogram.ai',
        subtitle: 'Free Hyper-Realistic Image & Typography AI',
        badgeColor: '#F43F5E',
        replaces: 'Midjourney ($30/month) and stock photo subscriptions.',
        superpower: 'Generates photorealistic images with flawless on-image typography, logos, and t-shirt designs.',
        proTip: 'Select "Magic Prompt" ON to automatically enhance prompts for ultra-aesthetic results.',
      },
      {
        name: 'CapCut Desktop',
        subtitle: 'Free Pro Video Editing & Auto-Subtitles',
        badgeColor: '#10B981',
        replaces: 'Premiere Pro and paid subtitle apps ($40/month).',
        superpower: '1-click AI auto-captions with glowing viral text animations, keyframing, motion tracking and 4K export.',
        proTip: 'Use their auto-reframe tool to turn horizontal videos into 9:16 vertical reels in 1 click.',
      },
    ],
  },
  {
    topic: 'How Developers Build Apps 10x Faster Using AI in 2026',
    category: 'developer-shortcuts',
    badge: 'DEV CHEAT CODES',
    badgeColor: '#F59E0B',
    subtitle: 'Ship production features while others debug ⚡',
    tools: [
      {
        name: 'Cursor AI',
        subtitle: 'The Autonomous AI Code Editor',
        badgeColor: '#00F5D4',
        replaces: 'Tedious boilerplate typing, manual refactoring, and scouring StackOverflow.',
        superpower: 'Press Cmd+K to write entire functions or Cmd+I to edit entire multi-file codebases in seconds.',
        proTip: 'Feed your entire repo docs into @docs to get accurate API answers with zero hallucinations.',
      },
      {
        name: 'Supabase',
        subtitle: 'Instant Production Backend & Auth',
        badgeColor: '#10B981',
        replaces: 'Spending 3 days configuring PostgreSQL, auth servers, and storage buckets.',
        superpower: 'Get instant REST & GraphQL APIs, Row-Level Security, and file storage in under 60 seconds.',
        proTip: 'Use Supabase Vector to store embeddings for your AI apps without extra infrastructure.',
      },
      {
        name: 'Bolt.new',
        subtitle: 'Full-Stack In-Browser AI Sandbox',
        badgeColor: '#EC4899',
        replaces: 'Local environment setup errors, Node version mismatches, and dependency hell.',
        superpower: 'Prompt, build, run, and deploy full-stack Node & Next.js applications entirely in WebContainers.',
        proTip: 'Click 1-button Deploy to Netlify or Vercel to launch live working prototypes to clients.',
      },
    ],
  },
  {
    topic: '3 Secret Websites to Make Passive Income in Dollars ($) with AI',
    category: 'dollar-earning-workflows',
    badge: 'USD WORKFLOWS',
    badgeColor: '#10B981',
    subtitle: 'Build recurring digital income streams 💰',
    tools: [
      {
        name: 'Gumroad',
        subtitle: 'Global Digital Product Storefront',
        badgeColor: '#FACC15',
        replaces: 'Complex e-commerce store setup, international payment gateways, and hosting fees.',
        superpower: 'Sell Notion templates, AI prompt packs, and cheatsheets to buyers in US/UK with instant delivery.',
        proTip: 'Bundle 5 related PDF guides into a single $19 "Ultimate Pack" to double average order value.',
      },
      {
        name: 'PartnerStack',
        subtitle: 'B2B SaaS Recurring Affiliate Network',
        badgeColor: '#38BDF8',
        replaces: 'Low-paying Amazon affiliate links that give 2% margins.',
        superpower: 'Earn 20% to 40% lifetime monthly recurring revenue on every business software you recommend.',
        proTip: 'Focus on productivity tools where users stay subscribed for 12+ months.',
      },
      {
        name: 'Substack',
        subtitle: 'Direct Subscriber Monetization Platform',
        badgeColor: '#A855F7',
        replaces: 'Expensive email marketing tools like Mailchimp or ConvertKit.',
        superpower: 'Publish a weekly "Top 5 Secret AI Websites" newsletter and charge $5/month for VIP insights.',
        proTip: 'Cross-promote your Instagram DM followers into email newsletter subscribers for a bulletproof audience.',
      },
    ],
  },
];

/**
 * Normalizes topic string for deduplication
 */
function normalizeTopic(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fetches recent Instagram topics from MongoDB to avoid duplicate posts
 */
async function getRecentInstagramTopics(): Promise<string[]> {
  try {
    await dbConnect();
    const logs = await InstagramPostLog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('topic topicNormalized')
      .lean();

    return logs.map((l) => l.topicNormalized || normalizeTopic(l.topic));
  } catch (err) {
    console.warn('⚠️ [InstagramAutoPost] DB topic fetch warning:', err);
    return [];
  }
}

/**
 * Generate Viral Instagram Caption via Gemini AI
 */
export async function generateInstagramViralCaption(topicItem: ViralTechTopic): Promise<string> {
  const systemPrompt = `You are an elite Silicon Valley Tech & AI Growth Strategist writing for a Tier-1 Global Audience (United States, United Kingdom, Canada, Europe).
Your goal is to write a high-retention, high-saves viral Instagram caption that commands respect and drives massive explore page distribution in Western tech hubs.

Formatting & Tone Rules:
1. Start with an irresistible 1-line hook tailored to American/European tech professionals, founders, and ambitious creators (e.g. "Silicon Valley's best kept secrets for 2026 👇" or "The top 1% of founders don't work harder — they use these AI cheat codes ⚡").
2. Direct the reader to swipe through the 5-slide visual carousel deck above ➡️
3. Break down each tool with clean spacing, bold capital names, and clear 1-line superpowers.
4. Add the viral ManyChat DM funnel trigger:
   "💬 Comment 'TOOL' below and our automated bot will send you direct access links + exclusive promo codes straight to your inbox!"
5. End with an open-ended discussion question that drives comments from Western tech workers and entrepreneurs.
6. Append 15-18 high-CPM, Tier-1 trending hashtags:
   #siliconvalley #futureofwork #saas #remotework #buildinpublic #aitools #techstartups #productivitytools #artificialintelligence #techtrends #webdev #automation #sidehustle #techcareers
STRICT RULE: Do NOT include markdown bold asterisks like **word** in the caption. Use clean plain text.`;

  const userMessage = `Topic: "${topicItem.topic}"
Featured Tools:
${topicItem.tools.map((t, i) => `${i + 1}. ${t.name} (${t.subtitle}) - ${t.superpower}`).join('\n')}

Generate the full Instagram post caption now:`;

  try {
    const aiRes = await callMultiProviderAI(systemPrompt, userMessage);
    if (aiRes.text && aiRes.text.length > 100) {
      return aiRes.text.trim().replace(/\*\*/g, '');
    }
  } catch (err) {
    console.warn('⚠️ [InstagramAutoPost] AI generation fallback triggered:', err);
  }

  // Fallback caption for Tier-1 US/Europe audience
  return `${topicItem.topic} 🧠👇

The top 1% of creators and founders don't work 60-hour weeks — they automate their workflow with secret AI tools.

👉 Swipe through the 5-slide visual deck above for the full breakdown! ➡️

${topicItem.tools.map((t) => `⚡ ${t.name} — ${t.superpower}`).join('\n\n')}

━━━━━━━━━━━━━━━━━
💬 Comment "TOOL" below and our automated bot will DM you all direct access links + exclusive free credits!

🚀 Follow @digitalinspirer for daily secret AI websites & Silicon Valley workflows to 10x your output!

Which of these tools are you integrating first? Let's discuss in the comments 👇

#siliconvalley #futureofwork #saas #remotework #buildinpublic #aitools #techstartups #productivitytools #artificialintelligence #techtrends #webdev #automation #sidehustle #techcareers #digitalcreator`;
}

/**
 * Execute Instagram Auto-Post (Swipeable Carousel)
 */
export async function executeAutoInstagramPost(options?: {
  source?: 'cron' | 'admin-manual' | 'cli-script';
  customTopicIndex?: number;
}): Promise<InstagramPostResult> {
  const source = options?.source || 'cli-script';
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    const err = 'INSTAGRAM_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN is missing from environment.';
    console.error(`❌ [InstagramAutoPost] ${err}`);
    return {
      success: false,
      topic: 'N/A',
      category: 'viral-ai-tools',
      error: err,
    };
  }

  console.log('🚀 [InstagramAutoPost] Initializing automated carousel post dispatcher...');
  console.log(`📱 [InstagramAutoPost] Target Account ID: ${igUserId}`);

  // 1. Anti-Duplication Shield
  const pastTopics = await getRecentInstagramTopics();
  const eligibleTopics = VIRAL_TECH_TOPICS.filter(
    (t) => !pastTopics.includes(normalizeTopic(t.topic))
  );

  const selectedTopic =
    options?.customTopicIndex !== undefined && VIRAL_TECH_TOPICS[options.customTopicIndex]
      ? VIRAL_TECH_TOPICS[options.customTopicIndex]
      : eligibleTopics.length > 0
      ? eligibleTopics[Math.floor(Math.random() * eligibleTopics.length)]
      : VIRAL_TECH_TOPICS[Math.floor(Math.random() * VIRAL_TECH_TOPICS.length)];

  console.log(`📌 [InstagramAutoPost] Topic Selected: "${selectedTopic.topic}" (${selectedTopic.category})`);

  // 2. Generate Caption via AI
  console.log('🤖 [InstagramAutoPost] Generating viral caption via Gemini AI...');
  const caption = await generateInstagramViralCaption(selectedTopic);

  // 3. Render 5 Carousel Slides as 1080x1350 High-Aesthetic JPEGs
  console.log('🎨 [InstagramAutoPost] Rendering 5 high-aesthetic carousel slides (1080x1350)...');
  const slidesData: CarouselSlideData[] = [
    {
      slideNumber: 1,
      totalSlides: 5,
      type: 'cover',
      badge: selectedTopic.badge,
      badgeColor: selectedTopic.badgeColor,
      title: selectedTopic.topic,
      subtitle: selectedTopic.subtitle,
    },
    ...selectedTopic.tools.map((tool, idx) => ({
      slideNumber: idx + 2,
      totalSlides: 5,
      type: 'tool' as const,
      badge: `TOOL #${idx + 1}`,
      badgeColor: tool.badgeColor,
      title: tool.name,
      toolName: tool.name,
      subtitle: tool.subtitle,
      replaces: tool.replaces,
      superpower: tool.superpower,
      proTip: tool.proTip,
    })),
    {
      slideNumber: 5,
      totalSlides: 5,
      type: 'cta',
      badge: 'ACTION STEP',
      badgeColor: '#FACC15',
      title: 'Get Free Access Links',
      ctaText: 'Comment "TOOL" below and our automated bot will DM you direct access links + secret promo codes straight to your inbox!',
    },
  ];

  // 4. Render & Upload Slides to CDN
  console.log('📤 [InstagramAutoPost] Uploading 5 slides to high-speed CDN...');
  const slideUrls: string[] = [];
  for (let i = 0; i < slidesData.length; i++) {
    const buffer = await renderInstagramSlideJpeg(slidesData[i]);
    const cdnUrl = await uploadSlideToCdn(buffer, i + 1);
    slideUrls.push(cdnUrl);
    console.log(`✓ [InstagramAutoPost] Slide ${i + 1}/5 uploaded: ${cdnUrl}`);
  }

  // 5. Step 1: Create Item Containers for each slide
  console.log('📦 [InstagramAutoPost] Creating Meta carousel item containers...');
  const itemContainerIds: string[] = [];
  for (let i = 0; i < slideUrls.length; i++) {
    const res = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: slideUrls[i],
        is_carousel_item: true,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error || !data.id) {
      throw new Error(`Failed to create carousel item ${i + 1}: ` + (data.error?.message || 'Unknown error'));
    }
    itemContainerIds.push(data.id);
  }
  console.log(`✓ [InstagramAutoPost] Created ${itemContainerIds.length} carousel item containers`);

  // 6. Step 2: Create Parent Carousel Container
  console.log('🎡 [InstagramAutoPost] Creating parent carousel container...');
  const parentRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: itemContainerIds.join(','),
      caption,
      access_token: accessToken,
    }),
  });
  const parentData = await parentRes.json();
  if (!parentRes.ok || parentData.error || !parentData.id) {
    throw new Error('Failed to create parent carousel container: ' + (parentData.error?.message || 'Unknown error'));
  }
  const carouselContainerId = parentData.id;
  console.log(`✓ [InstagramAutoPost] Carousel container created: ${carouselContainerId}`);

  // 6.5 Wait for Meta to process the carousel container (status_code === 'FINISHED')
  console.log('⏳ [InstagramAutoPost] Waiting for Meta processing queue (bundling 5 slides)...');
  let isReady = false;
  let attempts = 0;
  while (!isReady && attempts < 10) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const statusRes = await fetch(
        `https://graph.facebook.com/v20.0/${carouselContainerId}?fields=status_code,status&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      if (statusData.status_code === 'FINISHED') {
        isReady = true;
        console.log(`✓ [InstagramAutoPost] Carousel container ready for publication (attempt ${attempts})`);
        break;
      } else if (statusData.status_code === 'ERROR') {
        throw new Error('Meta processing error: ' + (statusData.status || 'Failed to process carousel'));
      }
      console.log(`⏳ [InstagramAutoPost] Container status: ${statusData.status_code || 'IN_PROGRESS'}, waiting...`);
    } catch (e: any) {
      if (attempts >= 10) throw e;
    }
  }

  // 7. Step 3: Publish Parent Carousel Container Live
  console.log('📡 [InstagramAutoPost] Publishing swipeable carousel live to Instagram feed...');
  const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: carouselContainerId,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error || !publishData.id) {
    throw new Error('Failed to publish carousel: ' + (publishData.error?.message || 'Unknown error'));
  }
  const postId = publishData.id;
  console.log(`✓ [InstagramAutoPost] Carousel published successfully! Post ID: ${postId}`);

  // 8. Step 4: Fetch Permalink
  let permalink: string | undefined;
  try {
    const permalinkRes = await fetch(
      `https://graph.facebook.com/v20.0/${postId}?fields=permalink&access_token=${accessToken}`
    );
    const permalinkData = await permalinkRes.json();
    if (permalinkData.permalink) {
      permalink = permalinkData.permalink;
      console.log(`🔗 [InstagramAutoPost] Carousel Live Link: ${permalink}`);
    }
  } catch {}

  // 9. Save Log to MongoDB
  await logInstagramPost({
    topic: selectedTopic.topic,
    topicNormalized: normalizeTopic(selectedTopic.topic),
    category: selectedTopic.category,
    caption,
    mediaUrl: slideUrls[0],
    postId,
    permalink,
    source,
    status: 'published',
  });

  return {
    success: true,
    topic: selectedTopic.topic,
    category: selectedTopic.category,
    postId,
    permalink,
    caption,
    mediaUrl: slideUrls[0],
    isCarousel: true,
    slidesCount: 5,
  };
}

/**
 * Save log to MongoDB safely
 */
async function logInstagramPost(data: Partial<InstagramPostResult> & {
  topicNormalized?: string;
  source: 'cron' | 'admin-manual' | 'cli-script';
  status: 'published' | 'failed';
  error?: string;
}) {
  try {
    await dbConnect();
    await InstagramPostLog.create({
      topic: data.topic,
      topicNormalized: data.topicNormalized,
      category: data.category || 'viral-ai-tools',
      caption: data.caption || '',
      mediaUrl: data.mediaUrl || '',
      mediaType: 'CAROUSEL',
      postId: data.postId,
      permalink: data.permalink,
      source: data.source,
      status: data.status,
      error: data.error,
    });
  } catch (err) {
    console.warn('⚠️ [InstagramAutoPost] Failed to write DB log:', err);
  }
}
