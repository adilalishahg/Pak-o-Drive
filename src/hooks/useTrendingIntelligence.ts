'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { IntelligenceReportPayload, TrendingAdIntelligence } from '../lib/intelligenceEngine';

export function useTrendingIntelligence() {
  const [report, setReport] = useState<IntelligenceReportPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);
  const [whatsappStatusMsg, setWhatsappStatusMsg] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'All' | 'TikTok' | 'Meta' | 'Instagram'>('All');
  const [filterType, setFilterType] = useState<'all' | 'existing' | 'recommended'>('all');
  const [selectedItem, setSelectedItem] = useState<TrendingAdIntelligence | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [isUpdatingLimit, setIsUpdatingLimit] = useState<boolean>(false);

  const fetchIntelligence = useCallback(async (forceRefresh = false, customLimit?: number) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const activeLimit = customLimit || limit;
      const url = `/api/admin/trending-intelligence?refresh=${forceRefresh}&limit=${activeLimit}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        setReport(json.data);
        if (json.data.limit) {
          setLimit(json.data.limit);
        }
      }
    } catch (err) {
      console.error('[useTrendingIntelligence] Error fetching data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [limit]);

  const updateLimit = async (newLimit: number) => {
    if (newLimit <= 0 || newLimit > 100) return;
    setIsUpdatingLimit(true);
    setLimit(newLimit);
    try {
      const res = await fetch('/api/admin/trending-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_limit', limit: newLimit }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
        setWhatsappStatusMsg(`✅ Daily product limit updated to ${newLimit}!`);
      }
    } catch (err) {
      console.error('[useTrendingIntelligence] Failed to update limit:', err);
    } finally {
      setIsUpdatingLimit(false);
      setTimeout(() => setWhatsappStatusMsg(null), 4000);
    }
  };

  useEffect(() => {
    fetchIntelligence(false);
  }, []);


  // Filtered list
  const filteredTrends = useMemo(() => {
    if (!report?.topTrends) return [];
    return report.topTrends.filter((item) => {
      // Platform filter
      if (selectedPlatform !== 'All' && item.platform !== 'All' && item.platform !== selectedPlatform) {
        return false;
      }
      // Type filter
      if (filterType === 'existing' && !item.isExistingInStore) return false;
      if (filterType === 'recommended' && item.isExistingInStore) return false;

      return true;
    });
  }, [report, selectedPlatform, filterType]);

  // Dispatch to WhatsApp
  const sendToWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    setWhatsappStatusMsg(null);

    try {
      const res = await fetch('/api/admin/trending-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_whatsapp' }),
      });
      const data = await res.json();

      if (data.success) {
        setWhatsappStatusMsg(`✅ Digest sent to WhatsApp (${data.targetPhone})`);
      } else {
        setWhatsappStatusMsg(`⚠️ ${data.error || 'Could not send digest'}`);
      }
    } catch (err: any) {
      setWhatsappStatusMsg('❌ Error sending WhatsApp message');
    } finally {
      setIsSendingWhatsApp(false);
      setTimeout(() => setWhatsappStatusMsg(null), 6000);
    }
  };

  // Export to CSV
  const downloadCSV = () => {
    if (!report?.topTrends) return;

    const headers = [
      'Product Name',
      'Category',
      'Platform',
      'In Store?',
      'Demand Score',
      'Competitor Price (PKR)',
      'Est. Sourcing Cost (PKR)',
      'Suggested Price (PKR)',
      'Est. Profit/Order (PKR)',
      'Ad Hook Text',
      'Urdu Verbal Hook',
      'Competitor Ad Angle',
      'Target Keywords',
    ];

    const rows = report.topTrends.map((t) => [
      `"${(t.productName || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${t.platform}"`,
      t.isExistingInStore ? 'YES' : 'NEW RECOMMENDATION',
      t.estimatedDemandScore,
      t.competitorPricePKR,
      t.estimatedSourcingCostPKR,
      t.suggestedRetailPricePKR,
      t.estimatedProfitMarginPKR,
      `"${(t.viralHook?.textOnScreen || '').replace(/"/g, '""')}"`,
      `"${(t.viralHook?.verbalHookUrdu || '').replace(/"/g, '""')}"`,
      `"${(t.competitorAdAngle || '').replace(/"/g, '""')}"`,
      `"${(t.adTargetingKeywords || []).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pakodrive_viral_trends_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Creative Brief Markdown
  const downloadCreativeBrief = () => {
    if (!report?.topTrends) return;

    let md = `# 🔥 Pak-o-Drive Viral Ad & Video Production Creative Brief\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString('en-GB')}\n`;
    md += `**Market Summary:** ${report.marketSummary}\n\n`;
    md += `---\n\n`;

    report.topTrends.forEach((t, i) => {
      md += `## ${i + 1}. ${t.productName} [${t.platform} | Demand: ${t.estimatedDemandScore}%]\n\n`;
      md += `* **Status:** ${t.isExistingInStore ? 'In Store Inventory' : 'Recommended New Winning Product'}\n`;
      md += `* **Pricing Economics:** Competitor: Rs. ${t.competitorPricePKR.toLocaleString()} | Sourcing: Rs. ${t.estimatedSourcingCostPKR.toLocaleString()} | **Sell Price: Rs. ${t.suggestedRetailPricePKR.toLocaleString()}** | **Profit Margin: Rs. ${t.estimatedProfitMarginPKR.toLocaleString()}**\n`;
      md += `* **Ad Psychological Angle:** ${t.competitorAdAngle}\n\n`;
      md += `### 🎯 Viral Hook (0:00 - 0:03s)\n`;
      md += `* **On-Screen Text:** "${t.viralHook?.textOnScreen}"\n`;
      md += `* **Urdu Spoken Hook:** "${t.viralHook?.verbalHookUrdu}"\n`;
      md += `* **Hook Style:** ${t.viralHook?.hookStyle}\n\n`;
      md += `### 🎬 Video Production Breakdown\n`;
      md += `* **Concept Overview:** ${t.videoProductionGuide?.conceptOverview}\n`;
      md += `* **Camera Setup:** ${t.videoProductionGuide?.cameraSetup}\n`;
      md += `* **Smartphone Shooting Tips:** ${t.videoProductionGuide?.shootingTipsUrdu}\n\n`;
      md += `#### Scene-by-Scene Shot List:\n\n`;
      md += `| Time | Camera Angle | Visual Action | Voiceover Audio |\n`;
      md += `|---|---|---|---|\n`;
      (t.videoProductionGuide?.sceneBreakdown || []).forEach((s) => {
        md += `| ${s.timeSeconds} | ${s.cameraAngle} | ${s.visualShot} | ${s.audioVoiceover} |\n`;
      });
      md += `\n### 🎙️ Ready Voiceover Script (Roman Urdu)\n`;
      md += `> "${t.voiceoverScriptUrdu}"\n\n`;
      md += `### 🎯 Meta & TikTok Targeting Keywords\n`;
      md += `${(t.adTargetingKeywords || []).map((k) => `\`${k}\``).join(' • ')}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pakodrive_creative_brief_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    report,
    isLoading,
    isRefreshing,
    isSendingWhatsApp,
    whatsappStatusMsg,
    selectedPlatform,
    setSelectedPlatform,
    filterType,
    setFilterType,
    selectedItem,
    setSelectedItem,
    fetchIntelligence,
    sendToWhatsApp,
    downloadCSV,
    downloadCreativeBrief,
    filteredTrends,
    limit,
    updateLimit,
    isUpdatingLimit,
  };
}

