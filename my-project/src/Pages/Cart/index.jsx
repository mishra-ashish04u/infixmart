import React, { useState } from 'react'

import { Button } from '@mui/material';
import CartItems from './CartItems';


const CartPage = () => {
  
  return (
    <section className='py-5 pb-10 section'>
        <div className='container w-[80%] max-w-[80%] flex gap-5'>
            <div className='leftTop w-[70%]'>
                <h2>Your Cart</h2>
                <p className='mt-0'>There are <span className='font-bold text-primary'>2</span> products in your cart</p>
            </div>
            <div className='rightTop w-[30%]'>
                <h2>Cart Total</h2>
            </div>
        </div>
        <div className='container w-[80%] max-w-[80%] flex gap-5'>
            <div className='leftPart w-[70%]'>
                <div className='bg-white rounded-md shadow-md'>
                    <CartItems size='S' qty={1}/>
                    <CartItems size='S' qty={1}/>
                    <CartItems size='S' qty={1}/>
                    <CartItems size='S' qty={1}/>
                    <CartItems size='S' qty={1}/>
                    <CartItems size='S' qty={1}/>
                    <CartItems size='S' qty={1}/>
                </div>
            </div>
            
            <div className='rightPart w-[30%]'>
                <div className='p-5 bg-white rounded-md shadow-md'>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Subtotal</span>
                        <span className='font-bold text-primary'>1,300.00</span>
                    </p>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Shipping</span>
                        <span className='font-bold'>Free</span>
                    </p>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Estimate for</span>
                        <span className='font-bold'>India</span>
                    </p>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Total</span>
                        <span className='font-bold text-primary'>1,300.00</span>
                    </p>

                    <br />
                    
                    <Button className='w-full btn-org btn-lg'>
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    </section>
  )
}

export default CartPage