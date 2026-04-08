import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getData, postData, putData, deleteData } from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children, enabled = true }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = useCallback(async () => {
    const res = await getData('/api/cart');
    if (res && !res.error) {
      const items = res.cartItem || [];
      setCartItems(items);
      setCartCount(items.reduce((sum, i) => sum + (i.quantity || 1), 0));
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearCart();
      return;
    }

    fetchCart();
  }, [enabled, fetchCart]);

  const addToCart = async (productId) => {
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
  };

  const updateQty = async (cartItemId, quantity) => {
    const res = await putData('/api/cart/update-qty', { _id: cartItemId, quantity });
    if (res && !res.error) {
      setCartItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
      );
      setCartCount((prev) => {
        const item = cartItems.find((i) => i.id === cartItemId);
        return Math.max(0, prev + quantity - (item?.quantity || 1));
      });
    }
    return res;
  };

  const removeItem = async (cartItemId) => {
    const res = await deleteData('/api/cart/delete', { _id: cartItemId });
    if (res && !res.error) {
      const removed = cartItems.find((i) => i.id === cartItemId);
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      setCartCount((prev) => Math.max(0, prev - (removed?.quantity || 1)));
      toast.success('Item removed from cart');
    }
    return res;
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
