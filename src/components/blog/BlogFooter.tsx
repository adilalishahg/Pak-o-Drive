'use client';

import React from 'react';
import Link from 'next/link';
import { PakODriveLogo } from '@/components/common/PakODriveLogo';
import { useSiteInfo } from '@/components/common/SiteInfoProvider';
import {
  Truck,
  ShieldCheck,
  MessageCircle,
  Clock,
  ExternalLink,
  ShoppingBag,
  BookOpen,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from '@/components/blog/SocialIcons';

export const BlogFooter: React.FC = () => {
  const { info } = useSiteInfo();

  // Robust validator: strictly render only connected social accounts with real profiles/handles
  const isConnectedSocial = (url?: string | null): boolean => {
    if (!url) return false;
    const trimmed = url.trim();
    if (
      !trimmed ||
      trimmed === '#' ||
      trimmed === '/' ||
      trimmed.startsWith('javascript:') ||
      trimmed.includes('example.com')
    ) {
      return false;
    }
    const cleaned = trimmed.replace(/\/+$/, '').toLowerCase();
    const bareDomains = [
      'https://facebook.com',
      'http://facebook.com',
      'https://www.facebook.com',
      'http://www.facebook.com',
      'https://instagram.com',
      'http://instagram.com',
      'https://www.instagram.com',
      'http://www.instagram.com',
      'https://twitter.com',
      'http://twitter.com',
      'https://www.twitter.com',
      'http://www.twitter.com',
      'https://x.com',
      'http://x.com',
      'https://youtube.com',
      'http://youtube.com',
      'https://www.youtube.com',
      'http://www.youtube.com',
      'https://tiktok.com',
      'http://tiktok.com',
      'https://www.tiktok.com',
    ];
    return !bareDomains.includes(cleaned);
  };

  // WhatsApp is connected ONLY if configured in Site Info with valid digits
  const rawWhatsapp = info?.whatsapp?.trim();
  const cleanDigits = rawWhatsapp ? rawWhatsapp.replace(/\D/g, '') : '';
  const hasValidWhatsapp = cleanDigits.length >= 10 && rawWhatsapp !== '#';
  const formattedWhatsapp = hasValidWhatsapp
    ? cleanDigits.startsWith('92')
      ? cleanDigits
      : `92${cleanDigits.replace(/^0/, '')}`
    : null;

  // Dynamic Social Links: strictly render only connected accounts
  const socialItems = [
    {
      id: 'facebook',
      label: 'Facebook',
      href: info?.facebook,
      icon: <FacebookIcon className="w-3.5 h-3.5" />,
      hoverClass: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: info?.instagram,
      icon: <InstagramIcon className="w-3.5 h-3.5" />,
      hoverClass: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:to-rose-600 hover:border-rose-500 hover:text-white',
    },
    {
      id: 'twitter',
      label: 'Twitter',
      href: info?.twitter,
      icon: <TwitterIcon className="w-3.5 h-3.5" />,
      hoverClass: 'hover:bg-slate-700 hover:border-slate-600 hover:text-white',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      href: info?.youtube,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.44a2.78 2.78 0 0 0 1.95-1.98A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      href: (info as any)?.tiktok,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.127V9.41a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3.15 15.7 6.34 6.34 0 0 0 9.49 22a6.34 6.34 0 0 0 6.34-6.33V9.22a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.65z" />
        </svg>
      ),
      hoverClass: 'hover:bg-slate-800 hover:border-slate-700 hover:text-white',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: formattedWhatsapp ? `https://wa.me/${formattedWhatsapp}` : '',
      icon: <MessageCircle className="w-3.5 h-3.5" />,
      hoverClass: 'hover:bg-[#25D366] hover:border-[#25D366] hover:text-slate-950 text-[#25D366]',
    },
  ].filter((item) => {
    if (item.id === 'whatsapp') return Boolean(formattedWhatsapp);
    return isConnectedSocial(item.href);
  });

  return (
    <footer className="w-full bg-[#0a0f1d] text-slate-300 border-t border-slate-800/80 relative z-20 select-none overflow-hidden">
      {/* ── 1. Top Pakistani E-Commerce Reassurance Strip ─────── */}
      <div className="border-b border-slate-800/70 bg-[#070b16]/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Trust Item 1 */}
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h6 className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Cash on Delivery</h6>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug truncate">250+ Pak Cities</p>
              </div>
            </div>

            {/* Trust Item 2 */}
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h6 className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">24-48h Dispatch</h6>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug truncate">TCS &amp; Trax Tracking</p>
              </div>
            </div>

            {/* Trust Item 3 */}
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h6 className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">7-Day Warranty</h6>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug truncate">Easy Replacement</p>
              </div>
            </div>

            {/* Trust Item 4 */}
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-[#25D366]/30 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h6 className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">WhatsApp Fitment</h6>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug truncate">Vehicle Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Brand & 3-Column Navigation Grid (Symmetrical & Clean) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          {/* Brand & Direct Assistance (Col 4 on desktop, compact on mobile) */}
          <div className="lg:col-span-4 space-y-3">
            <Link href="/" className="inline-block text-decoration-none">
              <PakODriveLogo height={28} />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan&apos;s leading automotive publication &amp; curated accessories marketplace. Real-world vehicle teardowns and COD electronics nationwide.
            </p>

            {formattedWhatsapp && (
              <div className="pt-0.5">
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=Salam%20Pak-o-Drive,%20I%20have%20an%20inquiry%20regarding%20products%20and%20guides.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-bold transition-all text-decoration-none group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <span>Live Helpline: {rawWhatsapp}</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            )}
          </div>

          {/* Symmetrical 3-Column Navigation Grid (Clean vertical stacks, zero awkward wrapping) */}
          <div className="lg:col-span-8 grid grid-cols-3 gap-3 sm:gap-6 pt-1 sm:pt-0">
            {/* Column 1: Auto Guides */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Auto Guides</span>
              </div>
              <ul className="space-y-2 text-[11px] sm:text-xs text-slate-400 list-none p-0 m-0">
                <li>
                  <Link href="/auto" className="hover:text-rose-400 transition-colors text-decoration-none block truncate">
                    Research Desk
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-rose-400 transition-colors text-decoration-none block truncate">
                    Tech &amp; AI
                  </Link>
                </li>
                <li>
                  <Link href="/auto?tag=Motorway%20Fog" className="hover:text-rose-400 transition-colors text-decoration-none block truncate">
                    M2 Fog Safety
                  </Link>
                </li>
                <li>
                  <Link href="/auto?tag=Engine%20Oils" className="hover:text-rose-400 transition-colors text-decoration-none block truncate">
                    Engine Oils
                  </Link>
                </li>
                <li>
                  <Link href="/auto?tag=AC%20Cooling" className="hover:text-rose-400 transition-colors text-decoration-none block truncate">
                    AC Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Official Store */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Store Catalog</span>
              </div>
              <ul className="space-y-2 text-[11px] sm:text-xs text-slate-400 list-none p-0 m-0">
                <li>
                  <Link href="/shop" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Browse Store
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=led-lights" className="hover:text-white transition-colors text-decoration-none block truncate">
                    LED Headlights
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=interior-accessories" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Solar Perfumes
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=car-care" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Car Vacuums
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className="hover:text-emerald-400 text-emerald-400/90 font-medium transition-colors text-decoration-none block truncate">
                    Track Order ↗
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Help & Legal */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Help &amp; Legal</span>
              </div>
              <ul className="space-y-2 text-[11px] sm:text-xs text-slate-400 list-none p-0 m-0">
                <li>
                  <Link href="/shipping-policy" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Shipping Rates
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="hover:text-white transition-colors text-decoration-none block truncate">
                    7-Day Return
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors text-decoration-none block truncate">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Legal, Logo & Strictly Connected Social Bar ── */}
      <div className="border-t border-slate-800/80 bg-[#060913] py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500">
            {/* Logo + Copyright & Location */}
            <div className="flex items-center gap-2.5 text-center sm:text-left flex-wrap justify-center sm:justify-start">
              <Link href="/" className="inline-flex items-center text-decoration-none">
                <PakODriveLogo height={20} />
              </Link>
              <span className="text-slate-700 hidden sm:inline">&bull;</span>
              <span>&copy; {new Date().getFullYear()} Pak-o-Drive&trade;. All rights reserved.</span>
              <span className="text-slate-700">&bull;</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                Pakistan <span className="text-[10px] text-emerald-400 font-bold">PK</span>
              </span>
            </div>

            {/* Connected Socials Only (Renders strictly if URL is connected and valid) */}
            {socialItems.length > 0 && (
              <div className="flex items-center gap-2">
                {socialItems.map((s) => (
                  <a
                    key={s.id}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center transition-all shadow-xs ${s.hoverClass}`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
