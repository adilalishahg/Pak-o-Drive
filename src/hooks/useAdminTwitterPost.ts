'use client';

import { useState, useCallback, useEffect } from 'react';

export interface TwitterLogItem {
  _id: string;
  topic: string;
  track: string;
  tweets: string[];
  tweetId?: string;
  tweetUrl?: string;
  source: 'cron' | 'admin-manual' | 'cli-script';
  isThread: boolean;
  status: 'published' | 'failed' | 'simulated';
  error?: string;
  createdAt: string;
}

export interface TwitterAccountSummary {
  platform: string;
  accountName?: string;
  accountUrn: string;
  isActive: boolean;
  lastPostedAt?: string;
  postCount: number;
}

export type TwitterPostingState = 'idle' | 'previewing' | 'publishing' | 'success' | 'error';

export function useAdminTwitterPost() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [postingState, setPostingState] = useState<TwitterPostingState>('idle');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [previewTweets, setPreviewTweets] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<TwitterLogItem[]>([]);
  const [account, setAccount] = useState<TwitterAccountSummary | null>(null);
  const [hasEnvKeys, setHasEnvKeys] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [forceSimulation, setForceSimulation] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchStatusAndHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/admin/social/twitter-post');
      const data = await res.json();
      if (data.success) {
        setAccount(data.account || null);
        setHasEnvKeys(Boolean(data.hasEnvKeys));
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.warn('⚠️ Failed to load Twitter post history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndHistory();
    }
  }, [isOpen, fetchStatusAndHistory]);

  const handleGeneratePreview = useCallback(async () => {
    setPostingState('previewing');
    setProgressMessage('Generating high-converting viral thread via AI...');
    try {
      const res = await fetch('/api/admin/social/twitter-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          topic: selectedTopic || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.tweets) {
        setPreviewTweets(data.data.tweets);
        if (!selectedTopic && data.data.topic) {
          setSelectedTopic(data.data.topic);
        }
        showToast('✨ AI thread generated and ready for review!', 'success');
      } else {
        showToast(data.error || 'Failed to generate thread', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error generating preview', 'error');
    } finally {
      setPostingState('idle');
      setProgressMessage('');
    }
  }, [selectedTopic, showToast]);

  const triggerTwitterPost = useCallback(async () => {
    setPostingState('publishing');
    setProgressMessage('Publishing thread to Twitter/X...');
    try {
      const res = await fetch('/api/admin/social/twitter-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic || undefined,
          forceSimulation,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLastResult(data.result);
        setPostingState('success');
        showToast(
          data.result.mode === 'simulation'
            ? '🚀 Simulated tweet created! Ready to copy or publish.'
            : '🎉 Thread successfully posted to Twitter/X!',
          'success'
        );
        fetchStatusAndHistory();
      } else {
        setPostingState('error');
        showToast(data.error || 'Failed to post tweet', 'error');
      }
    } catch (err: any) {
      setPostingState('error');
      showToast(err.message || 'Network error publishing tweet', 'error');
    }
  }, [selectedTopic, forceSimulation, showToast, fetchStatusAndHistory]);

  const resetModal = useCallback(() => {
    setPostingState('idle');
    setProgressMessage('');
    setLastResult(null);
    setPreviewTweets([]);
    setSelectedTopic('');
  }, []);

  return {
    isOpen,
    setIsOpen,
    selectedTopic,
    setSelectedTopic,
    postingState,
    progressMessage,
    previewTweets,
    lastResult,
    recentLogs,
    account,
    hasEnvKeys,
    loadingHistory,
    forceSimulation,
    setForceSimulation,
    toast,
    handleGeneratePreview,
    triggerTwitterPost,
    resetModal,
    fetchStatusAndHistory,
    showToast,
  };
}
