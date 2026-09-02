'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatMessage, ChatProduct } from '@/hooks/useStoreChatBot';
import { FormattedMessageContent } from './FormattedMessageContent';

export interface ChatMessageItemProps {
  message: ChatMessage;
  onNavigate: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onNavigate }) => {
  const isUser = message.sender === 'user';
  const isAgent = message.sender === 'agent';
  const isHandoffNotice = message.text.includes('*Live Support Agent Handoff*');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isHandoffNotice ? '96%' : '88%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {isAgent && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: '3px',
            paddingLeft: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          👨‍💼 Store Executive (WhatsApp Live)
        </span>
      )}

      {/* System Handoff Card */}
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
          <div>{message.text.replace(/👨‍💼\s*\*Live Support Agent Handoff\*\s*/g, '')}</div>
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
          <FormattedMessageContent text={message.text} isUser={isUser} onNavigate={onNavigate} />

          {/* Matched Product Preview Cards */}
          {message.products && message.products.length > 0 && (
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {message.products.map((prod: ChatProduct, idx: number) => (
                <Link
                  key={prod._id || idx}
                  href={`/product/${prod.slug || prod._id}`}
                  onClick={onNavigate}
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
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{message.timestamp}</span>
        {isUser && <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>✓✓</span>}
      </div>
    </div>
  );
};
