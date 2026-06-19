'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CategorySidebar } from '../../components/product/CategorySidebar';
import { ProductCard } from '../../components/product/ProductCard';
import { IProduct } from '../../types';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || null;
  const initialSearch = searchParams.get('search') || null;

  // Filter States
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string | null>(initialSearch);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 150000 });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('default');
  const [keywords, setKeywords] = useState('');

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || null);
    setSearchQuery(searchParams.get('search') || null);
  }, [searchParams]);

  // Fetch products whenever filters modify
  useEffect(() => {
    async function fetchFiltered() {
      try {
        setLoading(true);
        let url = `/api/products?`;
        
        if (selectedCategory) {
          url += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        if (priceRange.min > 0) {
          url += `minPrice=${priceRange.min}&`;
        }
        if (priceRange.max < 150000) {
          url += `maxPrice=${priceRange.max}&`;
        }
        if (selectedRating) {
          url += `rating=${selectedRating}&`;
        }

        if (url.endsWith('&') || url.endsWith('?')) {
          url = url.slice(0, -1);
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiltered();
  }, [selectedCategory, searchQuery, priceRange, selectedRating]);

  // Reset Filters handler
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery(null);
    setPriceRange({ min: 0, max: 150000 });
    setSelectedRating(null);
    setSortBy('default');
    setKeywords('');
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(keywords.trim() || null);
  };

  // Client-side sorting logic
  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortBy === 'price-asc') {
      return sorted.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return sorted.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating-desc') {
      return sorted.sort((a, b) => b.rating - a.rating);
    }
    return sorted;
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="bg-white">
      {/* Premium Breadcrumb & Title Section */}
      <div className="container mt-4 mb-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent p-0 m-0 small" style={{ fontSize: '0.82rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" className="text-muted text-decoration-none fw-medium">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
              Shop
            </li>
          </ol>
        </nav>
        <div className="d-flex align-items-center justify-content-between mt-2.5 pb-2 border-bottom">
          <h2 className="fw-extrabold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>Explore Products</h2>
          <span className="text-muted small fw-medium">{sortedProducts.length} items found</span>
        </div>
      </div>

      {/* Shop Page Start */}
      <div className="container-fluid shop pb-5">
        <div className="container py-4">
          <div className="row g-4">
            {/* Left Sidebar column (col-lg-3) */}
            <div className="col-lg-3 wow fadeInUp" data-wow-delay="0.1s">
              <CategorySidebar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
                selectedRating={selectedRating}
                onSelectRating={setSelectedRating}
                onReset={handleResetFilters}
              />
            </div>

            {/* Right Products column (col-lg-9) */}
            <div className="col-lg-9 wow fadeInUp" data-wow-delay="0.1s">
              {/* Product banner promo header */}
              <div className="rounded mb-4 position-relative overflow-hidden" style={{ height: '250px' }}>
                <Image
                  src="/img/product-banner-3.jpg"
                  fill
                  sizes="(max-width: 992px) 100vw, 75vw"
                  className="rounded object-cover"
                  alt="Shop Banner"
                  priority
                />
                <div
                  className="position-absolute rounded d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ width: '100%', height: '250px', top: 0, left: 0, background: 'rgba(242, 139, 0, 0.3)' }}
                >
                  <h4 className="display-5 text-primary font-weight-bold">SALE</h4>
                  <h3 className="display-4 text-white mb-4 font-weight-bold">Get Up To 50% Off</h3>
                  <Link href="/shop" className="btn btn-primary rounded-pill px-4 border-0">
                    Shop Now
                  </Link>
                </div>
              </div>

              {/* Filters control bar (Search Input & Sort drop down) */}
              <div className="row g-4 mb-4">
                <div className="col-xl-7">
                  <form onSubmit={handleKeywordSearch} className="input-group w-100 mx-auto d-flex">
                    <input
                      type="search"
                      className="form-control p-3 border-end-0"
                      placeholder="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      style={{ boxShadow: 'none' }}
                    />
                    <button type="submit" className="input-group-text p-3 bg-white border-start-0 text-muted">
                      <i className="fa fa-search"></i>
                    </button>
                  </form>
                </div>
                <div className="col-xl-5 text-end">
                  <div className="bg-light ps-3 py-3 rounded d-flex justify-content-between align-items-center">
                    <label htmlFor="electronics" className="text-dark mb-0 font-weight-bold small">
                      Sort By:
                    </label>
                    <select
                      id="electronics"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border-0 bg-light me-3 form-select-sm"
                      style={{ outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="default">Default Sorting</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Badges */}
              {(selectedCategory || searchQuery || priceRange.max < 150000) && (
                <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-light rounded align-items-center">
                  <span className="small font-weight-bold text-muted me-2 ms-2">Active filters:</span>
                  {selectedCategory && (
                    <span className="badge bg-primary rounded-pill p-2 px-3 d-inline-flex align-items-center">
                      Category: {selectedCategory}{' '}
                      <i className="fas fa-times cursor-pointer ms-2" onClick={() => setSelectedCategory(null)}></i>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="badge bg-primary rounded-pill p-2 px-3 d-inline-flex align-items-center">
                      Search: {searchQuery}{' '}
                      <i className="fas fa-times cursor-pointer ms-2" onClick={() => setSearchQuery(null)}></i>
                    </span>
                  )}
                  {priceRange.max < 150000 && (
                    <span className="badge bg-primary rounded-pill p-2 px-3 d-inline-flex align-items-center">
                      Max Price: PKR {priceRange.max.toLocaleString()}{' '}
                      <i
                        className="fas fa-times cursor-pointer ms-2"
                        onClick={() => setPriceRange({ min: 0, max: 150000 })}
                      ></i>
                    </span>
                  )}
                </div>
              )}

              {/* Products Catalog list */}
              {loading ? (
                <div className="row g-4 justify-content-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h4>No Products Found</h4>
                  <p className="text-muted">Try resetting the filters or keywords search.</p>
                  <button onClick={handleResetFilters} className="btn btn-primary rounded-pill border-0 mt-2 px-4">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="row g-4 product">
                  {sortedProducts.map((prod) => (
                    <div key={prod._id} className="col-md-6 col-lg-4">
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Shop Page End */}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center text-muted font-semibold">
          Loading Shop Page...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
