import Button from '@mui/material/Button'
import React from 'react'
import { RiMenu2Fill } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { IoRocketOutline } from "react-icons/io5";
import CategoryPanel from './CategoryPanel';
import { useState } from 'react';
import './style.css'

const Navigation = () => {
    const [isopenCatPanel, setIsOpenCatPanel] = useState(false)

    const openCategoryPanel = () => {
        setIsOpenCatPanel(!isopenCatPanel)

    }

  return (
    <>
    <nav>
        <div className='container flex items-center justify-end w-full gap-8'>
            <div className='col_1 w-[25%]'>
                <Button className='!text-black gap-2 w-full' onClick={openCategoryPanel}>
                    <RiMenu2Fill  className='text-[18px]'/>
                    SHOP BY CATEGORIES
                    <FaAngleDown className='text-[13px] ml-auto font-bold'/>
                </Button>
            </div>
            <div className='col_2 w-[50%]'>
                <ul className='flex items-center gap-3 nav'>
                    <li className='list-none'>
                        <Link to='/' className='text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                Home
                            </Button>
                        </Link>
                    </li>
                    <li className='relative list-none'>
                        <Link to='/product/856' className='link transition text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                Fashion
                            </Button>
                        </Link>

                        <div className='submenu absolute top-[120%] left-[0%] min-w-[150px] bg-white shadow-md opacity-0 transition-all'>
                            <ul>
                                <li className='relative w-full list-none'>
                                    <Link to='/' className='w-full'>
                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                            Men
                                        </Button>

                                        <div className='submenu absolute top-[0%] left-[100%] min-w-[150px] bg-white shadow-md opacity-0 transition-all'>
                                            <ul>
                                                <li className='w-full list-none'>
                                                    <Link to='/' className='w-full'>
                                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                                            T-shirt
                                                        </Button>
                                                    </Link>
                                                </li>
                                                <li className='w-full list-none'>
                                                    <Link to='/' className='w-full'>
                                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                                            Jeans
                                                        </Button>
                                                    </Link>
                                                </li>
                                                <li className='w-full list-none'>
                                                    <Link to='/' className='w-full'>
                                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                                            Footwear
                                                        </Button>
                                                    </Link>
                                                </li>
                                                <li className='w-full list-none'>
                                                    <Link to='/' className='w-full'>
                                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                                            Accessories
                                                        </Button>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>

                                    </Link>
                                </li>
                                <li className='w-full list-none'>
                                    <Link to='/' className='w-full'>
                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                            Women
                                        </Button>
                                    </Link>
                                </li>
                                <li className='w-full list-none'>
                                    <Link to='/' className='w-full'>
                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                            Boys
                                        </Button>
                                    </Link>
                                </li>
                                <li className='w-full list-none'>
                                    <Link to='/' className='w-full'>
                                        <Button className='!text-[rgba(0,0,0,0.8)] w-full !text-left !justify-start !rounded-none'>
                                            Girls
                                        </Button>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                    </li>
                    <li className='list-none'>
                        <Link to='/' className='link transition text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                Electronics
                            </Button>
                        </Link>
                    </li>
                    <li className='list-none'>
                        <Link to='/' className='link transition text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                Bags
                            </Button>
                        </Link>
                    </li>
                    <li className='list-none'>
                        <Link to='/' className='link transition text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                Footwear
                            </Button>
                        </Link>
                    </li>
                    <li className='list-none'>
                        <Link to='/' className='link transition text-[14px] font-[500]'>
                            <Button className='link transition !font-[500] !text-[rgba(0,0,0,0.8)] hover:!text-[#ff5252] !py-4'>
                                More
                            </Button>
                        </Link>
                    </li>
                </ul>
            </div>
            <div className='col_3 w-[25%]'>
                <p className='text-[13px] font-[500] flex items-center gap-3 mb-0 mt-0'>
                    <IoRocketOutline className='text-[18px] font-[500]'/>
                    Free Delivery above 999
                </p>
            </div>
        </div>
    </nav>

    {/* category panel component */}
    <CategoryPanel 
    openCategoryPanel={openCategoryPanel} 
    isopenCatPanel={isopenCatPanel}
    setIsOpenCatPanel={setIsOpenCatPanel}/>
    </>
  )
}

export default Navigation