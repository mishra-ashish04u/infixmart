import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getData, postData, deleteData } from '../utils/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    const res = await getData('/api/mylist');
    if (res && !res.error) setWishlistItems(res.data || []);
    else setWishlistItems([]);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const wishlistCount = wishlistItems.length;

  const isWishlisted = (productId) =>
    wishlistItems.some((i) => i.productId === productId);

  const toggleWishlist = async (product) => {
    const existing = wishlistItems.find((i) => i.productId === product.id);
    if (existing) {
      const res = await deleteData(`/api/mylist/remove/${existing.id}`);
      if (res && !res.error) {
        setWishlistItems((prev) => prev.filter((i) => i.id !== existing.id));
        toast('Removed from wishlist', { duration: 1500 });
      } else {
        toast.error(res?.message === 'Unauthorized' ? 'Please login to save items' : (res?.message || 'Could not update wishlist'));
      }
    } else {
      const res = await postData('/api/mylist/add', {
        productId: product.id,
        productTitle: product.name,
        image: product.images?.[0] || '',
        rating: product.rating || 0,
        price: product.price || 0,
        oldPrice: product.oldprice || 0,
        discount: product.discount || 0,
        brand: product.brand || '',
      });
      if (res && !res.error) {
        fetchWishlist();
        toast.success('Added to wishlist!', { duration: 1500 });
      } else {
        toast.error(res?.message === 'Unauthorized' ? 'Please login to save items' : (res?.message || 'Could not update wishlist'));
      }
    }
  };

  const clearWishlist = () => setWishlistItems([]);

  return (
    <WishlistContext.Provider value={{ wishlistItems, wishlistCount, isWishlisted, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
