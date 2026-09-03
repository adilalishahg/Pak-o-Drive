'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { ICampaignOfferDocument, ICampaignProduct } from '@/models/CampaignOffer';

interface BundleDetailInteractiveProps {
  product: any;
  campaignOffer?: ICampaignOfferDocument;
}

export const BundleDetailInteractive: React.FC<BundleDetailInteractiveProps> = ({
  product,
  campaignOffer,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [inspectItem, setInspectItem] = useState<ICampaignProduct | null>(null);

  const offer: any = campaignOffer || product.campaignOffer;
  const products: ICampaignProduct[] = offer?.products || [];

  const dealPrice = product.price;
  const originalPrice = product.originalPrice;
  const totalSavings = Math.max(0, originalPrice - dealPrice);
  const discountPercent = originalPrice > 0 ? Math.round((totalSavings / originalPrice) * 100) : 0;

  const isBundle = offer?.offerType === 'combo_bundle';

  // Current active product in hero image gallery
  const activeProduct = products[activeIdx] || products[0] || {
    name: product.name,
    image: product.image,
    offerPrice: dealPrice,
    originalPrice,
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : products.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev < products.length - 1 ? prev + 1 : 0));
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    const includedNames = products.map((p) => p.name).join(' + ');

    const bundleItem: any = {
      _id: product._id,
      name: product.name,
      price: dealPrice,
      originalPrice,
      image: product.image,
      category: 'Special Campaign Offer',
      slug: product.slug,
      stock: 99,
      description: `Includes: ${includedNames}`,
    };

    const bundleVariant: any = {
      _id: `var_${product._id}`,
      name: `Package Deal: ${includedNames}`,
      price: dealPrice,
    };

    addToCart(bundleItem, quantity, bundleVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  // WhatsApp 1-Click Order Link (Rule #2 E.164 Deep Link)
  const getWhatsAppOrderUrl = () => {
    const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923185205667';
    const cleanNum = rawNumber.replace(/\+/g, '').trim();
    const productList = products
      .map((p, i) => `${i + 1}. *${p.name}* (Deal Rate: Rs. ${p.offerPrice.toLocaleString()})`)
      .join('\n');

    const msg =
      `Assalam-o-Alaikum Pak-o-Drive! ✨\n\n` +
      `Mujhe yeh special bundle package deal order karni hai:\n\n` +
      `📦 *${product.name}*\n` +
      `💰 *Package Deal Price:* Rs. ${(dealPrice * quantity).toLocaleString()} (Qty: ${quantity})\n` +
      (totalSavings > 0 ? `🎉 *Discount Savings:* Rs. ${(totalSavings * quantity).toLocaleString()} (${discountPercent}% OFF)\n` : '') +
      `\n*Included Products in Package:*\n${productList}\n\n` +
      `📍 Delivery: Cash on Delivery (Free Delivery on 2+ Products Qualified!)\n` +
      `Please mera order confirm karein aur delivery time batayein!`;

    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="container-fluid px-2 px-sm-3 px-lg-5 py-3 py-lg-4">
      {/* Top Banner Notice */}
      <div
        className="rounded-4 p-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 text-white shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill bg-danger px-2.5 py-1 text-white fw-bold" style={{ fontSize: '0.72rem' }}>
            ⚡ SPECIAL PACKAGE DEAL
          </span>
          <span className="small text-white text-opacity-90 fw-semibold" style={{ fontSize: '0.82rem' }}>
            {isBundle ? 'All items sold together at an exclusive bundle rate!' : 'Limited-time special multi-product sale!'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2 small text-warning fw-bold" style={{ fontSize: '0.8rem' }}>
          <span>🚚 Free Delivery (2+ Products) • Nationwide COD</span>
        </div>
      </div>

      <div className="row g-3 g-lg-5">
        {/* ── Left Column: Interactive Image Showcase & Thumbnails ── */}
        <div className="col-12 col-lg-6">
          <div
            className="rounded-4 overflow-hidden p-3 p-sm-4 bg-white border position-relative shadow-sm text-center"
            style={{ minHeight: '340px' }}
          >
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div
                className="position-absolute top-3 start-3 badge bg-danger text-white rounded-pill px-3 py-1.5 fw-extrabold shadow-sm"
                style={{ fontSize: '0.82rem', zIndex: 5 }}
              >
                {discountPercent}% OFF BUNDLE
              </div>
            )}

            {/* Total Items Counter Badge */}
            <div
              className="position-absolute top-3 end-3 badge bg-dark bg-opacity-75 text-white rounded-pill px-2.5 py-1 fw-bold"
              style={{ fontSize: '0.74rem', zIndex: 5 }}
            >
              Item {activeIdx + 1} of {products.length}
            </div>

            {/* Uncropped Dual-Layer Hero Image Presentation (Rule #3) */}
            <div
              className="position-relative rounded-3 overflow-hidden w-100"
              style={{ height: '280px', background: '#f8fafc' }}
            >
              <div
                className="position-absolute inset-0 pointer-events-none opacity-40 blur-xl"
                style={{
                  backgroundImage: `url(${activeProduct?.image || product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Image
                key={activeProduct?.image || product.image}
                src={activeProduct?.image || product.image}
                alt={activeProduct?.name || product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain' }}
                className="p-3 transition-all"
              />

              {/* Prev / Next Image Overlay Controls */}
              {products.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="position-absolute top-50 start-2 translate-middle-y btn btn-light rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', zIndex: 4, background: 'rgba(255,255,255,0.9)' }}
                    aria-label="Previous Product"
                  >
                    <i className="fas fa-chevron-left text-dark small" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="position-absolute top-50 end-2 translate-middle-y btn btn-light rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', zIndex: 4, background: 'rgba(255,255,255,0.9)' }}
                    aria-label="Next Product"
                  >
                    <i className="fas fa-chevron-right text-dark small" />
                  </button>
                </>
              )}

              {/* Product Label Overlay at Bottom */}
              <div
                className="position-absolute bottom-0 start-0 end-0 p-2 text-white text-center"
                style={{
                  background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)',
                  zIndex: 3,
                }}
              >
                <div className="small fw-bold text-truncate leading-normal py-0.5 px-3">
                  {activeProduct?.name}
                </div>
                {activeProduct?.offerPrice && (
                  <div className="badge bg-warning text-dark fw-extrabold px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                    Bundle Rate: Rs. {activeProduct.offerPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Thumbnails Row (Tap to switch image) */}
            {products.length > 1 && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-3 flex-wrap">
                {products.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className="position-relative rounded-3 overflow-hidden p-0 border transition-all"
                    style={{
                      width: '60px',
                      height: '60px',
                      cursor: 'pointer',
                      background: '#ffffff',
                      borderColor: activeIdx === idx ? '#ea580c' : '#e2e8f0',
                      borderWidth: activeIdx === idx ? '2.5px' : '1px',
                      transform: activeIdx === idx ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: activeIdx === idx ? '0 4px 12px rgba(234, 88, 12, 0.35)' : 'none',
                    }}
                    title={`View ${p.name}`}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="60px"
                      style={{ objectFit: 'contain' }}
                      className="p-1"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="text-muted small mt-2" style={{ fontSize: '0.72rem' }}>
              💡 Kisi bhi photo par tap karein us product ko inspect karne ke liye
            </div>
          </div>

          {/* Trust Guarantees (No 7-Day Warranty, Free Delivery on 2+ Products) */}
          <div className="row g-2 mt-2 text-center">
            <div className="col-4">
              <div className="p-2 rounded-3 bg-white border shadow-xs h-100">
                <span className="fs-5 d-block mb-0.5">🇵🇰</span>
                <span className="fw-bold text-dark d-block small" style={{ fontSize: '0.74rem' }}>Cash on Delivery</span>
                <span className="text-muted small" style={{ fontSize: '0.66rem' }}>Pay at Doorstep</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-2 rounded-3 bg-white border shadow-xs h-100" style={{ borderColor: '#86efac' }}>
                <span className="fs-5 d-block mb-0.5">🚚</span>
                <span className="fw-bold text-success d-block small" style={{ fontSize: '0.74rem' }}>Free Delivery</span>
                <span className="text-muted small" style={{ fontSize: '0.66rem' }}>On 2+ Products</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-2 rounded-3 bg-white border shadow-xs h-100">
                <span className="fs-5 d-block mb-0.5">🛡️</span>
                <span className="fw-bold text-dark d-block small" style={{ fontSize: '0.74rem' }}>100% Genuine</span>
                <span className="text-muted small" style={{ fontSize: '0.66rem' }}>Warehouse Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Package Pricing, Details & CTAs ────────── */}
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-column h-100">
            {/* Category / Badge */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-light text-muted border rounded-pill px-2.5 py-1 small fw-semibold" style={{ fontSize: '0.72rem' }}>
                {offer?.badge || 'SPECIAL CAMPAIGN OFFER'}
              </span>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-1 small fw-bold" style={{ fontSize: '0.72rem' }}>
                📦 {products.length} Products Set
              </span>
            </div>

            {/* Title (Rule #4 Typography Safe) */}
            <h1
              className="fw-extrabold text-dark mb-2 leading-normal py-0.5"
              style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', letterSpacing: '-0.3px' }}
            >
              {product.name}
            </h1>

            {/* Description / Subtitle */}
            <p className="text-muted mb-3 leading-normal py-0.5" style={{ fontSize: '0.88rem' }}>
              {product.description}
            </p>

            {/* Price Showcase Card */}
            <div
              className="rounded-3 p-3 bg-light border mb-3"
              style={{ borderColor: '#e2e8f0' }}
            >
              <span className="text-muted small d-block mb-1" style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Complete Package Deal Price:
              </span>
              <div className="d-flex align-items-baseline gap-3 flex-wrap">
                <span className="fw-extrabold font-monospace text-dark" style={{ fontSize: '1.9rem', color: '#c2410c' }}>
                  Rs. {dealPrice.toLocaleString()}
                </span>
                {originalPrice > dealPrice && (
                  <span className="text-muted text-decoration-line-through fs-5">
                    Rs. {originalPrice.toLocaleString()}
                  </span>
                )}
                {totalSavings > 0 && (
                  <span className="badge bg-success text-white rounded-pill px-3 py-1.5 fw-bold ms-auto">
                    You Save Rs. {totalSavings.toLocaleString()}!
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              {/* Quantity */}
              <div
                className="d-flex align-items-center rounded-pill border bg-white px-2 py-1 shadow-xs"
                style={{ width: 'fit-content' }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="btn btn-sm btn-link text-dark text-decoration-none p-1 px-2"
                  disabled={quantity <= 1}
                >
                  <i className="fas fa-minus small" />
                </button>
                <span className="fw-bold px-2.5 text-dark font-monospace" style={{ fontSize: '0.95rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="btn btn-sm btn-link text-dark text-decoration-none p-1 px-2"
                >
                  <i className="fas fa-plus small" />
                </button>
              </div>

              {/* Add Complete Bundle to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary rounded-pill py-2.5 px-3.5 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  border: 'none',
                  fontSize: '0.92rem',
                }}
              >
                <i className={`fas ${added ? 'fa-check' : 'fa-shopping-bag'}`} />
                <span>{added ? 'Added to Cart!' : `Add Package to Cart (Rs. ${(dealPrice * quantity).toLocaleString()})`}</span>
              </button>
            </div>

            {/* WhatsApp 1-Click Order Button */}
            <a
              href={getWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success rounded-pill py-2.5 px-3.5 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm text-decoration-none mb-3"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none',
                fontSize: '0.92rem',
              }}
            >
              <i className="fab fa-whatsapp fs-5" />
              <span>1-Click WhatsApp Order (Pre-filled Bundle Details)</span>
            </a>

            {/* ── Included Items Detailed Breakdown (Click to Inspect) ── */}
            <div className="card border rounded-4 overflow-hidden bg-white shadow-xs mb-3">
              <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold text-dark small" style={{ fontSize: '0.82rem' }}>
                  📦 ITEMS INCLUDED IN THIS PACKAGE ({products.length} PRODUCTS)
                </span>
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Tap item to inspect
                </span>
              </div>

              <div className="list-group list-group-flush">
                {products.map((item, idx) => (
                  <div
                    key={item.productId || idx}
                    onClick={() => {
                      setActiveIdx(idx);
                      setInspectItem(item);
                    }}
                    className={`list-group-item p-3 d-flex align-items-center gap-3 border-0 border-bottom cursor-pointer transition-all ${
                      activeIdx === idx ? 'bg-orange-50 bg-opacity-30' : ''
                    }`}
                    style={{
                      cursor: 'pointer',
                      background: activeIdx === idx ? 'rgba(234, 88, 12, 0.05)' : '#ffffff',
                    }}
                    title="Click to view details"
                  >
                    {/* Item Thumbnail */}
                    <div
                      className="position-relative rounded-2 overflow-hidden bg-light border flex-shrink-0"
                      style={{
                        width: '54px',
                        height: '54px',
                        borderColor: activeIdx === idx ? '#ea580c' : '#e2e8f0',
                      }}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="54px"
                        style={{ objectFit: 'contain' }}
                        className="p-1"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-grow-1">
                      <h6
                        className="fw-bold text-dark mb-0.5 text-truncate leading-normal py-0.5"
                        style={{ fontSize: '0.86rem' }}
                      >
                        {item.name}
                      </h6>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold" style={{ color: '#c2410c', fontSize: '0.82rem' }}>
                          Deal: Rs. {item.offerPrice.toLocaleString()}
                        </span>
                        {item.originalPrice > item.offerPrice && (
                          <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.74rem' }}>
                            Rs. {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="badge bg-light text-muted border rounded-pill small" style={{ fontSize: '0.68rem' }}>
                          Inspect 🔍
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectItem(item);
                      }}
                      className="btn btn-xs btn-outline-secondary rounded-pill px-2.5 py-1 text-decoration-none small fw-semibold flex-shrink-0"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Details ↗
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Quick-Inspect Modal ─────────────────────────────── */}
      {inspectItem && (
        <div
          className="position-fixed inset-0 d-flex align-items-center justify-content-center p-3"
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
          }}
          onClick={() => setInspectItem(null)}
        >
          <div
            className="bg-white rounded-4 overflow-hidden shadow-2xl border w-100"
            style={{ maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
              <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                🔍 Product Detail (Part of Bundle)
              </span>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="btn btn-sm btn-danger rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px' }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 text-center">
              <div
                className="position-relative rounded-3 overflow-hidden mx-auto mb-3 bg-light border"
                style={{ width: '200px', height: '200px' }}
              >
                <Image
                  src={inspectItem.image}
                  alt={inspectItem.name}
                  fill
                  sizes="200px"
                  style={{ objectFit: 'contain' }}
                  className="p-2"
                />
              </div>

              <h5 className="fw-bold text-dark mb-2 leading-normal py-0.5" style={{ fontSize: '1.05rem' }}>
                {inspectItem.name}
              </h5>

              <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                <span className="fw-extrabold fs-5" style={{ color: '#c2410c' }}>
                  Deal Rate: Rs. {inspectItem.offerPrice.toLocaleString()}
                </span>
                {inspectItem.originalPrice > inspectItem.offerPrice && (
                  <span className="text-muted text-decoration-line-through small">
                    Rs. {inspectItem.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="alert alert-warning py-2 px-3 rounded-3 small mb-3 text-start" style={{ fontSize: '0.78rem' }}>
                <strong>📦 Bundle Deal Benefit:</strong> Yeh item is package deal mein discounted rate par shamil hai.
              </div>

              <div className="d-flex flex-column gap-2">
                {inspectItem.slug && (
                  <Link
                    href={`/product/${inspectItem.slug}`}
                    className="btn btn-outline-primary rounded-pill py-2 small fw-bold text-decoration-none"
                    style={{ fontSize: '0.84rem' }}
                    onClick={() => setInspectItem(null)}
                  >
                    Open Standalone Product Page ➔
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="btn btn-secondary rounded-pill py-2 small fw-semibold"
                  style={{ fontSize: '0.84rem' }}
                >
                  Back to Package Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
