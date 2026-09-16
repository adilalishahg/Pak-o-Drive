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
  const isPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stateKey = `overlay_${key}`;

    if (isOpen) {
      // Only push state once when the overlay opens
      if (!isPushedRef.current) {
        window.history.pushState(
          { ...(window.history.state || {}), [stateKey]: true },
          ''
        );
        isPushedRef.current = true;
      }

      const handlePopState = () => {
        // Popstate was triggered by user pressing mobile / hardware back button
        if (isPushedRef.current) {
          isPushedRef.current = false;
          onCloseRef.current();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If closed manually (e.g. user tapped 'X' or backdrop instead of back button),
        // revert the pushed history entry so history stack remains clean
        if (isPushedRef.current) {
          isPushedRef.current = false;
          if (window.history.state?.[stateKey]) {
            window.history.back();
          }
        }
      };
    } else {
      // If isOpen becomes false while we still have an active history entry
      if (isPushedRef.current) {
        isPushedRef.current = false;
        if (window.history.state?.[stateKey]) {
          window.history.back();
        }
      }
    }
  }, [isOpen, key]);
}
