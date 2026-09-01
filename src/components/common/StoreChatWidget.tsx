'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStoreChatBot, QUICK_ACTIONS, ChatProduct } from '@/hooks/useStoreChatBot';

// Interactive Formatted Message Content with Next.js Client-Side Navigation
const FormattedMessageContent: React.FC<{
  text: string;
  isUser: boolean;
  onNavigate: () => void;
}> = ({ text, isUser, onNavigate }) => {

  const tokens: { type: 'text' | 'link'; value?: string; label?: string; url?: string }[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s\)]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.substring(lastIndex, match.index) });
    }

    if (match[1] && match[2]) {
      tokens.push({ type: 'link', label: match[1], url: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'link', label: match[3], url: match[3] });
    }
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.substring(lastIndex) });
  }

  return (
    <span>
      {tokens.map((tok, i) => {
        if (tok.type === 'text' && tok.value) {
          const boldParts = tok.value.split(/(\*\*[^*]+\*\*)/g);
          return (
            <span key={i}>
              {boldParts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} style={{ fontWeight: 700 }}>
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </span>
          );
        }

        if (tok.type === 'link' && tok.url) {
          const rawUrl = tok.url;
          let internalPath = '';
          try {
            const parsed = new URL(rawUrl);
            if (
              parsed.hostname.includes('pakodrive.pk') ||
              parsed.hostname.includes('localhost') ||
              parsed.hostname.includes('vercel.app')
            ) {
              internalPath = parsed.pathname + parsed.search;
            }
          } catch {
            if (rawUrl.startsWith('/')) internalPath = rawUrl;
          }

          if (internalPath) {
            const isProduct = internalPath.startsWith('/product/');
            const displayText = (tok.label || '').startsWith('http')
              ? isProduct
                ? '🛍️ View Product'
                : '🔗 Open Page'
              : tok.label || 'View Link';

            return (
              <Link
                key={i}
                href={internalPath}
                onClick={onNavigate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isUser ? '#ffffff' : '#059669',
                  background: isUser ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
                  border: isUser ? '1px solid rgba(255,255,255,0.4)' : '1px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '3px 9px',
                  margin: '2px 3px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  textDecoration: 'none',
                  verticalAlign: 'middle',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span>{displayText}</span>
                <span style={{ fontSize: '13px' }}>➔</span>
              </Link>
            );
          }

          return (
            <a
              key={i}
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isUser ? '#ffffff' : '#2563eb',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              {tok.label || rawUrl}
            </a>
          );
        }

        return null;
      })}
    </span>
  );
};

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
          <div
            className="chat-header"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              {/* Mobile Back button */}
              <button
                onClick={toggleChat}
                className="mobile-back-btn"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '17px',
                  flexShrink: 0,
                  transition: 'background 0.15s ease',
                }}
                aria-label="Back"
              >
                ←
              </button>

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  🚗
                </div>
                {/* Active Green Pulse Dot */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    width: '10px',
                    height: '10px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    border: '2px solid #0f172a',
                  }}
                />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <h3
                  className="leading-normal font-bold truncate"
                  style={{ fontSize: '14px', color: '#ffffff', margin: 0, letterSpacing: '-0.2px' }}
                >
                  Pak-o-Drive Support
                </h3>
                <p
                  className="leading-normal truncate"
                  style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}
                >
                  {isAgentLive ? (
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>🟢 Agent Live (#{shortCode})</span>
                  ) : (
                    <span style={{ color: '#34d399' }}>🟢 Online • AI 24/7</span>
                  )}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {/* WhatsApp App switch button */}
              <button
                onClick={() => openWhatsAppDirect()}
                title="Switch to WhatsApp App"
                style={{
                  background: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  borderRadius: '8px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#25d366',
                  transition: 'all 0.2s ease',
                }}
                aria-label="Open in WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.98.953c-5.437 0-9.865 4.371-9.87 9.8a9.697 9.697 0 0 0 1.493 5.048l-.98 3.578 3.704-.962zm11.233-6.195c-.3-.15-1.771-.865-2.046-.964-.274-.1-.474-.15-.674.15-.2.3-.772.964-.947 1.162-.175.2-.35.226-.65.076-.3-.15-1.263-.46-2.405-1.466-.89-.785-1.49-1.754-1.665-2.053-.175-.3-.018-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.674-1.609-.924-2.203-.244-.579-.493-.5-.674-.51-.175-.007-.375-.008-.574-.008-.2 0-.524.075-.798.374-.275.3-1.047 1.012-1.047 2.47 0 1.458 1.073 2.865 1.222 3.064.15.2 2.112 3.187 5.116 4.466.714.304 1.272.486 1.707.623.718.226 1.37.194 1.885.118.574-.085 1.771-.715 2.021-1.408.25-.694.25-1.288.175-1.408-.075-.12-.274-.195-.574-.346z" />
                </svg>
              </button>

              {/* Clear Chat */}
              <button
                onClick={clearHistory}
                title="Clear Chat History"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}
                aria-label="Clear chat"
              >
                🗑️
              </button>

              {/* Close Button (Desktop Only) */}
              <button
                onClick={toggleChat}
                className="desktop-close-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '4px 6px',
                  borderRadius: '6px',
                }}
                aria-label="Close chat window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Action Chips Bar */}

          <div
            style={{
              padding: '8px 12px',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              flexShrink: 0,
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.query)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                {action.label}
              </button>
            ))}
          </div>

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
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isAgent = msg.sender === 'agent';
              const isHandoffNotice = msg.text.includes('*Live Support Agent Handoff*');

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isHandoffNotice ? '96%' : '88%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {isAgent && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', marginBottom: '3px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      👨‍💼 Store Executive (WhatsApp Live)
                    </span>
                  )}

                  {/* System Handoff Card (Styled as modern card rather than harsh block) */}
                  {isHandoffNotice ? (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        border: '1px solid #bfdbfe',
                        color: '#1e3a8a',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.06)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px' }}>
                        <span>👨‍💼</span>
                        <span>Live Support Agent Handoff</span>
                      </div>
                      <div>{msg.text.replace(/👨‍💼\s*\*Live Support Agent Handoff\*\s*/g, '')}</div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: isUser
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : isAgent
                          ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          : '#ffffff',
                        color: isUser || isAgent ? '#ffffff' : '#0f172a',
                        padding: '10px 14px',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: '13.5px',
                        lineHeight: '1.5',
                        boxShadow: isUser || isAgent ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
                        border: !isUser && !isAgent ? '1px solid #e2e8f0' : 'none',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      <FormattedMessageContent text={msg.text} isUser={isUser} onNavigate={toggleChat} />

                      {/* Matched Product Preview Cards */}

                      {msg.products && msg.products.length > 0 && (
                        <div
                          style={{
                            marginTop: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          {msg.products.map((prod: ChatProduct, idx: number) => (
                            <Link
                              key={prod._id || idx}
                              href={`/product/${prod.slug || prod._id}`}
                              onClick={toggleChat}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.15s ease',
                              }}
                            >
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  position: 'relative',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#f1f5f9',
                                  flexShrink: 0,
                                }}
                              >
                                {prod.image ? (
                                  <Image
                                    src={prod.image}
                                    alt={prod.name}
                                    fill
                                    sizes="44px"
                                    style={{ objectFit: 'contain' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '100%',
                                      fontSize: '16px',
                                    }}
                                  >
                                    📦
                                  </div>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  className="leading-normal truncate"
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    margin: 0,
                                  }}
                                >
                                  {prod.name}
                                </p>
                                <p
                                  className="leading-normal"
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#059669',
                                    margin: 0,
                                  }}
                                >
                                  Rs. {prod.price?.toLocaleString()}
                                </p>
                              </div>
                              <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>➔</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp & checkmark */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '3px',
                      padding: '0 4px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{msg.timestamp}</span>
                    {isUser && <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>✓✓</span>}
                  </div>
                </div>
              );
            })}

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
