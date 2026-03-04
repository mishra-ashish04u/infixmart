import React, { useState } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import './style.css'
import {Collapse} from 'react-collapse';
import { FaAngleDown } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6";
import Button from '@mui/material/Button';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import Rating from '@mui/material/Rating';



const SideBar = () => {
    
    const [isOpenCategoryFilter,setisOpenCategoryFilter] = useState(true)
    const [isOpenAvailabilityFilter,setisOpenAvailabilityFilter] = useState(true)
    const [isOpenSizeFilter,setisOpenSizeFilter] = useState(true)
    
  return (
    <aside className='py-5 sideBar'>
        <div className='box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Shop by Category 
                <Button className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
                 onClick={()=>setisOpenCategoryFilter(!isOpenCategoryFilter)}>
                    {
                        isOpenCategoryFilter === true ? <FaAngleUp/> : <FaAngleDown/>
                    }
                </Button>
            </h3>
            <Collapse isOpened={isOpenCategoryFilter}>
                <div className='relative px-4 scroll -left-[13px]'>
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Fashion" className='w-full' />
                </div>
            </Collapse>
        </div>

        <div className='box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Availability
                <Button className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
                 onClick={()=>setisOpenAvailabilityFilter(!isOpenAvailabilityFilter)}>
                    {
                        isOpenAvailabilityFilter === true ? <FaAngleUp/> : <FaAngleDown/>
                    }
                </Button>
            </h3>
            <Collapse isOpened={isOpenAvailabilityFilter}>
                <div className='relative px-4 scroll -left-[13px]'>
                    <FormControlLabel control={<Checkbox size='small' />} label="Available (17)" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="In Stock (10)" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Not Available (1)" className='w-full' />
                </div>
            </Collapse>
        </div>

        <div className='mt-3 box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Size
                <Button className='!w-[30px] !h-[30px] !min-w-[30px] !rounded-full !ml-auto !text-black'
                 onClick={()=>setisOpenSizeFilter(!isOpenSizeFilter)}>
                    {
                        isOpenSizeFilter === true ? <FaAngleUp/> : <FaAngleDown/>
                    }
                </Button>
            </h3>
            <Collapse isOpened={isOpenSizeFilter}>
                <div className='relative px-4 scroll -left-[13px]'>
                    <FormControlLabel control={<Checkbox size='small' />} label="Small (17)" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Medium (10)" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="Large (1)" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="XL (1)" className='w-full' />
                    <FormControlLabel control={<Checkbox size='small' />} label="XXL (1)" className='w-full' />
                </div>
            </Collapse>
        </div>

        <div className='mt-4 box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Filter By Price
            </h3>

            <RangeSlider />
            <div className='flex pt-4 pb-2 priceRange'>
                <span className='text-[13px] flex items-center'>
                    From:&nbsp;<div className='font-semibold text-dark'>Rs {100}</div>
                </span>
                <span className='ml-auto text-[13px]'>
                    From:&nbsp;<strong className='text-dark'>Rs {5000}</strong>
                </span>
            </div>
        </div>

        <div className='mt-4 box'>
            <h3 className='w-full mb-3 text-[16px] font-[600] flex items-center pr-5'>
                Filter By Rating
            </h3>
            
            <div>
                <div className='w-full'>
                    <Rating name="size-small" defaultValue={5} size="small" readOnly/>
                </div>
                <div className='w-full'>
                    <Rating name="size-small" defaultValue={4} size="small" readOnly/>
                </div>
                <div className='w-full'>
                    <Rating name="size-small" defaultValue={3} size="small" readOnly/>
                </div>
                <div className='w-full'>
                    <Rating name="size-small" defaultValue={2} size="small" readOnly/>
                </div>
                <div className='w-full'>
                    <Rating name="size-small" defaultValue={1} size="small" readOnly/>
                </div>
            </div>
        </div>
    </aside>
  )
}

export default SideBar