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

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  await dbConnect();
  const { id } = await params;

  let productObj;
  try {
    productObj = await Product.findById(id).lean();
  } catch (error) {
    return { title: 'Product Not Found | PAKODRIVE' };
  }

  if (!productObj) {
    return { title: 'Product Not Found | PAKODRIVE' };
  }

  const name = String(productObj.name || 'Product');
  const description = String(productObj.description || 'Shop premium electronics at PAKODRIVE.');
  const category = String(productObj.category || 'electronics');
  const image = String(productObj.image || '/img/product-placeholder.png');

  return {
    title: `${name} — Buy Online in Pakistan | PAKODRIVE`,
    description: `${description.substring(0, 160)}... Buy premium ${category} at PAKODRIVE with Free Shipping & COD.`,
    openGraph: {
      title: name,
      description: description.substring(0, 160),
      images: [{ url: image }],
      type: 'article',
      url: `https://pakodrive.com/product/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: description.substring(0, 160),
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  await dbConnect();
  const { id } = await params;

  let productObj;
  try {
    productObj = await Product.findById(id);
  } catch (error) {
    console.error('Invalid product ID parsed:', error);
    return notFound();
  }

  if (!productObj) {
    return notFound();
  }

  const product = JSON.parse(JSON.stringify(productObj));

  // Fetch up to 4 related products in the same category
  const relatedObj = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  const relatedProducts = JSON.parse(JSON.stringify(relatedObj));

  const renderStars = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<i key={i} className="fas fa-star text-secondary"></i>);
      } else {
        stars.push(<i key={i} className="fas fa-star text-muted"></i>);
      }
    }
    return stars;
  };

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // JSON-LD Structured Data Schema for Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    sku: `PAK-${product._id?.substring(18).toUpperCase() || 'SKU'}`,
    brand: {
      '@type': 'Brand',
      name: product.specifications?.Brand || 'PAKODRIVE',
    },
    offers: {
      '@type': 'Offer',
      url: `https://pakodrive.com/product/${product._id}`,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: '2029-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5.0,
      reviewCount: product.reviewsCount || 1,
    }
  };

  return (
    <div className="bg-white">
      {/* Schema Rich Snippet Tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewLogger id={product._id} name={product.name} category={product.category} price={product.price} />
      
      {/* Premium Breadcrumb Section */}
      <div className="container mt-4 mb-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent p-0 m-0 small" style={{ fontSize: '0.82rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" className="text-muted text-decoration-none fw-medium">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/shop" className="text-muted text-decoration-none fw-medium">
                Shop
              </Link>
            </li>
            <li className="breadcrumb-item text-capitalize">
              <Link href={`/shop?category=${product.category}`} className="text-muted text-decoration-none fw-medium">
                {product.category}
              </Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-semibold text-truncate" aria-current="page" style={{ maxWidth: '280px' }}>
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content Layout */}
      <div className="container py-4">
        <div className="row g-5">
          {/* Left Column: Image Gallery Slider & Magnifier */}
          <div className="col-12 col-lg-6">
            <ProductImageGallery 
              image={product.image} 
              images={product.images || []} 
              name={product.name} 
            />
          </div>

          {/* Right Column: Product Meta and Options */}
          <div className="col-12 col-lg-6">
            <div className="ps-lg-3">
              <span className="badge bg-light text-primary text-uppercase px-2.5 py-1.5 fw-semibold mb-3 border border-primary-subtle text-capitalize">
                {product.category}
              </span>
              
              <h2 className="fw-bold text-dark mb-3 lh-sm" style={{ fontSize: '2rem', letterSpacing: '-0.5px' }}>
                {product.name}
              </h2>

              <div className="d-flex align-items-center mb-4 gap-1">
                <div className="d-flex text-warning gap-0.5">
                  {renderStars(product.rating)}
                </div>
                <span className="text-muted small ms-2">({product.reviewsCount} verified customer reviews)</span>
              </div>

              <div className="p-3 bg-light rounded-3 mb-4 border d-inline-flex flex-column gap-1 min-w-200">
                {product.originalPrice > product.price && (
                  <div className="d-flex align-items-center gap-2">
                    <del className="text-muted fs-6">PKR {product.originalPrice.toLocaleString()}</del>
                    <span className="badge bg-danger rounded-pill px-2 py-0.5" style={{ fontSize: '0.75rem' }}>
                      Save {discountPercent}%
                    </span>
                  </div>
                )}
                <div className="d-flex align-items-baseline gap-1.5">
                  <span className="text-muted small fw-semibold">PKR</span>
                  <span className="fs-3 fw-extrabold text-primary">
                    {product.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-column gap-1 mb-4 text-muted small fw-medium">
                <div>Availability: <span className={product.stock > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                  {product.stock > 0 ? `In Stock (${product.stock} items)` : 'Out of Stock'}
                </span></div>
                <div>SKU: <span className="text-dark">PAK-{product._id?.substring(18).toUpperCase() || 'N/A'}</span></div>
                <div>Shipping: <span className="text-success">Free Delivery</span> above PKR 5,000</div>
              </div>

              <hr className="my-4 text-secondary-subtle" />

              <p className="mb-4 leading-relaxed text-secondary" style={{ fontSize: '0.95rem' }}>
                {product.description}
              </p>

              <hr className="my-4 text-secondary-subtle" />

              <ProductActions product={product} />
            </div>
          </div>
        </div>

        {/* Specifications Tab sheet */}
        <div className="row mt-5">
          <div className="col-12">
            <h4 className="fw-bold text-dark border-bottom pb-2.5 mb-4">Technical Specifications</h4>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden max-w-xl">
                <table className="table table-striped table-hover align-middle mb-0 border">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td className="fw-bold text-dark w-40 ps-4 py-3" style={{ fontSize: '0.9rem' }}>{key}</td>
                        <td className="text-secondary py-3" style={{ fontSize: '0.9rem' }}>{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No technical specifications provided for this product.</p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="container-fluid related-product py-5 bg-light border-top mt-5">
          <div className="container">
            <div className="text-center pb-4">
              <h4 className="fw-bold text-dark mb-2">Related Products</h4>
              <p className="text-muted small">Explore other electronics in the same collection.</p>
            </div>
            <div className="row g-4 product justify-content-center">
              {relatedProducts.map((prod: any) => (
                <div key={prod._id} className="col-12 col-md-6 col-lg-3">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
