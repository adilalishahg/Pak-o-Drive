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
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All Guides': <BookOpen className="w-4 h-4 text-orange-500" />,
  'Seasonal Car Care': <ThermometerSnowflake className="w-4 h-4 text-sky-400" />,
  'DIY Maintenance': <Wrench className="w-4 h-4 text-amber-400" />,
  'Fuel Economy': <Fuel className="w-4 h-4 text-emerald-400" />,
  'Smart Gadgets': <Cpu className="w-4 h-4 text-purple-400" />,
  'Driving Safety': <ShieldAlert className="w-4 h-4 text-rose-400" />,
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
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white select-none transition-all">
      {/* Top Editorial Micro Bar */}
      <div className="hidden sm:block border-b border-slate-900 bg-slate-950 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-orange-400">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Pak-o-Drive Auto Journal
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Tested car care & DIY guides for Pakistani roads</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 hidden md:inline">
              Cash on Delivery Available Nationwide
            </span>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors font-medium text-decoration-none"
            >
              <span>Visit Official Store</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Blog Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/auto"
              className="flex items-center gap-2.5 text-decoration-none group"
              aria-label="Pak-o-Drive Auto Journal Homepage"
            >
              <div className="flex items-center">
                <PakODriveLogo height={34} />
              </div>
              <div className="flex flex-col">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded font-mono shadow-xs">
                  Auto Journal
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-semibold group-hover:text-slate-200 transition-colors">
                  Guides & Tech
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {categories.map((cat) => {
              const isActive = pathname === cat.href || (cat.href !== '/auto' && pathname?.startsWith(cat.href));
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-decoration-none ${
                    isActive
                      ? 'bg-slate-800 text-orange-400 font-bold border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items: Guide Search + Shop CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Input / Toggle */}
            <div className="relative">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-slate-900 border border-orange-500/60 rounded-xl px-2.5 py-1.5 shadow-inner transition-all w-48 sm:w-64"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                  <input
                    type="search"
                    placeholder="Search guides (e.g. AC, oil, heat)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 border-none outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="text-slate-400 hover:text-white p-0.5 ml-1 border-none bg-transparent cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors border border-slate-800 flex items-center gap-1.5 text-xs"
                  aria-label="Search auto guides"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline text-slate-400 text-xs">Search Guides</span>
                </button>
              )}
            </div>

            {/* Direct Shop Auto Parts CTA Button */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-950/40 hover:shadow-orange-950/70 transition-all text-decoration-none shrink-0"
            >
              <span>Shop Parts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors border border-slate-800 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open blog menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Reading Progress Bar (Active on single guide/article pages) */}
      {isArticlePage && (
        <div className="w-full h-1 bg-slate-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bottom-0 z-50 bg-slate-950/98 backdrop-blur-xl border-t border-slate-800 p-5 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search automotive guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-none"
              />
            </form>

            {/* Guide Topics */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Editorial Hubs
              </p>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-850 text-white text-xs font-semibold text-decoration-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {CATEGORY_ICONS[cat.label] || <BookOpen className="w-4 h-4 text-orange-400" />}
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cat.tag || 'Explore'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Topics Pill Tags */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Trending Topics in Pakistan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Summer AC Survival',
                  'Engine Heat Protection',
                  'Motorway Fog Safety',
                  'Alto Mileage Hacks',
                  'Ceramic Paint Care',
                  'Viral Auto Gadgets',
                ].map((topic) => (
                  <Link
                    key={topic}
                    href={`/auto?search=${encodeURIComponent(topic)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] hover:border-orange-500/60 hover:text-orange-400 text-decoration-none transition-colors"
                  >
                    #{topic}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Bottom Store Link */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-3">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-lg text-decoration-none"
            >
              <span>Explore Pak-o-Drive Store (Accessories)</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <p className="text-[10px] text-slate-500 text-center">
              100% Cash On Delivery across 90+ Pakistani Cities
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default BlogNavbar;
