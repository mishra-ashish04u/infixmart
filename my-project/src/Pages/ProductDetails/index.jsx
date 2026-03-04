import React, { useState } from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
import ProductZoom from '../../components/ProductZoom';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ProductSlider from '../../components/ProductSlider';
import ProductDetailsComponent from '../../components/ProductDetails';

const ProductDetails = () => {

    const [activeTab , setActiveTab] = useState(0)
    
    
  return (
    <>
        <div className='py-5'>
            <div className='container'>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/" className='transition-all link !text-[14px]'>
                    Home
                    </Link>
                    <Link
                    underline="hover"
                    color="inherit"
                    href="/"
                    className='transition-all link !text-[14px]'
                    >
                        Fashion
                    </Link>
                    <Link
                    underline="hover"
                    color="inherit"
                    href="/"
                    className='transition-all link !text-[14px]'
                    >
                        Stylato Bags
                    </Link>
                </Breadcrumbs>
            </div>
        </div>

        <section className='py-5 bg-white'>
            <div className='container flex items-center gap-8 mb-5'>
                <div className='productZoomContainer w-[40%]'>
                    <ProductZoom/>
                </div>
                
                <div className='productContent w-[60%] pr-10 pl-10'>
                    <ProductDetailsComponent/>
                </div>
            </div>

            <div className='container !mt-10'>
                <div className='flex items-center gap-8'>
                    <span 
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab===0 && 'text-primary'}`}
                    onClick={()=>setActiveTab(0)}>
                        Description
                    </span>
                    <span 
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab===1 && 'text-primary'}`}
                    onClick={()=>setActiveTab(1)}>
                        Product Details
                    </span>
                    <span 
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab===2 && 'text-primary'}`}
                    onClick={()=>setActiveTab(2)}>
                        Reviews (5)
                    </span>
                </div>

                {
                    activeTab === 0 && (
                        <div className='w-full px-8 py-5 rounded-md shadow-md'>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
                        Quia nesciunt ea accusamus dolores rerum aliquid excepturi debitis 
                        corporis maiores rem in dolorum similique praesentium voluptatibus impedit 
                        repudiandae deserunt, magnam error.
                    </p>

                    <h4>LightWeight Design</h4>
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
                        In quae eum temporibus nisi tempore numquam rerum non ipsam,
                        molestias incidunt?
                    </p>

                    <h4>Free Shipping & Return</h4>
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
                        In quae eum temporibus nisi tempore numquam rerum non ipsam,
                        molestias incidunt?
                    </p>

                    <h4>Money Back Guarantee</h4>
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
                        In quae eum temporibus nisi tempore numquam rerum non ipsam,
                        molestias incidunt?
                    </p>

                    <h4>Online Support</h4>
                    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
                        In quae eum temporibus nisi tempore numquam rerum non ipsam,
                        molestias incidunt?
                    </p>
                        </div>
                    )
                }

                {
                    activeTab === 1 && (
                        <div className='w-full px-8 py-5 rounded-md shadow-md'>
                            <div class="relative overflow-x-auto">
                                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">
                                                Product name
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                                Color
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                                Category
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="bg-white border-b border-gray-200">
                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Apple MacBook Pro 17"
                                            </th>
                                            <td class="px-6 py-4">
                                                Silver
                                            </td>
                                            <td class="px-6 py-4">
                                                Laptop
                                            </td>
                                            <td class="px-6 py-4">
                                                $2999
                                            </td>
                                        </tr>
                                        <tr class="bg-white border-b border-gray-200">
                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Microsoft Surface Pro
                                            </th>
                                            <td class="px-6 py-4">
                                                White
                                            </td>
                                            <td class="px-6 py-4">
                                                Laptop PC
                                            </td>
                                            <td class="px-6 py-4">
                                                $1999
                                            </td>
                                        </tr>
                                        <tr class="bg-white">
                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                Magic Mouse 2
                                            </th>
                                            <td class="px-6 py-4">
                                                Black
                                            </td>
                                            <td class="px-6 py-4">
                                                Accessories
                                            </td>
                                            <td class="px-6 py-4">
                                                $99
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 2 && (
                        <div className='px-8 py-5 rounded-md shadow-md w-[80%]'>
                            <div className='w-full productReviewContainer'>
                                <h2 className='text-[18px]'>Customer questions & answers</h2>

                                <div className='reviewScroll w-full scroll max-h-[300px] overflow-y-scroll overflow-x-hidden mt-5 pr-5'>
                                    <div className='flex items-center justify-between w-full pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] review'>
                                         <div className='info w-[60%] flex items-center gap-3'>
                                            <div className='img w-[80px] h-[80px] overflow-hidden rounded-full'>
                                                <img src="https://th.bing.com/th/id/OIP.hTxZrOQUYguQuDSHn0ctrwHaHZ?w=161&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" 
                                                alt="icon"
                                                className='w-full' />
                                            </div>

                                            <div className='w-[80%]'>
                                                <h4 className='text-[16px]'>Ayush Martand</h4>
                                                <h5 className='text-[13px] mb-0'>24-12-01</h5>
                                                <p className='mt-0 mb-0'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse quaerat repellat voluptatum. Facere, ea nihil.</p>
                                            </div>
                                         </div>
                                         
                                         <Rating name="size-small" defaultValue={4} readOnly/>
                                    </div>

                                    <div className='flex items-center justify-between w-full pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] review'>
                                         <div className='info w-[60%] flex items-center gap-3'>
                                            <div className='img w-[80px] h-[80px] overflow-hidden rounded-full'>
                                                <img src="https://th.bing.com/th/id/OIP.hTxZrOQUYguQuDSHn0ctrwHaHZ?w=161&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" 
                                                alt="icon"
                                                className='w-full' />
                                            </div>

                                            <div className='w-[80%]'>
                                                <h4 className='text-[16px]'>Ayush Martand</h4>
                                                <h5 className='text-[13px] mb-0'>24-12-01</h5>
                                                <p className='mt-0 mb-0'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse quaerat repellat voluptatum. Facere, ea nihil.</p>
                                            </div>
                                         </div>
                                         
                                         <Rating name="size-small" defaultValue={4} readOnly/>
                                    </div>

                                    <div className='flex items-center justify-between w-full pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] review'>
                                         <div className='info w-[60%] flex items-center gap-3'>
                                            <div className='img w-[80px] h-[80px] overflow-hidden rounded-full'>
                                                <img src="https://th.bing.com/th/id/OIP.hTxZrOQUYguQuDSHn0ctrwHaHZ?w=161&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" 
                                                alt="icon"
                                                className='w-full' />
                                            </div>

                                            <div className='w-[80%]'>
                                                <h4 className='text-[16px]'>Ayush Martand</h4>
                                                <h5 className='text-[13px] mb-0'>24-12-01</h5>
                                                <p className='mt-0 mb-0'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse quaerat repellat voluptatum. Facere, ea nihil.</p>
                                            </div>
                                         </div>
                                         
                                         <Rating name="size-small" defaultValue={4} readOnly/>
                                    </div>

                                    <div className='flex items-center justify-between w-full pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] review'>
                                         <div className='info w-[60%] flex items-center gap-3'>
                                            <div className='img w-[80px] h-[80px] overflow-hidden rounded-full'>
                                                <img src="https://th.bing.com/th/id/OIP.hTxZrOQUYguQuDSHn0ctrwHaHZ?w=161&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" 
                                                alt="icon"
                                                className='w-full' />
                                            </div>

                                            <div className='w-[80%]'>
                                                <h4 className='text-[16px]'>Ayush Martand</h4>
                                                <h5 className='text-[13px] mb-0'>24-12-01</h5>
                                                <p className='mt-0 mb-0'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse quaerat repellat voluptatum. Facere, ea nihil.</p>
                                            </div>
                                         </div>
                                         
                                         <Rating name="size-small" defaultValue={4} readOnly/>
                                    </div>

                                    <div className='flex items-center justify-between w-full pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] review'>
                                         <div className='info w-[60%] flex items-center gap-3'>
                                            <div className='img w-[80px] h-[80px] overflow-hidden rounded-full'>
                                                <img src="https://th.bing.com/th/id/OIP.hTxZrOQUYguQuDSHn0ctrwHaHZ?w=161&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" 
                                                alt="icon"
                                                className='w-full' />
                                            </div>

                                            <div className='w-[80%]'>
                                                <h4 className='text-[16px]'>Ayush Martand</h4>
                                                <h5 className='text-[13px] mb-0'>24-12-01</h5>
                                                <p className='mt-0 mb-0'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse quaerat repellat voluptatum. Facere, ea nihil.</p>
                                            </div>
                                         </div>
                                         
                                         <Rating name="size-small" defaultValue={4} readOnly/>
                                    </div>
                                </div>

                                <br />

                                <div className='reviewForm bg-[#f1f1f1] p-4 rounded-md'>
                                    <h2 className='text-[18px]'>
                                        Add a Review
                                    </h2>
                                    <form className='w-full mt-5'>
                                       <TextField
                                            id="outlined-multiline-static"
                                            label="write a review..."
                                            multiline
                                            rows={5}
                                            className='w-full'
                                        />

                                        <br /><br />

                                        <Rating name="size-small" defaultValue={4} size='large'/>

                                        <div className='flex items-center mt-5'>
                                            <Button className='btn-org'>Submit Review</Button>
                                        </div>
                                    </form>
                                </div>
                                
                            </div>
                        </div>
                    )
                }
            </div>

            <div className='container pt-8'>
                <h2 className='text-[20px] font-[600]'>Related Products</h2>
                <ProductSlider items={6}/>
            </div>
        </section>

        
    </>
  )
}

export default ProductDetails