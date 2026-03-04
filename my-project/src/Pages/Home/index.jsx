import React from 'react'
import HomeSlider from '../../components/HomeSlider'
import HomeCatSlider from '../../components/HomeCatSlider'
import { LiaShippingFastSolid } from "react-icons/lia";
import { AdsBannerSlider, AdsBannerSlider2 } from '../../components/AdsBannerSlider';
import { useState } from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ProductSlider from '../../components/ProductSlider';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';
import BlogItem from '../../components/BLogItem';
import HomeSliderV2 from '../../components/homeSliderV2';
import BannerBoxV2 from '../../components/bannerBoxV2';


const Home = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  
  return (
    <>
      {/* <HomeSlider /> */}
      <section className='py-6'>
        <div className='container flex gap-5'>
          <div className='part1 w-[70%]'>
          <HomeSliderV2/>
          </div>
          <div className='part2 flex flex-col gap-5 items-center justify-between w-[30%]'>
            <BannerBoxV2 info='left' image={'https://serviceapi.spicezgold.com/download/1741664496923_1737020250515_New_Project_47.jpg'}/>
            <BannerBoxV2 info='right' image={'https://serviceapi.spicezgold.com/download/1741664665391_1741497254110_New_Project_50.jpg'}/>
          </div>
        </div>
      </section>
      <HomeCatSlider />

      <section className='py-8 bg-white'>
        <div className='container'>
          <div className='flex items-center justify-between'>
            <div className='leftSec'>
              <h2 className='text-[20px] font-[600]'>Popular Products</h2>
              <p className='text-[14px] font-[400]'>Do not miss the current offers untill the end of March</p>
            </div>

            <div className='rightSec w-[50%]'>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                <Tab label="Item One" />
                <Tab label="Item Two" />
                <Tab label="Item Three" />
                <Tab label="Item Four" />
                <Tab label="Item Five" />
                <Tab label="Item Six" />
                <Tab label="Item Seven" />
              </Tabs>
            </div>
          </div>

          <ProductSlider items={6}/>
        </div>
      </section>

      <section className='py-8 bg-white'>
        <div className='container'>
          <div className='w-[80%] m-auto p-4 mb-7 rounded-md border-2 border-[#ff5252] freeShipping flex justify-between items-center'>
            <div className='flex items-center gap-4 rounded-md col1'>
              <LiaShippingFastSolid className='text-[50px]'/>
              <span className='text-[20px] font-[600] uppercase'>Free Shipping</span>
            </div>

            <div className='col2 '>
              <p className='mb-0 font-[500]'>Free Delivery Now On Your First Order and above 499</p>
            </div>

            <p className='mb-0 font-bold text-[25px]'>Only 499</p>

          </div>
          
          <AdsBannerSlider items={3}/>
        </div>
      </section>

      <section className='py-8 bg-white'>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[600]'>Latest Products</h2>
          <ProductSlider items={6}/>

          <AdsBannerSlider2 items={1}/>
        </div>
      </section>

      <section className='py-8 bg-white'>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[600]'>Featured Products</h2>
          <ProductSlider items={6}/>
        </div>
      </section>

      <section className='py-5 pt-0 pb-8 bg-white blogSection '>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[600] mb-4'>From the Blog</h2>
          <Swiper
              slidesPerView={3}
              spaceBetween={20}
              modules={[Navigation]}
              navigation={true}
              className="blogSlider"
            >
              <SwiperSlide>
                <BlogItem/>
              </SwiperSlide>

              <SwiperSlide>
                <BlogItem/>
              </SwiperSlide>

              <SwiperSlide>
                <BlogItem/>
              </SwiperSlide>

              <SwiperSlide>
                <BlogItem/>
              </SwiperSlide>

              <SwiperSlide>
                <BlogItem/>
              </SwiperSlide>
            </Swiper>
        </div>
      </section>
    
    </>
  )
}

export default Home