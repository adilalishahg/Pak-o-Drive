'use client';

import React from 'react';
import Link from 'next/link';
import { getCatIcon, getCatColor } from './CategoryDropdown';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (e: React.FormEvent) => void;
  navLinks: NavLink[];
  isActive: (href: string) => boolean;
  cartCount: number;
  categoryTree: any[];
}

export function MobileNavDrawer({
  open,
  onClose,
  query,
  onQueryChange,
  onSearch,
  navLinks,
  isActive,
  cartCount,
  categoryTree,
}: MobileNavDrawerProps) {
  if (!open) return null;

  return (
    <div
      style={{
        background: '#0f172a',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 16px 16px',
      }}
    >
      {/* Mobile search */}
      <form
        onSubmit={(e) => {
          onSearch(e);
          onClose();
        }}
        className="mb-3"
      >
        <div
          style={{
            display: 'flex',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.07)',
              border: 'none',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
              fontFamily: 'var(--pd-font)',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--pd-primary)',
              border: 'none',
              padding: '0 16px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-search" style={{ fontSize: '14px' }} />
          </button>
        </div>
      </form>

      {/* Mobile nav links */}
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: isActive(link.href) ? 'var(--pd-primary)' : 'rgba(255,255,255,0.85)',
            background: isActive(link.href) ? 'rgba(234,88,12,0.15)' : 'transparent',
            fontWeight: isActive(link.href) ? 700 : 500,
            fontSize: '0.9rem',
            marginBottom: '2px',
          }}
        >
          {link.label}
          {link.href === '/cart' && cartCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                background: 'var(--pd-primary)',
                color: '#fff',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      ))}

      {/* Mobile categories */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          marginTop: '8px',
          paddingTop: '10px',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
          }}
        >
          Categories
        </p>
        <div className="d-flex flex-wrap gap-2">
          {categoryTree.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <i
                className={getCatIcon(cat.slug)}
                style={{ fontSize: '10px', color: getCatColor(cat.slug) }}
              />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
