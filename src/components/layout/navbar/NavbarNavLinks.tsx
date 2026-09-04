'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryMenuItem } from '../CategoryDropdown';

interface NavbarNavLinksProps {
  pathname: string;
  catOpen: boolean;
  setCatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categoryTree: any[];
  primaryColor?: string;
  isCleanWhite?: boolean;
}

export const NavbarNavLinks: React.FC<NavbarNavLinksProps> = ({
  pathname,
  catOpen,
  setCatOpen,
  categoryTree,
  primaryColor = '#2563eb',
  isCleanWhite = false,
}) => {
  return (
    <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
      <Link
        href="/"
        className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/' ? 'active' : ''}`}
      >
        Home
      </Link>
      <Link
        href="/shop"
        className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/shop' ? 'active' : ''}`}
      >
        Shop
      </Link>

      {/* Categories Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setCatOpen((o) => !o)}
          className={`theme1-nav-link px-3 py-2 border-0 bg-transparent flex items-center gap-1 ${catOpen ? 'active' : ''}`}
          style={{ cursor: 'pointer', fontWeight: 500 }}
          aria-expanded={catOpen}
        >
          Categories
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            style={{
              width: '12px',
              height: '12px',
              transition: 'transform 0.2s',
              transform: catOpen ? 'rotate(180deg)' : 'none',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown Panel */}
        {catOpen && (
          <>
            <div
              onClick={() => setCatOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 1040 }}
              aria-hidden="true"
            />
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '340px',
                zIndex: 1041,
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 60px rgba(15,23,42,0.14)',
                overflow: 'visible',
              }}
            >
              {/* Header */}
              <div
                className="theme1-dropdown-header"
                style={{ padding: '14px 20px', borderRadius: '14px 14px 0 0' }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                  Browse Categories
                </span>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '2px 0 0' }}>
                  Find products by category
                </p>
              </div>

              {/* Dynamic category list */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {categoryTree.map((node) => (
                  <CategoryMenuItem
                    key={node.slug}
                    node={node}
                    onClose={() => setCatOpen(false)}
                    primaryColor={primaryColor}
                  />
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
                    fontSize: '0.82rem',
                    fontWeight: 700,
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

      <Link
        href="/auto"
        className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/auto' ? 'active' : ''}`}
      >
        Auto Guides
      </Link>
      <Link
        href="/blog"
        className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/blog' || pathname === '/general' ? 'active' : ''}`}
      >
        Blog & Trends
      </Link>
      <Link
        href="/about"
        className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/about' ? 'active' : ''}`}
      >
        About Us
      </Link>
      <Link
        href="/contact"
        className={`theme1-nav-link px-3 py-2 text-decoration-none ${pathname === '/contact' ? 'active' : ''}`}
      >
        Contact Us
      </Link>
    </nav>
  );
};
