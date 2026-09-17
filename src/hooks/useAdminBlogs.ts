'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProductMini {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  images?: string[];
}

export interface BlogPostItem {
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

export interface TrendingPick {
  topic: string;
  category: string;
}

export const TRENDING_TOPICS: TrendingPick[] = [
  { topic: 'How Generative AI & Automation Are Transforming Jobs, Freelancing, and Daily Work', category: 'Technology & AI' },
  { topic: 'The Science of Deep Sleep: How to Fix Your Sleep Cycle & Wake Up Energized', category: 'Health & Wellness' },
  { topic: 'How to Build a Timeless Capsule Wardrobe: Look Effortlessly Stylish on Any Budget', category: 'Fashion & Lifestyle' },
  { topic: 'Mega Infrastructure Projects Reshaping the World: Futuristic Cities & High-Speed Trains', category: 'Global & World' },
  { topic: 'Top 7 Critical Cybersecurity Habits to Protect Your WhatsApp and Bank Accounts', category: 'Technology & AI' },
  { topic: 'Why Certain Content Goes Viral: The Psychology Behind TikTok & Reels Trends', category: 'Trending & Viral News' },
  { topic: '10 Simple Daily Habits to Strengthen Your Immune System & Fight Chronic Inflammation', category: 'Health & Wellness' },
  { topic: 'How to Maximize Car AC Cooling & Prevent Engine Overheating in 45°C+ Summer Heat', category: 'Automotive & Gadgets' },
];

export function useAdminBlogs() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('');

  // Store products for featured selector
  const [availableProducts, setAvailableProducts] = useState<ProductMini[]>([]);

  // Toast State (Rule #7 compliant)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Delete Confirmation Dialog State (Rule #7 compliant)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-Blog Confirmation Dialog State (Rule #7 compliant)
  const [isConfirmAutoBlogOpen, setIsConfirmAutoBlogOpen] = useState(false);

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
        showToast('Cover image uploaded successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

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
      showToast(`Draft generated via ${providerUsed}!`, 'success');
    } catch (err: any) {
      setAiMessage({ type: 'error', text: err.message || 'Error occurred during generation' });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save / Update Article
  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Article Title and Content are required.', 'error');
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
      showToast(editingId ? 'Article updated successfully!' : 'Article published successfully!', 'success');
      fetchBlogs();
    } catch (err: any) {
      showToast(err.message || 'Error saving post', 'error');
    } finally {
      setSavingPost(false);
    }
  };

  // Prompt delete target (Replaces window.confirm)
  const promptDeleteArticle = (id: string, postTitle: string) => {
    setDeleteTarget({ id, title: postTitle });
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.filter((p) => p._id !== deleteTarget.id));
        showToast(`Article "${deleteTarget.title}" deleted.`, 'success');
        setDeleteTarget(null);
      } else {
        showToast(json.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
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
        showToast(
          `Article marked as ${!post.isPublished ? 'Live on Site' : 'Draft'}.`,
          'success'
        );
      } else {
        showToast(json.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Trigger prompt for Autonomous Auto-Blogger
  const handleTriggerAutoBlogNow = () => {
    setIsConfirmAutoBlogOpen(true);
  };

  // Execute Autonomous Auto-Blogger once confirmed
  const confirmTriggerAutoBlog = async () => {
    setIsConfirmAutoBlogOpen(false);
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

      const statusMsg = `🎉 Successfully published: "${json.post.title}" (${json.stats.wordCount} words) via ${json.stats.providerUsed} with ${json.stats.linkedProductsCount} store accessories!`;
      setAutoBlogStatus(statusMsg);
      showToast('Auto-Blogger generated and published new article!', 'success');
      await fetchBlogs();
    } catch (err: any) {
      showToast(`Auto-Blog Error: ${err.message || 'Failed to execute auto-blog.'}`, 'error');
    } finally {
      setIsRunningAutoBlog(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPublished = posts.filter((p) => p.isPublished).length;
  const totalDrafts = posts.filter((p) => !p.isPublished).length;
  const totalMonetized = posts.filter((p) => p.featuredProducts && p.featuredProducts.length > 0).length;

  return {
    posts,
    loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    availableProducts,
    totalPublished,
    totalDrafts,
    totalMonetized,

    // Toast & Modals
    toast,
    showToast,
    deleteTarget,
    isDeleting,
    promptDeleteArticle,
    confirmDelete,
    cancelDelete,
    isConfirmAutoBlogOpen,
    setIsConfirmAutoBlogOpen,
    handleTriggerAutoBlogNow,
    confirmTriggerAutoBlog,

    // AI Modal State
    isAiModalOpen,
    setIsAiModalOpen,
    aiTopic,
    setAiTopic,
    aiKeywords,
    setAiKeywords,
    aiCategory,
    setAiCategory,
    isGeneratingAi,
    aiMessage,
    setAiMessage,
    handleGenerateAi,

    // Auto Blog
    isRunningAutoBlog,
    autoBlogStatus,
    setAutoBlogStatus,

    // Editor Drawer State
    isEditorOpen,
    setIsEditorOpen,
    editingId,
    activeTab,
    setActiveTab,
    contentPreviewMode,
    setContentPreviewMode,

    // Form Fields
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
    handleAddFaq,
    handleUpdateFaq,
    handleRemoveFaq,
    selectedProductIds,
    handleSelectProduct,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    seoKeywords,
    setSeoKeywords,
    savingPost,
    uploadingImage,

    // Main Actions
    fetchBlogs,
    handleUploadCoverImage,
    handleOpenCreateBlank,
    handleOpenEdit,
    handleSaveArticle,
    handleTogglePublish,
  };
}
