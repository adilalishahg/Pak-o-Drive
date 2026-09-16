'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildCategoryTree, CategoryTreeNode } from '@/lib/categoryTree';

export interface UseAdminBulkImportReturn {
  jsonText: string;
  parsedPreview: any[];
  parseError: string;
  importing: boolean;
  importResult: { success?: boolean; message?: string; count?: number; error?: string } | null;
  categories: any[];
  categoriesLoading: boolean;
  aiPromptModalOpen: boolean;
  copiedPrompt: boolean;
  copiedJson: boolean;
  dynamicTaxonomyText: string;
  dynamicSampleJsonText: string;
  fullGeminiPromptText: string;
  handleJsonChange: (val: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLoadSample: () => void;
  handleLoadAiTemplateIntoEditor: () => void;
  handleExecuteImport: () => Promise<void>;
  handleCopyPrompt: () => void;
  handleCopyJson: () => void;
  setAiPromptModalOpen: (open: boolean) => void;
}

export function useAdminBulkImport(): UseAdminBulkImportReturn {
  const router = useRouter();
  const [jsonText, setJsonText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Live Categories from DB
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // UI state
  const [aiPromptModalOpen, setAiPromptModalOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // 1. Fetch live categories from database
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && isMounted) {
          const list = Array.isArray(data.data) ? data.data : [];
          setCategories(list);
        }
      } catch (err) {
        console.error('Failed to load categories for bulk import:', err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Format live categories into a clean readable taxonomy tree string
  const dynamicTaxonomyText = useMemo(() => {
    if (categories.length === 0) {
      return `Car Accessories (Interior Styling, Car Perfumes, Dash Cams)\nMobile & Smart Tech (Smartwatches, Fast Chargers, Earbuds)`;
    }

    const tree = buildCategoryTree(categories);

    function formatNode(node: CategoryTreeNode, indent = ''): string {
      const isRoot = node.depth === 0;
      const prefix = isRoot ? `📁 ${node.name}` : `${indent}↳ ${node.name}`;
      const childLines = (node.children || []).map((ch) => formatNode(ch, `${indent}  `));
      return [prefix, ...childLines].join('\n');
    }

    return tree.map((root) => formatNode(root)).join('\n\n');
  }, [categories]);

  // 3. Dynamic Sample JSON featuring real store categories and high SEO fields
  const dynamicSampleProducts = useMemo(() => {
    // Pick first couple categories if available
    const tree = buildCategoryTree(categories);
    const cat1 = tree[0];
    const cat1Sub = cat1?.children?.[0];
    const cat2 = tree[1] || tree[0];
    const cat2Sub = cat2?.children?.[0] || cat2?.children?.[1];

    const cat1Name = cat1?.name || 'Car Accessories';
    const cat1SubName = cat1Sub?.name || 'Car Perfumes & Fresheners';
    const cat2Name = cat2?.name || 'Mobile & Smart Tech';
    const cat2SubName = cat2Sub?.name || 'Fast Chargers & Cables';

    return [
      {
        name: 'Solar Powered Helicopter Dashboard Car Perfume & Rotating Freshener',
        category: cat1Name,
        subcategory: cat1SubName,
        price: 1999,
        originalPrice: 2899,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=600&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop',
        ],
        description:
          'Aviation-grade solar aroma diffuser with auto-rotating propeller blades when sunlight hits. Emits continuous natural essential fragrance without batteries. Zinc alloy body with non-slip dashboard pad.',
        specifications: {
          Material: 'Aviation Zinc Alloy + High-Efficiency Solar Panel',
          'Fragrance Duration': 'Up to 90 Days (Refillable Ring)',
          'Mount Type': 'Non-Slip Reusable Dashboard Adhesive Pad',
          'Power Source': '100% Solar Energy (No Batteries or USB needed)',
        },
        seoTitle: 'Solar Helicopter Car Perfume & Rotating Freshener — Buy in Pakistan | PAKODRIVE',
        seoDescription:
          'Buy Solar Helicopter Car Perfume in Pakistan. Auto-rotating dashboard aroma diffuser with pure natural fragrance. Cash on Delivery (COD) & fast delivery.',
        seoKeywords:
          'solar car perfume, helicopter car freshener, dashboard diffuser, car accessories pakistan, buy online COD',
        rating: 5,
        reviewsCount: 24,
        isFeatured: true,
        isTopSelling: true,
        isNewArrival: true,
      },
      {
        name: '120W Super Fast Retractable Dual Port 3-in-1 Car Charger with Voltage Display',
        category: cat2Name,
        subcategory: cat2SubName,
        price: 2799,
        originalPrice: 3999,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop',
        ],
        description:
          'Auto-retractable 80cm cables for Type-C and Lightning plus dual extra USB ports. Fast charges up to 4 devices simultaneously with real-time LED digital battery voltage monitor.',
        specifications: {
          'Max Output': '120W Super Fast Charging Protocol',
          'Cable Length': '80cm Auto-Retractable Tangle-Free Cords',
          Connectors: 'Type-C, Lightning, USB-A, Type-C Port',
          'Safety Protection': 'Over-voltage, Short-circuit & Temperature Chip',
        },
        seoTitle: '120W Retractable 3-in-1 Fast Car Charger — Buy in Pakistan | PAKODRIVE',
        seoDescription:
          '120W 3-in-1 Fast Retractable Car Charger with Voltage Display in Pakistan. Charges 4 phones at once with auto-pull cables. Cash on Delivery nationwide.',
        seoKeywords:
          '120w car charger, retractable car charger, fast charger for car, mobile accessories pakistan, pakodrive COD',
        rating: 4.9,
        reviewsCount: 38,
        isFeatured: true,
        isTopSelling: true,
        isNewArrival: true,
      },
    ];
  }, [categories]);

  const dynamicSampleJsonText = useMemo(() => {
    return JSON.stringify(dynamicSampleProducts, null, 2);
  }, [dynamicSampleProducts]);

  // 4. Complete, Ready-to-use Prompt for Gemini
  const fullGeminiPromptText = useMemo(() => {
    return `You are an expert E-Commerce Catalog Specialist & SEO Copywriter for Pak-o-Drive (Pakistan's Premier Automotive & Smart Tech Store).

TASK:
I will provide product photos and/or product details. Analyze them and generate a clean, strictly valid JSON array matching the exact schema below, ready for 1-click bulk import into Pak-o-Drive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY MATCHING INSTRUCTIONS (VERY IMPORTANT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Below is the LIVE list of categories and subcategories currently available in our store:

${dynamicTaxonomyText}

RULES FOR CATEGORY SELECTION:
1. If the product belongs to any of the EXISTING categories or subcategories above, you MUST use the exact category name and subcategory name from the list.
2. If the product represents a completely NEW niche or type of item not in our catalog, you may propose a clean, professional Category name (and subcategory). Our import system will automatically create the new parent category and child subcategory in our database!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH-CONVERSION SEO & SPECIFICATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- name: Clear, keyword-rich product title (e.g. "Solar Powered Helicopter Dashboard Car Perfume & Rotating Freshener").
- price: Numeric PKR price (Pakistani Rupees, e.g. 1999).
- originalPrice: Higher strike-through original market price (e.g. 2899).
- stock: Initial inventory count (e.g. 30 to 60).
- description: 2-3 engaging, professional sentences explaining benefits, build material, and real-world utility.
- specifications: Key-value JSON object covering Material, Power/Battery, Dimensions, Fitment/Compatibility, and Warranty.
- seoTitle: High-CTR Google title (under 65 chars), ending with "— Buy in Pakistan | PAKODRIVE".
- seoDescription: 150-160 characters mentioning product name, top benefit, Cash on Delivery (COD), and fast delivery across Pakistan.
- seoKeywords: 5-8 comma-separated high-intent search queries used by Pakistani buyers.
- isFeatured: true
- isTopSelling: true
- isNewArrival: true
- rating: 4.8 to 5.0
- reviewsCount: 15 to 45
- image: Main photo URL (or placeholder if uploading locally).
- images: Array of photo URLs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED JSON OUTPUT FORMAT (JSON ARRAY ONLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`json
${dynamicSampleJsonText}
\`\`\`

OUTPUT INSTRUCTIONS:
Output ONLY the valid JSON array starting with [ and ending with ]. Do not wrap in markdown or explanatory conversation so it can be pasted directly into the import tool.`;
  }, [dynamicTaxonomyText, dynamicSampleJsonText]);

  // JSON Input change handler with auto-validation
  const handleJsonChange = useCallback((text: string) => {
    setJsonText(text);
    setParseError('');

    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.products && Array.isArray(parsed.products)
        ? parsed.products
        : [parsed];

      setParsedPreview(items);
    } catch (e: any) {
      setParseError(`JSON Syntax Error: ${e.message}`);
      setParsedPreview([]);
    }
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleJsonChange(content);
      };
      reader.readAsText(file);
    },
    [handleJsonChange]
  );

  // Load sample into textarea
  const handleLoadSample = useCallback(() => {
    handleJsonChange(dynamicSampleJsonText);
  }, [dynamicSampleJsonText, handleJsonChange]);

  const handleLoadAiTemplateIntoEditor = useCallback(() => {
    handleJsonChange(dynamicSampleJsonText);
    setAiPromptModalOpen(false);
  }, [dynamicSampleJsonText, handleJsonChange]);

  // Copy Gemini Prompt
  const handleCopyPrompt = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullGeminiPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  }, [fullGeminiPromptText]);

  // Copy JSON only
  const handleCopyJson = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(dynamicSampleJsonText);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    }
  }, [dynamicSampleJsonText]);

  // Execute import
  const handleExecuteImport = useCallback(async () => {
    if (parsedPreview.length === 0) return;

    try {
      setImporting(true);
      setImportResult(null);

      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPreview),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult({
          success: true,
          message: data.message || `Successfully imported ${data.count || parsedPreview.length} products!`,
          count: data.count || parsedPreview.length,
        });
      } else {
        setImportResult({
          success: false,
          error: data.error || 'Failed to import products.',
        });
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        error: err.message || 'An unexpected error occurred during import.',
      });
    } finally {
      setImporting(false);
    }
  }, [parsedPreview]);

  return {
    jsonText,
    parsedPreview,
    parseError,
    importing,
    importResult,
    categories,
    categoriesLoading,
    aiPromptModalOpen,
    copiedPrompt,
    copiedJson,
    dynamicTaxonomyText,
    dynamicSampleJsonText,
    fullGeminiPromptText,
    handleJsonChange,
    handleFileUpload,
    handleLoadSample,
    handleLoadAiTemplateIntoEditor,
    handleExecuteImport,
    handleCopyPrompt,
    handleCopyJson,
    setAiPromptModalOpen,
  };
}
