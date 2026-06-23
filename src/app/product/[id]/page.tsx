import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { ProductCard } from '../../../components/product/ProductCard';
import { ProductDetailInteractive } from '../../../components/product/ProductDetailInteractive';

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

          {/* Interactive Card containing gallery, options, actions, specs */}
          <div className="pd-card">
            <ProductDetailInteractive product={product} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pd-card" style={{ marginTop: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '16px 16px 8px' }}>
                <h4 style={{
                  fontSize: '0.95rem', fontWeight: 800, color: '#111',
                  marginBottom: '12px', paddingBottom: '8px',
                  borderBottom: '2px solid var(--pd-primary)', display: 'inline-block',
                }}>Related Products</h4>
              </div>
              <div className="row g-2 g-md-3" style={{ padding: '0 12px 16px' }}>
                {relatedProducts.map((prod: any) => (
                  <div key={prod._id} className="col-6 col-md-4 col-lg-3">
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
