import React from 'react'
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { BsFillBagCheckFill } from "react-icons/bs";

const Checkout = () => {
  return (
    <section className='py-10 '>
        <div className='container flex gap-5'>
            <div className='leftCol w-[70%]'>
                 <div className='w-full p-5 bg-white rounded-md shadow-md card'>
                    <h1>Billing Details</h1>

                    <form className='w-full mt-5' action="">
                        <div className='flex items-center gap-5 pb-5'>
                            <div className='col w-[50%]'>
                                <h6 className='text-[14px] mb-3 font-[500]'>Full Name*</h6>
                                <TextField  
                                className='w-full'
                                label="Name" 
                                variant="outlined" 
                                size='small' />
                            </div>
                            <div className='col w-[50%]'>
                                <h6 className='text-[14px] mb-3 font-[500]'>Country/Region*</h6>
                                <TextField  
                                className='w-full'
                                label="Country" 
                                variant="outlined" 
                                size='small' />
                            </div>
                        </div>
                        
                        <h6 className='text-[14px] mb-3 font-[500]'>Street Address*</h6>
                        <div className='flex items-center gap-5 pb-5'>
                            <div className='w-full col'>
                                <TextField  
                                className='w-full'
                                label="House No. and Street Name" 
                                variant="outlined" 
                                size='small' />
                            </div>
                        </div>
                        <div className='flex items-center gap-5 pb-5'>
                            <div className='w-full col'>
                                <TextField  
                                className='w-full'
                                label="Apartment, Suite, unit, etc. (optional) " 
                                variant="outlined" 
                                size='small' />
                            </div>
                        </div>

                        <div className='flex items-center gap-5 pb-5'>
                            <div className='col w-[50%]'>
                                <h6 className='text-[14px] mb-3 font-[500]'>Town/City*</h6>
                                <TextField  
                                className='w-full'
                                label="City" 
                                variant="outlined" 
                                size='small' />
                            </div>
                            <div className='col w-[50%]'>
                                <h6 className='text-[14px] mb-3 font-[500]'>State/Province*</h6>
                                <TextField  
                                className='w-full'
                                label="State" 
                                variant="outlined" 
                                size='small' />
                            </div>
                        </div>

                        <h6 className='text-[14px] mb-3 font-[500]'>Postalcode/Zip*</h6>
                        <div className='flex items-center gap-5 pb-5'>
                            <div className='w-full col'>
                                <TextField  
                                className='w-full'
                                label="Zip Code" 
                                variant="outlined" 
                                size='small' />
                            </div>
                        </div>

                        <div className='flex items-center gap-5 pb-5'>
                            <div className='col w-[50%]'>
                                <h6 className='text-[14px] mb-3 font-[500]'>Phone no.*</h6>
                                <TextField  
                                className='w-full'
                                label="Phone" 
                                variant="outlined" 
                                size='small' />
                            </div>
                            <div className='col w-[50%]'>
                                <h6 className='text-[14px] mb-3 font-[500]'>Email Address*</h6>
                                <TextField  
                                className='w-full'
                                label="Email" 
                                variant="outlined" 
                                size='small' />
                            </div>
                        </div>
                    </form>
                 </div>
            </div>

            <div className='rightCol w-[30%]'>
                <div className='p-5 bg-white rounded-md shadow-md card'>
                    <h2 className='mb-4'>Your Order</h2>

                    <div className='flex items-center justify-between py-3 border-[rgba(0,0,0,0.1)] border-t border-b'>
                        <span className='text-[14px] font-[600]'>Product</span>
                        <span className='text-[14px] font-[600]'>Subtotal</span>
                    </div>
                    
                    <div className='scroll mb-5 max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2'>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3 part1'>
                                <div className='img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer'>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" alt=""
                                    className='w-full transition-all group-hover:scale-105' />
                                </div>
                                <div className='info'>
                                    <h4 className='text-[14px]'>Sirii Georgette Pink Co... </h4>
                                    <span className='text-[13px]'>Qty: 1</span>
                                </div>
                            </div>
                            <span className='text-[14px] font-[500]'>$100.00</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3 part1'>
                                <div className='img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer'>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" alt=""
                                    className='w-full transition-all group-hover:scale-105' />
                                </div>
                                <div className='info'>
                                    <h4 className='text-[14px]'>Sirii Georgette Pink Co... </h4>
                                    <span className='text-[13px]'>Qty: 1</span>
                                </div>
                            </div>
                            <span className='text-[14px] font-[500]'>$100.00</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3 part1'>
                                <div className='img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer'>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" alt=""
                                    className='w-full transition-all group-hover:scale-105' />
                                </div>
                                <div className='info'>
                                    <h4 className='text-[14px]'>Sirii Georgette Pink Co... </h4>
                                    <span className='text-[13px]'>Qty: 1</span>
                                </div>
                            </div>
                            <span className='text-[14px] font-[500]'>$100.00</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3 part1'>
                                <div className='img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer'>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" alt=""
                                    className='w-full transition-all group-hover:scale-105' />
                                </div>
                                <div className='info'>
                                    <h4 className='text-[14px]'>Sirii Georgette Pink Co... </h4>
                                    <span className='text-[13px]'>Qty: 1</span>
                                </div>
                            </div>
                            <span className='text-[14px] font-[500]'>$100.00</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3 part1'>
                                <div className='img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer'>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" alt=""
                                    className='w-full transition-all group-hover:scale-105' />
                                </div>
                                <div className='info'>
                                    <h4 className='text-[14px]'>Sirii Georgette Pink Co... </h4>
                                    <span className='text-[13px]'>Qty: 1</span>
                                </div>
                            </div>
                            <span className='text-[14px] font-[500]'>$100.00</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-3 part1'>
                                <div className='img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer'>
                                    <img src="https://serviceapi.spicezgold.com/download/1742463096955_hbhb1.jpg" alt=""
                                    className='w-full transition-all group-hover:scale-105' />
                                </div>
                                <div className='info'>
                                    <h4 className='text-[14px]'>Sirii Georgette Pink Co... </h4>
                                    <span className='text-[13px]'>Qty: 1</span>
                                </div>
                            </div>
                            <span className='text-[14px] font-[500]'>$100.00</span>
                        </div>
                    </div>
                    
                    <Button className='flex items-center w-full gap-2 btn-org btn-lg'>
                        <BsFillBagCheckFill className='text-[20px]'/>
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Checkout