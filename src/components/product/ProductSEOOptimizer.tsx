'use client';

import React from 'react';
import { ProductSEOOptimizerProps } from '@/types/product';
import { useProductSeoOptimizer } from '@/hooks/useProductSeoOptimizer';

export default function ProductSEOOptimizer(props: ProductSEOOptimizerProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    price,
    originalPrice,
    image,
    images,
    video,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    seoKeywords,
    setSeoKeywords,
    category,
    specs,
    variants,
  } = props;

  const {
    activeTab,
    setActiveTab,
    trendQuery,
    setTrendQuery,
    trendLoading,
    metaAds,
    tiktokPosts,
    extractedKeywords,
    trendError,
    seoPoints,
    tiktokPoints,
    facebookPoints,
    overallScore,
    auditList,
    handleFetchTrends,
    handleAddKeyword,
    applyBulletDescriptionFix,
    applySEOAutoGenerator,
    applyTikTokAdSuite,
  } = useProductSeoOptimizer(props);

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4" style={{ border: '1px solid #f1f5f9' }}>
      
      {/* Header and Overall Score */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-3">
            <i className="fas fa-magic fa-lg" />
          </div>
          <div>
            <h6 className="fw-black text-dark mb-0 font-extrabold tracking-tight">
              Listing Optimization Suite
            </h6>
            <span className="text-muted text-[11px] block uppercase font-semibold tracking-wider">
              Real-time SEO & Ad Copy Audit
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="d-flex align-items-center gap-2.5 bg-light px-3 py-1.5 rounded-pill shadow-sm border">
          <div className="position-relative" style={{ width: '40px', height: '40px' }}>
            <svg className="w-100 h-100 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                className={
                  overallScore >= 80 ? 'text-success' : overallScore >= 50 ? 'text-warning' : 'text-danger'
                }
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 * (1 - overallScore / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.35s ease' }}
              />
            </svg>
            <span
              className="position-absolute top-50 start-50 translate-middle fw-bold text-dark text-[10px]"
              style={{ letterSpacing: '-0.5px' }}
            >
              {overallScore}%
            </span>
          </div>
          <div>
            <span className="text-muted text-[10px] block font-bold uppercase leading-none">Overall Score</span>
            <strong className="text-dark small">
              {overallScore >= 85 ? '🔥 Viral Ready' : overallScore >= 60 ? '👍 Standard' : '⚠️ Enhance Details'}
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="d-flex border rounded-pill p-1 bg-light mb-3 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`btn btn-xs rounded-pill flex-grow-1 py-1.5 font-bold border-0 text-[11px] ${
            activeTab === 'audit' 
              ? 'bg-white shadow-sm text-dark font-black' 
              : 'text-muted'
          }`}
        >
          <i className="fas fa-list-check me-1" /> Checklist Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('trends')}
          className={`btn btn-xs rounded-pill flex-grow-1 py-1.5 font-bold border-0 text-[11px] ${
            activeTab === 'trends' 
              ? 'bg-white shadow-sm text-dark font-black' 
              : 'text-muted'
          }`}
        >
          <i className="fas fa-chart-line me-1" /> Live Trends Finder
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`btn btn-xs rounded-pill flex-grow-1 py-1.5 font-bold border-0 text-[11px] ${
            activeTab === 'actions' 
              ? 'bg-white shadow-sm text-dark font-black' 
              : 'text-muted'
          }`}
        >
          <i className="fas fa-bolt me-1 text-warning" /> Quick Fixes
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'audit' && (
        <div className="d-flex flex-column gap-3.5 fade-in">
          
          {/* Progress Indicators for Individual Sections */}
          <div className="row g-2 border-bottom pb-2">
            <div className="col-4 text-center">
              <div className="small text-muted fw-bold text-[10px] mb-1">SEO Tagging</div>
              <div className="progress rounded-pill bg-light border" style={{ height: '7px' }}>
                <div 
                  className="progress-bar bg-success rounded-pill" 
                  style={{ width: `${seoPoints}%`, transition: 'width 0.4s ease' }} 
                />
              </div>
              <span className="fw-bold text-dark text-[10px]">{seoPoints}%</span>
            </div>
            
            <div className="col-4 text-center">
              <div className="small text-muted fw-bold text-[10px] mb-1">TikTok Ads</div>
              <div className="progress rounded-pill bg-light border" style={{ height: '7px' }}>
                <div 
                  className="progress-bar bg-rose rounded-pill" 
                  style={{ width: `${tiktokPoints}%`, transition: 'width 0.4s ease', background: '#e11d48' }} 
                />
              </div>
              <span className="fw-bold text-dark text-[10px]">{tiktokPoints}%</span>
            </div>

            <div className="col-4 text-center">
              <div className="small text-muted fw-bold text-[10px] mb-1">FB & Insta Ads</div>
              <div className="progress rounded-pill bg-light border" style={{ height: '7px' }}>
                <div 
                  className="progress-bar bg-blue rounded-pill" 
                  style={{ width: `${facebookPoints}%`, transition: 'width 0.4s ease', background: '#2563eb' }} 
                />
              </div>
              <span className="fw-bold text-dark text-[10px]">{facebookPoints}%</span>
            </div>
          </div>

          {/* Audit Rule Items lists */}
          <div className="max-h-[300px] overflow-y-auto pr-1 d-flex flex-column gap-3">
            {/* General SEO Checklist */}
            <div>
              <span className="text-secondary fw-bold text-[10px] uppercase tracking-wider d-block mb-1.5 border-start border-success border-3 ps-1.5">
                Google SEO & Details Checklist
              </span>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-1.5">
                {auditList.seo.map(item => (
                  <li key={item.id} className="text-[11px] leading-tight">
                    {item.pass ? (
                      <span className="text-success"><i className="fas fa-check-circle me-1" /> {item.label}</span>
                    ) : (
                      <div className="text-slate-700">
                        <span className="text-danger"><i className="fas fa-times-circle me-1" /> {item.label}</span>
                        <div className="text-muted text-[10px] mt-0.5 ps-3.5 italic">{item.penaltyMsg}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* TikTok Checklist */}
            <div>
              <span className="text-secondary fw-bold text-[10px] uppercase tracking-wider d-block mb-1.5 border-start border-danger border-3 ps-1.5">
                TikTok Ads & Viral Checklist
              </span>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-1.5">
                {auditList.tiktok.map(item => (
                  <li key={item.id} className="text-[11px] leading-tight">
                    {item.pass ? (
                      <span className="text-success"><i className="fas fa-check-circle me-1" /> {item.label}</span>
                    ) : (
                      <div className="text-slate-700">
                        <span className="text-danger"><i className="fas fa-times-circle me-1" /> {item.label}</span>
                        <div className="text-muted text-[10px] mt-0.5 ps-3.5 italic">{item.penaltyMsg}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Facebook Checklist */}
            <div>
              <span className="text-secondary fw-bold text-[10px] uppercase tracking-wider d-block mb-1.5 border-start border-primary border-3 ps-1.5">
                Facebook / Meta Ads Checklist
              </span>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-1.5">
                {auditList.facebook.map(item => (
                  <li key={item.id} className="text-[11px] leading-tight">
                    {item.pass ? (
                      <span className="text-success"><i className="fas fa-check-circle me-1" /> {item.label}</span>
                    ) : (
                      <div className="text-slate-700">
                        <span className="text-danger"><i className="fas fa-times-circle me-1" /> {item.label}</span>
                        <div className="text-muted text-[10px] mt-0.5 ps-3.5 italic">{item.penaltyMsg}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="d-flex flex-column gap-3 fade-in">
          <p className="text-muted text-[11.5px] leading-relaxed mb-1">
            Query public competitor ad copy databases and TikTok videos to retrieve trending keywords and content patterns.
          </p>

          <div className="input-group input-group-sm mb-2">
            <input
              type="text"
              value={trendQuery}
              onChange={(e) => setTrendQuery(e.target.value)}
              placeholder="Search trend term (e.g. smartwatch)..."
              className="form-control text-xs"
            />
            <button
              type="button"
              onClick={handleFetchTrends}
              disabled={trendLoading || !trendQuery.trim()}
              className="btn btn-sm btn-primary font-bold text-white text-[11px] px-3.5 d-flex align-items-center gap-1"
              style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none' }}
            >
              {trendLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <>
                  <i className="fas fa-search" /> Query
                </>
              )}
            </button>
          </div>

          {trendError && (
            <div className="text-danger text-[10px] italic">
              <i className="fas fa-exclamation-triangle me-1" />
              {trendError}
            </div>
          )}

          {/* Keywords Section */}
          {extractedKeywords.length > 0 && (
            <div className="bg-light p-2.5 rounded-3 border">
              <span className="text-dark fw-bold text-[10px] uppercase tracking-wider block mb-1.5">
                <i className="fas fa-hashtag text-warning me-1" /> Viral Keywords Detected (Click to add)
              </span>
              <div className="d-flex flex-wrap gap-1.5">
                {extractedKeywords.map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddKeyword(kw)}
                    className="btn btn-xs btn-outline-secondary py-0.5 px-2 rounded-pill bg-white text-[10px] hover:border-primary hover:text-primary transition-all d-inline-flex align-items-center gap-1 font-semibold"
                  >
                    +{kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Ad/TikTok Insights display */}
          {(metaAds.length > 0 || tiktokPosts.length > 0) ? (
            <div className="max-h-[220px] overflow-y-auto d-flex flex-column gap-2 mt-1">
              {metaAds.map((ad, i) => (
                <div key={`ad_${i}`} className="border rounded bg-light p-2 text-[10.5px]">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-blue-600"><i className="fab fa-facebook-f me-1" /> {ad.pageName || 'Meta Ad'}</strong>
                    <span className="badge bg-danger bg-opacity-10 text-danger text-[9px]">{ad.liveDays} days active</span>
                  </div>
                  <p className="mb-0 text-muted leading-tight text-truncate" title={ad.adCreativeBody}>{ad.adCreativeBody}</p>
                </div>
              ))}
              {tiktokPosts.map((post, i) => (
                <div key={`tk_${i}`} className="border rounded bg-light p-2 text-[10.5px]">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-rose-600"><i className="fab fa-tiktok me-1" /> @{post.creatorHandle || 'tiktok'}</strong>
                    <span className="text-muted text-[9px]">Engagement: {post.engagementRate}%</span>
                  </div>
                  <p className="mb-0 text-muted leading-tight text-truncate" title={post.caption}>{post.caption}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted text-[10px] border border-dashed py-4 rounded-3">
              Click query to fetch live competitor keywords
            </div>
          )}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="d-flex flex-column gap-3.5 fade-in">
          <p className="text-muted text-[11.5px] leading-relaxed mb-0">
            Speed up your product listing. Apply structured content formatting, generate SEO metadata, and add viral TikTok tags with one click.
          </p>

          <div className="d-flex flex-column gap-2.5">
            <button
              type="button"
              onClick={applyBulletDescriptionFix}
              disabled={!description.trim()}
              className="btn btn-outline-success btn-sm rounded-pill text-start py-2.5 px-3 d-flex align-items-center justify-content-between border border-success border-opacity-20 hover:bg-success hover:text-white group transition-all w-100"
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-list-ol text-success group-hover:text-white" />
                <div className="text-start">
                  <span className="fw-bold d-block text-[11px] leading-tight">Format Description Checklist</span>
                  <span className="text-[9.5px] text-muted group-hover:text-white group-hover:text-opacity-80 block mt-0.5">Adds bullet highlights & Cash on Delivery policies</span>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted group-hover:text-white text-[10px]" />
            </button>

            <button
              type="button"
              onClick={applySEOAutoGenerator}
              disabled={!name.trim()}
              className="btn btn-outline-primary btn-sm rounded-pill text-start py-2.5 px-3 d-flex align-items-center justify-content-between border border-primary border-opacity-20 hover:bg-primary hover:text-white group transition-all w-100"
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-search-plus text-primary group-hover:text-white" />
                <div className="text-start">
                  <span className="fw-bold d-block text-[11px] leading-tight">Auto-Generate SEO Tags</span>
                  <span className="text-[9.5px] text-muted group-hover:text-white group-hover:text-opacity-80 block mt-0.5">Fills SEO Title & Meta Description automatically</span>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted group-hover:text-white text-[10px]" />
            </button>

            <button
              type="button"
              onClick={applyTikTokAdSuite}
              disabled={!description.trim()}
              className="btn btn-outline-danger btn-sm rounded-pill text-start py-2.5 px-3 d-flex align-items-center justify-content-between border border-danger border-opacity-20 hover:bg-danger hover:text-white group transition-all w-100"
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-play text-danger group-hover:text-white" />
                <div className="text-start">
                  <span className="fw-bold d-block text-[11px] leading-tight">Inject TikTok Hooks & Tags</span>
                  <span className="text-[9.5px] text-muted group-hover:text-white group-hover:text-opacity-80 block mt-0.5">Inserts viral hook words & popular video tags</span>
                </div>
              </div>
              <i className="fas fa-chevron-right text-muted group-hover:text-white text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
