'use client';

import React from 'react';
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
} from 'lucide-react';

export const BlogFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs select-none">
      {/* Editorial Mission & Shop Banner */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Pak-o-Drive Auto Journal & Knowledge Hub
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Actionable Car Care & Driving Wisdom for Pakistan
            </h3>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm leading-relaxed">
              From surviving 45°C summer heat in Punjab and Sindh to navigating winter smog on the M-2 Motorway, our guides are tested and written by automotive specialists specifically for Pakistani conditions.
            </p>
          </div>

          {/* Shop Card CTA */}
          <div className="w-full md:w-auto shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4">
            <div>
              <p className="text-white font-bold text-sm m-0">Need Genuine Auto Accessories?</p>
              <p className="text-[11px] text-slate-400 m-0 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cash on Delivery across 90+ Pakistani cities</span>
              </p>
            </div>
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all text-decoration-none"
            >
              <span>Visit Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Link Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand / Publication */}
          <div>
            <Link href="/auto" className="inline-block mb-4 text-decoration-none">
              <div className="flex items-center gap-2">
                <PakODriveLogo height={32} />
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500 text-slate-950 rounded font-mono">
                  JOURNAL
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Pak-o-Drive Auto Journal is Pakistan&apos;s authoritative automotive editorial hub, covering DIY maintenance, seasonal vehicle care, smog protocols, and honest car gadget reviews.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dedicated Pakistani Automotive Knowledge</span>
            </div>
          </div>

          {/* Column 2: Guide Categories */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2.5">
              Editorial Categories
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <Link href="/auto" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  All Auto Guides & Tutorials
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Seasonal+Car+Care" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Seasonal Car Care (Summer AC & Fog)
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Car+Maintenance" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  DIY Maintenance & Fluid Checks
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Fuel+Economy+%26+Tuning" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Fuel Economy & Mileage Tuning
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Smart+Car+Gadgets" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Smart Car Gadgets & Accessories
                </Link>
              </li>
              <li>
                <Link href="/auto?category=Driving+Safety+%26+Rules" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Driving Safety & Motorway Protocols
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Guides */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2.5">
              Featured Guides
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <Link
                  href="/auto/top-5-ways-to-keep-car-cabin-chilled-pakistan-summer-heat"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none line-clamp-2"
                >
                  Top 5 Ways to Keep Cabin Chilled in 45°C Heat
                </Link>
              </li>
              <li>
                <Link
                  href="/auto"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none line-clamp-2"
                >
                  Suzuki Mehran & Alto Fuel Mileage Optimization Tips
                </Link>
              </li>
              <li>
                <Link
                  href="/auto"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none line-clamp-2"
                >
                  Motorway M-2 Fog & Smog Driving Protocols
                </Link>
              </li>
              <li>
                <Link
                  href="/auto"
                  className="text-slate-400 hover:text-orange-400 transition-colors text-decoration-none line-clamp-2"
                >
                  How to Protect Car Paint from Extreme Sun & UV Rays
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Main Store & Policies */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2.5">
              Official Store
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              <li>
                <Link href="/shop" className="text-slate-400 hover:text-white transition-colors text-decoration-none flex items-center gap-1.5">
                  <span>Browse All Auto Accessories</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Track Your Parcel Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Nationwide Cash on Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  7-Day Checking Warranty & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-decoration-none">
                  Contact Editorial / Customer Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Legal & Copyright Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="m-0 text-center sm:text-left">
            © {currentYear} Pak-o-Drive Auto Journal. All rights reserved. • Written by automotive enthusiasts for Pakistani motorists.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <Link href="/privacy-policy" className="hover:text-white text-decoration-none transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white text-decoration-none transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white text-decoration-none transition-colors">
              About Pak-o-Drive
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white text-decoration-none transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
