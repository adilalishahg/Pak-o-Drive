'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to admin panel directly
    if (localStorage.getItem('admin_token') === 'pakodrive_admin_secret_token') {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple hardcoded credentials verification
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('admin_token', 'pakodrive_admin_secret_token');
        // Set a session cookie as well
        document.cookie = "admin_token=pakodrive_admin_secret_token; path=/; max-age=86400";
        router.push('/admin');
      } else {
        setError('Invalid username or password. Hint: admin / admin123');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="container" style={{ maxWidth: '420px' }}>
        <div
          className="p-5 rounded-4 shadow-lg text-center"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Logo Icon */}
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
            style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
            }}
          >
            <i className="fas fa-shopping-bag fa-2x text-white" />
          </div>

          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>
            PAKODRIVE
          </h2>
          <p className="text-muted mb-4 small">Admin Portal Access</p>

          {error && (
            <div
              className="alert alert-danger border-0 text-start py-2 px-3 mb-4 rounded-3 small"
              role="alert"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
            >
              <i className="fas fa-exclamation-circle me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3 text-start">
              <label className="form-label text-muted small fw-semibold">Username</label>
              <div className="input-group">
                <span
                  className="input-group-text border-0 text-muted"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <i className="fas fa-user" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control border-0 py-2"
                  placeholder="Enter username"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div className="mb-4 text-start">
              <label className="form-label text-muted small fw-semibold">Password</label>
              <div className="input-group">
                <span
                  className="input-group-text border-0 text-muted"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <i className="fas fa-lock" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control border-0 py-2"
                  placeholder="Enter password"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 py-2.5 fw-semibold border-0 text-white rounded-3 shadow"
              style={{
                background: 'linear-gradient(to right, #f97316, #ea580c)',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/" className="text-decoration-none text-muted small hover-white">
              <i className="fas fa-arrow-left me-2" /> Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
