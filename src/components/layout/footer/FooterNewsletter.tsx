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
      <h4 className="text-white mb-4" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
        Newsletter
      </h4>
      <p className="text-slate-300 mb-3" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
        Subscribe to receive flash discounts, weekly top sales, and warranty perks directly to your inbox.
      </p>
      <form onSubmit={handleSubscribe} className="position-relative">
        <input
          className="form-control rounded-pill w-100 py-3 ps-4 pe-5 border-0"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          style={{ fontSize: '0.85rem' }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary rounded-pill position-absolute top-0 end-0 py-2 px-4 mt-2 me-2"
          style={{ fontSize: '0.8rem', fontWeight: 700 }}
        >
          {submitting ? '...' : 'SignUp'}
        </button>
      </form>
      {statusMessage && (
        <div className={`mt-2 small text-${statusType === 'success' ? 'success' : 'danger'}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};
