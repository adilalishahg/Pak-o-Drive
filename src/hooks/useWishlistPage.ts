'use client';

import { useState, useEffect } from 'react';
import { IProduct } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useSiteTheme } from '@/components/common/DynamicThemeProvider';

export function useWishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();
  const { theme } = useSiteTheme();

  const isCleanWhite = theme.layoutTheme === 'theme1';
  const isModernGreen = theme.layoutTheme === 'modern-green';
  const bg = isCleanWhite ? '#f8fafc' : isModernGreen ? '#f7f5ed' : '#f5f7fa';

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && isMounted) {
          const filtered = data.data.filter((p: IProduct) =>
            wishlist.includes(p._id?.toString() || '')
          );
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching wishlist products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [wishlist]);

  return {
    wishlistCount,
    products,
    loading,
    bg,
  };
}
