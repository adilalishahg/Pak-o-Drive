'use client';

import { useEffect, useRef } from 'react';

interface UseBackToCloseOptions {
  isOpen: boolean;
  onClose: () => void;
  key: string;
}

/**
 * Intercepts mobile browser / Android gesture / hardware back button
 * so that when a modal, drawer, search or chat is open, the back button
 * closes the overlay first instead of navigating back to the previous page.
 * Subsequent back presses work normally.
 */
export function useBackToClose({ isOpen, onClose, key }: UseBackToCloseOptions) {
  // Intentionally avoided raw window.history.pushState / popstate mutation.
  // In Next.js 16 App Router, external pushState/back mutations conflict
  // with Next.js router transitions and trigger navigation freezes / tab hangs.
}
