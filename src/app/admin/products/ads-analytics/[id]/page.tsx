'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSingleProductAds } from '../../../../../hooks/useSingleProductAds';

export default function SingleProductAdIntelligencePage() {
  const params = useParams() as { id: string };
  const productId = params?.id;

  const {
    details,
    loading,
    error,
    activeTab,
    setActiveTab,
    copiedKey,
    copyToClipboard,
    refetch,
  } = useSingleProductAds(productId);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading ad intelligence...</span>
        </div>
        <p className="text-muted fw-semibold">Loading live Pakistan ad intelligence &amp; creative blueprint...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger border-0 rounded-4 shadow-sm p-4">
          <h5 className="fw-bold mb-2">Error Loading Product Ads</h5>
          <p className="mb-3">{error || 'Product ad details not found.'}</p>
          <div className="d-flex gap-2">
            <Link href="/admin/products/ads-analytics" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
              <i className="fas fa-arrow-left me-1" /> Back to Ad Analytics
            </Link>
            <button type="button" onClick={refetch} className="btn btn-sm btn-primary rounded-pill px-3">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <Link href="/admin/products/ads-analytics" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
            <i className="fas fa-arrow-left me-1" /> All Ads Radar
          </Link>
          <h3 className="fw-bold text-dark mb-0 text-truncate" style={{ letterSpacing: '-0.5px', maxWidth: '400px' }}>
            {details.name}
          </h3>
          <span className="badge bg-danger rounded-pill px-2.5 py-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
            {details.activeAdsCountPK} Active Ads in PK
          </span>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <a
            href={details.metaAdLibraryPkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-sm"
            style={{ fontSize: '0.82rem' }}
          >
            <i className="fab fa-facebook" />
            <span>Open Meta Ad Library PK</span>
            <i className="fas fa-external-link-alt ms-1" style={{ fontSize: '0.7rem' }} />
          </a>
          <a
            href={details.tiktokSearchPkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-sm"
            style={{ fontSize: '0.82rem' }}
          >
            <i className="fab fa-tiktok" />
            <span>Open TikTok PK</span>
            <i className="fas fa-external-link-alt ms-1" style={{ fontSize: '0.7rem' }} />
          </a>
        </div>
      </div>

      {/* Product Hero Overview Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 p-md-4 bg-white">
        <div className="row g-4 align-items-center">
          {/* Dual-Layer Uncropped Image (Rule #3) */}
          <div className="col-12 col-md-3 col-lg-2">
            <div
              className="position-relative rounded-3 overflow-hidden d-flex align-items-center justify-content-center bg-light border mx-auto"
              style={{ width: '100%', height: '140px' }}
            >
              {/* Layer 1: Blur */}
              <div
                className="position-absolute w-100 h-100"
                style={{
                  backgroundImage: `url(${details.image || '/img/product-placeholder.png'})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  filter: 'blur(16px)',
                  opacity: 0.35,
                  transform: 'scale(1.2)',
                }}
              />
              {/* Layer 2: Contain */}
              <div className="position-relative w-100 h-100 p-2 z-1 d-flex align-items-center justify-content-center">
                <Image
                  src={details.image || '/img/product-placeholder.png'}
                  alt={details.name}
                  fill
                  sizes="160px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>

          {/* Core Info & Sales Metrics */}
          <div className="col-12 col-md-9 col-lg-10">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
              <span className="badge bg-light text-muted border rounded-pill px-2.5 py-0.5">
                {details.category}
              </span>
              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-0.5 fw-semibold">
                🛍️ {details.totalSold} Units Sold
              </span>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0.5 fw-semibold">
                Rs. {details.totalRevenuePKR.toLocaleString()} Tracked Sales
              </span>
              <span className="badge bg-warning bg-opacity-20 text-dark rounded-pill px-2 py-0.5 fw-bold">
                ⚡ Demand Score: {details.demandScore}/100
              </span>
            </div>

            <h4 className="fw-bold text-dark mb-1 leading-normal py-0.5">
              {details.name}
            </h4>

            <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
              <div>
                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>Store Price</span>
                <span className="fw-bold fs-5 text-dark">Rs. {details.price.toLocaleString()}</span>
              </div>
              <div className="vr text-muted" />
              <div>
                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>PK Market Benchmark</span>
                <span className="fw-bold fs-5 text-secondary">Rs. {details.competitorPricePKR.toLocaleString()}</span>
              </div>
              <div className="vr text-muted" />
              <div>
                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>Est. Daily PK Ad Spend</span>
                <span className="fw-bold fs-5 text-danger">~Rs. {details.estimatedDailySpendPKR.toLocaleString()}</span>
              </div>
              <div className="vr text-muted" />
              <div>
                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>Est. Profit Margin</span>
                <span className="fw-bold fs-5 text-success">~Rs. {details.estimatedProfitMarginPKR.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Ad Intelligence Navigator */}
      <div className="d-flex align-items-center gap-1.5 p-1 bg-light rounded-pill border mb-4 flex-wrap" style={{ width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setActiveTab('hooks')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
            activeTab === 'hooks' ? 'btn-dark text-white shadow-sm' : 'text-muted border-0 bg-transparent'
          }`}
          style={{ fontSize: '0.82rem' }}
        >
          🔥 Viral Hooks &amp; Headlines
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('blueprint')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
            activeTab === 'blueprint' ? 'btn-dark text-white shadow-sm' : 'text-muted border-0 bg-transparent'
          }`}
          style={{ fontSize: '0.82rem' }}
        >
          🎬 Video Script &amp; Scenes (9:16)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('competitor')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
            activeTab === 'competitor' ? 'btn-dark text-white shadow-sm' : 'text-muted border-0 bg-transparent'
          }`}
          style={{ fontSize: '0.82rem' }}
        >
          📊 Sourcing &amp; Unit Economics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('targeting')}
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition-all ${
            activeTab === 'targeting' ? 'btn-dark text-white shadow-sm' : 'text-muted border-0 bg-transparent'
          }`}
          style={{ fontSize: '0.82rem' }}
        >
          🎯 Pakistan Ads Targeting
        </button>
      </div>

      {/* Tab 1: Viral Hooks & Headlines */}
      {activeTab === 'hooks' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 py-1 fw-bold small">
                  0-3 SEC VIRAL VERBAL HOOK (URDU)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(details.viralHook.verbalHookUrdu, 'hook_urdu')}
                  className="btn btn-sm btn-light border py-1 px-2.5 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className={`fas ${copiedKey === 'hook_urdu' ? 'fa-check text-success' : 'fa-copy'}`} />
                  <span>{copiedKey === 'hook_urdu' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <blockquote className="p-3 bg-light rounded-3 border-start border-4 border-danger mb-3">
                <p className="fw-bold text-dark mb-0 fs-6 leading-normal py-0.5">
                  &ldquo;{details.viralHook.verbalHookUrdu}&rdquo;
                </p>
              </blockquote>

              <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
                <b>Psychological Style:</b> {details.viralHook.hookStyle}.
                Yeh hook TikTok aur Instagram Reels par Pakistani users ko scroll roknay par majboor karta hai.
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-1 fw-bold small">
                  TEXT ON SCREEN (OVERLAY HEADLINE)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(details.viralHook.textOnScreen, 'hook_text')}
                  className="btn btn-sm btn-light border py-1 px-2.5 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className={`fas ${copiedKey === 'hook_text' ? 'fa-check text-success' : 'fa-copy'}`} />
                  <span>{copiedKey === 'hook_text' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-3 mb-3 text-center bg-dark text-white font-monospace fw-bold fs-5">
                {details.viralHook.textOnScreen}
              </div>

              <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
                Pehelay 3 seconds mein video ke top par barri bold font (yellow / white with black outline) mein yeh text display karein.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Video Production Script & Scene Breakdown */}
      {activeTab === 'blueprint' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div>
              <h5 className="fw-bold text-dark mb-1">15-25 Second High-Converting Video Blueprint</h5>
              <p className="text-muted small mb-0">Shot on smartphone camera for authentic UGC look</p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(details.voiceoverScriptUrdu, 'full_script')}
              className="btn btn-sm btn-outline-dark rounded-pill px-3 d-flex align-items-center gap-1.5"
            >
              <i className={`fas ${copiedKey === 'full_script' ? 'fa-check text-success' : 'fa-copy'}`} />
              <span>{copiedKey === 'full_script' ? 'Script Copied!' : 'Copy Full Urdu Script'}</span>
            </button>
          </div>

          {/* Full Voiceover Script Box */}
          <div className="p-3 bg-light rounded-3 mb-4 border">
            <span className="small text-muted fw-bold d-block mb-1">🎙️ COMPLETE URDU VOICEOVER SCRIPT:</span>
            <p className="mb-0 text-dark font-monospace small leading-normal py-0.5">
              {details.voiceoverScriptUrdu}
            </p>
          </div>

          {/* Scene Breakdown Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-3">
              <thead className="table-light">
                <tr className="small text-muted text-uppercase">
                  <th style={{ width: '120px' }}>Timing</th>
                  <th style={{ width: '220px' }}>Camera Angle</th>
                  <th>Visual Shot Action</th>
                  <th>Audio Voiceover Line</th>
                </tr>
              </thead>
              <tbody>
                {details.videoProductionGuide.sceneBreakdown.map((scene, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="badge bg-dark text-white rounded-pill px-2.5 py-1 font-monospace" style={{ fontSize: '0.75rem' }}>
                        {scene.timeSeconds}
                      </span>
                    </td>
                    <td className="small fw-semibold text-secondary">
                      {scene.cameraAngle}
                    </td>
                    <td className="small text-dark">
                      {scene.visualShot}
                    </td>
                    <td className="small font-monospace text-primary">
                      &ldquo;{scene.audioVoiceover}&rdquo;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shooting Tips */}
          <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 text-dark small">
            <i className="fas fa-lightbulb text-warning me-1.5" />
            <b>Pro Shooting Tip for Pakistan:</b> {details.videoProductionGuide.shootingTipsUrdu}
          </div>
        </div>
      )}

      {/* Tab 3: Unit Economics & Sourcing */}
      {activeTab === 'competitor' && (
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Est. Sourcing Cost (Wholesale)</h6>
              <h2 className="fw-bold text-dark mb-1">Rs. {details.estimatedSourcingCostPKR.toLocaleString()}</h2>
              <span className="small text-muted">Estimated wholesale price from Shah Alam / Saddar / Hall Road</span>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Suggested Selling Price</h6>
              <h2 className="fw-bold text-primary mb-1">Rs. {details.price.toLocaleString()}</h2>
              <span className="small text-muted">Your store price with Cash on Delivery</span>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Estimated Net Profit / Order</h6>
              <h2 className="fw-bold text-success mb-1">Rs. {details.estimatedProfitMarginPKR.toLocaleString()}</h2>
              <span className="small text-muted">After sourcing cost &amp; ~Rs. 350 courier delivery</span>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-2">Competitor Ad Angle &amp; Strategy</h6>
              <p className="text-muted small mb-0">
                {details.topAdAngle}. Pakistani competitors are focusing on quick delivery, unboxing trust, and showing problem-solving features directly on camera.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audience Targeting Keywords */}
      {activeTab === 'targeting' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-2">Recommended Ad Targeting for Meta &amp; TikTok (Pakistan)</h5>
          <p className="text-muted small mb-3">
            Copy these keywords directly into Meta Ads Manager or TikTok Ads Manager when creating campaign ad sets:
          </p>

          <div className="d-flex flex-wrap gap-2 mb-4">
            {details.adTargetingKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="badge bg-light text-dark border rounded-pill px-3 py-2 font-monospace fs-6"
                style={{ cursor: 'pointer' }}
                onClick={() => copyToClipboard(kw, `kw_${idx}`)}
                title="Click to copy keyword"
              >
                {kw} {copiedKey === `kw_${idx}` && <i className="fas fa-check text-success ms-1" />}
              </span>
            ))}
          </div>

          <div className="p-3 bg-light rounded-3 small text-muted">
            <i className="fas fa-info-circle text-primary me-1.5" />
            <b>Geographic Delivery Targeting:</b> Punjab (Lahore, Rawalpindi, Faisalabad, Multan), Sindh (Karachi, Hyderabad), KPK (Peshawar), Islamabad Capital Territory.
          </div>
        </div>
      )}
    </div>
  );
}
