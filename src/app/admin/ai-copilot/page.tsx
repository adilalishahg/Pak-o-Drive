'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAdminAiCopilot } from '@/hooks/useAdminAiCopilot';
import { AiCopilotHeader } from '@/components/admin/ai-copilot/AiCopilotHeader';
import { AiCopilotMessageList } from '@/components/admin/ai-copilot/AiCopilotMessageList';
import { AiCopilotInputBar } from '@/components/admin/ai-copilot/AiCopilotInputBar';

export default function AdminAiCopilotPage() {
  const {
    messages,
    loading,
    error,
    snapshot,
    seoAudit,
    snapshotLoading,
    competitorUrl,
    setCompetitorUrl,
    analyzeCompetitor,
    sendMessage,
    clearChat,
    fetchSnapshot,
    promptCategories,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
    input,
    selectedImage,
    selectedImageName,
    handleImageSelect,
    clearSelectedImage,
    isListening,
    speechSupported,
    toggleVoiceInput,
  } = useAdminAiCopilot();

  const [inputMessage, setInputMessage] = useState('');

  // Sync speech input transcript into inputMessage
  useEffect(() => {
    if (input) {
      setInputMessage(input);
    }
  }, [input]);

  const [targetSeoUrl, setTargetSeoUrl] = useState('');
  const [showSeoBar, setShowSeoBar] = useState(false);
  const [showCompetitorBar, setShowCompetitorBar] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedError, setCopiedError] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = () => {
    if ((!inputMessage.trim() && !selectedImage) || loading) return;
    sendMessage(inputMessage, targetSeoUrl.trim() || undefined, competitorUrl.trim() || undefined);
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt, targetSeoUrl.trim() || undefined, competitorUrl.trim() || undefined);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyError = (errText: string) => {
    navigator.clipboard.writeText(errText);
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2500);
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-3" style={{ maxWidth: '1440px' }}>
      {/* Top Banner, Stats, and Spy Bar */}
      <AiCopilotHeader
        snapshot={snapshot}
        seoAudit={seoAudit}
        snapshotLoading={snapshotLoading}
        fetchSnapshot={fetchSnapshot}
        clearChat={clearChat}
        showSeoBar={showSeoBar}
        setShowSeoBar={setShowSeoBar}
        showCompetitorBar={showCompetitorBar}
        setShowCompetitorBar={setShowCompetitorBar}
        targetSeoUrl={targetSeoUrl}
        setTargetSeoUrl={setTargetSeoUrl}
        competitorUrl={competitorUrl}
        setCompetitorUrl={setCompetitorUrl}
        sendMessage={sendMessage}
        analyzeCompetitor={analyzeCompetitor}
        loading={loading}
      />

      {/* Main Grid: Prompts Sidebar + Chat Thread */}
      <div className="row g-3">
        {/* Left Column: Quick Intelligence Prompts */}
        <div className="col-12 col-lg-4 col-xl-3 order-2 order-lg-1">
          <div className="bg-white rounded-4 border p-3 shadow-sm" style={{ maxHeight: '720px', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>
                <i className="fas fa-lightbulb text-warning me-1.5" />
                Quick Intelligence Prompts
              </h6>
              <span className="text-muted" style={{ fontSize: '11px' }}>1-Click Ask</span>
            </div>

            <div className="d-flex flex-column gap-3 mt-2">
              {promptCategories.map((cat, idx) => (
                <div key={idx}>
                  <span className="d-block fw-semibold text-secondary mb-1.5" style={{ fontSize: '12px' }}>
                    {cat.icon} {cat.category}
                  </span>
                  <div className="d-flex flex-column gap-1.5">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handlePromptClick(p)}
                        disabled={loading}
                        className="btn btn-sm btn-light text-start text-dark border p-2"
                        style={{
                          fontSize: '11.5px',
                          lineHeight: '1.35',
                          borderRadius: '8px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.borderColor = '';
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat History & Input Bar */}
        <div className="col-12 col-lg-8 col-xl-9 order-1 order-lg-2">
          <div
            className="bg-white rounded-4 border shadow-sm d-flex flex-column"
            style={{ height: '720px' }}
          >
            {/* Chat Thread Messages */}
            <AiCopilotMessageList
              messages={messages}
              loading={loading}
              copiedId={copiedId}
              handleCopy={handleCopy}
              pendingAction={pendingAction}
              confirmPendingAction={confirmPendingAction}
              cancelPendingAction={cancelPendingAction}
              messagesEndRef={messagesEndRef}
            />

            {/* Input Controls */}
            <AiCopilotInputBar
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleKeyDown={handleKeyDown}
              handleSend={handleSend}
              selectedImage={selectedImage}
              selectedImageName={selectedImageName}
              clearSelectedImage={clearSelectedImage}
              handleImageSelect={handleImageSelect}
              isListening={isListening}
              speechSupported={speechSupported}
              toggleVoiceInput={toggleVoiceInput}
              loading={loading}
              textareaRef={textareaRef}
              fileInputRef={fileInputRef}
              error={error}
              copiedError={copiedError}
              handleCopyError={handleCopyError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
