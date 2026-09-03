'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSiteInfo } from '../common/SiteInfoProvider';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { useNavbar } from '@/hooks/useNavbar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { NavbarBrand } from './navbar/NavbarBrand';
import { NavbarNavLinks } from './navbar/NavbarNavLinks';
import { NavbarSearch } from './navbar/NavbarSearch';
import { NavbarActions } from './navbar/NavbarActions';
import { useMobileSmartSearch } from '@/hooks/useMobileSmartSearch';
import { MobileSearchModal } from './search/MobileSearchModal';
import { CategoryDropdown } from './CategoryDropdown';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/wishlist', label: 'Saved Items' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
];

/* ── Main Navbar Coordinator ───────────────────────────────── */
export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, cartTotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { info } = useSiteInfo();
  const { theme } = useSiteTheme();
  const isCleanWhite = theme.layoutTheme === 'theme1';

  const {
    categoryTree,
    catOpen,
    setCatOpen,
    mobileOpen,
    setMobileOpen,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    mounted,
    handleSearch,
  } = useNavbar();

  const smartSearch = useMobileSmartSearch();

  const safeCartCount = mounted ? cartCount : 0;
  const safeCartTotal = mounted ? cartTotal : 0;
  const isActive = (href: string) => pathname === href;

  const hexToRgba = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 37;
    const g = parseInt(hex.slice(3, 5), 16) || 99;
    const b = parseInt(hex.slice(5, 7), 16) || 235;
    return `rgba(${r},${g},${b},${a})`;
  };

  const pc = theme.primaryColor || '#2563eb';
  const pcB = hexToRgba(pc, 0.07);

  const hoverStyles = `
    .category-menu-item-wrapper:hover > .category-submenu { display: block !important; }
    .category-menu-link:hover { background-color: #f8fafc !important; }
    .theme1-logo-badge { background: ${pc}; box-shadow: 0 3px 10px ${hexToRgba(pc, 0.25)}; }
    .theme1-nav-link { font-size: 0.875rem; font-weight: 500; color: #475569; border-radius: 6px; padding: 8px 12px; transition: color 0.15s, background 0.15s; border-bottom: 2px solid transparent; display: inline-flex; align-items: center; }
    .theme1-nav-link:hover { color: ${pc}; background: ${pcB}; }
    .theme1-nav-link.active { color: ${pc}; font-weight: 700; border-bottom-color: ${pc}; background: ${pcB}; }
    .theme1-dropdown-header { background: ${pc}; }
    .theme1-dropdown-footer-btn { background: ${pc} !important; box-shadow: 0 3px 10px ${hexToRgba(pc, 0.3)} !important; }
    .theme1-track-order-btn { font-size: 0.78rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .theme1-track-order-btn:hover, .theme1-track-order-btn.active { color: ${pc}; background: ${pcB}; border-color: ${hexToRgba(pc, 0.35)}; }
    .theme1-cart-badge { background: ${pc}; }
  `;

  if (isCleanWhite) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Brand Logo */}
              <NavbarBrand info={info} theme={theme} isCleanWhite={true} />

              {/* Desktop Nav Links */}
              <NavbarNavLinks
                pathname={pathname}
                catOpen={catOpen}
                setCatOpen={setCatOpen}
                categoryTree={categoryTree}
                primaryColor={pc}
                isCleanWhite={true}
              />

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1">
                <NavbarSearch
                  searchOpen={searchOpen}
                  setSearchOpen={setSearchOpen}
                  query={query}
                  setQuery={setQuery}
                  handleSearch={handleSearch}
                />
                <NavbarActions
                  pathname={pathname}
                  safeCartCount={safeCartCount}
                  safeCartTotal={safeCartTotal}
                  wishlistCount={wishlistCount}
                  mobileOpen={mobileOpen}
                  setMobileOpen={setMobileOpen}
                  primaryColor={pc}
                  onOpenSearch={() => smartSearch.setIsOpen(true)}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <MobileNavDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          navLinks={NAV_LINKS}
          isActive={isActive}
          cartCount={safeCartCount}
          categoryTree={categoryTree}
        />

        {/* Smart Search Modal with AI & WhatsApp Lead Recovery */}
        <MobileSearchModal searchState={smartSearch} />
      </>
    );
  }

  // Modern / Classic Default Theme Layout
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100 transition-all">
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex align-items-center justify-content-between py-2">
            <div className="d-flex align-items-center">
              <NavbarBrand info={info} theme={theme} isCleanWhite={false} />

              {/* Desktop / Tablet Categories Dropdown Trigger */}
              <div className="d-none d-md-flex align-items-center ms-3 ms-lg-4" style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setCatOpen((o) => !o)}
                  className="btn d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1.5 shadow-xs transition-all"
                  style={{
                    background: catOpen ? 'var(--pd-primary, #ea580c)' : '#f8fafc',
                    border: '1.5px solid',
                    borderColor: catOpen ? 'var(--pd-primary, #ea580c)' : '#e2e8f0',
                    color: catOpen ? '#ffffff' : '#0f172a',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  aria-expanded={catOpen}
                >
                  <i
                    className="fas fa-th-large"
                    style={{ color: catOpen ? '#ffffff' : 'var(--pd-primary, #ea580c)', fontSize: '13px' }}
                  />
                  <span>Categories</span>
                  <i
                    className="fas fa-chevron-down"
                    style={{
                      fontSize: '9px',
                      transition: 'transform 0.2s ease',
                      transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <CategoryDropdown
                  roots={categoryTree}
                  open={catOpen}
                  onClose={() => setCatOpen(false)}
                  primaryColor={pc}
                />
              </div>
            </div>

            <div className="d-none d-lg-block flex-grow-1 mx-4" style={{ maxWidth: '480px' }}>
              <form onSubmit={handleSearch} className="position-relative">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search auto accessories, car care, tech..."
                  className="form-control rounded-pill pe-5 border-slate-200"
                  style={{ fontSize: '0.86rem', padding: '9px 18px' }}
                />
                <button
                  type="submit"
                  className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-muted"
                  aria-label="Submit search"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            </div>

            <NavbarActions
              pathname={pathname}
              safeCartCount={safeCartCount}
              safeCartTotal={safeCartTotal}
              wishlistCount={wishlistCount}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              primaryColor={pc}
              onOpenSearch={() => smartSearch.setIsOpen(true)}
            />
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        navLinks={NAV_LINKS}
        isActive={isActive}
        cartCount={safeCartCount}
        categoryTree={categoryTree}
      />

      {/* Smart Search Modal with AI & WhatsApp Lead Recovery */}
      <MobileSearchModal searchState={smartSearch} />
    </>
  );
};
