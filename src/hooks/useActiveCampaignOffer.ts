'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSiteInfo } from '../components/common/SiteInfoProvider';
import { useCart } from '../context/CartContext';
import { ICampaignProduct } from '../models/CampaignOffer';

export interface ActiveOfferData {
  _id: string;
  title: string;
  badge: string;
  subtitle?: string;
  offerType: 'flash_sale' | 'combo_bundle';
  products: ICampaignProduct[];
  bundlePrice: number;
  bundleOriginalPrice: number;
  expiryDate?: string;
  isActive: boolean;
  bgTheme: 'dark_slate' | 'sunset_orange' | 'emerald_gold' | 'midnight_blue';
  ctaText?: string;
  placement?: 'below_slider' | 'after_first_category' | 'after_specific_category' | 'middle_promotions' | 'before_why_us';
  targetCategorySlug?: string;
  showCountdownTimer?: boolean;
  showSubtitle?: boolean;
  showSavingsBadge?: boolean;
  showFloatingPrice?: boolean;
  showProductTitle?: boolean;
  showOriginalPrice?: boolean;
  compactMobile?: boolean;
}

let cachedOfferData: ActiveOfferData | null = null;
let offerPromise: Promise<ActiveOfferData | null> | null = null;
let lastOfferFetch = 0;
const OFFER_CACHE_TTL_MS = 60_000;

export function useActiveCampaignOffer() {
  const [offer, setOffer] = useState<ActiveOfferData | null>(cachedOfferData);
  const [loading, setLoading] = useState(!cachedOfferData);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);

  const { info } = useSiteInfo();
  const { addToCart } = useCart();

  // Normalize WhatsApp number
  const rawPhone = info?.whatsapp || info?.phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanDigits = rawPhone.replace(/\D/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('92') ? cleanDigits : `92${cleanDigits.replace(/^0/, '')}`;

  useEffect(() => {
    let isMounted = true;

    // Use fresh memory cache if available within TTL
    if (cachedOfferData && Date.now() - lastOfferFetch < OFFER_CACHE_TTL_MS) {
      setOffer(cachedOfferData);
      setLoading(false);
      return;
    }

    // Deduplicate in-flight requests across multiple banner components
    if (!offerPromise) {
      offerPromise = fetch('/api/campaign-offers/active')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            cachedOfferData = data.data;
            lastOfferFetch = Date.now();
            return data.data;
          }
          return null;
        })
        .catch((err) => {
          console.error('Error fetching active campaign offer:', err);
          return null;
        })
        .finally(() => {
          offerPromise = null;
        });
    }

    offerPromise.then((data) => {
      if (isMounted) {
        if (data) setOffer(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (!offer?.expiryDate) {
      setTimeLeft(null);
      return;
    }

    const targetTime = new Date(offer.expiryDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [offer?.expiryDate]);

  // WhatsApp Order URL for the entire bundle or offer
  const whatsappBundleUrl = useMemo(() => {
    if (!offer) return '#';
    const productNames = offer.products.map((p) => `• ${p.name} (Rs. ${p.offerPrice.toLocaleString()})`).join('\n');
    const priceText = offer.offerType === 'combo_bundle'
      ? `Deal Price: Rs. ${offer.bundlePrice.toLocaleString()}`
      : `Total Deal Price: Rs. ${offer.products.reduce((a, b) => a + b.offerPrice, 0).toLocaleString()}`;

    const message = `Assalam-o-Alaikum Pak-o-Drive! Mujhe yeh special offer order karni hai:\n\n*${offer.title}*\n${productNames}\n\n*${priceText}*\n\nPlease confirm availability and delivery!`;

    return `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(message)}`;
  }, [offer, formattedWhatsapp]);

  // Add entire campaign offer / bundle as a single package deal item to cart
  const handleAddBundleToCart = useCallback(() => {
    if (!offer) return;

    const dealPrice =
      offer.offerType === 'combo_bundle' && offer.bundlePrice > 0
        ? offer.bundlePrice
        : offer.products.reduce((a, b) => a + (b.offerPrice || 0), 0);

    const originalPrice =
      offer.bundleOriginalPrice ||
      offer.products.reduce((a, b) => a + (b.originalPrice || 0), 0);

    const includedNames = offer.products.map((p) => p.name).join(' + ');

    const bundleProduct: any = {
      _id: `bundle_${offer._id}`,
      name: `${offer.title} (${offer.products.length} Items Package)`,
      price: dealPrice,
      originalPrice,
      image: offer.products[0]?.image || '/img/product-placeholder.png',
      category: 'Special Campaign Offer',
      slug: offer.products[0]?.slug || '',
      stock: 99,
      description: `Includes: ${includedNames}`,
    };

    const bundleVariant: any = {
      _id: `var_${offer._id}`,
      name: `Package Deal: ${includedNames}`,
      price: dealPrice,
    };

    addToCart(bundleProduct, 1, bundleVariant);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  }, [offer, addToCart]);

  return {
    offer,
    loading,
    timeLeft,
    isExpired,
    bundleAdded,
    whatsappBundleUrl,
    handleAddBundleToCart,
  };
}
