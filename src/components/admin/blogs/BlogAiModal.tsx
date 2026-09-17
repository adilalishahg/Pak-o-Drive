import React from 'react';
import { Sparkles, RefreshCw, X, AlertCircle, CheckCircle } from 'lucide-react';
import { TRENDING_TOPICS } from '@/hooks/useAdminBlogs';

interface BlogAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  onTopicChange: (val: string) => void;
  keywords: string;
  onKeywordsChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  isGenerating: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  onGenerate: () => void;
}

export const BlogAiModal: React.FC<BlogAiModalProps> = ({
  isOpen,
  onClose,
  topic,
  onTopicChange,
  keywords,
  onKeywordsChange,
  category,
  onCategoryChange,
  isGenerating,
  message,
  onGenerate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Automotive Blog Creator</h3>
            <span className="text-xs text-slate-500">
              Powered by Multi-Model Waterfall (Gemini ➔ Groq ➔ Hugging Face)
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 my-3 ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* Quick Pick Trending Topics */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ⚡ Quick Pick: Trending & Viral Topics (High Reach)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
              {TRENDING_TOPICS.map((item) => (
                <button
                  key={item.topic}
                  type="button"
                  onClick={() => {
                    onTopicChange(item.topic);
                    onCategoryChange(item.category);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                    topic === item.topic
                      ? 'bg-orange-50 border-orange-400 text-orange-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="font-semibold text-[10px] uppercase text-orange-600 mr-1.5 block sm:inline">
                    [{item.category}]
                  </span>
                  <span>{item.topic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Topic / Guide Title
            </label>
            <input
              type="text"
              placeholder="e.g., Best Accessories to install in new Honda Civic in Pakistan"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. car vacuum, alto 660, led lights"
                value={keywords}
                onChange={(e) => onKeywordsChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="Technology & AI">Technology & AI</option>
                <option value="Global & World">Global & World</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                <option value="Trending & Viral News">Trending & Viral News</option>
                <option value="Automotive & Gadgets">Automotive & Gadgets</option>
                <option value="Car Maintenance">Car Maintenance</option>
                <option value="Auto Electronics">Auto Electronics</option>
                <option value="Driving Tips">Driving Tips</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !topic.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Generating 1,200+ Words & Matching Products...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Authority Guide Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
