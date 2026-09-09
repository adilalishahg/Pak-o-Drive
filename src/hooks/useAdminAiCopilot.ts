'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminStoreSummary } from '@/lib/adminAiEngine';
import type { AdminActionRequired } from '@/lib/adminActionEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionRequired?: AdminActionRequired;
  actionExecuted?: {
    type: string;
    description: string;
    count?: number;
    details?: any;
  };
}

export interface PromptCategory {
  category: string;
  icon: string;
  prompts: string[];
}

export const COPILOT_PROMPT_CATEGORIES: PromptCategory[] = [
  {
    category: 'Direct Store Actions & Operations',
    icon: '⚡',
    prompts: [
      'Pending orders check karo aur latest order ko Delivered mark kar do',
      'Tamam Cancelled orders database se delete kar do',
      'Naya coupon code "EID25" 25% discount create karo',
      'Car Ambient Light ka price PKR 2,499 update kar do',
      'Nayi category "Smart Dashcams" create kar do',
    ],
  },
  {
    category: 'Twin Cities (RWP/ISB) Trends',
    icon: '📍',
    prompts: [
      'Rawalpindi aur Islamabad me is season me kon si car accessories sab se ziada trending hain?',
      'Civic aur Alto ke liye Islamabad ke buyers kon se premium gadgets mangte hain?',
      'Saddar aur Sultan Ka Khoo market ke muqablay me hum konsay products achi margin pr bech sakte hain?',
      'Twin Cities ke smog aur sardi ke season me kon se car accessories ki demand barhti hai?',
    ],
  },
  {
    category: 'Store Stock & Products',
    icon: '📦',
    prompts: [
      'Mery store me kon se products ka stock khatam ya 5 se kam reh gaya hai?',
      'Mery top selling products kon se hain aur unka kitna stock bacha hai?',
      'Store par dead inventory konsi hai jo pichle 30 dino se nahi biki?',
      'Ambient lighting aur dashcam products ka current stock aur price check karo.',
    ],
  },
  {
    category: 'Live Site SEO & Ranking',
    icon: '🔍',
    prompts: [
      'Meri live website ki homepage ka SEO audit karo aur missing meta tags batao.',
      'Rawalpindi aur Islamabad ke car buyers ke liye high-intent Google keywords suggest karo.',
      'Google ranking improve karne ke liye mujhe kon se car blogs publish karne chahiye?',
      'Mery products ke conversion rate (CRO) aur WhatsApp order flow ko behtar karne ke tips do.',
    ],
  },
  {
    category: 'Orders & Sales Intelligence',
    icon: '💰',
    prompts: [
      'Mera total revenue aur pending vs delivered orders ka status kya hai?',
      'Cash on Delivery (COD) orders me courier return ratio kam karne ke liye kya strategy ho?',
      'Pichle orders me sab se ziada orders kis shehar (city) se aye hain?',
    ],
  },
  {
    category: 'Competitor Spy & Reverse Engineering',
    icon: '🕵️',
    prompts: [
      'Sehgal Motors aur Autostore.pk ke muqablay me hum car ambient light kaisay cheap aur profitable bechein?',
      'Is competitor product ka live SEO, pricing aur ad strategy analyze karo (Paste URL)',
      'PakWheels accessories par top selling car gadgets ki pricing aur shipping offer reverse engineer karo.',
      'Competitor ke active Meta (Facebook) aur TikTok viral ads kaisay check karein?',
    ],
  },
];

const DEFAULT_QUICK_PROMPTS = [
  'Store Operations & Actions ⚡',
  'Rawalpindi & Islamabad Trends 📍',
  'Low Stock Products Alert 📦',
  'Live Site SEO & Ranking Audit 🔍',
  'Top Selling Items & Revenue 💰',
  'Competitor Spy & Strategy 🕵️',
];

const STORAGE_KEY = 'pakodrive_admin_copilot_chat';

export function useAdminAiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AdminStoreSummary | null>(null);
  const [seoAudit, setSeoAudit] = useState<{ totalMissingSeo: number; sampleUnoptimizedProducts: string[] } | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<AdminActionRequired | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Load chat history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Ignore sessionStorage parsing error
    }

    // Default welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `**Assalam-o-Alaikum! Main Pak-o-Drive ka Executive AI Copilot hoon.** 🚗💼⚡\n\nAap mujh se:\n- **Direct Store Actions:** Orders ka status badalna (*"Status Delivered kar do"*), details update karna, ya orders delete karna.\n- **Products & Stock Management:** Prices update karna (*"Price 2500 kar do"*), stock check/modify karna ya coupons create karna.\n- **Twin Cities Trends:** Rawalpindi / Islamabad ke local automotive market trends.\n- **Live Site SEO & Competitor Spy:** Live rankings aur competitor reverse engineering.\n\nNeeche diye gaye **Quick Prompts** par click karein ya apna hukum type karein!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // Save to sessionStorage on message update
  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // Storage unavailable
      }
    }
  }, [messages]);

  // Fetch live store snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      setSnapshotLoading(true);
      const res = await fetch('/api/admin/ai-copilot');
      const data = await res.json();
      if (data.success && data.data) {
        setSnapshot(data.data.snapshot);
        setSeoAudit(data.data.seoAudit);
      }
    } catch (err: any) {
      console.error('Error fetching snapshot in copilot:', err);
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  // Send message with optional SEO URL or Competitor URL
  const sendMessage = useCallback(
    async (customText?: string, targetSeoUrl?: string, customCompetitorUrl?: string) => {
      const query = (customText ?? input).trim();
      if (!query || isThinking) return;

      setError(null);
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsThinking(true);

      try {
        const historyPayload = messages
          .filter((m) => m.id !== 'welcome')
          .slice(-6)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const effectiveCompetitorUrl = customCompetitorUrl ?? (competitorUrl.trim() || undefined);

        const res = await fetch('/api/admin/ai-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history: historyPayload,
            targetSeoUrl,
            competitorUrl: effectiveCompetitorUrl,
          }),
        });

        const data = await res.json();

        if (data.success && data.reply) {
          const aiMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            actionRequired: data.actionRequired,
            actionExecuted: data.actionExecuted,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);

          if (data.actionRequired) {
            setPendingAction(data.actionRequired);
          } else {
            setPendingAction(null);
          }

          if (data.actionExecuted) {
            fetchSnapshot();
          }
        } else {
          throw new Error(data.error || 'AI response error');
        }
      } catch (err: any) {
        setError(err.message || 'Kuch masla hua, baraye meherbani dubara koshish karein.');
        const fallbackMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Maazrat:** Is waqt AI service masroof hai. Chand lamhe baad dubara poochein ya internet connection check karein.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [input, isThinking, messages, competitorUrl, fetchSnapshot]
  );

  // Confirms and executes an action that required explicit admin permission
  const confirmPendingAction = useCallback(
    async (actionToConfirm?: AdminActionRequired) => {
      const act = actionToConfirm || pendingAction;
      if (!act || isThinking) return;

      setIsThinking(true);
      setPendingAction(null);

      const userConfirmMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `✅ Confirmed: ${act.title}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userConfirmMsg]);

      try {
        const res = await fetch('/api/admin/ai-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionConfirmation: act.payload,
          }),
        });

        const data = await res.json();
        if (data.success && data.reply) {
          const aiMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            actionExecuted: data.actionExecuted,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);
          fetchSnapshot();
        } else {
          throw new Error(data.error || 'Action execution failed');
        }
      } catch (err: any) {
        setError(err.message || 'Action execute karne me masla pesh aya.');
        const fallbackMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `❌ **Error:** Action mukammal nahi ho saka: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [pendingAction, isThinking, fetchSnapshot]
  );

  // Cancels pending safety action
  const cancelPendingAction = useCallback(() => {
    setPendingAction(null);
    const cancelMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `🚫 **Action Cancelled:** Deletion rok di gayi hai. Database me koi tabdeeli nahi hui.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  }, []);

  const analyzeCompetitor = useCallback(
    async (urlToAnalyze?: string) => {
      const url = (urlToAnalyze ?? competitorUrl).trim();
      if (!url) return;
      const prompt = `Is competitor URL (${url}) ka mukammal live SEO, pricing, offer breakdown aur Google ranking ki wajah reverse engineer karo. Aur Pak-o-Drive ke liye actionable strategy aur Meta/TikTok ad insights batao.`;
      await sendMessage(prompt, undefined, url);
    },
    [competitorUrl, sendMessage]
  );

  const clearChat = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setPendingAction(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `**Chat clear ho gayi hai!** Main aapki nayi queries aur database actions ke liye tayyar hoon.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    competitorUrl,
    setCompetitorUrl,
    isThinking,
    loading: isThinking,
    error,
    quickPrompts: DEFAULT_QUICK_PROMPTS,
    promptCategories: COPILOT_PROMPT_CATEGORIES,
    snapshot,
    seoAudit,
    snapshotLoading,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
    sendMessage,
    analyzeCompetitor,
    clearChat,
    fetchSnapshot,
    messagesEndRef,
  };
}
