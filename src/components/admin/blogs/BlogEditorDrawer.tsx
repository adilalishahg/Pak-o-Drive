'use client';

import React from 'react';
import {
  BookOpen,
  Send,
  X,
  FileText,
  HelpCircle,
  ShoppingBag,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { FAQItem, ProductMini } from '@/hooks/useAdminBlogs';
import { BlogEditorContentTab } from './editor/BlogEditorContentTab';
import { BlogEditorFaqTab } from './editor/BlogEditorFaqTab';
import { BlogEditorProductsTab } from './editor/BlogEditorProductsTab';
import { BlogEditorSeoTab } from './editor/BlogEditorSeoTab';

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
            <BlogEditorContentTab
              title={title}
              setTitle={setTitle}
              slug={slug}
              setSlug={setSlug}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              category={category}
              setCategory={setCategory}
              author={author}
              setAuthor={setAuthor}
              readTimeMinutes={readTimeMinutes}
              setReadTimeMinutes={setReadTimeMinutes}
              coverImage={coverImage}
              setCoverImage={setCoverImage}
              uploadingImage={uploadingImage}
              onUploadCoverImage={onUploadCoverImage}
              content={content}
              setContent={setContent}
              contentPreviewMode={contentPreviewMode}
              setContentPreviewMode={setContentPreviewMode}
            />
          )}

          {/* TAB 2: FAQS */}
          {activeTab === 'faqs' && (
            <BlogEditorFaqTab
              faqs={faqs}
              onAddFaq={onAddFaq}
              onUpdateFaq={onUpdateFaq}
              onRemoveFaq={onRemoveFaq}
            />
          )}

          {/* TAB 3: PRODUCTS SELECTOR */}
          {activeTab === 'products' && (
            <BlogEditorProductsTab
              availableProducts={availableProducts}
              selectedProductIds={selectedProductIds}
              onSelectProduct={onSelectProduct}
            />
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <BlogEditorSeoTab
              seoTitle={seoTitle}
              setSeoTitle={setSeoTitle}
              seoDescription={seoDescription}
              setSeoDescription={setSeoDescription}
              tags={tags}
              setTags={setTags}
              title={title}
              excerpt={excerpt}
              slug={slug}
            />
          )}
        </div>
      </div>
    </div>
  );
};
