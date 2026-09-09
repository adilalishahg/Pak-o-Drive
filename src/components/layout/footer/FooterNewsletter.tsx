'use client';

import React from 'react';
import { useNewsletter } from '@/hooks/useNewsletter';

interface FooterNewsletterProps {
  isCleanWhite?: boolean;
}

export const FooterNewsletter: React.FC<FooterNewsletterProps> = ({ isCleanWhite }) => {
  const { email, setEmail, statusMessage, statusType, submitting, handleSubscribe } = useNewsletter();

  if (isCleanWhite) {
    return (
      <div>
        <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Newsletter Sign up</h3>
        <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
          Receive updates about free deals, new arrivals, and special promotions across Pakistan.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md uppercase tracking-wider border-0 cursor-pointer"
          >
            {submitting ? 'Subscribing...' : 'Subscribe'}
          </button>
          {statusMessage && (
            <div className={`text-${statusType === 'success' ? 'emerald-400' : 'rose-400'} text-xs mt-1 font-semibold`}>
              {statusMessage}
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="footer-item d-flex flex-column">
      <h5 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.3px' }}>
        Newsletter
      </h5>
      <p className="text-slate-300 mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
        Subscribe to receive flash discounts, weekly top sales, and warranty perks.
      </p>
      <form
        onSubmit={handleSubscribe}
        className="d-flex align-items-center w-100 rounded-pill bg-white p-1"
        style={{
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          maxWidth: '100%',
        }}
      >
        <input
          className="form-control border-0 bg-transparent shadow-none px-3 py-1.5 text-dark"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
          style={{
            fontSize: '0.82rem',
            minWidth: 0,
            flex: '1 1 auto',
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn rounded-pill px-3.5 py-1.5 fw-bold border-0 flex-shrink-0"
          style={{
            fontSize: '0.78rem',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          {submitting ? '...' : 'Sign Up'}
        </button>
      </form>
      {statusMessage && (
        <div className={`mt-1.5 small text-${statusType === 'success' ? 'success' : 'danger'}`} style={{ fontSize: '0.75rem' }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};
