'use client';

import { useState, useEffect } from 'react';
import { SiteInfo, SiteInfoActiveTab, DEFAULT_SITE_INFO } from '@/types';
import { optimizeImageBeforeUpload } from '@/utils/imageOptimizer';

export function useAdminSiteInfo() {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  const [activeTab, setActiveTab] = useState<SiteInfoActiveTab>('general');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    try {
      setLoading(true);
      const res = await fetch('/api/site-info');
      const json = await res.json();
      if (json.success) {
        setInfo({ ...DEFAULT_SITE_INFO, ...json.data });
      } else {
        throw new Error(json.error || 'Failed to retrieve site information');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to the database.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setInfo((prev) => ({ ...prev, [name]: checked }));
    } else {
      setInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setError('');
    setSuccess('');

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
        setInfo((prev) => ({ ...prev, logoImage: json.url }));
        setSuccess('Logo image uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(json.error || 'Failed to upload logo image.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading logo image.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess('Site settings and contact information updated successfully!');
        setInfo({ ...DEFAULT_SITE_INFO, ...json.data });
        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(json.error || 'Failed to save changes.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const setCity = (city: string) => {
    setInfo((prev) => ({ ...prev, city }));
  };

  return {
    info,
    setInfo,
    setCity,
    activeTab,
    setActiveTab,
    loading,
    saving,
    logoUploading,
    error,
    success,
    handleChange,
    handleLogoUpload,
    handleSubmit,
  };
}
