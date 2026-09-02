'use client';

import React from 'react';

const SEARCH_TABS = [
  { type: 'email' as const, label: 'Email', icon: 'fas fa-envelope', placeholder: 'your@email.com' },
  { type: 'phone' as const, label: 'Phone', icon: 'fas fa-phone', placeholder: '+923001234567' },
] as const;

export interface OrderSearchCardProps {
  searchType: 'email' | 'phone';
  setSearchType: (type: 'email' | 'phone') => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OrderSearchCard({
  searchType,
  setSearchType,
  inputValue,
  setInputValue,
  loading,
  error,
  setError,
  onSubmit,
}: OrderSearchCardProps) {
  const activeTab = SEARCH_TABS.find((t) => t.type === searchType) || SEARCH_TABS[0];

  const handleTabChange = (type: 'email' | 'phone') => {
    setSearchType(type);
    setInputValue('');
    setError('');
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* Header icon & title */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <i className="fas fa-search" style={{ color: '#fff', fontSize: '1.1rem' }} />
        </div>
        <h4 style={{ fontWeight: 800, color: '#111', marginBottom: '4px', fontSize: '1.1rem' }}>Track Your Order</h4>
        <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Enter email or phone used at checkout</p>
      </div>

      <form onSubmit={onSubmit}>
        {/* Toggle Email / Phone without repetition */}
        <div className="d-flex gap-2 justify-content-center mb-4">
          {SEARCH_TABS.map((tab) => {
            const isActive = searchType === tab.type;
            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => handleTabChange(tab.type)}
                className={`btn btn-sm rounded-pill px-4 ${isActive ? 'btn-primary border-0' : 'btn-outline-secondary'}`}
                style={
                  isActive
                    ? { background: 'linear-gradient(to right, #c2410c, #ea580c)', border: 'none', color: '#ffffff' }
                    : { color: '#475569', borderColor: '#94a3b8' }
                }
              >
                <i className={`${tab.icon} me-2`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Input field */}
          <div
            style={{
              display: 'flex',
              border: '1.5px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                background: '#f9fafb',
                borderRight: '1px solid #e5e7eb',
                flexShrink: 0,
              }}
            >
              <i className={`${activeTab.icon}`} style={{ color: '#9ca3af', fontSize: '14px' }} />
            </span>
            <input
              type={searchType === 'email' ? 'email' : 'tel'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeTab.placeholder}
              aria-label={searchType === 'email' ? 'Email Address' : 'Phone Number'}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '13px 14px',
                fontSize: '0.9rem',
                color: '#111',
                background: 'transparent',
                fontFamily: 'var(--pd-font)',
                minWidth: 0,
              }}
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient"
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              fontWeight: 700,
              fontSize: '0.9rem',
              width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Searching…
              </>
            ) : (
              <>
                <i className="fas fa-search me-2" />
                Track Order
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3 mt-3 py-2 px-3 small" role="alert">
            <i className="fas fa-exclamation-circle me-2" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
