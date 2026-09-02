'use client';

import { useState, useEffect } from 'react';
import { CategoryData } from '@/types';
import { optimizeImageBeforeUpload } from '@/utils/imageOptimizer';
import { getBestCategoryIcon } from '@/lib/categoryIconService';

export function useAdminCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('fas fa-tag');
  const [image, setImage] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'roots' | 'subs'>('all');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        const normalized = (json.data || []).map((c: any) => ({
          ...c,
          id: c.id || c._id || c.slug,
        }));
        setCategories(normalized);
      } else {
        throw new Error(json.error || 'Failed to fetch categories');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const optimizedFile = await optimizeImageBeforeUpload(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setImage(json.url);
      } else {
        throw new Error(json.error || 'Failed to upload image file.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));

    // Automatically suggest the most fitting icon from active library if currently on default or empty
    if (!icon || icon === 'fas fa-tag') {
      const suggested = getBestCategoryIcon(val);
      if (suggested && suggested !== 'fas fa-tag') {
        setIcon(suggested);
      }
    }
  };

  const handleAutoPickIcon = () => {
    const suggested = getBestCategoryIcon(name);
    setIcon(suggested || 'fas fa-tag');
  };

  const handleStartEdit = (cat: CategoryData) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || 'fas fa-tag');
    setImage(cat.image || '');
    setParentCategory(cat.parentCategory || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('fas fa-tag');
    setImage('');
    setParentCategory('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSaving(true);
    setError('');

    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, icon, image, parentCategory }),
        });
        const json = await res.json();
        if (json.success) {
          setCategories(categories.map((c) => (c.id === editingCategory.id ? json.data : c)).sort((a, b) => a.name.localeCompare(b.name)));
          handleCancelEdit();
        } else {
          throw new Error(json.error || 'Failed to update category');
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, icon, image, parentCategory }),
        });
        const json = await res.json();

        if (json.success) {
          setCategories([...categories, json.data].sort((a, b) => a.name.localeCompare(b.name)));
          setName('');
          setSlug('');
          setIcon('fas fa-tag');
          setImage('');
          setParentCategory('');
        } else {
          throw new Error(json.error || 'Failed to create category');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while saving category.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      } else {
        setError(json.error || 'Failed to delete category.');
      }
    } catch {
      setError('Network error, could not delete category.');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_defaults' }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchCategories();
      } else {
        throw new Error(json.error || 'Failed to seed categories');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to seed categories.');
    } finally {
      setSeeding(false);
    }
  };

  const markImageFailed = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const subCategories = categories.filter((c) => Boolean(c.parentCategory));

  const displayedCategories = categories.filter((c) => {
    if (filterMode === 'roots') return !c.parentCategory;
    if (filterMode === 'subs') return Boolean(c.parentCategory);
    return true;
  });

  return {
    categories,
    displayedCategories,
    rootCategories,
    subCategories,
    failedImages,
    markImageFailed,
    name,
    setName,
    slug,
    setSlug,
    icon,
    setIcon,
    image,
    setImage,
    parentCategory,
    setParentCategory,
    uploading,
    loading,
    saving,
    error,
    editingCategory,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    filterMode,
    setFilterMode,
    seeding,
    handleFileChange,
    handleNameChange,
    handleStartEdit,
    handleCancelEdit,
    handleSubmit,
    confirmDelete,
    handleSeedDefaults,
    handleAutoPickIcon,
  };
}
