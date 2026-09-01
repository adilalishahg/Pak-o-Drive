'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUpload } from '../context/AdminUploadContext';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';

export interface VariantInput {
  name: string;
  price: string;
  originalPrice: string;
  stock: string;
  image: string;
  description: string;
}

export interface SpecInput {
  key: string;
  value: string;
}

export interface ProductFormHookOptions {
  productId?: string;
}

export function useProductForm({ productId }: ProductFormHookOptions = {}) {
  const router = useRouter();
  const isEditMode = Boolean(productId);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(isEditMode);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('10');
  const [heroText, setHeroText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTopSelling, setIsTopSelling] = useState(false);

  // Images & Media
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState('');
  const [showVideoOnFront, setShowVideoOnFront] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [mainImageError, setMainImageError] = useState(false);
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});


  // Background Video Upload
  const { tasks, startVideoUpload, associateProductWithUpload } = useAdminUpload();
  const [pendingVideoUploadId, setPendingVideoUploadId] = useState('');

  // Variants & Specs
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [variantUploading, setVariantUploading] = useState<Record<number, boolean>>({});
  const [specs, setSpecs] = useState<SpecInput[]>([{ key: 'Brand', value: '' }]);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Validation & Docx
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [docxParsing, setDocxParsing] = useState(false);
  const docxInputRef = useRef<HTMLInputElement>(null);

  // Load Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategories(json.data);
          if (!isEditMode) {
            const firstRoot = json.data.find((c: any) => !c.parentCategory) || json.data[0];
            setCategory(firstRoot.slug);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, [isEditMode]);

  // Load existing product if in Edit Mode
  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      setFetchingInitial(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setName(p.name || '');
          setDescription(p.description || '');
          setPrice(String(p.price || ''));
          setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
          setStock(p.stock !== undefined ? String(p.stock) : '10');
          setCategory(p.category || '');
          setImage(p.image || '');
          setImages(p.images || []);
          setVideo(p.video || '');
          setShowVideoOnFront(Boolean(p.showVideoOnFront));
          setHeroText(p.heroText || '');
          setIsFeatured(Boolean(p.isFeatured));

          setIsNewArrival(Boolean(p.isNewArrival));
          setIsTopSelling(Boolean(p.isTopSelling));
          setSeoTitle(p.seoTitle || '');
          setSeoDescription(p.seoDescription || '');
          setSeoKeywords(p.seoKeywords || '');

          if (p.variants && p.variants.length > 0) {
            setVariants(
              p.variants.map((v: any) => ({
                name: v.name || '',
                price: v.price ? String(v.price) : '',
                originalPrice: v.originalPrice ? String(v.originalPrice) : '',
                stock: v.stock !== undefined ? String(v.stock) : '10',
                image: v.image || '',
                description: v.description || '',
              }))
            );
          }

          if (p.specifications && Object.keys(p.specifications).length > 0) {
            const formatted = Object.entries(p.specifications).map(([key, value]) => ({
              key,
              value: String(value),
            }));
            setSpecs(formatted);
          }
        } else {
          setError(json.error || 'Product not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product.');
      } finally {
        setFetchingInitial(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // Video Upload Background Sync
  useEffect(() => {
    if (pendingVideoUploadId) {
      const task = tasks.find((t) => t.id === pendingVideoUploadId);
      if (task) {
        if (task.status === 'completed' && task.url) {
          setVideo(task.url);
        } else if (task.status === 'failed') {
          setError(task.error || 'Video upload failed in background.');
        }
      }
    }
  }, [tasks, pendingVideoUploadId]);

  useEffect(() => {
    setMainImageError(false);
  }, [image]);

  useEffect(() => {
    setGalleryImageErrors({});
  }, [images]);

  /* ── Image & Media Handlers ───────────────────────────────────── */
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const optimizedFile = await optimizeImageBeforeUpload(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
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
  }, []);

  const handleGalleryFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const optimizedFile = await optimizeImageBeforeUpload(file);
        const formData = new FormData();
        formData.append('file', optimizedFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
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
  }, []);

  const handleAddGalleryUrl = useCallback(() => {
    if (!galleryUrlInput.trim()) return;
    setImages((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput('');
  }, [galleryUrlInput]);

  const handleRemoveGalleryImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleSetMainImage = useCallback((url: string) => {
    setImage((oldMain) => {
      if (oldMain.trim()) {
        setImages((prev) => [...prev.filter((x) => x !== url), oldMain]);
      } else {
        setImages((prev) => prev.filter((x) => x !== url));
      }
      return url;
    });
  }, []);

  const handleVideoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError('');
      try {
        const tempId = startVideoUpload(file, name || 'Product');
        setPendingVideoUploadId(tempId);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error starting background video upload.');
      }
    },
    [name, startVideoUpload]
  );

  /* ── Variant Handlers ─────────────────────────────────────────── */
  const handleAddVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      { name: '', price: '', originalPrice: '', stock: '10', image: '', description: '' },
    ]);
  }, []);

  const handleRemoveVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleVariantChange = useCallback((index: number, field: keyof VariantInput, value: string) => {
    setVariants((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const handleVariantFileChange = useCallback(async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVariantUploading((prev) => ({ ...prev, [index]: true }));
    setError('');

    try {
      const optimizedFile = await optimizeImageBeforeUpload(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
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
  }, [handleVariantChange]);

  /* ── Specification Handlers ───────────────────────────────────── */
  const handleAddSpecRow = useCallback(() => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const handleRemoveSpecRow = useCallback((index: number) => {
    setSpecs((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  }, []);

  const handleSpecChange = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  /* ── DOCX Document Parser ─────────────────────────────────────── */
  const handleDocxFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocxParsing(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/products/parse-document', { method: 'POST', body: formData });
      const json = await res.json();

      if (json.success && json.data) {
        const data = json.data;
        if (data.name) setName(data.name);
        if (data.description) setDescription(data.description);
        if (data.price) setPrice(String(data.price));
        if (data.originalPrice) setOriginalPrice(String(data.originalPrice));
        if (data.stock) setStock(String(data.stock));
        if (data.category) setCategory(data.category);
        if (data.image) setImage(data.image);
        if (data.images?.length) setImages(data.images);
        if (data.specifications) {
          const newSpecs = Object.entries(data.specifications).map(([k, v]) => ({ key: k, value: String(v) }));
          setSpecs(newSpecs);
        }
        if (data.seoTitle) setSeoTitle(data.seoTitle);
        if (data.seoDescription) setSeoDescription(data.seoDescription);
        if (data.seoKeywords) setSeoKeywords(data.seoKeywords);

        setSuccessMessage('Form populated successfully from DOCX file!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(json.error || 'Failed to parse DOCX file.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing DOCX file.');
    } finally {
      setDocxParsing(false);
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  }, []);

  /* ── Submit Action (Create / Update) ──────────────────────────── */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Product name is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!price || Number(price) <= 0) errors.price = 'Price must be a positive number.';
    if (!stock || Number(stock) < 0) errors.stock = 'Stock cannot be negative.';
    if (!image.trim()) errors.image = 'Please upload an image file or provide an image URL link.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please correct the highlighted errors before saving.');
      setLoading(false);
      const firstErrorField = Object.keys(errors)[0];
      const targetId = firstErrorField === 'image' ? 'image' : firstErrorField;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    const specifications: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    });

    const parsedVariants = variants
      .filter((v) => v.name.trim().length > 0)
      .map((v) => ({
        name: v.name.trim(),
        price: Number(v.price) || Number(price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
        stock: Number(v.stock) || 0,
        image: v.image ? v.image.trim() : undefined,
        description: v.description ? v.description.trim() : undefined,
      }));

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      category: category.trim(),
      image: image.trim(),
      images: images.map((i) => i.trim()).filter(Boolean),
      video: video ? video.trim() : undefined,
      showVideoOnFront,
      heroText: heroText.trim(),
      isFeatured,
      isNewArrival,
      isTopSelling,
      specifications,
      variants: parsedVariants,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoKeywords: seoKeywords.trim(),
    };

    try {
      const endpoint = isEditMode ? `/api/products/${productId}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        const targetId = isEditMode ? productId : json.data?._id;
        if (pendingVideoUploadId && targetId) {
          associateProductWithUpload(pendingVideoUploadId, targetId);
        }
        router.push('/admin/products');
        router.refresh();
      } else {
        throw new Error(json.error || 'Failed to save product.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving product.');
    } finally {
      setLoading(false);
    }
  }, [
    name,
    description,
    price,
    originalPrice,
    stock,
    category,
    image,
    images,
    video,
    showVideoOnFront,
    heroText,
    isFeatured,
    isNewArrival,
    isTopSelling,
    specs,
    variants,
    seoTitle,
    seoDescription,
    seoKeywords,
    isEditMode,
    productId,
    pendingVideoUploadId,
    associateProductWithUpload,
    router,
  ]);

  return {
    isEditMode,
    categories,
    loading,
    fetchingInitial,
    error,
    setError,
    successMessage,
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    originalPrice,
    setOriginalPrice,
    category,
    setCategory,
    stock,
    setStock,
    heroText,
    setHeroText,
    isFeatured,
    setIsFeatured,
    isNewArrival,
    setIsNewArrival,
    isTopSelling,
    setIsTopSelling,
    image,
    setImage,
    images,
    setImages,
    video,
    setVideo,
    showVideoOnFront,
    setShowVideoOnFront,
    uploading,
    galleryUploading,
    galleryUrlInput,
    setGalleryUrlInput,
    mainImageError,
    setMainImageError,
    galleryImageErrors,
    setGalleryImageErrors,
    variants,
    variantUploading,
    specs,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    seoKeywords,
    setSeoKeywords,
    validationErrors,
    docxParsing,
    docxInputRef,
    handleFileChange,
    handleGalleryFileChange,
    handleAddGalleryUrl,
    handleRemoveGalleryImage,
    handleSetMainImage,
    handleVideoChange,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantChange,
    handleVariantFileChange,
    handleAddSpecRow,
    handleRemoveSpecRow,
    handleSpecChange,
    handleDocxFileChange,
    handleSubmit,
  };
}

