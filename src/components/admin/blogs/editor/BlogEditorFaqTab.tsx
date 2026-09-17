'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FAQItem } from '@/hooks/useAdminBlogs';

interface BlogEditorFaqTabProps {
  faqs: FAQItem[];
  onAddFaq: () => void;
  onUpdateFaq: (index: number, field: 'question' | 'answer', val: string) => void;
  onRemoveFaq: (index: number) => void;
}

export function BlogEditorFaqTab({
  faqs,
  onAddFaq,
  onUpdateFaq,
  onRemoveFaq,
}: BlogEditorFaqTabProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Frequently Asked Questions (Google Rich Snippets)
          </h4>
          <p className="text-xs text-slate-500">
            These FAQs are automatically formatted into schema.org/FAQPage JSON-LD.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddFaq}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200 hover:bg-orange-100"
        >
          <Plus className="w-3.5 h-3.5" />
          Add FAQ
        </button>
      </div>

      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 relative"
        >
          <button
            type="button"
            onClick={() => onRemoveFaq(idx)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Question #{idx + 1}
            </label>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => onUpdateFaq(idx, 'question', e.target.value)}
              placeholder="e.g. Can I run 660cc car AC continuously in 48°C heat?"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Answer
            </label>
            <textarea
              rows={2}
              value={faq.answer}
              onChange={(e) => onUpdateFaq(idx, 'answer', e.target.value)}
              placeholder="Clear, authoritative answer..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
