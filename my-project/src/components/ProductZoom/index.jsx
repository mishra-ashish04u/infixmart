import React, { useRef, useState } from 'react'
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';

const ProductZoom = () => {

    const [slideIndex,setSlideIndex] = useState(0)
    const zoomSliderBig = useRef()
    const zoomSliderSmall = useRef()
    
    const goto = (index) => {
        setSlideIndex(index)
        zoomSliderSmall.current.swiper.slideTo(index)
        zoomSliderBig.current.swiper.slideTo(index)
        
    }
    
  return (
    <>
        <div className='flex gap-3'>
            
            <div className='slider w-[15%]'>
                <Swiper
                    ref={zoomSliderSmall}
                    direction={'vertical'}
                    slidesPerView={4}
                    spaceBetween={10}
                    modules={[Navigation]}
                    navigation={true}
                    className="zoomProductSliderThumbs h-[500px] overflow-hidden"
                >
                    <SwiperSlide>
                        <div className={`overflow-hidden  cursor-pointer group item ${slideIndex === 0 ? "opacity-1" : "opacity-30"}`} 
                        onClick={() => goto(0)}>
                            <img src="https://serviceapi.spicezgold.com/download/1742447215241_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-0-202312201359.webp"
                             alt="img1"
                             className='w-full transition-all group-hover:scale-105' />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className={`overflow-hidden cursor-pointer group item ${slideIndex === 1 ? "opacity-1" : "opacity-30"}`} 
                        onClick={() => goto(1)}>
                            <img src="https://serviceapi.spicezgold.com/download/1742447215242_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-2-202312201359.webp"
                             alt="img1"
                             className='w-full transition-all group-hover:scale-105' />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className={`overflow-hidden cursor-pointer group item ${slideIndex === 2 ? "opacity-1" : "opacity-30"}`} 
                        onClick={() => goto(2)}>
                            <img src="https://serviceapi.spicezgold.com/download/1742447215242_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-1-202312201359.webp"
                             alt="img1"
                             className='w-full transition-all group-hover:scale-105' />
                        </div>
                    </SwiperSlide>
                    
                    <SwiperSlide></SwiperSlide>
                    
                </Swiper>
            </div>
            
            <div className='zoomContainer rounded-md w-[85%] h-[500px] overflow-hidden'>
                <Swiper
                    ref={zoomSliderBig}
                    slidesPerView={1}
                    spaceBetween={0}
                    navigation={false}
                >
                    <SwiperSlide>
                        <InnerImageZoom 
                            src={"https://serviceapi.spicezgold.com/download/1742447215241_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-0-202312201359.webp"}
                            zoomType='hover'
                            zoomScale={1} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <InnerImageZoom 
                            src={"https://serviceapi.spicezgold.com/download/1742447215242_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-2-202312201359.webp"}
                            zoomType='hover'
                            zoomScale={1} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <InnerImageZoom 
                            src={"https://serviceapi.spicezgold.com/download/1742447215242_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-1-202312201359.webp"}
                            zoomType='hover'
                            zoomScale={1} />
                    </SwiperSlide>
                </Swiper>
                
            </div>
        </div>
    </>
  )
}

export default ProductZoom