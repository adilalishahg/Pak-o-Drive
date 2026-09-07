'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  MapPin,
  Truck,
  MessageCircle,
  Star,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface ViralProduct {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  heroText?: string;
}

interface ViralProductSpotlightProps {
  products: ViralProduct[];
  cleanPhone: string;
}

export const ViralProductSpotlight: React.FC<ViralProductSpotlightProps> = ({
  products,
  cleanPhone,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (products && products.length > 1) {
      const randomIdx = Math.floor(Math.random() * products.length);
      setSelectedIndex(randomIdx);
    }
  }, [products]);

  if (!products || products.length === 0) return null;

  const product = products[selectedIndex] || products[0];
  if (!product) return null;

  const prodImage =
    product.image ||
    (product.images && product.images[0]) ||
    '/img/placeholder-product.png';

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const productUrl = `/product/${product.slug || product._id}`;

  const whatsappText = `Salam Pak-o-Drive! I saw "${product.name}" trending on TikTok/Meta in Rawalpindi/Islamabad on your blog. I want to order for Rs. ${Number(
    product.price || 0
  ).toLocaleString()} via Cash On Delivery. Please confirm my order.`;

  const whatsappOrderUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
    whatsappText
  )}`;

  return (
    <div className="w-full my-6 text-left">
      <div className="relative overflow-hidden rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* ── Micro Top Badges Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 relative z-10 border-b border-rose-100/80 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300 animate-pulse" />
              <span>Viral on TikTok & Meta</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100/90 text-amber-900 border border-amber-200/70">
              <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
              <span>RWP & Islamabad #1 Seller</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">Same-Day / 24h Twin Cities Delivery</span>
            <span className="xs:hidden">24h Delivery RWP/ISL</span>
          </div>
        </div>

        {/* ── Product Spotlight Layout ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          {/* Left Thumbnail (Uncropped & Clean) */}
          <Link
            href={productUrl}
            className="relative w-full sm:w-32 md:w-36 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/80 shrink-0 group block text-decoration-none shadow-xs hover:border-rose-300 transition-colors"
          >
            {/* Layer 1: Ambient Blur */}
            <Image
              src={prodImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 150px"
              className="object-cover blur-xl opacity-30 scale-125 pointer-events-none"
            />
            {/* Layer 2: Main Image */}
            <Image
              src={prodImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 150px"
              className="object-contain p-2 relative z-10 group-hover:scale-105 transition-transform duration-300"
            />
            {discountPercent > 0 && (
              <div className="absolute top-1.5 right-1.5 z-20">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white shadow-xs">
                  -{discountPercent}%
                </span>
              </div>
            )}
          </Link>

          {/* Right Product Details & Action CTAs */}
          <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 truncate">
                  {product.category || 'Viral Auto Gadget'}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({product.reviewsCount || 140}+ Twin Cities orders)
                  </span>
                </div>
              </div>

              {/* Title */}
              <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2 hover:text-rose-600 transition-colors">
                <Link
                  href={productUrl}
                  className="text-slate-900 hover:text-rose-600 transition-colors text-decoration-none"
                >
                  {product.name}
                </Link>
              </h4>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 mt-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-rose-600 tracking-tight">
                  Rs. {Number(product.price || 0).toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    Rs. {Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  COD Available
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-2 mt-3 pt-2.5 border-t border-rose-100/70">
              {/* WhatsApp 1-Click Order */}
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all text-decoration-none"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Order on WhatsApp</span>
              </a>

              {/* Shop / COD Link */}
              <Link
                href={productUrl}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all text-decoration-none"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Buy Cash on Delivery</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>

              <span className="text-[10px] text-slate-500 font-medium hidden md:inline-flex items-center gap-1 ml-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                100% Inspected & COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViralProductSpotlight;
