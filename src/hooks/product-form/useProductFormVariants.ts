'use client';

import { useState, useCallback } from 'react';
import { VariantInput, SpecInput } from '@/types';
import { optimizeImageBeforeUpload } from '@/utils/imageOptimizer';

export function useProductFormVariants() {
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [variantUploading, setVariantUploading] = useState<Record<number, boolean>>({});
  const [specs, setSpecs] = useState<SpecInput[]>([{ key: 'Brand', value: '' }]);

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

  const handleVariantFileChange = useCallback(async (index: number, e: React.ChangeEvent<HTMLInputElement>, onError: (msg: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVariantUploading((prev) => ({ ...prev, [index]: true }));
    onError('');

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
        handleVariantChange(index, 'image', json.url);
      } else {
        throw new Error(json.error || 'Failed to upload variant image.');
      }
    } catch (err: any) {
      console.error(err);
      onError(err.message || 'Error uploading variant image.');
    } finally {
      setVariantUploading((prev) => ({ ...prev, [index]: false }));
      if (e?.target) {
        e.target.value = '';
      }
    }
  }, [handleVariantChange]);

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

  return {
    variants,
    setVariants,
    variantUploading,
    specs,
    setSpecs,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantChange,
    handleVariantFileChange,
    handleAddSpecRow,
    handleRemoveSpecRow,
    handleSpecChange,
  };
}
