'use client';

import React from 'react';
import Link from 'next/link';
import { getCatIcon, getCatColor } from './CategoryDropdown';
import { CategoryIcon } from '@/components/common/ThemeIcon';

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

/**
 * Recursive Mobile Category Accordion Component
 */
function MobileCategoryTreeItem({
  node,
  onClose,
  depth = 0,
}: {
  node: any;
  onClose: () => void;
  depth?: number;
}) {
  const childList = node.children || node.subcategories || [];
  const hasChildren = Array.isArray(childList) && childList.length > 0;
  const [expanded, setExpanded] = React.useState(false);

  const paddingLeft = depth === 0 ? '12px' : `${12 + depth * 14}px`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: `8px 10px 8px ${paddingLeft}`,
          marginTop: '2px',
        }}
      >
        <Link
          href={`/shop?category=${node.slug}`}
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: depth === 0 ? '0.84rem' : '0.78rem',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: depth === 0 ? 600 : 500,
            flex: 1,
            minWidth: 0,
          }}
        >
          {depth > 0 ? (
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px' }}>↳</span>
          ) : (
            <CategoryIcon
              icon={node.icon || getCatIcon(node.slug)}
              style={{ fontSize: '11px', color: getCatColor(node.slug) }}
            />
          )}
          <span className="text-truncate">{node.name}</span>
        </Link>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            style={{
              border: 'none',
              background: expanded ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: expanded ? 'var(--pd-primary, #ea580c)' : '#ffffff',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              minWidth: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            aria-label={expanded ? 'Collapse subcategories' : 'Expand subcategories'}
          >
            <i
              className="fas fa-chevron-right"
              style={{
                fontSize: '11px',
                transition: 'transform 0.2s ease',
                transform: expanded ? 'rotate(90deg)' : 'none',
              }}
            />
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
          {childList.map((child: any) => (
            <MobileCategoryTreeItem
              key={child.slug}
              node={child}
              onClose={onClose}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  // Lock background scroll when drawer is open
  React.useEffect(() => {
    if (!open) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow || '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* ── Fixed Backdrop Blur Overlay ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 9998,
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* ── Fixed Sticky Slide-Out Drawer Panel ── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '85%',
          maxWidth: '330px',
          height: '100%',
          maxHeight: '100dvh',
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          boxShadow: '8px 0 32px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          touchAction: 'pan-y',
        }}
        aria-label="Mobile Navigation Sidebar"
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0f172a',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--pd-primary, #ea580c), #f97316)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              <i className="fas fa-bars" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              Menu
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            aria-label="Close menu"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Drawer Content Body with Touch Scrolling Container */}
        <div
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Mobile Search Form */}
          <form
            onSubmit={(e) => {
              onSearch(e);
              onClose();
            }}
          >
            <div
              style={{
                display: 'flex',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <input
                type="search"
                placeholder="Search automotive accessories..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '11px 14px',
                  color: '#fff',
                  fontSize: '0.86rem',
                  outline: 'none',
                  fontFamily: 'var(--pd-font)',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--pd-primary, #ea580c)',
                  border: 'none',
                  padding: '0 16px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
                aria-label="Search"
              >
                <i className="fas fa-search" style={{ fontSize: '13px' }} />
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                    background: active ? 'var(--pd-primary, #ea580c)' : 'rgba(255, 255, 255, 0.03)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <i
                    className={
                      link.href === '/'
                        ? 'fas fa-home'
                        : link.href.includes('shop')
                        ? 'fas fa-th-large'
                        : link.href.includes('wishlist')
                        ? 'fas fa-heart'
                        : link.href.includes('track')
                        ? 'fas fa-truck'
                        : 'fas fa-envelope'
                    }
                    style={{
                      fontSize: '13px',
                      color: active ? '#ffffff' : 'var(--pd-primary, #ea580c)',
                      width: '16px',
                    }}
                  />
                  <span>{link.label}</span>
                  {link.href === '/cart' && cartCount > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: '#ffffff',
                        color: '#ea580c',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Categories Section */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '14px',
              marginTop: '4px',
            }}
          >
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '10px',
              }}
            >
              Browse Categories
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categoryTree.map((cat) => (
                <MobileCategoryTreeItem
                  key={cat.slug}
                  node={cat}
                  onClose={onClose}
                  depth={0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Drawer Bottom Quick Action */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0b1120',
            flexShrink: 0,
          }}
        >
          <a
            href="https://wa.me/923185205667"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#25D366',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '16px' }} />
            WhatsApp Support
          </a>
        </div>
      </aside>
    </>
  );
}
