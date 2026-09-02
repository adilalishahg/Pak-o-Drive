'use client';

import React from 'react';
import Link from 'next/link';

export interface FormattedMessageContentProps {
  text: string;
  isUser: boolean;
  onNavigate: () => void;
}

export const FormattedMessageContent: React.FC<FormattedMessageContentProps> = ({
  text,
  isUser,
  onNavigate,
}) => {
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
