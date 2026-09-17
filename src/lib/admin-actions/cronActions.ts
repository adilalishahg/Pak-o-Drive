import { AdminActionResult } from '../adminActionEngine';
import {
  getCronStatusSnapshot,
  formatCronStatusMarkdown,
  triggerCronOnDemand,
} from '../cronStatusEngine';

export async function handleCronActions(
  operation: string,
  params: any,
  confirmed: boolean
): Promise<AdminActionResult | null> {
  if (operation === 'check_cron_status') {
    const snapshot = await getCronStatusSnapshot();
    const markdownReport = formatCronStatusMarkdown(snapshot);
    return {
      handled: true,
      reply: markdownReport,
      actionExecuted: {
        type: 'check_cron_status',
        description: `Verified autonomous cron status: ${snapshot.overallHealth}`,
        details: snapshot,
      },
    };
  }

  if (operation === 'trigger_cron') {
    const target = (params?.target || 'instagram') as 'instagram' | 'instagram_reel' | 'linkedin' | 'blog' | 'all';
    const targetLabel =
      target === 'instagram_reel'
        ? 'Instagram Cinematic AI Reel'
        : target === 'instagram'
        ? 'Instagram Tech Carousel'
        : target === 'linkedin'
        ? 'LinkedIn Tech Post'
        : target === 'blog'
        ? 'Autonomous AI SEO Blog'
        : 'All Autonomous Crons (Master)';

    if (!confirmed && !params?.force) {
      return {
        handled: true,
        reply: `⚠️ **Autonomous Cron Run Confirmation:**\n\nAap ne **${targetLabel}** ko on-demand chalane ki hidayat di hai:\n\n- 🎯 **Target Engine:** ${targetLabel}\n- ⚙️ **Process:** Real-time AI content generation & live social publishing\n- 🛡️ **Anti-Duplication:** Active (pehle se published topics skip honge)\n\nKia aap waqai is cron ko foran chalana chahte hain? Tasdeeq ke liye neeche **"🚀 Yes, Run Cron Now"** dabayein ya chat mein **"Yes / Chalao"** likhein.`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'trigger_cron',
          title: `Run ${targetLabel} Now`,
          description: `Generates and dispatches live content immediately for ${targetLabel}`,
          count: 1,
          payload: {
            operation: 'trigger_cron',
            params: { target, force: true },
          },
        },
      };
    }

    const result = await triggerCronOnDemand(target);
    return {
      handled: true,
      reply: result.message,
      actionExecuted: {
        type: 'trigger_cron',
        description: `Triggered ${targetLabel} on-demand`,
        details: result.details,
      },
    };
  }

  return null;
}
