'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PakODriveLogo } from '@/components/common/PakODriveLogo';
import {
  Send,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Truck,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from '@/components/blog/SocialIcons';

interface FooterProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  images?: string[];
}

export const BlogFooter: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [products, setProducts] = useState<FooterProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanPhone = rawPhone.replace(/\D/g, '') || '923185205667';

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const res = await fetch('/api/products?limit=4');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.products && Array.isArray(data.products)) {
          setProducts(data.products.slice(0, 4));
        }
      } catch {
        // Fallback silently if offline
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !privacyAccepted) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="w-full bg-white text-slate-700 border-t border-slate-200 select-none">
      {/* ── 1. Subscribe Our Newsletter Box (Matching User's Reference) ── */}
      <div className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-[#fafafa]">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mb-2">
            Subscribe Our Newsletter
          </h3>
          <div className="w-12 h-0.5 bg-rose-500 mx-auto mb-6" />

          {subscribed ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold m-0">Thank you for subscribing to Pak-o-Drive Journal!</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3 max-w-md mx-auto">
              <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 focus-within:border-rose-500 transition-colors shadow-xs">
                <input
                  type="email"
                  required
                  placeholder="Enter Your Email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 border-none outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Submit
                </button>
              </div>

              <label className="flex items-center justify-center gap-2 text-[11px] text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-400 w-3.5 h-3.5"
                />
                <span>I&apos;ve read and accept the <Link href="/privacy-policy" className="text-rose-500 hover:underline">Privacy Policy</Link></span>
              </label>
            </form>
          )}
        </div>
      </div>

      {/* ── 2. Pak-o-Drive Official Store & Products Section ──── */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Masthead */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
                <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                <span>Pak-o-Drive Official Store</span>
              </div>
              <h4 className="text-xl sm:text-2xl lg:text-3xl font-serif font-extrabold !text-slate-900 tracking-tight leading-snug" style={{ color: '#0f172a' }}>
                Featured Automotive Accessories & Viral Gadgets
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Cash On Delivery Nationwide
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <Truck className="w-4 h-4 text-slate-400" /> 7-Day Checking Warranty
                </span>
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 text-xs font-bold transition-all text-decoration-none group self-start sm:self-auto shadow-xs"
              style={{ color: undefined }}
            >
              <span>Explore All Auto Parts</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((prod) => {
                const prodImage =
                  prod.image ||
                  (prod.images && prod.images[0]) ||
                  '/img/placeholder-product.png';

                return (
                  <div
                    key={prod._id}
                    className="group border border-slate-200/90 hover:border-rose-300 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white relative"
                  >
                    <div>
                      {/* Dual-Layer Uncropped Media Presentation (Rule 3) */}
                      <Link
                        href={`/product/${prod.slug || prod._id}`}
                        className="relative block aspect-square w-full rounded-xl overflow-hidden bg-slate-100/70 mb-3.5 group-hover:shadow-inner"
                      >
                        {/* Layer 1: Ambient Blur Backdrop */}
                        <Image
                          src={prodImage}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover blur-2xl opacity-35 scale-125 pointer-events-none"
                        />
                        {/* Layer 2: 100% Unclipped Product Media */}
                        <Image
                          src={prodImage}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-3 relative z-10 group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                            COD
                          </span>
                        </div>
                      </Link>

                      {/* Product Title (Rule 4: Typography Clipping Prevention & Forced High Contrast) */}
                      <h5 className="font-bold text-sm leading-normal py-0.5 line-clamp-2">
                        <Link
                          href={`/product/${prod.slug || prod._id}`}
                          className="!text-slate-900 group-hover:!text-rose-600 transition-colors text-decoration-none block"
                          style={{ color: '#0f172a' }}
                        >
                          {prod.name}
                        </Link>
                      </h5>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                          Cash On Delivery
                        </span>
                        <span className="text-base font-extrabold text-rose-600 tracking-tight">
                          Rs. {Number(prod.price || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* WhatsApp 1-Click Order (Rule 2) */}
                        <a
                          href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                            `Salam Pak-o-Drive, I would like to order "${prod.name}" (Rs. ${Number(prod.price || 0).toLocaleString()}) via Cash On Delivery. Please confirm my order.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all text-decoration-none"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Order COD Button */}
                        <Link
                          href={`/product/${prod.slug || prod._id}`}
                          className="inline-flex items-center justify-center py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all text-decoration-none"
                        >
                          Order COD
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Static Fallback Showcase
              [
                { title: 'Solar Dual Ring Rotating Fragrance', price: 1899, href: '/shop' },
                { title: 'Ultra-Power 120W Portable Car Vacuum', price: 2999, href: '/shop' },
                { title: 'Anti-Glare High-Definition Rear Mirror', price: 899, href: '/shop' },
                { title: 'Ceramic Nano UV Windshield Tint Film', price: 2499, href: '/shop' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-rose-300 hover:shadow-lg transition-all bg-white"
                >
                  <div className="aspect-square w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                  </div>
                  <h5 className="font-bold text-sm leading-normal py-0.5 line-clamp-2">
                    <Link href={item.href} className="!text-slate-900 hover:!text-rose-600 text-decoration-none block" style={{ color: '#0f172a' }}>
                      {item.title}
                    </Link>
                  </h5>
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-rose-600">Rs. {item.price.toLocaleString()}</span>
                    <Link
                      href={item.href}
                      className="text-xs font-bold text-slate-800 hover:text-rose-600 py-1 px-3 rounded-lg bg-slate-100 hover:bg-rose-50 text-decoration-none transition-colors"
                      style={{ color: '#0f172a' }}
                    >
                      View ↗
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Bottom Minimal Magazine Footer (Matching Reference) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          {/* Social Icons on Left */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500 transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500 transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500 transition-colors"
              aria-label="Twitter"
            >
              <TwitterIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
              aria-label="WhatsApp Support"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/" className="hover:text-rose-500 text-decoration-none">Home</Link>
            <Link href="/auto" className="hover:text-rose-500 text-decoration-none">Auto Guides</Link>
            <Link href="/blog" className="hover:text-rose-500 text-decoration-none">Tech & AI</Link>
            <Link href="/shop" className="hover:text-rose-500 text-decoration-none">Store</Link>
            <Link href="/privacy-policy" className="hover:text-rose-500 text-decoration-none">Privacy</Link>
            <Link href="/terms" className="hover:text-rose-500 text-decoration-none">Terms</Link>
          </div>

          {/* Copyright on Right */}
          <p className="text-[11px] text-slate-400 m-0">
            © {new Date().getFullYear()} Pak-o-Drive Journal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
