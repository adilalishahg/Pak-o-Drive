import dbConnect from './mongodb';
import InstagramPostLog from '../models/InstagramPostLog';
import LinkedInPostLog from '../models/LinkedInPostLog';
import BlogPost from '../models/BlogPost';
import { executeAutoInstagramPost } from './instagramAutoPostService';
import { executeAutoLinkedInPost } from './socialAutoPostService';
import { executeAutoBlogPost } from './autoBlogService';

export interface CronChannelStatus {
  name: string;
  key: 'instagram' | 'instagram_reel' | 'linkedin' | 'blog';
  status: 'healthy' | 'error' | 'idle';
  lastRunDate: Date | null;
  lastRunFormatted: string;
  lastTopicOrTitle: string;
  postIdOrSlug?: string;
  permalink?: string;
  lastError?: string;
  scheduleDescription: string;
  nextScheduledSlot: string;
}

export interface CronSystemSnapshot {
  timestamp: string;
  overallHealth: '🟢 All Crons Operational' | '🟡 Attention Needed' | '🔴 Errors Detected';
  instagram: CronChannelStatus;
  reel: CronChannelStatus;
  linkedin: CronChannelStatus;
  blog: CronChannelStatus;
  recentIssuesCount: number;
}

/**
 * Format date in Asia/Karachi (PKT, UTC+5)
 */
export function formatPktDate(date?: Date | null): string {
  if (!date) return 'No recorded run yet';
  return new Date(date).toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Computes next scheduled slot in PKT for 10:00 AM & 07:00 PM cron
 */
function getNextSocialSlot(): string {
  const now = new Date();
  // PKT hours (UTC + 5)
  const pktHours = (now.getUTCHours() + 5) % 24;
  if (pktHours < 10) return 'Today at 10:00 AM PKT';
  if (pktHours < 19) return 'Today at 07:00 PM PKT';
  return 'Tomorrow at 10:00 AM PKT';
}

/**
 * Computes next scheduled slot in PKT for 08:30 AM & 04:30 PM cron
 */
function getNextBlogSlot(): string {
  const now = new Date();
  const pktHours = (now.getUTCHours() + 5) % 24;
  const pktMins = now.getUTCMinutes();
  const totalMins = pktHours * 60 + pktMins;
  if (totalMins < 8 * 60 + 30) return 'Today at 08:30 AM PKT';
  if (totalMins < 16 * 60 + 30) return 'Today at 04:30 PM PKT';
  return 'Tomorrow at 08:30 AM PKT';
}

/**
 * Comprehensive Real-time Snapshot of all Autonomous Crons
 */
export async function getCronStatusSnapshot(): Promise<CronSystemSnapshot> {
  await dbConnect();

  const [igLogs, reelLogs, liLogs, blogs] = await Promise.all([
    InstagramPostLog.find({ mediaType: { $ne: 'REEL' } }).sort({ createdAt: -1 }).limit(3).lean().catch(() => []),
    InstagramPostLog.find({ mediaType: 'REEL' }).sort({ createdAt: -1 }).limit(3).lean().catch(() => []),
    LinkedInPostLog.find().sort({ createdAt: -1 }).limit(3).lean().catch(() => []),
    BlogPost.find().sort({ createdAt: -1 }).limit(3).select('title slug createdAt views isPublished category').lean().catch(() => []),
  ]);

  const latestIg: any = igLogs[0] || null;
  const latestReel: any = reelLogs[0] || null;
  const latestLi: any = liLogs[0] || null;
  const latestBlog: any = blogs[0] || null;

  const igFailed = igLogs.some((l: any) => l.status === 'failed');
  const reelFailed = reelLogs.some((l: any) => l.status === 'failed');
  const liFailed = liLogs.some((l: any) => l.status === 'failed');

  let issuesCount = 0;
  if (igFailed) issuesCount++;
  if (reelFailed) issuesCount++;
  if (liFailed) issuesCount++;

  const instagram: CronChannelStatus = {
    name: 'Instagram Tech Carousel Auto-Post',
    key: 'instagram',
    status: latestIg?.status === 'published' ? 'healthy' : latestIg?.status === 'failed' ? 'error' : 'idle',
    lastRunDate: latestIg?.createdAt || null,
    lastRunFormatted: formatPktDate(latestIg?.createdAt),
    lastTopicOrTitle: latestIg?.topic || 'N/A',
    postIdOrSlug: latestIg?.postId || undefined,
    permalink: latestIg?.permalink || undefined,
    lastError: latestIg?.status === 'failed' ? latestIg?.error : undefined,
    scheduleDescription: 'Daily 2x: 10:00 AM PKT & 07:00 PM PKT (GitHub Actions Cron)',
    nextScheduledSlot: getNextSocialSlot(),
  };

  const reel: CronChannelStatus = {
    name: 'Instagram Cinematic AI Reel Auto-Post',
    key: 'instagram_reel',
    status: latestReel?.status === 'published' ? 'healthy' : latestReel?.status === 'failed' ? 'error' : 'idle',
    lastRunDate: latestReel?.createdAt || null,
    lastRunFormatted: formatPktDate(latestReel?.createdAt),
    lastTopicOrTitle: latestReel?.topic || 'N/A',
    postIdOrSlug: latestReel?.postId || undefined,
    permalink: latestReel?.permalink || undefined,
    lastError: latestReel?.status === 'failed' ? latestReel?.error : undefined,
    scheduleDescription: 'Daily 1x: 06:00 PM PKT (GitHub Actions Cron)',
    nextScheduledSlot: 'Today at 06:00 PM PKT',
  };

  const linkedin: CronChannelStatus = {
    name: 'LinkedIn Technical Carousel Auto-Post',
    key: 'linkedin',
    status: latestLi?.status === 'published' ? 'healthy' : latestLi?.status === 'failed' ? 'error' : 'idle',
    lastRunDate: latestLi?.createdAt || null,
    lastRunFormatted: formatPktDate(latestLi?.createdAt),
    lastTopicOrTitle: latestLi?.topic || 'N/A',
    postIdOrSlug: latestLi?.postId || undefined,
    permalink: undefined,
    lastError: latestLi?.status === 'failed' ? latestLi?.error : undefined,
    scheduleDescription: 'Daily 2x: 10:00 AM PKT & 07:00 PM PKT (GitHub Actions Cron)',
    nextScheduledSlot: getNextSocialSlot(),
  };

  const blog: CronChannelStatus = {
    name: 'Autonomous AI Auto-Blogger',
    key: 'blog',
    status: latestBlog ? 'healthy' : 'idle',
    lastRunDate: latestBlog?.createdAt || null,
    lastRunFormatted: formatPktDate(latestBlog?.createdAt),
    lastTopicOrTitle: latestBlog?.title || 'N/A',
    postIdOrSlug: latestBlog?.slug ? `/blogs/${latestBlog.slug}` : undefined,
    permalink: latestBlog?.slug ? `/blogs/${latestBlog.slug}` : undefined,
    scheduleDescription: 'Daily 2x: 08:30 AM PKT & 04:30 PM PKT (GitHub Actions Cron)',
    nextScheduledSlot: getNextBlogSlot(),
  };

  const overallHealth =
    issuesCount === 0 && (latestIg || latestReel) && latestLi
      ? '🟢 All Crons Operational'
      : issuesCount > 0
      ? '🟡 Attention Needed'
      : '🔴 Errors Detected';

  return {
    timestamp: formatPktDate(new Date()),
    overallHealth,
    instagram,
    reel,
    linkedin,
    blog,
    recentIssuesCount: issuesCount,
  };
}

/**
 * Formats a rich executive Markdown report for the Admin AI Copilot
 */
export function formatCronStatusMarkdown(snapshot: CronSystemSnapshot): string {
  const { instagram, reel, linkedin, blog, overallHealth } = snapshot;

  const igBadge = instagram.status === 'healthy' ? '🟢 Published' : instagram.status === 'error' ? '🔴 Failed' : '⚪ Idle';
  const reelBadge = reel.status === 'healthy' ? '🟢 Published' : reel.status === 'error' ? '🔴 Failed' : '⚪ Idle';
  const liBadge = linkedin.status === 'healthy' ? '🟢 Published' : linkedin.status === 'error' ? '🔴 Failed' : '⚪ Idle';
  const blogBadge = blog.status === 'healthy' ? '🟢 Active' : '⚪ Idle';

  return `🤖 **Pak-o-Drive Autonomous Cron & Social Dispatch Live Monitor**
**System Health:** ${overallHealth} • *(Checked: ${snapshot.timestamp})*

---

### 📱 1. Instagram Tech Carousel Engine
- **Status:** ${igBadge}
- **Last Published Topic:** *"${instagram.lastTopicOrTitle}"*
- **Last Run Time:** \`${instagram.lastRunFormatted}\`
${instagram.postIdOrSlug ? `- **Post ID:** \`${instagram.postIdOrSlug}\`` : ''}
${instagram.permalink ? `- **Live Post Link:** [View Instagram Carousel](${instagram.permalink})` : ''}
- **Next Scheduled Slot:** **${instagram.nextScheduledSlot}**
- **Schedule:** ${instagram.scheduleDescription}
${instagram.lastError ? `⚠️ **Diagnostic Alert:** Last failure error: \`${instagram.lastError}\`` : ''}

---

### 🎬 2. Instagram Cinematic AI Reel Engine
- **Status:** ${reelBadge}
- **Last Published Reel:** *"${reel.lastTopicOrTitle}"*
- **Last Run Time:** \`${reel.lastRunFormatted}\`
${reel.postIdOrSlug ? `- **Post ID:** \`${reel.postIdOrSlug}\`` : ''}
${reel.permalink ? `- **Live Reel Link:** [View Instagram Reel](${reel.permalink})` : ''}
- **Next Scheduled Slot:** **${reel.nextScheduledSlot}**
- **Schedule:** ${reel.scheduleDescription}
${reel.lastError ? `⚠️ **Diagnostic Alert:** Last failure error: \`${reel.lastError}\`` : ''}

---

### 💼 3. LinkedIn Autonomous Technical Carousel Engine
- **Status:** ${liBadge}
- **Last Published Topic:** *"${linkedin.lastTopicOrTitle}"*
- **Last Run Time:** \`${linkedin.lastRunFormatted}\`
${linkedin.postIdOrSlug ? `- **Post ID / URN:** \`${linkedin.postIdOrSlug}\`` : ''}
- **Next Scheduled Slot:** **${linkedin.nextScheduledSlot}**
- **Schedule:** ${linkedin.scheduleDescription}
${linkedin.lastError ? `⚠️ **Diagnostic Alert:** Last failure error: \`${linkedin.lastError}\`` : ''}

---

### ✍️ 4. Autonomous AI Auto-Blogger Engine
- **Status:** ${blogBadge}
- **Last Published Article:** *"${blog.lastTopicOrTitle}"*
- **Last Run Time:** \`${blog.lastRunFormatted}\`
${blog.postIdOrSlug ? `- **Live Article URL:** [Read Blog Article](${blog.postIdOrSlug})` : ''}
- **Next Scheduled Slot:** **${blog.nextScheduledSlot}**
- **Schedule:** ${blog.scheduleDescription}

---

⚡ **1-Click On-Demand Actions:**
Aap kisi bhi waqt chat me kahain tou AI Agent foran trigger kar dega:
- *"Instagram reel chalao"* ➔ Foran cinematic AI reel generate & post karega
- *"Instagram cron chalao"* ➔ Foran 5-slide carousel publish karega
- *"LinkedIn cron chalao"* ➔ Foran technical tech carousel publish karega
- *"Blog cron chalao"* ➔ Foran naya SEO blog generate karega
- *"Tamam crons chalao"* ➔ Sab crons ko aik sath trigger karega`;
}

/**
 * Trigger an autonomous cron job on-demand with safe error isolation
 */
export async function triggerCronOnDemand(
  target: 'instagram' | 'instagram_reel' | 'linkedin' | 'blog' | 'all'
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    if (target === 'instagram_reel') {
      console.log('🎬 [CopilotCron] On-demand Instagram Reel trigger initiated...');
      const { executeAutoInstagramReelPost } = await import('./instagramReelPostService');
      const result = await executeAutoInstagramReelPost({ source: 'admin-manual' });
      if (!result.success) {
        return {
          success: false,
          message: `❌ **Instagram Reel Failed:** ${result.error || 'Unknown error occurred during video generation/dispatch'}`,
          details: result,
        };
      }
      return {
        success: true,
        message: `🎉 **Instagram Cinematic AI Reel Live!**\n\n- 🎬 **Tool:** "${result.toolName}"\n- ⏱️ **Duration:** ${result.durationSeconds?.toFixed(1)}s\n- 🆔 **Post ID:** \`${result.postId}\`\n${result.permalink ? `- 🌐 **Live Link:** [View on Instagram](${result.permalink})` : ''}`,
        details: result,
      };
    }

    if (target === 'instagram') {
      console.log('📱 [CopilotCron] On-demand Instagram trigger initiated...');
      const result = await executeAutoInstagramPost({ source: 'admin-manual' });
      if (!result.success) {
        return {
          success: false,
          message: `❌ **Instagram Cron Failed:** ${result.error || 'Unknown error occurred during slide generation/dispatch'}`,
          details: result,
        };
      }
      return {
        success: true,
        message: `🎉 **Instagram Carousel Post Live!**\n\n- 📌 **Topic:** "${result.topic}"\n- 🏷️ **Category:** \`${result.category}\`\n- 🆔 **Post ID:** \`${result.postId}\`\n${result.permalink ? `- 🌐 **Live Link:** [View on Instagram](${result.permalink})` : ''}`,
        details: result,
      };
    }

    if (target === 'linkedin') {
      console.log('💼 [CopilotCron] On-demand LinkedIn trigger initiated...');
      const result = await executeAutoLinkedInPost();
      if (!result.success) {
        return {
          success: false,
          message: `❌ **LinkedIn Cron Failed:** ${result.error || 'Unknown error occurred during LinkedIn post dispatch'}`,
          details: result,
        };
      }
      return {
        success: true,
        message: `🎉 **LinkedIn Technical Post Live!**\n\n- 📌 **Topic:** "${result.topic}"\n- 🆔 **Post ID:** \`${result.postId}\`\n- 📄 **Format:** ${result.isCarousel ? '8-Slide Document Carousel (4:5)' : 'Single Graphic Post'}`,
        details: result,
      };
    }

    if (target === 'blog') {
      console.log('✍️ [CopilotCron] On-demand Blog trigger initiated...');
      const result = await executeAutoBlogPost();
      if (!result.success || !result.post) {
        return {
          success: false,
          message: `❌ **Auto-Blog Failed:** ${result.error || 'Unknown error during blog generation'}`,
          details: result,
        };
      }
      return {
        success: true,
        message: `🎉 **New SEO Blog Published Live!**\n\n- 📰 **Title:** "${result.post.title}"\n- 📂 **Category:** \`${result.post.category}\`\n- 📖 **Word Count:** ${result.post.wordCount} words (${result.post.readTimeMinutes} min read)\n- 🔗 **Live Link:** [/blogs/${result.post.slug}](/blogs/${result.post.slug})`,
        details: result,
      };
    }

    if (target === 'all') {
      console.log('🚀 [CopilotCron] On-demand Master Execution initiated (all 3 crons)...');
      const results: Record<string, any> = {};

      // 1. Blog
      try {
        results.blog = await executeAutoBlogPost();
      } catch (e: any) {
        results.blog = { success: false, error: e.message };
      }

      // 2. LinkedIn
      try {
        results.linkedin = await executeAutoLinkedInPost();
      } catch (e: any) {
        results.linkedin = { success: false, error: e.message };
      }

      // 3. Instagram
      try {
        results.instagram = await executeAutoInstagramPost({ source: 'admin-manual' });
      } catch (e: any) {
        results.instagram = { success: false, error: e.message };
      }

      const anySuccess = results.blog?.success || results.linkedin?.success || results.instagram?.success;

      return {
        success: anySuccess,
        message: `🚀 **Master Cron Execution Report**\n\n` +
          `1. ✍️ **Auto-Blog:** ${results.blog?.success ? `✅ Live: "${results.blog.post?.title}"` : `❌ ${results.blog?.error || 'Failed'}`}\n` +
          `2. 💼 **LinkedIn:** ${results.linkedin?.success ? `✅ Live: "${results.linkedin.topic}"` : `❌ ${results.linkedin?.error || 'Failed'}`}\n` +
          `3. 📱 **Instagram:** ${results.instagram?.success ? `✅ Live: "${results.instagram.topic}" (${results.instagram.permalink || 'Published'})` : `❌ ${results.instagram?.error || 'Failed'}`}`,
        details: results,
      };
    }

    return { success: false, message: 'Invalid cron target specified.' };
  } catch (err: any) {
    console.error('❌ [CopilotCron] Execution exception:', err);
    return {
      success: false,
      message: `❌ **Cron Execution Error:** ${err.message || 'Fatal error occurred during execution'}`,
    };
  }
}
