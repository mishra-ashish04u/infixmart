import React, { useContext } from 'react'
import { LiaShippingFastSolid } from "react-icons/lia";
import { PiKeyReturn } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { LiaGiftSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { Link } from 'react-router-dom';
import { PiChatsBold } from "react-icons/pi";
import Button from '@mui/material/Button';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

import Drawer from '@mui/material/Drawer';
import { MyContext } from '../../App';
import { IoClose } from 'react-icons/io5';
import CartPanel from '../CartPanel';


const Footer = () => {

    const context = useContext(MyContext);
  return (
    <>
        <footer className='py-6 bg-[#fafafa]'>
        <div className='container'>
            <div className='flex items-center justify-center gap-5 py-8 pb-8'>
                <div className='flex flex-col items-center justify-center col group w-[16%]'>
                    <LiaShippingFastSolid className='text-[40px] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-primary'/>
                    <h3 className='text-[16px] font-[600] mt-3'>Free Shipping</h3>
                    <p className='text-[12px] font-[500]'>For all Orders above 999</p>
                </div>

                <div className='flex flex-col items-center justify-center col group w-[16%]'>
                    <PiKeyReturn className='text-[40px] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-primary'/>
                    <h3 className='text-[16px] font-[600] mt-3'>30 Days Returns</h3>
                    <p className='text-[12px] font-[500]'>For an Exchange Product</p>
                </div>

                <div className='flex flex-col items-center justify-center col group w-[16%]'>
                    <BsWallet2 className='text-[40px] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-primary'/>
                    <h3 className='text-[16px] font-[600] mt-3'>Secured Payment</h3>
                    <p className='text-[12px] font-[500]'>Payment Cards Accepted</p>
                </div>

                <div className='flex flex-col items-center justify-center col group w-[16%]'>
                    <LiaGiftSolid className='text-[40px] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-primary'/>
                    <h3 className='text-[16px] font-[600] mt-3'>Special Gifts</h3>
                    <p className='text-[12px] font-[500]'>Our First Product Order</p>
                </div>

                <div className='flex flex-col items-center justify-center col group w-[16%]'>
                    <BiSupport className='text-[40px] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-primary'/>
                    <h3 className='text-[16px] font-[600] mt-3'>Support 24/7</h3>
                    <p className='text-[12px] font-[500]'>Contact us Anytime</p>
                </div>
            </div>

            <br />

            <hr/>

            <div className='flex py-12 footer'>
                <div className='part1 w-[25%] border-r border-[rgba(0,0,0,0.1)]'>
                    <h2 className='text-[20px] font-[600] mb-4'>Contact Us</h2>
                    <p className='text-[13px] font-[400] pb-4'>Classyshop - Mega Super Store <br />
                    507-Union Trade Centre France</p>

                    <Link to='mailto:someone@example.com' className='link text-[13px]'>
                        sales@yourcompany.com
                    </Link>

                    <span className='text-[22px] font-[600] block w-full mt-3 mb-5 text-primary'>
                        (+91) 9876-543-210
                    </span>

                    <div className='flex items-center gap-2'>
                        <PiChatsBold className='text-[40px] text-primary'/>
                        <span className='text-[16px] font-[600] pl-2'>Online Chat <br />
                        Get Expert Help</span>
                    </div>
                </div>

                <div className='part2 w-[40%] flex pl-8'>
                    <div className='part2_col1 w-[50%]'>
                        <h2 className='text-[20px] font-[600] mb-4'>Products</h2>
                        
                        <ul className='list'>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Prices drop
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    New products
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Best sales
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Contact us
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Sitemap
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Stores
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className='part2_col2 w-[50%]'>
                        <h2 className='text-[20px] font-[600] mb-4'>Our company</h2>
                        
                        <ul className='list'>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Delivery
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Legal Notice
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Terms and conditions of use
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    About us
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Secure payment
                                </Link>
                            </li>
                            <li className='list-none text-[14px] w-full mb-3'>
                                <Link to='/' className='link'>
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='part3 w-[35%] flex flex-col pl-8'>
                    <h2 className='text-[20px] font-[600] mb-4'>Subscribe to newsletter</h2>
                    <p className='text-[13px]'>Subscribe to our latest newsletter to get news about special discounts.</p>

                    <form className='mt-5'>
                        <input type="text" className='focus:border-[rgba(0,0,0,0.3)] w-full mb-4 h-[45px] border outline-none px-4 rounded-sm' 
                         placeholder='Your Email Address'/>

                         <Button className='!mb-2 btn-org'>SUBSCRIBE</Button>

                         <FormControlLabel control={<Checkbox />} 
                         label="I agree to the terms and conditions and the privacy policy" />
                    </form>
                </div>
            </div>
        </div>
        </footer>

        <div className='border-[rbga(0,0,0,0.1)] border-t bottomStrip py-3 bg-white'>
            <div className='container flex items-center justify-between'>
                <ul className='flex items-center gap-2'>
                    <li className='list-none'>
                        <Link to='/' target='_blank'
                        className='group w-[35px] h-[35px] border rounded-full broder-[rgba(0,0,0,0.1)] flex items-center justify-center hover:bg-primary transition-all'>
                            <FaFacebookF  className='text-[15px] font-[500] group-hover:text-white'/>
                        </Link>
                    </li>
                    <li className='list-none'>
                        <Link to='/' target='_blank'
                        className='group w-[35px] h-[35px] border rounded-full broder-[rgba(0,0,0,0.1)] flex items-center justify-center hover:bg-primary transition-all'>
                            <AiOutlineYoutube  className='text-[20px] font-[500] group-hover:text-white'/>
                        </Link>
                    </li>
                    <li className='list-none'>
                        <Link to='/' target='_blank'
                        className='group w-[35px] h-[35px] border rounded-full broder-[rgba(0,0,0,0.1)] flex items-center justify-center hover:bg-primary transition-all'>
                            <FaPinterestP  className='text-[15px] font-[500] group-hover:text-white'/>
                        </Link>
                    </li>
                    <li className='list-none'>
                        <Link to='/' target='_blank'
                        className='group w-[35px] h-[35px] border rounded-full broder-[rgba(0,0,0,0.1)] flex items-center justify-center hover:bg-primary transition-all'>
                            <FaInstagram  className='text-[15px] font-[500] group-hover:text-white'/>
                        </Link>
                    </li>
                </ul>

                <p className='text-[13px] text-center mb-0'>
                    © 2024 - Ecommerce Template
                </p>

                <div className='flex items-center gap-1'>
                    <img src="https://ecommerce-frontend-view.netlify.app/carte_bleue.png" alt="image" />
                    <img src="https://ecommerce-frontend-view.netlify.app/visa.png" alt="image" />
                    <img src="https://ecommerce-frontend-view.netlify.app/master_card.png" alt="image" />
                    <img src="https://ecommerce-frontend-view.netlify.app/american_express.png" alt="image" />
                    <img src="https://ecommerce-frontend-view.netlify.app/paypal.png" alt="image" />
                </div>
            </div>
        </div>


      {/* cart panel */}
        <Drawer open={context.openCartPanel} 
        onClose={context.toggleCartPanel(false)} 
        anchor={"right"}
        className='cartPanel'
        >
            <div className='flex items-center justify-between gap-3 px-4 py-3 border-b border-[rgba(0,0,0,0.2)] overflow-hidden'>
            <h4>Shopping Cart (1)</h4>
            <IoClose className='text-[20px] cursor-pointer' onClick={context.toggleCartPanel(false)}/>
            </div>

            <CartPanel/>

        </Drawer>
    </>
  )
}

export default Footer