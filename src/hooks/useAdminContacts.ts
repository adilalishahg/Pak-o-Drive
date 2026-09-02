'use client';

import { useState, useEffect } from 'react';
import { ContactData } from '@/types';

export function useAdminContacts() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const res = await fetch('/api/contacts');
      const json = await res.json();
      if (json.success) {
        setContacts(json.data);
        if (json.data.length > 0) {
          setSelectedContact(json.data[0]);
        }
      } else {
        throw new Error(json.error || 'Failed to fetch messages');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading message inbox.');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleRead = async (id: string, currentStatus: 'Read' | 'Unread') => {
    const newStatus = currentStatus === 'Read' ? 'Unread' : 'Read';
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        setContacts(contacts.map((c) => (c._id === id ? { ...c, status: newStatus } : c)));
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      } else {
        setError(json.error || 'Failed to update message status.');
      }
    } catch (err) {
      console.error(err);
      setError('Error updating status.');
    }
  };

  return {
    contacts,
    loading,
    error,
    selectedContact,
    setSelectedContact,
    handleToggleRead,
  };
}
