'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IProduct, ICartItem, IProductVariant } from '../types';
import { logInteraction } from '../components/common/AnalyticsTracker';

interface CartContextType {
  cart: ICartItem[];
  addToCart: (product: IProduct, quantity?: number, variant?: IProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('pakodrive_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('pakodrive_cart', JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const addToCart = (product: IProduct, quantity = 1, variant?: IProductVariant) => {
    if (!product._id) return;

    const finalPrice = variant ? variant.price : product.price;

    // Log tracking interaction
    logInteraction('add_to_cart', window.location.pathname, {
      productId: product._id,
      name: product.name,
      variantName: variant?.name,
      price: finalPrice,
      quantity,
    });

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product._id === product._id && item.variant?._id === variant?._id
      );
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }
      return [...prevCart, { product, quantity, variant }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    const targetVariantId = variantId || undefined;
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const itemVariantId = item.variant?._id || undefined;
        return !(item.product._id === productId && itemVariantId === targetVariantId);
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const targetVariantId = variantId || undefined;
    if (quantity <= 0) {
      removeFromCart(productId, targetVariantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemVariantId = item.variant?._id || undefined;
        return item.product._id === productId && itemVariantId === targetVariantId
          ? { ...item, quantity }
          : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
