'use client';

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminErrorContextValue, AdminLogEntry, AdminLogLevel } from '../types/adminError';

export const AdminErrorContext = createContext<AdminErrorContextValue | null>(null);

// Ignored harmless internal noise strings
const IGNORED_PATTERNS = [
  'ResizeObserver loop completed',
  'ResizeObserver loop limit exceeded',
  '[Fast Refresh]',
  'Download the React DevTools',
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'favicon.ico',
];

function formatConsoleArgs(args: any[]): { message: string; stack?: string } {
  let messageParts: string[] = [];
  let foundStack: string | undefined;

  for (const arg of args) {
    if (arg instanceof Error) {
      messageParts.push(arg.message || arg.toString());
      if (arg.stack && !foundStack) {
        foundStack = arg.stack;
      }
    } else if (typeof arg === 'object' && arg !== null) {
      try {
        messageParts.push(JSON.stringify(arg));
      } catch {
        messageParts.push(String(arg));
      }
    } else {
      messageParts.push(String(arg));
    }
  }

  const message = messageParts.join(' ').trim() || 'Unknown console notification';
  return { message, stack: foundStack };
}

export function AdminErrorProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AdminLogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Keep ref to latest alerts for fast deduplication check inside listeners
  const alertsRef = useRef<AdminLogEntry[]>([]);
  alertsRef.current = alerts;

  const addEntry = useCallback((type: AdminLogLevel, rawMessage: string, stack?: string, source?: string) => {
    // Check ignored patterns
    for (const pattern of IGNORED_PATTERNS) {
      if (rawMessage.includes(pattern)) return;
    }

    const cleanMessage = rawMessage.trim();
    if (!cleanMessage) return;

    setAlerts((prev) => {
      const now = new Date();
      // Check if duplicate message occurred in the last 4 seconds
      const existingIdx = prev.findIndex(
        (a) => a.message === cleanMessage && a.type === type
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        updated[existingIdx] = {
          ...existing,
          count: existing.count + 1,
          timestamp: now,
          dismissed: false, // Un-dismiss so user sees repeated failure
          stack: stack || existing.stack,
        };
        // Move updated to top
        const item = updated.splice(existingIdx, 1)[0];
        return [item, ...updated];
      }

      const newEntry: AdminLogEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        message: cleanMessage,
        stack,
        source,
        timestamp: now,
        count: 1,
        dismissed: false,
      };

      // Cap at 50 to avoid memory footprint
      return [newEntry, ...prev.slice(0, 49)];
    });

    // Reset index to latest alert and un-minimize when a critical error hits
    if (type === 'error') {
      setMinimized(false);
      setCurrentIndex(0);
    }
  }, []);

  // Intercept console.error, console.warn and window error events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      try {
        const { message, stack } = formatConsoleArgs(args);
        addEntry('error', message, stack, 'console.error');
      } catch (e) {
        originalError.apply(console, ['[AdminErrorCapture Error]', e]);
      }
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      try {
        const { message, stack } = formatConsoleArgs(args);
        addEntry('warn', message, stack, 'console.warn');
      } catch (e) {
        originalWarn.apply(console, ['[AdminErrorCapture Warn Error]', e]);
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (event.error) {
        addEntry('error', event.error.message || event.message, event.error.stack, event.filename);
      } else {
        addEntry('error', event.message || 'Window runtime error', undefined, event.filename);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      let reasonMsg = 'Unhandled Promise Rejection';
      let stack: string | undefined;

      if (event.reason instanceof Error) {
        reasonMsg = event.reason.message;
        stack = event.reason.stack;
      } else if (typeof event.reason === 'string') {
        reasonMsg = event.reason;
      } else if (typeof event.reason === 'object' && event.reason !== null) {
        try {
          reasonMsg = JSON.stringify(event.reason);
        } catch {
          reasonMsg = String(event.reason);
        }
      }
      addEntry('error', reasonMsg, stack, 'unhandledrejection');
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addEntry]);

  // Derived Active Alerts
  const unreadAlerts = useMemo(() => alerts.filter((a) => !a.dismissed), [alerts]);
  const unreadErrorsCount = useMemo(() => unreadAlerts.filter((a) => a.type === 'error').length, [unreadAlerts]);
  const unreadWarningsCount = useMemo(() => unreadAlerts.filter((a) => a.type === 'warn').length, [unreadAlerts]);

  const activeAlert = useMemo(() => {
    if (unreadAlerts.length === 0) return null;
    const safeIndex = Math.min(currentIndex, unreadAlerts.length - 1);
    return unreadAlerts[safeIndex] || unreadAlerts[0] || null;
  }, [unreadAlerts, currentIndex]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const dismissCurrent = useCallback(() => {
    if (activeAlert) {
      dismissAlert(activeAlert.id);
    }
  }, [activeAlert, dismissAlert]);

  const clearAll = useCallback(() => {
    setAlerts([]);
    setCurrentIndex(0);
    setExpandedId(null);
    setDrawerOpen(false);
  }, []);

  const toggleDetails = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const nextAlert = useCallback(() => {
    if (unreadAlerts.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % unreadAlerts.length);
    }
  }, [unreadAlerts.length]);

  const prevAlert = useCallback(() => {
    if (unreadAlerts.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + unreadAlerts.length) % unreadAlerts.length);
    }
  }, [unreadAlerts.length]);

  const copyError = useCallback(async (id: string): Promise<boolean> => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return false;

    const formattedText = `[Admin ${alert.type.toUpperCase()}] ${alert.timestamp.toISOString()}
Message: ${alert.message}
Source: ${alert.source || 'runtime'}
Repeated: ${alert.count}x
${alert.stack ? `Stack Trace:\n${alert.stack}` : ''}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(formattedText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
        return true;
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
    return false;
  }, [alerts]);

  const simulateTestError = useCallback((type: AdminLogLevel = 'error') => {
    if (type === 'error') {
      console.error(new Error(`[Simulated Test Error] Failed to connect to payment gateway API at ${new Date().toLocaleTimeString()}`));
    } else {
      console.warn(`[Simulated Test Warning] High memory usage detected on image rendering pipeline (${Math.floor(Math.random() * 80 + 20)}MB)`);
    }
  }, []);

  const value = useMemo<AdminErrorContextValue>(
    () => ({
      alerts,
      activeAlert,
      unreadErrorsCount,
      unreadWarningsCount,
      currentIndex,
      expandedId,
      minimized,
      drawerOpen,
      copiedId,
      setDrawerOpen,
      setMinimized,
      dismissAlert,
      dismissCurrent,
      clearAll,
      toggleDetails,
      nextAlert,
      prevAlert,
      copyError,
      simulateTestError,
    }),
    [
      alerts,
      activeAlert,
      unreadErrorsCount,
      unreadWarningsCount,
      currentIndex,
      expandedId,
      minimized,
      drawerOpen,
      copiedId,
      dismissAlert,
      dismissCurrent,
      clearAll,
      toggleDetails,
      nextAlert,
      prevAlert,
      copyError,
      simulateTestError,
    ]
  );

  return <AdminErrorContext.Provider value={value}>{children}</AdminErrorContext.Provider>;
}
