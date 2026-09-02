'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { IProduct, IProductVariant } from '../types';

export interface UseProductActionsProps {
  product: IProduct;
  selectedVariant?: IProductVariant;
}

export function useProductActions({ product, selectedVariant }: UseProductActionsProps) {
  const router = useRouter();
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [copied, setCopied] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const stockLimit = selectedVariant !== undefined ? selectedVariant.stock : product.stock;
  const outOfStock = stockLimit === 0;
  const isUnlimited = stockLimit < 0;
  const finalPrice = selectedVariant ? selectedVariant.price : product.price;

  // Reset quantity to 1 if the selected variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  // Monitor scroll for mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdd = useCallback(() => {
    addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addToCart, product, quantity, selectedVariant]);

  const handleBuyNow = useCallback(() => {
    addToCart(product, quantity, selectedVariant);
    router.push('/checkout');
  }, [addToCart, product, quantity, selectedVariant, router]);

  const handleWhatsApp = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const displayName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const text = encodeURIComponent(
      `السلام علیکم! Mujhe yeh product order karna hai:\n\n*Product:* ${displayName}\n*Price:* Rs. ${finalPrice.toLocaleString()} (Cash On Delivery)\n\n${url}\n\nDelivery Address aur details share kar raha hoon:`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  }, [selectedVariant, product.name, finalPrice, whatsappNumber]);

  const handleNativeShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const displayName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const shareData = {
      title: `${displayName} — Pak-o-Drive`,
      text: `${displayName} (Rs. ${finalPrice.toLocaleString()})\nOrder Online on Pak-o-Drive:`,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled native share
      }
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [selectedVariant, product.name, finalPrice]);

  const incrementQuantity = useCallback(() => {
    setQuantity((q) => (!isUnlimited ? Math.min(stockLimit, q + 1) : q + 1));
  }, [isUnlimited, stockLimit]);

  const decrementQuantity = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  return {
    quantity,
    added,
    showSticky,
    copied,
    stockLimit,
    outOfStock,
    isUnlimited,
    finalPrice,
    cartCount,
    isInWishlist: isInWishlist(product._id || ''),
    toggleWishlist: () => toggleWishlist(product._id || ''),
    handleAdd,
    handleBuyNow,
    handleWhatsApp,
    handleNativeShare,
    incrementQuantity,
    decrementQuantity,
  };
}
