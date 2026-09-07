import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ShieldCheck, Truck, MessageCircle, Star } from 'lucide-react';

export interface ArticleProduct {
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
}

interface ArticleFeaturedProductsProps {
  products: ArticleProduct[];
  cleanPhone: string;
  title?: string;
  subtitle?: string;
}

export const ArticleFeaturedProducts: React.FC<ArticleFeaturedProductsProps> = ({
  products,
  cleanPhone,
  title = 'Recommended Upgrades & Genuine Accessories',
  subtitle = 'Order genuine automotive accessories directly with 100% Cash On Delivery nationwide.',
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="my-8 p-5 sm:p-7 rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/20 shadow-xs relative overflow-hidden">
      {/* Ambient Accent Light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pak-o-Drive Official Store Direct</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> 100% Cash On Delivery
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Truck className="w-4 h-4 text-slate-400 shrink-0" /> 7-Day Checking Warranty
            </span>
          </p>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors shrink-0 self-start sm:self-auto inline-flex items-center gap-1 text-decoration-none"
        >
          <span>View All Products</span>
          <span>→</span>
        </Link>
      </div>

      {/* Product Cards Grid (2-Column in Left Content Rail) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 relative z-10">
        {products.map((prod) => {
          const prodImage =
            prod.image ||
            (prod.images && prod.images[0]) ||
            '/img/placeholder-product.png';

          const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
          const discountPercent = hasDiscount
            ? Math.round(((prod.originalPrice! - prod.price) / prod.originalPrice!) * 100)
            : 0;

          return (
            <div
              key={prod._id}
              className="group border border-slate-200/90 hover:border-rose-400 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white relative"
            >
              <div>
                {/* Dual-Layer Uncropped Media Presentation (Rule 3) */}
                <Link
                  href={`/product/${prod.slug || prod._id}`}
                  className="relative block aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100/80 mb-3.5 group-hover:shadow-inner"
                >
                  {/* Layer 1: Ambient Blur Backdrop */}
                  <Image
                    src={prodImage}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                  />
                  {/* Layer 2: 100% Unclipped Product Media */}
                  <Image
                    src={prodImage}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-contain p-3 relative z-10 group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      COD Available
                    </span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
                        -{discountPercent}% OFF
                      </span>
                    </div>
                  )}
                </Link>

                {/* Rating & Category */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 truncate">
                    {prod.category || 'Genuine Accessory'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{prod.rating || 5}.0</span>
                  </div>
                </div>

                {/* Product Title (Rule 4: Typography Clipping Prevention & Bold Legibility) */}
                <h4 className="font-bold text-sm leading-normal py-0.5 line-clamp-2">
                  <Link
                    href={`/product/${prod.slug || prod._id}`}
                    className="!text-slate-900 group-hover:!text-rose-600 transition-colors text-decoration-none block"
                    style={{ color: '#0f172a' }}
                  >
                    {prod.name}
                  </Link>
                </h4>
              </div>

              {/* Price & Action Row */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-rose-600 tracking-tight">
                      Rs. {Number(prod.price || 0).toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">
                        Rs. {Number(prod.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    In Stock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* WhatsApp 1-Click Order (Rule 2) */}
                  <a
                    href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                      `Salam Pak-o-Drive, I would like to order "${prod.name}" (Rs. ${Number(prod.price || 0).toLocaleString()}) via Cash On Delivery. Please confirm my order.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all text-decoration-none"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Order COD Button */}
                  <Link
                    href={`/product/${prod.slug || prod._id}`}
                    className="inline-flex items-center justify-center py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all text-decoration-none"
                  >
                    Order COD
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
