'use client';

import React from 'react';
import { useNewsletter } from '@/hooks/useNewsletter';

interface BlogNewsletterBoxProps {
  title?: string;
  description?: string;
}

export const BlogNewsletterBox: React.FC<BlogNewsletterBoxProps> = ({
  title = 'Newsletter',
  description = 'Signup and receive weekly guides, tech breakthroughs, and exclusive COD deals in your inbox.',
}) => {
  const { email, setEmail, statusMessage, statusType, submitting, handleSubscribe } = useNewsletter();

  return (
    <div className="p-6 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 text-center shadow-xs">
      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/80 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h5 className="font-serif font-bold text-base text-slate-900 mb-1">{title}</h5>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">{description}</p>
      <form onSubmit={handleSubscribe} className="space-y-3.5">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email..."
            required
            disabled={submitting}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 shadow-2xs transition-all disabled:opacity-50"
          />
        </div>
        <div className="pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-sm shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
      {statusMessage && (
        <p
          className={`mt-3 text-xs font-semibold ${
            statusType === 'success' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
};
