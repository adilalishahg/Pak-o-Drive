'use client';

import React, { useEffect, useState } from 'react';

interface ContactData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read';
  createdAt: string;
}

export default function AdminContactsPage() {
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
          setSelectedContact(json.data[0]); // default select first message
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
        setContacts(
          contacts.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      } else {
        alert(json.error || 'Failed to update message status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Messages List Sidebar */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100" style={{ maxHeight: '650px', overflowY: 'auto' }}>
            <h5 className="fw-bold text-secondary mb-3 border-bottom pb-2">Inquiries Inbox</h5>
            {contacts.length === 0 ? (
              <div className="text-center p-4 text-muted">No messages in inbox.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {contacts.map((contact) => {
                  const isSelected = selectedContact?._id === contact._id;
                  const isUnread = contact.status === 'Unread';
                  return (
                    <div
                      key={contact._id}
                      onClick={() => setSelectedContact(contact)}
                      className="p-3 rounded-3 border transition-all text-start"
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? '#f1f5f9' : '#ffffff',
                        borderColor: isSelected ? '#cbd5e1' : '#f1f5f9',
                        fontWeight: isUnread ? 600 : 400,
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className={`small ${isUnread ? 'text-primary' : 'text-dark'}`}>
                          {contact.name}
                        </span>
                        {isUnread && (
                          <span className="badge bg-primary px-1.5 py-0.5 rounded-circle" style={{ width: '8px', height: '8px', padding: 0 }}>
                            {' '}
                          </span>
                        )}
                      </div>
                      <div className="text-dark fw-bold small text-truncate">{contact.subject}</div>
                      <div className="text-muted text-truncate mt-1" style={{ fontSize: '0.75rem' }}>
                        {contact.message}
                      </div>
                      <div className="text-end mt-1 text-muted" style={{ fontSize: '0.65rem' }}>
                        {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                        {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message Details Pane */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 min-vh-50">
            {selectedContact ? (
              <div className="d-flex flex-column h-100 text-start">
                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">{selectedContact.subject}</h5>
                    <p className="text-muted small mb-0">
                      From: <strong className="text-dark">{selectedContact.name}</strong> &lt;{selectedContact.email}&gt;
                    </p>
                    {selectedContact.phone && (
                      <p className="text-muted small mb-0">
                        Phone: <strong className="text-dark">{selectedContact.phone}</strong>
                      </p>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleToggleRead(selectedContact._id, selectedContact.status)}
                      className={`btn btn-sm rounded-pill px-3 ${
                        selectedContact.status === 'Read' ? 'btn-outline-secondary' : 'btn-primary border-0'
                      }`}
                      style={{
                        background: selectedContact.status === 'Unread' ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
                        fontWeight: 500,
                      }}
                    >
                      {selectedContact.status === 'Read' ? 'Mark Unread' : 'Mark Read'}
                    </button>
                  </div>
                </div>

                <div className="flex-grow-1 p-3 bg-light rounded-3 mb-4" style={{ minHeight: '220px', whiteSpace: 'pre-wrap' }}>
                  {selectedContact.message}
                </div>

                {/* Response Utilities */}
                <div className="d-flex flex-wrap gap-2 justify-content-end mt-auto">
                  <a
                    href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(`Re: ${selectedContact.subject}`)}`}
                    className="btn btn-outline-secondary rounded-pill px-4"
                  >
                    <i className="fas fa-reply me-1.5" /> Reply via Email
                  </a>
                  {selectedContact.phone && (
                    <a
                      href={`https://wa.me/${selectedContact.phone.replace('+', '')}?text=${encodeURIComponent(
                        `Hi ${selectedContact.name}, thank you for contacting PAKODRIVE. Regarding your message: "${selectedContact.subject}"...`
                      )}`}
                      target="_blank"
                      className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2 border-0"
                    >
                      <i className="fab fa-whatsapp" /> Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Select an inquiry from the inbox list to read details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
