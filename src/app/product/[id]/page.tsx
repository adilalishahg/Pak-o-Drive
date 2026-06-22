import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { ProductActions } from '../../../components/product/ProductActions';
import { ProductCard } from '../../../components/product/ProductCard';
import { ProductImageGallery } from '../../../components/product/ProductImageGallery';
import { ProductViewLogger } from '../../../components/common/ProductViewLogger';

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await dbConnect();
  const { id } = await params;
  let p: any;
  try { p = await Product.findById(id).lean(); } catch { return { title: 'Product Not Found' }; }
  if (!p) return { title: 'Product Not Found' };
  return {
    title: `${p.name} | Electro`,
    description: String(p.description || '').substring(0, 160),
    openGraph: { title: String(p.name), images: [{ url: String(p.image || '') }] },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  await dbConnect();
  const { id } = await params;
  let productObj: any;
  try { productObj = await Product.findById(id); } catch { return notFound(); }
  if (!productObj) return notFound();

  const product = JSON.parse(JSON.stringify(productObj));
  const relatedObj = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(6);
  const relatedProducts = JSON.parse(JSON.stringify(relatedObj));

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const specs = product.specifications
    ? Object.entries(product.specifications as Record<string, unknown>) : [];

  return (
    <>
      <style>{`
        .pd-detail-page { background: #f4f4f4; min-height: 100vh; }
        .pd-card { background: #fff; }
        @media (max-width: 767px) {
          .pd-detail-right { padding: 14px 14px 20px !important; }
          .pd-detail-title { font-size: 1.1rem !important; }
          .pd-detail-price-num { font-size: 1.5rem !important; }
        }
      `}</style>

      <div className="pd-detail-page">
        <ProductViewLogger id={product._id} name={product.name} category={product.category} price={product.price} />

        {/* ── Breadcrumb ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '8px 0' }}>
          <div className="container-fluid px-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: '0.75rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
                <li className="breadcrumb-item flex-shrink-0">
                  <Link href="/" className="text-decoration-none text-muted">Home</Link>
                </li>
                <li className="breadcrumb-item flex-shrink-0">
                  <Link href="/shop" className="text-decoration-none text-muted">Shop</Link>
                </li>
                <li className="breadcrumb-item flex-shrink-0">
                  <Link href={`/shop?category=${product.category}`}
                    className="text-decoration-none text-muted text-capitalize">
                    {product.category}
                  </Link>
                </li>
                <li className="breadcrumb-item active text-dark fw-semibold"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* ── Main section ── */}
        <div style={{ maxWidth: '1100px', margin: '12px auto 0', padding: '0' }}>

          {/* Top card: image + info */}
          <div className="pd-card">
            <div className="row g-0">

              {/* Image col */}
              <div className="col-12 col-md-5" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <ProductImageGallery image={product.image} images={product.images || []} name={product.name} />
              </div>

              {/* Info col */}
              <div className="col-12 col-md-7">
                <div className="pd-detail-right" style={{ padding: '20px 20px 24px' }}>

                  {/* Category */}
                  <Link href={`/shop?category=${product.category}`} style={{
                    display: 'inline-block', textDecoration: 'none',
                    background: 'rgba(var(--pd-primary-rgb,234,88,12),0.08)',
                    color: 'var(--pd-primary)', fontSize: '0.65rem', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase',
                    letterSpacing: '0.5px', marginBottom: '8px',
                  }}>{product.category}</Link>

                  {/* Name */}
                  <h1 className="pd-detail-title" style={{
                    fontSize: '1.35rem', fontWeight: 800, color: '#111',
                    lineHeight: 1.3, margin: '0 0 10px',
                  }}>{product.name}</h1>

                  {/* Stars + review count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className="fas fa-star" style={{
                          fontSize: '13px',
                          color: i < Math.floor(product.rating) ? '#f59e0b' : '#d1d5db',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {product.rating?.toFixed(1)} · {product.reviewsCount} reviews
                    </span>
                  </div>

                  {/* Price box */}
                  <div style={{
                    background: '#fafafa', border: '1px solid #eee',
                    borderRadius: '8px', padding: '12px 14px', marginBottom: '14px',
                  }}>
                    {product.originalPrice > product.price && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <del style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
                          PKR {product.originalPrice.toLocaleString()}
                        </del>
                        <span style={{
                          background: '#dc2626', color: '#fff',
                          fontSize: '0.62rem', fontWeight: 800,
                          padding: '2px 7px', borderRadius: '3px',
                        }}>-{discountPercent}% OFF</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>PKR</span>
                      <span className="pd-detail-price-num" style={{
                        fontSize: '1.8rem', fontWeight: 900, color: 'var(--pd-primary)', lineHeight: 1,
                      }}>{product.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ fontSize: '0.78rem', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Availability: </span>
                      <span style={{ fontWeight: 700, color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>SKU: </span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>
                        PAK-{product._id?.substring(18).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Shipping: </span>
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>Free above PKR 5,000</span>
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p style={{
                      fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.65,
                      marginBottom: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px',
                    }}>{product.description}</p>
                  )}

                  {/* Actions */}
                  <ProductActions product={product} />

                  {/* Trust row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '8px', marginTop: '16px',
                    paddingTop: '14px', borderTop: '1px solid #f0f0f0',
                  }}>
                    {[
                      { icon: 'fas fa-shield-alt', text: '100% Genuine' },
                      { icon: 'fas fa-undo', text: '30-Day Return' },
                      { icon: 'fas fa-truck', text: 'Fast Delivery' },
                      { icon: 'fas fa-lock', text: 'Secure COD' },
                    ].map((b, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#fafafa', borderRadius: '6px', padding: '8px 10px',
                        border: '1px solid #f0f0f0',
                        fontSize: '0.72rem', color: '#374151', fontWeight: 600,
                      }}>
                        <i className={b.icon} style={{ color: 'var(--pd-primary)', fontSize: '13px', flexShrink: 0 }} />
                        {b.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="pd-card" style={{ marginTop: '8px' }}>
              <div style={{ padding: '16px 16px 20px' }}>
                <h4 style={{
                  fontSize: '0.95rem', fontWeight: 800, color: '#111',
                  marginBottom: '12px', paddingBottom: '8px',
                  borderBottom: '2px solid var(--pd-primary)', display: 'inline-block',
                }}>Technical Specifications</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <tbody>
                      {specs.map(([key, val], i) => (
                        <tr key={key} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                          <td style={{
                            padding: '9px 12px', fontWeight: 700, color: '#374151',
                            width: '45%', borderBottom: '1px solid #f0f0f0',
                          }}>{key}</td>
                          <td style={{ padding: '9px 12px', color: '#6b7280', borderBottom: '1px solid #f0f0f0' }}>
                            {String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pd-card" style={{ marginTop: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '16px 16px 0' }}>
                <h4 style={{
                  fontSize: '0.95rem', fontWeight: 800, color: '#111',
                  marginBottom: '12px', paddingBottom: '8px',
                  borderBottom: '2px solid var(--pd-primary)', display: 'inline-block',
                }}>Related Products</h4>
              </div>
              <div className="row g-0" style={{ borderTop: '1px solid #f0f0f0', borderLeft: '1px solid #f0f0f0' }}>
                {relatedProducts.map((prod: any) => (
                  <div key={prod._id} className="col-6 col-md-4 col-lg-3"
                    style={{ borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
