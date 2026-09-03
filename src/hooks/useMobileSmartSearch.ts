'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteInfo } from '../components/common/SiteInfoProvider';

export interface SmartSearchResultProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

export function useMobileSmartSearch() {
  const router = useRouter();
  const { info } = useSiteInfo();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SmartSearchResultProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Phone normalization for WhatsApp inquiry
  const rawPhone = info?.whatsapp || info?.phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';
  const cleanDigits = rawPhone.replace(/\D/g, '');
  const formattedWhatsapp = cleanDigits.startsWith('92') ? cleanDigits : `92${cleanDigits.replace(/^0/, '')}`;

  const lastLoggedQueryRef = useRef<string>('');

  // 220ms debounce on keystrokes to protect token usage and avoid network spam
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch live suggestions
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      setCategories([]);
      setIsLoading(false);
      setIsAiAssisted(false);
      setHasSearched(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasSearched(true);

    (async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        const json = await res.json();

        if (isMounted && json.success) {
          setSuggestions(json.products || []);
          setCategories(json.categories || []);
          setIsAiAssisted(Boolean(json.isAiAssisted));

          // If 0 results returned and query length >= 3, log as unfulfilled lead
          if (json.products?.length === 0 && debouncedQuery.length >= 3 && lastLoggedQueryRef.current !== debouncedQuery) {
            lastLoggedQueryRef.current = debouncedQuery;
            fetch('/api/search/unfulfilled', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: debouncedQuery }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // WhatsApp Pre-filled Lead Link
  const getWhatsappInquiryUrl = useCallback(
    (customQuery?: string) => {
      const q = customQuery || query || 'product';
      const text = `Assalam-o-Alaikum Pak-o-Drive Support! Main website par "${q}" search kar raha tha jo listed nahi mili. Please apne central warehouse inventory se check kar ke batayein ke yeh item stock mein available hai?`;
      return `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(text)}`;
    },
    [formattedWhatsapp, query]
  );

  const handleSubmitSearch = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const q = query.trim();
      if (!q) return;

      setIsOpen(false);
      router.push(`/shop?search=${encodeURIComponent(q)}`);
    },
    [query, router]
  );

  const handleSelectProduct = useCallback(
    (slugOrId: string) => {
      setIsOpen(false);
      router.push(`/product/${slugOrId}`);
    },
    [router]
  );

  const handleSelectCategory = useCallback(
    (category: string) => {
      setIsOpen(false);
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    },
    [router]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSuggestions([]);
    setCategories([]);
    setHasSearched(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    suggestions,
    categories,
    isLoading,
    isAiAssisted,
    hasSearched,
    getWhatsappInquiryUrl,
    handleSubmitSearch,
    handleSelectProduct,
    handleSelectCategory,
    handleClear,
  };
}
