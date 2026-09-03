'use client';

import React from 'react';
import { ThemeIcon } from '../common/ThemeIcon';

export interface ChatHeaderProps {
  toggleChat: () => void;
  openWhatsAppDirect: () => void;
  clearHistory: () => void;
  isAgentLive: boolean;
  shortCode: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  toggleChat,
  openWhatsAppDirect,
  clearHistory,
  isAgentLive,
  shortCode,
}) => {
  return (
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
        {/* Mobile Close (Cross) button — Prominent Red */}
        <button
          onClick={toggleChat}
          className="mobile-back-btn"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: '1.5px solid #f87171',
            color: '#ffffff',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(220, 38, 38, 0.45)',
          }}
          aria-label="Close Chat"
          title="Close Chat"
        >
          <ThemeIcon name="times" style={{ fontSize: '14px', color: '#ffffff' }} />
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
          onClick={openWhatsAppDirect}
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

        {/* Close Button (Desktop Only) — Red Badge */}
        <button
          onClick={toggleChat}
          className="desktop-close-btn"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: '1px solid #f87171',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
            transition: 'all 0.15s ease',
          }}
          aria-label="Close chat window"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
