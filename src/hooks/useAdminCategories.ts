'use client';

import { useState, useEffect, useMemo } from 'react';
import { CategoryData } from '@/types';
import { optimizeImageBeforeUpload } from '@/utils/imageOptimizer';
import { getBestCategoryIcon } from '@/lib/categoryIconService';
import {
  buildCategoryTree,
  flattenTreeWithIndentation,
  validateNoCircularParent,
  CategoryTreeNode,
  FlattenedCategoryOption,
} from '@/lib/categoryTree';

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
  const [iconPaletteOpen, setIconPaletteOpen] = useState(false);

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

  const handleQuickAddSubcategory = (parentCatSlug: string) => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('fas fa-tag');
    setImage('');
    setParentCategory(parentCatSlug);
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

    // Prevent circular parenting
    if (editingCategory && parentCategory) {
      const isValidParent = validateNoCircularParent(editingCategory.slug, parentCategory, categories);
      if (!isValidParent) {
        setError('Cannot set a category or any of its subcategories as its own parent.');
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        name,
        slug,
        icon: icon || 'fas fa-tag',
        image,
        parentCategory: parentCategory || '',
      };

      let res: Response;
      if (editingCategory) {
        res = await fetch(`/api/categories/${(editingCategory as any).id || (editingCategory as any)._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        await fetchCategories();
        handleCancelEdit();
      } else {
        throw new Error(json.error || 'Failed to save category');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving category.');
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
        await fetchCategories();
        setDeleteTarget(null);
      } else {
        throw new Error(json.error || 'Failed to delete category');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting category.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('Are you sure you want to load default categories? Existing ones will be preserved.')) return;
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

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flattenedHierarchy = useMemo(() => flattenTreeWithIndentation(categoryTree), [categoryTree]);

  // Available parent options (excluding currently edited category and its descendants)
  const availableParentOptions = useMemo(() => {
    if (!editingCategory) return flattenedHierarchy;
    return flattenedHierarchy.filter((opt) =>
      validateNoCircularParent(editingCategory.slug, opt.slug, categories)
    );
  }, [flattenedHierarchy, editingCategory, categories]);

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const subCategories = categories.filter((c) => Boolean(c.parentCategory));

  const displayedCategories = useMemo(() => {
    if (filterMode === 'roots') return categories.filter((c) => !c.parentCategory);
    if (filterMode === 'subs') return categories.filter((c) => Boolean(c.parentCategory));
    return categories;
  }, [categories, filterMode]);

  return {
    categories,
    categoryTree,
    flattenedHierarchy,
    availableParentOptions,
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
    iconPaletteOpen,
    setIconPaletteOpen,
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
    handleQuickAddSubcategory,
    handleCancelEdit,
    handleSubmit,
    confirmDelete,
    handleSeedDefaults,
    handleAutoPickIcon,
  };
}
