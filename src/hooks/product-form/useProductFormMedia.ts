'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminUpload } from '@/context/AdminUploadContext';
import { optimizeImageBeforeUpload } from '@/utils/imageOptimizer';

export function useProductFormMedia(productName: string) {
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState('');
  const [showVideoOnFront, setShowVideoOnFront] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [mainImageError, setMainImageError] = useState(false);
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});
  const [mediaFeedback, setMediaFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { tasks, startVideoUpload, associateProductWithUpload } = useAdminUpload();
  const [pendingVideoUploadId, setPendingVideoUploadId] = useState('');

  // Video Upload Background Sync
  useEffect(() => {
    if (pendingVideoUploadId) {
      const task = tasks.find((t: any) => t.id === pendingVideoUploadId);
      if (task) {
        if (task.status === 'completed' && task.url) {
          setVideo(task.url);
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

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, onError: (msg: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    onError('');
    setMediaFeedback(null);

    try {
      const optimizedFile = await optimizeImageBeforeUpload(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          authorization: 'Bearer pakodrive_admin_secret_token',
        },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setImage(json.url);
        setMainImageError(false);
        setMediaFeedback({ type: 'success', message: 'Main image updated successfully!' });
      } else {
        throw new Error(json.error || 'Failed to upload image file.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Error uploading file.';
      onError(msg);
      setMediaFeedback({ type: 'error', message: msg });
    } finally {
      setUploading(false);
      if (e?.target) {
        e.target.value = '';
      }
    }
  }, []);

  const handleGalleryFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, onError: (msg: string) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    onError('');
    setMediaFeedback(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const optimizedFile = await optimizeImageBeforeUpload(file);
        const formData = new FormData();
        formData.append('file', optimizedFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            authorization: 'Bearer pakodrive_admin_secret_token',
          },
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
      setMediaFeedback({ type: 'success', message: `${urls.length} gallery image(s) uploaded successfully!` });
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Error uploading gallery files.';
      onError(msg);
      setMediaFeedback({ type: 'error', message: msg });
    } finally {
      setGalleryUploading(false);
      if (e?.target) {
        e.target.value = '';
      }
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
    async (e: React.ChangeEvent<HTMLInputElement>, onError: (msg: string) => void) => {
      const file = e.target.files?.[0];
      if (!file) return;

      onError('');
      try {
        const tempId = startVideoUpload(file, productName || 'Product');
        setPendingVideoUploadId(tempId);
      } catch (err: any) {
        console.error(err);
        onError(err.message || 'Error starting background video upload.');
      }
    },
    [productName, startVideoUpload]
  );

  return {
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
    mediaFeedback,
    setMediaFeedback,
    pendingVideoUploadId,
    associateProductWithUpload,
    handleFileChange,
    handleGalleryFileChange,
    handleAddGalleryUrl,
    handleRemoveGalleryImage,
    handleSetMainImage,
    handleVideoChange,
  };
}
