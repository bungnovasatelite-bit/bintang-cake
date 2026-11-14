import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string, note?: string, priceOverride?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  lastAddedItemName: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Keranjang awal kosong agar pembeli memilih kuenya sendiri
const INITIAL_CART: CartItem[] = [];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bintang_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    return INITIAL_CART;
  });

  const [lastAddedItemName, setLastAddedItemName] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('bintang_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedSize?: string,
    note?: string,
    priceOverride?: number
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.selectedSize === selectedSize
      );

      const effectivePrice = priceOverride !== undefined 
        ? priceOverride 
        : (selectedSize && product.sizes 
            ? (product.sizes.find(s => s.name === selectedSize)?.price || product.price)
            : product.price);

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          price: effectivePrice,
          packageType: selectedSize || next[existingIndex].packageType,
          note: note || next[existingIndex].note
        };
        return next;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        name: product.name,
        packageType: selectedSize || product.packageType || 'Kemasan Standar',
        price: effectivePrice,
        quantity,
        image: product.image,
        selectedSize,
        note,
      };

      return [...prevItems, newItem];
    });

    setLastAddedItemName(product.name);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearToast = () => setLastAddedItemName(null);

  // Total unique items count or total quantity count (screenshot displays '2' as badge for the 2 product types)
  const totalItems = items.length; // or items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        lastAddedItemName,
        clearToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
