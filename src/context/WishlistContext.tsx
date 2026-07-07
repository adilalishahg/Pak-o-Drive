'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logInteraction } from '../components/common/AnalyticsTracker';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pakodrive_wishlist');
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('pakodrive_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isHydrated]);

  const toggleWishlist = (productId: string) => {
    if (!productId) return;

    setWishlist((prev) => {
      const exists = prev.includes(productId);
      let updated: string[];
      if (exists) {
        updated = prev.filter((id) => id !== productId);
        if (typeof window !== 'undefined') {
          logInteraction('remove_from_wishlist', window.location.pathname, { productId });
        }
      } else {
        updated = [...prev, productId];
        if (typeof window !== 'undefined') {
          logInteraction('add_to_wishlist', window.location.pathname, { productId });
        }
      }
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
