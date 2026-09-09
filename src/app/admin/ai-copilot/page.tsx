'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useAdminAiCopilot } from '@/hooks/useAdminAiCopilot';

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
    setInput,
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

  return (
    <div className="container-fluid px-2 px-md-4 py-3" style={{ maxWidth: '1440px' }}>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                color: '#fff',
                fontSize: '20px',
              }}
            >
              <i className="fas fa-brain" />
            </div>
            <div>
              <h1 className="h4 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                Pak-o-Drive AI Copilot & Market Brain
                <span className="badge rounded-pill bg-emerald text-white fw-medium px-2 py-1" style={{ fontSize: '11px', background: '#059669' }}>
                  Live Engine
                </span>
              </h1>
              <p className="text-muted small mb-0">
                Real-time MongoDB Store Metrics • Rawalpindi & Islamabad Auto Trends • Live SEO Ranking Audit
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSeoBar((v) => !v)}
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${showSeoBar ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-search" />
            <span>{showSeoBar ? 'Close SEO URL' : 'Audit Specific URL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCompetitorBar((v) => !v)}
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${showCompetitorBar ? 'btn-danger' : 'btn-outline-danger'}`}
            style={{ borderRadius: '10px' }}
            title="Inspect any competitor store or product link"
          >
            <i className="fas fa-user-secret" />
            <span>{showCompetitorBar ? 'Close Competitor Spy' : '🕵️ Competitor Spy'}</span>
          </button>

          <button
            type="button"
            onClick={fetchSnapshot}
            disabled={snapshotLoading}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
            style={{ borderRadius: '10px' }}
            title="Refresh database live metrics"
          >
            <i className={`fas fa-sync-alt ${snapshotLoading ? 'fa-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <button
            type="button"
            onClick={clearChat}
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5"
            style={{ borderRadius: '10px' }}
            title="Clear Chat History"
          >
            <i className="fas fa-trash-alt" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Live Store Metrics Strip */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Total Products</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="h6 mb-0 fw-bold text-dark">{snapshot ? snapshot.totalProducts : '...'}</span>
              <span className="badge bg-light text-secondary border">Catalog</span>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Low Stock Alert</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className={`h6 mb-0 fw-bold ${snapshot && snapshot.lowStockItems.length > 0 ? 'text-danger' : 'text-success'}`}>
                {snapshot ? `${snapshot.lowStockItems.length} items` : '...'}
              </span>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                {snapshot?.outOfStockCount ? `${snapshot.outOfStockCount} Out` : 'Stock'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Total Orders</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="h6 mb-0 fw-bold text-dark">{snapshot ? snapshot.totalOrders : '...'}</span>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                {snapshot ? `${snapshot.pendingOrdersCount} Pending` : 'Orders'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Store Revenue</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="h6 mb-0 fw-bold text-dark">
                {snapshot ? `PKR ${snapshot.totalRevenuePKR.toLocaleString()}` : '...'}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">Sales</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-12 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>SEO Health Check</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className={`h6 mb-0 fw-bold ${seoAudit && seoAudit.totalMissingSeo > 0 ? 'text-warning' : 'text-success'}`}>
                {seoAudit ? `${seoAudit.totalMissingSeo} Missing SEO` : '...'}
              </span>
              <Link href="/admin/blogs" className="badge bg-primary-subtle text-primary border border-primary-subtle text-decoration-none">
                SEO Tools →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Optional SEO URL Target Bar */}
      {showSeoBar && (
        <div className="bg-primary-subtle border border-primary-subtle rounded-3 p-2.5 mb-3 d-flex flex-column flex-sm-row align-items-center gap-2">
          <i className="fas fa-link text-primary fs-5 ms-1" />
          <div className="flex-grow-1 w-100">
            <input
              type="text"
              className="form-control form-control-sm bg-white border"
              placeholder="e.g. /shop, /product/car-ambient-lighting, or https://pakodrive.com"
              value={targetSeoUrl}
              onChange={(e) => setTargetSeoUrl(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary text-nowrap"
            onClick={() => {
              if (targetSeoUrl.trim()) {
                sendMessage(`Audit the live SEO, title, meta description, and ranking readiness of this page: ${targetSeoUrl.trim()}`, targetSeoUrl.trim());
              }
            }}
          >
            Audit URL Now
          </button>
        </div>
      )}

      {/* Competitor Spy & Reverse Engineering Bar */}
      {showCompetitorBar && (
        <div className="bg-danger-subtle border border-danger-subtle rounded-3 p-3 mb-3 shadow-sm">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
            <div className="d-flex align-items-center gap-2 text-danger fw-bold small">
              <i className="fas fa-user-secret fs-5" />
              <span>Competitor Spy & Strategy Breakdown:</span>
            </div>
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <span className="text-muted small" style={{ fontSize: '11px' }}>Quick Examples:</span>
              <button
                type="button"
                onClick={() => setCompetitorUrl('https://sehgalmotors.pk/product/car-interior-ambient-lighting-kit')}
                className="badge bg-white text-secondary border text-decoration-none py-1 px-2 cursor-pointer"
                style={{ fontSize: '10px' }}
              >
                Sehgal Motors
              </button>
              <button
                type="button"
                onClick={() => setCompetitorUrl('https://autostore.pk/product/solar-rotating-car-perfume')}
                className="badge bg-white text-secondary border text-decoration-none py-1 px-2 cursor-pointer"
                style={{ fontSize: '10px' }}
              >
                Autostore.pk
              </button>
              <button
                type="button"
                onClick={() => setCompetitorUrl('https://www.pakwheels.com/accessories-spare-parts/')}
                className="badge bg-white text-secondary border text-decoration-none py-1 px-2 cursor-pointer"
                style={{ fontSize: '10px' }}
              >
                PakWheels
              </button>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
            <div className="flex-grow-1 w-100">
              <input
                type="text"
                className="form-control form-control-sm bg-white border"
                placeholder="Paste competitor link (e.g. https://sehgalmotors.pk/product/... or Daraz or PakWheels)..."
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={!competitorUrl.trim() || loading}
              className="btn btn-sm btn-danger text-nowrap d-flex align-items-center gap-1.5 px-3"
              onClick={() => {
                if (competitorUrl.trim()) {
                  analyzeCompetitor(competitorUrl.trim());
                }
              }}
            >
              <i className="fas fa-crosshairs" />
              <span>Reverse Engineer Competitor</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Prompts Side + Chat Thread */}
      <div className="row g-3">
        {/* Left Column: Quick Prompt Categories */}
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

        {/* Right Column: Chat History & Input */}
        <div className="col-12 col-lg-8 col-xl-9 order-1 order-lg-2">
          <div
            className="bg-white rounded-4 border shadow-sm d-flex flex-column"
            style={{ height: '720px' }}
          >
            {/* Chat Thread Messages */}
            <div
              className="flex-grow-1 p-3 p-md-4 overflow-y-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="d-flex flex-column gap-3">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`d-flex gap-2.5 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                          style={{
                            width: '34px',
                            height: '34px',
                            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                            fontSize: '14px',
                          }}
                        >
                          <i className="fas fa-brain" />
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`rounded-4 p-3 shadow-sm ${
                          isUser
                            ? 'bg-primary text-white'
                            : 'bg-light border text-dark'
                        }`}
                        style={{
                          maxWidth: isUser ? '82%' : '90%',
                          fontSize: '13.5px',
                          lineHeight: '1.6',
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1 gap-3">
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: '11px',
                              color: isUser ? 'rgba(255,255,255,0.85)' : '#64748b',
                            }}
                          >
                            {isUser ? 'Aap (Admin)' : 'Pak-o-Drive AI Brain'}
                          </span>
                          <div className="d-flex align-items-center gap-1.5">
                            <span
                              style={{
                                fontSize: '10px',
                                color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                              }}
                            >
                              {m.timestamp}
                            </span>
                            {!isUser && (
                              <button
                                type="button"
                                onClick={() => handleCopy(m.content, m.id)}
                                className="btn btn-sm btn-link p-0 text-secondary text-decoration-none"
                                title="Copy response"
                              >
                                <i className={copiedId === m.id ? 'fas fa-check text-success' : 'far fa-copy'} style={{ fontSize: '11px' }} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Uploaded / Attached Image Thumbnail */}
                        {m.imageUrl && (
                          <div className="mb-2">
                            <img
                              src={m.imageUrl}
                              alt="Uploaded car accessory"
                              className="rounded-3 border shadow-sm"
                              style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}

                        {/* Markdown Content */}
                        <div
                          className={`copilot-markdown ${isUser ? 'text-white' : ''}`}
                          style={{ wordBreak: 'break-word' }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>

                        {/* Action Executed Badge */}
                        {m.actionExecuted && (
                          <div className="mt-2.5 p-2 bg-success-subtle border border-success-subtle rounded-3 d-flex align-items-center gap-2 text-success small">
                            <i className="fas fa-check-circle fs-6" />
                            <div>
                              <strong className="d-block" style={{ fontSize: '11.5px' }}>Database Synchronized</strong>
                              <span style={{ fontSize: '11px' }}>{m.actionExecuted.description}</span>
                            </div>
                          </div>
                        )}

                        {/* Action Proposal & Confirmation Cards */}
                        {m.actionRequired && pendingAction?.id === m.actionRequired.id && (
                          m.actionRequired.type === 'publish_vision_product' ? (
                            <div className="mt-3 p-3 bg-white border border-success-subtle rounded-3 text-dark shadow-sm">
                              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2 text-success fw-bold">
                                  <i className="fas fa-camera fs-5" />
                                  <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                                </div>
                                <span className="badge bg-success text-white px-2 py-1" style={{ fontSize: '11px' }}>
                                  Vision Auto-Listing
                                </span>
                              </div>

                              {/* Studio Preview Dual Layer Presentation (Rule 3) */}
                              {m.actionRequired.payload?.params?.images?.[0] && (
                                <div
                                  className="rounded-3 overflow-hidden mb-2.5 border position-relative"
                                  style={{ height: '160px', backgroundColor: '#f8fafc' }}
                                >
                                  <img
                                    src={m.actionRequired.payload.params.images[0]}
                                    alt="Studio Preview Ambient"
                                    className="w-100 h-100 position-absolute"
                                    style={{ filter: 'blur(16px)', opacity: 0.35, objectFit: 'cover' }}
                                  />
                                  <img
                                    src={m.actionRequired.payload.params.images[0]}
                                    alt="Studio Preview Sharp"
                                    className="w-100 h-100 position-relative"
                                    style={{ objectFit: 'contain', padding: '6px' }}
                                  />
                                </div>
                              )}

                              {/* Benchmark & Margin Comparison Grid */}
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                <div className="p-2 rounded bg-light border flex-grow-1" style={{ minWidth: '120px' }}>
                                  <div className="text-muted" style={{ fontSize: '10px' }}>Suggested Selling Price</div>
                                  <div className="fw-bold text-success" style={{ fontSize: '14px' }}>
                                    PKR {m.actionRequired.payload?.params?.price?.toLocaleString() || '0'}
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-light border flex-grow-1" style={{ minWidth: '120px' }}>
                                  <div className="text-muted" style={{ fontSize: '10px' }}>
                                    Competitor ({m.actionRequired.payload?.params?.competitorSource || 'Market'})
                                  </div>
                                  <div className="text-danger text-decoration-line-through fw-semibold" style={{ fontSize: '13px' }}>
                                    PKR {m.actionRequired.payload?.params?.competitorPrice?.toLocaleString() || '0'}
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-light border flex-grow-1" style={{ minWidth: '120px' }}>
                                  <div className="text-muted" style={{ fontSize: '10px' }}>Est. Margin & Stock</div>
                                  <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                                    +{m.actionRequired.payload?.params?.profitMarginPercentage || 85}% • {m.actionRequired.payload?.params?.stock || 20} units
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => confirmPendingAction(m.actionRequired)}
                                  className="btn btn-sm btn-success d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  <i className="fas fa-check" />
                                  <span>✅ Approve & Publish Live</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={cancelPendingAction}
                                  className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : m.actionRequired.type === 'create_bundle' ? (
                            <div className="mt-3 p-3 bg-white border border-primary-subtle rounded-3 text-dark shadow-sm">
                              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                                  <i className="fas fa-box-open fs-5" />
                                  <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                                </div>
                                <span className="badge bg-primary text-white px-2 py-1" style={{ fontSize: '11px' }}>
                                  High-Margin Combo
                                </span>
                              </div>
                              <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                {m.actionRequired.description}
                              </p>
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => confirmPendingAction(m.actionRequired)}
                                  className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  <i className="fas fa-check" />
                                  <span>✅ Create & Publish Bundle</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={cancelPendingAction}
                                  className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-danger-subtle border border-danger-subtle rounded-3 text-dark shadow-sm">
                              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2 text-danger fw-bold">
                                  <i className="fas fa-shield-alt fs-5" />
                                  <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                                </div>
                                <span className="badge bg-danger text-white px-2 py-1" style={{ fontSize: '11px' }}>
                                  {m.actionRequired.count} Items
                                </span>
                              </div>
                              <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                {m.actionRequired.description}
                              </p>
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => confirmPendingAction(m.actionRequired)}
                                  className="btn btn-sm btn-danger d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  <i className="fas fa-check" />
                                  <span>Confirm & Execute</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={cancelPendingAction}
                                  className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                          style={{
                            width: '34px',
                            height: '34px',
                            background: '#2563eb',
                            fontSize: '14px',
                          }}
                        >
                          <i className="fas fa-user-shield" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading Bubble */}
                {loading && (
                  <div className="d-flex gap-2.5 justify-content-start">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                      style={{
                        width: '34px',
                        height: '34px',
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        fontSize: '14px',
                      }}
                    >
                      <i className="fas fa-brain fa-pulse" />
                    </div>
                    <div className="bg-light border rounded-4 p-3 shadow-sm" style={{ maxWidth: '80%' }}>
                      <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                        <i className="fas fa-spinner fa-spin text-emerald" style={{ color: '#059669' }} />
                        <span>Pak-o-Drive database aur market intelligence analyze ho rahi hai...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="px-3 py-1.5 bg-danger-subtle border-top border-danger-subtle text-danger small d-flex align-items-center justify-content-between">
                <span>{error}</span>
                <button type="button" className="btn-close btn-close-sm" onClick={() => {}} />
              </div>
            )}

            {/* Input Bar */}
            <div className="p-2.5 p-md-3 border-top bg-light rounded-bottom-4">
              {/* Image Preview Strip */}
              {selectedImage && (
                <div className="mb-2 p-2 bg-emerald-subtle border border-emerald-subtle rounded-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={selectedImage}
                      alt="Selected preview"
                      className="rounded-2 border"
                      style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: '12px' }}>
                        📸 {selectedImageName || 'Product Photo Attached'}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        Vision AI is ready to detect, benchmark competitor pricing & auto-list
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="btn btn-sm btn-outline-danger py-1 px-2.5 d-flex align-items-center gap-1"
                    style={{ borderRadius: '6px', fontSize: '11px' }}
                    title="Remove image"
                  >
                    <i className="fas fa-times" />
                    <span>Remove</span>
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="d-none"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageSelect(f);
                  e.target.value = '';
                }}
              />

              <div className="d-flex align-items-end gap-2 bg-white rounded-3 border p-1.5 shadow-sm focus-within-ring">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedImage
                      ? "Optional instruction for this product photo (e.g. 'Keep price under 3000' or press Send)..."
                      : "Kuch bhi poochein ya product photo attach karein..."
                  }
                  rows={2}
                  className="form-control border-0 shadow-none bg-transparent resize-none"
                  style={{ fontSize: '13.5px', maxHeight: '120px' }}
                />

                {/* Camera / Photo Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-light border text-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: selectedImage ? '#ecfdf5' : undefined,
                    borderColor: selectedImage ? '#10b981' : undefined,
                  }}
                  title="Snap / Upload Product Photo for Auto-Listing"
                >
                  <i className={`fas fa-camera ${selectedImage ? 'text-success' : 'text-emerald'}`} style={{ color: '#059669' }} />
                </button>

                {/* Voice Input Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`btn d-flex align-items-center justify-content-center flex-shrink-0 ${
                      isListening ? 'btn-danger' : 'btn-light border text-secondary'
                    }`}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                    }}
                    title={isListening ? 'Listening... Click to stop' : 'Voice Command (Urdu / English)'}
                  >
                    <i className={`fas ${isListening ? 'fa-microphone-slash fa-pulse' : 'fa-microphone'}`} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={(!inputMessage.trim() && !selectedImage) || loading}
                  className="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: (inputMessage.trim() || selectedImage) && !loading ? '#059669' : undefined,
                    borderColor: (inputMessage.trim() || selectedImage) && !loading ? '#059669' : undefined,
                  }}
                  title="Send Message (Enter)"
                >
                  {loading ? (
                    <i className="fas fa-spinner fa-spin" />
                  ) : (
                    <i className="fas fa-paper-plane" />
                  )}
                </button>
              </div>

              <div className="d-flex align-items-center justify-content-between mt-2 px-1">
                <span className="text-muted" style={{ fontSize: '11px' }}>
                  <i className="fas fa-keyboard me-1" />
                  Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for new line
                </span>
                <span className="badge bg-emerald-subtle text-emerald border" style={{ fontSize: '10px', color: '#059669' }}>
                  Roman Urdu / English Supported
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
