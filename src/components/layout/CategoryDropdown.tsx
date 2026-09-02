'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { getBestCategoryIcon } from '@/lib/categoryIconService';

import { CategoryIcon } from '../common/ThemeIcon';

const CAT_COLORS: Record<string, string> = {
  headphones: '#7c3aed',
  chargers: '#f59e0b',
  automotive: '#0891b2',
  'car-accessories': '#0891b2',
  'mobile-accessories': '#db2777',
  perfumes: '#ec4899',
  smartwatches: '#059669',
  accessories: '#db2777',
  laptops: '#2563eb',
  cameras: '#dc2626',
  gaming: '#7c3aed',
  speakers: '#0891b2',
  tablets: '#059669',
  cables: '#f59e0b',
  networking: '#0284c7',
};

export const getCatIcon = (s: string) => getBestCategoryIcon(s);
export const getCatColor = (s: string, primaryColor?: string) =>
  CAT_COLORS[s] ?? (primaryColor || 'var(--pd-primary)');

export function CategoryMenuItem({
  node,
  onClose,
  primaryColor,
}: {
  node: any;
  onClose: () => void;
  primaryColor?: string;
}) {
  const childList = node.children || node.subcategories || [];
  const hasSubs = Array.isArray(childList) && childList.length > 0;
  const color = getCatColor(node.slug, primaryColor);
  const icon = node.icon || getCatIcon(node.slug);

  return (
    <div className="position-relative category-menu-item-wrapper" style={{ display: 'block' }}>
      <Link
        href={`/shop?category=${node.slug}`}
        onClick={onClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          textDecoration: 'none',
          color: '#374151',
          fontSize: '0.84rem',
          fontWeight: 500,
          borderBottom: '1px solid #f8fafc',
          transition: 'background 0.15s, color 0.15s',
        }}
        className="category-menu-link"
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            flexShrink: 0,
            background: `color-mix(in srgb, ${color} 12%, #fff)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {node.image ? (
            <OptimizedImage
              src={node.image}
              alt={node.name}
              fill
              sizes="20px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <CategoryIcon icon={icon} style={{ fontSize: '12px', color }} />
          )}
        </div>
        <span className="text-truncate">{node.name}</span>
        {hasSubs && (
          <i className="fas fa-chevron-right ms-auto" style={{ fontSize: '9px', color: '#94a3b8' }} />
        )}
      </Link>

      {hasSubs && (
        <div
          className="category-submenu shadow-lg"
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            width: '240px',
            background: '#fff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'none',
            zIndex: 1050,
            padding: '4px 0',
          }}
        >
          {childList.map((subNode: any) => (
            <CategoryMenuItem
              key={subNode.slug}
              node={subNode}
              onClose={onClose}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryDropdown({
  roots,
  open,
  onClose,
  primaryColor,
}: {
  roots: any[];
  open: boolean;
  onClose: () => void;
  primaryColor?: string;
}) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 1040 }}
          aria-hidden="true"
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: '340px',
          zIndex: 1041,
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 50px rgba(15,23,42,0.15)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          pointerEvents: open ? 'auto' : 'none',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg,#0f172a,#1e293b)',
            padding: '10px 16px',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.3px' }}>
            <i className="fas fa-th-large me-2" style={{ color: 'var(--pd-primary)' }} />
            Browse Categories
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {roots.map((node) => (
            <CategoryMenuItem
              key={node.slug}
              node={node}
              onClose={onClose}
              primaryColor={primaryColor}
            />
          ))}
        </div>
        <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
          <Link
            href="/shop"
            onClick={onClose}
            className="btn btn-gradient w-100 rounded-2 border-0 text-white text-decoration-none d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.8rem', fontWeight: 700, padding: '8px' }}
          >
            <i className="fas fa-store" /> View All Products
          </Link>
        </div>
      </div>
    </>
  );
}
