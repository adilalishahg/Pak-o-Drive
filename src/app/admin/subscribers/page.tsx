'use client';

import React, { useEffect, useState } from 'react';

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/newsletter');
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data || []);
      } else {
        throw new Error(json.error || 'Failed to retrieve newsletter subscribers.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/newsletter?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setSuccess('Subscriber removed successfully!');
        setSubscribers((prev) => prev.filter((sub) => sub._id !== id));
        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(json.error || 'Failed to unsubscribe user.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete subscriber.');
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold text-secondary mb-0">Newsletter Subscribers</h5>
            <p className="text-muted small mb-0 mt-1">
              Manage website audience, newsletter leads, and email subscription lists.
            </p>
          </div>
          <div className="badge bg-primary px-3 py-2 rounded-pill fs-6 fw-semibold" style={{ width: 'fit-content' }}>
            {subscribers.length} Subscribers
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          <i className="fas fa-exclamation-circle me-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success border-0 mb-4" role="alert">
          <i className="fas fa-check-circle me-2" />
          {success}
        </div>
      )}

      {/* Main card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        {/* Search filter */}
        <div className="mb-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
              <i className="fas fa-search" />
            </span>
            <input
              type="text"
              placeholder="Search by email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control border-start-0 rounded-end-3 py-2"
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-envelope-open fa-3x text-muted mb-3" />
            <p className="text-muted mb-0">
              {searchQuery ? 'No matching subscribers found.' : 'No subscribers found.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="py-3 px-4 text-muted small fw-bold text-uppercase">Email Address</th>
                  <th scope="col" className="py-3 text-muted small fw-bold text-uppercase">Subscribed On</th>
                  <th scope="col" className="py-3 px-4 text-end text-muted small fw-bold text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr key={sub._id}>
                    <td className="px-4 py-3 fw-medium text-dark">{sub.email}</td>
                    <td className="py-3 text-muted">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        title="Delete Subscriber"
                      >
                        <i className="fas fa-trash-alt me-1.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
