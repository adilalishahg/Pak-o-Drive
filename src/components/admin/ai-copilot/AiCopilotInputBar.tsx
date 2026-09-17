'use client';

import React from 'react';

interface AiCopilotInputBarProps {
  inputMessage: string;
  setInputMessage: (val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  selectedImage: string | null;
  selectedImageName: string | null;
  clearSelectedImage: () => void;
  handleImageSelect: (file: File) => void;
  isListening: boolean;
  speechSupported: boolean;
  toggleVoiceInput: () => void;
  loading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  error: string | null;
  copiedError: boolean;
  handleCopyError: (err: string) => void;
}

export function AiCopilotInputBar({
  inputMessage,
  setInputMessage,
  handleKeyDown,
  handleSend,
  selectedImage,
  selectedImageName,
  clearSelectedImage,
  handleImageSelect,
  isListening,
  speechSupported,
  toggleVoiceInput,
  loading,
  textareaRef,
  fileInputRef,
  error,
  copiedError,
  handleCopyError,
}: AiCopilotInputBarProps) {
  return (
    <>
      {/* Error Banner */}
      {error && (
        <div className="px-3 py-2 bg-danger-subtle border-top border-danger-subtle text-danger small d-flex align-items-center justify-content-between gap-3 shadow-sm">
          <div className="d-flex align-items-center gap-2 text-break font-monospace" style={{ fontSize: '11px' }}>
            <i className="fas fa-circle-exclamation text-danger" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopyError(error)}
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 flex-shrink-0"
            style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px' }}
          >
            {copiedError ? '✓ Copied!' : '📋 Copy Error'}
          </button>
        </div>
      )}

      {/* Input Bar Container */}
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
    </>
  );
}
