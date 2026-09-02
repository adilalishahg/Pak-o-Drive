'use client';

import React from 'react';
import { QUICK_ACTIONS } from '@/hooks/useStoreChatBot';

export interface ChatSuggestionsProps {
  onSelectAction: (query: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSelectAction }) => {
  return (
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
          onClick={() => onSelectAction(action.query)}
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
  );
};
