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
    <div className="p-6 rounded-xl border border-slate-200 bg-white text-center shadow-xs">
      <h5 className="font-serif font-bold text-base text-slate-900 mb-1">{title}</h5>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{description}</p>
      <form onSubmit={handleSubscribe} className="space-y-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email..."
          required
          disabled={submitting}
          className="w-full bg-[#f8f9fa] border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {statusMessage && (
        <p
          className={`mt-2 text-xs font-medium ${
            statusType === 'success' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
};
