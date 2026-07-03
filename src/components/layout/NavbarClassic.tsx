'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useSiteInfo } from '../common/SiteInfoProvider';
import { ThemeIcon } from '../common/ThemeIcon';

const DEFAULT_CATS = [
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Chargers & Cables', slug: 'chargers' },
  { name: 'Automotive Electronics', slug: 'automotive' },
  { name: 'Smartwatches', slug: 'smartwatches' },
  { name: 'Mobile Accessories', slug: 'accessories' },
];

export const NavbarClassic: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, cartTotal } = useCart();
  const { info } = useSiteInfo();

  const [cats, setCats] = useState(DEFAULT_CATS);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCat, setSearchCat] = useState('All Category');
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => { setCatOpen(false); setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/categories');
        const j = await r.json();
        if (j.success && j.data.length > 0) setCats(j.data.map((c: any) => ({ name: c.name, slug: c.slug })));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 10); setShowTop(window.scrollY > 300); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '/shop?';
    if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;
    if (searchCat !== 'All Category') {
      const found = cats.find(c => c.name === searchCat);
      if (found) url += `category=${found.slug}&`;
    }
    router.push(url.replace(/[&?]$/, ''));
  };

  return (
    <>
      {/* ── Single combined header bar ── */}
      <div
        className="container-fluid px-0"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1030,
          background: '#fff',
          borderBottom: '1px solid #e8edf2',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div className="d-flex align-items-center gap-2 gap-lg-3 px-3 px-lg-4" style={{ height: '60px', maxWidth: '1440px', margin: '0 auto' }}>

          {/* Logo */}
          {info.showLogoImage && info.logoImage ? (
            <Link href="/" aria-label={`${info.logoText || 'PAKODRIVE'} Home`} className="text-decoration-none flex-shrink-0 d-flex align-items-center" style={{ minWidth: '130px' }}>
              <img
                src={info.logoImage}
                alt={info.logoText || 'PAKODRIVE'}
                style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
          ) : (
            <Link href="/" aria-label={`${info.logoText || 'PAKODRIVE'} Home`} className="text-decoration-none flex-shrink-0 d-flex align-items-center gap-2" style={{ minWidth: '130px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, var(--bs-primary, #ea580c), #c2410c)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(234,88,12,0.28)', flexShrink: 0,
              }}>
                <ThemeIcon name={info.logoIcon || 'shopping-bag'} style={{ color: '#fff', fontSize: '14px' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--bs-primary, #ea580c)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {info.logoText}
              </span>
            </Link>
          )}

          {/* Search bar — flex-grow, hidden on mobile */}
          <form onSubmit={handleSearch} className="flex-grow-1 d-none d-md-flex" style={{ maxWidth: '500px' }}>
            <div style={{
              display: 'flex', width: '100%',
              border: '1.5px solid var(--bs-primary, #ea580c)',
              borderRadius: '7px', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(234,88,12,0.08)',
            }}>
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none', padding: '8px 12px',
                  fontSize: '0.85rem', background: 'transparent', minWidth: 0,
                }}
              />
              <select
                value={searchCat}
                onChange={e => setSearchCat(e.target.value)}
                style={{
                  border: 'none', borderLeft: '1px solid #e2e8f0',
                  background: '#fafafa', padding: '0 8px',
                  fontSize: '0.8rem', color: '#374151', outline: 'none',
                  maxWidth: '130px', cursor: 'pointer',
                }}
              >
                <option value="All Category">All Category</option>
                {cats.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
              <button type="submit" aria-label="Submit Search" style={{
                background: 'var(--bs-primary, #ea580c)',
                border: 'none', padding: '0 16px', cursor: 'pointer',
                color: '#fff', display: 'flex', alignItems: 'center',
                fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
              }}>
                <i className="fas fa-search" />
              </button>
            </div>
          </form>

          {/* All Categories — desktop only */}
          <div className="d-none d-lg-block flex-shrink-0" style={{ position: 'relative' }}>
            <button
              onClick={() => setCatOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: '#0f172a', border: 'none', borderRadius: '7px',
                padding: '7px 13px', cursor: 'pointer', color: '#fff',
                fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap',
              }}
              aria-expanded={catOpen}
            >
              <i className="fas fa-th-large" style={{ fontSize: '11px', color: 'var(--bs-primary, #ea580c)' }} />
              Categories
              <i className="fas fa-chevron-down" style={{ fontSize: '9px', opacity: 0.7, transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {catOpen && (
              <>
                <div onClick={() => setCatOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1040 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                  width: '230px', zIndex: 1041, background: '#fff',
                  borderRadius: '10px', border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 40px rgba(15,23,42,0.14)',
                  overflow: 'hidden',
                }}>
                  <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '9px 14px' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                      <i className="fas fa-th-large me-2" style={{ color: 'var(--bs-primary, #ea580c)' }} />Browse Categories
                    </span>
                  </div>
                  {cats.map(cat => (
                    <Link key={cat.slug} href={`/shop?category=${cat.slug}`} onClick={() => setCatOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 14px', textDecoration: 'none', color: '#374151',
                        fontSize: '0.83rem', fontWeight: 500, borderBottom: '1px solid #f8fafc',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                    >
                      {cat.name}
                      <i className="fas fa-chevron-right" style={{ fontSize: '9px', color: '#cbd5e1' }} />
                    </Link>
                  ))}
                  <div style={{ padding: '10px 14px', background: '#f8fafc' }}>
                    <Link href="/shop" onClick={() => setCatOpen(false)}
                      className="d-flex align-items-center justify-content-center gap-2 text-decoration-none text-white rounded-2 py-2"
                      style={{ background: 'var(--bs-primary, #ea580c)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <i className="fas fa-store" /> View All Products
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Nav links — desktop */}
          <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop' },
              { href: '/track-order', label: 'Track Order' },
              { href: '/contact', label: 'Contact' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-decoration-none px-3 py-2 rounded-2"
                style={{
                  color: pathname === link.href ? 'var(--bs-primary, #ea580c)' : '#374151',
                  fontWeight: pathname === link.href ? 700 : 500,
                  fontSize: '0.85rem',
                  background: pathname === link.href ? 'rgba(234,88,12,0.07)' : 'transparent',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (pathname !== link.href) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--bs-primary, #ea580c)'; }}
                onMouseLeave={e => { if (pathname !== link.href) (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons — cart, wishlist */}
          <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
            {/* Wishlist */}
            <Link href="/shop" aria-label="Wishlist"
              className="d-none d-lg-flex"
              style={{
                width: '34px', height: '34px', borderRadius: '7px',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                alignItems: 'center', justifyContent: 'center',
                color: '#64748b', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--bs-primary, #ea580c)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--bs-primary, #ea580c)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; }}
            >
              <i className="fas fa-heart" style={{ fontSize: '13px' }} />
            </Link>

            {/* Cart */}
            <Link href="/cart" aria-label={`Cart — ${cartCount} items`}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none',
                background: cartCount > 0 ? 'linear-gradient(135deg,var(--bs-primary,#ea580c),#c2410c)' : '#f8fafc',
                border: cartCount > 0 ? '1px solid transparent' : '1px solid #e2e8f0',
                borderRadius: '7px', padding: '6px 11px', transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              <div style={{ position: 'relative' }}>
                <i className="fas fa-shopping-cart" style={{ fontSize: '15px', color: cartCount > 0 ? '#fff' : '#374151' }} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: '#fff', color: 'var(--bs-primary, #ea580c)',
                    borderRadius: '10px', fontSize: '9px', fontWeight: 800, padding: '1px 5px', lineHeight: 1.5,
                  }}>{cartCount}</span>
                )}
              </div>
              <div className="d-none d-md-block">
                <div style={{ fontSize: '10px', color: cartCount > 0 ? 'rgba(255,255,255,0.75)' : '#94a3b8', lineHeight: 1 }}>Cart</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: cartCount > 0 ? '#fff' : '#1e293b', lineHeight: 1.4 }}>
                  PKR {cartTotal.toLocaleString()}
                </div>
              </div>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="d-flex d-lg-none"
              style={{
                width: '34px', height: '34px', borderRadius: '7px',
                background: '#0f172a', border: 'none',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
              aria-label="Toggle menu"
            >
              <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '14px' }} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px 16px' }}>
            {/* Mobile search */}
            <form onSubmit={e => { handleSearch(e); setMobileOpen(false); }} className="mb-3">
              <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px', overflow: 'hidden' }}>
                <input
                  type="search" placeholder="Search products..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', padding: '10px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
                <button type="submit" style={{ background: 'var(--bs-primary, #ea580c)', border: 'none', padding: '0 14px', color: '#fff', cursor: 'pointer' }}>
                  <i className="fas fa-search" style={{ fontSize: '13px' }} />
                </button>
              </div>
            </form>
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop' },
              { href: '/track-order', label: 'Track Order' },
              { href: '/cart', label: 'Cart' },
              { href: '/contact', label: 'Contact' },
            ].map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '7px', textDecoration: 'none',
                  color: pathname === link.href ? 'var(--bs-primary, #ea580c)' : '#e2e8f0',
                  fontWeight: pathname === link.href ? 700 : 400, fontSize: '0.9rem',
                  background: pathname === link.href ? 'rgba(234,88,12,0.1)' : 'transparent',
                  marginBottom: '2px',
                }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Back to Top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="back-to-top" aria-label="Back to top">
          <i className="fas fa-arrow-up" />
        </button>
      )}
    </>
  );
};
