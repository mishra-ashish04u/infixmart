import React from 'react'
import { Link } from 'react-router-dom'

const BannerBoxV2 = (props) => {
  return (
    <div className='relative w-full overflow-hidden rounded-md bannerBoxV2 group '>
        <img src={props.image}
         alt="" className='w-full transition-all duration-150 group-hover:scale-105' />
         
         <div className={`flex flex-col gap-2 items-center justify-center info absolute p-5 top-0 ${props.info ==='left' ? 'left-0' : 'right-0'} w-[70%] h-[100%] z-50
            ${props.info ==='left' ? '' : 'pl-12'}`}>
            <h2 className='text-[18px] font-[600]'>Samsung Gear VR Camera</h2>
            
            <span className='text-[20px] w-full font-[600] text-primary'>499</span>

            <div className='w-full'>
                <Link to='/' className='text-[16px] font-[600] link underline'>SHOP NOW</Link>
            </div>
         </div>
    </div>
  )
}

export default BannerBoxV2
