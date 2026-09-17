'use client';

import { useScrollToTopOnMount } from '@/hooks/useScrollToTopOnMount';

/**
 * Presentational component to mount on async / loading / product pages
 * to ensure instant scroll to top with 0 footer flash.
 */
export function ScrollToTopOnMount() {
  useScrollToTopOnMount();
  return null;
}
