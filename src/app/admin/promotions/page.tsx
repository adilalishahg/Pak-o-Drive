'use client';

import React, { useEffect, useState } from 'react';

interface PromoData {
  _id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiryDate: string;
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<PromoData[]>([]);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPromos();
    // Default expiry date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpiryDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  async function fetchPromos() {
    try {
      setLoading(true);
      const res = await fetch('/api/promotions');
      const json = await res.json();
      if (json.success) {
        setPromos(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch promotions');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching promotions data.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent || !expiryDate) return;
    setSaving(true);
    setError('');

    const payload = {
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      expiryDate: new Date(expiryDate),
      isActive,
    };

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setPromos([json.data, ...promos]);
        setCode('');
        setDiscountPercent('10');
        setIsActive(true);
      } else {
        throw new Error(json.error || 'Failed to save coupon code');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while creating promo code.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setPromos(promos.map((p) => (p._id === id ? { ...p, isActive: !currentStatus } : p)));
      } else {
        alert(json.error || 'Failed to toggle status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving status changes.');
    }
  };

  const handleDelete = async (id: string, promoCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${promoCode}"?`)) return;

    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setPromos(promos.filter((p) => p._id !== id));
      } else {
        alert(json.error || 'Failed to delete coupon.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error, could not delete coupon.');
    }
  };

  if (loading && promos.length === 0) {
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
        {/* Promo Codes list */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-secondary mb-3">Coupon Codes</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small uppercase">
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount</th>
                    <th>Expiry Date</th>
                    <th>Active Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-muted">
                        No coupon codes created yet. Create one on the right panel!
                      </td>
                    </tr>
                  ) : (
                    promos.map((promo) => {
                      const isExpired = new Date(promo.expiryDate) < new Date();
                      return (
                        <tr key={promo._id}>
                          <td>
                            <span className="badge bg-secondary font-monospace fs-6 px-2.5 py-1">
                              {promo.code}
                            </span>
                          </td>
                          <td className="fw-bold text-primary">{promo.discountPercent}% OFF</td>
                          <td>
                            <span className={isExpired ? 'text-danger fw-semibold' : 'text-muted'}>
                              {new Date(promo.expiryDate).toLocaleDateString()}
                              {isExpired && ' (Expired)'}
                            </span>
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                type="checkbox"
                                checked={promo.isActive}
                                disabled={isExpired}
                                onChange={() => handleToggleActive(promo._id, promo.isActive)}
                                className="form-check-input"
                                style={{ cursor: isExpired ? 'not-allowed' : 'pointer' }}
                              />
                              <label className="form-check-label small text-muted">
                                {promo.isActive ? 'Active' : 'Disabled'}
                              </label>
                            </div>
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDelete(promo._id, promo.code)}
                              className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              title="Delete Coupon"
                            >
                              <i className="fas fa-trash-alt small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Promo Code Panel */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-secondary mb-3 border-bottom pb-2">Create Discount Coupon</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="form-control rounded-3 font-monospace fw-bold"
                  placeholder="e.g. SAVE20"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Discount Percentage *</label>
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="form-select rounded-3 fw-bold text-primary"
                >
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((percent) => (
                    <option key={percent} value={percent}>
                      {percent}% OFF
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="form-control rounded-3"
                />
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="form-check-input"
                  id="couponActiveSwitch"
                />
                <label className="form-check-label small text-muted" htmlFor="couponActiveSwitch">
                  Enable coupon immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-gradient w-100 py-2.5 fw-semibold border-0 text-white rounded-3 shadow"
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" /> Creating...
                  </>
                ) : (
                  'Create Coupon'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
