'use client';

import { useState } from 'react';

export function useContactForm(whatsappNumber: string = '+923185205667') {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        throw new Error(json.error || 'Failed to submit form.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppChat = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(`Hi Pakodrive, I have an inquiry about products/support.\n${url}`);
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    subject,
    setSubject,
    message,
    setMessage,
    submitted,
    loading,
    error,
    handleContactSubmit,
    handleWhatsAppChat,
  };
}
