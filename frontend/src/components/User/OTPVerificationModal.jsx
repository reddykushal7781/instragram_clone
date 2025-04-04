import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import BackdropLoader from '../Layouts/BackdropLoader';
import axiosInstance from '../../utils/axios';

const OTPVerificationModal = ({ open, onClose, userId }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const navigate = useNavigate();

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
      
      onClose();
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
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
        }
      }}
    >
      {loading && <BackdropLoader />}
      <DialogTitle className="flex justify-between items-center">
        <span className="text-xl font-semibold">Email Verification</span>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 py-4">
          <div className="text-center">
            <p className="text-gray-600">
              We've sent a verification code to your email address.
              Please enter the code below to verify your account.
            </p>
          </div>
          
          <form
            onSubmit={handleVerifyOTP}
            className="flex flex-col justify-center items-center gap-4"
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
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal; 