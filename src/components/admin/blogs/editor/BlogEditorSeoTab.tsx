'use client';

import React from 'react';

interface BlogEditorSeoTabProps {
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  seoDescription: string;
  setSeoDescription: (val: string) => void;
  tags: string;
  setTags: (val: string) => void;
  title: string;
  excerpt: string;
  slug: string;
}

export const BlogEditorSeoTab: React.FC<BlogEditorSeoTabProps> = ({
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  tags,
  setTags,
  title,
  excerpt,
  slug,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">
          Search Engine Optimization (SERP Settings)
        </h4>
        <p className="text-xs text-slate-500">
          Craft click-enticing titles and descriptions for Google Bot.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700">
            Meta SEO Title
          </label>
          <span className="text-[11px] text-slate-400">
            {seoTitle.length}/60 chars
          </span>
        </div>
        <input
          type="text"
          maxLength={70}
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="High CTR Search Title..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700">
            Meta SEO Description
          </label>
          <span className="text-[11px] text-slate-400">
            {seoDescription.length}/155 chars
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={170}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="Click-worthy description mentioning Pakistani driver benefits..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Keywords & Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="car accessories, maintenance tips, suzuki alto"
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      {/* Google SERP Live Snippet Preview */}
      <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Google Search Result Snippet Preview
        </span>
        <div className="text-xs text-emerald-700 truncate font-mono">
          https://www.pakodrive.pk › blog › {slug || 'guide-slug'}
        </div>
        <h5 className="text-base font-semibold text-blue-800 hover:underline cursor-pointer line-clamp-1 mt-0.5">
          {seoTitle || title || 'Article Title Preview | Pak-o-Drive'}
        </h5>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
          {seoDescription || excerpt || 'Detailed automotive guide for Pakistani drivers...'}
        </p>
      </div>
    </div>
  );
};
