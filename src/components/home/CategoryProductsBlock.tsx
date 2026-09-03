'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { CategorySection } from '@/hooks/useHomePage';
import { ProductCardAuto } from '@/components/product/ProductCardAuto';
import { CategoryIcon } from '@/components/common/ThemeIcon';
import { SiteTheme } from '@/types/theme';
import { HomeCampaignOfferBanner } from './HomeCampaignOfferBanner';

export interface CategoryProductsBlockProps {
  sections: CategorySection[];
  theme: SiteTheme;
  isCleanWhite?: boolean;
  isModernGreen?: boolean;
}

export function CategoryProductsBlock({
  sections,
  theme,
  isCleanWhite,
  isModernGreen,
}: CategoryProductsBlockProps) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  if (!sections || sections.length === 0) return null;

  const scrollToSection = (slug: string) => {
    const el = sectionRefs.current[slug];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="category-products-container">
      {/* ── Quick Category Sticky / Nav Strip ── */}
      {sections.length > 1 && (
        <div className="py-2 mb-2" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <div className="d-flex align-items-center gap-2 px-2" style={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
            <span
              className="text-muted fw-bold d-none d-sm-inline-block me-1"
              style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              Jump to:
            </span>
            {sections.map((sec) => (
              <button
                key={sec.slug}
                type="button"
                onClick={() => scrollToSection(sec.slug)}
                className="btn btn-sm d-inline-flex align-items-center gap-2 border-0 rounded-pill px-3 py-1.5"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: isCleanWhite ? '#f1f5f9' : 'rgba(0,0,0,0.04)',
                  color: isCleanWhite ? '#334155' : 'inherit',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <CategoryIcon icon={sec.icon} style={{ fontSize: '11px', color: 'var(--pd-primary, #ea580c)' }} />
                <span>{sec.name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    opacity: 0.6,
                    background: 'rgba(0,0,0,0.06)',
                    borderRadius: '10px',
                    padding: '1px 6px',
                  }}
                >
                  {sec.products.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Category Sections ── */}
      <div className="d-flex flex-column gap-4 gap-md-5">
        {sections.map((sec, secIdx) => {
          return (
            <React.Fragment key={sec.slug}>
              <section
                ref={(el) => {
                sectionRefs.current[sec.slug] = el;
              }}
              className="category-section-block"
              style={{
                scrollMarginTop: '80px',
                padding: '16px 10px',
                background: isCleanWhite ? '#ffffff' : (secIdx % 2 === 1 ? 'rgba(0,0,0,0.015)' : '#ffffff'),
                borderRadius: '16px',
                border: isCleanWhite ? '1px solid #f1f5f9' : '1px solid rgba(0,0,0,0.04)',
              }}
              aria-label={sec.name}
            >
              {/* Category Header */}
              <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(234, 88, 12, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--pd-primary, #ea580c)',
                      fontSize: '15px',
                      flexShrink: 0,
                    }}
                  >
                    <CategoryIcon icon={sec.icon} fallback="fas fa-th-large" />
                  </div>
                  <div>
                    <h2
                      className="fw-bold text-dark mb-0"
                      style={{
                        fontSize: 'clamp(1.15rem, 2.5vw, 1.55rem)',
                        letterSpacing: '-0.3px',
                        lineHeight: 1.2,
                      }}
                    >
                      {sec.name}
                    </h2>
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      {sec.products.length} {sec.products.length === 1 ? 'Product' : 'Products'} in {sec.name}
                    </span>
                  </div>
                </div>

                {/* View All Button */}
                <Link
                  href={`/shop?category=${sec.slug}`}
                  className="d-inline-flex align-items-center gap-1.5 text-decoration-none fw-bold"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--pd-primary, #ea580c)',
                    background: 'rgba(234, 88, 12, 0.08)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>View All</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>

              {/* Products Grid */}
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
                className="category-products-grid"
              >
                <style>{`
                  @media (min-width: 768px) { .category-products-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                  @media (min-width: 992px) { .category-products-grid { grid-template-columns: repeat(4, 1fr) !important; } }
                  @media (min-width: 1400px) { .category-products-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 14px !important; } }
                `}</style>
                {sec.products.slice(0, 10).map((prod, idx) => (
                  <div
                    key={prod._id}
                    className="product-card-anim"
                    style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}
                  >
                    <ProductCardAuto product={prod} priority={secIdx === 0 && idx < 2} />
                  </div>
                ))}
              </div>

              {/* Category Footer: If more than 10 products */}
              {sec.products.length > 10 && (
                <div className="text-center mt-3 pt-2">
                  <Link
                    href={`/shop?category=${sec.slug}`}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-1.5 fw-semibold text-decoration-none"
                    style={{ fontSize: '0.8rem' }}
                  >
                    View All {sec.products.length} {sec.name} Products →
                  </Link>
                </div>
              )}
            </section>

            {/* Campaign Offer Placement Hook: After category */}
            <HomeCampaignOfferBanner
              placementFilter="after_category"
              categorySlug={sec.slug}
              categoryIndex={secIdx}
            />
          </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
