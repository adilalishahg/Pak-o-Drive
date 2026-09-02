'use client';

import { useState, useEffect, useMemo } from 'react';
import { IProduct } from '@/types';
import { HeroSlide } from '@/types/common';
import { useSiteTheme } from '@/components/common/DynamicThemeProvider';
import { getCatIcon } from '@/components/layout/CategoryDropdown';

export interface CategorySection {
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  productCount: number;
  products: IProduct[];
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    badge: '🔥 Limited Time Deal',
    tagline: 'Save Up To PKR 15,000',
    title: 'Premium Laptops & Smartphones',
    desc: 'Top-tier devices at unbeatable prices. Free shipping on all orders above PKR 5,000.',
    btnLink: '/shop?category=headphones',
    btnLabel: 'Shop Now',
    accent: 'var(--pd-primary)',
    bg: 'linear-gradient(135deg, var(--pd-hero-grad-start) 0%, color-mix(in srgb, var(--pd-hero-grad-start) 80%, #fff) 50%, var(--pd-hero-grad-end) 100%)',
    productImage: '/img/product-1.png',
    productImageAlt: 'Premium Headphones',
    price: 449,
    originalPrice: 798,
  },
  {
    badge: '⚡ Flash Sale',
    tagline: 'Save Up To PKR 5,000',
    title: 'Fast Chargers & Premium Cables',
    desc: 'Power your devices faster. MFi-certified cables and GaN chargers in stock.',
    btnLink: '/shop?category=chargers',
    btnLabel: 'Explore Deals',
    accent: 'var(--pd-accent)',
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-accent) 10%, #fff) 0%, color-mix(in srgb, var(--pd-accent) 5%, #fff) 50%, #fff 100%)',
    productImage: '/img/product-2.png',
    productImageAlt: 'Smart Watch',
    price: 899,
    originalPrice: 1499,
  },
];

export const OFFERS = [
  {
    sub: 'Find The Best Headphones for You!',
    title: 'Audiophile Headphones',
    disc: '40',
    img: '/img/product-1.png',
    link: '/shop?category=headphones',
    imgAlt: 'Premium Headphones',
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-primary) 8%, #fff) 0%, #fff 100%)',
  },
  {
    sub: 'Find The Best Smartwatches for You!',
    title: 'Smart Wearables',
    disc: '20',
    img: '/img/product-2.png',
    link: '/shop?category=smartwatches',
    imgAlt: 'Smart Watch',
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-accent) 8%, #fff) 0%, #fff 100%)',
  },
];

export type ProductTabKey = 'all' | 'new' | 'featured' | 'selling';

export interface UseHomePageProps {
  initialProducts: IProduct[];
  initialCategories: any[];
}

export function useHomePage({ initialProducts, initialCategories }: UseHomePageProps) {
  const [products] = useState<IProduct[]>(initialProducts);
  const [cats] = useState<any[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<ProductTabKey>('all');
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  /* IntersectionObserver — scroll animations */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.animate-on-scroll');
    if (!els.length) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return products.filter(p => Boolean(p.isNewArrival) || (p as any).isNewArrival === 'true');
      case 'featured':
        return products.filter(p => Boolean(p.isFeatured) || (p as any).isFeatured === 'true');
      case 'selling':
        return products.filter(p => Boolean(p.isTopSelling) || (p as any).isTopSelling === 'true');
      default:
        return products;
    }
  }, [products, activeTab]);

  const tabs: { key: ProductTabKey; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'new', label: 'New Arrivals' },
    { key: 'featured', label: 'Featured' },
    { key: 'selling', label: 'Top Selling' },
  ];

  /* ── Group products by Main Parent Categories (PriceOye pattern) ── */
  const categorySections = useMemo<CategorySection[]>(() => {
    if (!products || products.length === 0) return [];

    // Filter root/parent categories (parentCategory is falsy/empty)
    const parentCats = (cats && cats.length > 0)
      ? cats.filter(c => !c.parentCategory)
      : [];

    const sections: CategorySection[] = [];
    const usedProductIds = new Set<string>();

    if (parentCats.length > 0) {
      for (const pCat of parentCats) {
        const pSlug = (pCat.slug || '').toLowerCase();
        const pName = (pCat.name || '').toLowerCase();
        const subSlugs = (pCat.subcategories || pCat.children || []).map((s: any) => (s.slug || s.name || '').toLowerCase());

        const matchingProducts = products.filter(p => {
          const cat = (p.category || '').toLowerCase();
          const sub = (p.subcategory || '').toLowerCase();
          return (
            cat === pSlug ||
            cat === pName ||
            subSlugs.includes(cat) ||
            subSlugs.includes(sub) ||
            (pSlug && cat.includes(pSlug)) ||
            (cat && pSlug.includes(cat))
          );
        });

        if (matchingProducts.length > 0) {
          matchingProducts.forEach(p => usedProductIds.add(String(p._id)));
          sections.push({
            name: pCat.name,
            slug: pCat.slug,
            icon: pCat.icon || getCatIcon(pCat.slug),
            image: pCat.image || '',
            productCount: matchingProducts.length,
            products: matchingProducts,
          });
        }
      }
    }

    // Group any remaining products by product.category
    const remaining = products.filter(p => !usedProductIds.has(String(p._id)));
    if (remaining.length > 0) {
      const groupMap = new Map<string, IProduct[]>();
      for (const p of remaining) {
        const catKey = p.category ? p.category.trim() : 'Accessories';
        if (!groupMap.has(catKey)) {
          groupMap.set(catKey, []);
        }
        groupMap.get(catKey)!.push(p);
      }

      for (const [catName, prods] of groupMap.entries()) {
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sections.push({
          name: catName,
          slug: slug,
          icon: getCatIcon(slug),
          productCount: prods.length,
          products: prods,
        });
      }
    }

    return sections;
  }, [products, cats]);

  /* ── Safely resolve homepageSections with fallbacks ── */
  const hs = theme.homepageSections ?? ({} as typeof theme.homepageSections);
  const heroBig = hs?.heroBig ?? { enabled: true, badge: 'Featured Product', title: 'Smart Speakers With Google Assistant', subtitle: 'Experience room-filling sound and intelligent voice assistance.', buttonText: 'Shop Now', buttonLink: '/shop', imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80' };
  const heroSmall = hs?.heroSmall ?? { enabled: true, badge: 'Special Discount', title: 'TWS Earbuds', highlight: '50% Off', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80' };
  const trending = hs?.trendingProducts ?? { enabled: true, title: 'Trending Products', limit: 4 };
  const cols = hs?.collections ?? { enabled: true, title: 'The Top Collections' };
  const deal = hs?.weeklyDeal ?? { enabled: true, label: 'The Big Deal This Week', title: 'Apple iPhone 12 Pro Max', description: 'Get the ultimate package.', buttonText: 'Shop Now', buttonLink: '/shop', imageUrl: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=500&q=80' };
  const moreDeals = hs?.moreDeals ?? { enabled: true, title: 'More Active Deals', limit: 4 };
  const valProps = hs?.valueProps ?? { enabled: true };
  const featSec = hs?.featuredSection ?? { enabled: true, title: 'Featured Products', limit: 8 };
  const offerBanner1 = hs?.offerBanner1 ?? { enabled: true, subtitle: 'Special Discount', title: 'TWS Earbuds', discount: '50% Off', buttonLink: '/shop?category=headphones', imageUrl: '/img/product-1.png' };
  const offerBanner2 = hs?.offerBanner2 ?? { enabled: true, subtitle: 'Find The Best Smartwatches for You!', title: 'Smart Wearables', discount: '20% Off', buttonLink: '/shop?category=smartwatches', imageUrl: '/img/product-2.png' };

  /* ── Construct Dynamic Hero Slides for default layout ── */
  const dynamicHeroSlides: HeroSlide[] = [];

  if (hs?.heroSlides && Array.isArray(hs.heroSlides) && hs.heroSlides.length > 0) {
    const enabledSlides = hs.heroSlides.filter((s: any) => s.enabled !== false);
    for (const slide of enabledSlides) {
      const linkedProduct = slide.productId 
        ? initialProducts.find((p) => String(p._id) === String(slide.productId)) 
        : initialProducts.find((p) => (slide.title && p.name && (p.name.toLowerCase().includes(slide.title.toLowerCase()) || slide.title.toLowerCase().includes(p.name.toLowerCase()))));

      const resolvedImg = slide.imageType === 'custom' && slide.imageUrl
        ? slide.imageUrl
        : (linkedProduct?.image || slide.imageUrl || '/img/product-1.png');

      const resolvedBadge = slide.badge || linkedProduct?.heroText || '🔥 Featured Deal';
      const resolvedTitle = slide.title || linkedProduct?.name || 'Exclusive Product';
      const resolvedDesc = slide.subtitle || (linkedProduct?.description ? linkedProduct.description.slice(0, 120) : '');
      const resolvedLink = slide.buttonLink || (linkedProduct ? `/product/${linkedProduct._id}` : '/shop');
      const resolvedBtnText = slide.buttonText || 'Shop Now';
      const resolvedPrice = slide.price || linkedProduct?.price;
      const resolvedOriginalPrice = slide.originalPrice || linkedProduct?.originalPrice;

      dynamicHeroSlides.push({
        badge: resolvedBadge,
        tagline: '',
        title: resolvedTitle,
        desc: resolvedDesc,
        btnLink: resolvedLink,
        btnLabel: resolvedBtnText,
        accent: 'var(--pd-primary, #ea580c)',
        bg: slide.bgGradient || 'linear-gradient(135deg, var(--pd-hero-grad-start) 0%, color-mix(in srgb, var(--pd-hero-grad-start) 80%, #fff) 50%, var(--pd-hero-grad-end) 100%)',
        productImage: resolvedImg,
        productImageAlt: resolvedTitle,
        price: resolvedPrice,
        originalPrice: resolvedOriginalPrice,
      });
    }
  }

  if (dynamicHeroSlides.length === 0) {
    if (heroBig && heroBig.enabled !== false) {
      dynamicHeroSlides.push({
        badge: heroBig.badge || '🔥 Limited Time Deal',
        tagline: '',
        title: heroBig.title || 'Premium Laptops & Smartphones',
        desc: heroBig.subtitle || 'Top-tier devices at unbeatable prices. Free shipping on all orders above PKR 5,000.',
        btnLink: heroBig.buttonLink || '/shop',
        btnLabel: heroBig.buttonText || 'Shop Now',
        accent: 'var(--pd-primary)',
        bg: 'linear-gradient(135deg, var(--pd-hero-grad-start) 0%, color-mix(in srgb, var(--pd-hero-grad-start) 80%, #fff) 50%, var(--pd-hero-grad-end) 100%)',
        productImage: heroBig.imageUrl || '/img/product-1.png',
        productImageAlt: heroBig.title || 'Premium Headphones',
      });
    }
    if (deal && deal.enabled !== false) {
      dynamicHeroSlides.push({
        badge: deal.label || '⚡ Flash Sale',
        tagline: '',
        title: deal.title || 'Fast Chargers & Premium Cables',
        desc: deal.description || 'Power your devices faster.',
        btnLink: deal.buttonLink || '/shop',
        btnLabel: deal.buttonText || 'Explore Deals',
        accent: 'var(--pd-accent)',
        bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-accent) 10%, #fff) 0%, color-mix(in srgb, var(--pd-accent) 5%, #fff) 50%, #fff 100%)',
        productImage: deal.imageUrl || '/img/product-2.png',
        productImageAlt: deal.title || 'Smart Watch',
      });
    }
  }

  if (dynamicHeroSlides.length === 0) {
    dynamicHeroSlides.push(...HERO_SLIDES);
  }

  /* ── Construct Dynamic Offer Banners for default layout ── */
  const dynamicOffers = [];
  if (offerBanner1 && offerBanner1.enabled !== false) {
    dynamicOffers.push({
      sub: offerBanner1.subtitle || 'Special Discount',
      title: offerBanner1.title || 'TWS Earbuds',
      disc: offerBanner1.discount || '50% Off',
      img: offerBanner1.imageUrl || '/img/product-1.png',
      link: offerBanner1.buttonLink || '/shop',
      imgAlt: offerBanner1.title || 'Premium Headphones',
      bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-primary) 8%, #fff) 0%, #fff 100%)',
    });
  } else {
    dynamicOffers.push(OFFERS[0]);
  }
  if (offerBanner2 && offerBanner2.enabled !== false) {
    dynamicOffers.push({
      sub: offerBanner2.subtitle || 'Find The Best Smartwatches for You!',
      title: offerBanner2.title || 'Smart Wearables',
      disc: offerBanner2.discount || '20% Off',
      img: offerBanner2.imageUrl || '/img/product-2.png',
      link: offerBanner2.buttonLink || '/shop',
      imgAlt: offerBanner2.title || 'Smart Watch',
      bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-accent) 8%, #fff) 0%, #fff 100%)',
    });
  } else {
    dynamicOffers.push(OFFERS[1]);
  }

  const sliderConfig = useMemo(() => {
    const sliderCfg = hs?.heroSliderSettings ?? {
      sliderEngine: 'smooothy',
      autoSlideEnabled: true,
      autoSlideIntervalSec: 5,
      showArrows: true,
      showDots: true,
    };
    return {
      autoPlayMs: Math.max((sliderCfg.autoSlideIntervalSec ?? 5), 2) * 1000,
      autoPlayEnabled: sliderCfg.autoSlideEnabled !== false,
      showArrows: sliderCfg.showArrows !== false,
      showDots: sliderCfg.showDots !== false,
      sliderEngine: sliderCfg.sliderEngine || 'smooothy',
    };
  }, [hs?.heroSliderSettings]);

  return {
    products,
    cats,
    activeTab,
    setActiveTab,
    filteredProducts,
    tabs,
    theme,
    isModernGreen,
    isCleanWhite,
    hs,
    heroBig,
    heroSmall,
    trending,
    cols,
    deal,
    moreDeals,
    valProps,
    featSec,
    dynamicHeroSlides,
    dynamicOffers,
    sliderConfig,
    categorySections,
  };
}
