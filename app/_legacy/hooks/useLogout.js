import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../LegacyProviders';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getData } from '../utils/api';

const useLogout = () => {
  const context = useContext(MyContext);
  const { clearCart } = useCart();
  const { clearWishlist } = useWishlist();
  const navigate = useNavigate();

  return async () => {
    // server-side logout clears httpOnly cookies
    await getData('/api/user/logout').catch(() => {});
    context.setIsLogin(false);
    context.setUserData(null);
    clearCart();
    clearWishlist();
    navigate('/login');
  };
};

export default useLogout;
