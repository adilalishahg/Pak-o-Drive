'use client';

import React from 'react';
import Link from 'next/link';
import { useBlogNavbar } from '@/hooks/useBlogNavbar';
import { PakODriveLogo } from '@/components/common/PakODriveLogo';
import {
  Search,
  X,
  Menu,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs select-none transition-all">
      {/* ── Main Crisp Magazine Masthead ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Left: Brand Identity / Magazine Masthead */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/auto"
              className="flex items-center gap-2.5 text-decoration-none group"
              aria-label="Pak-o-Drive Journal"
            >
              <PakODriveLogo height={34} />
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white rounded font-mono shadow-xs">
                  JOURNAL
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Guides & Magazine
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Clean Editorial Navigation matching reference */}
          <div className="flex items-center gap-6 xl:gap-8">
            <nav className="hidden md:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-600">
              <Link
                href="/"
                className="hover:text-rose-500 transition-colors text-decoration-none"
              >
                Home
              </Link>
              <Link
                href="/auto"
                className={`transition-colors text-decoration-none ${
                  pathname === '/auto' || pathname?.startsWith('/auto/')
                    ? 'text-rose-500 font-semibold'
                    : 'hover:text-rose-500'
                }`}
              >
                Auto Guides
              </Link>
              <Link
                href="/blog"
                className={`transition-colors text-decoration-none ${
                  pathname === '/blog' || pathname?.startsWith('/blog/')
                    ? 'text-rose-500 font-semibold'
                    : 'hover:text-rose-500'
                }`}
              >
                Tech & AI
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-slate-700 hover:text-rose-500 transition-colors text-decoration-none font-semibold"
              >
                <span>Store Catalog</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
              <Link
                href="/about"
                className="hover:text-rose-500 transition-colors text-decoration-none"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-rose-500 transition-colors text-decoration-none"
              >
                Contact
              </Link>
            </nav>

            {/* Search Icon / Bar */}
            <div className="flex items-center gap-3">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center"
                >
                  <input
                    type="search"
                    autoFocus
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 sm:w-64 bg-slate-50 border border-slate-300 rounded-full pl-4 pr-9 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={toggleSearch}
                  aria-label="Search articles"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-label="Toggle navigation menu"
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Reading Scroll Progress Bar */}
      {isArticlePage && (
        <div className="w-full h-[3px] bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500 transition-all duration-150 ease-out shadow-xs"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* ── Mobile Responsive Drawer ─────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[81px] bottom-0 z-50 bg-white/98 backdrop-blur-2xl border-t border-slate-200 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
          <div className="space-y-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search guides & articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 outline-none"
              />
            </form>

            <nav className="space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:text-rose-500 text-decoration-none"
              >
                Home
              </Link>
              <Link
                href="/auto"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:text-rose-500 text-decoration-none"
              >
                Auto Guides
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:text-rose-500 text-decoration-none"
              >
                Tech & AI
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-rose-500 text-decoration-none"
              >
                Store Catalog ↗
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:text-rose-500 text-decoration-none"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:text-rose-500 text-decoration-none"
              >
                Contact
              </Link>
            </nav>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Popular Categories
              </p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-700 hover:text-rose-500 text-decoration-none"
                  >
                    <span>{cat.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm text-decoration-none"
            >
              <span>Explore Pak-o-Drive Accessories</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default BlogNavbar;
