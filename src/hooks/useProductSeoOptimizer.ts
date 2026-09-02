'use client';

import { useState, useEffect } from 'react';
import { ProductSEOOptimizerProps } from '@/types/product';

export function useProductSeoOptimizer({
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
    const hasImage = Boolean(image && image.trim());
    const hasSpecs = specs && specs.some((s) => s.key.trim() && s.value.trim());
    const hasVariants = variants && variants.length > 0;

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
        pass: Boolean(hasSpecs),
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
    const hasVideo = Boolean(video && video.trim());
    const cleanDescLower = description.toLowerCase();
    const hasTikTokHooks = ['tiktok', 'viral', 'POV', 'must have', 'unboxing', 'unboxed', 'asmr', 'test', 'review', 'trend'].some(
      (h) => cleanDescLower.includes(h.toLowerCase())
    );
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
        penaltyMsg: 'Append search hashtags like #tiktokmademebuyit to description.',
        pts: 5,
      },
    ];

    // ── 3. FACEBOOK & INSTA ADS COPY RULES ──
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
    const hasEmojis = emojiRegex.test(description);
    const hasCTA = ['order', 'shop', 'whatsapp', 'buy', 'dm', 'order now', 'delivery', 'limited stock', 'sale'].some(
      (c) => cleanDescLower.includes(c)
    );
    const hasBulletPoints =
      ['•', '-', '*', '1.', '2.', '3.'].some((b) => description.includes(b)) || description.split('\n').length > 4;

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
    const passSeo = seoRules.filter((r) => r.pass).reduce((acc, curr) => acc + curr.pts, 0);
    const seoPercent = Math.round((passSeo / maxSeo) * 100);

    const maxTiktok = tiktokRules.reduce((acc, curr) => acc + curr.pts, 0);
    const passTiktok = tiktokRules.filter((r) => r.pass).reduce((acc, curr) => acc + curr.pts, 0);
    const tiktokPercent = Math.round((passTiktok / maxTiktok) * 100);

    const maxFacebook = facebookRules.reduce((acc, curr) => acc + curr.pts, 0);
    const passFacebook = facebookRules.filter((r) => r.pass).reduce((acc, curr) => acc + curr.pts, 0);
    const facebookPercent = Math.round((passFacebook / maxFacebook) * 100);

    // Calculate total score
    const totalMax = maxSeo + maxTiktok + maxFacebook;
    const totalPass = passSeo + passTiktok + passFacebook;
    const overallPercent = Math.round((totalPass / totalMax) * 100);

    setSeoPoints(seoPercent);
    setTiktokPoints(tiktokPercent);
    setFacebookPoints(facebookPercent);
    setOverallScore(overallPercent);

    setAuditList({
      seo: seoRules.map((r) => ({ id: r.id, label: r.label, pass: r.pass, penaltyMsg: r.penaltyMsg })),
      tiktok: tiktokRules.map((r) => ({ id: r.id, label: r.label, pass: r.pass, penaltyMsg: r.penaltyMsg })),
      facebook: facebookRules.map((r) => ({ id: r.id, label: r.label, pass: r.pass, penaltyMsg: r.penaltyMsg })),
    });
  }, [name, description, price, originalPrice, image, images, video, seoTitle, seoDescription, seoKeywords, specs, variants]);

  // Fetch live keyword trends
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

      const ads = metaJson.success ? metaJson.data || [] : [];
      const vids = tiktokJson.success ? tiktokJson.data || [] : [];

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

      const combinedText = allTexts.join(' ').toLowerCase();
      const tokens = combinedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '').split(/\s+/);

      const stopWords = new Set([
        'the', 'a', 'to', 'and', 'of', 'in', 'is', 'for', 'on', 'with', 'this', 'that', 'it',
        'at', 'by', 'an', 'be', 'are', 'from', 'or', 'your', 'our', 'we', 'you', 'me', 'us',
        'i', 'rs', 'pkr', 'only', 'best', 'limited', 'stock', 'shipping', 'free', 'price',
        'delivery', 'cash', 'cod', 'now', 'buy', 'order', 'off', 'pk', 'pakistan', 'discount',
        'quality', 'original', 'premium', 'new', 'get', 'has', 'have', 'more', 'about', 'out',
      ]);

      const frequencies: Record<string, number> = {};
      tokens.forEach((tok) => {
        const word = tok.trim();
        if (word.length > 3 && !stopWords.has(word) && isNaN(Number(word))) {
          frequencies[word] = (frequencies[word] || 0) + 1;
        }
      });

      const hashtagRegex = /#\w+/g;
      const hashtagsMatch = combinedText.match(hashtagRegex) || [];
      hashtagsMatch.forEach((tag) => {
        frequencies[tag] = (frequencies[tag] || 0) + 5;
      });

      const sortedKeywords = Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map((entry) => entry[0]);

      setExtractedKeywords(sortedKeywords.length > 0 ? sortedKeywords : ['trending', 'viral', 'gadgets', 'bestbuy']);
    } catch (err: any) {
      console.error('Error fetching trends in useProductSeoOptimizer:', err);
      setTrendError('Error retrieving live insights. Showing suggestions.');
      setExtractedKeywords(['viral', 'tiktokmademebuyit', 'bestbuy', 'original']);
    } finally {
      setTrendLoading(false);
    }
  };

  const handleAddKeyword = (kw: string) => {
    const cleanKw = kw.toLowerCase().trim();
    const currentTags = seoKeywords
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (!currentTags.includes(cleanKw)) {
      const updatedTags = [...currentTags, cleanKw].join(', ');
      setSeoKeywords(updatedTags);
    }
  };

  const applyBulletDescriptionFix = () => {
    let cleanDesc = description.trim();
    const hasBullets = ['•', '-', '*'].some((sym) => cleanDesc.includes(sym));

    if (!hasBullets) {
      const sentences = cleanDesc.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10);
      if (sentences.length > 1) {
        cleanDesc = 'Product Key Highlights:\n' + sentences.map((s) => `• ${s}.`).join('\n');
      }
    }

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

  const applySEOAutoGenerator = () => {
    if (!name.trim()) return;

    let generatedTitle = `${name} | Best Price in Pakistan`;
    if (price && Number(price) > 0) {
      generatedTitle = `${name} - Rs. ${Number(price).toLocaleString()} | Original`;
    }
    if (generatedTitle.length > 60) {
      generatedTitle = generatedTitle.substring(0, 57) + '...';
    }
    setSeoTitle(generatedTitle);

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

  const applyTikTokAdSuite = () => {
    const tiktokTags = ['tiktokmademebuyit', 'viral', 'unboxing', 'trending', 'review', 'gadgets'];
    tiktokTags.forEach((t) => handleAddKeyword(t));
  };

  return {
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
  };
}
