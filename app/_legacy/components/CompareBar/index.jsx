"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import { MdCompareArrows } from 'react-icons/md';
import { useCompare } from '../../context/CompareContext';
import { imgUrl } from '../../utils/imageUrl';

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare, maxCompare } = useCompare();
  const pathname = usePathname();

  if (compareList.length === 0) return null;
  if (pathname === '/compare') return null;

  return (
    <div className='fixed bottom-[60px] md:bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#1565C0] shadow-[0_-4px_24px_rgba(0,0,0,0.12)]'>
      <div className='container py-2.5 flex items-center gap-3 flex-wrap'>
        <div className='flex items-center gap-2 text-[13px] font-[700] text-gray-700 mr-1'>
          <MdCompareArrows className='text-[#1565C0] text-[20px]' />
          Compare ({compareList.length}/{maxCompare})
        </div>

        <div className='flex items-center gap-2 flex-1 flex-wrap'>
          {compareList.map(p => (
            <div key={p.id} className='flex items-center gap-1.5 bg-[#F0F5FF] border border-[#C5D9F5] rounded-xl px-2.5 py-1.5'>
              {p.images?.[0] && (
                <img src={imgUrl(p.images[0])} alt={p.name} className='w-8 h-8 object-contain rounded-lg bg-white' />
              )}
              <span className='text-[12px] font-[500] text-gray-700 max-w-[120px] truncate'>{p.name}</span>
              <button onClick={() => removeFromCompare(p.id)} className='ml-0.5 text-gray-400 hover:text-red-500 transition-colors'>
                <IoClose className='text-[13px]' />
              </button>
            </div>
          ))}

          {compareList.length < maxCompare && (
            <div className='flex items-center justify-center w-[36px] h-[36px] border-2 border-dashed border-gray-200 rounded-xl text-gray-300 text-[20px]'>
              +
            </div>
          )}
        </div>

        <div className='flex items-center gap-2 ml-auto flex-shrink-0'>
          <button
            onClick={clearCompare}
            className='text-[12px] text-gray-400 hover:text-red-500 font-[600] transition-colors'
          >
            Clear
          </button>
          <Link
            href='/compare'
            className='bg-[#1565C0] hover:bg-[#0D47A1] text-white text-[13px] font-[700] px-4 py-2 rounded-xl transition-colors'
          >
            Compare Now →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
