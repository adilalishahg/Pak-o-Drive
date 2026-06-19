'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (min: number, max: number) => void;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  onReset: () => void;
}

const DEFAULT_CATEGORIES = [
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Chargers & Cables', slug: 'chargers' },
  { name: 'Automotive Electronics', slug: 'automotive' },
  { name: 'Smartwatches', slug: 'smartwatches' },
  { name: 'Mobile Accessories', slug: 'accessories' },
];

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  onReset,
}) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategories(json.data.map((c: any) => ({ name: c.name, slug: c.slug })));
        }
      } catch (err) {
        console.error('Error fetching sidebar categories:', err);
      }
    }
    loadCategories();
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMaxPrice(val);
    onPriceRangeChange(0, val);
  };

  return (
    <div className="font-sans">
      {/* Reset Button (Custom extension, styled like categories item) */}
      <div className="mb-4">
        <button
          onClick={onReset}
          className="btn btn-primary rounded-pill py-2 px-4 w-100 border-0"
        >
          <i className="fas fa-sync-alt me-2"></i> Reset Filters
        </button>
      </div>

      {/* Product Categories */}
      <div className="product-categories mb-4">
        <h4>Products Categories</h4>
        <ul className="list-unstyled">
          <li>
            <div className="categories-item">
              <button
                onClick={() => onSelectCategory(null)}
                className={`btn btn-link p-0 text-start text-decoration-none w-100 ${
                  selectedCategory === null ? 'text-primary font-weight-bold' : 'text-dark'
                }`}
              >
                <i className="fas fa-apple-alt text-secondary me-2"></i> All Products
              </button>
            </div>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <div className="categories-item">
                <button
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`btn btn-link p-0 text-start text-decoration-none w-100 ${
                    selectedCategory === cat.slug ? 'text-primary font-weight-bold' : 'text-dark'
                  }`}
                >
                  <i className="fas fa-apple-alt text-secondary me-2"></i> {cat.name}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Slider */}
      <div className="price mb-4">
        <h4 className="mb-2">Price Max</h4>
        <input
          type="range"
          className="form-range w-100"
          id="rangeInput"
          min="500"
          max="150000"
          step="500"
          value={maxPrice}
          onChange={handlePriceChange}
        />
        <div className="d-flex justify-content-between mt-1 text-dark small font-weight-bold">
          <span>PKR 0</span>
          <span>PKR {maxPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Select By Color (Static from backup layout) */}
      <div className="product-color mb-3">
        <h4>Select By Color</h4>
        <ul className="list-unstyled">
          <li>
            <div className="product-color-item">
              <a href="#" className="text-dark text-decoration-none">
                <i className="fas fa-apple-alt text-secondary me-2"></i> Black
              </a>
            </div>
          </li>
          <li>
            <div className="product-color-item">
              <a href="#" className="text-dark text-decoration-none">
                <i className="fas fa-apple-alt text-secondary me-2"></i> White
              </a>
            </div>
          </li>
          <li>
            <div className="product-color-item">
              <a href="#" className="text-dark text-decoration-none">
                <i className="fas fa-apple-alt text-secondary me-2"></i> Silver
              </a>
            </div>
          </li>
        </ul>
      </div>

      {/* Sidebar Featured Products banner link (Static from backup layout) */}
      <div className="mb-4">
        <div className="position-relative overflow-hidden rounded" style={{ height: '220px' }}>
          <Image
            src="/img/product-banner-2.jpg"
            alt="Promo Banner"
            fill
            className="object-cover"
          />
          <div
            className="text-center position-absolute d-flex flex-column align-items-center justify-content-center rounded p-4"
            style={{ width: '100%', height: '100%', top: 0, right: 0, background: 'rgba(242, 139, 0, 0.3)' }}
          >
            <h5 className="display-6 text-primary font-weight-bold">SALE</h5>
            <h4 className="text-secondary font-weight-bold">Get Up To 50% Off</h4>
            <Link href="/shop" className="btn btn-primary rounded-pill px-4 border-0">
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Product Tags (Static from backup layout) */}
      <div className="product-tags py-2">
        <h4 className="mb-3">PRODUCT TAGS</h4>
        <div className="product-tags-items bg-light rounded p-3 d-flex flex-wrap gap-2">
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            New
          </Link>
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            brand
          </Link>
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            black
          </Link>
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            white
          </Link>
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            headphones
          </Link>
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            chargers
          </Link>
          <Link href="/shop" className="border rounded py-1 px-2 mb-2 text-decoration-none text-dark bg-white small">
            automotive
          </Link>
        </div>
      </div>
    </div>
  );
};
