'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  },
];

/* ─── Service Items ────────────────────────────────────────── */
const SERVICES = [
  { icon: 'sync',             title: 'Free Return',    desc: '30-day money back guarantee', color: 'var(--pd-primary)' },
  { icon: 'shipping',         title: 'Fast Shipping',  desc: 'Free on all orders',          color: 'var(--pd-accent)' },
  { icon: 'headset',          title: 'Support 24/7',   desc: 'Online help around the clock',color: '#8b5cf6' },
  { icon: 'gift',             title: 'Gift Cards',     desc: 'For orders above PKR 5,000',  color: '#ec4899' },
  { icon: 'shield',           title: 'Secure Payment', desc: 'Your data is always safe',    color: 'var(--pd-success)' },
  { icon: 'star',             title: 'Top Rated',      desc: '4.9★ average customer rating',color: '#eab308' },
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
  { value: 500,   label: 'Products Listed', suffix: '+', icon: 'box' },
  { value: 98,    label: 'Satisfaction Rate',suffix: '%', icon: 'star'  },
  { value: 5,     label: 'Years in Business',suffix: '+', icon: 'award' },
];

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'featured' | 'selling'>('all');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const { theme } = useSiteTheme();

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
      case 'new':      return products.filter(p => p.isNewArrival);
      case 'featured': return products.filter(p => p.isFeatured);
      case 'selling':  return products.filter(p => p.isTopSelling);
      default:         return products;
    }
  })();

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all',      label: 'All Products' },
    { key: 'new',      label: 'New Arrivals' },
    { key: 'featured', label: 'Featured'     },
    { key: 'selling',  label: 'Top Selling'  },
  ];

  return (
    <div className="bg-white">

      {/* ── Announcement Bar ─────────────────────────────── */}
      {theme.announcementBarEnabled && (
        <div className="announcement-bar text-white text-center py-2 px-3">
          {theme.announcementBarText}
        </div>
      )}

      {/* ── Hero Slider ───────────────────────────────── */}
      <section aria-label="Featured Products Carousel">
        <div className="container-fluid carousel bg-light px-0">
          <div className="row g-0 justify-content-end">

            {/* Main Slider */}
            <div className="col-12 col-lg-7 col-xl-9">
              <HeroSlider slides={HERO_SLIDES} autoPlayMs={5500} />
            </div>

            {/* Right Promo Banner */}
            <div className="col-12 col-lg-5 col-xl-3">
              <div className="carousel-header-banner h-100 position-relative" style={{ minHeight: '460px' }}>
                <Image
                  src="/img/header-img.jpg"
                  alt="Apple iPad Mini G2356 — Special Offer PKR 105,000"
                  width={400}
                  height={460}
                  className="img-fluid w-100 h-100"
                  style={{ objectFit: 'cover', minHeight: '460px' }}
                  priority
                />
                <div className="carousel-banner-offer">
                  <p className="bg-primary text-white rounded fs-6 py-2 px-3 mb-0 me-2" style={{ fontSize: '0.82rem' }}>
                    Save PKR 4,800
                  </p>
                  <p className="text-primary fs-5 fw-bold mb-0">Special Offer</p>
                </div>
                <div className="carousel-banner">
                  <div className="carousel-banner-content text-center p-3">
                    <span className="d-block mb-1 text-primary fw-bold" style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px' }}>
                      Smartphone
                    </span>
                    <span className="d-block text-white fw-bold mb-2" style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>
                      Apple iPad Mini <br /> G2356
                    </span>
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                      <del className="text-white-50" style={{ fontSize: '0.95rem' }}>PKR 125,000</del>
                      <span className="text-primary fw-bold fs-5">PKR 105,000</span>
                    </div>
                  </div>
                  <Link href="/shop" className="btn btn-gradient rounded-pill py-2 px-4 border-0 mt-2">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Services Strip ───────────────────────────────── */}
      <section className="container-fluid px-0 bg-white py-2" aria-label="Our Services">
        <div className="row g-0">
          {SERVICES.map((s, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2 border-end animate-on-scroll">
              <div className="service-item p-3 p-xl-4 h-100">
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="service-icon"
                    style={{ color: s.color, fontSize: '1.7rem', minWidth: '30px', display: 'flex', alignItems: 'center' }}
                    aria-hidden="true"
                  >
                    <ThemeIcon name={s.icon} />
                  </span>
                  <div>
                    <h6 className="text-uppercase mb-1 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{s.title}</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.72rem', lineHeight: 1.4 }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Counter Strip ──────────────────────────── */}
      <section
        ref={statsRef}
        className="container-fluid py-5"
        style={{ background: 'linear-gradient(135deg, var(--pd-secondary) 0%, color-mix(in srgb, var(--pd-secondary) 70%, #000) 100%)' }}
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

      {/* ── Offer Banners ────────────────────────────────── */}
      <section className="container-fluid py-5" style={{ background: 'var(--pd-light-bg)' }} aria-label="Current Offers">
        <div className="container">
          <div className="row g-4">
            {OFFERS.map((o, i) => (
              <div key={i} className="col-lg-6 animate-on-scroll">
                <Link
                  href={o.link}
                  className="offer-card d-flex align-items-center justify-content-between border bg-white rounded p-4 p-xl-5 text-decoration-none h-100"
                  style={{ background: o.bg }}
                  aria-label={`${o.title} — ${o.disc}% Off`}
                >
                  <div>
                    <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>{o.sub}</p>
                    <h3 className="fw-bold mb-1" style={{ color: 'var(--pd-secondary)' }}>{o.title}</h3>
                    <p className="display-4 mb-0" style={{ color: 'var(--pd-secondary)', fontWeight: 900 }}>
                      {o.disc}%
                      <span className="fs-2 fw-normal" style={{ color: 'var(--pd-primary)' }}> Off</span>
                    </p>
                    <span className="d-inline-flex align-items-center mt-3 fw-semibold" style={{ color: 'var(--pd-primary)', fontSize: '0.9rem' }}>
                      Shop Collection
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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

      {/* ── Our Products ─────────────────────────────────── */}
      <section className="container-fluid product py-5 bg-white" aria-label="Our Products">
        <div className="container py-4">
          <div className="tab-class">

            {/* Header */}
            <div className="row g-4 align-items-center mb-4">
              <div className="col-lg-5 text-start">
                <p className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem', letterSpacing: '2px' }}>
                  Handpicked For You
                </p>
                <h2 className="section-title fw-bold text-dark mb-0">Our Products</h2>
              </div>
              <div className="col-lg-7 d-flex justify-content-lg-end flex-wrap gap-2">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    id={`tab-${t.key}`}
                    onClick={() => setActiveTab(t.key)}
                    className={`tab-btn rounded-pill border-0 py-2 px-4 ${activeTab === t.key ? 'active' : 'bg-light text-dark'}`}
                    aria-pressed={activeTab === t.key}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="tab-content">
              {loading ? (
                <div className="row g-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="col-md-6 col-lg-4 col-xl-3">
                      <div className="skeleton product-skeleton" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 d-block mx-auto"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <p className="text-muted">No products available in this section.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {filtered.map((prod) => (
                    <div key={prod._id} className="col-md-6 col-lg-4 col-xl-3 animate-on-scroll">
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View All CTA */}
            {!loading && filtered.length > 0 && (
              <div className="text-center mt-5">
                <Link href="/shop" className="btn btn-gradient rounded-pill py-3 px-5" aria-label="View all products">
                  View All Products
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────── */}
      <section
        className="container-fluid py-5"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--pd-primary) 8%, #fff) 0%, #fffbf5 100%)' }}
        aria-label="Why Choose PAKODRIVE"
      >
        <div className="container text-center">
          <p className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.78rem', letterSpacing: '2px' }}>Why Us?</p>
          <h2 className="section-title fw-bold text-dark mb-5 d-inline-block">Why Choose PAKODRIVE</h2>
          <div className="row g-4 mt-2">
            {[
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
                title: 'Genuine Products',    desc: '100% authentic with warranty on all devices.',
              },
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
                title: 'Nationwide Delivery', desc: 'Delivering across all major cities in Pakistan.',
              },
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
                title: 'Easy Returns',        desc: 'No questions asked 30-day return policy.',
              },
              {
                svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: 'Secure Shopping',     desc: 'SSL encrypted checkout and safe payments.',
              },
            ].map((item, i) => (
              <div key={i} className="col-md-6 col-lg-3 animate-on-scroll">
                <div
                  className="glass-card p-4 h-100 text-center"
                  style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(var(--pd-primary-rgb, 249,115,22),0.15)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--pd-primary), var(--pd-primary-dark, #c2410c))' }}
                  >
                    {item.svg}
                  </div>
                  <h5 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>{item.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
