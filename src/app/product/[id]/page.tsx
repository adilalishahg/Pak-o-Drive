import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductCard } from '../../../components/product/ProductCard';
import { ProductDetailInteractive } from '../../../components/product/ProductDetailInteractive';
import { getCachedProduct, getCachedRelatedProducts, getCachedSiteInfo } from '../../../lib/cache';

export const instant = true;

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const p = await getCachedProduct(id);
  if (!p) return { title: 'Product Not Found' };

  let siteLogoText = 'PAKODRIVE';
  let siteUrl = 'https://pakodrive.com';
  const siteInfo = await getCachedSiteInfo();
  if (siteInfo) {
    if (siteInfo.logoText) {
      siteLogoText = siteInfo.logoText as string;
    }
    if (siteInfo.website) {
      const ws = siteInfo.website as string;
      siteUrl = ws.startsWith('http') ? ws : `https://${ws}`;
    }
  }

  const metaTitle = p.seoTitle || `${p.name} | ${siteLogoText}`;
  const metaDesc = p.seoDescription || String(p.description || '').substring(0, 160);
  const keywords = p.seoKeywords ? p.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : undefined;
  const productUrl = `${siteUrl}/product/${id}`;
  const imageUrl = p.image
    ? (p.image.startsWith('http') ? p.image : `${siteUrl}${p.image}`)
    : '';

  return {
    title: metaTitle,
    description: metaDesc,
    keywords,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: productUrl,
      type: 'website',
      images: [{ url: imageUrl, alt: p.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#f4f4f4', padding: '100px 20px' }} className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading product...</span>
          </div>
        </div>
      }
    >
      {params.then(({ id }) => (
        <ProductDetailContent id={id} />
      ))}
    </Suspense>
  );
}

async function ProductDetailContent({ id }: { id: string }) {
  const product = await getCachedProduct(id);
  if (!product) return notFound();

  const relatedProducts = await getCachedRelatedProducts(product.category, product._id);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const specs = product.specifications
    ? Object.entries(product.specifications as Record<string, unknown>) : [];

  let siteUrl = 'https://pakodrive.com';
  let siteLogoText = 'PAKODRIVE';
  const siteInfo = await getCachedSiteInfo();
  if (siteInfo) {
    if (siteInfo.website) {
      const ws = siteInfo.website as string;
      siteUrl = ws.startsWith('http') ? ws : `https://${ws}`;
    }
    if (siteInfo.logoText) {
      siteLogoText = siteInfo.logoText as string;
    }
  }

  const productUrl = `${siteUrl}/product/${product._id}`;
  const brandName = product.specifications?.Brand || siteLogoText || 'PAKODRIVE';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images && product.images.length > 0
      ? product.images.map((img: string) => img.startsWith('http') ? img : `${siteUrl}${img}`)
      : [product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`],
    description: product.description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock !== 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    aggregateRating: product.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5,
      reviewCount: product.reviewsCount,
    } : undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `${siteUrl}/shop?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  const mainProductImg = product.image ? (product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`) : '';

  const productPreloadUrls: string[] = [];
  if (mainProductImg) {
    if (mainProductImg.includes('res.cloudinary.com')) {
      const uploadIndex = mainProductImg.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const prefix = mainProductImg.substring(0, uploadIndex + 8);
        let suffix = mainProductImg.substring(uploadIndex + 8);
        suffix = suffix.replace(/^(?:[a-z_]+[,/])*(?:v\d+\/)?/, (match) => {
          const versionMatch = match.match(/(v\d+\/)/);
          return versionMatch ? versionMatch[1] : '';
        });
        productPreloadUrls.push(`${prefix}f_auto,q_70,w_390,c_limit/${suffix}`);
        productPreloadUrls.push(`${prefix}f_auto,q_70,w_640,c_limit/${suffix}`);
      }
    } else {
      productPreloadUrls.push(`/_next/image?url=${encodeURIComponent(mainProductImg)}&w=390&q=75`);
      productPreloadUrls.push(`/_next/image?url=${encodeURIComponent(mainProductImg)}&w=640&q=75`);
    }
  }

  return (
    <>
      {productPreloadUrls.map((url, i) => (
        <link key={i} rel="preload" as="image" href={url} fetchPriority="high" />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
                <h2 style={{
                  fontSize: '0.95rem', fontWeight: 800, color: '#111',
                  marginBottom: '12px', paddingBottom: '8px',
                  borderBottom: '2px solid var(--pd-primary)', display: 'inline-block',
                }}>Related Products</h2>
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
