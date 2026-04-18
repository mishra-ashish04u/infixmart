"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { getData, postData, putData, deleteData } from '../utils/api';

const CartContext = createContext();

const GUEST_KEY = 'infix_guest_cart';

function loadGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveGuest(items) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {}
}

function clearGuest() {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {}
}

export const CartProvider = ({ children, enabled = true }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const prevEnabled = useRef(enabled);

  const computeCount = (items) => items.reduce((s, i) => s + (i.quantity || 1), 0);

  // ── Logged-in: fetch from API ──────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    const res = await getData('/api/cart');
    if (res && !res.error) {
      const items = res.cartItem || [];
      setCartItems(items);
      setCartCount(computeCount(items));
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  // ── Guest: read from localStorage ─────────────────────────────────────────
  const loadGuestCart = useCallback(() => {
    const items = loadGuest();
    setCartItems(items);
    setCartCount(computeCount(items));
  }, []);

  // ── Merge guest cart into server on login ──────────────────────────────────
  const mergeGuestCart = useCallback(async () => {
    const guest = loadGuest();
    if (guest.length === 0) return;
    await Promise.all(
      guest.map((g) =>
        postData('/api/cart/add', { productId: g.productId?.id || g.productId, quantity: g.quantity || 1 }).catch(() => null)
      )
    );
    clearGuest();
  }, []);

  useEffect(() => {
    const wasEnabled = prevEnabled.current;
    prevEnabled.current = enabled;

    if (enabled) {
      if (!wasEnabled) {
        // Just logged in — merge guest cart first, then fetch
        mergeGuestCart().then(() => fetchCart());
      } else {
        fetchCart();
      }
    } else {
      // Not logged in — use localStorage guest cart
      loadGuestCart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ── addToCart ──────────────────────────────────────────────────────────────
  const addToCart = async (productId) => {
    if (enabled) {
      const res = await postData('/api/cart/add', { productId });
      if (res && !res.error) {
        toast.success('Added to cart!', {
          style: { background: '#1565C0', color: '#fff' },
          duration: 2000,
        });
        fetchCart();
      } else {
        toast.error(res?.message === 'Unauthorized' ? 'Please login to add items to cart' : (res?.message || 'Could not add to cart'));
      }
      return res;
    }

    // Guest mode: fetch product data, save to localStorage
    try {
      const res = await getData(`/api/product/getproduct/${productId}`);
      const product = res?.product || res;
      if (!product || product.error) {
        toast.error('Could not add to cart');
        return;
      }

      const current = loadGuest();
      const existing = current.find((i) => (i.productId?.id || i.productId) === productId);
      let updated;
      if (existing) {
        updated = current.map((i) =>
          (i.productId?.id || i.productId) === productId
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      } else {
        updated = [...current, { id: `guest_${Date.now()}_${productId}`, productId: product, quantity: 1 }];
      }
      saveGuest(updated);
      setCartItems(updated);
      setCartCount(computeCount(updated));
      toast.success('Added to cart!', {
        style: { background: '#1565C0', color: '#fff' },
        duration: 2000,
      });
    } catch {
      toast.error('Could not add to cart');
    }
  };

  // ── updateQty ──────────────────────────────────────────────────────────────
  const updateQty = async (cartItemId, quantity) => {
    if (enabled) {
      const res = await putData('/api/cart/update-qty', { _id: cartItemId, quantity });
      if (res && !res.error) {
        setCartItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)));
        setCartCount((prev) => {
          const item = cartItems.find((i) => i.id === cartItemId);
          return Math.max(0, prev + quantity - (item?.quantity || 1));
        });
      }
      return res;
    }

    // Guest
    const updated = loadGuest().map((i) => (i.id === cartItemId ? { ...i, quantity } : i));
    saveGuest(updated);
    setCartItems(updated);
    setCartCount(computeCount(updated));
  };

  // ── removeItem ─────────────────────────────────────────────────────────────
  const removeItem = async (cartItemId) => {
    if (enabled) {
      const res = await deleteData('/api/cart/delete', { _id: cartItemId });
      if (res && !res.error) {
        const removed = cartItems.find((i) => i.id === cartItemId);
        setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
        setCartCount((prev) => Math.max(0, prev - (removed?.quantity || 1)));
        toast.success('Item removed from cart');
      }
      return res;
    }

    // Guest
    const removed = loadGuest().find((i) => i.id === cartItemId);
    const updated = loadGuest().filter((i) => i.id !== cartItemId);
    saveGuest(updated);
    setCartItems(updated);
    setCartCount((prev) => Math.max(0, prev - (removed?.quantity || 1)));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, updateQty, removeItem, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
