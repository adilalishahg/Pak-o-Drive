'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMobileSmartSearch } from '../../../hooks/useMobileSmartSearch';
import { SearchHeaderInput } from './SearchHeaderInput';
import { SearchPopularCategories } from './SearchPopularCategories';
import { SearchResultsList } from './SearchResultsList';

interface MobileSearchModalProps {
  searchState: ReturnType<typeof useMobileSmartSearch>;
}

export function MobileSearchModal({ searchState }: MobileSearchModalProps) {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    suggestions,
    categories,
    isLoading,
    hasSearched,
    getWhatsappInquiryUrl,
    handleSubmitSearch,
    handleSelectProduct,
    handleSelectCategory,
    handleClear,
  } = searchState;

  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // 1-Click: Open Live Agent Chat with prefilled warehouse stock query
  const handleOpenLiveAgentChat = () => {
    inputRef.current?.blur();
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pakodrive:open-chat', {
          detail: { query: query.trim() },
        })
      );
    }
  };

  // When user clicks the Search button or presses Enter
  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    inputRef.current?.blur();

    const q = query.trim();
    if (!q) return;

    if (suggestions.length === 0) {
      handleOpenLiveAgentChat();
      return;
    }

    handleSubmitSearch(e);
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Search Header Bar */}
      <SearchHeaderInput
        query={query}
        setQuery={setQuery}
        isLoading={isLoading}
        handleClear={handleClear}
        handleExecuteSearch={handleExecuteSearch}
        setIsOpen={setIsOpen}
        inputRef={inputRef}
        suggestionsCount={suggestions.length}
      />

      {/* Scrollable Body Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 14px',
          background: '#f8fafc',
        }}
      >
        {/* State A: EMPTY QUERY — Popular Searches & Help */}
        {!query.trim() && (
          <SearchPopularCategories
            setQuery={setQuery}
            handleOpenLiveAgentChat={handleOpenLiveAgentChat}
          />
        )}

        {/* State B & C: SEARCH RESULTS OR ZERO RESULTS WAREHOUSE CARD */}
        <SearchResultsList
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          categories={categories}
          isLoading={isLoading}
          hasSearched={hasSearched}
          handleSelectProduct={handleSelectProduct}
          handleSelectCategory={handleSelectCategory}
          handleExecuteSearch={handleExecuteSearch}
          handleOpenLiveAgentChat={handleOpenLiveAgentChat}
          getWhatsappInquiryUrl={getWhatsappInquiryUrl}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
