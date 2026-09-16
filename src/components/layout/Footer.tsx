'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { useSiteInfo } from '../common/SiteInfoProvider';
import { PakODriveLogo } from '../common/PakODriveLogo';
import { FooterContactGrid } from './footer/FooterContactGrid';
import { FooterNewsletter } from './footer/FooterNewsletter';
import { FooterSocialLinks } from './footer/FooterSocialLinks';

export const Footer: React.FC = () => {
  const { theme } = useSiteTheme();
  const { info } = useSiteInfo();
  const isCleanWhite = theme.layoutTheme === 'theme1';

  if (isCleanWhite) {
    const firstLetter = info.logoText ? info.logoText.charAt(0).toUpperCase() : 'P';
    return (
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Information Column */}
            <div className="lg:col-span-4">
              <Link href="/" className="d-inline-flex align-items-center mb-6 text-decoration-none">
                {theme.svgLogo?.enabled !== false ? (
                  <PakODriveLogo height={Math.min(theme.svgLogo?.height || 36, 36)} />
                ) : (
                  <span className="text-2xl font-extrabold tracking-wider text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base font-black">
                      {firstLetter}
                    </span>
                    {info.logoText || 'PAKODRIVE'}
                  </span>
                )}
              </Link>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Pakistan's trusted destination for automotive accessories, car electronics, and premium gadgetry with Cash on Delivery nationwide.
              </p>
              <FooterContactGrid info={info} isCleanWhite={true} />
            </div>

            {/* 3 Navigation Columns on Mobile View (grid-cols-3) */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2 sm:gap-6">
              <div>
                <h3 className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">Explore</h3>
                <ul className="space-y-2 text-xs sm:text-sm list-none p-0">
                  <li><Link href="/shop" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Shop All</Link></li>
                  <li><Link href="/track-order" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Track Order</Link></li>
                  <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Auto Blog</Link></li>
                  <li><Link href="/wishlist" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Wishlist</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">Help &amp; Care</h3>
                <ul className="space-y-2 text-xs sm:text-sm list-none p-0">
                  <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Contact Us</Link></li>
                  <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">About Us</Link></li>
                  <li><Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">COD Guide</Link></li>
                  <li><Link href="/cart" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">My Cart</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">Policies</h3>
                <ul className="space-y-2 text-xs sm:text-sm list-none p-0">
                  <li><Link href="/return-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Returns</Link></li>
                  <li><Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Shipping</Link></li>
                  <li><Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Privacy</Link></li>
                  <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-decoration-none py-0.5 block leading-normal">Terms</Link></li>
                </ul>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="lg:col-span-3">
              <FooterNewsletter isCleanWhite={true} />
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 m-0">
              &copy; {new Date().getFullYear()} {info.siteName || 'Pak-o-Drive'}. All rights reserved.
            </p>
            <FooterSocialLinks info={info} />
          </div>
        </div>
      </footer>
    );
  }

  // Classic / Modern Theme Layout
  return (
    <footer className="container-fluid footer py-4 py-lg-5 wow fadeIn" data-wow-delay="0.2s" style={{ background: '#0f172a' }}>
      <div className="container py-2 py-lg-4">
        <div className="row g-3 g-md-4 py-2 py-lg-3">
          {/* Column 1: Brand Info */}
          <div className="col-12 col-md-12 col-lg-3 mb-2 mb-lg-0">
            <Link href="/" className="d-inline-flex align-items-center mb-2 text-decoration-none">
              <PakODriveLogo height={28} />
            </Link>
            <p className="text-slate-400 mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.45, maxWidth: '340px' }}>
              {info.siteTagline || "Pakistan's #1 Automotive & Tech Store."}
            </p>
            <FooterSocialLinks info={info} />
          </div>

          {/* 3 Columns on Mobile View (col-4 each = 3 columns side-by-side) */}
          <div className="col-4 col-md-4 col-lg-2 px-1 px-sm-2">
            <h5 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2px' }}>Explore</h5>
            <ul className="list-unstyled mb-0 space-y-1" style={{ fontSize: '0.74rem' }}>
              <li><Link href="/shop" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Shop All</Link></li>
              <li><Link href="/track-order" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Track Order</Link></li>
              <li><Link href="/about" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">About Us</Link></li>
            </ul>
          </div>

          <div className="col-4 col-md-4 col-lg-2 px-1 px-sm-2">
            <h5 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2px' }}>Policies</h5>
            <ul className="list-unstyled mb-0 space-y-1" style={{ fontSize: '0.74rem' }}>
              <li><Link href="/return-policy" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Returns</Link></li>
              <li><Link href="/shipping-policy" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Shipping</Link></li>
              <li><Link href="/terms" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Terms</Link></li>
            </ul>
          </div>

          <div className="col-4 col-md-4 col-lg-2 px-1 px-sm-2">
            <h5 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2px' }}>Support</h5>
            <ul className="list-unstyled mb-0 space-y-1" style={{ fontSize: '0.74rem' }}>
              <li><Link href="/contact" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">Privacy</Link></li>
              <li><a href="https://wa.me/923185205667" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block leading-normal">WhatsApp</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="col-12 col-md-12 col-lg-3 mt-3 mt-lg-0">
            <FooterNewsletter isCleanWhite={false} />
          </div>
        </div>

        {/* Compact Horizontal Contact Bar at the Bottom */}
        <div className="pt-3 pb-2 border-top border-secondary">
          <FooterContactGrid info={info} isCleanWhite={false} />
        </div>

        <div className="pt-3 border-top border-secondary text-center text-slate-500 small">
          &copy; {new Date().getFullYear()} {info.siteName || 'Pak-o-Drive'}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
