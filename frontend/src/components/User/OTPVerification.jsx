import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Auth from './Auth';
import BackdropLoader from '../Layouts/BackdropLoader';
import axiosInstance from '../../utils/axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate('/signup');
      toast.error('Please sign up first');
    }
  }, [userId, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && resendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown, resendDisabled]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/v1/verify-email', {
        userId,
        otp
      });

      toast.success('Email verified successfully!');
      
      // Store user data and token
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      navigate('/');
    } catch (error) {
      toast.error(
        error.response && error.response.data
          ? error.response.data.message
          : 'Verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/v1/resend-verification', { userId });
      toast.success('OTP sent successfully!');
      setResendDisabled(true);
      setCountdown(60);
    } catch (error) {
      toast.error(
        error.response && error.response.data
          ? error.response.data.message
          : 'Failed to resend OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <BackdropLoader />}
      <Auth>
        <div className="bg-white border flex flex-col gap-2 p-4 pt-10">
          <img
            draggable="false"
            className="mx-auto h-30 w-36 object-contain"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
            alt="Instagram"
          />
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Email Verification</h2>
            <p className="text-gray-600 mt-2">
              We've sent a verification code to your email address.
              Please enter the code below to verify your account.
            </p>
          </div>
          
          <form
            onSubmit={handleVerifyOTP}
            className="flex flex-col justify-center items-center gap-3 m-3 md:m-8"
          >
            <TextField
              fullWidth
              label="Enter OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              size="small"
              inputProps={{ 
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric'
              }}
            />
            
            <button 
              type="submit" 
              className="bg-blue-600 font-medium py-2 rounded text-white w-full"
              disabled={loading}
            >
              Verify Email
            </button>
          </form>
          
          <div className="text-center mt-2">
            <p className="text-gray-600">
              Didn't receive the code?
              {resendDisabled ? (
                <span className="text-gray-500 ml-2">
                  Resend available in {countdown}s
                </span>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-blue-600 ml-2 hover:underline"
                  disabled={loading || resendDisabled}
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </div>
      </Auth>
    </>
  );
};

export default OTPVerification; 