'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Upload } from 'lucide-react';

interface BlogEditorContentTabProps {
  title: string;
  setTitle: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  excerpt: string;
  setExcerpt: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  readTimeMinutes: number;
  setReadTimeMinutes: (val: number) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
  uploadingImage: boolean;
  onUploadCoverImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentPreviewMode: 'write' | 'preview';
  setContentPreviewMode: (mode: 'write' | 'preview') => void;
  content: string;
  setContent: (val: string) => void;
}

export function BlogEditorContentTab({
  title,
  setTitle,
  slug,
  setSlug,
  excerpt,
  setExcerpt,
  category,
  setCategory,
  author,
  setAuthor,
  readTimeMinutes,
  setReadTimeMinutes,
  coverImage,
  setCoverImage,
  uploadingImage,
  onUploadCoverImage,
  contentPreviewMode,
  setContentPreviewMode,
  content,
  setContent,
}: BlogEditorContentTabProps) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Guide Title (H1)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 7 Proven AC Cooling Tricks for Suzuki Alto in Searing Heat"
            className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            URL Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ac-cooling-tricks-alto"
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Summary / Excerpt (Shows on card & meta)
        </label>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief overview of the article..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      {/* Metadata Row: Category, Author, Cover Image, Read Time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 font-medium"
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Author Name
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Est. Read Time (mins)
          </label>
          <input
            type="number"
            min={1}
            value={readTimeMinutes}
            onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Cover Image
            </label>
            <label className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={onUploadCoverImage}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="/img/carousel-1.jpg or https://..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Markdown Content Editor / Preview Switch */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700">
            Article Body (Full Markdown Supported)
          </label>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setContentPreviewMode('write')}
              className={`px-3 py-1 rounded-md transition-colors ${
                contentPreviewMode === 'write'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Write Markdown
            </button>
            <button
              type="button"
              onClick={() => setContentPreviewMode('preview')}
              className={`px-3 py-1 rounded-md transition-colors ${
                contentPreviewMode === 'preview'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>

        {contentPreviewMode === 'write' ? (
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write article in Markdown using ## for H2 headings, tables, and bullet points..."
            className="w-full p-4 font-mono text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none leading-relaxed"
          />
        ) : (
          <div className="p-6 rounded-xl border border-slate-200 bg-white min-h-[350px] max-h-[500px] overflow-y-auto prose prose-slate max-w-none text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
