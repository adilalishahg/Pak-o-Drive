'use client';

import React, { useState, useEffect } from 'react';
import { logInteraction } from './AnalyticsTracker';

export const WhatsAppSupport: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hovered, setHovered] = useState(false);
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567';

  useEffect(() => {
    // Show tooltip after 3 seconds to prompt interaction
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleChat = () => {
    // Track WhatsApp support button click
    logInteraction('whatsapp_click', window.location.pathname);

    const text = encodeURIComponent('Hi Pakodrive, I have an inquiry about your products.');
    window.open(`https://wa.me/${number.replace('+', '')}?text=${text}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      {/* Tooltip bubble */}
      {showTooltip && (
        <div
          style={{
            background: '#ffffff',
            color: '#1a202c',
            fontSize: '13px',
            fontWeight: 600,
            padding: '10px 16px',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            whiteSpace: 'nowrap',
            animation: 'waBounce 1.5s ease infinite',
          }}
        >
          <span>💬 Need help? Chat with us!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#a0aec0',
              fontSize: '13px',
              fontWeight: 700,
              padding: '0 2px',
              lineHeight: 1,
            }}
            aria-label="Close tooltip"
          >
            ✕
          </button>
          {/* Arrow pointing down-right */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '22px',
              width: '16px',
              height: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderTop: 'none',
              borderLeft: 'none',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* WhatsApp circular button */}
      <button
        onClick={handleChat}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Chat on WhatsApp"
        style={{
          background: hovered ? '#20ba56' : '#25D366',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: hovered
            ? '0 8px 32px rgba(37,211,102,0.55)'
            : '0 4px 20px rgba(37,211,102,0.4)',
          transform: hovered ? 'scale(1.13)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          outline: 'none',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.98.953c-5.437 0-9.865 4.371-9.87 9.8a9.697 9.697 0 0 0 1.493 5.048l-.98 3.578 3.704-.962zm11.233-6.195c-.3-.15-1.771-.865-2.046-.964-.274-.1-.474-.15-.674.15-.2.3-.772.964-.947 1.162-.175.2-.35.226-.65.076-.3-.15-1.263-.46-2.405-1.466-.89-.785-1.49-1.754-1.665-2.053-.175-.3-.018-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.3.3-.5.1-.2.05-.375-.025-.524-.075-.15-.674-1.609-.924-2.203-.244-.579-.493-.5-.674-.51-.175-.007-.375-.008-.574-.008-.2 0-.524.075-.798.374-.275.3-1.047 1.012-1.047 2.47 0 1.458 1.073 2.865 1.222 3.064.15.2 2.112 3.187 5.116 4.466.714.304 1.272.486 1.707.623.718.226 1.37.194 1.885.118.574-.085 1.771-.715 2.021-1.408.25-.694.25-1.288.175-1.408-.075-.12-.274-.195-.574-.346z" />
        </svg>
      </button>

      {/* Bounce keyframe injected as a style tag */}
      <style>{`
        @keyframes waBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
