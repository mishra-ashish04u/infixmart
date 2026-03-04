import React from 'react'
import { IoMdTime } from "react-icons/io";
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";



const BlogItem = () => {
  return (
    <div className='blogItem group'>
        <div className='relative w-full overflow-hidden rounded-md imgWrapper'>
            <img src="https://serviceapi.spicezgold.com/download/1741759053899_5-2.jpg"
             alt="blog1" 
             className='w-full transition-all cursor-pointer group-hover:scale-105 group-hover:rotate-1' />

            <span className='absolute font-[500] gap-1 rounde-md p-1 text-[11px] bottom-[15px] right-[15px] z-50 flex items-center justify-center text-white bg-primary '>
                <IoMdTime className='text-[16px]'/> 4 OCTOBER 2002
            </span>
        </div>
        
        <div className='py-4 info'>
            <h2 className='text-[16px] font-[600] text-black'>
                <Link to='/'
                 className='link'>
                    sustainable living through cutting-edge prefabricated homes
                </Link>
            </h2>
            <p className='text-[13px] font-[400] text-[rgba(0,0,0,0.8)] mb-4'>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vero, quibusdam ad sint dolores iure facere adipisci reprehenderit velit. Numquam, quis!....
            </p>
            <Link to='/'
             className='flex items-center gap-1 font-[500] text-[14px] link hover:underline' >
                Read More <IoIosArrowForward/>
            </Link>
        </div>
    </div>
  )
}

export default BlogItem