import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Navigation } from 'swiper/modules';

const HomeSlider = () => {
  return (
    <div className='homeSlider'>
      <div className='container'>
      <Swiper
       spaceBetween={10}
       loop={true}
       navigation={true}
       autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
       modules={[Navigation, Autoplay]} 
       className="py-4 sliderHome"
      >
        <SwiperSlide>
          <div className='overflow-hidden rounded-[20px] item'>
            <img src='https://serviceapi.spicezgold.com/download/1745504025727_NewProject(1).jpg'
            alt='banner Slide1' className='w-full' />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className='overflow-hidden rounded-[20px] item'>
            <img src='https://serviceapi.spicezgold.com/download/1741660907985_NewProject.jpg'
            alt='banner Slide1' className='w-full' />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className='overflow-hidden rounded-[20px] item'>
            <img src='https://serviceapi.spicezgold.com/download/1741660881858_NewProject(11).jpg'
            alt='banner Slide1' className='w-full' />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className='overflow-hidden rounded-[20px] item'>
            <img src='https://serviceapi.spicezgold.com/download/1741660862304_NewProject(8).jpg'
            alt='banner Slide1' className='w-full' />
          </div>
        </SwiperSlide>
      </Swiper>
      </div>
    </div>
  )
}

export default HomeSlider