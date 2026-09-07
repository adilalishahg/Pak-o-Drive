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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Information Column */}
            <div>
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

            {/* Information Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Information</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm list-none p-0">
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Contact Us</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors text-decoration-none">About Us</Link></li>
                <li><Link href="/track-order" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Track Your Order</Link></li>
                <li><Link href="/return-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Return Policy</Link></li>
                <li><Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Shipping Info</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Quick Links</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm list-none p-0">
                <li><Link href="/shop" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Shop Catalog</Link></li>
                <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Automotive Blog</Link></li>
                <li><Link href="/cart" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Shopping Cart</Link></li>
                <li><Link href="/wishlist" className="text-slate-400 hover:text-white transition-colors text-decoration-none">My Wishlist</Link></li>
                <li><Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-decoration-none">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Newsletter Subscription */}
            <FooterNewsletter isCleanWhite={true} />
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
          <div className="col-12 col-md-6 col-lg-3">
            <Link href="/" className="d-inline-flex align-items-center mb-2 text-decoration-none">
              <PakODriveLogo height={28} />
            </Link>
            <p className="text-slate-400 mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.45, maxWidth: '340px' }}>
              {info.siteTagline || "Pakistan's #1 Automotive & Tech Store."}
            </p>
            <FooterSocialLinks info={info} />
          </div>

          <div className="col-6 col-md-3 col-lg-3">
            <h5 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.3px' }}>Explore</h5>
            <ul className="list-unstyled mb-0 space-y-1" style={{ fontSize: '0.78rem' }}>
              <li><Link href="/shop" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Shop All</Link></li>
              <li><Link href="/track-order" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Track Order</Link></li>
              <li><Link href="/contact" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Contact Us</Link></li>
              <li><Link href="/about" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">About Us</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-3">
            <h5 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.3px' }}>Policies</h5>
            <ul className="list-unstyled mb-0 space-y-1" style={{ fontSize: '0.78rem' }}>
              <li><Link href="/return-policy" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Return & Warranty</Link></li>
              <li><Link href="/shipping-policy" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Shipping & Delivery</Link></li>
              <li><Link href="/privacy-policy" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 text-decoration-none hover:text-white py-0.5 d-inline-block">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
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
