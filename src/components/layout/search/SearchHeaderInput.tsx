'use client';

import React from 'react';

interface SearchHeaderInputProps {
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
  handleClear: () => void;
  handleExecuteSearch: (e?: React.FormEvent) => void;
  setIsOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  suggestionsCount: number;
}

export function SearchHeaderInput({
  query,
  setQuery,
  isLoading,
  handleClear,
  handleExecuteSearch,
  setIsOpen,
  inputRef,
  suggestionsCount,
}: SearchHeaderInputProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Back to store"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <i className="fas fa-arrow-left" />
        </button>

        {/* High-Contrast Search Input Container */}
        <form
          onSubmit={handleExecuteSearch}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            border: '2px solid #ea580c',
            borderRadius: '9999px',
            padding: '0 12px',
            height: '44px',
          }}
        >
          <i
            className="fas fa-search"
            style={{ color: '#ea580c', fontSize: '15px', marginRight: '8px', flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Auto parts, accessories ya gadget likhein..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '16px', // prevents mobile iOS zoom
              color: '#0f172a',
              fontWeight: 600,
              width: '100%',
            }}
          />

          {/* Spinner or Clear Button */}
          {isLoading ? (
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
              style={{ width: '15px', height: '15px', marginLeft: '6px', flexShrink: 0 }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear text"
              style={{
                border: 'none',
                background: 'none',
                color: '#64748b',
                fontSize: '17px',
                padding: '4px',
                cursor: 'pointer',
                marginLeft: '4px',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-times-circle" />
            </button>
          ) : null}
        </form>

        {/* Submit Search Button (Orange) */}
        {query.trim() && (
          <button
            type="button"
            onClick={handleExecuteSearch}
            style={{
              height: '42px',
              padding: '0 15px',
              borderRadius: '9999px',
              border: 'none',
              background: '#ea580c',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span>{suggestionsCount === 0 && !isLoading ? 'Chat' : 'Search'}</span>
          </button>
        )}
      </div>

      {/* Typed Status Indicator */}
      {query.trim() && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            fontSize: '11.5px',
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
            <span>
              Searching for: <strong style={{ color: '#0f172a' }}>&ldquo;{query}&rdquo;</strong>
            </span>
          </div>
          {suggestionsCount > 0 && (
            <span style={{ color: '#ea580c', fontWeight: 700 }}>
              {suggestionsCount} items found
            </span>
          )}
        </div>
      )}
    </header>
  );
}
