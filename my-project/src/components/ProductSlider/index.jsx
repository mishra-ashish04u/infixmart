import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
// import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';
import ProductItem from '../ProductItem';

const ProductSlider = (props) => {
  return (
    <div className='py-3 productSlider'>
        <Swiper
            slidesPerView={props.items}
            spaceBetween={10}
            modules={[Navigation]}
            navigation={true}
            className="mySwiper"
        >
            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>

            <SwiperSlide>
                <ProductItem />
            </SwiperSlide>
        </Swiper>
    </div>
  )
}

export default ProductSlider