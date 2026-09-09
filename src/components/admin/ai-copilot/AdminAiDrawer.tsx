'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Trash2,
  Copy,
  Check,
  TrendingUp,
  Package,
  Search,
  DollarSign,
  Lightbulb,
  ChevronDown,
  Loader2,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ShieldAlert,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { useAdminAiCopilot } from '@/hooks/useAdminAiCopilot';
import { VisionProductProposalCard } from './VisionProductProposalCard';

export function AdminAiDrawer() {
  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    selectedImage,
    selectedImageName,
    handleImageSelect,
    clearSelectedImage,
    isThinking,
    error,
    quickPrompts,
    sendMessage,
    clearChat,
    messagesEndRef,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
    isListening,
    speechSupported,
    toggleVoiceInput,
  } = useAdminAiCopilot();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedError, setCopiedError] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyError = (errText: string) => {
    navigator.clipboard.writeText(errText);
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPromptIcon = (promptText: string) => {
    if (promptText.includes('Operations') || promptText.includes('Actions'))
      return <Sparkles className="w-3.5 h-3.5 text-orange-400" />;
    if (promptText.includes('Trends')) return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
    if (promptText.includes('Stock')) return <Package className="w-3.5 h-3.5 text-rose-400" />;
    if (promptText.includes('SEO')) return <Search className="w-3.5 h-3.5 text-sky-400" />;
    if (promptText.includes('Selling') || promptText.includes('Revenue'))
      return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
    return <Lightbulb className="w-3.5 h-3.5 text-amber-300" />;
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div
        className="fixed z-[1050]"
        style={{
          bottom: '20px',
          right: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #ea580c 100%)',
            boxShadow: '0 8px 30px rgba(234, 88, 12, 0.45)',
          }}
          aria-label="Toggle AI Executive Copilot"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span className="text-sm tracking-wide font-bold hidden sm:inline leading-normal py-0.5">
            AI Copilot
          </span>
          <span className="px-1.5 py-0.5 text-[10px] uppercase font-extrabold bg-black/30 rounded-md tracking-wider">
            Twin Cities & Store
          </span>
        </button>
      </div>

      {/* Backdrop for Mobile and Desktop Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        className={`fixed z-[2001] bg-slate-950 text-slate-100 flex flex-col transition-all duration-300 ease-out shadow-2xl border-slate-800 ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        } ${
          /* Mobile: Full viewport height and width; Desktop: slide-over width 480px or expanded */
          isExpanded ? 'w-full sm:w-[680px]' : 'w-full sm:w-[480px]'
        }`}
        style={{
          top: 0,
          right: 0,
          bottom: 0,
          height: '100dvh',
          maxHeight: '100dvh',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        aria-label="AI Executive Copilot Drawer"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight leading-normal py-0.5 truncate">
                  Pak-o-Drive AI Copilot
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live DB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate leading-normal py-0.5">
                Pakistan Trends • Rawalpindi / Islamabad • Live SEO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={clearChat}
              title="Clear chat history"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              aria-label="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isExpanded ? 'Collapse width' : 'Expand width'}
              aria-label="Toggle drawer expansion"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips (Horizontal scrollable) */}
        <div className="px-3.5 py-2.5 bg-slate-900/50 border-b border-slate-800/60 overflow-x-auto flex-shrink-0 flex items-center gap-2 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isThinking}
              onClick={() => sendMessage(prompt)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {getPromptIcon(prompt)}
              <span className="leading-normal py-0.5">{prompt}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-950/90">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[88%] sm:max-w-[84%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none'
                  }`}
                >
                  {/* Attached Image */}
                  {msg.imageUrl && (
                    <div className="mb-2.5">
                      <img
                        src={msg.imageUrl}
                        alt="Product upload"
                        className="rounded-xl border border-white/10 max-h-44 max-w-full object-cover shadow-sm"
                      />
                    </div>
                  )}

                  {/* Markdown Renderer for Assistant Messages */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed font-normal">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-200 overflow-x-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-2 rounded-lg border border-slate-700">
                              <table className="min-w-full divide-y divide-slate-700 text-left text-xs" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="bg-slate-800 px-2.5 py-1.5 font-bold text-amber-300" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-2.5 py-1.5 border-t border-slate-800 text-slate-300" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-2 leading-relaxed font-normal last:mb-0" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold text-amber-200" {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className="text-orange-400 hover:text-orange-300 underline"
                              target="_blank"
                              rel="noreferrer"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Action Executed Badge */}
                  {msg.actionExecuted && (
                    <div className="mt-2.5 p-2 bg-emerald-950/70 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block text-[11px] leading-tight text-emerald-300">
                          Database Synchronized
                        </span>
                        <span className="text-[10.5px] text-emerald-200/80 leading-normal">
                          {msg.actionExecuted.description}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Proposal & Confirmation Cards */}
                  {msg.actionRequired && pendingAction?.id === msg.actionRequired.id && (
                    msg.actionRequired.type === 'publish_vision_product' ? (
                      <VisionProductProposalCard
                        action={msg.actionRequired}
                        isThinking={isThinking}
                        onConfirm={confirmPendingAction}
                        onCancel={cancelPendingAction}
                      />
                    ) : msg.actionRequired.type === 'create_bundle' ? (
                      <div className="mt-3 p-3 bg-slate-950/90 border border-amber-500/40 rounded-xl text-slate-100 shadow-xl">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <Package className="w-4 h-4 flex-shrink-0" />
                            <span className="leading-normal">{msg.actionRequired.title}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex-shrink-0">
                            Combo Bundle
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                          {msg.actionRequired.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={() => confirmPendingAction(msg.actionRequired)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Create & Publish Bundle</span>
                          </button>
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={cancelPendingAction}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : msg.actionRequired.type === 'auto_beat_price' ? (
                      <div className="mt-3 p-3 bg-slate-950/90 border border-amber-500/40 rounded-xl text-slate-100 shadow-xl">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <TrendingUp className="w-4 h-4 flex-shrink-0" />
                            <span className="leading-normal">{msg.actionRequired.title}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex-shrink-0">
                            Auto-Beat Pricing
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                          {msg.actionRequired.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={() => confirmPendingAction(msg.actionRequired)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Approve & Update Live Price</span>
                          </button>
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={cancelPendingAction}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : msg.actionRequired.type === 'create_flash_sale' ? (
                      <div className="mt-3 p-3 bg-slate-950/90 border border-rose-500/40 rounded-xl text-slate-100 shadow-xl">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <span className="leading-normal">{msg.actionRequired.title}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-rose-600/30 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 flex-shrink-0">
                            Flash Sale Event
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                          {msg.actionRequired.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={() => confirmPendingAction(msg.actionRequired)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Activate Flash Sale Live</span>
                          </button>
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={cancelPendingAction}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : msg.actionRequired.type === 'generate_customer_reviews' ? (
                      <div className="mt-3 p-3 bg-slate-950/90 border border-sky-500/40 rounded-xl text-slate-100 shadow-xl">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span className="leading-normal">{msg.actionRequired.title}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-sky-600/30 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30 flex-shrink-0">
                            Verified Reviews
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                          {msg.actionRequired.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={() => confirmPendingAction(msg.actionRequired)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Publish Verified Reviews</span>
                          </button>
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={cancelPendingAction}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-slate-100 shadow-lg">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                            <span className="leading-normal">{msg.actionRequired.title}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-rose-600/40 text-rose-200 px-2 py-0.5 rounded-full border border-rose-500/30 flex-shrink-0">
                            {msg.actionRequired.count} items
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                          {msg.actionRequired.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={() => confirmPendingAction(msg.actionRequired)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm & Execute</span>
                          </button>
                          <button
                            type="button"
                            disabled={isThinking}
                            onClick={cancelPendingAction}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {/* Message Footer: Timestamp & Copy button */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-white/10 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1 hover:text-white rounded transition-colors opacity-80 hover:opacity-100 flex items-center gap-1"
                      title="Copy message"
                      aria-label="Copy Message"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[9px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[9px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading Animation */}
          {isThinking && (
            <div className="flex gap-2.5 items-start justify-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span className="text-slate-400 leading-normal py-0.5">
                  Store database & Twin Cities trends analyze ho rahe hain...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
                <span className="leading-normal py-0.5 font-mono text-[11px] break-all">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyError(error)}
                className="flex items-center gap-1 text-[11px] font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                {copiedError ? '✓ Copied!' : '📋 Copy Error'}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Footer */}
        <div
          className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex-shrink-0"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
          }}
        >
          {/* Image Preview Strip */}
          {selectedImage && (
            <div className="mb-2 p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-emerald-300 block truncate">
                    📸 {selectedImageName || 'Photo Attached'}
                  </span>
                  <span className="text-[9.5px] text-slate-400 block truncate">
                    Vision AI ready to detect & benchmark
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedImage}
                className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-md transition-colors flex-shrink-0"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageSelect(f);
              e.target.value = '';
            }}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  selectedImage
                    ? "Product photo ke sath koi note (ya enter dabayein)..."
                    : "Poochhein ya photo attach karein..."
                }
                disabled={isThinking}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className="w-full bg-slate-950 text-slate-100 text-xs sm:text-sm placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none max-h-24 min-h-[44px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all disabled:opacity-50"
              />
            </div>

            {/* Camera / Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`h-[44px] px-3 rounded-xl flex items-center justify-center transition-all border flex-shrink-0 ${
                selectedImage
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title="Snap / Upload Product Photo for Auto-Listing"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`h-[44px] px-3 rounded-xl flex items-center justify-center transition-all border flex-shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
                title={isListening ? 'Listening (Click to stop)' : 'Voice Command (Click & speak Urdu/English)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isThinking}
              className="h-[44px] px-3.5 sm:px-4 rounded-xl font-medium text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              }}
              aria-label="Send query"
            >
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span>Pak-o-Drive Intelligence Engine</span>
            <span>Shift+Enter for new line</span>
          </div>
        </div>
      </aside>
    </>
  );
}
