'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { logInteraction } from '../common/AnalyticsTracker';
import { useSiteInfo } from '../common/SiteInfoProvider';
import { ThemeIcon } from '../common/ThemeIcon';

/* ── Category maps ─────────────────────────────────────────── */
const CAT_ICONS: Record<string, string> = {
  headphones: 'fas fa-headphones-alt', chargers: 'fas fa-bolt',
  automotive: 'fas fa-car', smartwatches: 'fas fa-clock',
  accessories: 'fas fa-mobile-alt', laptops: 'fas fa-laptop',
  cameras: 'fas fa-camera', gaming: 'fas fa-gamepad',
  speakers: 'fas fa-volume-up', tablets: 'fas fa-tablet-alt',
  cables: 'fas fa-plug', networking: 'fas fa-wifi',
};
const CAT_COLORS: Record<string, string> = {
  headphones: '#7c3aed', chargers: '#f59e0b', automotive: '#0891b2',
  smartwatches: '#059669', accessories: '#db2777', laptops: '#2563eb',
  cameras: '#dc2626', gaming: '#7c3aed', speakers: '#0891b2',
  tablets: '#059669', cables: '#f59e0b', networking: '#2563eb',
};
const getCatIcon  = (s: string) => CAT_ICONS[s]  ?? 'fas fa-tag';
const getCatColor = (s: string) => CAT_COLORS[s] ?? 'var(--pd-primary)';

const DEFAULT_CATS = [
  { name: 'Headphones',             slug: 'headphones'   },
  { name: 'Chargers & Cables',      slug: 'chargers'     },
  { name: 'Automotive Electronics', slug: 'automotive'   },
  { name: 'Smartwatches',           slug: 'smartwatches' },
  { name: 'Mobile Accessories',     slug: 'accessories'  },
];

const NAV_LINKS = [
  { href: '/',            label: 'Home'        },
  { href: '/shop',        label: 'Shop'        },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact',     label: 'Contact'     },
];

/* ── Categories Dropdown ───────────────────────────────────── */
function CatDropdown({ cats, open, onClose }: { cats: { name: string; slug: string }[]; open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1040 }} aria-hidden="true" />}
      <div style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: 0,
        width: '340px', zIndex: 1041, background: '#fff',
        borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 20px 50px rgba(15,23,42,0.15)',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        pointerEvents: open ? 'auto' : 'none',
        overflow: 'hidden',
      }}>
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '10px 16px' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.3px' }}>
            <i className="fas fa-th-large me-2" style={{ color: 'var(--pd-primary)' }} />Browse Categories
          </span>
        </div>
        {cats.map(cat => {
          const color = getCatColor(cat.slug);
          return (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`} onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px',
                textDecoration: 'none', color: '#374151', fontSize: '0.84rem', fontWeight: 500,
                borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'; (e.currentTarget as HTMLAnchorElement).style.color = color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                background: `color-mix(in srgb, ${color} 12%, #fff)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={getCatIcon(cat.slug)} style={{ fontSize: '12px', color }} />
              </div>
              {cat.name}
              <i className="fas fa-chevron-right ms-auto" style={{ fontSize: '9px', color: '#cbd5e1' }} />
            </Link>
          );
        })}
        <div style={{ padding: '10px 16px', background: '#f8fafc' }}>
          <Link href="/shop" onClick={onClose} className="btn btn-gradient w-100 rounded-2 border-0 text-white text-decoration-none d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.8rem', fontWeight: 700, padding: '8px' }}>
            <i className="fas fa-store" /> View All Products
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── Main Navbar ───────────────────────────────────────────── */
export const Navbar: React.FC = () => {
  const pathname  = usePathname();
  const router    = useRouter();
  const { cartCount, cartTotal } = useCart();
  const { info }  = useSiteInfo();

  const [cats, setCats]             = useState(DEFAULT_CATS);
  const [catOpen, setCatOpen]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const [scrolled, setScrolled]     = useState(false);
  const [showTop, setShowTop]       = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCatOpen(false); setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/categories');
        const j = await r.json();
        if (j.success && j.data.length > 0)
          setCats(j.data.map((c: any) => ({ name: c.name, slug: c.slug })));
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
    if (query.trim()) {
      logInteraction('search_intent', window.location.pathname, { keyword: query.trim() });
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ════════════════════════════════════════════
          SINGLE NAVBAR ROW
      ════════════════════════════════════════════ */}
      <header
        style={{
          background: scrolled
            ? 'rgba(255,255,255,0.97)'
            : '#fff',
          borderBottom: '1px solid #e8edf2',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 1030,
          transition: 'box-shadow 0.3s ease, background 0.3s ease',
        }}
      >
        <div className="container-fluid px-3 px-lg-4" style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div className="d-flex align-items-center gap-2 gap-lg-3" style={{ height: '64px' }}>

            {/* 1. LOGO */}
            <Link href="/" className="text-decoration-none flex-shrink-0" style={{ minWidth: '130px' }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{
                  width: '34px', height: '34px',
                  background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)',
                  borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(234,88,12,0.28)', flexShrink: 0,
                }}>
                  <ThemeIcon name="shopping-bag" style={{ color: '#fff', fontSize: '16px' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--pd-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                  {info.logoText}
                </span>
              </div>
            </Link>

            {/* 2. SEARCH BAR — flex-grow */}
            <form onSubmit={handleSearch} className="flex-grow-1 d-none d-md-flex"
              style={{ maxWidth: '520px', position: 'relative' }} role="search">
              <div style={{
                display: 'flex', width: '100%',
                border: '1.5px solid var(--pd-primary)',
                borderRadius: '8px', overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(234,88,12,0.10)',
              }}>
                <input type="search" placeholder="Search products..."
                  value={query} onChange={e => setQuery(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '9px 14px',
                    fontSize: '0.88rem', fontFamily: 'var(--pd-font)', background: 'transparent', minWidth: 0 }} />
                <button type="submit" style={{
                  background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)',
                  border: 'none', padding: '0 18px', cursor: 'pointer',
                  color: '#fff', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                }}>
                  <ThemeIcon name="search" style={{ fontSize: '15px' }} />
                  <span className="d-none d-lg-inline">Search</span>
                </button>
              </div>
            </form>

            {/* 3. CATEGORIES BUTTON */}
            <div ref={catRef} className="d-none d-lg-block" style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setCatOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: catOpen ? '#0f172a' : '#0f172a',
                  border: 'none', borderRadius: '8px', padding: '8px 14px',
                  cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: '0.84rem',
                  whiteSpace: 'nowrap', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                aria-expanded={catOpen} aria-haspopup="true">
                <i className="fas fa-th-large" style={{ fontSize: '12px', color: 'var(--pd-primary)' }} />
                Categories
                <i className="fas fa-chevron-down" style={{ fontSize: '9px', opacity: 0.7, transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <CatDropdown cats={cats} open={catOpen} onClose={() => setCatOpen(false)} />
            </div>

            {/* 4. NAV LINKS */}
            <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="text-decoration-none px-3 py-2 rounded-2"
                  style={{
                    color: isActive(link.href) ? 'var(--pd-primary)' : '#374151',
                    fontWeight: isActive(link.href) ? 700 : 500,
                    fontSize: '0.86rem',
                    background: isActive(link.href) ? 'rgba(234,88,12,0.08)' : 'transparent',
                    transition: 'all 0.18s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isActive(link.href)) { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--pd-primary)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(234,88,12,0.06)'; } }}
                  onMouseLeave={e => { if (!isActive(link.href)) { (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; } }}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* 5. ICONS — wishlist, cart */}
            <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">

              {/* Wishlist */}
              <Link href="/shop" aria-label="Wishlist" className="d-none d-lg-flex"
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc',
                  border: '1px solid #e2e8f0', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--pd-primary)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--pd-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.color = '#64748b'; }}>
                <i className="fas fa-heart" style={{ fontSize: '14px' }} />
              </Link>

              {/* Cart */}
              <Link href="/cart" aria-label={`Cart — ${cartCount} items`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
                  background: cartCount > 0 ? 'linear-gradient(135deg,var(--pd-primary),#c2410c)' : '#f8fafc',
                  border: cartCount > 0 ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '8px', padding: '7px 12px', transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => { if (!cartCount) { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--pd-primary)'; } }}
                onMouseLeave={e => { if (!cartCount) { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; } }}>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-shopping-cart" style={{ fontSize: '16px', color: cartCount > 0 ? '#fff' : '#374151' }} />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px',
                      background: '#fff', color: 'var(--pd-primary)', borderRadius: '10px',
                      fontSize: '9px', fontWeight: 800, padding: '1px 5px', lineHeight: 1.5 }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="d-none d-md-block">
                  <div style={{ fontSize: '10px', color: cartCount > 0 ? 'rgba(255,255,255,0.75)' : '#94a3b8', lineHeight: 1 }}>Cart</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: cartCount > 0 ? '#fff' : '#1e293b', lineHeight: 1.4 }}>
                    PKR {cartTotal.toLocaleString()}
                  </div>
                </div>
              </Link>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)} className="d-flex d-lg-none"
                style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0f172a',
                  border: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                aria-label="Toggle menu" aria-expanded={mobileOpen}>
                <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} style={{ fontSize: '15px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px 16px' }}>
            {/* Mobile search */}
            <form onSubmit={e => { handleSearch(e); setMobileOpen(false); }} className="mb-3">
              <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
                <input type="search" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', padding: '10px 14px',
                    color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--pd-font)' }} />
                <button type="submit" style={{ background: 'var(--pd-primary)', border: 'none', padding: '0 16px', color: '#fff', cursor: 'pointer' }}>
                  <i className="fas fa-search" style={{ fontSize: '14px' }} />
                </button>
              </div>
            </form>
            {/* Mobile nav links */}
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
                  textDecoration: 'none', color: isActive(link.href) ? 'var(--pd-primary)' : 'rgba(255,255,255,0.85)',
                  background: isActive(link.href) ? 'rgba(234,88,12,0.15)' : 'transparent',
                  fontWeight: isActive(link.href) ? 700 : 500, fontSize: '0.9rem', marginBottom: '2px' }}>
                {link.label}
                {link.href === '/cart' && cartCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--pd-primary)', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>{cartCount}</span>
                )}
              </Link>
            ))}
            {/* Mobile categories */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px', paddingTop: '10px' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Categories</p>
              <div className="d-flex flex-wrap gap-2">
                {cats.map(cat => (
                  <Link key={cat.slug} href={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '20px', padding: '5px 12px', fontSize: '0.75rem', color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
                    <i className={getCatIcon(cat.slug)} style={{ fontSize: '10px', color: getCatColor(cat.slug) }} />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Back to Top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="back-to-top" aria-label="Back to top">
          <i className="fas fa-arrow-up" />
        </button>
      )}
    </>
  );
};
