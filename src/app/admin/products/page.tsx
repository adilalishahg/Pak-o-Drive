'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductData {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  stock: number;
  image: string;
  rating: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        throw new Error(json.error || 'Failed to load products');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading products database.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setProducts(products.filter((p) => p._id !== id));
      } else {
        alert(json.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error, could not delete product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'All' || p.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading && products.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 576px) {
          .admin-filter-input {
            max-width: 100% !important;
          }
        }
      `}} />
      {/* Search & Actions Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-8 d-flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control rounded-pill px-3 admin-filter-input"
              style={{ maxWidth: '280px' }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select rounded-pill px-3 admin-filter-input"
              style={{ maxWidth: '200px' }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {filterCategory !== 'All' || searchQuery ? (
              <button
                onClick={() => {
                  setFilterCategory('All');
                  setSearchQuery('');
                }}
                className="btn btn-light rounded-pill px-3 btn-sm border"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="col-12 col-md-4 text-start text-md-end">
            <Link href="/admin/products/new" className="btn btn-gradient rounded-pill px-4 border-0">
              <i className="fas fa-plus me-1.5" /> Add New Product
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Products Table Card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small uppercase">
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Product Name</th>
                <th className="d-none d-sm-table-cell">Category</th>
                <th>Price</th>
                <th className="d-none d-md-table-cell">Stock Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-5 text-muted">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div
                        className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative"
                        style={{ width: '56px', height: '56px', border: '1px solid #f1f5f9' }}
                      >
                        <Image
                          src={failedImages[product._id] ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100' : (product.image || '/img/product-placeholder.png')}
                          alt={product.name}
                          fill
                          sizes="56px"
                          style={{ objectFit: 'contain', padding: '4px' }}
                          onError={() => {
                            setFailedImages((prev) => ({ ...prev, [product._id]: true }));
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-1 text-truncate" style={{ maxWidth: '240px' }}>
                        {product.name}
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-1.5">
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          ID: {product._id.substring(product._id.length - 8).toUpperCase()}
                        </span>
                        <span className="d-sm-none badge bg-light text-muted border text-capitalize" style={{ fontSize: '0.7rem' }}>
                          {product.category}
                        </span>
                        {product.stock <= 0 ? (
                          <span className="d-md-none badge bg-danger rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>Out of Stock</span>
                        ) : product.stock <= 5 ? (
                          <span className="d-md-none badge bg-warning text-dark rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                            Low ({product.stock})
                          </span>
                        ) : (
                          <span className="d-md-none badge bg-success rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                            In Stock ({product.stock})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-capitalize d-none d-sm-table-cell">{product.category}</td>
                    <td>
                      <div className="fw-bold text-dark">PKR {product.price.toLocaleString()}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-decoration-line-through text-muted small">
                          PKR {product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {product.stock <= 0 ? (
                        <span className="badge bg-danger rounded-pill px-2.5 py-1">Out of Stock</span>
                      ) : product.stock <= 5 ? (
                        <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1">
                          Low Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="badge bg-success rounded-pill px-2.5 py-1">
                          In Stock ({product.stock})
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit"
                        >
                          <i className="fas fa-edit small" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center border-0"
                          style={{ width: '32px', height: '32px' }}
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
