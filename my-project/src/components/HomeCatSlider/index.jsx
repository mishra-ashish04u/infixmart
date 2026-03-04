import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';


const HomeCatSlider = () => {
  return (
    <div className='py-8 pt-4 homeCatSlider'>
      <div className='container'>
        <Swiper
          slidesPerView={6}
          spaceBetween={10}
          modules={[Navigation]}
          navigation={true}
          className="mySwiper"
        >
          <SwiperSlide>
            <Link to='/'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link to='#'>
              <div className='flex flex-col items-center justify-center px-3 py-8 m-3 text-center bg-white rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1744509970781_fash.png"
                alt="cat1" 
                className='w-[60px] transition-all'/>
                <h3 className='text-[16px] font-[500] mt-3'>Fashion</h3>
              </div>
            </Link>
          </SwiperSlide>
          
        </Swiper>
      </div>
    </div>
  )
}

export default HomeCatSlider