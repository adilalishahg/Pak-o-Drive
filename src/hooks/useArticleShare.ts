'use client';

import { useState, useCallback } from 'react';

export interface UseArticleShareProps {
  title: string;
  url: string;
  text?: string;
}

export function useArticleShare({ title, url, text }: UseArticleShareProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // 1. Try Web Share API if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        return;
      } catch (err: any) {
        // If user cancelled, do not trigger error
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Could not copy link to clipboard:', e);
    }
  }, [title, url, text]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Could not copy link:', e);
    }
  }, [url]);

  return {
    copied,
    handleShare,
    handleCopyLink,
  };
}
