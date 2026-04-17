"use client";

import React, { useState } from 'react';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { imgUrl } from '../../utils/imageUrl';

const Placeholder = () => (
  <div className='w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-300 gap-2'>
    <span className='text-[40px]'>📦</span>
    <span className='text-[12px]'>No image</span>
  </div>
);

const ProductZoom = ({ images = [] }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [swiperSmall, setSwiperSmall] = useState(null);
  const [swiperBig, setSwiperBig] = useState(null);
  const [failed, setFailed] = useState({});

  const markFailed = (i) => setFailed((prev) => ({ ...prev, [i]: true }));

  const goto = (index) => {
    setSlideIndex(index);
    swiperSmall?.slideTo(index);
    swiperBig?.slideTo(index);
  };

  const displayImages = images.length > 0 ? images : [null];

  return (
    <div className='flex gap-3'>
      {/* Thumbnail strip */}
      <div className='slider w-[15%]'>
        <Swiper
          onSwiper={setSwiperSmall}
          direction='vertical'
          slidesPerView={4}
          spaceBetween={10}
          modules={[Navigation]}
          navigation
          className="zoomProductSliderThumbs h-[500px] overflow-hidden"
        >
          {displayImages.map((img, i) => (
            <SwiperSlide key={i}>
              <div
                className={`overflow-hidden cursor-pointer group item border-2 rounded transition-all ${slideIndex === i ? 'border-[#1565C0]' : 'border-transparent opacity-40'}`}
                onClick={() => goto(i)}
              >
                {img && !failed[i] ? (
                  <img
                    src={imgUrl(img)}
                    alt={`Product view ${i + 1}`}
                    className='w-full h-full object-cover transition-all group-hover:scale-105'
                    onError={() => markFailed(i)}
                  />
                ) : (
                  <div className='w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-[18px]'>📦</div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main zoom */}
      <div className='zoomContainer rounded-md w-[85%] h-[500px] overflow-hidden'>
        <Swiper onSwiper={setSwiperBig} slidesPerView={1} spaceBetween={0} navigation={false}>
          {displayImages.map((img, i) => (
            <SwiperSlide key={i}>
              {img && !failed[i] ? (
                <>
                  {/* Hidden probe image to detect load failure for InnerImageZoom */}
                  <img
                    src={imgUrl(img)}
                    alt=''
                    className='hidden'
                    onError={() => markFailed(i)}
                  />
                  <InnerImageZoom src={imgUrl(img)} zoomType='hover' zoomScale={1.5} />
                </>
              ) : (
                <div className='w-full h-[500px]'><Placeholder /></div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductZoom;
