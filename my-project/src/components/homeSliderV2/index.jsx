import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// import required modules
import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Button } from '@mui/material';

const HomeSliderV2 = () => {
  return (
    <>
        <Swiper
        spaceBetween={30}
        effect={'fade'}
        loop={true}
        navigation={true}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        className="homeSliderV2"
      >
        <SwiperSlide>
            <div className='relative w-full overflow-hidden rounded-md item'>
                      <img src="https://serviceapi.spicezgold.com/download/1742441193376_1737037654953_New_Project_45.jpg" />

                <div className='absolute top-0 -right-[100%] opacity-0 duration-700 transition-all info w-[50%] h-full flex flex-col justify-center items-center p-8 z-50'>
                    <h4 className='text-[18px] font-[500] mb-4 w-full text-left relative -right-[100%] opacity-0'>Big Saving Day Sale</h4>
                    <h2 className='text-[35px] font-[600] w-full relative -right-[100%] opacity-0'>Women Solid Round Green T-Shirt</h2>

                    <h3 className='flex items-center text-[18px] font-[500] mb-4 mt-3 w-full text-left gap-3 relative -right-[100%] opacity-0'>
                        Starting At Only <span className='text-primary text-[35px] font-[700]'>499</span>
                    </h3>

                    <div className='w-full relative -bottom-[100%] opacity-0 btn_'>
                        <Button className='btn-org'>
                            SHOP NOW
                        </Button>
                    </div>
                    
                    
                </div>
            </div>
        </SwiperSlide>
        <SwiperSlide>
            <div className='relative w-full overflow-hidden rounded-md item'>
                <img src="https://serviceapi.spicezgold.com/download/1742441193376_1737037654953_New_Project_45.jpg" />

                <div className='absolute top-0 -right-[100%] opacity-0 duration-700 transition-all info w-[50%] h-full flex flex-col justify-center items-center p-8 z-50'>
                    <h4 className='text-[18px] font-[500] mb-4 w-full text-left relative -right-[100%] opacity-0'>Big Saving Day Sale</h4>
                    <h2 className='text-[35px] font-[600] w-full relative -right-[100%] opacity-0'>Women Solid Round Green T-Shirt</h2>

                    <h3 className='flex items-center text-[18px] font-[500] mb-4 mt-3 w-full text-left gap-3 relative -right-[100%] opacity-0'>
                        Starting At Only <span className='text-primary text-[35px] font-[700]'>499</span>
                    </h3>

                    <div className='w-full relative -bottom-[100%] opacity-0 btn_'>
                        <Button className='btn-org'>
                            SHOP NOW
                        </Button>
                    </div>
                    
                    
                </div>
            </div>
        </SwiperSlide>
      </Swiper>
    </>
  )
}

export default HomeSliderV2