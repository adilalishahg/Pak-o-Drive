'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ICampaignOfferDocument, ICampaignProduct } from '@/models/CampaignOffer';
import { getAdminWhatsAppNumber } from '@/lib/whatsappNotification';

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

  const offer: any = campaignOffer || product.campaignOffer;
  const products: ICampaignProduct[] = offer?.products || [];

  const dealPrice = product.price;
  const originalPrice = product.originalPrice;
  const totalSavings = Math.max(0, originalPrice - dealPrice);
  const discountPercent = originalPrice > 0 ? Math.round((totalSavings / originalPrice) * 100) : 0;

  const isBundle = offer?.offerType === 'combo_bundle';

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
    const rawNumber = getAdminWhatsAppNumber() || '923185205667';
    const cleanNum = rawNumber.replace(/\+/g, '').trim();
    const productList = products.map((p, i) => `${i + 1}. *${p.name}* (Deal Rate: Rs. ${p.offerPrice.toLocaleString()})`).join('\n');

    const msg =
      `Assalam-o-Alaikum Pak-o-Drive! ✨\n\n` +
      `Mujhe yeh special bundle package deal order karni hai:\n\n` +
      `📦 *${product.name}*\n` +
      `💰 *Package Deal Price:* Rs. ${(dealPrice * quantity).toLocaleString()} (Qty: ${quantity})\n` +
      (totalSavings > 0 ? `🎉 *Discount Savings:* Rs. ${(totalSavings * quantity).toLocaleString()} (${discountPercent}% OFF)\n` : '') +
      `\n*Included Products in Package:*\n${productList}\n\n` +
      `📍 Delivery: Cash on Delivery (COD)\n` +
      `Please mera order confirm karein aur delivery time batayein!`;

    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="container-fluid px-3 px-lg-5 py-4">
      {/* Top Banner Notice */}
      <div
        className="rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2 text-white shadow-sm"
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
          <span>🇵🇰 Nationwide COD Available</span>
        </div>
      </div>

      <div className="row g-4 g-lg-5">
        {/* ── Left Column: Primary Image Showcase & Package Visual ── */}
        <div className="col-12 col-lg-6">
          <div
            className="rounded-4 overflow-hidden p-4 bg-white border position-relative shadow-sm text-center"
            style={{ minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            {discountPercent > 0 && (
              <div
                className="position-absolute top-3 start-3 badge bg-danger text-white rounded-pill px-3 py-1.5 fw-extrabold shadow-sm"
                style={{ fontSize: '0.82rem', zIndex: 3 }}
              >
                {discountPercent}% OFF BUNDLE
              </div>
            )}

            {/* Uncropped Dual-Layer Presentation (Rule #3) */}
            <div
              className="position-relative rounded-3 overflow-hidden w-100"
              style={{ height: '300px', background: '#f8fafc' }}
            >
              <div
                className="position-absolute inset-0 pointer-events-none opacity-40 blur-xl"
                style={{
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain' }}
                className="p-3"
              />
            </div>

            {/* Included Thumbnails Row */}
            {products.length > 1 && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-3 flex-wrap">
                {products.map((p, idx) => (
                  <div
                    key={idx}
                    className="position-relative rounded-2 overflow-hidden border bg-light shadow-xs"
                    style={{ width: '56px', height: '56px' }}
                    title={p.name}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="56px"
                      style={{ objectFit: 'contain' }}
                      className="p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="row g-2 mt-3 text-center">
            <div className="col-4">
              <div className="p-2.5 rounded-3 bg-white border shadow-xs">
                <span className="fs-5 d-block mb-1">🇵🇰</span>
                <span className="fw-bold text-dark d-block small" style={{ fontSize: '0.74rem' }}>Cash on Delivery</span>
                <span className="text-muted small" style={{ fontSize: '0.68rem' }}>Pay at Doorstep</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-2.5 rounded-3 bg-white border shadow-xs">
                <span className="fs-5 d-block mb-1">🛡️</span>
                <span className="fw-bold text-dark d-block small" style={{ fontSize: '0.74rem' }}>7-Day Warranty</span>
                <span className="text-muted small" style={{ fontSize: '0.68rem' }}>Easy Replacement</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-2.5 rounded-3 bg-white border shadow-xs">
                <span className="fs-5 d-block mb-1">🚚</span>
                <span className="fw-bold text-dark d-block small" style={{ fontSize: '0.74rem' }}>Fast Shipping</span>
                <span className="text-muted small" style={{ fontSize: '0.68rem' }}>2-4 Days Courier</span>
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
              style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)', letterSpacing: '-0.3px' }}
            >
              {product.name}
            </h1>

            {/* Description / Subtitle */}
            <p className="text-muted mb-3 leading-normal py-0.5" style={{ fontSize: '0.92rem' }}>
              {product.description}
            </p>

            {/* Price Showcase Card */}
            <div
              className="rounded-3 p-3.5 bg-light border mb-4"
              style={{ borderColor: '#e2e8f0' }}
            >
              <span className="text-muted small d-block mb-1" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Complete Package Deal Price:
              </span>
              <div className="d-flex align-items-baseline gap-3 flex-wrap">
                <span className="fw-extrabold font-monospace text-dark" style={{ fontSize: '2rem', color: '#c2410c' }}>
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
            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
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
                <span className="fw-bold px-3 text-dark font-monospace" style={{ fontSize: '1rem' }}>
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
                className="btn btn-primary rounded-pill py-3 px-4 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  border: 'none',
                  fontSize: '0.96rem',
                }}
              >
                <i className={`fas ${added ? 'fa-check' : 'fa-shopping-bag'}`} />
                <span>{added ? 'Added to Cart!' : `Add Complete Package to Cart (Rs. ${(dealPrice * quantity).toLocaleString()})`}</span>
              </button>
            </div>

            {/* WhatsApp 1-Click Order Button */}
            <a
              href={getWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success rounded-pill py-3 px-4 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm text-decoration-none mb-4"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none',
                fontSize: '0.94rem',
              }}
            >
              <i className="fab fa-whatsapp fs-5" />
              <span>1-Click WhatsApp Order (Pre-filled Bundle Details)</span>
            </a>

            {/* ── Included Items Detailed Breakdown ────────────────────── */}
            <div className="card border rounded-4 overflow-hidden bg-white shadow-xs mb-4">
              <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                  📦 ITEMS INCLUDED IN THIS PACKAGE ({products.length} PRODUCTS)
                </span>
                <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                  100% Genuine Auto Parts
                </span>
              </div>

              <div className="list-group list-group-flush">
                {products.map((item, idx) => (
                  <div
                    key={item.productId || idx}
                    className="list-group-item p-3 d-flex align-items-center gap-3 border-0 border-bottom"
                  >
                    {/* Item Thumbnail */}
                    <div
                      className="position-relative rounded-2 overflow-hidden bg-light border flex-shrink-0"
                      style={{ width: '54px', height: '54px' }}
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
                      <h6 className="fw-bold text-dark mb-0.5 text-truncate leading-normal py-0.5" style={{ fontSize: '0.86rem' }}>
                        {item.name}
                      </h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ color: '#c2410c', fontSize: '0.82rem' }}>
                          Rs. {item.offerPrice.toLocaleString()}
                        </span>
                        {item.originalPrice > item.offerPrice && (
                          <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.74rem' }}>
                            Rs. {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Individual Product Link */}
                    {item.slug && (
                      <Link
                        href={`/product/${item.slug}`}
                        className="btn btn-xs btn-outline-secondary rounded-pill px-2.5 py-1 text-decoration-none small fw-semibold flex-shrink-0"
                        style={{ fontSize: '0.72rem' }}
                      >
                        View Item <i className="fas fa-external-link-alt ms-1" style={{ fontSize: '0.62rem' }} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
