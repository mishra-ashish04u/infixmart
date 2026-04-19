"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import { postData } from '../../utils/api';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'infix_exit_popup_shown';
const EXCLUDED = ['/login', '/register', '/checkout', '/admin'];

const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const triggered = useRef(false);
  const pathname = usePathname();

  const isExcluded = EXCLUDED.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isExcluded) return;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY)) return;

    const handleMouseLeave = (e) => {
      if (triggered.current) return;
      if (e.clientY <= 5) {
        triggered.current = true;
        setTimeout(() => setOpen(true), 200);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isExcluded]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email'); return;
    }
    setSubmitting(true);
    await postData('/api/newsletter/subscribe', { email: email.trim() });
    setSubmitting(false);
    setDone(true);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[300] flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={close} />
      <div className='relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInUp_0.3s_ease]'>
        <button
          onClick={close}
          className='absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10'
        >
          <IoClose className='text-[16px]' />
        </button>

        {/* Top banner */}
        <div className='bg-gradient-to-r from-[#1565C0] to-[#1976D2] px-6 py-5 text-center text-white'>
          <p className='text-[28px] font-[900] leading-tight'>Wait!</p>
          <p className='text-[16px] font-[700] mt-1'>Get 10% off your first order</p>
        </div>

        <div className='px-6 py-5'>
          {done ? (
            <div className='text-center py-4'>
              <p className='text-[40px] mb-2'>🎉</p>
              <p className='text-[16px] font-[800] text-gray-800'>You're in!</p>
              <p className='text-[13px] text-gray-500 mt-1'>Check your email for your exclusive coupon.</p>
              <button onClick={close} className='mt-4 bg-[#1565C0] text-white text-[13px] font-[700] px-6 py-2.5 rounded-xl hover:bg-[#0D47A1] transition-colors'>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <p className='text-[14px] text-gray-600 text-center mb-4'>
                Subscribe to get your <strong>exclusive 10% discount coupon</strong> + early access to flash sales.
              </p>
              <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Enter your email address'
                  className='border-2 border-gray-200 focus:border-[#1565C0] rounded-xl px-4 py-3 text-[14px] focus:outline-none transition-colors'
                />
                <button
                  type='submit'
                  disabled={submitting}
                  className='bg-[#E53935] hover:bg-[#C62828] text-white font-[800] py-3 rounded-xl text-[14px] transition-colors disabled:opacity-60'
                >
                  {submitting ? 'Sending…' : 'Claim My 10% Off →'}
                </button>
              </form>
              <button onClick={close} className='w-full text-center mt-3 text-[12px] text-gray-400 hover:text-gray-600 transition-colors'>
                No thanks, I'll pay full price
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
