'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { logInteraction } from '../components/common/AnalyticsTracker';
import { PAKISTAN_PHONE_REGEX } from '../lib/constants';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  orderNotes: string;
}

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


  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
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
      const utmSource = typeof window !== 'undefined' ? (sessionStorage.getItem('utm_source') || '') : '';
      const utmMedium = typeof window !== 'undefined' ? (sessionStorage.getItem('utm_medium') || '') : '';
      const utmCampaign = typeof window !== 'undefined' ? (sessionStorage.getItem('utm_campaign') || '') : '';

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
          items: cart.map(i => ({
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
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
    const itemsSummary = cart
      .map(i => `• ${i.product.name}${i.variant ? ` (${i.variant.name})` : ''} x${i.quantity} = Rs. ${((i.variant ? i.variant.price : i.product.price) * i.quantity).toLocaleString()}`)
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

    const customerSection = customerDetailsList.length > 0
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
  };
}
