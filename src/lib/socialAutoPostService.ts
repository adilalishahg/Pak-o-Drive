import dbConnect from '@/lib/mongodb';
import { SocialAccount } from '@/models/SocialAccount';
import { callMultiProviderAI } from './multiAiEngine';
import { renderSlobodanCarouselPdf, CURATED_DECKS } from './carouselGenerator';

const TECH_TOPICS = [
  'React 19 Server Components vs Client Components in production applications',
  'Next.js 16 App Router caching and dynamic data fetching strategies',
  'Why database indexing matters: MongoDB execution plans and query optimization',
  'Building resilient full-stack systems: Graceful degradation and zero-downtime architecture',
  'The evolution of AI coding agents: From autocomplete to autonomous engineering',
  'TypeScript 5 strict mode: Advanced generics and type narrowing patterns',
  'Microservices vs Modular Monoliths: Real-world engineering trade-offs',
  'Modern Web Vitals (LCP, INP, CLS): Practical performance optimization tips',
  'Secure API Authentication: OAuth 2.0, refresh token rotation, and JWT traps',
  'Event-Driven Architecture with WebSockets and message queues in Node.js',
];

/**
 * 1. Generate High-Impact IT / Tech LinkedIn Post via AI (Gemini with Fallbacks)
 */
export async function generateLinkedInTechPost(): Promise<{ content: string; topic: string }> {
  const randomTopic = TECH_TOPICS[Math.floor(Math.random() * TECH_TOPICS.length)];

  const systemPrompt = `You are a Principal Software Architect and Tech Thought Leader writing an engaging, authentic, and high-value technical LinkedIn carousel post.
Tone: Professional, authoritative yet accessible, inspiring, practical.
Formatting & Layout Requirements:
1. Start with an irresistible 1-line hook (no generic greetings like "Hello network" or "Happy Monday").
2. Frame a common misconception or real-world software engineering challenge.
3. Provide 3-4 concrete, actionable technical takeaways formatted cleanly with emojis (📌 or ⚡) and neat indentation.
4. Add a clear call-to-action inviting the reader to swipe the carousel PDF document attached above for the visual breakdown (e.g. "👉 Swipe through the carousel document above for the complete visual breakdown! ➡️").
5. End with an open-ended question that encourages engineers, tech leads, and founders to comment and discuss.
6. AT THE VERY BOTTOM, generate and append 8-12 highly relevant, trending hashtags (e.g. #SoftwareEngineering #SystemDesign #TechTrends #WebDev).
Do NOT include quotation marks around the entire post. Keep spacing clean with blank lines between paragraphs.`;

  const userMessage = `Write a high-reach technical LinkedIn post on this topic: "${randomTopic}". Keep it punchy, insightful, formatted for maximum readability on mobile feeds, and append 8-12 relevant hashtags at the bottom.`;

  const aiRes = await callMultiProviderAI(systemPrompt, userMessage);
  let content = aiRes.text || getDefaultTechPost(randomTopic);

  // Guarantee high-reach AI hashtags at the bottom
  content = await ensurePostHashtagsWithAI(content, randomTopic);

  return { content, topic: randomTopic };
}

/**
 * Fallback static post in case AI providers are completely unreachable
 */
function getDefaultTechPost(topic: string): string {
  return `Most software performance bottlenecks aren't caused by the framework you choose — they are caused by unindexed database queries and unnecessary client-side re-renders. ⚡

When engineering high-scale production systems:

📌 Treat database indexes as first-class citizens, not afterthoughts.
📌 Keep client bundles lean by pushing heavy data transformations to server components.
📌 Measure before optimizing: rely on real profiler telemetry rather than guesswork.
📌 Build with graceful fallbacks so third-party API downtimes don't crash your core user experience.

Architecture is always about intentional trade-offs.

👉 Swipe through the 8-slide carousel document above for the full visual system breakdown! ➡️

What performance optimization gave your team the highest ROI recently? Let's discuss in the comments below! 💬

#SoftwareEngineering #SystemDesign #WebDevelopment #FullStack #BackendEngineering #PerformanceOptimization #NextJS #Databases #CleanCode #TechTrends`;
}

/**
 * 2. Generate Slobodan Gajić-style 3D dark-mode tech graphic via AI Flux
 */
export async function generateTechGraphic(topic: string): Promise<Buffer | null> {
  // 1. Instant check: Use high-res curated 3D topic graphic if matching topic domain
  try {
    const fs = await import('fs');
    const path = await import('path');
    const topicLower = topic.toLowerCase();
    let fileName = 'microservices.jpg';
    if (
      topicLower.includes('render') ||
      topicLower.includes('ssr') ||
      topicLower.includes('csr') ||
      topicLower.includes('ssg') ||
      topicLower.includes('isr')
    ) {
      fileName = 'rendering.jpg';
    } else if (
      topicLower.includes('database') ||
      topicLower.includes('index') ||
      topicLower.includes('sql') ||
      topicLower.includes('mongo') ||
      topicLower.includes('query')
    ) {
      fileName = 'database.jpg';
    } else if (
      topicLower.includes('react') ||
      topicLower.includes('next') ||
      topicLower.includes('compiler') ||
      topicLower.includes('component')
    ) {
      fileName = 'react19.jpg';
    }

    const localPath = path.join(process.cwd(), 'public/img/tech-carousel', fileName);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      console.log(`✓ [AutoSocial] Loaded high-res topic graphic (${fileName}, ${buffer.length} bytes)`);
      try {
        fs.writeFileSync('public/active-post-graphic.jpg', buffer);
      } catch {}
      return buffer;
    }
  } catch (err) {
    console.warn('⚠️ [AutoSocial] Local graphic check skipped:', err);
  }

  // 2. Fallback: Generate via AI
  try {
    const prompt = encodeURIComponent(
      `Futuristic 3D dark mode isometric technology architecture illustration, glowing cyan data streams and neon electric blue server networks, complex software engineering systems diagram, topic: ${topic.slice(
        0,
        50
      )}, dark navy background, ultra detailed 8k render, octane render`
    );
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&nologo=true`;

    console.log(`🎨 [AutoSocial] Generating 3D dark tech graphic for: "${topic}"...`);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length > 10000) {
        console.log(`✓ [AutoSocial] Graphic generated successfully (${buffer.length} bytes)`);
        try {
          const fs = await import('fs');
          fs.writeFileSync('public/active-post-graphic.jpg', buffer);
          console.log('✓ [AutoSocial] Saved graphic to public/active-post-graphic.jpg');
        } catch { }
        return buffer;
      }
    }
  } catch (err) {
    console.warn('⚠️ [AutoSocial] AI image generation timed out or failed:', err);
  }
  return null;
}

/**
 * Uploads an image binary buffer to LinkedIn Images API and returns the image URN
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  authorUrn: string,
  imageBuffer: Buffer
): Promise<string | null> {
  try {
    console.log('📤 [AutoSocial] Initializing image upload with LinkedIn Images API...');
    const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202608',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: authorUrn,
        },
      }),
    });

    if (!initRes.ok) {
      console.warn('LinkedIn image init failed:', await initRes.text());
      return null;
    }

    const initData = await initRes.json();
    const uploadUrl = initData.value?.uploadUrl;
    const imageUrn = initData.value?.image;

    if (!uploadUrl || !imageUrn) return null;

    console.log('📤 [AutoSocial] Uploading binary buffer to LinkedIn CDN...');
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg',
      },
      body: new Uint8Array(imageBuffer),
    });

    if (!uploadRes.ok) {
      console.warn('LinkedIn binary upload failed:', uploadRes.status);
      return null;
    }

    console.log(`✓ [AutoSocial] Image uploaded to LinkedIn: ${imageUrn}`);
    return imageUrn;
  } catch (err) {
    console.warn('⚠️ [AutoSocial] LinkedIn Image Upload encountered error:', err);
    return null;
  }
}

/**
 * Uploads a multi-page PDF document to LinkedIn Documents API and returns document URN
 */
async function uploadDocumentToLinkedIn(
  accessToken: string,
  authorUrn: string,
  pdfBuffer: Buffer
): Promise<string | null> {
  try {
    console.log('📤 [AutoSocial] Initializing Document Carousel with LinkedIn API...');
    const initRes = await fetch('https://api.linkedin.com/rest/documents?action=initializeUpload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202608',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: authorUrn,
        },
      }),
    });

    if (!initRes.ok) {
      console.warn('LinkedIn document init failed:', await initRes.text());
      return null;
    }

    const initData = await initRes.json();
    const uploadUrl = initData.value?.uploadUrl;
    const documentUrn = initData.value?.document;

    if (!uploadUrl || !documentUrn) return null;

    console.log('📤 [AutoSocial] Uploading PDF carousel to LinkedIn...');
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/pdf',
      },
      body: new Uint8Array(pdfBuffer),
    });

    if (!uploadRes.ok) {
      console.warn('LinkedIn document upload failed:', uploadRes.status);
      return null;
    }

    console.log(`✓ [AutoSocial] Document Carousel uploaded: ${documentUrn}`);
    return documentUrn;
  } catch (err) {
    console.warn('⚠️ [AutoSocial] LinkedIn Document Upload error:', err);
    return null;
  }
}

export interface SocialMediaAttachment {
  type: 'document' | 'image';
  buffer: Buffer;
  title: string;
}

/**
 * 3. Publish post directly to LinkedIn via LinkedIn REST API (supports Carousel Document or 3D Graphic)
 */
export async function publishToLinkedIn(
  content: string,
  media?: SocialMediaAttachment | null
): Promise<{ success: boolean; postId?: string; error?: string }> {
  await dbConnect();

  const account = await SocialAccount.findOne({ platform: 'linkedin', isActive: true });
  if (!account || !account.accessToken) {
    return {
      success: false,
      error: 'No active LinkedIn account connected. Please authenticate via /api/auth/linkedin first.',
    };
  }

  // Check token expiration
  if (account.expiresAt && new Date() > account.expiresAt) {
    return {
      success: false,
      error: 'LinkedIn access token has expired. Please re-authenticate via /api/auth/linkedin.',
    };
  }

  try {
    let mediaUrn: string | null = null;
    if (media?.type === 'document') {
      mediaUrn = await uploadDocumentToLinkedIn(account.accessToken, account.accountUrn, media.buffer);
    } else if (media?.type === 'image') {
      mediaUrn = await uploadImageToLinkedIn(account.accessToken, account.accountUrn, media.buffer);
    }

    // Modern LinkedIn REST API /rest/posts (Version 202608)
    const payload: any = {
      author: account.accountUrn,
      commentary: content,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };

    if (mediaUrn) {
      payload.content = {
        media: {
          title: media?.title || 'Technical Masterclass',
          id: mediaUrn,
        },
      };
    }

    const res = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'LinkedIn-Version': '202608',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const postId = res.headers.get('x-restli-id') || '';

    if (!res.ok) {
      const errorText = await res.text();
      console.error('LinkedIn Publish Error Response:', res.status, errorText);
      return {
        success: false,
        error: `LinkedIn API returned HTTP ${res.status}: ${errorText}`,
      };
    }

    // Success: increment counter and update lastPostedAt
    account.lastPostedAt = new Date();
    account.postCount = (account.postCount || 0) + 1;
    await account.save();

    return {
      success: true,
      postId,
    };
  } catch (err: any) {
    console.error('Failed to dispatch post to LinkedIn:', err);
    return {
      success: false,
      error: err.message || 'Unknown network error while publishing to LinkedIn',
    };
  }
}

/**
 * Dynamically generate high-reach, contextually relevant hashtags using Multi-Provider AI
 */
export async function generateAIHashtags(topic: string, postSnippet?: string): Promise<string> {
  const prompt = `Generate 8 to 12 highly relevant, trending LinkedIn hashtags for a technical post about "${topic}".
Context: "${(postSnippet || topic).slice(0, 200)}"
Rules:
1. Output ONLY hashtags separated by spaces (e.g. #AICoding #SoftwareEngineering #SystemDesign #DeveloperTools #TechArchitecture #FutureOfCode #FullStack #WebDevelopment).
2. Include both high-reach macro tags and niche topic-specific tags.
3. No numbering, no bullets, no commentary, no markdown.`;

  try {
    const aiRes = await callMultiProviderAI(
      'You are a B2B LinkedIn growth strategist and developer relations expert.',
      prompt
    );
    if (aiRes.text) {
      const cleaned = aiRes.text
        .replace(/[^a-zA-Z0-9_#\s]/g, '')
        .split(/\s+/)
        .filter((t) => t.startsWith('#') && t.length > 2)
        .slice(0, 12)
        .join(' ');
      if (cleaned.length > 15) {
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('⚠️ [AutoSocial] AI hashtag generation skipped, using curated domain tags:', err);
  }

  // Curated domain fallbacks
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('agent') || topicLower.includes('ai') || topicLower.includes('claude') || topicLower.includes('copilot') || topicLower.includes('survey')) {
    return '#AICoding #CodingAgents #SoftwareEngineering #FutureOfWork #ArtificialIntelligence #DeveloperTools #TechArchitecture #FullStack #WebDevelopment #Programming';
  }
  if (topicLower.includes('render') || topicLower.includes('ssr') || topicLower.includes('csr') || topicLower.includes('isr')) {
    return '#WebPerformance #NextJS #React19 #WebDevelopment #SystemDesign #FullStack #FrontendEngineering #SoftwareArchitecture #CleanCode';
  }
  if (topicLower.includes('database') || topicLower.includes('index') || topicLower.includes('sql') || topicLower.includes('mongo')) {
    return '#Databases #MongoDB #PostgreSQL #SystemDesign #BackendEngineering #SoftwareArchitecture #DatabaseOptimization #FullStack #Cloud';
  }
  if (topicLower.includes('microservice') || topicLower.includes('monolith')) {
    return '#Microservices #ModularMonolith #SystemDesign #SoftwareArchitecture #CloudArchitecture #Backend #DevOps #Scalability';
  }
  return '#SoftwareEngineering #SystemDesign #FullStack #WebDevelopment #Programming #TechTrends #CloudArchitecture #DeveloperProductivity';
}

/**
 * Ensures a post has relevant, high-reach tech hashtags attached
 */
export function ensurePostHashtags(caption: string, topic: string): string {
  if (caption.includes('#')) {
    return caption;
  }
  const topicLower = topic.toLowerCase();
  let defaultTags = '#SoftwareEngineering #SystemDesign #FullStack #WebDevelopment #TechArchitecture';
  if (topicLower.includes('render') || topicLower.includes('ssr') || topicLower.includes('csr') || topicLower.includes('isr')) {
    defaultTags = '#WebPerformance #NextJS #ReactJS #SystemDesign #FullStack #Frontend #SoftwareEngineering #CloudArchitecture';
  } else if (topicLower.includes('database') || topicLower.includes('index') || topicLower.includes('sql') || topicLower.includes('mongo')) {
    defaultTags = '#Databases #MongoDB #PostgreSQL #SQL #SystemDesign #BackendEngineering #DatabaseOptimization #SoftwareArchitecture';
  } else if (topicLower.includes('microservice') || topicLower.includes('monolith')) {
    defaultTags = '#Microservices #ModularMonolith #SystemDesign #SoftwareArchitecture #CloudArchitecture #Backend #DevOps';
  } else if (topicLower.includes('react') || topicLower.includes('next')) {
    defaultTags = '#React19 #NextJS #ReactJS #WebDevelopment #Frontend #JavaScript #TypeScript #FullStack';
  }
  return `${caption}\n\n${defaultTags}`;
}

/**
 * Ensures post text has clean formatting with AI-curated hashtags placed at the bottom
 */
export async function ensurePostHashtagsWithAI(caption: string, topic: string): Promise<string> {
  let cleaned = caption
    .replace(/#PakODrive/gi, '')
    .replace(/Pak-o-Drive/gi, '')
    .replace(/pakodrive\.pk/gi, '')
    .trim();

  const existingTags = cleaned.match(/#[A-Za-z0-9_]+/g);
  if (existingTags && existingTags.length >= 5) {
    return cleaned;
  }
  const aiTags = await generateAIHashtags(topic, cleaned);
  return `${cleaned}\n\n${aiTags}`;
}

/**
 * 4. Master Trigger: Generate Carousel Deck + Render Multi-Page PDF + Publish to LinkedIn
 */
export async function executeAutoLinkedInPost(preferredDeckIndex?: number): Promise<{
  success: boolean;
  topic?: string;
  content?: string;
  postId?: string;
  isCarousel?: boolean;
  error?: string;
}> {
  try {
    // 1. Pick a rich architectural topic deck
    const deckIndex =
      preferredDeckIndex !== undefined && preferredDeckIndex >= 0 && preferredDeckIndex < CURATED_DECKS.length
        ? preferredDeckIndex
        : Math.floor(Math.random() * CURATED_DECKS.length);
    const chosenDeck = CURATED_DECKS[deckIndex];
    const postCaption = await ensurePostHashtagsWithAI(chosenDeck.caption, chosenDeck.topic);

    console.log(`🚀 [AutoSocial] Preparing Slobodan Gajić-style Carousel for: "${chosenDeck.topic}"...`);

    // 2. Generate 3D dark-mode Tech Graphic for the Cover Slide
    let coverGraphic: Buffer | null = null;
    try {
      console.log(`🎨 [AutoSocial] Fetching 3D tech graphic for cover slide...`);
      coverGraphic = await generateTechGraphic(chosenDeck.topic);
    } catch (gErr) {
      console.warn('⚠️ [AutoSocial] Cover graphic generation skipped:', gErr);
    }

    // 3. Render 6-slide 1080x1080 dark mode PDF with embedded graphic & large typography
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await renderSlobodanCarouselPdf(chosenDeck, coverGraphic);
      console.log(`✓ [AutoSocial] PDF Carousel compiled (${pdfBuffer.length} bytes, ${chosenDeck.slides.length} slides)`);
      try {
        const fs = await import('fs');
        fs.writeFileSync('public/active-carousel.pdf', pdfBuffer);
        console.log('✓ [AutoSocial] Saved active carousel PDF to public/active-carousel.pdf');
      } catch { }
    } catch (pdfErr) {
      console.warn('⚠️ [AutoSocial] PDF rendering failed, will fall back to single 3D image:', pdfErr);
    }

    // 3. Dispatch to LinkedIn (Document Carousel takes priority)
    let publishRes;
    let isCarousel = false;

    if (pdfBuffer) {
      console.log('📡 [AutoSocial] Dispatching Swipeable Document Carousel to LinkedIn...');
      publishRes = await publishToLinkedIn(postCaption, {
        type: 'document',
        buffer: pdfBuffer,
        title: chosenDeck.topic,
      });
      isCarousel = publishRes.success;
    }

    // Fallback: If document carousel dispatch failed, try generating 3D graphic
    if (!publishRes || !publishRes.success) {
      console.log('🔄 [AutoSocial] Document carousel dispatch failed, falling back to 3D graphic...');
      const fallbackGraphic = await generateTechGraphic(chosenDeck.topic);
      if (fallbackGraphic) {
        publishRes = await publishToLinkedIn(postCaption, {
          type: 'image',
          buffer: fallbackGraphic,
          title: chosenDeck.topic,
        });
      } else {
        // Last resort: publish text only
        publishRes = await publishToLinkedIn(postCaption, null);
      }
    }

    if (!publishRes.success) {
      return {
        success: false,
        topic: chosenDeck.topic,
        content: postCaption,
        error: publishRes.error,
      };
    }

    return {
      success: true,
      topic: chosenDeck.topic,
      content: postCaption,
      postId: publishRes.postId,
      isCarousel,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Execution failure during auto-social posting',
    };
  }
}


