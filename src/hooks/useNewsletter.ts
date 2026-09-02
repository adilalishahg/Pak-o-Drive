'use client';

import { useState, useCallback } from 'react';

export interface NewsletterHookReturn {
  email: string;
  setEmail: (email: string) => void;
  statusMessage: string;
  statusType: 'success' | 'danger' | '';
  submitting: boolean;
  handleSubscribe: (e: React.FormEvent) => Promise<void>;
}

export function useNewsletter(): NewsletterHookReturn {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'danger' | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMessage('Please enter a valid email address.');
      setStatusType('danger');
      return;
    }

    setSubmitting(true);
    setStatusMessage('');
    setStatusType('');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage('Thank you for subscribing to PAKODRIVE exclusive deals!');
        setStatusType('success');
        setEmail('');
      } else {
        setStatusMessage(data.message || 'Subscription failed. Please try again.');
        setStatusType('danger');
      }
    } catch {
      setStatusMessage('Something went wrong. Please check your internet connection.');
      setStatusType('danger');
    } finally {
      setSubmitting(false);
    }
  }, [email]);

  return {
    email,
    setEmail,
    statusMessage,
    statusType,
    submitting,
    handleSubscribe,
  };
}
