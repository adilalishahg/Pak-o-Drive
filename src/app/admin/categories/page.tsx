'use client';

import React from 'react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal';
import { IconPalettePicker } from '@/components/admin/categories/IconPalettePicker';
import { useAdminCategories } from '@/hooks/useAdminCategories';

export default function AdminCategoriesPage() {
  const {
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
  } = useAdminCategories();

  const currentList = filterMode === 'all' ? flattenedHierarchy : displayedCategories;

  if (loading && categories.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in pb-32 md:pb-12">
      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Categories List */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-sm-4">
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
                <span>{seeding ? '🌱 Loading...' : '🌱 '}</span>
                <span className="d-none d-sm-inline">{!seeding && 'Load Default Multi-Niche Categories'}</span>
                <span className="d-inline d-sm-none">{!seeding && 'Load Defaults'}</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 mb-3 border-bottom pb-2 overflow-x-auto no-scrollbar flex-nowrap">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`btn btn-sm rounded-pill px-3 text-nowrap ${filterMode === 'all' ? 'btn-dark' : 'btn-light text-muted'}`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('roots')}
                className={`btn btn-sm rounded-pill px-3 text-nowrap ${filterMode === 'roots' ? 'btn-primary' : 'btn-light text-muted'}`}
              >
                Main Departments ({rootCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('subs')}
                className={`btn btn-sm rounded-pill px-3 text-nowrap ${filterMode === 'subs' ? 'btn-warning text-dark' : 'btn-light text-muted'}`}
              >
                Subcategories ({subCategories.length})
              </button>
            </div>

            {/* Active Editing Banner for Mobile */}
            {editingCategory && (
              <div
                className="alert alert-primary bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 d-flex align-items-center justify-content-between p-2.5 mb-3"
                role="alert"
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-edit text-primary" />
                  <span className="small fw-bold text-dark">
                    Currently Editing: <span className="text-primary">{editingCategory.name}</span>
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('category-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="btn btn-sm btn-primary text-white px-2.5 py-1 fw-bold shadow-sm"
                    style={{ fontSize: '0.74rem' }}
                  >
                    Go to Form ⬇
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-sm btn-outline-secondary px-2.5 py-1"
                    style={{ fontSize: '0.74rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Card / List Item View (< 768px) */}
            <div className="d-block d-md-none d-flex flex-column gap-3 mb-3">
              {currentList.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-folder-open fs-2 mb-2 d-block opacity-50" />
                  <p className="mb-0">No categories found in this view.</p>
                </div>
              ) : (
                currentList.map((cat: any) => {
                  const depth = cat.depth || 0;
                  return (
                    <div
                      key={cat.id || cat._id || cat.slug}
                      className={`card border rounded-3 p-3 shadow-xs position-relative ${
                        depth > 0 ? 'border-start border-3 border-primary' : 'border-slate-200'
                      }`}
                      style={{
                        marginLeft: depth > 0 ? `${Math.min(depth * 10, 28)}px` : '0px',
                        backgroundColor: depth > 0 ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      {/* Top Row: Icon + Title & Badges */}
                      <div className="d-flex align-items-start gap-2.5 mb-2">
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden border position-relative flex-shrink-0"
                          style={{
                            width: '42px',
                            height: '42px',
                            color: depth > 0 ? '#0284c7' : '#ea580c',
                            fontSize: '18px',
                          }}
                        >
                          {cat.image && !failedImages[cat.id] ? (
                            <OptimizedImage
                              src={cat.image}
                              alt={cat.name}
                              fill
                              sizes="42px"
                              style={{ objectFit: 'cover' }}
                              onError={() => markImageFailed(cat.id)}
                            />
                          ) : (
                            <i className={cat.icon || 'fas fa-tag'} />
                          )}
                        </div>

                        <div className="flex-grow-1 min-w-0">
                          {/* Badges */}
                          <div className="d-flex flex-wrap align-items-center gap-1.5 mb-1">
                            {depth > 0 ? (
                              <>
                                <span className="text-primary fw-bold" style={{ fontSize: '0.85rem' }}>
                                  {'↳'.repeat(Math.min(depth, 3))}
                                </span>
                                <span
                                  className="badge bg-info bg-opacity-10 text-primary border border-info border-opacity-25 rounded-pill px-2 py-0.5"
                                  style={{ fontSize: '0.62rem' }}
                                >
                                  LEVEL {depth}
                                </span>
                              </>
                            ) : (
                              <span className="badge bg-dark text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                                MAIN
                              </span>
                            )}
                            {cat.parentCategory && (
                              <span className="small text-muted font-monospace text-break" style={{ fontSize: '0.72rem' }}>
                                Parent: <strong className="text-primary">{cat.parentCategory}</strong>
                              </span>
                            )}
                          </div>

                          {/* Full wrap title without truncation */}
                          <h6 className="fw-bold text-dark mb-1 text-break leading-normal py-0.5" style={{ fontSize: '0.98rem' }}>
                            {cat.name}
                          </h6>

                          {/* Slug */}
                          <code className="text-muted small font-monospace d-inline-block text-break" style={{ fontSize: '0.75rem' }}>
                            /{cat.slug}
                          </code>
                        </div>
                      </div>

                      {/* Middle Details: Product Count */}
                      <div className="d-flex align-items-center justify-content-between py-2 border-top border-bottom border-light-subtle my-2">
                        <span className="text-muted small fw-medium">Assigned Products</span>
                        <span
                          className={`badge rounded-pill px-2.5 py-1 ${
                            cat.productCount > 0 ? 'bg-success bg-opacity-10 text-success fw-bold' : 'bg-light text-muted'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          📦 {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                        </span>
                      </div>

                      {/* Footer Actions Row (Min 40px touch targets) */}
                      <div className="d-flex align-items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAddSubcategory(cat.slug)}
                          className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center justify-content-center gap-1.5 flex-grow-1"
                          style={{ minHeight: '40px', fontSize: '0.82rem', fontWeight: 600 }}
                          title={`Add Subcategory inside ${cat.name}`}
                        >
                          <i className="fas fa-plus" />
                          <span>+ Sub</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '42px', height: '40px', minWidth: '42px' }}
                          title="Edit Category"
                          aria-label={`Edit ${cat.name}`}
                        >
                          <i className="fas fa-edit" style={{ fontSize: '15px' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, productCount: cat.productCount })}
                          className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '42px', height: '40px', minWidth: '42px' }}
                          title="Delete Category"
                          aria-label={`Delete ${cat.name}`}
                        >
                          <i className="fas fa-trash-alt" style={{ fontSize: '15px' }} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="d-none d-md-block table-responsive overflow-x-auto min-w-full">
              <table className="table table-hover align-middle mb-0" style={{ minWidth: '600px' }}>
                <thead className="table-light text-muted small uppercase">
                  <tr>
                    <th style={{ width: '56px', minWidth: '56px' }}>Icon</th>
                    <th style={{ minWidth: '220px' }}>Category / Subcategory</th>
                    <th style={{ minWidth: '130px' }}>Slug</th>
                    <th style={{ minWidth: '110px' }}>Products</th>
                    <th
                      className="text-end"
                      style={{
                        position: 'sticky',
                        right: 0,
                        background: '#f8fafc',
                        zIndex: 2,
                        minWidth: '140px',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <i className="fas fa-folder-open fs-2 mb-2 d-block opacity-50" />
                        No categories found in this view.
                      </td>
                    </tr>
                  ) : (
                    currentList.map((cat: any) => {
                      const depth = cat.depth || 0;
                      return (
                        <tr key={cat.id || cat._id || cat.slug} className={depth > 0 ? 'bg-light bg-opacity-25' : ''}>
                          <td>
                            <div
                              className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden border position-relative"
                              style={{
                                width: '36px',
                                height: '36px',
                                color: depth > 0 ? '#0284c7' : '#ea580c',
                                marginLeft: `${depth * 18}px`,
                              }}
                            >
                              {cat.image && !failedImages[cat.id] ? (
                                <OptimizedImage
                                  src={cat.image}
                                  alt={cat.name}
                                  fill
                                  sizes="36px"
                                  style={{ objectFit: 'cover' }}
                                  onError={() => markImageFailed(cat.id)}
                                />
                              ) : (
                                <i className={cat.icon || 'fas fa-tag'} />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1.5 flex-wrap" style={{ paddingLeft: `${depth * 18}px` }}>
                              {depth > 0 ? (
                                <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                                  {'↳'.repeat(Math.min(depth, 3))}
                                </span>
                              ) : (
                                <span className="badge bg-dark text-white rounded-pill" style={{ fontSize: '0.62rem' }}>MAIN</span>
                              )}
                              {depth > 0 && (
                                <span className="badge bg-info bg-opacity-10 text-primary border border-info border-opacity-25 rounded-pill" style={{ fontSize: '0.6rem' }}>
                                  LEVEL {depth}
                                </span>
                              )}
                              <span className={`text-dark text-break leading-normal py-0.5 ${depth > 0 ? 'fw-semibold text-secondary' : 'fw-bold'}`}>
                                {cat.name}
                              </span>
                            </div>
                            {cat.parentCategory && (
                              <div className="small text-muted font-monospace text-break" style={{ fontSize: '0.70rem', paddingLeft: `${depth * 18 + 14}px` }}>
                                Parent: <span className="text-primary">{cat.parentCategory}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <code className="text-muted small text-break">{cat.slug}</code>
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-2.5 py-1 ${cat.productCount > 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'}`}>
                              {cat.productCount} products
                            </span>
                          </td>

                          <td
                            className="text-end"
                            style={{
                              position: 'sticky',
                              right: 0,
                              background: depth > 0 ? '#f8fafc' : '#ffffff',
                              zIndex: 1,
                              boxShadow: '-4px 0 6px -2px rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <div className="d-inline-flex align-items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickAddSubcategory(cat.slug)}
                                className="btn btn-sm btn-outline-success border-0 rounded-pill px-2 py-1"
                                style={{ fontSize: '0.74rem', fontWeight: 600 }}
                                title={`Add Subcategory inside ${cat.name}`}
                              >
                                <i className="fas fa-plus me-1" /> Sub
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                className="btn btn-sm btn-outline-primary border-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '34px', height: '34px', minWidth: '34px' }}
                                title="Edit Category"
                              >
                                <i className="fas fa-edit" style={{ fontSize: '13px' }} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, productCount: cat.productCount })}
                                className="btn btn-sm btn-outline-danger border-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '34px', height: '34px', minWidth: '34px' }}
                                title="Delete Category"
                              >
                                <i className="fas fa-trash-alt" style={{ fontSize: '13px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add / Edit Category Form */}
        <div className="col-12 col-lg-4">
          <div
            id="category-form-card"
            className={`card shadow-sm rounded-4 bg-white p-3 p-sm-4 transition-all mb-5 ${
              editingCategory ? 'border-2 border-primary shadow' : 'border-0'
            }`}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-bold text-secondary m-0">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'Add New Category'}
              </h5>
              {editingCategory && (
                <span className="badge bg-primary text-white rounded-pill px-2 py-1 small">
                  ✏️ Editing Mode
                </span>
              )}
            </div>
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
                  className="form-select rounded-3 font-monospace small"
                >
                  <option value="">None (Make Root Category)</option>
                  {availableParentOptions.map((opt) => (
                    <option key={opt.id} value={opt.slug}>
                      {opt.depth > 0 ? `${'— '.repeat(opt.depth)}↳ ` : ''}{opt.name}
                    </option>
                  ))}
                </select>
                <div className="form-text small text-muted">
                  Choose any root or subcategory to create unlimited nested levels.
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className="form-label text-muted small fw-semibold mb-0">FontAwesome Icon Class</label>
                  <button
                    type="button"
                    onClick={handleAutoPickIcon}
                    className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                    style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    ✨ AI Auto-Pick Icon
                  </button>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-primary">
                    <i className={icon || 'fas fa-tag'} />
                  </span>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="form-control rounded-end-3"
                    placeholder="e.g. fas fa-car"
                  />
                </div>
                <div className="form-text small text-muted">
                  Auto-validated against active icon library with AI auto-correction fallback.
                </div>

                <IconPalettePicker
                  selectedIcon={icon}
                  onSelectIcon={(selected) => setIcon(selected)}
                  isOpen={iconPaletteOpen}
                  onToggle={() => setIconPaletteOpen(!iconPaletteOpen)}
                />
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
                      unoptimized
                    />
                  </div>
                  <div className="text-muted small mt-1">Image Preview</div>
                </div>
              )}

              <div className="d-flex gap-2 pt-2" data-admin-actions="true">
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
        message={
          deleteTarget && (deleteTarget.productCount || 0) > 0
            ? `Warning: "${deleteTarget.name}" currently contains ${deleteTarget.productCount} product(s). Deleting it will safely move those products to "General". Proceed?`
            : "Are you sure you want to permanently delete this category?"
        }
        itemName={deleteTarget?.name}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
