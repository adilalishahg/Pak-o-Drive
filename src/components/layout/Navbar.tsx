'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { logInteraction } from '../common/AnalyticsTracker';
import { useSiteInfo } from '../common/SiteInfoProvider';
import { ThemeIcon } from '../common/ThemeIcon';
import { useSiteTheme } from '../common/DynamicThemeProvider';

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
  tablets: '#059669', cables: '#f59e0b', networking: '#0284c7',
};

const getCatIcon = (s: string) => CAT_ICONS[s] ?? 'fas fa-tag';
const getCatColor = (s: string, primaryColor?: string) => CAT_COLORS[s] ?? (primaryColor || 'var(--pd-primary)');

const DEFAULT_CATS = [
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Chargers & Cables', slug: 'chargers' },
  { name: 'Automotive Electronics', slug: 'automotive' },
  { name: 'Smartwatches', slug: 'smartwatches' },
  { name: 'Mobile Accessories', slug: 'accessories' },
];

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
];

/* ── Category Menu Item for Recursive Submenus ─────────────── */
function CategoryMenuItem({ node, onClose, primaryColor }: { node: any; onClose: () => void; primaryColor?: string }) {
  const hasSubs = node.subcategories && node.subcategories.length > 0;
  const color = getCatColor(node.slug, primaryColor);
  const icon = node.icon || getCatIcon(node.slug);

  return (
    <div className="position-relative category-menu-item-wrapper" style={{ display: 'block' }}>
      <Link href={`/shop?category=${node.slug}`} onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
          textDecoration: 'none', color: '#374151', fontSize: '0.84rem', fontWeight: 500,
          borderBottom: '1px solid #f8fafc', transition: 'background 0.15s, color 0.15s'
        }}
        className="category-menu-link"
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          background: `color-mix(in srgb, ${color} 12%, #fff)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative'
        }}>
          {node.image ? (
            <img src={node.image} alt={node.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <i className={icon} style={{ fontSize: '12px', color }} />
          )}
        </div>
        <span>{node.name}</span>
        {hasSubs && (
          <i className="fas fa-chevron-right ms-auto" style={{ fontSize: '9px', color: '#cbd5e1' }} />
        )}
      </Link>

      {hasSubs && (
        <div className="category-submenu shadow-lg" style={{
          position: 'absolute', top: 0, left: '100%',
          width: '240px', background: '#fff',
          borderRadius: '10px', border: '1px solid #e2e8f0',
          display: 'none', zIndex: 1050,
          padding: '4px 0'
        }}>
          {node.subcategories.map((subNode: any) => (
            <CategoryMenuItem key={subNode.slug} node={subNode} onClose={onClose} primaryColor={primaryColor} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Categories Dropdown ───────────────────────────────────── */
function CatDropdown({ roots, open, onClose, primaryColor }: { roots: any[]; open: boolean; onClose: () => void; primaryColor?: string }) {
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
        overflow: 'visible',
      }}>
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '10px 16px', borderRadius: '12px 12px 0 0' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.3px' }}>
            <i className="fas fa-th-large me-2" style={{ color: 'var(--pd-primary)' }} />Browse Categories
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {roots.map(node => (
            <CategoryMenuItem key={node.slug} node={node} onClose={onClose} primaryColor={primaryColor} />
          ))}
        </div>
        <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
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
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, cartTotal } = useCart();
  const { info } = useSiteInfo();
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  const [cats, setCats] = useState<any[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCatOpen(false); setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/categories');
        const j = await r.json();
        if (j.success && j.data.length > 0) {
          setCats(j.data);
        }
      } catch { }
    })();
  }, []);

  const categoryTree = React.useMemo(() => {
    if (cats.length === 0) {
      return DEFAULT_CATS.map(c => ({ name: c.name, slug: c.slug, subcategories: [] }));
    }
    const map: Record<string, any> = {};
    const roots: any[] = [];

    cats.forEach(c => {
      map[c.slug] = {
        name: c.name,
        slug: c.slug,
        parentCategory: c.parentCategory,
        image: c.image || '',
        icon: c.icon || '',
        subcategories: []
      };
    });

    cats.forEach(c => {
      const node = map[c.slug];
      if (c.parentCategory && map[c.parentCategory]) {
        map[c.parentCategory].subcategories.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [cats]);

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

  const activeHoverColor = isCleanWhite ? theme.primaryColor : (isModernGreen ? '#d4af37' : 'var(--pd-primary)');
  const hoverStyles = `
    .category-menu-item-wrapper:hover > .category-submenu {
      display: block !important;
    }
    .category-menu-link:hover {
      background-color: #f8fafc !important;
    }
    .category-menu-link:hover span {
      color: ${activeHoverColor} !important;
    }
  `;

  if (isCleanWhite) {
    const firstLetter = info.logoText ? info.logoText.charAt(0).toUpperCase() : 'A';
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-extrabold tracking-wider text-slate-900 flex items-center gap-2 text-decoration-none">
                  <span className="theme1-logo-badge w-8 h-8 rounded-lg flex items-center justify-center text-white text-base font-black">{firstLetter}</span>
                  {info.logoText || 'ALPHA'}
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
                <Link href="/" className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/' ? 'active' : ''}`}>Home</Link>
                <Link href="/shop" className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/shop' ? 'active' : ''}`}>Shop</Link>

                {/* Categories Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setCatOpen(o => !o)}
                    className={`theme1-nav-link px-3 py-2 border-0 bg-transparent flex items-center gap-1 ${catOpen ? 'active' : ''}`}
                    style={{ cursor: 'pointer', fontWeight: 500 }}
                    aria-expanded={catOpen}
                  >
                    Categories
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '12px', height: '12px', transition: 'transform 0.2s', transform: catOpen ? 'rotate(180deg)' : 'none' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Dropdown Panel */}
                  {catOpen && (
                    <>
                      <div onClick={() => setCatOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1040 }} aria-hidden="true" />
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
                        transform: 'translateX(-50%)',
                        width: '340px', zIndex: 1041,
                        background: '#fff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 60px rgba(15,23,42,0.14)',
                        overflow: 'visible',
                      }}>
                        {/* Header */}
                        <div className="theme1-dropdown-header" style={{ padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                            Browse Categories
                          </span>
                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '2px 0 0' }}>Find products by category</p>
                        </div>

                        {/* Dynamic category list */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {categoryTree.map((node) => (
                            <CategoryMenuItem key={node.slug} node={node} onClose={() => setCatOpen(false)} primaryColor={theme.primaryColor} />
                          ))}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
                          <Link
                            href="/shop"
                            onClick={() => setCatOpen(false)}
                            className="btn theme1-dropdown-footer-btn w-100 border-0 text-white text-decoration-none d-flex align-items-center justify-content-center gap-2"
                            style={{
                              borderRadius: '9px',
                              padding: '10px',
                              fontSize: '0.82rem', fontWeight: 700,
                            }}
                          >
                            <i className="fas fa-store" style={{ fontSize: '12px' }} />
                            View All Products
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link href="/about" className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/about' ? 'active' : ''}`}>About Us</Link>
                <Link href="/contact" className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/contact' ? 'active' : ''}`}>Contact Us</Link>
              </nav>

              {/* Right Icons */}
              <div className="flex items-center gap-1">

                {/* Search Toggle */}
                <button
                  onClick={() => setSearchOpen(o => !o)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all border-0 bg-transparent"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
                  </svg>
                </button>

                {/* Track Order Button — desktop */}
                <Link
                  href="/track-order"
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-decoration-none transition-all theme1-track-order-btn ${pathname === '/track-order' ? 'active' : ''}`}
                  aria-label="Track Order"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 014.73 4.5H19.5a1.5 1.5 0 011.5 1.5v7m-9.75 4.5H18m0 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0" />
                  </svg>
                  Track Order
                </Link>

                {/* Admin icon — only on /admin path */}
                {pathname.startsWith('/admin') && (
                  <Link
                    href="/admin"
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all"
                    aria-label="Admin Panel"
                    title="Admin Panel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </Link>
                )}

                {/* Cart Button */}
                <Link
                  href="/cart"
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all relative text-decoration-none"
                  aria-label="Shopping Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="theme1-cart-badge absolute -top-1 -right-1 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileOpen(o => !o)}
                  className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all border-0 bg-transparent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search Overlay Form */}
          {searchOpen && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 transition-all duration-300">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-slate-800 placeholder-slate-400 text-sm py-1"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 border-0 bg-transparent">Close</button>
              </form>
            </div>
          )}

          {/* Mobile Navigation Drawer */}
          {mobileOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1">
              <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium text-decoration-none theme1-mobile-nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
              <Link href="/shop" className={`block px-3 py-2 rounded-md text-base font-medium text-decoration-none theme1-mobile-nav-link ${pathname === '/shop' ? 'active' : ''}`}>Shop</Link>
              {/* Categories in mobile */}
              <div>
                <button
                  onClick={() => setCatOpen(o => !o)}
                  className="w-100 text-start border-0 bg-transparent px-3 py-2 rounded-md text-base font-medium flex items-center justify-between"
                  style={{ color: '#374151', fontWeight: 500 }}
                >
                  Categories
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '14px', height: '14px', transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {catOpen && (
                  <div className="mt-1 ms-3 space-y-1">
                    {cats.map(cat => (
                      <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                        onClick={() => { setCatOpen(false); setMobileOpen(false); }}
                        className="block px-3 py-2 rounded-md text-sm font-medium text-decoration-none theme1-mobile-sub-link">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/about" className={`block px-3 py-2 rounded-md text-base font-medium text-decoration-none theme1-mobile-nav-link ${pathname === '/about' ? 'active' : ''}`}>About Us</Link>
              <Link href="/contact" className={`block px-3 py-2 rounded-md text-base font-medium text-decoration-none theme1-mobile-nav-link ${pathname === '/contact' ? 'active' : ''}`}>Contact Us</Link>
              {/* Track Order in mobile */}
              <Link
                href="/track-order"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-decoration-none theme1-mobile-nav-link ${pathname === '/track-order' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 014.73 4.5H19.5a1.5 1.5 0 011.5 1.5v7m-9.75 4.5H18m0 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0" />
                </svg>
                Track Order
              </Link>
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
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
      <header
        style={{
          background: scrolled
            ? (isModernGreen ? 'rgba(13,35,29,0.97)' : 'rgba(255,255,255,0.97)')
            : (isModernGreen ? '#0d231d' : '#fff'),
          borderBottom: isModernGreen ? '1px solid #1a3c32' : (isCleanWhite ? '1px solid #e2e8f0' : '1px solid #e8edf2'),
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
                  background: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'linear-gradient(135deg, var(--pd-primary), #c2410c)'),
                  borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isModernGreen ? '0 3px 10px rgba(212,175,55,0.2)' : (isCleanWhite ? `0 3px 10px color-mix(in srgb, ${theme.primaryColor} 20%, transparent)` : '0 3px 10px rgba(234,88,12,0.28)'), flexShrink: 0,
                }}>
                  <ThemeIcon name="shopping-bag" style={{ color: isModernGreen ? '#0d231d' : '#fff', fontSize: '16px' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)'), letterSpacing: '-0.5px', lineHeight: 1 }}>
                  {info.logoText}
                </span>
              </div>
            </Link>

            {/* 2. SEARCH BAR — flex-grow */}
            <form onSubmit={handleSearch} className="flex-grow-1 d-none d-md-flex"
              style={{ maxWidth: '520px', position: 'relative' }} role="search">
              <div style={{
                display: 'flex', width: '100%',
                border: isModernGreen ? '1.5px solid #d4af37' : (isCleanWhite ? `1.5px solid ${theme.primaryColor}` : '1.5px solid var(--pd-primary)'),
                borderRadius: '8px', overflow: 'hidden',
                boxShadow: isModernGreen ? '0 2px 8px rgba(212,175,55,0.05)' : (isCleanWhite ? `0 2px 8px color-mix(in srgb, ${theme.primaryColor} 10%, transparent)` : '0 2px 8px rgba(234,88,12,0.10)'),
              }}>
                <input type="search" placeholder="Search products..."
                  value={query} onChange={e => setQuery(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none', padding: '9px 14px',
                    fontSize: '0.88rem', fontFamily: 'var(--pd-font)', background: 'transparent', minWidth: 0,
                    color: isModernGreen ? '#f7f5ed' : (isCleanWhite ? '#1e293b' : 'inherit')
                  }} />
                <button type="submit" style={{
                  background: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'linear-gradient(135deg, var(--pd-primary), #c2410c)'),
                  border: 'none', padding: '0 18px', cursor: 'pointer',
                  color: isModernGreen ? '#0d231d' : '#fff', display: 'flex', alignItems: 'center', gap: '6px',
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
                  background: isModernGreen ? '#14352c' : (isCleanWhite ? '#f1f5f9' : '#0f172a'),
                  border: 'none', borderRadius: '8px', padding: '8px 14px',
                  cursor: 'pointer', color: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : '#fff'), fontWeight: 600, fontSize: '0.84rem',
                  whiteSpace: 'nowrap', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                aria-expanded={catOpen} aria-haspopup="true">
                <i className="fas fa-th-large" style={{ fontSize: '12px', color: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)') }} />
                Categories
                <i className="fas fa-chevron-down" style={{ fontSize: '9px', opacity: 0.7, transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <CatDropdown roots={categoryTree} open={catOpen} onClose={() => setCatOpen(false)} primaryColor={theme.primaryColor} />
            </div>

            {/* 4. NAV LINKS */}
            <nav className="d-none d-lg-flex align-items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className={`text-decoration-none px-3 py-2 rounded-2 ${isActive(link.href) ? 'active' : ''}`}
                  style={{
                    color: isActive(link.href)
                      ? (isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)'))
                      : (isModernGreen ? '#f7f5ed' : (isCleanWhite ? '#1e293b' : '#374151')),
                    fontWeight: isActive(link.href) ? 700 : 500,
                    fontSize: '0.86rem',
                    background: isActive(link.href)
                      ? (isModernGreen ? 'rgba(212,175,55,0.1)' : (isCleanWhite ? `color-mix(in srgb, ${theme.primaryColor} 8%, transparent)` : 'rgba(234,88,12,0.08)'))
                      : 'transparent',
                    transition: 'all 0.18s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!isActive(link.href)) {
                      (e.currentTarget as HTMLAnchorElement).style.color = isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)');
                      (e.currentTarget as HTMLAnchorElement).style.background = isModernGreen ? 'rgba(212,175,55,0.06)' : (isCleanWhite ? `color-mix(in srgb, ${theme.primaryColor} 4%, transparent)` : 'rgba(234,88,12,0.06)');
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(link.href)) {
                      (e.currentTarget as HTMLAnchorElement).style.color = isModernGreen ? '#f7f5ed' : (isCleanWhite ? '#1e293b' : '#374151');
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    }
                  }}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* 5. ICONS — wishlist, cart */}
            <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">

              {/* Wishlist */}
              <Link href="/shop" aria-label="Wishlist" className="d-none d-lg-flex"
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: isModernGreen ? 'rgba(255,255,255,0.05)' : (isCleanWhite ? '#f8fafc' : '#f8fafc'),
                  border: isModernGreen ? '1px solid rgba(255,255,255,0.15)' : (isCleanWhite ? '1px solid #e2e8f0' : '1px solid #e2e8f0'),
                  alignItems: 'center', justifyContent: 'center',
                  color: isModernGreen ? '#eae7db' : (isCleanWhite ? '#64748b' : '#64748b'), textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)');
                  (e.currentTarget as HTMLAnchorElement).style.color = isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)');
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = isModernGreen ? 'rgba(255,255,255,0.15)' : (isCleanWhite ? '#e2e8f0' : '#e2e8f0');
                  (e.currentTarget as HTMLAnchorElement).style.color = isModernGreen ? '#eae7db' : (isCleanWhite ? '#64748b' : '#64748b');
                }}>
                <i className="fas fa-heart" style={{ fontSize: '14px' }} />
              </Link>

              {/* Cart */}
              <Link href="/cart" aria-label={`Cart — ${cartCount} items`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
                  background: cartCount > 0
                    ? (isModernGreen ? 'linear-gradient(135deg,#d4af37,#b89324)' : (isCleanWhite ? `linear-gradient(135deg,${theme.primaryColor},color-mix(in srgb, ${theme.primaryColor} 80%, #000))` : 'linear-gradient(135deg,var(--pd-primary),#c2410c)'))
                    : (isModernGreen ? 'rgba(255,255,255,0.06)' : (isCleanWhite ? '#f8fafc' : '#f8fafc')),
                  border: cartCount > 0
                    ? 'none'
                    : (isModernGreen ? '1px solid rgba(255,255,255,0.15)' : (isCleanWhite ? '1px solid #e2e8f0' : '1px solid #e2e8f0')),
                  borderRadius: '8px', padding: '7px 12px', transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!cartCount) {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)');
                  }
                }}
                onMouseLeave={e => {
                  if (!cartCount) {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = isModernGreen ? 'rgba(255,255,255,0.15)' : (isCleanWhite ? '#e2e8f0' : '#e2e8f0');
                  }
                }}>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-shopping-cart" style={{ fontSize: '16px', color: cartCount > 0 ? '#fff' : (isModernGreen ? '#f7f5ed' : (isCleanWhite ? '#1e293b' : '#374151')) }} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-8px', right: '-8px',
                      background: isModernGreen ? '#0d231d' : (isCleanWhite ? '#ffffff' : '#fff'),
                      color: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : 'var(--pd-primary)'),
                      borderRadius: '10px',
                      fontSize: '9px', fontWeight: 800, padding: '1px 5px', lineHeight: 1.5
                    }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="d-none d-md-block">
                  <div style={{ fontSize: '10px', color: cartCount > 0 ? (isModernGreen ? 'rgba(13,35,29,0.75)' : 'rgba(255,255,255,0.75)') : '#94a3b8', lineHeight: 1 }}>Cart</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: cartCount > 0 ? '#fff' : (isModernGreen ? '#f7f5ed' : (isCleanWhite ? '#1e293b' : '#1e293b')), lineHeight: 1.4 }}>
                    PKR {cartTotal.toLocaleString()}
                  </div>
                </div>
              </Link>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)} className="d-flex d-lg-none"
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', background: isModernGreen ? '#14352c' : (isCleanWhite ? '#f1f5f9' : '#0f172a'),
                  border: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isModernGreen ? '#d4af37' : (isCleanWhite ? theme.primaryColor : '#fff')
                }}
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
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', padding: '10px 14px',
                    color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--pd-font)'
                  }} />
                <button type="submit" style={{ background: 'var(--pd-primary)', border: 'none', padding: '0 16px', color: '#fff', cursor: 'pointer' }}>
                  <i className="fas fa-search" style={{ fontSize: '14px' }} />
                </button>
              </div>
            </form>
            {/* Mobile nav links */}
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
                  textDecoration: 'none', color: isActive(link.href) ? 'var(--pd-primary)' : 'rgba(255,255,255,0.85)',
                  background: isActive(link.href) ? 'rgba(234,88,12,0.15)' : 'transparent',
                  fontWeight: isActive(link.href) ? 700 : 500, fontSize: '0.9rem', marginBottom: '2px'
                }}>
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
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '20px', padding: '5px 12px', fontSize: '0.75rem', color: '#fff', textDecoration: 'none', fontWeight: 500
                    }}>
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
