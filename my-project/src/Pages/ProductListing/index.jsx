import React, { useState } from 'react'
import SideBar from '../../components/sideBar'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import ProductItem from '../../components/ProductItem';
import Button from '@mui/material/Button';
import { IoGrid } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ProductItemListView from '../../components/ProductItemListView';
import Pagination from '@mui/material/Pagination';


const ProductListing = () => {

  const[ItemView,setItemView] = useState("grid")

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <section className='py-5 pb-0'>
        <div className='container'>
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/" className='transition-all link'>
                Home
                </Link>
                <Link
                underline="hover"
                color="inherit"
                href="/"
                className='transition-all link'
                >
                    Fashion
                </Link>
            </Breadcrumbs>
        </div>
        <div className='p-2 mt-4 bg-white'>
            <div className='container flex gap-3'>
                <div className='sideBarWrapper w-[20%] h-full'>
                    <SideBar/>
                </div>

                <div className='rightContent w-[80%] py-3'>
                    <div className='bg-[#f1f1f1] w-full p-2 mb-4 rounded-md flex items-center justify-between'>
                        <div className='flex items-center col1 itemViewActions'>
                            <Button 
                            className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000]
                                       ${ItemView === 'list' && 'active'}`}
                            onClick={()=>setItemView("list")}
                            >
                                <IoMenu className='text-[rgba(0,0,0,0.7)]'/>
                            </Button>
                            
                            <Button 
                            className={`!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000]
                                       ${ItemView === 'grid' && 'active'}`}
                            onClick={()=>setItemView("grid")}
                            >
                                <IoGrid className='text-[rgba(0,0,0,0.7)]'/>
                            </Button>
                            
                            <span className='text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]'>There are 27 products.</span>
                        </div>

                        <div className='flex items-center justify-end gap-3 pr-4 ml-auto col2'>
                        <span className='text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]'>Sort By:</span>

                        <Button
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                            className='!bg-white !text-[14px] !text-[#000] !captialize !border-2 !border-[#000]'
                        >
                            Sales, heighest to lowest
                        </Button>

                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            }}
                        >
                            <MenuItem onClick={handleClose}
                            className='!text-[13px] !text-[#000] !captialize'
                            >Sales, heighest to lowest</MenuItem>
                            <MenuItem onClick={handleClose}
                            className='!text-[13px] !text-[#000] !captialize'
                            >Relevance</MenuItem>
                            <MenuItem onClick={handleClose}
                            className='!text-[13px] !text-[#000] !captialize'
                            >Name A to Z</MenuItem>
                            <MenuItem onClick={handleClose}
                            className='!text-[13px] !text-[#000] !captialize'
                            >Name Z to A</MenuItem>
                            <MenuItem onClick={handleClose}
                            className='!text-[13px] !text-[#000] !captialize'
                            >Price low to high</MenuItem>
                            <MenuItem onClick={handleClose}
                            className='!text-[13px] !text-[#000] !captialize'
                            >Price high to low</MenuItem>
                        </Menu>

                        
                        </div>
                    </div>
                    
                    <div className={`gap-4 ${ItemView==='grid' ? 'grid grid-cols-4 md:grid-cols-4' : 'grid grid-cols-1 md:grid-cols-1'}`}>
                        
                        {
                            ItemView === 'grid' ?
                            <>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                                <ProductItem/>
                            </>
                            :
                            <>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                                <ProductItemListView/>
                            </>
                        }
                        
                    </div>

                    <div className='flex items-center justify-center mt-10'>
                        <Pagination count={10} showFirstButton showLastButton />
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default ProductListing