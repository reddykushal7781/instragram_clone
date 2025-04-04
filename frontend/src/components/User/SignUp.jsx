import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Auth from './Auth';
import { Link } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearErrors, registerUser } from '../../actions/userAction';
import BackdropLoader from '../Layouts/BackdropLoader';
import axiosInstance from '../../utils/axios';
import OTPVerificationModal from './OTPVerificationModal';
import CircularProgress from '@mui/material/CircularProgress';

const SignUp = () => {
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.user);

  const [user, setUser] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
  });

  const { email, name, username, password } = user;

  const [avatar, setAvatar] = useState();
  const [avatarPreview, setAvatarPreview] = useState();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const userCheck = /^[a-z0-9_.-]{6,25}$/igm;

    if (password.length < 8) {
      toast.error('Password length must be atleast 8 characters');
      return;
    }
    if (!avatar) {
      toast.error('Select Profile Pic');
      return;
    }
    if (!userCheck.test(username)) {
      toast.error('Invalid Username');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set('email', email);
    formData.set('name', name);
    formData.set('username', username);
    formData.set('password', password);
    formData.set('avatar', avatar);

    try {
      const { data } = await axiosInstance.post('/api/v1/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Registration successful! Please verify your email.');
      setUserId(data.userId);
      setShowOTPModal(true);
    } catch (error) {
      toast.error(
        error.response && error.response.data
          ? error.response.data.message
          : 'Registration failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDataChange = (e) => {
    if (e.target.name === 'avatar') {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
        }
      };

      reader.readAsDataURL(e.target.files[0]);
      setAvatar(e.target.files[0]);

    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  return (
    <>
      {loading && <BackdropLoader />}
      <Auth>
        <div className="bg-white border flex flex-col gap-2 p-4 pt-10">
          <img draggable="false" className="mx-auto h-30 w-36 object-contain" src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="" />
          <form
            onSubmit={handleRegister}
            encType="multipart/form-data"
            className="flex flex-col justify-center items-center gap-3 m-3 md:m-8"
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleDataChange}
              required
              size="small"
              inputProps={{ maxLength: 40 }}
              disabled={isSubmitting}
            />
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={name}
              onChange={handleDataChange}
              required
              size="small"
              inputProps={{ maxLength: 40 }}
              disabled={isSubmitting}
            />
            <TextField
              label="Username"
              type="text"
              name="username"
              value={username}
              onChange={handleDataChange}
              size="small"
              required
              fullWidth
              inputProps={{ maxLength: 20 }}
              disabled={isSubmitting}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={handleDataChange}
              required
              size="small"
              fullWidth
              inputProps={{ maxLength: 25 }}
              disabled={isSubmitting}
            />
            <div className="flex w-full justify-between gap-3 items-center">
              <Avatar
                alt="Avatar Preview"
                src={avatarPreview}
                sx={{ width: 48, height: 48 }}
              />
              <label>
                <input
                  type="file"
                  accept="image/*"
                  name="avatar"
                  onChange={handleDataChange}
                  className="block w-full text-sm text-gray-400
                                    file:mr-3 file:py-2 file:px-6
                                    file:rounded-full file:border-0
                                    file:text-sm file:cursor-pointer file:font-semibold
                                    file:bg-blue-100 file:text-blue-700
                                    hover:file:bg-blue-200
                                    "
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <button 
              type="submit" 
              className={`font-medium py-2 rounded text-white w-full flex items-center justify-center ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" className="mr-2" />
                  Signing up...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white border p-5 text-center">
          <span>Already have an account? <Link to="/login" className="text-blue-600">Log in</Link></span>
        </div>
      </Auth>

      <OTPVerificationModal 
        open={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        userId={userId}
      />
    </>
  );
};

export default SignUp;