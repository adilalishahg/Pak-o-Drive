'use client';

import React, { useEffect } from 'react';
import { useStoreChatBot } from '@/hooks/useStoreChatBot';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatSuggestions } from '@/components/chat/ChatSuggestions';
import { ChatMessageItem } from '@/components/chat/ChatMessageItem';

export const StoreChatWidget: React.FC = () => {
  const {
    isOpen,
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
    openWhatsAppDirect,
    isAgentLive,
    shortCode,
  } = useStoreChatBot();

  // Lock background scroll on mobile when chat is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isOpen && window.innerWidth <= 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div
      className={`chat-widget-root ${isOpen ? 'is-open' : ''}`}
      style={{
        position: 'fixed',
        bottom: isProductPage ? '78px' : '24px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Chat Window Container */}
      {isOpen && (
        <div
          className="chat-window-box"
          style={{
            background: '#f8fafc',
            boxShadow: '0 25px 70px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <ChatHeader
            toggleChat={toggleChat}
            openWhatsAppDirect={openWhatsAppDirect}
            clearHistory={clearHistory}
            isAgentLive={isAgentLive}
            shortCode={shortCode}
          />

          {/* Quick Action Chips Bar */}
          <ChatSuggestions onSelectAction={handleQuickAction} />

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: 0,
            }}
          >
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} onNavigate={toggleChat} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  padding: '9px 14px',
                  borderRadius: '18px 18px 18px 4px',
                  maxWidth: '120px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span className="typing-dot" style={{ animationDelay: '0s' }}>•</span>
                <span className="typing-dot" style={{ animationDelay: '0.2s' }}>•</span>
                <span className="typing-dot" style={{ animationDelay: '0.4s' }}>•</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>Typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. Input & Send Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="chat-input-form"
            style={{
              padding: '10px 14px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message, product name or Order ID..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '24px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                transition: 'border 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#10b981')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              style={{
                background: inputText.trim() && !isTyping
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isTyping ? 'pointer' : 'default',
                color: inputText.trim() && !isTyping ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: inputText.trim() && !isTyping ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
              }}
              aria-label="Send Message"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>

          {/* Bottom Security Footer */}
          <div
            style={{
              padding: '6px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#94a3b8',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              flexShrink: 0,
            }}
          >
            ⚡ Pak-o-Drive Instant Support Bot
          </div>
        </div>
      )}

      {/* 2. Floating Launcher Trigger Button */}
      <div className="chat-launcher-container" style={{ position: 'relative' }}>
        {/* Prompt Notification Bubble */}
        {showPromptBadge && !isOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '70px',
              right: '0px',
              background: '#ffffff',
              padding: '10px 14px',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              animation: 'chatBadgeBounce 3s infinite ease-in-out',
              zIndex: 99999,
              cursor: 'pointer',
            }}
            onClick={toggleChat}
          >
            <span style={{ fontSize: '16px' }}>👋</span>
            <div>
              <p
                className="leading-normal font-semibold"
                style={{ fontSize: '12.5px', color: '#0f172a', margin: 0 }}
              >
                Help chahiye? Hum hazir hain!
              </p>
              <p
                className="leading-normal"
                style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}
              >
                Order status ya koi bhi sawal poochiye
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPromptBadge(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                fontSize: '12px',
              }}
              aria-label="Dismiss tooltip"
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating Circular Launcher */}
        <button
          onClick={toggleChat}
          className="chat-launcher-btn"
          aria-label={isOpen ? 'Close Chat Widget' : 'Open Support Chat'}
          style={{
            background: isOpen
              ? '#0f172a'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '58px',
            height: '58px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(16, 185, 129, 0.45)',
            transform: 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            position: 'relative',
          }}
        >
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              <path d="M7 9h10v2H7zm0-3h10v2H7z" opacity="0.8" />
            </svg>
          )}

          {/* Unread badge count */}
          {unreadCount > 0 && !isOpen && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 6px rgba(239,68,68,0.5)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Global CSS Responsive Styling */}
      <style>{`
        @media (max-width: 640px) {
          .chat-widget-root.is-open {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            z-index: 999999 !important;
            align-items: stretch !important;
          }
          .chat-window-box {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            margin: 0 !important;
            z-index: 1000000 !important;
            animation: mobileChatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
          .mobile-back-btn {
            display: flex !important;
          }
          .desktop-close-btn {
            display: none !important;
          }
          .chat-input-form {
            padding-bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important;
          }

          .chat-widget-root.is-open .chat-launcher-container {
            display: none !important;
          }
        }

        @media (min-width: 641px) {
          .chat-window-box {
            width: 390px;
            max-width: calc(100vw - 32px);
            height: 580px;
            max-height: calc(100vh - 120px);
            border-radius: 24px;
            margin-bottom: 14px;
            animation: desktopChatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }

        @keyframes desktopChatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes mobileChatSlideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes chatBadgeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .typing-dot {
          display: inline-block;
          font-size: 16px;
          color: #10b981;
          animation: dotBlink 1.4s infinite ease-in-out both;
        }

        @keyframes dotBlink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
