"use client";

import React from 'react'
import { useState } from 'react'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import QtyBox from '../QtyBox';

const ProductDetailsComponent = () => {
    
    const [productActionIndex , setProductActionIndex] = useState(null)
    
  return (
    <>
                    <h1 className='text-[24px] font-[600] mb-2'>Large 33 L Laptop Backpack 33 L Waterproof 5-Zipper Compartment Premium Daily Use Bags For All Day Support Blue</h1>
                    <div className='flex items-center gap-2'>
                        <span className='text-gray-400 text-[13px]'>
                            Brands : <span className='font-[500] uppercase opacity-80 text-black'>Stylato</span>
                        </span>

                        <Rating name="size-small" defaultValue={4} size="small" readOnly/>
                        <span className='text-[13px] cursor-pointer'>Review (5)</span>
                    </div>

                    <div className='flex items-center gap-4 mt-4'>
                        <span className='text-gray-500 font-[500] line-through oldPrice text-[18px]'>580.00</span>
                        <span className='font-[600] newPrice text-primary text-[20px]'>580.00</span>

                        <span className='text-[14px]'>Available in Stock : <span className='font-semibold text-green-600'>147 Items</span></span>
                    </div>

                    <p className='pr-10 mt-3 mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                        Quibusdam quos commodi expedita rem quidem sint excepturi ea, laudantium, 
                        odio consequatur non nulla nostrum totam quod id quo vero! Perspiciatis, ullam.
                    </p>

                    <div className='flex items-center gap-3'>
                        <span className='text-[16px]'>Size:</span>
                        <div className='flex items-center gap-1 actions'>
                            <Button className={`${productActionIndex === 0 ? '!bg-primary !text-white' : ''}`}
                             onClick={()=>setProductActionIndex(0)}>S</Button>
                            <Button className={`${productActionIndex === 1 ? '!bg-primary !text-white' : ''}`}
                             onClick={()=>setProductActionIndex(1)}>M</Button>
                            <Button className={`${productActionIndex === 2 ? '!bg-primary !text-white' : ''}`}
                             onClick={()=>setProductActionIndex(2)}>L</Button>
                            <Button className={`${productActionIndex === 3 ? '!bg-primary !text-white' : ''}`}
                             onClick={()=>setProductActionIndex(3)}>XL</Button>
                            <Button className={`${productActionIndex === 4 ? '!bg-primary !text-white' : ''}`}
                             onClick={()=>setProductActionIndex(4)}>XXL</Button>
                        </div>
                    </div>

                    <p className='text-[14px] opacity-80 mt-5 text-[#000] mb-2'>Free Shipping (Est. Delivery Time 2-3 Days)</p>

                    <div className='flex items-center gap-4 py-2'>
                        <div className='qtyBoxWrapper w-[70px]'>
                        <QtyBox/>
                        </div>
                        
                        <Button className='flex items-center gap-2 btn-org'>
                        <MdOutlineShoppingCart className='text-[22px]'/> Add to Cart
                        </Button>
                    </div>

                    <div className='flex items-center gap-4 mt-4'>
                        <span className='flex items-center gap-1 text-[15px] link cursor-pointer font-[500]'><FaRegHeart className='text-[18px]'/>Add to Wishlist</span>
                        <span className='flex items-center gap-1 text-[15px] link cursor-pointer font-[500]'><IoGitCompareOutline className='text-[18px]'/>Add to Compare</span>
                    </div>
    </>
  )
}

export default ProductDetailsComponent