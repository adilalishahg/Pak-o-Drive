'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { useSiteInfo } from '../common/SiteInfoProvider';

/* ── Inline SVG icons (zero CDN dependency) ─────────────────── */
const IconMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
  location: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  mail: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  phone: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.34a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  globe: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  chevron: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  copyright: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
    </svg>
  ),
  facebook: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  twitter: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  youtube: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.44a2.78 2.78 0 0 0 1.95-1.98A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  ),
};

export const Footer: React.FC = () => {
  const { theme } = useSiteTheme();
  const { info } = useSiteInfo();
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'danger' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const isCleanWhite = theme.layoutTheme === 'theme1';

  const contactCards = [
    { Icon: IconMap.location, label: 'Address', value: `${info.address}` },
    { Icon: IconMap.mail, label: 'Mail Us', value: info.email },
    { Icon: IconMap.phone, label: 'Telephone', value: info.phone },
    { Icon: IconMap.globe, label: 'Website', value: info.website },
  ];

  const socials = [
    { Icon: IconMap.facebook, href: info.facebook, label: 'Facebook' },
    { Icon: IconMap.instagram, href: info.instagram, label: 'Instagram' },
    { Icon: IconMap.twitter, href: info.twitter, label: 'Twitter' },
    { Icon: IconMap.youtube, href: info.youtube, label: 'YouTube' },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message || 'Subscribed successfully!');
        setStatusType('success');
        setEmail('');
      } else {
        setStatusMessage(data.error || 'Failed to subscribe.');
        setStatusType('danger');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Connection error. Please try again.');
      setStatusType('danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (isCleanWhite) {
    const firstLetter = info.logoText ? info.logoText.charAt(0).toUpperCase() : 'A';
    return (
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Logo and info */}
            <div>
              <Link href="/" className="text-2xl font-extrabold tracking-wider text-white flex items-center gap-2 mb-6 text-decoration-none">
                <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base font-black">{firstLetter}</span>
                {info.logoText || 'ALPHA'}
              </Link>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Premium electronics, smart home accessories, and wearable technology tailored to elevate your digital lifestyle.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-400">
                <p className="flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {info.address || '786 Commercial Plaza, Karachi, Pakistan'}
                </p>
                <p className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-500 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.184-3.864-6.687-6.687l1.293-.97c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {info.phone || '+92-300-1234567'}
                </p>
                <p className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-blue-500 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {info.email || 'info@alpha-demo.co'}
                </p>
              </div>
            </div>

            {/* Information Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Information</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm list-none p-0">
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Contact Us</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors text-decoration-none">About Us</Link></li>
                <li><Link href="/faq" className="text-slate-400 hover:text-white transition-colors text-decoration-none">FAQs</Link></li>
                <li><Link href="/return-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Return Policy</Link></li>
                <li><Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Shipping Info</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Quick Links</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm list-none p-0">
                <li><Link href="/help" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Help Center</Link></li>
                <li><Link href="/cart" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Shopping Cart</Link></li>
                <li><Link href="/shop" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Shop</Link></li>
                <li><Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Newsletter Sign up */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Newsletter Sign up</h3>
              <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                Receive updates about free deals, new arrivals, and special promotions.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={submitting}
                    className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
                  />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md uppercase tracking-wider border-0">
                  {submitting ? 'Subscribing...' : 'Subscribe'}
                </button>
                {statusMessage && (
                  <div className={`text-${statusType === 'success' ? 'success' : 'danger'} small mt-1`}>
                    {statusMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 m-0">
              &copy; {new Date().getFullYear()} {info.logoText || 'Alpha'}. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium mr-2">Secure checkout via</span>
              <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2.5 py-1 text-white font-bold text-[10px]">
                <span className="text-sky-400">PayPal</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2.5 py-1 text-white font-bold text-[10px]">
                <span className="text-red-400 font-extrabold">MasterCard</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2.5 py-1 text-white font-bold text-[10px]">
                <span className="text-orange-400">Visa</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <>
      {/* ── Footer ─────────────────────────────────────── */}
      <div className="container-fluid footer py-5 wow fadeIn" data-wow-delay="0.2s">
        <div className="container py-5">

          {/* Contact cards row */}
          <div className="row g-4 rounded mb-5" style={{ background: 'rgba(255,255,255,.03)' }}>
            {contactCards.map(({ Icon, label, value }) => (
              <div key={label} className="col-md-6 col-lg-6 col-xl-3">
                <div className="rounded p-4 d-flex align-items-start gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '58px', height: '58px',
                      background: `linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 75%, #000))`,
                      boxShadow: `0 6px 16px rgba(var(--pd-primary-rgb, 234,88,12), 0.35)`,
                    }}
                  >
                    <Icon size={22} color="#fff" />
                  </div>
                  <div>
                    <h5 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{label}</h5>
                    <p className="mb-0 text-slate-300" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer links row */}
          <div className="row g-5">
            {/* Newsletter */}
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h3 className="mb-3" style={{ color: 'var(--pd-primary-dark, #c2410c)', fontWeight: 700, fontSize: '1.25rem' }}>Newsletter</h3>
                <p className="mb-3 text-slate-300" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {info.newsletterText}
                </p>
                <form onSubmit={handleSubscribe} className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex rounded-pill overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                    <input
                      className="form-control border-0 py-2 ps-4"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      aria-label="Email for newsletter"
                      disabled={submitting}
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', boxShadow: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn rounded-pill py-2 px-3 text-white border-0 flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 80%, #000))`, fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      {submitting ? '...' : 'SignUp'}
                    </button>
                  </div>
                  {statusMessage && (
                    <div className={`text-${statusType === 'success' ? 'success' : 'danger'} small px-3 mt-1`}>
                      {statusMessage}
                    </div>
                  )}
                </form>
                {/* Social icons */}
                <div className="d-flex gap-2 flex-wrap">
                  {socials.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href === '#' ? href : href}
                      className="footer-social-btn"
                      aria-label={label}
                      target={href === '#' ? undefined : '_blank'}
                      rel="noopener noreferrer"
                    >
                      <Icon size={15} color="currentColor" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Service */}
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h3 className="mb-4" style={{ color: 'var(--pd-primary-dark, #c2410c)', fontWeight: 700, fontSize: '1.25rem' }}>Customer Service</h3>
                {[
                  { href: '/contact', label: 'Contact Us' },
                  { href: '/shop', label: 'Shop Collection' },
                  { href: '/cart', label: 'My Cart' },
                  { href: '/checkout', label: 'Checkout' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-slate-300 hover:text-white transition-colors mb-2 d-flex align-items-center gap-2 text-decoration-none" style={{ fontSize: '0.88rem', transition: 'color 0.2s' }}>
                    <IconMap.chevron size={12} color="var(--pd-primary-dark, #c2410c)" /> {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Information */}
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h3 className="mb-4" style={{ color: 'var(--pd-primary-dark, #c2410c)', fontWeight: 700, fontSize: '1.25rem' }}>Information</h3>
                {[
                  { href: '/about', label: 'About Us' },
                  { href: '/shipping-policy', label: 'Delivery Information' },
                  { href: '/privacy-policy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms & Conditions' },
                  { href: '/return-policy', label: 'Return Policy' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-slate-300 hover:text-white transition-colors mb-2 d-flex align-items-center gap-2 text-decoration-none" style={{ fontSize: '0.88rem', transition: 'color 0.2s' }}>
                    <IconMap.chevron size={12} color="var(--pd-primary-dark, #c2410c)" /> {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h3 className="mb-4" style={{ color: 'var(--pd-primary-dark, #c2410c)', fontWeight: 700, fontSize: '1.25rem' }}>Payment Method</h3>
                <p className="text-slate-300" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  We support Cash on Delivery nationwide across Pakistan. Verify your orders before making payments.
                </p>
                <div className="d-inline-flex align-items-center gap-2 mt-2 px-3 py-2 rounded-pill" style={{ background: 'rgba(var(--pd-primary-rgb,234,88,12),0.12)', border: '1px solid rgba(var(--pd-primary-rgb,234,88,12),0.25)' }}>
                  <IconMap.phone size={14} color="var(--pd-primary-dark, #c2410c)" />
                  <span style={{ color: 'var(--pd-primary-dark, #c2410c)', fontWeight: 700, fontSize: '0.83rem' }}>Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Copyright ──────────────────────────────────── */}
      <div className="container-fluid copyright py-4">
        <div className="container">
          <div className="row g-3 align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <span className="text-white d-flex align-items-center gap-2 justify-content-center justify-content-md-start" style={{ fontSize: '0.85rem' }}>
                <IconMap.copyright size={13} color="rgba(255,255,255,0.6)" />
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{info.copyrightText}</span>
              </span>
            </div>
            <div className="col-md-6 text-center text-md-end text-slate-400" style={{ fontSize: '0.82rem' }}>
              {info.siteTagline}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
