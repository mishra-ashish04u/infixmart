import React from 'react'
import { Link } from 'react-router-dom'

const BannerBox = (props) => {
  return (
    <div className='overflow-hidden rounded-lg box bannerBox group'>
        <Link to='/'>
            <img src={props.img}
            alt="Banner1"
            className='w-full transition-all group-hover:scale-110' />
        </Link>
    </div>
  )
}

export default BannerBox