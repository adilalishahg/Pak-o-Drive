'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';

const CAT_IMAGES: Record<string, string> = {
  smartwatches: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=150&q=80',
  speakers: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=150&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
  smartphones: 'https://images.unsplash.com/photo-1599950753725-24ae4078516e?auto=format&fit=crop&w=150&q=80',
  cameras: 'https://images.unsplash.com/photo-1528044514137-5d51957fc52e?auto=format&fit=crop&w=150&q=80',
  tvs: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=150&q=80',
  accessories: 'https://images.unsplash.com/photo-1618278943037-609b2ad08bc5?auto=format&fit=crop&w=150&q=80',
  chargers: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=150&q=80',
  laptops: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=150&q=80',
  gaming: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=150&q=80',
  tablets: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=150&q=80',
  automotive: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=150&q=80',
  cables: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=150&q=80',
  networking: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=150&q=80',
};

interface HomeCategoriesCarouselProps {
  categories: any[];
  title?: string;
}

export function HomeCategoriesCarousel({ categories, title = 'The Top Collections' }: HomeCategoriesCarouselProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4 border-bottom">
      <div className="container-fluid px-3 px-lg-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <Link href="/shop" className="text-primary fw-semibold small text-decoration-none">
            View All <i className="fas fa-chevron-right ms-1 small" />
          </Link>
        </div>

        <div
          className="d-flex gap-3 overflow-x-auto pb-2 scrollbar-none"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            willChange: 'scroll-position',
          }}
        >
          {categories.map((c) => {
            const img = c.image || CAT_IMAGES[c.slug] || '/img/product-placeholder.png';
            return (
              <Link
                key={c._id || c.id || c.slug}
                href={`/shop?category=${c.slug}`}
                className="text-center text-decoration-none flex-shrink-0"
                style={{ width: '110px', scrollSnapAlign: 'start' }}
              >
                <div
                  className="rounded-circle mx-auto mb-2 overflow-hidden position-relative border shadow-sm p-2 bg-white"
                  style={{ width: '80px', height: '80px', transition: 'transform 0.2s ease' }}
                >
                  <OptimizedImage
                    src={img}
                    alt={c.name}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'contain', padding: '4px' }}
                  />
                </div>
                <span className="d-block text-dark fw-bold small text-truncate leading-normal py-0.5">{c.name}</span>
                {c.productCount !== undefined && (
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {c.productCount} items
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
