'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChatProduct, ChatMessage } from '@/types';
export type { ChatProduct, ChatMessage };



const STORAGE_KEY = 'pakodrive_chat_history_v1';
const SESSION_ID_KEY = 'pakodrive_chat_session_id';
const POPOVER_DISMISSED_KEY = 'pakodrive_chat_popover_dismissed';

const INITIAL_GREETING: ChatMessage = {
  id: 'welcome_1',
  sender: 'bot',
  text:
    'Hello! Welcome to *Pak-o-Drive Support* 🛒✨\n\n' +
    "I'm Ali, your personal automotive sales & support assistant. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'welcome',
};

export const QUICK_ACTIONS = [
  { id: 'track', label: '📦 Track My Order', query: 'What is my order status?' },
  { id: 'payment', label: '💳 Payment Accounts', query: 'JazzCash / EasyPaisa / Bank Transfer details' },
  { id: 'returns', label: '🛡️ 7-Day Warranty', query: 'What is your return and replacement policy?' },
  { id: 'deals', label: '🔥 Top Trending Deals', query: 'Show me top trending car accessories' },
  { id: 'agent', label: '👨‍💼 Human Agent', query: 'I want to speak with a human support agent' },
];

import { isBlogPath } from '@/lib/constants';

export function useStoreChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [showPromptBadge, setShowPromptBadge] = useState(false);
  const [isAgentLive, setIsAgentLive] = useState(false);
  const [shortCode, setShortCode] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const isProductPage = pathname?.startsWith('/product/');
  const isBlogPage = isBlogPath(pathname);

  // Session ID generator
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return 'session_default';
    let sId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sId) {
      sId = 'web_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem(SESSION_ID_KEY, sId);
    }
    return sId;
  }, []);

  // Hydration safe mount
  useEffect(() => {
    if (isBlogPage) return;
    setIsMounted(true);

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch { }

    const sId = getSessionId();
    setShortCode('W' + sId.slice(-4).toUpperCase());

    const isDismissed = typeof window !== 'undefined' && localStorage.getItem(POPOVER_DISMISSED_KEY) === 'true';

    let badgeTimer: NodeJS.Timeout | null = null;
    if (!isDismissed) {
      badgeTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && localStorage.getItem(POPOVER_DISMISSED_KEY) !== 'true') {
          setShowPromptBadge(true);
        }
      }, 4000);
    }

    return () => {
      if (badgeTimer) clearTimeout(badgeTimer);
    };
  }, [getSessionId]);

  // Save to sessionStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { }
  }, [messages, isMounted]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setShowPromptBadge(false);
    }
  }, [isOpen, messages, scrollToBottom]);

  // 🔄 Real-time polling for live agent WhatsApp replies
  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const sId = getSessionId();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/sync?sessionId=${encodeURIComponent(sId)}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.messages)) {
          if (data.isAgentLive) setIsAgentLive(true);
          if (data.shortCode) setShortCode(data.shortCode);

          // Check if there are any new agent messages from WhatsApp
          const incomingAgentMsgs = data.messages.filter((m: any) => m.sender === 'agent');
          if (incomingAgentMsgs.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const existingTexts = new Set(prev.map((p) => (p.text || '').trim()));
              const toAdd: ChatMessage[] = [];

              for (const ag of incomingAgentMsgs) {
                const isDuplicate =
                  existingIds.has(ag.id) ||
                  existingTexts.has((ag.text || '').trim());

                if (!isDuplicate) {
                  toAdd.push({
                    id: ag.id,
                    sender: 'agent',
                    text: ag.text,
                    timestamp: ag.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    source: 'agent',
                  });
                  existingIds.add(ag.id);
                  existingTexts.add((ag.text || '').trim());
                }
              }

              if (toAdd.length > 0) {
                return [...prev, ...toAdd];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // Silent poll fail
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, isMounted, getSessionId]);

  const dismissPromptBadge = useCallback(() => {
    setShowPromptBadge(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(POPOVER_DISMISSED_KEY, 'true');
      } catch {}
    }
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        setShowPromptBadge(false);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(POPOVER_DISMISSED_KEY, 'true');
          } catch {}
        }
      }
      return next;
    });
  }, []);

  const openWhatsAppDirect = useCallback(
    (customText?: string) => {
      const text = encodeURIComponent(
        customText || `Hi Pak-o-Drive, I need assistance with my inquiry (Session: #${shortCode || 'NEW'}).`
      );
      const cleanNum = whatsappNumber.replace(/\+/g, '');
      window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
    },
    [whatsappNumber, shortCode]
  );

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const textToSend = (overrideText || inputText).trim();
      if (!textToSend || isTyping) return;

      const userMsg: ChatMessage = {
        id: 'usr_' + Date.now(),
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!overrideText) setInputText('');
      setIsTyping(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            sessionId: getSessionId(),
          }),
        });

        const data = await res.json();

        if (data.source === 'agent') {
          setIsAgentLive(true);
        }
        if (data.shortCode) {
          setShortCode(data.shortCode);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        const botReply: ChatMessage = {
          id: data.messageId || ('bot_' + Date.now()),
          sender: data.source === 'agent' ? 'agent' : 'bot',
          text: data.reply || 'Sure! How else may I assist you today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
          products: data.products,
        };

        setMessages((prev) => [...prev, botReply]);

        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
      } catch (err) {
        console.error('[ChatWidget] Send message error:', err);
        const fallbackReply: ChatMessage = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Your message has been received. For immediate assistance, you can also connect with our live team directly via WhatsApp.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'fallback',
        };
        setMessages((prev) => [...prev, fallbackReply]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, isTyping, getSessionId, isOpen]
  );

  const lastTriggeredQueryRef = useRef<{ query: string; timestamp: number }>({ query: '', timestamp: 0 });

  // 📡 Global trigger listener to open chat with prefilled warehouse query
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCustomOpenChat = (event: any) => {
      setIsOpen(true);
      setShowPromptBadge(false);
      const queryItem = (event.detail?.query || '').trim();
      if (queryItem) {
        const now = Date.now();
        // Prevent duplicate trigger within 3 seconds
        if (
          now - lastTriggeredQueryRef.current.timestamp < 3000 &&
          lastTriggeredQueryRef.current.query.toLowerCase() === queryItem.toLowerCase()
        ) {
          return;
        }
        lastTriggeredQueryRef.current = { query: queryItem, timestamp: now };

        setTimeout(() => {
          sendMessage(`Hello! I could not find "${queryItem}" on the website. Could you please check your warehouse stock for this item?`);
        }, 300);
      }
    };

    window.addEventListener('pakodrive:open-chat', handleCustomOpenChat);
    return () => {
      window.removeEventListener('pakodrive:open-chat', handleCustomOpenChat);
    };
  }, [sendMessage]);

  const handleQuickAction = (queryText: string) => {
    sendMessage(queryText);
  };

  const clearHistory = () => {
    setMessages([INITIAL_GREETING]);
    setIsAgentLive(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { }
  };

  return {
    isOpen,
    setIsOpen,
    toggleChat,
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    handleQuickAction,
    clearHistory,
    unreadCount,
    isMounted,
    showPromptBadge,
    setShowPromptBadge,
    dismissPromptBadge,
    messagesEndRef,
    isProductPage,
    whatsappNumber,
    openWhatsAppDirect,
    isAgentLive,
    shortCode,
  };
}
