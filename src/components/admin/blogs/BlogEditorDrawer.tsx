import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Send,
  X,
  FileText,
  HelpCircle,
  ShoppingBag,
  Layers,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { FAQItem, ProductMini } from '@/hooks/useAdminBlogs';

interface BlogEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  activeTab: 'content' | 'faqs' | 'products' | 'seo';
  setActiveTab: (tab: 'content' | 'faqs' | 'products' | 'seo') => void;
  contentPreviewMode: 'write' | 'preview';
  setContentPreviewMode: (mode: 'write' | 'preview') => void;

  // Form Fields & Setters
  title: string;
  setTitle: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  excerpt: string;
  setExcerpt: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  tags: string;
  setTags: (val: string) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  readTimeMinutes: number;
  setReadTimeMinutes: (val: number) => void;
  faqs: FAQItem[];
  onAddFaq: () => void;
  onUpdateFaq: (index: number, field: 'question' | 'answer', val: string) => void;
  onRemoveFaq: (index: number) => void;
  availableProducts: ProductMini[];
  selectedProductIds: string[];
  onSelectProduct: (id: string) => void;
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  seoDescription: string;
  setSeoDescription: (val: string) => void;

  savingPost: boolean;
  uploadingImage: boolean;
  onUploadCoverImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveArticle: () => void;
}

export const BlogEditorDrawer: React.FC<BlogEditorDrawerProps> = ({
  isOpen,
  onClose,
  editingId,
  activeTab,
  setActiveTab,
  contentPreviewMode,
  setContentPreviewMode,
  title,
  setTitle,
  slug,
  setSlug,
  excerpt,
  setExcerpt,
  content,
  setContent,
  coverImage,
  setCoverImage,
  author,
  setAuthor,
  category,
  setCategory,
  tags,
  setTags,
  isPublished,
  setIsPublished,
  readTimeMinutes,
  setReadTimeMinutes,
  faqs,
  onAddFaq,
  onUpdateFaq,
  onRemoveFaq,
  availableProducts,
  selectedProductIds,
  onSelectProduct,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  savingPost,
  uploadingImage,
  onUploadCoverImage,
  onSaveArticle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Automotive Guide' : 'Compose New Guide'}
              </h3>
              <span className="text-xs text-slate-500">
                E-E-A-T Optimized • Google FAQPage Schema • Product Monetization
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
              />
              <span>Publish Immediately</span>
            </label>

            <button
              type="button"
              onClick={onSaveArticle}
              disabled={savingPost}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
            >
              {savingPost ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {editingId ? 'Update Article' : 'Publish Article'}
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Article Body & Media
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'faqs'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            FAQs ({faqs.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Linked Products ({selectedProductIds.length})
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'seo'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            SEO & Meta Tags
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: CONTENT */}
          {activeTab === 'content' && (
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
          )}

          {/* TAB 2: FAQS */}
          {activeTab === 'faqs' && (
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
          )}

          {/* TAB 3: PRODUCTS SELECTOR */}
          {activeTab === 'products' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Link Matching Store Products
                </h4>
                <p className="text-xs text-slate-500">
                  Selected items will be presented with high-converting "Cash on Delivery" cards inside this article.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-2">
                {availableProducts.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod._id);
                  const prodImage =
                    prod.image ||
                    (prod.images && prod.images[0]) ||
                    '/img/placeholder-product.png';

                  return (
                    <div
                      key={prod._id}
                      onClick={() => onSelectProduct(prod._id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-400/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                        <Image
                          src={prodImage}
                          alt={prod.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {prod.name}
                        </h5>
                        <span className="text-xs font-extrabold text-orange-600 block mt-0.5">
                          Rs. {Number(prod.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
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
          )}
        </div>
      </div>
    </div>
  );
};
