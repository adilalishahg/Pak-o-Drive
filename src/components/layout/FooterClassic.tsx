'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteInfo } from '../common/SiteInfoProvider';

export const FooterClassic: React.FC = () => {
  const { info } = useSiteInfo();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSubmitting(true);
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmail('');
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <div className="container-fluid bg-dark mt-5 pt-5 footer" style={{ color: '#cbd5e1' }}>
      <div className="container py-5">
        <div className="row g-5">

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Newsletter</h3>
            <p>Subscribe to get notifications on headphones, chargers, and automotive electronics updates.</p>
            <div className="position-relative mx-auto" style={{ maxWidth: '400px' }}>
              <form onSubmit={handleNewsletter}>
                <input
                  className="form-control bg-dark w-100 py-3 ps-4 pe-5"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn py-2 position-absolute top-0 end-0 mt-2 me-2 text-white border-0"
                  style={{ background: 'var(--pd-primary-dark, #c2410c)', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  {submitting ? '...' : 'SignUp'}
                </button>
              </form>
            </div>
            <div className="d-flex pt-2 gap-2 mt-3">
              {[
                { icon: 'fab fa-twitter', href: '#', label: 'Twitter' },
                { icon: 'fab fa-facebook-f', href: '#', label: 'Facebook' },
                { icon: 'fab fa-youtube', href: '#', label: 'YouTube' },
                { icon: 'fab fa-instagram', href: '#', label: 'Instagram' },
              ].map((s, i) => (
                <a key={i} className="btn btn-square btn-outline-secondary rounded-circle" href={s.href} aria-label={s.label}>
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="col-lg-3 col-md-6">
            <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customer Service</h3>
            <div className="d-flex flex-column gap-2">
              {[
                { href: '/contact', label: 'Contact Us' },
                { href: '/shop', label: 'Shop Collection' },
                { href: '/cart', label: 'My Cart' },
                { href: '/checkout', label: 'Checkout' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-slate-300 hover:text-white transition-colors text-decoration-none">
                  <i className="fas fa-angle-right me-2"></i>{l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Information */}
          <div className="col-lg-3 col-md-6">
            <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Information</h3>
            <div className="d-flex flex-column gap-2">
              {[
                { href: '/', label: 'About Us' },
                { href: '/contact', label: 'Delivery Information' },
                { href: '/contact', label: 'Privacy Policy' },
                { href: '/contact', label: 'Terms & Conditions' },
                { href: '/contact', label: 'Return Policy' },
              ].map(l => (
                <Link key={l.label} href={l.href} className="text-slate-300 hover:text-white transition-colors text-decoration-none">
                  <i className="fas fa-angle-right me-2"></i>{l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-6">
            <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Payment Method</h3>
            <p>We support Cash on Delivery nationwide in Pakistan. Verify your order before paying cash.</p>
            <div className="d-flex flex-column gap-2 mt-3">
              <div className="d-flex gap-2 align-items-center">
                <i className="fas fa-phone text-primary"></i>
                <a href={`tel:${info.phone}`} className="text-slate-300 hover:text-white transition-colors text-decoration-none">{info.phone}</a>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <i className="fas fa-envelope text-primary"></i>
                <a href={`mailto:${info.email}`} className="text-slate-300 hover:text-white transition-colors text-decoration-none">{info.email}</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="container-fluid copyright py-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <span className="text-slate-400">&copy; {new Date().getFullYear()} <a href="/" className="text-white text-decoration-none fw-bold">{info.logoText}</a>. All Rights Reserved.</span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <span className="text-slate-400">Powered by <a href="#" className="text-white text-decoration-none">Trusted Platform</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
