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
  ArrowLeft,
  ShoppingBag,
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
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs select-none transition-all">
        {/* ── Main Crisp Magazine Masthead ─────────────────────── */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-6">
            
            {/* ── Mobile Full-Width Search Takeover (< md) ──────── */}
            {searchOpen ? (
              <div className="flex md:hidden items-center w-full gap-2 py-1 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={toggleSearch}
                  aria-label="Back to navigation"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    autoFocus
                    placeholder="Search articles & guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100/90 border border-slate-300/80 rounded-full pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear query"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  disabled={!searchQuery.trim()}
                  className="px-3.5 py-2 rounded-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  Search
                </button>
              </div>
            ) : (
              <>
                {/* Left: Brand Identity / Magazine Masthead */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
                  <Link
                    href="/auto"
                    className="flex items-center gap-2 text-decoration-none group"
                    aria-label="Pak-o-Drive Journal"
                  >
                    <PakODriveLogo height={32} />
                    <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-2 sm:pl-2.5">
                      <span className="px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white rounded font-mono shadow-xs">
                        JOURNAL
                      </span>
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                        Guides & Magazine
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Right: Navigation & Action Controls */}
                <div className="flex items-center gap-2 sm:gap-6 xl:gap-8">
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

                  {/* Desktop Search Box (md+) */}
                  <div className="hidden md:flex items-center">
                    {searchOpen ? (
                      <form
                        onSubmit={handleSearchSubmit}
                        className="relative flex items-center animate-in fade-in duration-150"
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
                  </div>

                  {/* Mobile Search & Menu Trigger Buttons (< md) */}
                  <div className="flex md:hidden items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleSearch}
                      aria-label="Search articles"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Search className="w-4.5 h-4.5" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleMobileMenu}
                      aria-label="Toggle navigation menu"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {mobileMenuOpen ? (
                        <X className="w-5 h-5 text-rose-500" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

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
      </header>

      {/* ── Mobile Responsive Drawer (Outside <header> to prevent backdrop-filter containing block trap) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Solid White Sheet Drawer */}
          <div className="relative z-10 mt-16 sm:mt-20 flex-1 bg-white border-t border-slate-200 shadow-2xl flex flex-col justify-between overflow-y-auto max-h-[calc(100dvh-64px)] sm:max-h-[calc(100dvh-80px)] p-5 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-5">
              {/* Drawer Dedicated Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search guides & articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:bg-white outline-none transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Main Navigation Links */}
              <nav className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-decoration-none transition-colors ${
                    pathname === '/'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-rose-500'
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/auto"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-decoration-none transition-colors ${
                    pathname === '/auto' || pathname?.startsWith('/auto/')
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-rose-500'
                  }`}
                >
                  <span>Auto Guides</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-decoration-none transition-colors ${
                    pathname === '/blog' || pathname?.startsWith('/blog/')
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-rose-500'
                  }`}
                >
                  <span>Tech & AI</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-decoration-none transition-colors border border-rose-100"
                >
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                    <span>Store Catalog</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-rose-500 text-decoration-none transition-colors"
                >
                  <span>About</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-rose-500 text-decoration-none transition-colors"
                >
                  <span>Contact</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </nav>

              {/* Popular Categories */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Popular Categories
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50/90 text-xs text-slate-700 hover:text-rose-500 hover:bg-rose-50/50 text-decoration-none transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Accessories Action Button */}
            <div className="pt-4 border-t border-slate-100 mt-6">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md text-decoration-none transition-all"
              >
                <span>Explore Pak-o-Drive Accessories</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogNavbar;
