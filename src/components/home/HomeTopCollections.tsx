'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/common/OptimizedImage';

const CAT_IMAGES: Record<string, string> = {
  smartwatches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80',
  speakers: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=150&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80',
  cameras: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80',
  tvs: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=150&q=80',
  accessories: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=150&q=80',
};

const DEFAULT_COLLECTIONS = [
  { name: 'Smart Watches', slug: 'smartwatches' },
  { name: 'Smart Speakers', slug: 'speakers' },
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Smart Phones', slug: 'smartphones' },
  { name: 'Smart Security', slug: 'cameras' },
  { name: 'Smart TVs', slug: 'tvs' },
  { name: 'Accessories', slug: 'accessories' },
];

export interface HomeTopCollectionsProps {
  title?: string;
  categories: any[];
}

export const HomeTopCollections: React.FC<HomeTopCollectionsProps> = ({
  title = 'The Top Collections',
  categories,
}) => {
  const displayCats = categories.length > 0
    ? categories.filter(c => !c.parentCategory)
    : DEFAULT_COLLECTIONS;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">Explore our most popular category collections</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {displayCats.map((col, idx) => {
          const img = col.image || CAT_IMAGES[col.slug] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';
          return (
            <Link
              key={idx}
              href={`/shop?category=${col.slug}`}
              className="flex flex-col items-center group text-decoration-none theme1-collection-item"
            >
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:shadow-md transition-all duration-300 overflow-hidden p-2 theme1-collection-circle">
                <OptimizedImage
                  src={img}
                  alt={col.name}
                  width={64}
                  height={64}
                  style={{ objectFit: 'contain', maxHeight: '100%', width: 'auto', height: 'auto' }}
                  className="mix-blend-multiply group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 mt-3 transition-colors theme1-collection-text">
                {col.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
