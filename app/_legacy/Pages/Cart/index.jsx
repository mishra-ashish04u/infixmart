"use client";

import React, { useState, useRef, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoTrashOutline } from 'react-icons/io5';
import { FaMinus, FaPlus, FaTruck, FaCheck } from 'react-icons/fa';
import { MdOutlineShoppingCart, MdWorkspacePremium } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useCart } from '../../context/CartContext';
import { imgUrl } from '../../utils/imageUrl';
import EmptyState from '../../components/EmptyState';
import useStoreSettings from '../../hooks/useStoreSettings';
import CartTimeline from '../../components/CartTimeline';
import { MyContext } from '../../LegacyProviders';

const MEMBER_MIN_ORDER = 499;

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const SHIPPING_COST = 49;

const CartItemRow = ({ item }) => {
  const { updateQty, removeItem } = useCart();
  const [qty, setQty] = useState(item.quantity || 1);
  const debounceRef = useRef(null);

  const product = item.productId; // populated product object from backend
  const image = imgUrl(
    Array.isArray(product?.images) ? product.images[0] : product?.images?.[0]
  );
  const price = product?.price || 0;
  const lineTotal = price * qty;

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    setQty(newQty);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateQty(item.id, newQty);
    }, 400);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className='flex items-start gap-4 p-4 border-b border-[rgba(0,0,0,0.08)] last:border-b-0'>
      {/* Image */}
      <Link href={`/product/${product?.id}`} className='flex-shrink-0'>
        <img
          src={image || 'https://via.placeholder.com/80'}
          alt={product?.name}
          className='w-[80px] h-[80px] object-cover rounded-lg border border-gray-100'
        />
      </Link>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        {product?.brand && (
          <p className='text-[12px] text-gray-400 mb-0 mt-0 leading-4'>{product.brand}</p>
        )}
        <Link href={`/product/${product?.id}`} className='font-[500] text-[14px] hover:text-[#1565C0] transition-colors line-clamp-2 block'>
          {product?.name}
        </Link>

        {/* Variant tag */}
        {item.variant && (
          <span className='inline-block bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded mt-1'>
            {item.variant}
          </span>
        )}

        <div className='flex items-center gap-4 mt-2 flex-wrap'>
          {/* Qty stepper */}
          <div className='flex items-center border border-[#1565C0] rounded overflow-hidden'>
            <button
              className='w-7 h-7 flex items-center justify-center bg-[#f0f5ff] hover:bg-[#1565C0] hover:text-white transition-colors'
              onClick={() => handleQtyChange(qty - 1)}
            >
              <FaMinus className='text-[10px]' />
            </button>
            <span className='w-8 text-center text-[13px] font-[600]'>{qty}</span>
            <button
              className='w-7 h-7 flex items-center justify-center bg-[#f0f5ff] hover:bg-[#1565C0] hover:text-white transition-colors'
              onClick={() => handleQtyChange(qty + 1)}
            >
              <FaPlus className='text-[10px]' />
            </button>
          </div>

          {/* Unit price */}
          <span className='text-[13px] text-gray-500'>₹{fmt(price)} × {qty}</span>

          {/* Line total */}
          <span className='text-[14px] font-[700] text-[#1565C0]'>₹{fmt(lineTotal)}</span>
        </div>
      </div>

      {/* Remove */}
      <button
        className='flex-shrink-0 text-[#E53935] hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors mt-1'
        onClick={() => removeItem(item.id)}
        title='Remove'
      >
        <IoTrashOutline className='text-[18px]' />
      </button>
    </div>
  );
};

const CartPage = () => {
  const { cartItems } = useCart();
  const router = useRouter();
  const { minOrderValue, cartMilestones, membershipPrice, membershipEnabled } = useStoreSettings();
  const { userData, isLogin, openMembershipModal } = useContext(MyContext);

  const isMember = Boolean(userData?.is_member);
  const effectiveMinOrder = isMember ? MEMBER_MIN_ORDER : minOrderValue;

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.productId?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const parsedMilestones = Array.isArray(cartMilestones) ? cartMilestones : [];
  const freeShippingMilestone = parsedMilestones.find((m) => m.type === 'free_shipping' && m.enabled !== false);
  const milestoneShippingFree = !!(freeShippingMilestone && subtotal >= Number(freeShippingMilestone.amount));
  const shippingFree = isMember || subtotal >= minOrderValue || milestoneShippingFree;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const belowMinOrder = subtotal < effectiveMinOrder;
  const showMemberCTA = isLogin && !isMember && membershipEnabled && subtotal >= MEMBER_MIN_ORDER && subtotal < minOrderValue;

  if (cartItems.length === 0) {
    return (
      <section className='py-20'>
        <EmptyState
          icon={<MdOutlineShoppingCart />}
          title="Your cart is empty"
          subtitle="Looks like you haven't added anything yet."
          actionLabel="Shop Now"
          onAction={() => router.push('/productListing')}
        />
      </section>
    );
  }

  return (
    <section className='py-6 pb-12'>
      <div className='container'>
        <h1 className='text-[22px] font-[700] mb-1'>Your Cart</h1>
        <p className='text-[13px] text-gray-500 mb-5'>
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </p>

        <div className='flex flex-col lg:flex-row gap-5 items-start'>
          {/* ── Left: item list ── */}
          <div className='flex-1 min-w-0 w-full'>
            {/* Cart progress timeline */}
            <CartTimeline cartSubtotal={subtotal} />

            <div className='bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]'>
              {cartItems.map(item => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <Link
              href='/productListing'
              className='inline-block mt-4 text-[#1565C0] text-[13px] hover:underline'
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Right: summary ── */}
          <div className='w-full lg:w-[320px] lg:flex-shrink-0 lg:sticky lg:top-4'>
            <div className='bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)] p-5'>
              {/* Member badge */}
              {isMember && (
                <div className='flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-3 py-2 mb-3'>
                  <MdWorkspacePremium className='text-amber-500 text-[18px] flex-shrink-0' />
                  <div>
                    <p className='text-[12px] font-[700] text-amber-700'>InfixPass Active</p>
                    <p className='text-[11px] text-amber-600'>Free delivery + ₹499 minimum applied</p>
                  </div>
                </div>
              )}

              <h2 className='text-[16px] font-[700] mb-4 border-b pb-3'>Price Details</h2>

              <div className='space-y-3 text-[14px]'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Subtotal ({cartItems.length} items)</span>
                  <span className='font-[500]'>₹{fmt(subtotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Shipping</span>
                  {shippingFree ? (
                    <span className='font-[600] text-green-600'>FREE</span>
                  ) : (
                    <span className='font-[500]'>₹{fmt(SHIPPING_COST)}</span>
                  )}
                </div>
                {milestoneShippingFree && (
                  <p className='text-[12px] font-[600] text-[#00A651] flex items-center gap-1'>
                    🚚 Free Shipping Unlocked!
                  </p>
                )}
              </div>

              <div className='border-t mt-4 pt-4 flex justify-between items-center'>
                <span className='font-[600] text-[15px]'>Total</span>
                <span className='font-[700] text-[#1565C0] text-[18px]'>₹{fmt(total)}</span>
              </div>

              {belowMinOrder && !showMemberCTA && (
                <div className='mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-[12px] text-amber-800 leading-5'>
                  Minimum order value is ₹{fmt(effectiveMinOrder)}. Add{' '}
                  <span className='font-[700]'>₹{fmt(effectiveMinOrder - subtotal)}</span> more to checkout.
                </div>
              )}

              {/* InfixPass CTA — shown when cart ₹499–₹998 and not a member */}
              {showMemberCTA && (
                <div className='mt-4 rounded-2xl overflow-hidden border border-blue-200 shadow-sm'>
                  {/* Top bar */}
                  <div className='bg-gradient-to-r from-[#0D47A1] to-[#1565C0] px-4 py-2.5 flex items-center gap-2'>
                    <MdWorkspacePremium className='text-amber-400 text-[18px] flex-shrink-0' />
                    <span className='text-white text-[12px] font-[700]'>Unlock checkout with InfixPass</span>
                  </div>
                  {/* Body */}
                  <div className='bg-blue-50 px-4 py-3'>
                    <p className='text-[12px] text-gray-600 mb-2 leading-4'>
                      Your cart is <span className='font-[700] text-[#1565C0]'>₹{fmt(subtotal)}</span>.
                      Members can checkout from <span className='font-[700]'>₹499</span> with{' '}
                      <span className='font-[700]'>free delivery</span>.
                    </p>
                    <div className='flex items-center gap-3 mb-3 text-[11px] text-gray-500'>
                      <span className='flex items-center gap-1'><FaCheck className='text-green-500 text-[9px]' /> ₹499 min order</span>
                      <span className='flex items-center gap-1'><FaTruck className='text-green-500 text-[9px]' /> Free delivery</span>
                    </div>
                    <button
                      onClick={openMembershipModal}
                      className='w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white py-2.5 rounded-xl font-[700] text-[13px] transition-colors flex items-center justify-center gap-1.5'
                    >
                      <MdWorkspacePremium className='text-amber-300 text-[15px]' />
                      Get InfixPass — ₹{membershipPrice || 49} only
                      <BsArrowRight className='text-[13px]' />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => isLogin ? router.push('/checkout') : router.push('/login?redirect=/cart')}
                disabled={belowMinOrder && isLogin}
                className='w-full mt-5 bg-[#1565C0] text-white py-3 rounded-lg font-[600] text-[15px] hover:bg-[#0D47A1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLogin ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>

              <div className='mt-3 flex items-center justify-center gap-2 text-[12px] text-gray-400'>
                <span>🔒</span>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
