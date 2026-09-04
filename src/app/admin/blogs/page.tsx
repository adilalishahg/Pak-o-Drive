'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  Clock,
  BookOpen,
  ShoppingBag,
  HelpCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  Send,
  AlertCircle,
  Upload,
  Zap,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface ProductMini {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  images?: string[];
}

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  faqs?: FAQItem[];
  readTimeMinutes?: number;
  featuredProducts?: ProductMini[];
  createdAt?: string;
}

interface TrendingPick {
  topic: string;
  category: string;
}

const TRENDING_TOPICS: TrendingPick[] = [
  { topic: 'How Generative AI & Automation Are Transforming Jobs, Freelancing, and Daily Work', category: 'Technology & AI' },
  { topic: 'The Science of Deep Sleep: How to Fix Your Sleep Cycle & Wake Up Energized', category: 'Health & Wellness' },
  { topic: 'How to Build a Timeless Capsule Wardrobe: Look Effortlessly Stylish on Any Budget', category: 'Fashion & Lifestyle' },
  { topic: 'Mega Infrastructure Projects Reshaping the World: Futuristic Cities & High-Speed Trains', category: 'Global & World' },
  { topic: 'Top 7 Critical Cybersecurity Habits to Protect Your WhatsApp and Bank Accounts', category: 'Technology & AI' },
  { topic: 'Why Certain Content Goes Viral: The Psychology Behind TikTok & Reels Trends', category: 'Trending & Viral News' },
  { topic: '10 Simple Daily Habits to Strengthen Your Immune System & Fight Chronic Inflammation', category: 'Health & Wellness' },
  { topic: 'How to Maximize Car AC Cooling & Prevent Engine Overheating in 45°C+ Summer Heat', category: 'Automotive & Gadgets' },
];

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('');

  // Store products for featured selector
  const [availableProducts, setAvailableProducts] = useState<ProductMini[]>([]);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiCategory, setAiCategory] = useState('Car Maintenance');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Autonomous Auto-Blogger State
  const [isRunningAutoBlog, setIsRunningAutoBlog] = useState(false);
  const [autoBlogStatus, setAutoBlogStatus] = useState<string | null>(null);

  // Editor Modal / Drawer State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'faqs' | 'products' | 'seo'>('content');
  const [contentPreviewMode, setContentPreviewMode] = useState<'write' | 'preview'>('write');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Pak-o-Drive Editorial');
  const [category, setCategory] = useState('Car Maintenance');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [savingPost, setSavingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload image');
      }

      const uploadedUrl = json.data?.url || json.url;
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory);
      if (filterStatus) params.set('status', filterStatus);

      const res = await fetch(`/api/admin/blogs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPosts(json.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus]);

  // Fetch products for selector
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=50');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAvailableProducts(json.data);
      }
    } catch (e) {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchProducts();
  }, [fetchBlogs, fetchProducts]);

  // Open Create Blank
  const handleOpenCreateBlank = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImage('/img/carousel-1.jpg');
    setAuthor('Pak-o-Drive Editorial');
    setCategory('Car Maintenance');
    setTags('Car Care, Pakistan, Auto Tips');
    setIsPublished(true);
    setReadTimeMinutes(5);
    setFaqs([
      { question: 'How often should this maintenance be performed in Pakistan?', answer: 'Due to severe dusty conditions and high ambient temperatures, a check every 5,000 km is recommended.' },
      { question: 'Where can I buy genuine accessories for this in Pakistan?', answer: 'Pak-o-Drive delivers genuine car accessories nationwide with 100% Cash on Delivery.' },
    ]);
    setSelectedProductIds([]);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setActiveTab('content');
    setIsEditorOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (post: BlogPostItem) => {
    setEditingId(post._id);
    setTitle(post.title || '');
    setSlug(post.slug || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setCoverImage(post.coverImage || '');
    setAuthor(post.author || 'Pak-o-Drive Editorial');
    setCategory(post.category || 'Car Maintenance');
    setTags((post.tags || []).join(', '));
    setIsPublished(Boolean(post.isPublished));
    setReadTimeMinutes(post.readTimeMinutes || 5);
    setFaqs(post.faqs || []);
    setSelectedProductIds(
      post.featuredProducts
        ? post.featuredProducts.map((p) => (typeof p === 'string' ? p : p._id))
        : []
    );
    setSeoTitle(post.seoTitle || '');
    setSeoDescription(post.seoDescription || '');
    setSeoKeywords((post.seoKeywords || []).join(', '));
    setActiveTab('content');
    setIsEditorOpen(true);
  };

  // AI Generation Trigger
  const handleGenerateAi = async () => {
    if (!aiTopic.trim()) {
      setAiMessage({ type: 'error', text: 'Please enter or pick an automotive topic.' });
      return;
    }

    setIsGeneratingAi(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/admin/blogs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          keywords: aiKeywords.split(',').map((s) => s.trim()).filter(Boolean),
          category: aiCategory,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'AI generation failed');
      }

      const { draft, matchedProducts, providerUsed } = json.data;

      // Populate into Editor
      setEditingId(null);
      setTitle(draft.title);
      setSlug(draft.slug);
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      setCoverImage('/img/carousel-1.jpg');
      setAuthor('Pak-o-Drive Editorial');
      setCategory(draft.category || aiCategory);
      setTags((draft.tags || []).join(', '));
      setIsPublished(true);
      setReadTimeMinutes(draft.readTimeMinutes || 6);
      setFaqs(draft.faqs || []);
      setSeoTitle(draft.seoTitle || draft.title);
      setSeoDescription(draft.seoDescription || draft.excerpt);
      setSeoKeywords((draft.seoKeywords || []).join(', '));

      if (Array.isArray(matchedProducts) && matchedProducts.length > 0) {
        setSelectedProductIds(matchedProducts.map((p) => p._id));
      } else {
        setSelectedProductIds([]);
      }

      setIsAiModalOpen(false);
      setIsEditorOpen(true);
      setActiveTab('content');
      setAiMessage({ type: 'success', text: `Draft generated via ${providerUsed}!` });
    } catch (err: any) {
      setAiMessage({ type: 'error', text: err.message || 'Error occurred during generation' });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save / Update Article
  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Article Title and Content are required.');
      return;
    }

    setSavingPost(true);
    try {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        author,
        category,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        isPublished,
        readTimeMinutes: Number(readTimeMinutes) || 5,
        faqs,
        featuredProducts: selectedProductIds,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const url = editingId ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save blog post');
      }

      setIsEditorOpen(false);
      fetchBlogs();
    } catch (err: any) {
      alert(err.message || 'Error saving post');
    } finally {
      setSavingPost(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(json.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  // Quick Toggle Publish
  const handleTogglePublish = async (post: BlogPostItem) => {
    try {
      const res = await fetch(`/api/admin/blogs/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, isPublished: !p.isPublished } : p))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Autonomous Auto-Blogger Instant Trigger
  const handleTriggerAutoBlogNow = async () => {
    if (
      !confirm(
        'Run Autonomous AI Auto-Blogger now?\n\nIt will dynamically pick the next unique high-ranking Pakistani automotive topic, write a comprehensive 1,200+ word localized guide using Gemini/Groq, auto-link matching store accessories, and publish live with zero cache lag.'
      )
    ) {
      return;
    }

    setIsRunningAutoBlog(true);
    setAutoBlogStatus(null);

    try {
      const res = await fetch('/api/cron/auto-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Autonomous auto-blog generation failed.');
      }

      setAutoBlogStatus(
        `🎉 Successfully published: "${json.post.title}" (${json.stats.wordCount} words) via ${json.stats.providerUsed} with ${json.stats.linkedProductsCount} store accessories!`
      );
      await fetchBlogs();
    } catch (err: any) {
      alert(`Auto-Blog Error: ${err.message || 'Failed to execute auto-blog.'}`);
    } finally {
      setIsRunningAutoBlog(false);
    }
  };

  const totalPublished = posts.filter((p) => p.isPublished).length;
  const totalDrafts = posts.filter((p) => !p.isPublished).length;

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
            onClick={handleTriggerAutoBlogNow}
            disabled={isRunningAutoBlog}
            title="Immediately runs the scheduled autonomous AI auto-blogger"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 ${
              isRunningAutoBlog
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 hover:shadow-lg'
            }`}
          >
            {isRunningAutoBlog ? (
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
              setAiTopic('');
              setAiKeywords('');
              setAiMessage(null);
              setIsAiModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            AI Blog Writer (Custom)
          </button>

          <button
            onClick={handleOpenCreateBlank}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Write Manually
          </button>
        </div>
      </div>

      {/* Auto-Blogger Execution Banner */}
      {autoBlogStatus && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{autoBlogStatus}</span>
          </div>
          <button
            onClick={() => setAutoBlogStatus(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Articles</span>
            <BookOpen className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{posts.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Published Live</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{totalPublished}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Drafts / In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">{totalDrafts}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600">Monetized Guides</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block mt-2">
            {posts.filter((p) => p.featuredProducts && p.featuredProducts.length > 0).length}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blogs by title, slug, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button
            onClick={fetchBlogs}
            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
            <p className="text-sm">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No blog articles found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Use the AI Blog Writer above to automatically generate 1,200+ word guides tailored for Pakistani motorists.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Linked Gear</th>
                  <th className="py-3 px-4">Read Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Article Info */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-slate-400 absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1 hover:text-orange-600 transition-colors">
                            {post.title}
                          </h4>
                          <span className="text-xs text-slate-400 block font-mono mt-0.5">
                            /blog/{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {post.category || 'Maintenance'}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          post.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.isPublished ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {post.isPublished ? 'Live on Site' : 'Draft'}
                      </button>
                    </td>

                    {/* Featured Products Count */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                        {post.featuredProducts?.length || 0} items
                      </span>
                    </td>

                    {/* Read Time */}
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {post.readTimeMinutes || 5} mins
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.isPublished && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View published article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(post._id, post.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 1-CLICK AI GENERATION MODAL */}
      {/* ============================================================ */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsAiModalOpen(false)}
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

            {aiMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 my-3 ${
                  aiMessage.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {aiMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{aiMessage.text}</span>
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
                        setAiTopic(item.topic);
                        setAiCategory(item.category);
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                        aiTopic === item.topic
                          ? 'bg-orange-50 border-orange-400 text-orange-700 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-semibold text-[10px] uppercase text-orange-600 mr-1.5 block sm:inline">[{item.category}]</span>
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
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
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
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
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
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGeneratingAi}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi || !aiTopic.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isGeneratingAi ? (
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
      )}

      {/* ============================================================ */}
      {/* FULL ARTICLE EDITOR DRAWER / MODAL */}
      {/* ============================================================ */}
      {isEditorOpen && (
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
                  onClick={handleSaveArticle}
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
                  onClick={() => setIsEditorOpen(false)}
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
                            onChange={handleUploadCoverImage}
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
                      onClick={() =>
                        setFaqs((prev) => [...prev, { question: '', answer: '' }])
                      }
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
                        onClick={() =>
                          setFaqs((prev) => prev.filter((_, i) => i !== idx))
                        }
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
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].question = e.target.value;
                            setFaqs(updated);
                          }}
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
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[idx].answer = e.target.value;
                            setFaqs(updated);
                          }}
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
                          onClick={() => {
                            setSelectedProductIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== prod._id)
                                : [...prev, prod._id]
                            );
                          }}
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
      )}
    </div>
  );
}
