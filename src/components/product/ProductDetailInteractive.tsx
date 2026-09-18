'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '../common/OptimizedImage';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductActions } from './ProductActions';
import { ProductViewLogger } from '../common/ProductViewLogger';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ProductDetailInteractiveProps } from '@/types/product';
import { useProductDetail } from '@/hooks/useProductDetail';
import { CategoryIcon, ThemeIcon } from '../common/ThemeIcon';
import { getBestCategoryIcon } from '@/lib/categoryIconService';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';
import { ProductReviewsSection } from './ProductReviewsSection';
import { StockUrgencyBanner } from './StockUrgencyBanner';
import { SpotlightCard } from '../ui/SpotlightCard';
import { Sparkles, Star, Truck, ShieldCheck, Headphones, CheckCircle2, SlidersHorizontal, ShieldAlert, Zap } from 'lucide-react';

export const ProductDetailInteractive: React.FC<ProductDetailInteractiveProps> = ({ product }) => {
  const {
    selectedVariant,
    handleSelectVariant,
    currentPrice,
    currentOriginalPrice,
    currentImage,
    currentDescription,
    cleanedDescription,
    overviewDescription,
    featuresDescription,
    currentStock,
    discountPercent,
    specs,
  } = useProductDetail({ product });

  return (
    <>
      <ProductViewLogger
        id={product._id || ''}
        name={product.name}
        category={product.category}
        price={currentPrice}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
        {/* Image & Overview Hook col */}
        <div className="flex flex-col bg-white">
          <ProductImageGallery
            image={currentImage}
            images={product.images || []}
            name={selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
            video={product.video}
            showVideoOnFront={product.showVideoOnFront}
          />

          {/* Upper Overview Hook — Perfectly levels the left gallery with the right buy card */}
          {overviewDescription && (
            <div className="hidden md:block px-4 lg:px-6 py-4 border-t border-slate-100 flex-grow">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Product Overview</span>
                </span>
              </div>
              <MarkdownRenderer
                content={overviewDescription}
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}
              />
            </div>
          )}
        </div>

        {/* Info col */}
        <div className="flex flex-col p-4 sm:p-6 lg:p-7">
          {/* Category Badge with Dynamic Icon */}
          {product.category && (
            <div className="mb-2.5">
              <Link
                href={`/shop?category=${product.category}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 px-3 py-1 rounded-full transition-all"
              >
                <CategoryIcon
                  icon={getBestCategoryIcon(product.category)}
                  style={{ fontSize: '11px', color: 'var(--pd-primary, #ea580c)' }}
                />
                <span>{product.category.replace(/-/g, ' ')}</span>
              </Link>
            </div>
          )}

          {/* Name */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-normal py-0.5 mb-2.5">
            {product.name}
            {selectedVariant && (
              <span className="text-slate-500 font-semibold text-lg ml-2">
                ({selectedVariant.name})
              </span>
            )}
          </h1>

          {/* Stars + review count */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {product.rating?.toFixed(1) || '5.0'} · {product.reviewsCount || 0} customer reviews
            </span>
          </div>

          {/* Variant Selector badge/list */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Available Options / Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?._id === v._id || selectedVariant?.name === v.name;
                  return (
                    <button
                      key={v._id || v.name}
                      onClick={() => handleSelectVariant(v)}
                      type="button"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.image && (
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 shrink-0 relative">
                          <OptimizedImage
                            src={v.image}
                            alt={v.name}
                            fill
                            sizes="20px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <span>{v.name}</span>
                      <span className="text-slate-400 text-[11px] font-normal">({v.price.toLocaleString()} PKR)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price box */}
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3.5 sm:p-4 mb-4">
            {currentOriginalPrice > currentPrice && (
              <div className="flex items-center gap-2 mb-1.5">
                <del className="text-xs sm:text-sm text-slate-400 font-medium">
                  PKR {currentOriginalPrice.toLocaleString()}
                </del>
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-normal">
                  -{discountPercent}% OFF
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-slate-500">PKR</span>
              <span className="pd-detail-price-num text-3xl sm:text-4xl font-black text-orange-600 tracking-tight leading-normal py-0.5">
                {currentPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Real-time Inventory Urgency Trigger */}
          <StockUrgencyBanner stock={currentStock} />

          {/* Meta Info */}
          <div className="flex flex-col gap-1.5 text-xs text-slate-500 my-3">
            <div className="flex items-center gap-1.5">
              <span>Availability:</span>
              <span className={`font-bold ${currentStock !== 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currentStock < 0 ? 'In Stock (Unlimited)' : currentStock > 0 ? `In Stock (${currentStock} items left)` : 'Out of Stock'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>SKU:</span>
              <span className="font-mono text-slate-700">
                PAK-{product._id?.substring(18).toUpperCase()}-{selectedVariant ? selectedVariant.name.substring(0, 3).toUpperCase() : 'MAIN'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Shipping:</span>
              <span className="font-semibold text-emerald-600">Free delivery on 2 or more products</span>
            </div>
          </div>

          {/* Actions (Immediately visible next to image & price) */}
          <ProductActions product={product} selectedVariant={selectedVariant} />

          {/* Mobile-Only Description (Shown below buy buttons on small screens) */}
          {currentDescription && (
            <div className="block md:hidden mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Product Highlights</span>
                </span>
              </div>
              <MarkdownRenderer
                content={cleanedDescription}
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}
              />
            </div>
          )}

          {/* Localized Pakistan Trust & Assurance Box */}
          <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { themeIcon: 'shipping', fallbackIcon: Truck, title: 'Cash on Delivery', desc: 'Pay upon parcel arrival' },
                { themeIcon: 'sync', fallbackIcon: Zap, title: 'Express Delivery', desc: 'Fast TCS / Trax dispatch' },
                { themeIcon: 'shield', fallbackIcon: ShieldCheck, title: '100% Genuine', desc: 'Quality checked product' },
                { themeIcon: 'headset', fallbackIcon: Headphones, title: 'WhatsApp Help', desc: '24/7 dedicated support' },
              ].map((b, i) => {
                const FallbackComponent = b.fallbackIcon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                  >
                    <div className="p-1 rounded-lg bg-orange-50 text-orange-600 shrink-0 mt-0.5 flex items-center justify-center w-7 h-7">
                      {b.themeIcon ? (
                        <ThemeIcon name={b.themeIcon} style={{ fontSize: '14px', color: '#ea580c' }} />
                      ) : (
                        <FallbackComponent className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 leading-normal">
                        {b.title}
                      </span>
                      <span className="block text-[11px] text-slate-500 leading-normal mt-0.5">
                        {b.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Timeline info */}
            <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
              <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <span className="leading-normal text-emerald-900">
                <strong className="text-emerald-950">Estimated Delivery:</strong> Rawalpindi / Islamabad: 24h (1 Day) | Lahore, Karachi & Nationwide: 2–3 Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Balanced Lower Section: Why You Need This (Left 50%) & Technical Specifications (Right 50%) ── */}
      {(featuresDescription || specs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Left Half: Features & Why You Need This */}
          <div>
            <SpotlightCard
              spotlightColor="rgba(234, 88, 12, 0.12)"
              borderColor="rgba(234, 88, 12, 0.3)"
              className="rounded-2xl h-full"
            >
              <div className="h-full p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-normal">
                      Why You Need This & Key Features
                    </h3>
                    <span className="text-xs text-slate-500">
                      Highlights & benefits of this product
                    </span>
                  </div>
                </div>
                <MarkdownRenderer
                  content={featuresDescription || cleanedDescription}
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                  }}
                />
              </div>
            </SpotlightCard>
          </div>

          {/* Right Half: Technical Specifications & Fitment */}
          <div>
            <SpotlightCard
              spotlightColor="rgba(37, 99, 235, 0.12)"
              borderColor="rgba(37, 99, 235, 0.3)"
              className="rounded-2xl h-full"
            >
              <div className="h-full p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-normal">
                      Technical Specifications
                    </h3>
                    <span className="text-xs text-slate-500">
                      Compatibility, dimensions & quality details
                    </span>
                  </div>
                </div>

                {specs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-slate-100">
                        {specs.map(([key, val], i) => (
                          <tr key={key} className={i % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}>
                            <td className="py-2.5 px-3 font-semibold text-slate-700 w-[45%]">
                              {key}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl text-slate-700 text-xs leading-relaxed border border-slate-200/60">
                    <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-orange-600" /> Package & Quality Guarantee:
                    </div>
                    <div className="mb-1 text-slate-600">• 100% Brand New & Quality Verified</div>
                    <div className="mb-1 text-slate-600">• Secure Bubble Wrap Fragile Packaging</div>
                    <div className="mb-1 text-slate-600">• Easy Direct Fitment & Installation</div>
                    <div className="text-slate-600">• 7-Day Easy Return & Cash on Delivery Across Pakistan</div>
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* ── Frequently Bought Together Bundle ── */}
      <FrequentlyBoughtTogether currentProduct={product} />

      {/* ── Verified Customer Ratings & Photo Reviews ── */}
      <ProductReviewsSection
        productId={product._id || ''}
        initialRating={product.rating || 5}
        initialReviewCount={product.reviewsCount || 0}
      />
    </>
  );
};
