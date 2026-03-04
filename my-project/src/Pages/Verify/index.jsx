import React, { useContext } from 'react'
import { useState } from 'react';
import OtpBox from '../../components/OtpBox';
import { Button } from '@mui/material';
import { postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';

const Verify = () => {
    const [otp, setOtp] = useState("");
    const handleOtpChange = (value) => {
        setOtp(value);
    }

    const context = useContext(MyContext);
    const history = useNavigate();

    const verifyOTP = (e) => {
        e.preventDefault();

        const actionType = localStorage.getItem('actionType');

        if ( actionType !== 'forgot-password'){
          postData("/api/user/verifyemail",{
            email:localStorage.getItem("userEmail"),
            otp:otp
          }).then((res)=>{
            if(res?.error === false){
              context.openAlertBox("success", res?.message);
              localStorage.removeItem("userEmail")
              history("/login")
            } else {
              context.openAlertBox("error", res?.message);
            }
          })
        } else {
          postData("/api/user/verify-forgot-password-otp",{
            email:localStorage.getItem("userEmail"),
            otp:otp
          }).then((res)=>{
            if(res?.error === false){
              context.openAlertBox("success", res?.message);
              history("/forgot-password")
            } else {
              context.openAlertBox("error", res?.message);
            }
          })
        }
    }
    
  return (
    <section className='py-10 section'>
      <div className='container'>
        <div className='shadow-md w-[400px] m-auto rounded-md bg-white p-5 px-10 card'>
            <div className='flex items-center justify-center text-center'>
                <img src="/images/verify2.png" 
                alt="verify icon" 
                width='80'/>
            </div>
          <h3 className='text-center text-[18px] text-black mt-4 mb-1'>
            Verify OTP
        </h3>

        <p className='mt-0 mb-4 text-center'>
            OTP sent to <span className='font-bold text-primary'>{localStorage.getItem("userEmail")}</span>
        </p>

        <form onSubmit={verifyOTP} action="">
            <OtpBox length={6} onChange={handleOtpChange}/>

            <div className='flex items-center justify-center px-3 mt-5'>
                <Button type='submit' className='w-full btn-org btn-lg'>Verify Otp</Button>
            </div>
        </form>

        </div>
      </div>
    </section>
  )
}

export default Verify