import React, { useState } from 'react'

import { Button } from '@mui/material';
import MyListItems from './MyListItems';
import AccountSidebar from '../../components/AccountSidebar';


const MyList = () => {
  
  return (
    <section className='w-full py-10'>
        <div className='container flex gap-5'>
            <div className='col1 w-[20%]'>
              <AccountSidebar/>
            </div>

            <div className='col2 w-[70%]'>
              <div className='bg-white rounded-md shadow-md'>
                    <div className='px-3 py-5 border-b border-[rgba(0,0,0,0.1)]'>
                        <h2>My List</h2>
                        <p className='mt-0 mb-0'>
                            There are <span className='font-bold text-primary'>2</span> 
                            products in your cart
                        </p>
                    </div>
                    
                    <MyListItems />
                    <MyListItems />
                    <MyListItems />
                    <MyListItems />
                    <MyListItems />
                    <MyListItems />
                    <MyListItems />
                </div>
            </div>
        </div>
    </section>
  )
}

export default MyList