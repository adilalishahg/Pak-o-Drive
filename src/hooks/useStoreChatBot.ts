'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChatProduct, ChatMessage } from '@/types';
export type { ChatProduct, ChatMessage };



const STORAGE_KEY = 'pakodrive_chat_history_v1';
const SESSION_ID_KEY = 'pakodrive_chat_session_id';

const INITIAL_GREETING: ChatMessage = {
  id: 'welcome_1',
  sender: 'bot',
  text:
    'وعلیکم السلام! *Pak-o-Drive Support* mein khush-amdeed 🛒✨\n\n' +
    'Main Ali hoon, aapka personal automotive sales & support assistant. Main aapki kia madad kar sakta hoon?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'welcome',
};

export const QUICK_ACTIONS = [
  { id: 'track', label: '📦 Track My Order', query: 'Mera order status kya hai?' },
  { id: 'payment', label: '💳 Payment Accounts', query: 'JazzCash / Bank Details' },
  { id: 'returns', label: '🛡️ 7-Day Warranty', query: 'Return aur replacement policy kya hai?' },
  { id: 'deals', label: '🔥 Top Trending Deals', query: 'Top trending car accessories dikhayein' },
  { id: 'agent', label: '👨‍💼 Human Agent', query: 'Mujhe human agent se live baat karni hai' },
];

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

    const badgeTimer = setTimeout(() => {
      setShowPromptBadge(true);
    }, 4000);

    return () => clearTimeout(badgeTimer);
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
              const toAdd: ChatMessage[] = [];

              for (const ag of incomingAgentMsgs) {
                if (!existingIds.has(ag.id)) {
                  toAdd.push({
                    id: ag.id,
                    sender: 'agent',
                    text: ag.text,
                    timestamp: ag.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    source: 'agent',
                  });
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

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
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

  const sendMessage = async (overrideText?: string) => {
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
        id: 'bot_' + Date.now(),
        sender: data.source === 'agent' ? 'agent' : 'bot',
        text: data.reply || 'Jee bilkul, main aapki mazeed kia madad kar sakta hoon?',
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
        text: 'Aapka message receive ho gaya hai. Mazeed fori rabtay ke liye aap WhatsApp button par click karke direct hum se rabta kar sakte hain.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fallback',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

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
    messagesEndRef,
    isProductPage,
    whatsappNumber,
    openWhatsAppDirect,
    isAgentLive,
    shortCode,
  };
}
