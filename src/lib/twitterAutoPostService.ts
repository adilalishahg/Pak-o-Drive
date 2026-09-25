import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import { SocialAccount } from '@/models/SocialAccount';
import TwitterPostLog from '@/models/TwitterPostLog';
import { callMultiProviderAI } from './multiAiEngine';

export interface GeneratedTweetThread {
  topic: string;
  track: 'agentic-ai' | 'nextjs-react' | 'typescript' | 'cloud-architecture' | 'fullstack-performance' | 'fullstack-architecture' | 'trading-tech';
  tweets: string[];
  hashtags: string[];
}

export interface TwitterPublishResult {
  success: boolean;
  topic: string;
  tweets: string[];
  tweetId?: string;
  tweetUrl?: string;
  isThread: boolean;
  status: 'published' | 'simulated' | 'failed';
  error?: string;
  mode: 'direct-api' | 'webhook' | 'simulation';
}

const TWITTER_TECH_TOPICS = [
  {
    topic: 'Next.js 16 App Router: Why 90% of developers get Server Component caching wrong',
    track: 'nextjs-react' as const,
  },
  {
    topic: 'React 19 Server Actions vs traditional REST APIs: Real-world latency & security tradeoffs',
    track: 'nextjs-react' as const,
  },
  {
    topic: 'MongoDB indexing blueprint: How we reduced slow query latency from 850ms to 4ms',
    track: 'fullstack-performance' as const,
  },
  {
    topic: 'Building 1-click WhatsApp checkout for emerging markets: CRO & UX architecture',
    track: 'fullstack-architecture' as const,
  },
  {
    topic: 'Autonomous AI coding agents in production: Moving past simple autocompletions to multi-file refactoring',
    track: 'agentic-ai' as const,
  },
  {
    topic: 'TypeScript 5 strict patterns: Discriminated unions and exhaustive type narrowing',
    track: 'typescript' as const,
  },
  {
    topic: 'Microservices vs Modular Monolith: Why early-stage tech startups regret premature splitting',
    track: 'cloud-architecture' as const,
  },
  {
    topic: 'Algorithmic Trading & Webhook Execution: Building zero-latency order dispatchers in Node.js',
    track: 'trading-tech' as const,
  },
  {
    topic: 'Full-stack Web Vitals optimization: Crushing LCP and INP on image-heavy e-commerce stores',
    track: 'fullstack-performance' as const,
  },
];

export async function generateTechTwitterThread(selectedTopic?: string): Promise<GeneratedTweetThread> {
  await dbConnect();

  const recentLogs = await TwitterPostLog.find().sort({ createdAt: -1 }).limit(20).select('topic').lean();
  const pastTopics = recentLogs.map((l: any) => l.topic.toLowerCase());

  let chosen = TWITTER_TECH_TOPICS.find((t) => !pastTopics.includes(t.topic.toLowerCase()));
  if (!chosen) {
    chosen = TWITTER_TECH_TOPICS[Math.floor(Math.random() * TWITTER_TECH_TOPICS.length)];
  }

  const topic = selectedTopic || chosen.topic;
  const track = chosen.track;

  const systemPrompt = `You are a Principal Software Architect and Tech Founder building a high-authority Twitter/X personal brand.
Goal: Attract international software clients, tech founders, and earn high engagement.

Format rules:
1. Output MUST be valid JSON array of 3 to 4 tweet strings: ["tweet 1", "tweet 2", "tweet 3", "tweet 4"].
2. TWEET 1 (Hook): Gripping, bold engineering statement. Max 240 chars. No generic greetings.
3. TWEET 2 (The Problem & Insight): Concrete breakdown of why it matters or where teams fail. Max 260 chars.
4. TWEET 3 (Actionable Architecture / Code takeaway): 3 concise bullet points with emojis (📌 or ⚡). Max 260 chars.
5. TWEET 4 (CTA & Discussion): Open question to engineers + soft CTA: "Building high-performance web systems? DM me for client projects & tech consulting. 🚀" + 2 relevant hashtags (e.g. #WebDev #Nextjs). Max 260 chars.
6. STRICT CHARACTER LIMIT: Every single string in the array MUST be under 270 characters (Twitter limit is 280).

Return ONLY the raw JSON array, nothing else.`;

  const userPrompt = `Write a viral 4-tweet engineering thread on the topic: "${topic}".`;

  try {
    const aiRes = await callMultiProviderAI(systemPrompt, userPrompt);
    let tweets: string[] = [];

    if (aiRes.text) {
      const cleaned = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        tweets = parsed.map((t: string) => String(t).trim()).filter((t) => t.length > 10);
      }
    }

    if (tweets.length < 2) {
      throw new Error('AI returned insufficient tweets');
    }

    return {
      topic,
      track,
      tweets,
      hashtags: ['#WebDev', '#SoftwareEngineering', '#Nextjs'],
    };
  } catch (err) {
    console.warn('⚠️ [TwitterAutoPost] AI generation fallback used:', err);
    return {
      topic,
      track,
      tweets: [
        `🧵 1/4 ${topic}.\n\nMost engineering teams optimize for the wrong metrics. Here is what actually moves the needle in modern production:`,
        `2/4 The core bottleneck isn't framework choice — it's network roundtrips and unindexed database queries.\n\nOptimizing your data layer first yields 5x better ROI than rewriting UI components.`,
        `3/4 📌 Three practical rules:\n• Push computation to the edge\n• Cache aggressively at the query layer\n• Profile real user latency with Web Vitals`,
        `4/4 What is your biggest performance bottleneck right now?\n\nBuilding scalable full-stack web applications? DMs are open for client inquiries and architecture audits. 🚀 #WebDev #Nextjs`,
      ],
      hashtags: ['#WebDev', '#Nextjs', '#SoftwareEngineering'],
    };
  }
}

function createOAuth1Header(params: {
  url: string;
  method: string;
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}): string {
  const { url, method, consumerKey, consumerSecret, accessToken, accessTokenSecret } = params;
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`);

  return `OAuth ${headerParts.join(', ')}`;
}

export async function executeAutoTwitterPost(options?: {
  topic?: string;
  forceSimulation?: boolean;
  source?: 'cron' | 'admin-manual';
}): Promise<TwitterPublishResult> {
  await dbConnect();

  const source = options?.source || 'cron';
  const threadData = await generateTechTwitterThread(options?.topic);
  const { topic, track, tweets } = threadData;

  const dbAccount = await SocialAccount.findOne({ platform: 'twitter', isActive: true });

  const apiKey = dbAccount?.apiKey || process.env.TWITTER_API_KEY;
  const apiSecret = dbAccount?.apiSecret || process.env.TWITTER_API_SECRET;
  const accessToken = dbAccount?.accessToken || process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = dbAccount?.accessTokenSecret || process.env.TWITTER_ACCESS_TOKEN_SECRET;
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  const webhookUrl = process.env.TWITTER_WEBHOOK_URL;

  // 1. Simulation Mode
  if (options?.forceSimulation || (!apiKey && !bearerToken && !webhookUrl)) {
    const simulatedLog = await TwitterPostLog.create({
      topic,
      track,
      tweets,
      isThread: tweets.length > 1,
      source,
      status: 'simulated',
      tweetId: `sim_${Date.now()}`,
      tweetUrl: `https://x.com/intent/tweet?text=${encodeURIComponent(tweets[0])}`,
    });

    return {
      success: true,
      topic,
      tweets,
      tweetId: simulatedLog.tweetId,
      tweetUrl: simulatedLog.tweetUrl,
      isThread: tweets.length > 1,
      status: 'simulated',
      mode: 'simulation',
    };
  }

  // 2. Webhook Dispatch
  if (webhookUrl) {
    try {
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          track,
          tweets,
          firstTweet: tweets[0],
          fullThread: tweets.join('\n\n'),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookRes.ok) {
        throw new Error(`Webhook responded with status ${webhookRes.status}`);
      }

      await TwitterPostLog.create({
        topic,
        track,
        tweets,
        isThread: tweets.length > 1,
        source,
        status: 'published',
        tweetId: `webhook_${Date.now()}`,
      });

      return {
        success: true,
        topic,
        tweets,
        isThread: tweets.length > 1,
        status: 'published',
        mode: 'webhook',
      };
    } catch (err: any) {
      await TwitterPostLog.create({
        topic,
        track,
        tweets,
        isThread: tweets.length > 1,
        source,
        status: 'failed',
        error: err.message || 'Webhook post error',
      });
      return {
        success: false,
        topic,
        tweets,
        isThread: tweets.length > 1,
        status: 'failed',
        error: err.message,
        mode: 'webhook',
      };
    }
  }

  // 3. Direct API Dispatch
  try {
    const apiUrl = 'https://api.twitter.com/2/tweets';
    let previousTweetId: string | undefined;
    let firstTweetId: string | undefined;

    for (let i = 0; i < tweets.length; i++) {
      const tweetText = tweets[i];
      const payload: any = { text: tweetText };

      if (previousTweetId) {
        payload.reply = { in_reply_to_tweet_id: previousTweetId };
      }

      let authHeader = '';
      if (apiKey && apiSecret && accessToken && accessTokenSecret) {
        authHeader = createOAuth1Header({
          url: apiUrl,
          method: 'POST',
          consumerKey: apiKey,
          consumerSecret: apiSecret,
          accessToken,
          accessTokenSecret,
        });
      } else if (bearerToken) {
        authHeader = `Bearer ${bearerToken}`;
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.data?.id) {
        throw new Error(data?.detail || data?.title || `Twitter API error: status ${res.status}`);
      }

      previousTweetId = data.data.id;
      if (i === 0) {
        firstTweetId = data.data.id;
      }
    }

    if (dbAccount) {
      dbAccount.lastPostedAt = new Date();
      dbAccount.postCount = (dbAccount.postCount || 0) + 1;
      await dbAccount.save();
    }

    const tweetUrl = firstTweetId ? `https://x.com/i/status/${firstTweetId}` : undefined;

    await TwitterPostLog.create({
      topic,
      track,
      tweets,
      tweetId: firstTweetId,
      tweetUrl,
      isThread: tweets.length > 1,
      source,
      status: 'published',
    });

    return {
      success: true,
      topic,
      tweets,
      tweetId: firstTweetId,
      tweetUrl,
      isThread: tweets.length > 1,
      status: 'published',
      mode: 'direct-api',
    };
  } catch (err: any) {
    console.error('❌ [TwitterAutoPost] API execution error:', err);

    await TwitterPostLog.create({
      topic,
      track,
      tweets,
      isThread: tweets.length > 1,
      source,
      status: 'failed',
      error: err.message || 'API dispatch error',
    });

    return {
      success: false,
      topic,
      tweets,
      isThread: tweets.length > 1,
      status: 'failed',
      error: err.message,
      mode: 'direct-api',
    };
  }
}
