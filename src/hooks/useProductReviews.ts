'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseProductReviewsProps {
  productId: string;
  initialRating?: number;
  initialReviewCount?: number;
}

export interface ReviewItem {
  _id: string;
  userName: string;
  userCity: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: Record<number, number>;
  withPhotosCount: number;
}

export function useProductReviews({
  productId,
  initialRating = 5,
  initialReviewCount = 0,
}: UseProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: initialReviewCount,
    averageRating: initialRating,
    ratingBreakdown: { 5: initialReviewCount, 4: 0, 3: 0, 2: 0, 1: 0 },
    withPhotosCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterPhotosOnly, setFilterPhotosOnly] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form State
  const [userName, setUserName] = useState('');
  const [userCity, setUserCity] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats && data.stats.totalReviews > 0) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleAddImage = useCallback(() => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  }, [imageUrlInput]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!userName.trim()) {
        setErrorMessage('Please enter your name');
        return;
      }
      if (!comment.trim() || comment.trim().length < 5) {
        setErrorMessage('Please write at least a short comment (5+ characters)');
        return;
      }

      try {
        setSubmitting(true);
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            userName,
            userCity: userCity || 'Pakistan',
            rating,
            title,
            comment,
            images,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setSubmitSuccess(true);
          setUserName('');
          setUserCity('');
          setTitle('');
          setComment('');
          setImages([]);
          await fetchReviews();
          setTimeout(() => {
            setIsWriteModalOpen(false);
            setSubmitSuccess(false);
          }, 2000);
        } else {
          setErrorMessage(data.error || 'Failed to submit review');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error connecting to server');
      } finally {
        setSubmitting(false);
      }
    },
    [productId, userName, userCity, rating, title, comment, images, fetchReviews]
  );

  const displayedReviews = filterPhotosOnly
    ? reviews.filter((r) => r.images && r.images.length > 0)
    : reviews;

  return {
    reviews: displayedReviews,
    allReviewsCount: reviews.length,
    stats,
    loading,
    filterPhotosOnly,
    setFilterPhotosOnly,
    isWriteModalOpen,
    setIsWriteModalOpen,
    lightboxImage,
    setLightboxImage,
    // Form handlers
    userName,
    setUserName,
    userCity,
    setUserCity,
    rating,
    setRating,
    title,
    setTitle,
    comment,
    setComment,
    imageUrlInput,
    setImageUrlInput,
    images,
    handleAddImage,
    handleRemoveImage,
    submitting,
    submitSuccess,
    errorMessage,
    handleSubmitReview,
  };
}
