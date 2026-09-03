'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { logInteraction } from '../components/common/AnalyticsTracker';
import { PAKISTAN_PHONE_REGEX } from '../lib/constants';
import { CheckoutFormData } from '@/types';

export interface SavedDeliveryProfile {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email?: string;
  savedAt?: number;
}

const STORAGE_KEY = 'pakodrive_saved_profile';

export function useCheckout() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    email: '',
    orderNotes: '',
  });

  // Layer 1: Saved Profile from Browser LocalStorage (Same Device)
  const [savedProfile, setSavedProfile] = useState<SavedDeliveryProfile | null>(null);
  const [isSavedCardDismissed, setIsSavedCardDismissed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Layer 2: Phone-Based Address Lookup (New/Different Device)
  const [phoneSuggestedProfile, setPhoneSuggestedProfile] = useState<SavedDeliveryProfile | null>(null);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const lastLookedUpPhoneRef = useRef<string>('');

  // 1. Hydrate Layer 1 on mount (Strictly in useEffect to satisfy Rule #1 SSR Hydration Guard)
  useEffect(() => {
    setIsHydrated(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SavedDeliveryProfile = JSON.parse(stored);
        if (parsed && parsed.fullName && parsed.phone && parsed.city && parsed.address) {
          setSavedProfile(parsed);
        }
      }
    } catch {
      // Storage unavailable or invalid JSON
    }
  }, []);

  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Apply Layer 1 profile
  const applySavedProfile = useCallback(() => {
    if (!savedProfile) return;
    setFormData((prev) => ({
      ...prev,
      fullName: savedProfile.fullName,
      phone: savedProfile.phone,
      city: savedProfile.city,
      address: savedProfile.address,
      email: savedProfile.email || prev.email,
    }));
    setIsSavedCardDismissed(true);
  }, [savedProfile]);

  const dismissSavedProfile = useCallback(() => {
    setIsSavedCardDismissed(true);
  }, []);

  // 2. Layer 2: Debounced phone lookup when 10+ digits are entered
  useEffect(() => {
    const rawPhone = formData.phone.trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');

    // Skip if less than 10 digits or if already identical to savedProfile or already looked up
    if (digitsOnly.length < 10 || digitsOnly === lastLookedUpPhoneRef.current) {
      return;
    }

    if (savedProfile && savedProfile.phone.replace(/\D/g, '') === digitsOnly) {
      return; // Already known in Layer 1
    }

    const timer = setTimeout(async () => {
      try {
        setIsLookingUpPhone(true);
        lastLookedUpPhoneRef.current = digitsOnly;
        const res = await fetch(`/api/customer/saved-address?phone=${encodeURIComponent(rawPhone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.found && data.profile) {
            setPhoneSuggestedProfile({
              fullName: data.profile.fullName || '',
              phone: rawPhone,
              city: data.profile.city || '',
              address: data.profile.address || '',
              email: data.profile.email || '',
            });
          } else {
            setPhoneSuggestedProfile(null);
          }
        }
      } catch {
        // Silently ignore network lookup errors
      } finally {
        setIsLookingUpPhone(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.phone, savedProfile]);

  // Apply Layer 2 suggestion
  const applyPhoneSuggestedProfile = useCallback(() => {
    if (!phoneSuggestedProfile) return;
    setFormData((prev) => ({
      ...prev,
      fullName: phoneSuggestedProfile.fullName || prev.fullName,
      city: phoneSuggestedProfile.city || prev.city,
      address: phoneSuggestedProfile.address || prev.address,
      email: phoneSuggestedProfile.email || prev.email,
    }));
    setPhoneSuggestedProfile(null); // Clear suggestion after applying
  }, [phoneSuggestedProfile]);

  const dismissPhoneSuggestedProfile = useCallback(() => {
    setPhoneSuggestedProfile(null);
  }, []);

  const saveProfileLocally = () => {
    try {
      if (typeof window !== 'undefined' && formData.fullName && formData.phone && formData.city && formData.address) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
            savedAt: Date.now(),
          })
        );
      }
    } catch {
      // Storage write error
    }
  };

  const validate = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your mobile/WhatsApp number.');
      return false;
    }
    // Check Pakistani phone format
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!PAKISTAN_PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter a valid Pakistani phone number (e.g. 03001234567).');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter your complete delivery address (House #, Street).');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Please select or enter your city.');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const utmSource = typeof window !== 'undefined' ? sessionStorage.getItem('utm_source') || '' : '';
      const utmMedium = typeof window !== 'undefined' ? sessionStorage.getItem('utm_medium') || '' : '';
      const utmCampaign = typeof window !== 'undefined' ? sessionStorage.getItem('utm_campaign') || '' : '';

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails: {
            name: formData.fullName.trim(),
            email: formData.email.trim() || undefined,
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            notes: formData.orderNotes.trim() || undefined,
          },
          items: cart.map((i) => ({
            productId: i.product._id,
            quantity: i.quantity,
            variantName: i.variant?.name,
            variantId: i.variant?._id,
          })),
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // Persist profile locally for 1-click returning checkout
      saveProfileLocally();

      logInteraction('checkout_success', window.location.pathname, {
        orderId: data.orderId,
        amount: cartTotal,
        itemsCount: cart.length,
      });

      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again or order via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderViaWhatsApp = () => {
    saveProfileLocally();

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
    const itemsSummary = cart
      .map(
        (i) =>
          `• ${i.product.name}${i.variant ? ` (${i.variant.name})` : ''} x${i.quantity} = Rs. ${(
            (i.variant ? i.variant.price : i.product.price) * i.quantity
          ).toLocaleString()}`
      )
      .join('\n');

    const customerDetailsList: string[] = [];
    if (formData.fullName?.trim()) {
      customerDetailsList.push(`• *Name:* ${formData.fullName.trim()}`);
    }
    if (formData.phone?.trim()) {
      customerDetailsList.push(`• *Phone / WhatsApp:* ${formData.phone.trim()}`);
    }
    if (formData.email?.trim()) {
      customerDetailsList.push(`• *Email:* ${formData.email.trim()}`);
    }
    if (formData.city?.trim()) {
      customerDetailsList.push(`• *City:* ${formData.city.trim()}`);
    }
    if (formData.address?.trim()) {
      customerDetailsList.push(`• *Complete Delivery Address:* ${formData.address.trim()}`);
    }
    if (formData.orderNotes?.trim()) {
      customerDetailsList.push(`• *Special Instructions:* ${formData.orderNotes.trim()}`);
    }

    const customerSection =
      customerDetailsList.length > 0
        ? `\n\n👤 *Customer & Delivery Details:*\n${customerDetailsList.join('\n')}`
        : '';

    const text = encodeURIComponent(
      `السلام علیکم! Mujhe Pak-o-Drive se Cash On Delivery par order confirm karna hai:\n\n` +
        `📦 *Order Items:*\n${itemsSummary}\n\n` +
        `💰 *Total Amount:* Rs. ${cartTotal.toLocaleString()} (Cash On Delivery - Free Delivery)` +
        `${customerSection}\n\n` +
        `Baraye meharbani mera order confirm karein aur dispatch date bata dein. Shukriya!`
    );

    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

  return {
    cart,
    cartTotal,
    formData,
    updateField,
    loading,
    error,
    handlePlaceOrder,
    handleOrderViaWhatsApp,
    // Layer 1 & 2 states
    savedProfile,
    isSavedCardDismissed,
    applySavedProfile,
    dismissSavedProfile,
    phoneSuggestedProfile,
    isLookingUpPhone,
    applyPhoneSuggestedProfile,
    dismissPhoneSuggestedProfile,
    isHydrated,
  };
}
