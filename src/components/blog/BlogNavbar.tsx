'use client';

import React from 'react';
import Link from 'next/link';
import { useBlogNavbar } from '@/hooks/useBlogNavbar';
import { PakODriveLogo } from '@/components/common/PakODriveLogo';
import {
  BookOpen,
  Search,
  X,
  Menu,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Wrench,
  ThermometerSnowflake,
  Fuel,
  Cpu,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All Guides': <BookOpen className="w-3.5 h-3.5 text-orange-600" />,
  'Seasonal Car Care': <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-500" />,
  'DIY Maintenance': <Wrench className="w-3.5 h-3.5 text-amber-500" />,
  'Fuel Economy': <Fuel className="w-3.5 h-3.5 text-emerald-500" />,
  'Smart Gadgets': <Cpu className="w-3.5 h-3.5 text-purple-500" />,
  'Driving Safety': <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
};

export const BlogNavbar: React.FC = () => {
  const {
    pathname,
    categories,
    mobileMenuOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    readingProgress,
    isArticlePage,
    searchOpen,
    toggleSearch,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
  } = useBlogNavbar();

  return (
    <header className="sticky top-0 z-50 w-full select-none transition-all">
      {/* ── Top Trending Ticker Bar ────────────────────────────── */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px] py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-flex items-center gap-1 font-bold text-orange-400 uppercase tracking-wider text-[10px] bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full shrink-0">
              <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
              Trending
            </span>
            <div className="flex items-center gap-3 text-slate-400 text-xs overflow-x-auto no-scrollbar">
              <Link
                href="/auto/top-5-ways-to-keep-car-cabin-chilled-pakistan-summer-heat"
                className="hover:text-white transition-colors text-decoration-none truncate"
              >
                Summer AC 45°C Survival Hacks
              </Link>
              <span className="text-slate-700">•</span>
              <Link
                href="/auto?category=Fuel+Economy+%26+Tuning"
                className="hover:text-white transition-colors text-decoration-none truncate"
              >
                Alto & Mehran Fuel Mileage Optimization
              </Link>
              <span className="text-slate-700">•</span>
              <Link
                href="/auto?category=Driving+Safety+%26+Rules"
                className="hover:text-white transition-colors text-decoration-none truncate"
              >
                M-2 Motorway Fog Protocols
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-400">
            <span className="hidden md:inline">100% Cash On Delivery Nationwide</span>
            <span className="text-slate-700 hidden md:inline">•</span>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-semibold transition-colors text-decoration-none"
            >
              <span>Pak-o-Drive Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Crisp Magazine Masthead & Navbar ──────────────── */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.06)] text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand Identity / Magazine Masthead */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/auto"
                className="flex items-center gap-2.5 text-decoration-none group"
                aria-label="Pak-o-Drive Auto Journal"
              >
                <div className="flex items-center">
                  <PakODriveLogo height={34} />
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white rounded font-mono shadow-xs group-hover:bg-orange-600 transition-colors">
                    JOURNAL
                  </span>
                  <span className="text-xs font-bold text-slate-700 hidden md:inline tracking-tight">
                    Auto Guides & Reviews
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Editorial Categories Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {categories.map((cat) => {
                const isActive = pathname === cat.href || (cat.href !== '/auto' && pathname?.startsWith(cat.href));
                return (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all text-decoration-none flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    {CATEGORY_ICONS[cat.label]}
                    <span>{cat.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search & Direct Store CTA */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Search Toggle / Input */}
              <div className="relative">
                {searchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-slate-50 border border-orange-500 rounded-full px-3 py-1.5 shadow-sm transition-all w-52 sm:w-64"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                    <input
                      type="search"
                      placeholder="Search car guides, AC, oil..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 border-none outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={toggleSearch}
                      className="text-slate-400 hover:text-slate-700 p-0.5 ml-1 border-none bg-transparent cursor-pointer"
                      aria-label="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200/80 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    aria-label="Search guides"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                )}
              </div>

              {/* Direct Shop Accessories Button */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-decoration-none shrink-0"
              >
                <span>Shop Auto Parts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open blog menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-orange-600" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Reading Scroll Progress Bar */}
        {isArticlePage && (
          <div className="w-full h-[3px] bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 transition-all duration-150 ease-out shadow-xs"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Mobile Responsive Drawer ───────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bottom-0 z-50 bg-white/98 backdrop-blur-2xl border-t border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shadow-2xl">
          <div className="space-y-5">
            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search guides (e.g. AC cooling, oil, smog)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white outline-none transition-all"
              />
            </form>

            {/* Editorial Hubs */}
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                Editorial Categories
              </p>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/80 border border-slate-100 text-slate-800 hover:text-orange-600 text-xs font-semibold text-decoration-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {CATEGORY_ICONS[cat.label] || <BookOpen className="w-4 h-4 text-orange-600" />}
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cat.tag || 'Explore'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Tags */}
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Hot Topics in Pakistan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Summer AC Survival',
                  'Alto Mileage Hacks',
                  'Motorway Fog Protocols',
                  'Mehran AC Overheating',
                  'Ceramic Paint Protection',
                  'Viral Auto Gadgets',
                ].map((topic) => (
                  <Link
                    key={topic}
                    href={`/auto?search=${encodeURIComponent(topic)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] hover:bg-orange-100 hover:text-orange-700 text-decoration-none transition-colors font-medium"
                  >
                    #{topic}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Store Card */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-md text-decoration-none"
            >
              <span>Explore Pak-o-Drive Accessories Store</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-slate-400 text-center">
              100% Cash On Delivery Nationwide across Pakistan
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default BlogNavbar;
