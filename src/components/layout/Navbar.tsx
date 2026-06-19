'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { logInteraction } from '../common/AnalyticsTracker';
import { useSiteInfo } from '../common/SiteInfoProvider';
import { ThemeIcon } from '../common/ThemeIcon';

/* ─── Category icon map ──────────────────────────────────────── */
const CAT_ICONS: Record<string, string> = {
  headphones:   'fas fa-headphones-alt',
  chargers:     'fas fa-bolt',
  automotive:   'fas fa-car',
  smartwatches: 'fas fa-clock',
  accessories:  'fas fa-mobile-alt',
  laptops:      'fas fa-laptop',
  cameras:      'fas fa-camera',
  gaming:       'fas fa-gamepad',
  speakers:     'fas fa-volume-up',
  tablets:      'fas fa-tablet-alt',
  cables:       'fas fa-plug',
  networking:   'fas fa-wifi',
};

const CAT_COLORS: Record<string, string> = {
  headphones:   '#7c3aed',
  chargers:     '#f59e0b',
  automotive:   '#0891b2',
  smartwatches: '#059669',
  accessories:  '#db2777',
  laptops:      '#2563eb',
  cameras:      '#dc2626',
  gaming:       '#7c3aed',
  speakers:     '#0891b2',
  tablets:      '#059669',
  cables:       '#f59e0b',
  networking:   '#2563eb',
};

function getCatIcon(slug: string) {
  return CAT_ICONS[slug] ?? 'fas fa-tag';
}
function getCatColor(slug: string) {
  return CAT_COLORS[slug] ?? 'var(--pd-primary)';
}

const DEFAULT_CATEGORIES = [
  { name: 'Headphones',           slug: 'headphones'   },
  { name: 'Chargers & Cables',    slug: 'chargers'     },
  { name: 'Automotive Electronics', slug: 'automotive' },
  { name: 'Smartwatches',         slug: 'smartwatches' },
  { name: 'Mobile Accessories',   slug: 'accessories'  },
];

/* ─── Premium Category Dropdown ─────────────────────────────── */
function CategoriesDropdown({
  categories,
  open,
  onClose,
}: {
  categories: { name: string; slug: string }[];
  open: boolean;
  onClose: () => void;
}) {
  /* Split into two columns */
  const half = Math.ceil(categories.length / 2);
  const col1 = categories.slice(0, half);
  const col2 = categories.slice(half);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1028,
            background: 'transparent',
          }}
          aria-hidden="true"
        />
      )}

      {/* Dropdown panel */}
      <div
        role="menu"
        aria-label="Product categories"
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: '480px',
          zIndex: 1029,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08)',
          border: '1px solid rgba(226,232,240,0.8)',
          background: '#fff',
          /* animate */
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
          transition: 'opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--pd-secondary) 0%, color-mix(in srgb, var(--pd-secondary) 75%, #334155) 100%)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 80%, #000))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <i className="fas fa-th-large" style={{ color: '#fff', fontSize: '13px' }} />
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '-0.2px' }}>
              All Categories
            </span>
          </div>
          <Link
            href="/shop"
            onClick={onClose}
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.72rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            View All <i className="fas fa-arrow-right" style={{ fontSize: '10px' }} />
          </Link>
        </div>

        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', padding: '10px' }}>
          {[...col1, ...col2].map((cat) => (
            <CategoryItem key={cat.slug} cat={cat} onClose={onClose} />
          ))}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            padding: '12px 20px',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            <i className="fas fa-fire me-1" style={{ color: 'var(--pd-primary)' }} />
            {categories.length} categories available
          </span>
          <Link
            href="/shop"
            onClick={onClose}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pd-primary)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            Shop Everything <i className="fas fa-arrow-right" style={{ fontSize: '10px' }} />
          </Link>
        </div>
      </div>
    </>
  );
}

function CategoryItem({
  cat,
  onClose,
}: {
  cat: { name: string; slug: string };
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = getCatColor(cat.slug);
  const icon  = getCatIcon(cat.slug);

  return (
    <Link
      href={`/shop?category=${cat.slug}`}
      onClick={onClose}
      role="menuitem"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        textDecoration: 'none',
        background: hovered ? `color-mix(in srgb, ${color} 8%, #fff)` : 'transparent',
        transition: 'background 0.18s ease',
        cursor: 'pointer',
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '9px',
          background: hovered
            ? `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 80%, #000))`
            : `color-mix(in srgb, ${color} 12%, #fff)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.18s ease',
          boxShadow: hovered ? `0 4px 12px color-mix(in srgb, ${color} 30%, transparent)` : 'none',
        }}
      >
        <i
          className={icon}
          style={{
            fontSize: '14px',
            color: hovered ? '#fff' : color,
            transition: 'color 0.18s ease',
          }}
        />
      </div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.83rem',
            fontWeight: 600,
            color: hovered ? color : '#1e293b',
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.18s ease',
          }}
        >
          {cat.name}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontWeight: 400,
          }}
        >
          Browse collection →
        </p>
      </div>
    </Link>
  );
}

/* ─── Main Navbar ────────────────────────────────────────────── */
export const Navbar: React.FC = () => {
  const pathname   = usePathname();
  const router     = useRouter();
  const { cartCount, cartTotal } = useCart();
  const { info } = useSiteInfo();

  const [categories, setCategories]     = useState(DEFAULT_CATEGORIES);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchCatOpen, setSearchCatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchCategory, setSearchCategory] = useState('All Category');
  const [scrolled, setScrolled]         = useState(false);
  const [showBackTop, setShowBackTop]   = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const searchCatRef = useRef<HTMLDivElement>(null);

  /* close on route change */
  useEffect(() => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    setSearchCatOpen(false);
  }, [pathname]);

  /* load categories from API */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategories(json.data.map((c: any) => ({ name: c.name, slug: c.slug })));
        }
      } catch {}
    })();
  }, []);

  /* scroll events */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 45);
      setShowBackTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* keyboard close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCategoriesOpen(false); setSearchCatOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '/shop?';
    if (searchQuery.trim()) {
      url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      logInteraction('search_intent', window.location.pathname, { keyword: searchQuery.trim() });
    }
    if (searchCategory !== 'All Category') {
      const found = categories.find(c => c.name === searchCategory);
      if (found) url += `category=${found.slug}&`;
    }
    router.push(url.endsWith('&') || url.endsWith('?') ? url.slice(0, -1) : url);
  };

  const navLinkStyle = (path: string): React.CSSProperties => ({
    borderBottom: pathname === path ? '3px solid rgba(255,255,255,0.9)' : '3px solid transparent',
    transition: 'border-color 0.2s ease',
    paddingBottom: '4px',
  });

  return (
    <>
      {/* Topbar removed */}

      {/* ── Logo + Search ─────────────────────────────────── */}
      <div className="container-fluid px-5 py-4 d-none d-lg-block bg-white">
        <div className="row gx-0 align-items-center text-center">
          <div className="col-md-4 col-lg-3 text-center text-lg-start">
            <Link href="/" className="navbar-brand p-0" aria-label="PAKODRIVE Home">
              <h1 className="display-5 m-0" style={{ fontWeight: 800, letterSpacing: '-1px' }}>
                <ThemeIcon name="shopping-bag" className="me-2" style={{ color: 'var(--pd-primary)' }} />
                <span style={{ color: 'var(--pd-primary)' }}>{info.logoText}</span>
              </h1>
            </Link>
          </div>
          <div className="col-md-4 col-lg-6 text-center">
            <form onSubmit={handleSearchSubmit} className="position-relative ps-4" role="search" aria-label="Product search">
              <div className="d-flex border rounded-pill" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
                <input
                  id="site-search"
                  className="form-control border-0 rounded-pill w-100 py-3 px-4"
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ boxShadow: 'none', fontFamily: 'var(--pd-font)' }}
                  aria-label="Search products"
                />

                {/* ── Premium Category Selector ── */}
                <div ref={searchCatRef} style={{ position: 'relative', flexShrink: 0 }}>
                  {/* Backdrop */}
                  {searchCatOpen && (
                    <div
                      onClick={() => setSearchCatOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 1038 }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setSearchCatOpen(o => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={searchCatOpen}
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 18px',
                      background: searchCatOpen ? '#f1f5f9' : '#fff',
                      border: 'none',
                      borderLeft: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontFamily: 'var(--pd-font)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#374151',
                      whiteSpace: 'nowrap',
                      minWidth: '160px',
                      transition: 'background 0.18s',
                      outline: 'none',
                    }}
                  >
                    <ThemeIcon
                      name="categories"
                      style={{ fontSize: '11px', color: 'var(--pd-primary)', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {searchCategory === 'All Category' ? 'All Categories' : searchCategory}
                    </span>
                    <ThemeIcon
                      name="chevron-down"
                      style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        transform: searchCatOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>

                  {/* Dropdown panel */}
                  <div
                    role="listbox"
                    aria-label="Select category"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '240px',
                      zIndex: 1039,
                      background: '#fff',
                      borderRadius: '14px',
                      boxShadow: '0 20px 50px rgba(15,23,42,0.16), 0 4px 14px rgba(15,23,42,0.07)',
                      border: '1px solid rgba(226,232,240,0.9)',
                      overflow: 'hidden',
                      opacity: searchCatOpen ? 1 : 0,
                      transform: searchCatOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                      pointerEvents: searchCatOpen ? 'auto' : 'none',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: '10px 14px 8px',
                        borderBottom: '1px solid #f1f5f9',
                        background: 'linear-gradient(135deg, #f8fafc, #fff)',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Browse by Category
                      </span>
                    </div>

                    {/* Options */}
                    <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px' }}>
                      {/* All Categories option */}
                      {[{ name: 'All Categories', slug: '' }, ...categories].map((cat) => {
                        const isAll = cat.slug === '';
                        const isActive = isAll
                          ? searchCategory === 'All Category'
                          : searchCategory === cat.name;
                        const color = isAll ? 'var(--pd-primary)' : getCatColor(cat.slug);
                        const icon  = isAll ? 'fas fa-th-large' : getCatIcon(cat.slug);

                        return (
                          <button
                            key={cat.slug || 'all'}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setSearchCategory(isAll ? 'All Category' : cat.name);
                              setSearchCatOpen(false);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
                              border: 'none',
                              borderRadius: '9px',
                              background: isActive ? `color-mix(in srgb, ${color} 10%, #fff)` : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background 0.15s ease',
                              fontFamily: 'var(--pd-font)',
                            }}
                            onMouseEnter={e => {
                              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = `color-mix(in srgb, ${color} 6%, #f8fafc)`;
                            }}
                            onMouseLeave={e => {
                              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            }}
                          >
                            {/* Icon bubble */}
                            <div
                              style={{
                                width: '30px', height: '30px',
                                borderRadius: '8px',
                                background: isActive
                                  ? `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 80%, #000))`
                                  : `color-mix(in srgb, ${color} 12%, #fff)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.15s ease',
                              }}
                            >
                              <i
                                className={icon}
                                style={{
                                  fontSize: '12px',
                                  color: isActive ? '#fff' : color,
                                  transition: 'color 0.15s ease',
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? color : '#374151',
                                transition: 'color 0.15s ease',
                              }}
                            >
                              {cat.name}
                            </span>
                            {isActive && (
                              <i
                                className="fas fa-check ms-auto"
                                style={{ fontSize: '11px', color: color, flexShrink: 0 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-gradient rounded-pill py-3 px-5 border-0"
                  aria-label="Search"
                >
                  <ThemeIcon name="search" style={{ fontSize: '18px' }} />
                </button>
              </div>
            </form>
          </div>
          <div className="col-md-4 col-lg-3 text-center text-lg-end">
            <div className="d-inline-flex align-items-center gap-3">
              <Link href="/shop" className="text-muted d-flex align-items-center justify-content-center" aria-label="Compare">
                <span className="rounded-circle btn-md-square border" style={{ transition: 'all 0.2s' }}>
                  <ThemeIcon name="random" style={{ fontSize: '19px' }} />
                </span>
              </Link>
              <Link href="/shop" className="text-muted d-flex align-items-center justify-content-center" aria-label="Wishlist">
                <span className="rounded-circle btn-md-square border" style={{ transition: 'all 0.2s' }}>
                  <ThemeIcon name="heart" style={{ fontSize: '19px' }} />
                </span>
              </Link>
              <Link href="/cart" className="text-dark d-flex align-items-center justify-content-center gap-2" aria-label={`Cart — ${cartCount} items`}>
                <span className="rounded-circle btn-md-square border position-relative" style={{ transition: 'all 0.2s' }}>
                  <ThemeIcon name="cart" style={{ fontSize: '19px' }} />
                  {cartCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge-pulse"
                      style={{ fontSize: '10px', padding: '3px 6px' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className="fw-semibold" style={{ fontSize: '0.88rem' }}>PKR {cartTotal.toLocaleString()}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav Bar ───────────────────────────────────────── */}
      <div
        className="container-fluid nav-bar p-0"
        style={{
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.12)' : 'none',
          position: 'sticky',
          top: 0,
          zIndex: 1030,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div className="row gx-0 bg-primary px-5 align-items-center">

          {/* ── Premium Categories Toggle ─────────────────── */}
          <div className="col-lg-3 d-none d-lg-block">
            <div ref={catRef} style={{ position: 'relative', width: '260px' }}>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => setCategoriesOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={categoriesOpen}
                aria-controls="categories-dropdown"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: categoriesOpen
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  width: '100%',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'background 0.2s ease',
                  outline: 'none',
                  /* my-2 equivalent */
                  margin: '10px 0',
                }}
                onMouseEnter={e => {
                  if (!categoriesOpen)
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)';
                }}
                onMouseLeave={e => {
                  if (!categoriesOpen)
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* Hamburger icon box */}
                <div
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '7px',
                    background: 'linear-gradient(135deg, var(--pd-primary), color-mix(in srgb, var(--pd-primary) 80%, #000))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ThemeIcon name="bars" style={{ fontSize: '12px', color: '#fff' }} />
                </div>

                <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1, textAlign: 'left', letterSpacing: '-0.2px' }}>
                  All Categories
                </span>

                {/* Chevron */}
                <ThemeIcon
                  name="chevron-down"
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    transform: categoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </button>

              {/* Dropdown panel */}
              <CategoriesDropdown
                categories={categories}
                open={categoriesOpen}
                onClose={() => setCategoriesOpen(false)}
              />
            </div>
          </div>

          {/* ── Nav Links ─────────────────────────────────── */}
          <div className="col-12 col-lg-9">
            <nav className="navbar navbar-expand-lg navbar-light bg-primary py-3 py-lg-0" aria-label="Main navigation">
              <Link href="/" className="navbar-brand d-block d-lg-none" aria-label="PAKODRIVE Home">
                <h1 className="display-5 text-secondary m-0">
                  <ThemeIcon name="shopping-bag" className="text-white me-2" />{info.logoText}
                </h1>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                className="navbar-toggler ms-auto text-white border-white"
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-controls="navbarCollapse"
                aria-label="Toggle navigation"
              >
                <ThemeIcon name="bars" className="text-white" />
              </button>
              <div
                className={`navbar-collapse${mobileMenuOpen ? ' show' : ''}`}
                id="navbarCollapse"
                style={mobileMenuOpen ? { display: 'block' } : undefined}
              >
                <div className="navbar-nav ms-auto py-0">
                  {[
                    { href: '/',             label: 'Home'        },
                    { href: '/shop',         label: 'Shop'        },
                    { href: '/track-order',  label: 'Track Order' },
                    { href: '/cart',         label: 'Cart'        },
                    { href: '/contact',      label: 'Contact'     },
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`nav-item nav-link text-white fw-500 position-relative${pathname === link.href ? ' active' : ''}`}
                      style={navLinkStyle(link.href)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile categories accordion */}
                <div className="d-lg-none px-3 pb-2">
                  <p className="text-white-50 small fw-semibold mb-2 mt-3" style={{ letterSpacing: '0.5px' }}>CATEGORIES</p>
                  <div className="d-flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className="text-decoration-none"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '20px',
                          padding: '5px 12px',
                          fontSize: '0.78rem',
                          color: '#fff',
                          fontWeight: 500,
                        }}
                      >
                        <i className={getCatIcon(cat.slug)} style={{ fontSize: '11px' }} />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="d-flex align-items-center ms-lg-4 mb-3 mb-lg-0">
                  <a
                    href={`tel:${info.phone}`}
                    className="btn btn-secondary rounded-pill py-2 px-4 text-white"
                    style={{ fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    <ThemeIcon name="phone" className="me-2" /> {info.phone}
                  </a>
                </div>
              </div>
            </nav>
          </div>

        </div>
      </div>

      {/* ── Back to Top ───────────────────────────────────── */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top"
          aria-label="Back to top"
          title="Back to top"
        >
          <i className="fas fa-arrow-up" />
        </button>
      )}
    </>
  );
};
