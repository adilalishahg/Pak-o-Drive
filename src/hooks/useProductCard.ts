'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSiteTheme } from '../components/common/DynamicThemeProvider';
import { IProduct } from '../types';

export interface UseProductCardProps {
  product: IProduct;
}

export function useProductCard({ product }: UseProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { theme } = useSiteTheme();

  const [adding, setAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || '/img/product-placeholder.png');

  const formattedId = useMemo(() => {
    return product._id ? product._id.toString() : '';
  }, [product._id]);

  const isCleanWhite = theme.layoutTheme === 'theme1';
  const isModernGreen = theme.layoutTheme === 'modern-green';

  const secondaryImage = useMemo(() => {
    return (product.images && product.images.length > 0 && product.images[0] !== product.image)
      ? product.images[0]
      : null;
  }, [product.images, product.image]);

  const displayImage = (isHovered && secondaryImage) ? secondaryImage : imgSrc;

  const discountPercent = useMemo(() => {
    return product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
  }, [product.originalPrice, product.price]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    const t = setTimeout(() => setAdding(false), 900);
    return () => clearTimeout(t);
  }, [addToCart, product]);

  const handleQuickBuy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    router.push('/checkout');
  }, [addToCart, product, router]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (formattedId) {
      router.prefetch(`/product/${formattedId}`);
    }
  }, [formattedId, router]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleCardClick = useCallback(() => {
    if (formattedId) {
      router.push(`/product/${formattedId}`);
    }
  }, [formattedId, router]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (formattedId) {
      toggleWishlist(formattedId);
    }
  }, [formattedId, toggleWishlist]);

  const handleImageError = useCallback(() => {
    setImgSrc('/img/product-placeholder.png');
  }, []);

  const inWishlist = formattedId ? isInWishlist(formattedId) : false;

  return {
    theme,
    isCleanWhite,
    isModernGreen,
    formattedId,
    adding,
    isHovered,
    displayImage,
    discountPercent,
    inWishlist,
    handleAddToCart,
    handleQuickBuy,
    handleMouseEnter,
    handleMouseLeave,
    handleCardClick,
    handleToggleWishlist,
    handleImageError,
  };
}
