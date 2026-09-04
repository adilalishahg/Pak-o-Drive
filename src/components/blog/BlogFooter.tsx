'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PakODriveLogo } from '@/components/common/PakODriveLogo';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
  Mail,
  Flame,
  Send,
  Wrench,
  ThermometerSnowflake,
  Fuel,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

export const BlogFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#070b14] text-slate-400 border-t border-slate-800/90 text-xs select-none">
      {/* ── Top Newsletter / Community Hero Box ─────────────────── */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-transparent py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>The Motorist Weekly Dispatch</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Join 15,000+ Pakistani Drivers Getting Expert Car Care Advice
              </h3>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm leading-relaxed">
                Receive weekly DIY summer AC hacks, motorway fog alerts, Alto/Mehran mileage tips, and exclusive Cash on Delivery deals for verified car gadgets.
              </p>
            </div>

            {/* Subscription Form */}
            <div className="w-full lg:w-auto shrink-0 min-w-[300px] sm:min-w-[380px]">
              {subscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-xs m-0">Thank you for subscribing!</p>
                    <p className="text-[11px] text-emerald-400/80 m-0 mt-0.5">
                      You will receive the next edition of our Pakistani Car Care digest.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-orange-500 transition-colors shadow-inner">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 border-none outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <span>Subscribe</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center lg:text-left">
                    No spam ever. Unsubscribe anytime with 1-click.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 4-Column Directory ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand / Masthead */}
          <div className="space-y-4">
            <Link href="/auto" className="inline-block text-decoration-none">
              <div className="flex items-center gap-2">
                <PakODriveLogo height={32} />
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-orange-600 text-white rounded font-mono shadow-xs">
                  JOURNAL
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pak-o-Drive Auto Journal is Pakistan&apos;s authoritative automotive editorial hub, providing tested DIY maintenance guides, summer heatwave survival hacks, smog safety protocols, and honest car gadget reviews.
            </p>
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Tested for Pakistani Roads</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Written by Automotive Technicians</span>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>Editorial Categories</span>
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <Link href="/auto" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-2">
                  <span className="text-slate-600">›</span>
                  <span>All Auto Guides & Tutorials</span>
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Seasonal+Car+Care" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-2">
                  <span className="text-slate-600">›</span>
                  <span>Seasonal Car Care (Summer AC & Fog)</span>
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Car+Maintenance" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-2">
                  <span className="text-slate-600">›</span>
                  <span>DIY Maintenance & Oil Selection</span>
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Fuel+Economy+%26+Tuning" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-2">
                  <span className="text-slate-600">›</span>
                  <span>Fuel Economy & Mileage Tuning</span>
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Smart+Car+Gadgets" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-2">
                  <span className="text-slate-600">›</span>
                  <span>Smart Car Gadgets & Accessories</span>
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Driving+Safety+%26+Rules" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-2">
                  <span className="text-slate-600">›</span>
                  <span>Driving Safety & Motorway Protocols</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured & Hot Guides */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Trending in Pakistan</span>
            </h4>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <Link
                  href="/auto/top-5-ways-to-keep-car-cabin-chilled-pakistan-summer-heat"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none block"
                >
                  <span className="text-white font-semibold block line-clamp-1 hover:text-orange-400">
                    Top 5 Ways to Keep Cabin Chilled in 45°C Heat
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Seasonal Car Care • 4 min read</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/auto"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none block"
                >
                  <span className="text-white font-semibold block line-clamp-1 hover:text-orange-400">
                    Suzuki Mehran & Alto Mileage Optimization Tips
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Fuel Economy • 5 min read</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/auto"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none block"
                >
                  <span className="text-white font-semibold block line-clamp-1 hover:text-orange-400">
                    M-2 Motorway Smog & Dense Fog Safety Protocols
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Driving Safety • 6 min read</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/auto"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none block"
                >
                  <span className="text-white font-semibold block line-clamp-1 hover:text-orange-400">
                    Ceramic Tint Film vs Regular Tint: What Works?
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Car Accessories • 4 min read</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official E-Commerce Store */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <span>Official Accessories Store</span>
            </h4>
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 mb-4">
              <p className="text-white font-bold text-xs m-0">Need Genuine Car Accessories?</p>
              <p className="text-[11px] text-slate-400 m-0 mt-1">
                Order LED headlights, solar perfumes, high-power vacuums & ambient lighting with 100% Cash On Delivery.
              </p>
              <Link
                href="/shop"
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all text-decoration-none"
              >
                <span>Visit Store Catalog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ul className="space-y-2 list-none p-0 m-0 text-[11px]">
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-1.5">
                  <span className="text-slate-600">›</span>
                  <span>Track Your Order</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-1.5">
                  <span className="text-slate-600">›</span>
                  <span>Nationwide Cash on Delivery Info</span>
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-1.5">
                  <span className="text-slate-600">›</span>
                  <span>7-Day Checking Warranty & Returns</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-1.5">
                  <span className="text-slate-600">›</span>
                  <span>Contact Editorial Team</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Trust Highlights Bar ───────────────────────────────── */}
      <div className="border-t border-b border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tested on Pakistani Roads</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-semibold">
            <ThermometerSnowflake className="w-4 h-4 text-sky-400 shrink-0" />
            <span>45°C Heatwave Proven Advice</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>100% Free Knowledge Base</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-semibold">
            <Truck className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Cash On Delivery Store</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Legal Row ───────────────────────────────────── */}
      <div className="bg-black py-6 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="m-0 text-center sm:text-left">
            © {currentYear} Pak-o-Drive Auto Journal. All rights reserved. • Written by automotive enthusiasts for Pakistani motorists.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
            <Link href="/privacy-policy" className="hover:text-slate-300 text-decoration-none transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 text-decoration-none transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-slate-300 text-decoration-none transition-colors">
              About Pak-o-Drive
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300 text-decoration-none transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
