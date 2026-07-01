'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { ProductCardAuto } from '../components/product/ProductCardAuto';
import { ProductCard } from '../components/product/ProductCard';
import { IProduct } from '../types';
import { useSiteTheme } from '../components/common/DynamicThemeProvider';
import { HeroSlider } from '../components/common/HeroSlider';
import { ThemeIcon } from '../components/common/ThemeIcon';

/* ─── Hero Slides ─────────────────────────────────────────── */
const HERO_SLIDES = [
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
  },
];

/* ─── Service Items ────────────────────────────────────────── */
const SERVICES = [
  { icon: 'sync', title: 'Free Return', desc: '30-day money back guarantee', color: 'var(--pd-primary)' },
  { icon: 'shipping', title: 'Fast Shipping', desc: 'Free on all orders', color: 'var(--pd-accent)' },
  { icon: 'headset', title: 'Support 24/7', desc: 'Online help around the clock', color: '#8b5cf6' },
  { icon: 'gift', title: 'Gift Cards', desc: 'For orders above PKR 5,000', color: '#ec4899' },
  { icon: 'shield', title: 'Secure Payment', desc: 'Your data is always safe', color: 'var(--pd-success)' },
  { icon: 'star', title: 'Top Rated', desc: '4.9★ average customer rating', color: '#eab308' },
];

/* ─── Offer Banners ────────────────────────────────────────── */
const OFFERS = [
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

/* ─── Stats Counter ────────────────────────────────────────── */
const STATS = [
  { value: 15000, label: 'Happy Customers', suffix: '+', icon: 'smile' },
  { value: 500, label: 'Products Listed', suffix: '+', icon: 'box' },
  { value: 98, label: 'Satisfaction Rate', suffix: '%', icon: 'star' },
  { value: 5, label: 'Years in Business', suffix: '+', icon: 'award' },
];

/* ─── Category images mapping for Collections ──────────────── */
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

/* ─── Counter hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, label, suffix, icon, trigger }: typeof STATS[number] & { trigger: boolean }) {
  const count = useCountUp(value, 1800, trigger);
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  if (isModernGreen || isCleanWhite) {
    const iconColor = isModernGreen ? '#d4af37' : theme.primaryColor;
    const textColor = isModernGreen ? '#0d231d' : '#1e293b';
    const labelColor = isModernGreen ? '#eae7db' : '#64748b';
    return (
      <div className="col-6 col-md-3 text-center py-4">
        <div className="usp-circle mb-3">
          <ThemeIcon name={icon} className="fs-4 mb-1" style={{ color: iconColor }} />
          <span className="fw-bold" style={{ fontSize: '1.1rem', color: textColor }}>{count.toLocaleString()}{suffix}</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: labelColor, fontWeight: 600 }}>{label}</span>
      </div>
    );
  }

  return (
    <div className="col-6 col-md-3 text-center py-4">
      <ThemeIcon name={icon} className="fa-2x mb-2 d-block" style={{ color: 'var(--pd-primary)' }} />
      <span className="counter-number d-block">{count.toLocaleString()}{suffix}</span>
      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [cats, setCats] = useState<{ name: string; slug: string; parentCategory?: string; image?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'featured' | 'selling'>('all');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { theme } = useSiteTheme();
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  /* load products */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (e) {
        console.error('Error loading products:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* load categories */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.data) {
          setCats(data.data.map((c: any) => ({
            name: c.name,
            slug: c.slug,
            parentCategory: c.parentCategory,
            image: c.image
          })));
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    })();
  }, []);

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
  }, [loading]);

  /* stats counter observer */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const filtered = (() => {
    switch (activeTab) {
      case 'new': return products.filter(p => p.isNewArrival);
      case 'featured': return products.filter(p => p.isFeatured);
      case 'selling': return products.filter(p => p.isTopSelling);
      default: return products;
    }
  })();

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: 'new', label: 'New Arrivals' },
    { key: 'featured', label: 'Featured' },
    { key: 'selling', label: 'Top Selling' },
  ];

  /* ── Safely resolve homepageSections with fallbacks ── */
  const hs        = theme.homepageSections ?? ({} as typeof theme.homepageSections);
  const heroBig   = hs?.heroBig           ?? { enabled: true, badge: 'Featured Product', title: 'Smart Speakers With Google Assistant', subtitle: 'Experience room-filling sound and intelligent voice assistance.', buttonText: 'Shop Now', buttonLink: '/shop', imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80' };
  const heroSmall = hs?.heroSmall          ?? { enabled: true, badge: 'Special Discount', title: 'TWS Earbuds', highlight: '50% Off', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80' };
  const trending  = hs?.trendingProducts   ?? { enabled: true, title: 'Trending Products', limit: 4 };
  const cols      = hs?.collections        ?? { enabled: true, title: 'The Top Collections' };
  const deal      = hs?.weeklyDeal         ?? { enabled: true, label: 'The Big Deal This Week', title: 'Apple iPhone 12 Pro Max', description: 'Get the ultimate package.', buttonText: 'Shop Now', buttonLink: '/shop', imageUrl: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=500&q=80' };
  const moreDeals = hs?.moreDeals          ?? { enabled: true, title: 'More Active Deals', limit: 4 };
  const valProps  = hs?.valueProps         ?? { enabled: true };
  const featSec   = hs?.featuredSection    ?? { enabled: true, title: 'Featured Products', limit: 8 };

  /* ── Construct Dynamic Hero Slides for default layout ── */
  const dynamicHeroSlides = [];
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
  if (dynamicHeroSlides.length === 0) {
    dynamicHeroSlides.push(...HERO_SLIDES);
  }

  /* ── Construct Dynamic Offer Banners for default layout ── */
  const dynamicOffers = [];
  if (heroSmall && heroSmall.enabled !== false) {
    dynamicOffers.push({
      sub: heroSmall.badge || 'Special Discount',
      title: heroSmall.title || 'TWS Earbuds',
      disc: heroSmall.highlight || '50',
      img: heroSmall.imageUrl || '/img/product-1.png',
      link: '/shop',
      imgAlt: heroSmall.title || 'Premium Headphones',
      bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-primary) 8%, #fff) 0%, #fff 100%)',
    });
  } else {
    dynamicOffers.push(OFFERS[0]);
  }
  if (deal && deal.enabled !== false) {
    dynamicOffers.push({
      sub: deal.label || 'Big Deal',
      title: deal.title || 'Smart Wearables',
      disc: 'Special Deal',
      img: deal.imageUrl || '/img/product-2.png',
      link: deal.buttonLink || '/shop',
      imgAlt: deal.title || 'Smart Watch',
      bg: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-accent) 8%, #fff) 0%, #fff 100%)',
    });
  } else {
    dynamicOffers.push(OFFERS[1]);
  }

  if (isCleanWhite) {
    return (
      <div className="bg-[#fafafa] text-slate-800 font-sans antialiased min-h-screen flex flex-col">

        {/* ── Announcement Bar ── */}
        {theme.announcementBarEnabled && (
          <div className="announcement-bar text-slate-800 text-center py-2 px-3 overflow-hidden text-xs sm:text-sm font-semibold border-b border-slate-200">
            <span className="announcement-inner">{theme.announcementBarText}</span>
          </div>
        )}

        {/* ── Hero Grid Banners ── */}
        {(heroBig.enabled || heroSmall.enabled) && (
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className={`grid grid-cols-1 gap-6 ${heroBig.enabled && heroSmall.enabled ? 'lg:grid-cols-3' : ''}`}>

              {/* Big Hero Card */}
              {heroBig.enabled && (
                <div className={`${heroBig.enabled && heroSmall.enabled ? 'lg:col-span-2' : ''} bg-[#f3f4f6] rounded-3xl overflow-hidden relative min-h-[380px] flex items-center p-8 sm:p-12 group`}>
                  <div className="relative z-10 max-w-md">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white shadow-sm mb-4" style={{ color: theme.primaryColor }}>
                      {heroBig.badge}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                      {heroBig.title}
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base mb-8">{heroBig.subtitle}</p>
                    <Link href={heroBig.buttonLink || '/shop'} className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium text-sm transition-all hover:-translate-y-0.5 text-decoration-none"
                      style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px -5px ${theme.primaryColor}30` }}>
                      {heroBig.buttonText}
                    </Link>
                  </div>
                  <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-center p-4">
                    <OptimizedImage
                      src={heroBig.imageUrl}
                      alt={heroBig.title || 'Featured Product'}
                      width={300}
                      height={300}
                      style={{ objectFit: 'contain', maxHeight: '300px', width: 'auto', height: 'auto' }}
                      className="drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Small Hero Card */}
              {heroSmall.enabled && (
                <div className="bg-violet-50 rounded-3xl overflow-hidden relative min-h-[380px] flex flex-col justify-between p-8 sm:p-10 group">
                  <div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-violet-200/50 text-violet-700 mb-4">
                      {heroSmall.badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                      {heroSmall.title} <br /><span className="text-violet-600">{heroSmall.highlight}</span>
                    </h2>
                    <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900 mt-4 text-decoration-none">
                      Shop Now
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                  <div className="w-full flex justify-end mt-4">
                    <OptimizedImage
                      src={heroSmall.imageUrl}
                      alt={heroSmall.title || 'Special Discount'}
                      width={200}
                      height={200}
                      style={{ objectFit: 'contain', maxHeight: '200px', width: 'auto', height: 'auto' }}
                      className="drop-shadow-lg transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Trending Products ── */}
        {trending.enabled && (
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{trending.title}</h2>
              <Link href="/shop" className="text-sm font-semibold inline-flex items-center gap-1 text-decoration-none" style={{ color: theme.primaryColor }}>
                See All
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-[320px] rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, trending.limit || 4).map((prod, idx) => (
                  <ProductCard key={prod._id} product={prod} priority={idx < 4} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Top Collections ── */}
        {cols.enabled && (
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{cols.title}</h2>
              <p className="text-slate-500 text-sm mt-1">Explore our most popular category collections</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {(cats.length > 0 ? cats.filter(c => !c.parentCategory) : [
                { name: 'Smart Watches', slug: 'smartwatches' },
                { name: 'Smart Speakers', slug: 'speakers' },
                { name: 'Headphones',   slug: 'headphones' },
                { name: 'Smart Phones', slug: 'smartphones' },
                { name: 'Smart Security', slug: 'cameras' },
                { name: 'Smart TVs',    slug: 'tvs' },
                { name: 'Accessories',  slug: 'accessories' },
              ]).map((col, idx) => {
                const img = col.image || CAT_IMAGES[col.slug] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';
                return (
                  <Link key={idx} href={`/shop?category=${col.slug}`} className="flex flex-col items-center group text-decoration-none theme1-collection-item">
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
                    <span className="text-xs font-semibold text-slate-700 mt-3 transition-colors theme1-collection-text">{col.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Weekly Big Deal Banner ── */}
        {deal.enabled && (
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_40%)]" />
              <div className="relative z-10 max-w-lg mb-8 md:mb-0">
                <span className="text-blue-500 font-bold text-xs uppercase tracking-wider block mb-2">{deal.label}</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-4">{deal.title}</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-md">{deal.description}</p>
                <Link href={deal.buttonLink || '/shop'} className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all text-decoration-none"
                  style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px -5px ${theme.primaryColor}30` }}>
                  {deal.buttonText}
                </Link>
              </div>
              <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
                <OptimizedImage
                  src={deal.imageUrl}
                  alt={deal.title || 'Weekly Deal'}
                  width={260}
                  height={260}
                  style={{ objectFit: 'contain', maxHeight: '260px', width: 'auto', height: 'auto' }}
                  className="drop-shadow-[0_20px_50px_rgba(59,130,246,0.25)] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── More Active Deals ── */}
        {moreDeals.enabled && (
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{moreDeals.title}</h2>
              <p className="text-slate-500 text-sm mt-1">Super savings and daily essentials</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-[280px] rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(trending.enabled ? (trending.limit || 4) : 0, (trending.enabled ? (trending.limit || 4) : 0) + (moreDeals.limit || 4)).map(prod => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-10">
              <Link href="/shop" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-decoration-none">
                Load More
              </Link>
            </div>
          </section>
        )}

        {/* ── Featured Products ── */}
        {featSec.enabled && (
          <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--pd-primary-dark, #c2410c)' }}>Handpicked For You</p>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{featSec.title}</h2>
              </div>
              <Link href="/shop" className="text-sm font-semibold inline-flex items-center gap-1 text-decoration-none" style={{ color: 'var(--pd-primary-dark, #c2410c)' }}>
                See All
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(featSec.limit || 8)].map((_, i) => <div key={i} className="skeleton h-[320px] rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, featSec.limit || 8).map(prod => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-10">
                <Link href="/shop" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all text-decoration-none"
                  style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 20px -5px ${theme.primaryColor}30` }}>
                  Show More
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ── Value Propositions ── */}
        {valProps.enabled && (
          <section className="bg-white border-t border-slate-100 py-8">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 014.73 4.5H19.5a1.5 1.5 0 011.5 1.5v7m-9.75 4.5H18m0 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125a1.125 1.125 0 001.12-1.243l-.75-7.125M18 14.25H9m0 0v-4.5', color: 'bg-blue-50 text-blue-600', title: 'Free Delivery', desc: 'For all orders over Rs. 5,000' },
                  { icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3', color: 'bg-green-50 text-green-600', title: '30 Days Return', desc: 'Hassle-free 100% money back' },
                  { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', color: 'bg-purple-50 text-purple-600', title: 'Secure Payment', desc: '100% encrypted SSL checkout' },
                  { icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z', color: 'bg-orange-50 text-orange-600', title: '24/7 Support', desc: 'Dedicated professional support' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${i === 0 ? '' : item.color}`}
                      style={i === 0 ? { backgroundColor: `color-mix(in srgb, ${theme.primaryColor} 10%, transparent)`, color: theme.primaryColor } : {}}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    );
  }

  return (
    <div className={isModernGreen ? "" : "bg-white"}>

      {/* ── Announcement Bar ─────────────────────────────── */}
      {theme.announcementBarEnabled && (
        <div className="announcement-bar text-white text-center py-2 px-3 overflow-hidden">
          <span className="announcement-inner">
            {theme.announcementBarText}
          </span>
        </div>
      )}

      {/* ── Hero Slider ───────────────────────────────── */}
      <section aria-label="Featured Products Carousel">
        <div className="container-fluid px-0">
          <HeroSlider slides={dynamicHeroSlides} autoPlayMs={5500} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          OUR PRODUCTS — immediately after hero
          so user sees products first thing
      ══════════════════════════════════════════════ */}
      <section className={`${(isModernGreen || isCleanWhite) ? '' : 'bg-white'} py-3 py-lg-4`} aria-label="Our Products">
        <div style={{ padding: '0 8px' }}>

          {/* Section header */}
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.72rem', letterSpacing: '2px', color: isModernGreen ? '#0d231d' : (isCleanWhite ? '#2563eb' : 'var(--pd-primary-dark, #c2410c)') }}>
                  Handpicked For You
                </p>
                <h2 className="fw-bold text-dark mb-0" style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', letterSpacing: '-0.3px', color: isModernGreen ? '#0d231d !important' : (isCleanWhite ? '#1e293b !important' : 'inherit') }}>
                  Our Products
                </h2>
              </div>
              <Link href="/shop" className="d-none d-md-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
                style={{ fontSize: '0.85rem', color: isModernGreen ? '#d4af37' : (isCleanWhite ? '#2563eb' : 'var(--pd-primary)'), whiteSpace: 'nowrap' }}>
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
            {/* Tabs — horizontal scroll on mobile, wrap on desktop */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <div className="d-flex gap-2" style={{ flexWrap: 'nowrap', paddingBottom: '4px', minWidth: 'max-content' }}>
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`tab-btn rounded-pill border-0 ${activeTab === t.key ? 'active' : ((isModernGreen || isCleanWhite) ? '' : 'bg-light text-dark')}`}
                    style={{ fontSize: '0.82rem', padding: '8px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    aria-pressed={activeTab === t.key}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }} className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ height: '280px', borderRadius: '10px' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box-open fa-3x text-muted mb-3 d-block" />
              <p className="text-muted">No products in this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
              className="products-grid">
              <style>{`
                @media (min-width: 768px) { .products-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                @media (min-width: 992px) { .products-grid { grid-template-columns: repeat(4, 1fr) !important; } }
                @media (min-width: 1400px) { .products-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 14px !important; } }
              `}</style>
              {filtered.map((prod, idx) => (
                <div key={prod._id} className="animate-on-scroll">
                  <ProductCardAuto product={prod} priority={idx < 4} />
                </div>
              ))}
            </div>
          )}

          {/* View all */}
          {!loading && filtered.length > 0 && (
            <div className="text-center mt-4 py-2">
              <Link
                href="/shop"
                className="btn-gradient"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  padding: '11px 28px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                View All Products
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Services Strip ───────────────────────────────── */}
      <section className={`container-fluid px-0 ${(isModernGreen || isCleanWhite) ? 'bg-transparent' : 'bg-white'} border-top border-bottom`} style={{ borderColor: isModernGreen ? '#eae7db !important' : (isCleanWhite ? '#e2e8f0 !important' : '') }} aria-label="Our Services">
        <div className="row g-0">
          {SERVICES.map((s, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2 border-end animate-on-scroll" style={{ borderColor: isModernGreen ? '#eae7db !important' : (isCleanWhite ? '#e2e8f0 !important' : '') }}>
              <div className="service-item p-3 p-xl-4 h-100">
                <div className="d-flex align-items-center gap-3">
                  <span className="service-icon" style={{ color: isModernGreen ? '#d4af37' : (isCleanWhite ? '#2563eb' : s.color), fontSize: '1.7rem', minWidth: '30px', display: 'flex', alignItems: 'center' }} aria-hidden="true">
                    <ThemeIcon name={s.icon} />
                  </span>
                  <div>
                    <p className="text-uppercase mb-1 fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px', color: isModernGreen ? '#0d231d' : (isCleanWhite ? '#1e293b' : '#eae7db') }}>{s.title}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: 1.4 }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Offer Banners ────────────────────────────────── */}
      <section className="container-fluid py-5" style={{ background: isModernGreen ? '#eae7db' : (isCleanWhite ? '#ffffff' : 'var(--pd-light-bg)') }} aria-label="Current Offers">
        <div className="container">
          <div className="row g-4">
            {dynamicOffers.map((o, i) => (
              <div key={i} className="col-lg-6 animate-on-scroll">
                <Link
                  href={o.link}
                  className="offer-card d-flex align-items-center justify-content-between border bg-white rounded p-4 p-xl-5 text-decoration-none h-100"
                  style={{ background: isModernGreen ? 'linear-gradient(135deg, #fbfaf7 0%, #f7f5ed 100%)' : (isCleanWhite ? '#ffffff' : o.bg), borderColor: isModernGreen ? '#d4af3740' : (isCleanWhite ? '#e2e8f0' : '') }}
                  aria-label={`${o.title} — ${o.disc}`}
                >
                  <div>
                    <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>{o.sub}</p>
                    <h3 className="fw-bold mb-1" style={{ color: 'var(--pd-secondary)' }}>{o.title}</h3>
                    <p className="display-4 mb-0" style={{ color: 'var(--pd-secondary)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                      {o.disc.includes('%') || isNaN(Number(o.disc)) ? (
                        o.disc
                      ) : (
                        <>
                          {o.disc}%
                          <span className="fs-2 fw-normal" style={{ color: isModernGreen ? '#d4af37' : (isCleanWhite ? '#2563eb' : 'var(--pd-primary)') }}> Off</span>
                        </>
                      )}
                    </p>
                    <span className="d-inline-flex align-items-center mt-3 fw-semibold" style={{ color: isModernGreen ? '#d4af37' : (isCleanWhite ? '#2563eb' : 'var(--pd-primary)'), fontSize: '0.9rem' }}>
                      Shop Collection
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </span>
                  </div>
                  <div className="position-relative flex-shrink-0" style={{ width: '130px', height: '130px' }}>
                    <Image src={o.img} alt={o.imgAlt} fill sizes="130px" style={{ objectFit: 'contain' }} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Counter Strip ──────────────────────────── */}
      <section
        ref={statsRef}
        className="container-fluid py-5"
        style={{ background: isModernGreen ? '#0d231d' : (isCleanWhite ? '#ffffff' : 'linear-gradient(135deg, var(--pd-secondary) 0%, color-mix(in srgb, var(--pd-secondary) 70%, #000) 100%)'), borderBottom: isCleanWhite ? '1px solid #e2e8f0' : '' }}
        aria-label="Company Statistics"
      >
        <div className="container">
          <div className="row g-0">
            {STATS.map((s, i) => (
              <StatCounter key={i} {...s} trigger={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────── */}
      <section
        className="container-fluid py-5"
        style={{
          background: isModernGreen
            ? 'linear-gradient(135deg, #f0ede4 0%, #f7f5ed 100%)'
            : (isCleanWhite ? '#f8fafc' : 'linear-gradient(135deg, color-mix(in srgb, var(--pd-primary) 8%, #fff) 0%, #fffbf5 100%)')
        }}
        aria-label="Why Choose PAKODRIVE"
      >
        <div className="container text-center">
          <p className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.78rem', letterSpacing: '2px', color: isModernGreen ? '#0d231d' : (isCleanWhite ? theme.primaryColor : '') }}>Why Us?</p>
          <h2 className="section-title fw-bold text-dark mb-5 d-inline-block" style={{ color: isModernGreen ? '#0d231d !important' : (isCleanWhite ? '#1e293b !important' : '') }}>Why Choose PAKODRIVE</h2>
          <div className="row g-4 mt-2">
            {[
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={(isModernGreen || isCleanWhite) ? (isModernGreen ? "#0d231d" : theme.primaryColor) : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>,
                title: 'Genuine Products', desc: '100% authentic with warranty on all devices.',
              },
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={(isModernGreen || isCleanWhite) ? (isModernGreen ? "#0d231d" : theme.primaryColor) : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
                title: 'Nationwide Delivery', desc: 'Delivering across all major cities in Pakistan.',
              },
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={(isModernGreen || isCleanWhite) ? (isModernGreen ? "#0d231d" : theme.primaryColor) : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" /></svg>,
                title: 'Easy Returns', desc: 'No questions asked 30-day return policy.',
              },
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={(isModernGreen || isCleanWhite) ? (isModernGreen ? "#0d231d" : "#2563eb") : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
                title: 'Secure Shopping', desc: 'SSL encrypted checkout and safe payments.',
              },
            ].map((item, i) => (
              <div key={i} className="col-md-6 col-lg-3 animate-on-scroll">
                <div
                  className={`${isModernGreen ? 'why-us-card' : (isCleanWhite ? 'why-us-card shadow-sm' : 'glass-card')} p-4 h-100 text-center`}
                  style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = isModernGreen
                      ? '0 16px 40px rgba(13, 35, 29, 0.3)'
                      : (isCleanWhite ? '0 16px 40px rgba(37, 99, 235, 0.1)' : '0 16px 40px rgba(var(--pd-primary-rgb, 249,115,22),0.15)');
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  <div
                    className={`mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle ${(isModernGreen || isCleanWhite) ? 'why-us-icon-container' : ''}`}
                    style={{ width: '60px', height: '60px', background: (isModernGreen || isCleanWhite) ? '' : 'linear-gradient(135deg, var(--pd-primary), var(--pd-primary-dark, #c2410c))' }}
                  >
                    {item.svg}
                  </div>
                  <p className="fw-bold mb-2" style={{ fontSize: '0.95rem', color: isModernGreen ? '#0d231d' : '' }}>{item.title}</p>
                  <p className={(isModernGreen || isCleanWhite) ? (isModernGreen ? "mb-0 text-white-50" : "mb-0 text-muted") : "text-muted mb-0"} style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products Section ────────────────────── */}
      {featSec.enabled && (
        <section
          className="container-fluid py-5"
          style={{ background: isModernGreen ? '#f0ede4' : '#fff' }}
          aria-label="Featured Products"
        >
          <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <p className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.72rem', letterSpacing: '2px', color: isModernGreen ? '#0d231d' : 'var(--pd-primary-dark, #c2410c)' }}>
                  Handpicked For You
                </p>
                <h2 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', color: isModernGreen ? '#0d231d' : 'inherit' }}>
                  {featSec.title}
                </h2>
              </div>
              <Link
                href="/shop"
                className="d-none d-md-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
                style={{ fontSize: '0.85rem', color: isModernGreen ? '#d4af37' : 'var(--pd-primary)', whiteSpace: 'nowrap' }}
              >
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="feat-products-grid">
                {[...Array(featSec.limit || 8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '10px' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-box-open fa-3x text-muted mb-3 d-block" />
                <p className="text-muted">No products found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="feat-products-grid">
                <style>{`
                  @media (min-width: 768px) { .feat-products-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                  @media (min-width: 992px) { .feat-products-grid { grid-template-columns: repeat(4, 1fr) !important; } }
                  @media (min-width: 1400px) { .feat-products-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 14px !important; } }
                `}</style>
                {products.slice(0, featSec.limit || 8).map(prod => (
                  <div key={prod._id} className="animate-on-scroll">
                    <ProductCardAuto product={prod} />
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="text-center mt-4">
                <Link
                  href="/shop"
                  className="btn-gradient"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    textDecoration: 'none', padding: '11px 32px',
                    borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem',
                  }}
                >
                  Show More
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
