'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VariantInput, SpecInput, ProductFormHookOptions } from '@/types';
import { useProductFormMedia } from './product-form/useProductFormMedia';
import { useProductFormVariants } from './product-form/useProductFormVariants';

export type { VariantInput, SpecInput, ProductFormHookOptions };

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
  const [subcategory, setSubcategory] = useState('');
  const [stock, setStock] = useState('10');
  const [heroText, setHeroText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTopSelling, setIsTopSelling] = useState(false);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Validation & DOCX
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [docxParsing, setDocxParsing] = useState(false);
  const docxInputRef = useRef<HTMLInputElement>(null);

  // Compose Media & Variants Sub-Hooks
  const media = useProductFormMedia(name);
  const variantState = useProductFormVariants();

  /* ── Initial Data Fetching ─────────────────────────────────────── */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!productId) return;
    async function fetchProduct() {
      try {
        setFetchingInitial(true);
        const res = await fetch(`/api/products/${productId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setName(p.name || '');
          setDescription(p.description || '');
          setPrice(p.price ? String(p.price) : '');
          setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
          setCategory(p.category || '');
          setSubcategory(p.subcategory || '');
          setStock(p.stock !== undefined ? String(p.stock) : '10');
          setHeroText(p.heroText || '');
          setIsFeatured(Boolean(p.isFeatured));
          setIsNewArrival(Boolean(p.isNewArrival));
          setIsTopSelling(Boolean(p.isTopSelling));

          media.setImage(p.image || '');
          media.setImages(p.images || []);
          media.setVideo(p.video || '');
          media.setShowVideoOnFront(Boolean(p.showVideoOnFront));

          if (p.specifications && typeof p.specifications === 'object') {
            const arr = Object.entries(p.specifications).map(([k, v]) => ({
              key: k,
              value: String(v),
            }));
            variantState.setSpecs(arr.length ? arr : [{ key: 'Brand', value: '' }]);
          }

          if (Array.isArray(p.variants)) {
            const arr = p.variants.map((v: any) => ({
              name: v.name || '',
              price: v.price ? String(v.price) : '',
              originalPrice: v.originalPrice ? String(v.originalPrice) : '',
              stock: v.stock !== undefined ? String(v.stock) : '10',
              image: v.image || '',
              description: v.description || '',
            }));
            variantState.setVariants(arr);
          }

          setSeoTitle(p.seoTitle || '');
          setSeoDescription(p.seoDescription || '');
          setSeoKeywords(p.seoKeywords || '');
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Error fetching product data.');
      } finally {
        setFetchingInitial(false);
      }
    }
    fetchProduct();
  }, [productId]);

  /* ── DOCX Parser ──────────────────────────────────────────────── */
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
        if (data.image) media.setImage(data.image);
        if (data.images?.length) media.setImages(data.images);
        if (data.specifications) {
          const newSpecs = Object.entries(data.specifications).map(([k, v]) => ({ key: k, value: String(v) }));
          variantState.setSpecs(newSpecs);
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
  }, [media, variantState]);

  /* ── Submit Action ────────────────────────────────────────────── */
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
    if (!media.image.trim()) errors.image = 'Please upload an image file or provide an image URL link.';

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
    variantState.specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    });

    const parsedVariants = variantState.variants
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
      subcategory: subcategory.trim(),
      image: media.image.trim(),
      images: media.images.map((i) => i.trim()).filter(Boolean),
      video: media.video ? media.video.trim() : undefined,
      showVideoOnFront: media.showVideoOnFront,
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
        if (media.pendingVideoUploadId && targetId) {
          media.associateProductWithUpload(media.pendingVideoUploadId, targetId);
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
    subcategory,
    heroText,
    isFeatured,
    isNewArrival,
    isTopSelling,
    seoTitle,
    seoDescription,
    seoKeywords,
    isEditMode,
    productId,
    media,
    variantState,
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
    subcategory,
    setSubcategory,
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
    image: media.image,
    setImage: media.setImage,
    images: media.images,
    setImages: media.setImages,
    video: media.video,
    setVideo: media.setVideo,
    showVideoOnFront: media.showVideoOnFront,
    setShowVideoOnFront: media.setShowVideoOnFront,
    uploading: media.uploading,
    galleryUploading: media.galleryUploading,
    galleryUrlInput: media.galleryUrlInput,
    setGalleryUrlInput: media.setGalleryUrlInput,
    mainImageError: media.mainImageError,
    setMainImageError: media.setMainImageError,
    galleryImageErrors: media.galleryImageErrors,
    setGalleryImageErrors: media.setGalleryImageErrors,
    mediaFeedback: media.mediaFeedback,
    setMediaFeedback: media.setMediaFeedback,
    variants: variantState.variants,
    variantUploading: variantState.variantUploading,
    specs: variantState.specs,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    seoKeywords,
    setSeoKeywords,
    validationErrors,
    docxParsing,
    docxInputRef,
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => media.handleFileChange(e, setError),
    handleGalleryFileChange: (e: React.ChangeEvent<HTMLInputElement>) => media.handleGalleryFileChange(e, setError),
    handleAddGalleryUrl: media.handleAddGalleryUrl,
    handleRemoveGalleryImage: media.handleRemoveGalleryImage,
    handleSetMainImage: media.handleSetMainImage,
    handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => media.handleVideoChange(e, setError),
    handleAddVariant: variantState.handleAddVariant,
    handleRemoveVariant: variantState.handleRemoveVariant,
    handleVariantChange: variantState.handleVariantChange,
    handleVariantFileChange: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => variantState.handleVariantFileChange(idx, e, setError),
    handleAddSpecRow: variantState.handleAddSpecRow,
    handleRemoveSpecRow: variantState.handleRemoveSpecRow,
    handleSpecChange: variantState.handleSpecChange,
    handleDocxFileChange,
    handleSubmit,
  };
}
