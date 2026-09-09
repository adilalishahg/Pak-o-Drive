'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TechTrack, TechTrackInfo } from '@/lib/dynamicCarouselAiEngine';

export interface LinkedInPostLogItem {
  _id: string;
  topic: string;
  track: TechTrack;
  caption: string;
  slidesCount: number;
  postId?: string;
  source: 'cron' | 'admin-manual';
  isCarousel: boolean;
  status: 'published' | 'failed';
  error?: string;
  createdAt: string;
}

export interface PublishedTopicItem {
  topic: string;
  track: string;
  createdAt: string;
  postId?: string;
}

export interface LinkedInAccountSummary {
  platform: string;
  accountName?: string;
  accountUrn: string;
  isActive: boolean;
  lastPostedAt?: string;
  postCount: number;
}

export type PostingProgress = 'idle' | 'generating' | 'rendering' | 'publishing' | 'success' | 'error';

export function useAdminLinkedInPost() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TechTrack | 'auto'>('auto');
  const [postingState, setPostingState] = useState<PostingProgress>('idle');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [lastResult, setLastResult] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<LinkedInPostLogItem[]>([]);
  const [publishedTopics, setPublishedTopics] = useState<PublishedTopicItem[]>([]);
  const [account, setAccount] = useState<LinkedInAccountSummary | null>(null);
  const [tracks, setTracks] = useState<TechTrackInfo[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchStatusAndHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/admin/social/linkedin-post');
      const data = await res.json();
      if (data.success) {
        setAccount(data.account || null);
        setTracks(data.tracks || []);
        setRecentLogs(data.recentLogs || []);
        setPublishedTopics(data.publishedTopics || []);
      }
    } catch (err) {
      console.warn('⚠️ Failed to load LinkedIn post history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndHistory();
    }
  }, [isOpen, fetchStatusAndHistory]);

  const triggerDynamicPost = useCallback(async () => {
    if (postingState !== 'idle' && postingState !== 'success' && postingState !== 'error') return;

    setPostingState('generating');
    setProgressMessage('🤖 AI is discovering latest trend and generating 6-7 slide carousel deck...');
    setLastResult(null);

    // Simulate progress milestones to give clear visual feedback
    const timer1 = setTimeout(() => {
      setProgressMessage('🎨 Generating 3D dark-mode tech cover graphic...');
    }, 4000);

    const timer2 = setTimeout(() => {
      setPostingState('rendering');
      setProgressMessage('📄 Rendering Slobodan Gajić 4:5 vertical PDF document...');
    }, 8000);

    const timer3 = setTimeout(() => {
      setPostingState('publishing');
      setProgressMessage('📡 Dispatching swipeable document carousel to LinkedIn API...');
    }, 14000);

    try {
      const res = await fetch('/api/admin/social/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: selectedTrack }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await res.json();

      if (data.success) {
        setPostingState('success');
        setProgressMessage(`✓ Published successfully! Topic: "${data.topic}"`);
        setLastResult(data);
        showToast(`🚀 Published to LinkedIn: "${data.topic}"`, 'success');
        fetchStatusAndHistory();
      } else {
        setPostingState('error');
        setProgressMessage(data.error || 'Failed to publish post');
        showToast(data.error || 'Failed to post on LinkedIn', 'error');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setPostingState('error');
      setProgressMessage(err.message || 'Network communication error');
      showToast(err.message || 'Network error while posting to LinkedIn', 'error');
    }
  }, [postingState, selectedTrack, showToast, fetchStatusAndHistory]);

  const resetModal = useCallback(() => {
    setPostingState('idle');
    setProgressMessage('');
    setLastResult(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    selectedTrack,
    setSelectedTrack,
    postingState,
    progressMessage,
    lastResult,
    recentLogs,
    publishedTopics,
    account,
    tracks,
    loadingHistory,
    toast,
    triggerDynamicPost,
    resetModal,
    fetchStatusAndHistory,
  };
}
