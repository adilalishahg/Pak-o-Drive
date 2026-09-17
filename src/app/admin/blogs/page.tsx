'use client';

import React from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react';
import { useAdminBlogs } from '@/hooks/useAdminBlogs';
import {
  BlogKpiStats,
  BlogSearchBar,
  BlogTable,
  BlogAiModal,
  BlogEditorDrawer,
  BlogDeleteConfirmDialog,
  AutoBlogConfirmDialog,
} from '@/components/admin/blogs';

export default function AdminBlogsPage() {
  const blog = useAdminBlogs();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
              Content & SEO Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Google Ranking & AdSense Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Auto Blogs & Editorial
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate high-ranking 1,200+ word automotive guides, manage FAQs schema, and auto-monetize with store accessories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Autonomous Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Auto-Cron: 9:00 AM & 6:00 PM PKT</span>
          </div>

          <button
            onClick={blog.handleTriggerAutoBlogNow}
            disabled={blog.isRunningAutoBlog}
            title="Immediately runs the scheduled autonomous AI auto-blogger"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 ${
              blog.isRunningAutoBlog
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 hover:shadow-lg'
            }`}
          >
            {blog.isRunningAutoBlog ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                <span>Generating 1,200w Guide...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Run Auto-Blogger Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              blog.setAiTopic('');
              blog.setAiKeywords('');
              blog.setAiMessage(null);
              blog.setIsAiModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            AI Blog Writer (Custom)
          </button>

          <button
            onClick={blog.handleOpenCreateBlank}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Write Manually
          </button>
        </div>
      </div>

      {/* Auto-Blogger Execution Banner */}
      {blog.autoBlogStatus && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{blog.autoBlogStatus}</span>
          </div>
          <button
            onClick={() => blog.setAutoBlogStatus(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <BlogKpiStats
        total={blog.posts.length}
        totalPublished={blog.totalPublished}
        totalDrafts={blog.totalDrafts}
        totalMonetized={blog.totalMonetized}
      />

      {/* Search & Filters */}
      <BlogSearchBar
        search={blog.search}
        onSearchChange={blog.setSearch}
        filterCategory={blog.filterCategory}
        onFilterCategoryChange={blog.setFilterCategory}
        filterStatus={blog.filterStatus}
        onFilterStatusChange={blog.setFilterStatus}
        onRefresh={blog.fetchBlogs}
        loading={blog.loading}
      />

      {/* Blogs Table */}
      <BlogTable
        posts={blog.posts}
        loading={blog.loading}
        onTogglePublish={blog.handleTogglePublish}
        onEdit={blog.handleOpenEdit}
        onDeletePrompt={blog.promptDeleteArticle}
      />

      {/* 1-Click AI Generation Modal */}
      <BlogAiModal
        isOpen={blog.isAiModalOpen}
        onClose={() => blog.setIsAiModalOpen(false)}
        topic={blog.aiTopic}
        onTopicChange={blog.setAiTopic}
        keywords={blog.aiKeywords}
        onKeywordsChange={blog.setAiKeywords}
        category={blog.aiCategory}
        onCategoryChange={blog.setAiCategory}
        isGenerating={blog.isGeneratingAi}
        message={blog.aiMessage}
        onGenerate={blog.handleGenerateAi}
      />

      {/* Full Article Editor Drawer */}
      <BlogEditorDrawer
        isOpen={blog.isEditorOpen}
        onClose={() => blog.setIsEditorOpen(false)}
        editingId={blog.editingId}
        activeTab={blog.activeTab}
        setActiveTab={blog.setActiveTab}
        contentPreviewMode={blog.contentPreviewMode}
        setContentPreviewMode={blog.setContentPreviewMode}
        title={blog.title}
        setTitle={blog.setTitle}
        slug={blog.slug}
        setSlug={blog.setSlug}
        excerpt={blog.excerpt}
        setExcerpt={blog.setExcerpt}
        content={blog.content}
        setContent={blog.setContent}
        coverImage={blog.coverImage}
        setCoverImage={blog.setCoverImage}
        author={blog.author}
        setAuthor={blog.setAuthor}
        category={blog.category}
        setCategory={blog.setCategory}
        tags={blog.tags}
        setTags={blog.setTags}
        isPublished={blog.isPublished}
        setIsPublished={blog.setIsPublished}
        readTimeMinutes={blog.readTimeMinutes}
        setReadTimeMinutes={blog.setReadTimeMinutes}
        faqs={blog.faqs}
        onAddFaq={blog.handleAddFaq}
        onUpdateFaq={blog.handleUpdateFaq}
        onRemoveFaq={blog.handleRemoveFaq}
        availableProducts={blog.availableProducts}
        selectedProductIds={blog.selectedProductIds}
        onSelectProduct={blog.handleSelectProduct}
        seoTitle={blog.seoTitle}
        setSeoTitle={blog.setSeoTitle}
        seoDescription={blog.seoDescription}
        setSeoDescription={blog.setSeoDescription}
        savingPost={blog.savingPost}
        uploadingImage={blog.uploadingImage}
        onUploadCoverImage={blog.handleUploadCoverImage}
        onSaveArticle={blog.handleSaveArticle}
      />

      {/* Delete Confirmation Dialog (Rule #7) */}
      <BlogDeleteConfirmDialog
        isOpen={Boolean(blog.deleteTarget)}
        title={blog.deleteTarget?.title || ''}
        isDeleting={blog.isDeleting}
        onConfirm={blog.confirmDelete}
        onCancel={blog.cancelDelete}
      />

      {/* Auto-Blogger Trigger Confirmation Dialog (Rule #7) */}
      <AutoBlogConfirmDialog
        isOpen={blog.isConfirmAutoBlogOpen}
        isRunning={blog.isRunningAutoBlog}
        onConfirm={blog.confirmTriggerAutoBlog}
        onCancel={() => blog.setIsConfirmAutoBlogOpen(false)}
      />

      {/* Global Toast Notification */}
      {blog.toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
            blog.toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{blog.toast.msg}</span>
        </div>
      )}
    </div>
  );
}
