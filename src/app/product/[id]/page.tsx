import React, { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCachedProduct, getCachedSiteInfo } from '@/lib/cache';
import {
  generateProductMetadata,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  getStaticSiteUrl,
} from '@/lib/productSeo';
import { ProductBreadcrumb } from '@/components/product/ProductBreadcrumb';
import { ProductDetailInteractive } from '@/components/product/ProductDetailInteractive';
import { BundleDetailInteractive } from '@/components/product/BundleDetailInteractive';
import {
  RelatedProductsSection,
  RelatedProductsSkeleton,
} from '@/components/product/RelatedProductsSection';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return generateProductMetadata(id);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getCachedProduct(id);
  if (!product) return notFound();

  // If requested by raw Mongo ID but product has a clean keyword slug, 308 redirect to the canonical slug
  if (product.slug && id !== product.slug && !product.isBundle) {
    permanentRedirect(`/product/${product.slug}`);
  }

  const siteInfo = await getCachedSiteInfo();
  let siteUrl = getStaticSiteUrl();
  let siteLogoText = 'Pak-o-Drive';

  if (siteInfo) {
    if (siteInfo.website) {
      const ws = siteInfo.website as string;
      siteUrl = ws.startsWith('http') ? ws : `https://${ws}`;
    }
    if (siteInfo.logoText) {
      siteLogoText = siteInfo.logoText as string;
    }
  }

  const productSchema = buildProductJsonLd(product, siteUrl, siteLogoText);
  const breadcrumbSchema = buildBreadcrumbJsonLd(product, siteUrl);

  return (
    <>
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
        {/* Presentational Breadcrumb */}
        <ProductBreadcrumb category={product.category} productName={product.name} />

        {/* Main Product Container */}
        <div style={{ maxWidth: '1100px', margin: '12px auto 0', padding: '0' }}>
          {/* Interactive Card containing gallery, options, actions, specs */}
          <div className="pd-card">
            {(product as any).isBundle ? (
              <BundleDetailInteractive product={product} campaignOffer={(product as any).campaignOffer} />
            ) : (
              <ProductDetailInteractive product={product} />
            )}
          </div>

          {/* Streamed Related Products Section with Skeleton fallback */}
          {!(product as any).isBundle && (
            <Suspense fallback={<RelatedProductsSkeleton />}>
              <RelatedProductsSection category={product.category} excludeId={product._id} />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
