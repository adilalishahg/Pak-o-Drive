'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminUpload } from '../../../../context/AdminUploadContext';
import { optimizeImageBeforeUpload } from '../../../../utils/imageOptimizer';

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [video, setVideo] = useState('');
  const { tasks, startVideoUpload, associateProductWithUpload } = useAdminUpload();
  const [pendingVideoUploadId, setPendingVideoUploadId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  const [mainImageError, setMainImageError] = useState(false);
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});

  interface VariantInput {
    name: string;
    price: string;
    originalPrice: string;
    stock: string;
    image: string;
    description: string;
  }

  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [variantUploading, setVariantUploading] = useState<Record<number, boolean>>({});

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', price: '', originalPrice: '', stock: '10', image: '', description: '' }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleVariantFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVariantUploading((prev) => ({ ...prev, [index]: true }));
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
        handleVariantChange(index, 'image', json.url);
      } else {
        throw new Error(json.error || 'Failed to upload variant image.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading variant file.');
    } finally {
      setVariantUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    setMainImageError(false);
  }, [image]);

  useEffect(() => {
    setGalleryImageErrors({});
  }, [images]);

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const optimizedFile = await optimizeImageBeforeUpload(file);
        const formData = new FormData();
        formData.append('file', optimizedFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        if (json.success) {
          return json.url;
        } else {
          throw new Error(json.error || `Failed to upload gallery image: ${file.name}`);
        }
      });

      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading gallery files.');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setImages((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetMainImage = (url: string) => {
    const oldMain = image;
    setImage(url);
    if (oldMain.trim()) {
      setImages((prev) => [...prev.filter((x) => x !== url), oldMain]);
    } else {
      setImages((prev) => prev.filter((x) => x !== url));
    }
  };

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

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      const tempId = startVideoUpload(file, name || 'New Product');
      setPendingVideoUploadId(tempId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error starting background video upload.');
    }
  };
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTopSelling, setIsTopSelling] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Specifications
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Brand', value: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategories(json.data);
          // Default select first root (non-sub) category
          const firstRoot = json.data.find((c: any) => !c.parentCategory) || json.data[0];
          setCategory(firstRoot.slug);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (pendingVideoUploadId) {
      const task = tasks.find(t => t.id === pendingVideoUploadId);
      if (task) {
        if (task.status === 'completed' && task.url) {
          setVideo(task.url);
        } else if (task.status === 'failed') {
          setError(task.error || 'Video upload failed in background.');
        }
      }
    }
  }, [tasks, pendingVideoUploadId]);

  const handleAddSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    if (specs.length === 1) return;
    setSpecs(specs.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!image.trim()) {
      setError('Please upload an image file or provide an image URL link.');
      setLoading(false);
      return;
    }

    // Format specifications Map/Record
    const specifications: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      name,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      category,
      image,
      images,
      video,
      seoTitle,
      seoDescription,
      seoKeywords,
      stock: Number(stock),
      isFeatured,
      isNewArrival,
      isTopSelling,
      specifications,
      variants: variants.map(v => ({
        name: v.name,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
        stock: Number(v.stock),
        image: v.image,
        description: v.description,
      })),
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        if (pendingVideoUploadId && json.data?._id) {
          associateProductWithUpload(pendingVideoUploadId, json.data._id);
        }
        router.push('/admin/products');
      } else {
        throw new Error(json.error || 'Failed to create product');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing request.');
      setLoading(false);
    }
  };

  const currentTask = tasks.find((t) => t.id === pendingVideoUploadId);
  const isVideoUploading = currentTask ? currentTask.status === 'uploading' : false;

  return (
    <div className="fade-in">
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="fw-bold text-secondary mb-0">Create New Product</h5>
          <Link href="/admin/products" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i className="fas fa-arrow-left me-1.5" /> Back to List
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Main Info */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">General Information</h6>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control rounded-3"
                  rows={6}
                  placeholder="Provide detailed description of product highlights, features, and package box contents..."
                />
              </div>
            </div>

            {/* Specifications Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                <h6 className="fw-bold text-dark mb-0">Technical Specifications</h6>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="btn btn-sm btn-outline-primary rounded-pill px-2.5"
                >
                  <i className="fas fa-plus me-1" /> Add Row
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                {specs.map((s, idx) => (
                  <div key={idx} className="d-flex gap-2 align-items-center">
                    <input
                      type="text"
                      value={s.key}
                      onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                      placeholder="Specification Title (e.g. Color)"
                      className="form-control rounded-3"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      placeholder="Detail value (e.g. Black matte)"
                      className="form-control rounded-3"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      disabled={specs.length === 1}
                      onClick={() => handleRemoveSpecRow(idx)}
                      className="btn btn-outline-danger border-0 rounded-circle"
                      style={{ width: '38px', height: '38px' }}
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mt-4">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                <h6 className="fw-bold text-dark mb-0">Product Variants</h6>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="btn btn-sm btn-outline-primary rounded-pill px-2.5"
                >
                  <i className="fas fa-plus me-1" /> Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No variants added yet. Add variants if you have different colors, models, or types for this product.
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className="border rounded-4 p-3 bg-light position-relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="btn btn-sm btn-outline-danger border-0 rounded-circle position-absolute top-0 end-0 m-2"
                        title="Remove Variant"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                      >
                        <i className="fas fa-times" />
                      </button>
                      <h6 className="fw-bold text-secondary mb-3">Variant #{idx + 1}</h6>
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label text-muted small fw-semibold">Variant Name *</label>
                          <input
                            type="text"
                            required
                            value={v.name}
                            onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                            placeholder="e.g. White Color / Simple Bluetooth"
                            className="form-control rounded-3"
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          <label className="form-label text-muted small fw-semibold">Price (PKR) *</label>
                          <input
                            type="number"
                            required
                            value={v.price}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            placeholder="Price"
                            className="form-control rounded-3"
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          <label className="form-label text-muted small fw-semibold">Original Price (PKR)</label>
                          <input
                            type="number"
                            value={v.originalPrice}
                            onChange={(e) => handleVariantChange(idx, 'originalPrice', e.target.value)}
                            placeholder="Original Price"
                            className="form-control rounded-3"
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label text-muted small fw-semibold">Upload Image OR URL</label>
                          <div className="input-group mb-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVariantFileChange(idx, e)}
                              className="form-control rounded-start-3"
                            />
                            {variantUploading[idx] && (
                              <span className="input-group-text bg-white">
                                <span className="spinner-border spinner-border-sm text-primary" />
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={v.image}
                            onChange={(e) => handleVariantChange(idx, 'image', e.target.value)}
                            placeholder="Or enter image URL directly"
                            className="form-control rounded-3"
                          />
                          {v.image && (
                            <div className="mt-2 text-center border rounded bg-white p-2 position-relative" style={{ height: '80px', width: '80px' }}>
                              <Image
                                src={v.image}
                                alt={`Variant ${idx + 1} preview`}
                                fill
                                style={{ objectFit: 'contain' }}
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label text-muted small fw-semibold">Stock & Description</label>
                          <input
                            type="number"
                            required
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                            placeholder="Stock Quantity"
                            className="form-control rounded-3 mb-2"
                          />
                          <textarea
                            value={v.description}
                            onChange={(e) => handleVariantChange(idx, 'description', e.target.value)}
                            placeholder="Variant description (Optional)"
                            className="form-control rounded-3"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEO Configurations Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mt-4">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">SEO Configurations (Optional)</h6>
              <p className="text-muted small mb-3">Add custom SEO meta tags to override default parameters. Leaving these blank will dynamically generate metadata based on the product name and description.</p>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">SEO Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones | Best Price in Pakistan"
                />
                <div className="form-text small">Recommended length: 50-60 characters.</div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">SEO Meta Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="form-control rounded-3"
                  rows={3}
                  placeholder="e.g. Buy original Sony WH-1000XM5 wireless headphones in Pakistan with 30-day returns, free delivery, and official warranty. Order today!"
                />
                <div className="form-text small">Recommended length: 150-160 characters.</div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">SEO Meta Keywords</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="e.g. sony wh-1000xm5, wireless headphones, bluetooth headset"
                />
                <div className="form-text small">Comma separated search phrases.</div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="col-12 col-lg-4">
            {/* Price & Stock Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Pricing & Inventory</h6>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Price (PKR) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="Sales Price"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Original Price (PKR)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="Compare price (Discount fallback)"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Inventory Stock *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="Quantity in warehouse"
                />
              </div>
            </div>

            {/* Media & Meta */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Category & Media</h6>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Product Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select rounded-3 text-capitalize"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories defined — add from admin</option>
                  ) : (
                    (() => {
                      const roots = categories.filter((c: any) => !c.parentCategory);
                      const subs = categories.filter((c: any) => c.parentCategory);
                      const orphans = subs.filter((s: any) => !roots.find((r: any) => r.slug === s.parentCategory));
                      return (
                        <>
                          {roots.map((root: any) => {
                            const children = subs.filter((s: any) => s.parentCategory === root.slug);
                            return children.length > 0 ? (
                              <optgroup key={root.slug} label={`📁 ${root.name}`}>
                                <option value={root.slug}>{root.name} (All)</option>
                                {children.map((sub: any) => (
                                  <option key={sub.slug} value={sub.slug}>
                                    ↳ {sub.name}
                                  </option>
                                ))}
                              </optgroup>
                            ) : (
                              <option key={root.slug} value={root.slug}>{root.name}</option>
                            );
                          })}
                          {orphans.map((s: any) => (
                            <option key={s.slug} value={s.slug}>{s.name}</option>
                          ))}
                        </>
                      );
                    })()
                  )}
                </select>
                {category && (
                  <div className="form-text">
                    <i className="fas fa-tag me-1 text-primary" style={{ fontSize: '11px' }} />
                    Selected: <strong>{categories.find((c: any) => c.slug === category)?.name || category}</strong>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control rounded-3"
                />
                {uploading && (
                  <div className="d-flex align-items-center gap-1.5 mt-1.5 text-primary small">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Uploading image...</span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Or Provide Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="form-control rounded-3"
                  placeholder="Path: /img/product-1.png or absolute URL"
                />
              </div>

              <div className="bg-light p-3 rounded-3 text-center border mb-3">
                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="position-relative w-100">
                  <Image
                    src={mainImageError ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120' : (image || '/img/product-placeholder.png')}
                    alt="Preview"
                    fill
                    sizes="120px"
                    style={{ objectFit: 'contain' }}
                    onError={() => setMainImageError(true)}
                    unoptimized
                  />
                </div>
                <div className="text-muted small mt-2">Image Preview</div>
              </div>

              {/* Product Video Section */}
              <div className="border-top pt-3 mb-3">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Upload Product Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="form-control rounded-3"
                  />
                  {isVideoUploading && (
                    <div className="d-flex align-items-center gap-1.5 mt-1.5 text-primary small">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Uploading video ({currentTask?.progress || 0}%)...</span>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Or Provide Video URL</label>
                  <input
                    type="text"
                    value={video}
                    onChange={(e) => setVideo(e.target.value)}
                    className="form-control rounded-3"
                    placeholder="Path: /img/product-video.mp4 or absolute URL"
                  />
                </div>

                {video && (
                  <div className="bg-light p-3 rounded-3 text-center border mb-3">
                    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="w-100">
                      <video
                        src={video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="text-muted small mt-2 d-flex justify-content-between align-items-center px-2">
                      <span>Video Preview</span>
                      <button
                        type="button"
                        onClick={() => setVideo('')}
                        className="btn btn-xs btn-outline-danger py-0.5 px-1.5 rounded"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Gallery Section */}
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark mb-3">Product Gallery Images (Optional)</h6>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Upload Gallery Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileChange}
                    className="form-control rounded-3"
                  />
                  {galleryUploading && (
                    <div className="d-flex align-items-center gap-1.5 mt-1.5 text-primary small">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Uploading gallery images...</span>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Or Add Gallery Image URL</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      className="form-control rounded-start-3"
                      placeholder="e.g. /img/product-gallery-1.png"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="btn btn-outline-secondary rounded-end-3"
                    >
                      Add Url
                    </button>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="d-flex flex-column gap-2 mt-3">
                    <label className="form-label text-muted small fw-semibold mb-0">Gallery Items ({images.length})</label>
                    <div className="row g-2">
                      {images.map((imgUrl, idx) => (
                        <div key={idx} className="col-6">
                          <div className="card p-2 border bg-light h-100 d-flex flex-column align-items-center justify-content-between text-center rounded-3">
                            <div className="mb-2 position-relative w-100" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image
                                src={galleryImageErrors[idx] ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100' : imgUrl}
                                alt={`Gallery preview ${idx + 1}`}
                                fill
                                sizes="80px"
                                style={{ objectFit: 'contain' }}
                                onError={() => setGalleryImageErrors((prev) => ({ ...prev, [idx]: true }))}
                                unoptimized
                              />
                            </div>
                            <div className="d-flex gap-1 w-100 justify-content-center">
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(imgUrl)}
                                className="btn btn-xs btn-outline-success py-1 px-1.5 rounded"
                                title="Make Main Image"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <i className="fas fa-star small me-0.5" /> Main
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="btn btn-xs btn-outline-danger py-1 px-1.5 rounded"
                                title="Remove Image"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <i className="fas fa-trash small" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Promotions & Flags */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Product Tags / Ribbons</h6>
              <div className="form-check form-switch mb-2.5">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="form-check-input"
                  id="newArrivalSwitch"
                />
                <label className="form-check-label text-dark small" htmlFor="newArrivalSwitch">
                  New Arrival Badge
                </label>
              </div>

              <div className="form-check form-switch mb-2.5">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="form-check-input"
                  id="featuredSwitch"
                />
                <label className="form-check-label text-dark small" htmlFor="featuredSwitch">
                  Featured Product
                </label>
              </div>

              <div className="form-check form-switch mb-0">
                <input
                  type="checkbox"
                  checked={isTopSelling}
                  onChange={(e) => setIsTopSelling(e.target.checked)}
                  className="form-check-input"
                  id="topSellingSwitch"
                />
                <label className="form-check-label text-dark small" htmlFor="topSellingSwitch">
                  Top Selling / Popular
                </label>
              </div>
            </div>

            {/* Submit Bar */}
            <button
              type="submit"
              disabled={loading || uploading || galleryUploading}
              className="btn btn-gradient w-100 py-2.5 fw-semibold border-0 text-white rounded-3 shadow"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" /> Creating...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
