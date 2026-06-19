'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const formattedId = product._id ? product._id.toString() : '';

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 900);
  };

  const handleCardClick = () => {
    router.push(`/product/${formattedId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < Math.floor(rating) ? 'text-warning' : 'text-muted'}`}
        style={{ fontSize: '11px' }}
      />
    ));
  };

  return (
    <article
      className="product-item rounded bg-white overflow-hidden d-flex flex-column h-100"
      onClick={handleCardClick}
      style={{
        border: '1px solid #f1f5f9',
        boxShadow: 'var(--pd-card-shadow)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />
      <meta itemProp="description" content={`${product.name} - ${product.category}`} />

      {/* Image Container */}
      <div className="position-relative overflow-hidden bg-light" style={{ height: '220px' }}>
        <div className="w-100 h-100 position-relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="product-card-img"
            style={{ objectFit: 'contain', padding: '20px', transition: 'transform 0.4s ease' }}
            itemProp="image"
          />
        </div>

        {/* Badges */}
        {product.isNewArrival && (
          <span className="badge bg-danger position-absolute px-2.5 py-1.5 fw-bold rounded-pill" style={{ top: '12px', left: '12px', fontSize: '0.7rem', zIndex: 2 }}>
            New
          </span>
        )}
        {!product.isNewArrival && discountPercent > 0 && (
          <span className="badge bg-primary position-absolute px-2.5 py-1.5 fw-bold rounded-pill" style={{ top: '12px', left: '12px', fontSize: '0.7rem', zIndex: 2 }}>
            -{discountPercent}%
          </span>
        )}

        {/* Hover Quick Actions */}
        <div className="product-quick-actions position-absolute d-flex flex-column gap-2 opacity-0" style={{ top: '12px', right: '12px', transition: 'opacity 0.25s ease', zIndex: 2 }}>
          <span
            className="btn btn-sm btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center bg-white border border-light"
            style={{ width: '36px', height: '36px', transition: 'all 0.2s ease' }}
            title="View Details"
          >
            <i className="fa fa-eye text-secondary" style={{ fontSize: '13px' }} />
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 d-flex flex-column flex-grow-1 text-center justify-content-between">
        <div>
          <Link
            href={`/shop?category=${product.category}`}
            onClick={(e) => e.stopPropagation()}
            className="d-block text-uppercase text-muted fw-bold mb-1 text-truncate text-decoration-none"
            style={{ fontSize: '0.65rem', letterSpacing: '1.2px' }}
          >
            {product.category}
          </Link>
          <span
            className="d-block text-dark text-decoration-none fw-semibold mb-2"
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '42px',
            }}
          >
            {product.name}
          </span>
          
          <div className="d-flex justify-content-center align-items-center gap-1 mb-2">
            <div className="d-flex gap-0.5">
              {renderStars(product.rating)}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '2px' }}>
              ({product.rating?.toFixed(1)})
            </span>
          </div>
        </div>

        <div>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            {product.originalPrice > product.price && (
              <del style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                PKR {product.originalPrice.toLocaleString()}
              </del>
            )}
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--pd-primary)' }}>
              PKR {product.price.toLocaleString()}
            </span>
          </div>

          {/* Action button */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="btn btn-gradient w-100 py-2.5 px-3 fw-semibold rounded-pill text-white border-0 shadow-sm"
            style={{ fontSize: '0.85rem' }}
          >
            <i className={`fas ${adding ? 'fa-check' : 'fa-shopping-cart'} me-2`} />
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};
