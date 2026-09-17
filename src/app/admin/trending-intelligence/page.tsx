'use client';

import React, { useState } from 'react';
import { useTrendingIntelligence } from '@/hooks/useTrendingIntelligence';
import { useAdminLinkedInPost } from '@/hooks/useAdminLinkedInPost';
import { AdminLinkedInPostModal } from '@/components/admin/social/AdminLinkedInPostModal';
import {
  TrendsHeader,
  TrendsInsightBanner,
  TrendsFilterBar,
  TrendCard,
  TrendDetailModal,
} from '@/components/admin/trending';
import styles from '@/components/admin/trending/trends.module.css';

export default function TrendingIntelligencePage() {
  const linkedInHook = useAdminLinkedInPost();
  const {
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
  } = useTrendingIntelligence();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className={styles.trendsLabContainer}>
      {/* Top Header */}
      <TrendsHeader
        limit={limit}
        onUpdateLimit={updateLimit}
        isUpdatingLimit={isUpdatingLimit}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchIntelligence(true)}
        onDownloadCSV={downloadCSV}
        onDownloadBrief={downloadCreativeBrief}
        hasReport={Boolean(report)}
        isSendingWhatsApp={isSendingWhatsApp}
        onSendWhatsApp={sendToWhatsApp}
        onOpenLinkedIn={() => linkedInHook.setIsOpen(true)}
      />

      {/* Market Insight & WhatsApp Alert Banner */}
      <TrendsInsightBanner
        marketSummary={report?.marketSummary}
        generatedAt={report?.generatedAt}
        whatsappStatusMsg={whatsappStatusMsg}
      />

      {/* Filters Bar */}
      <TrendsFilterBar
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        filterType={filterType}
        onSelectFilterType={setFilterType}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className={styles.trendsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.trendsSkeletonCard} />
          ))}
        </div>
      )}

      {/* Trends Grid */}
      {!isLoading && (
        <div className={styles.trendsGrid}>
          {filteredTrends.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              onSelect={setSelectedItem}
              onCopyScript={handleCopyScript}
              isCopied={copiedId === trend.id}
            />
          ))}
        </div>
      )}

      {/* Video Production Guide & Shot List Modal */}
      <TrendDetailModal
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onCopyScript={handleCopyScript}
        copiedId={copiedId}
      />

      {/* Dynamic AI LinkedIn Carousel Modal */}
      <AdminLinkedInPostModal hook={linkedInHook} />
    </div>
  );
}
