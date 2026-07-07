'use client';

import React, { useState, useEffect } from 'react';

// Props matching product form fields
interface ProductSEOOptimizerProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  originalPrice: string;
  image: string;
  images: string[];
  video: string;
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  seoKeywords: string;
  setSeoKeywords: (v: string) => void;
  category: string;
  specs: Array<{ key: string; value: string }>;
  variants: any[];
}

export default function ProductSEOOptimizer({
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
}: ProductSEOOptimizerProps) {
  // Tabs for the widget
  const [activeTab, setActiveTab] = useState<'audit' | 'trends' | 'actions'>('audit');

  // Trend search states
  const [trendQuery, setTrendQuery] = useState(name || category || '');
  const [trendLoading, setTrendLoading] = useState(false);
  const [metaAds, setMetaAds] = useState<any[]>([]);
  const [tiktokPosts, setTiktokPosts] = useState<any[]>([]);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [trendError, setTrendError] = useState<string | null>(null);

  // Sync trend query when name/category changes initially or is empty
  useEffect(() => {
    if (!trendQuery && (name || category)) {
      setTrendQuery(name || category);
    }
  }, [name, category]);

  // Real-time evaluation states
  const [seoPoints, setSeoPoints] = useState(0);
  const [tiktokPoints, setTiktokPoints] = useState(0);
  const [facebookPoints, setFacebookPoints] = useState(0);
  const [overallScore, setOverallScore] = useState(0);

  // Checklist items status
  const [auditList, setAuditList] = useState<{
    seo: { id: string; label: string; pass: boolean; penaltyMsg: string }[];
    tiktok: { id: string; label: string; pass: boolean; penaltyMsg: string }[];
    facebook: { id: string; label: string; pass: boolean; penaltyMsg: string }[];
  }>({ seo: [], tiktok: [], facebook: [] });

  // Evaluate listing quality in real-time
  useEffect(() => {
    // ── 1. SEO AUDIT RULES ──
    const titleLength = name.trim().length;
    const descLength = description.trim().length;
    const hasImage = !!image.trim();
    const hasSpecs = specs.some(s => s.key.trim() && s.value.trim());
    const hasVariants = variants.length > 0;
    const discountPercent = parseFloat(originalPrice) > parseFloat(price) 
      ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100) 
      : 0;

    const seoRules = [
      {
        id: 'title_length',
        label: 'Name length is optimal (10-50 chars)',
        pass: titleLength >= 10 && titleLength <= 50,
        penaltyMsg: `Current: ${titleLength} chars. Keep it between 10-50 characters so it is clean and readable.`,
        pts: 4,
      },
      {
        id: 'description_length',
        label: 'Detailed description (min 200 chars)',
        pass: descLength >= 200,
        penaltyMsg: `Current: ${descLength} chars. Add more technical specs, features, or details.`,
        pts: 4,
      },
      {
        id: 'has_media',
        label: 'Main image uploaded',
        pass: hasImage,
        penaltyMsg: 'Add a product photo to enable visual SEO.',
        pts: 3,
      },
      {
        id: 'has_specs',
        label: 'Technical specifications added',
        pass: hasSpecs,
        penaltyMsg: 'Add specifications (e.g. Brand, Material) to boost indexability.',
        pts: 3,
      },
      {
        id: 'seo_config_title',
        label: 'SEO custom meta title defined (50-60 chars)',
        pass: seoTitle.trim().length >= 45 && seoTitle.trim().length <= 65,
        penaltyMsg: `Current: ${seoTitle.trim().length} chars. Customize for search engine highlights.`,
        pts: 3,
      },
      {
        id: 'seo_config_desc',
        label: 'SEO custom meta description defined (140-160 chars)',
        pass: seoDescription.trim().length >= 130 && seoDescription.trim().length <= 175,
        penaltyMsg: `Current: ${seoDescription.trim().length} chars. Needs structured summary with keywords.`,
        pts: 3,
      },
    ];

    // ── 2. TIKTOK ADS AUDIT RULES ──
    const hasVideo = !!video.trim();
    const cleanDescLower = description.toLowerCase();
    const hasTikTokHooks = ['tiktok', 'viral', 'POV', 'must have', 'unboxing', 'unboxed', 'asmr', 'test', 'review', 'trend'].some(h => cleanDescLower.includes(h.toLowerCase()));
    const hasHashtags = description.includes('#');
    
    const tiktokRules = [
      {
        id: 'has_video',
        label: 'Product video uploaded (Critical for TikTok Ads)',
        pass: hasVideo,
        penaltyMsg: 'Upload a product video. Videos get 300% more engagements on TikTok.',
        pts: 10,
      },
      {
        id: 'has_tiktok_hooks',
        label: 'Viral hook keywords in description',
        pass: hasTikTokHooks,
        penaltyMsg: "Add hook terms like 'Viral', 'Unboxing', 'Must Buy', or 'POV review' to spark interest.",
        pts: 5,
      },
      {
        id: 'has_hashtags',
        label: 'Short hashtags in description (#tiktokmademebuyit)',
        pass: hasHashtags,
        penaltyMsg: "Append search hashtags like #tiktokmademebuyit to description.",
        pts: 5,
      },
    ];

    // ── 3. FACEBOOK & INSTA ADS COPY RULES ──
    // Emoji regex
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
    const hasEmojis = emojiRegex.test(description);
    const hasCTA = ['order', 'shop', 'whatsapp', 'buy', 'dm', 'order now', 'delivery', 'limited stock', 'sale'].some(c => cleanDescLower.includes(c));
    const hasBulletPoints = ['•', '-', '*', '1.', '2.', '3.'].some(b => description.includes(b)) || description.split('\n').length > 4;

    const facebookRules = [
      {
        id: 'has_emojis',
        label: 'Uses eye-catching emojis in description',
        pass: hasEmojis,
        penaltyMsg: 'Emojis boost ad click-through rate (CTR) by 45%. Insert ✅, 🔥, ⚡, 🛒 or 📦.',
        pts: 7,
      },
      {
        id: 'has_cta',
        label: 'Clear call-to-action (CTA) inside ad copy',
        pass: hasCTA,
        penaltyMsg: "Add buying trigger phrases (e.g. 'Order now via Cash on Delivery' or 'Limited Stock Available').",
        pts: 8,
      },
      {
        id: 'has_bullet_points',
        label: 'Readable formatting (bullets/list points)',
        pass: hasBulletPoints,
        penaltyMsg: 'Structure features into bullet lists to reduce reading fatigue in ad streams.',
        pts: 5,
      },
    ];

    // Calculate sub-scores
    const maxSeo = seoRules.reduce((acc, curr) => acc + curr.pts, 0);
    const passSeo = seoRules.filter(r => r.pass).reduce((acc, curr) => acc + curr.pts, 0);
    const seoPercent = Math.round((passSeo / maxSeo) * 100);

    const maxTiktok = tiktokRules.reduce((acc, curr) => acc + curr.pts, 0);
    const passTiktok = tiktokRules.filter(r => r.pass).reduce((acc, curr) => acc + curr.pts, 0);
    const tiktokPercent = Math.round((passTiktok / maxTiktok) * 100);

    const maxFacebook = facebookRules.reduce((acc, curr) => acc + curr.pts, 0);
    const passFacebook = facebookRules.filter(r => r.pass).reduce((acc, curr) => acc + curr.pts, 0);
    const facebookPercent = Math.round((passFacebook / maxFacebook) * 100);

    // Calculate total score (weighted overall out of 100)
    const totalMax = maxSeo + maxTiktok + maxFacebook;
    const totalPass = passSeo + passTiktok + passFacebook;
    const overallPercent = Math.round((totalPass / totalMax) * 100);

    setSeoPoints(seoPercent);
    setTiktokPoints(tiktokPercent);
    setFacebookPoints(facebookPercent);
    setOverallScore(overallPercent);

    setAuditList({
      seo: seoRules.map(r => ({ id: r.id, label: r.label, pass: r.pass, penaltyMsg: r.penaltyMsg })),
      tiktok: tiktokRules.map(r => ({ id: r.id, label: r.label, pass: r.pass, penaltyMsg: r.penaltyMsg })),
      facebook: facebookRules.map(r => ({ id: r.id, label: r.label, pass: r.pass, penaltyMsg: r.penaltyMsg })),
    });
  }, [name, description, price, originalPrice, image, images, video, seoTitle, seoDescription, seoKeywords, specs, variants]);

  // Fetch live keyword trends from active/mock Facebook Ads and TikTok creatives
  const handleFetchTrends = async () => {
    if (!trendQuery.trim()) return;
    setTrendLoading(true);
    setTrendError(null);
    try {
      const [metaRes, tiktokRes] = await Promise.all([
        fetch(`/api/analytics/meta?q=${encodeURIComponent(trendQuery)}`),
        fetch(`/api/analytics/tiktok?q=${encodeURIComponent(trendQuery)}&cursor=0`),
      ]);

      const metaJson = await metaRes.json();
      const tiktokJson = await tiktokRes.json();

      const ads = metaJson.success ? (metaJson.data || []) : [];
      const vids = tiktokJson.success ? (tiktokJson.data || []) : [];

      setMetaAds(ads.slice(0, 4));
      setTiktokPosts(vids.slice(0, 4));

      // Extract trending tags & keywords
      const allTexts: string[] = [];
      ads.forEach((ad: any) => {
        if (ad.adCreativeBody) allTexts.push(ad.adCreativeBody);
        if (ad.adCreativeLinkTitle) allTexts.push(ad.adCreativeLinkTitle);
      });
      vids.forEach((v: any) => {
        if (v.caption) allTexts.push(v.caption);
      });

      // Simple keyword frequency tokenizer
      const combinedText = allTexts.join(' ').toLowerCase();
      // Remove symbols and split
      const tokens = combinedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '').split(/\s+/);
      
      const stopWords = new Set([
        'the', 'a', 'to', 'and', 'of', 'in', 'is', 'for', 'on', 'with', 'this', 'that', 'it', 
        'at', 'by', 'an', 'be', 'are', 'from', 'or', 'your', 'our', 'we', 'you', 'me', 'us', 
        'i', 'rs', 'pkr', 'only', 'best', 'limited', 'stock', 'shipping', 'free', 'price', 
        'delivery', 'cash', 'cod', 'now', 'buy', 'order', 'off', 'pk', 'pakistan', 'discount',
        'quality', 'original', 'premium', 'new', 'get', 'has', 'have', 'more', 'about', 'out'
      ]);

      const frequencies: Record<string, number> = {};
      tokens.forEach(tok => {
        const word = tok.trim();
        if (word.length > 3 && !stopWords.has(word) && isNaN(Number(word))) {
          frequencies[word] = (frequencies[word] || 0) + 1;
        }
      });

      // Extract hashtags directly too
      const hashtagRegex = /#\w+/g;
      const hashtagsMatch = combinedText.match(hashtagRegex) || [];
      hashtagsMatch.forEach(tag => {
        frequencies[tag] = (frequencies[tag] || 0) + 5; // Weigh hashtags higher
      });

      // Sort words by frequency
      const sortedKeywords = Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);

      setExtractedKeywords(sortedKeywords.length > 0 ? sortedKeywords : ['trending', 'viral', 'gadgets', 'bestbuy']);
    } catch (err: any) {
      console.error(err);
      setTrendError('Error retrieving live insights. Showing suggestions.');
      setExtractedKeywords(['viral', 'tiktokmademebuyit', 'bestbuy', 'original']);
    } finally {
      setTrendLoading(false);
    }
  };

  // Add keyword from pill to SEO tags
  const handleAddKeyword = (kw: string) => {
    const cleanKw = kw.toLowerCase().trim();
    const currentTags = seoKeywords.split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    if (!currentTags.includes(cleanKw)) {
      const updatedTags = [...currentTags, cleanKw].join(', ');
      setSeoKeywords(updatedTags);
    }
  };

  // Quick Fix Action #1: Formats descriptions into bullet points and appends trust tags
  const applyBulletDescriptionFix = () => {
    let cleanDesc = description.trim();
    
    // Check if it already has bullet symbols
    const hasBullets = ['•', '-', '*'].some(sym => cleanDesc.includes(sym));
    
    if (!hasBullets) {
      // split into sentences and convert to points
      const sentences = cleanDesc.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      if (sentences.length > 1) {
        cleanDesc = "Product Key Highlights:\n" + sentences.map(s => `• ${s}.`).join('\n');
      }
    }

    // Append trust badges and CTA
    const trustSection = `\n\n🔥 Why Buy From Us?
✅ 100% Original Premium Quality Guaranteed
⚡ Fast Cash on Delivery (COD) Nationwide
📦 Secure Box Packaging with Fast Dispatch
⭐ 7-Day Replacement Warranty for Peace of Mind
🛒 Click "Save" and Order Yours Today!`;

    if (!cleanDesc.toLowerCase().includes('why buy from us')) {
      cleanDesc += trustSection;
    }
    
    setDescription(cleanDesc);
  };

  // Quick Fix Action #2: Populates SEO Title and SEO Description based on details
  const applySEOAutoGenerator = () => {
    if (!name.trim()) return;

    // Build standard SEO Title (50-60 characters ideal)
    let generatedTitle = `${name} | Best Price in Pakistan`;
    if (price && Number(price) > 0) {
      generatedTitle = `${name} - Rs. ${Number(price).toLocaleString()} | Original`;
    }
    if (generatedTitle.length > 60) {
      generatedTitle = generatedTitle.substring(0, 57) + '...';
    }
    setSeoTitle(generatedTitle);

    // Build SEO Meta Description (140-160 characters ideal)
    let generatedDesc = `Buy authentic ${name} online in Pakistan. `;
    if (price && Number(price) > 0) {
      generatedDesc += `Shop at the best discounted price of Rs. ${Number(price).toLocaleString()}. `;
    }
    generatedDesc += `Cash on delivery nationwide, easy returns, and official store warranty. Buy now!`;
    if (generatedDesc.length > 160) {
      generatedDesc = generatedDesc.substring(0, 157) + '...';
    }
    setSeoDescription(generatedDesc);
  };

  // Quick Fix Action #3: Appends TikTok Ad Hooks and Hashtags to description and SEO tags
  const applyTikTokAdSuite = () => {
    // Append tags to keywords
    const tiktokTags = ['tiktokmademebuyit', 'viral', 'unboxing', 'trending', 'review', 'gadgets'];
    tiktokTags.forEach(t => handleAddKeyword(t));
  };

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
