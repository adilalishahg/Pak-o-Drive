'use client';

import React, { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { optimizeImageBeforeUpload } from '@/utils/imageOptimizer';
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal';
import { CategoryData } from '@/types';

export default function AdminCategoriesPage() {

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto slug generation
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
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
        // Update Category
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, icon, image, parentCategory }),
        });
        const json = await res.json();
        if (json.success) {
          setCategories(categories.map((c) => c.id === editingCategory.id ? json.data : c).sort((a, b) => a.name.localeCompare(b.name)));
          handleCancelEdit();
        } else {
          throw new Error(json.error || 'Failed to update category');
        }
      } else {
        // Create Category
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

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const [filterMode, setFilterMode] = useState<'all' | 'roots' | 'subs'>('all');
  const [seeding, setSeeding] = useState(false);

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

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const subCategories = categories.filter((c) => Boolean(c.parentCategory));

  const displayedCategories = categories.filter((c) => {
    if (filterMode === 'roots') return !c.parentCategory;
    if (filterMode === 'subs') return Boolean(c.parentCategory);
    return true;
  });

  if (loading && categories.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Categories List */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h5 className="fw-bold text-secondary mb-1">Available Categories & Subcategories</h5>
                <div className="text-muted small">
                  {rootCategories.length} Main Departments • {subCategories.length} Inner Subcategories
                </div>
              </div>

              {/* Seed Button */}
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center gap-1.5 fw-semibold"
              >
                <span>{seeding ? '🌱 Loading...' : '🌱 Load Default Multi-Niche Categories'}</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 mb-3 border-bottom pb-2">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`btn btn-sm rounded-pill px-3 ${filterMode === 'all' ? 'btn-dark' : 'btn-light text-muted'}`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('roots')}
                className={`btn btn-sm rounded-pill px-3 ${filterMode === 'roots' ? 'btn-primary' : 'btn-light text-muted'}`}
              >
                Main Departments ({rootCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('subs')}
                className={`btn btn-sm rounded-pill px-3 ${filterMode === 'subs' ? 'btn-warning text-dark' : 'btn-light text-muted'}`}
              >
                Subcategories ({subCategories.length})
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small uppercase">
                  <tr>
                    <th style={{ width: '50px' }}>Icon</th>
                    <th>Category / Subcategory</th>
                    <th className="d-none d-md-table-cell">Slug</th>
                    <th>Products</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCategories.map((cat) => (
                    <tr key={cat.id || cat._id || cat.slug} className={cat.parentCategory ? 'bg-light bg-opacity-25' : ''}>
                      <td>
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden border position-relative"
                          style={{ width: '36px', height: '36px', color: cat.parentCategory ? '#0284c7' : '#ea580c' }}
                        >
                          {cat.image && !failedImages[cat.id] ? (
                            <OptimizedImage
                              src={cat.image}
                              alt={cat.name}
                              fill
                              sizes="36px"
                              style={{ objectFit: 'cover' }}
                              onError={() => {
                                setFailedImages((prev) => ({ ...prev, [cat.id]: true }));
                              }}
                            />
                          ) : (
                            <i className={cat.icon || 'fas fa-tag'} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          {cat.parentCategory ? (
                            <span className="text-primary fw-bold" style={{ fontSize: '1rem' }}>↳</span>
                          ) : (
                            <span className="badge bg-dark text-white rounded-pill" style={{ fontSize: '0.62rem' }}>MAIN</span>
                          )}
                          <span className={`text-dark ${cat.parentCategory ? 'fw-semibold text-secondary' : 'fw-bold'}`}>
                            {cat.name}
                          </span>
                        </div>
                        {cat.parentCategory && (
                          <div className="small text-muted font-monospace ps-3" style={{ fontSize: '0.70rem' }}>
                            Parent: {cat.parentCategory}
                          </div>
                        )}
                      </td>
                      <td className="d-none d-md-table-cell">
                        <code className="text-muted small">{cat.slug}</code>
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-2.5 py-1 ${cat.productCount > 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
                          {cat.productCount} products
                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="btn btn-sm btn-outline-primary border-0 rounded-circle me-1"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit Category"
                        >
                          <i className="fas fa-edit small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                          disabled={cat.productCount > 0}
                          className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                          style={{ width: '32px', height: '32px' }}
                          title={
                            cat.productCount > 0
                              ? 'Cannot delete category containing products'
                              : 'Delete Category'
                          }
                        >
                          <i className="fas fa-trash-alt small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Category Form */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-secondary mb-3 border-bottom pb-2">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="form-control rounded-3"
                  placeholder="e.g. Smartwatches"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="e.g. smartwatches"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Parent Category (Optional)</label>
                <select
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="form-select rounded-3 text-capitalize"
                >
                  <option value="">None (Make Root Category)</option>
                  {categories
                    .filter((c) => !c.parentCategory) // only root categories as parents
                    .map((c) => (
                      <option key={c._id || c.id || c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">FontAwesome Icon Class</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="e.g. fas fa-clock"
                />
                <div className="form-text small">
                  Icon preview:{' '}
                  <span className="ms-2 px-1 text-primary">
                    <i className={icon} />
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Upload Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control rounded-3"
                />
                {uploading && (
                  <div className="d-flex align-items-center gap-1.5 mt-1 text-primary small">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Or Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="e.g. /img/custom-cat.png"
                />
              </div>

              {image && (
                <div className="mb-4 bg-light p-2.5 rounded-3 text-center border">
                  <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="position-relative">
                    <OptimizedImage
                      src={image}
                      alt="Category Preview"
                      fill
                      sizes="150px"
                      style={{ objectFit: 'contain' }}
                      unoptimized // Since it can be a local blob URL during upload
                    />
                  </div>
                  <div className="text-muted small mt-1">Image Preview</div>
                </div>
              )}

              <div className="d-flex gap-2">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-outline-secondary w-50 py-2.5 fw-semibold rounded-3"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className={`btn btn-gradient ${editingCategory ? 'w-50' : 'w-100'} py-2.5 fw-semibold border-0 text-white rounded-3 shadow`}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" /> Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Add Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Reusable Delete Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category?"
        message="Are you sure you want to permanently delete this category?"
        itemName={deleteTarget?.name}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
