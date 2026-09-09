'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '@/types';

export interface HomeCleanCategoryStripProps {
  categories: any[];
  products?: IProduct[];
  primaryColor?: string;
}

// Curated concise titles and clean 2-line subtitles matching AutoStore.pk cards 100%
const CURATED_CATEGORY_META: Record<string, { shortTitle: string; line1: string; line2: string }> = {
  'car-accessories': {
    shortTitle: 'CAR ACCESSORIES',
    line1: 'Viral interior gadgets &',
    line2: 'styling essentials',
  },
  'perfumes': {
    shortTitle: 'CAR PERFUMES',
    line1: 'Solar rotating luxury',
    line2: 'diffusers & aromas',
  },
  'car-care-polish': {
    shortTitle: 'CAR CARE & WAX',
    line1: 'Microfiber drying towels,',
    line2: 'polish & sprays',
  },
  'car-lights': {
    shortTitle: 'LED LIGHTS & DRL',
    line1: 'RGB ambient kits &',
    line2: 'daytime running lights',
  },
  'exterior-mirrors': {
    shortTitle: 'SIDE MIRRORS',
    line1: 'OEM replacement door',
    line2: 'mirrors & glass',
  },
  'mobile-accessories': {
    shortTitle: 'MOBILE & TECH',
    line1: 'Fast chargers, mounts &',
    line2: 'certified cables',
  },
  'earbuds-audio': {
    shortTitle: 'WIRELESS AUDIO',
    line1: 'TWS earbuds &',
    line2: 'spatial sound gear',
  },
  'key-chains': {
    shortTitle: 'KEY CHAINS',
    line1: 'Premium metallic &',
    line2: 'leather smart fobs',
  },
  'floor-mats': {
    shortTitle: 'FLOOR MATS',
    line1: 'All-weather 7D &',
    line2: 'custom fit trays',
  },
};

export const HomeCleanCategoryStrip: React.FC<HomeCleanCategoryStripProps> = ({
  categories = [],
  products = [],
  primaryColor = '#ea580c',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Dynamically resolve AutoStore-style cards with clean non-truncated text
  const categoryCards = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const list: Array<{
      name: string;
      slug: string;
      line1: string;
      line2: string;
      image: string;
    }> = [];

    const findImage = (slug: string) => {
      const match = products.find(
        (p) =>
          (p.subcategory && p.subcategory.toLowerCase() === slug.toLowerCase()) ||
          (p.category && p.category.toLowerCase() === slug.toLowerCase())
      );
      return match?.image;
    };

    categories.forEach((cat) => {
      const slugKey = (cat.slug || '').toLowerCase();
      const meta = CURATED_CATEGORY_META[slugKey];
      const title = meta?.shortTitle || cat.name.toUpperCase();
      const line1 = meta?.line1 || 'Tested & verified';
      const line2 = meta?.line2 || 'genuine auto essentials';
      const image = cat.image?.startsWith('http') ? cat.image : findImage(cat.slug) || '/img/product-placeholder.png';

      list.push({
        name: title,
        slug: cat.slug,
        line1,
        line2,
        image,
      });

      // Also add subcategories if available
      if (Array.isArray(cat.subcategories)) {
        cat.subcategories.forEach((sub: any) => {
          const subSlugKey = (sub.slug || '').toLowerCase();
          const subMeta = CURATED_CATEGORY_META[subSlugKey];
          const subTitle = subMeta?.shortTitle || sub.name.toUpperCase();
          const subLine1 = subMeta?.line1 || 'Genuine accessories &';
          const subLine2 = subMeta?.line2 || 'vehicle upgrades';
          const subImage = sub.image?.startsWith('http') ? sub.image : findImage(sub.slug) || image;

          list.push({
            name: subTitle,
            slug: sub.slug,
            line1: subLine1,
            line2: subLine2,
            image: subImage,
          });
        });
      }
    });

    return list;
  }, [categories, products]);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // ── Auto-Advance Every 2 Seconds with Silky-Smooth Animation ──
  const isInteractingRef = useRef(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepForward = useCallback(() => {
    if (!scrollRef.current || isInteractingRef.current) return;
    const el = scrollRef.current;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardStep = firstCard ? firstCard.offsetWidth + 14 : 219;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (el.scrollLeft >= maxScroll - 15) {
      // Reached the end -> gracefully loop back to the start
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Step to the next card with native smooth snap animation
      el.scrollBy({ left: cardStep, behavior: 'smooth' });
    }
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (categoryCards.length <= 1) return;
    autoPlayTimerRef.current = setInterval(() => {
      stepForward();
    }, 2000);
  }, [categoryCards.length, stepForward, stopAutoPlay]);

  const scheduleResume = useCallback((delayMs = 2000) => {
    stopAutoPlay();
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      startAutoPlay();
    }, delayMs);
  }, [startAutoPlay, stopAutoPlay]);

  // Handle visibility and auto-play lifecycle
  useEffect(() => {
    startAutoPlay();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopAutoPlay();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startAutoPlay, stopAutoPlay]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, categoryCards]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    stopAutoPlay();
    const firstCard = scrollRef.current.firstElementChild as HTMLElement | null;
    const cardStep = firstCard ? (firstCard.offsetWidth + 14) * 2 : 438;
    const scrollAmount = direction === 'left' ? -cardStep : cardStep;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    scheduleResume(2500);
  };

  const handleMouseEnter = () => {
    isInteractingRef.current = true;
    stopAutoPlay();
  };

  const handleMouseLeave = () => {
    isInteractingRef.current = false;
    startAutoPlay();
  };

  const handleTouchStart = () => {
    isInteractingRef.current = true;
    stopAutoPlay();
  };

  const handleTouchEnd = () => {
    scheduleResume(2000);
  };

  if (categoryCards.length === 0) return null;

  return (
    <div
      className="w-full relative select-none bg-white"
      aria-label="AutoStore Style Category Carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* 1. Slim Brand Stripe Band (Matching AutoStore slim ~44px height) */}
      <div
        className="w-full relative"
        style={{
          background: primaryColor,
          height: '44px',
        }}
      />

      {/* 2. Horizontal Cards Carousel Track (Overlaps stripe by starting 38px inside it) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative -mt-[38px] z-10">
        
        {/* Left Arrow Button: Pure round circle with white chevron & border */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg z-30 transition-transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white focus:outline-none p-0 m-0"
            style={{ backgroundColor: primaryColor }}
            aria-label="Previous categories"
          >
            <i className="fas fa-chevron-left text-white text-xs sm:text-sm" />
          </button>
        )}

        {/* Right Arrow Button: Pure round circle with white chevron & border */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg z-30 transition-transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white focus:outline-none p-0 m-0"
            style={{ backgroundColor: primaryColor }}
            aria-label="Next categories"
          >
            <i className="fas fa-chevron-right text-white text-xs sm:text-sm" />
          </button>
        )}

        {/* Horizontal Track of White Cards */}
        <div
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none scroll-smooth focus:outline-none relative z-20"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
        >
          {categoryCards.map((cat, idx) => (
            <Link
              key={`${cat.slug}-${idx}`}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group bg-white rounded-lg shadow-[0_3px_12px_rgba(0,0,0,0.07)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden border border-slate-100 hover:-translate-y-1 no-underline shrink-0"
              style={{
                width: '205px',
                minWidth: '205px',
                maxWidth: '205px',
                height: '205px',
                flex: '0 0 205px',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
              }}
            >
              {/* Top Text Content (Clean Title + 2-line Subtitle matching AutoStore) */}
              <div className="px-3 pt-2.5 pb-1 text-left">
                <div
                  className="font-black text-[12px] uppercase tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors"
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: '1.25',
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    wordBreak: 'break-word',
                  }}
                  title={cat.name}
                >
                  {cat.name}
                </div>
                <div
                  className="text-[10.5px] font-normal leading-snug mt-0.5 text-slate-500"
                  style={{
                    color: '#64748b',
                    lineHeight: '1.3',
                    height: '28px',
                    overflow: 'hidden',
                  }}
                >
                  <span className="block truncate">{cat.line1}</span>
                  <span className="block truncate">{cat.line2}</span>
                </div>
              </div>

              {/* Bottom Product Image on Subtle Gray Pedestal */}
              <div className="relative w-full h-[120px] mt-auto rounded-b-lg overflow-hidden flex items-center justify-center p-2 bg-[#f8f9fa]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 205px, 205px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105 p-1.5"
                />
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* 3. White Section Below with FEATURED CATEGORIES headline */}
      <div className="bg-white pt-6 pb-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Accent Line */}
          <div
            className="w-12 h-1 rounded-full mb-2"
            style={{ backgroundColor: primaryColor }}
          />
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 m-0">
            FEATURED CATEGORIES
          </h2>
        </div>
      </div>

    </div>
  );
};
